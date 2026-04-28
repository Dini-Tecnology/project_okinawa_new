import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { DataSource } from 'typeorm';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import AppDataSource from '../config/database.config';

interface MigrationFile {
  file: string;
  timestamp: number | null;
  active: boolean;
}

interface ColumnInventory {
  propertyName: string;
  databaseName: string;
  type: string;
  isPrimary: boolean;
  isNullable: boolean;
  isGenerated: boolean;
  default?: string;
  enumValues?: unknown[];
}

interface RelationInventory {
  propertyName: string;
  type: string;
  targetTable?: string;
  joinColumns: string[];
}

interface EntityInventory {
  entity: string;
  tableName: string;
  schema: string;
  columns: ColumnInventory[];
  relations: RelationInventory[];
  indexes: string[];
  uniques: string[];
}

const ACTIVE_MIGRATIONS_DIR = join(__dirname, '../database/migrations');
const LEGACY_MIGRATIONS_DIR = join(__dirname, '../migrations');
const OUTPUT_DIR = process.env.SUPABASE_MIGRATION_OUT || join(__dirname, '../../tmp/supabase-migration');
const SUPABASE_RESERVED_SCHEMAS = [
  'auth',
  'extensions',
  'graphql',
  'graphql_public',
  'pg_catalog',
  'pgsodium',
  'realtime',
  'storage',
  'supabase_functions',
  'vault',
];

function migrationTimestamp(file: string): number | null {
  const match = file.match(/^(\d+)-/);
  return match ? Number(match[1]) : null;
}

function readMigrationFiles(directory: string, active: boolean): MigrationFile[] {
  return readdirSync(directory)
    .filter((file) => file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.sql'))
    .sort()
    .map((file) => ({
      file,
      timestamp: migrationTimestamp(file),
      active,
    }));
}

function readFilesRecursively(directory: string, extension: string): string[] {
  const entries = readdirSync(directory).map((entry) => join(directory, entry));
  const result: string[] = [];

  for (const entry of entries) {
    const stats = statSync(entry);
    if (stats.isDirectory()) {
      result.push(...readFilesRecursively(entry, extension));
      continue;
    }
    if (entry.endsWith(extension)) {
      result.push(entry);
    }
  }

  return result.sort();
}

function parseEntityFile(filePath: string): EntityInventory | null {
  const content = readFileSync(filePath, 'utf8');
  const entityMatch = content.match(/@Entity\(\s*['"`]([^'"`]+)['"`]/);
  const classMatch = content.match(/export class\s+([A-Za-z0-9_]+)/);

  if (!entityMatch || !classMatch) {
    return null;
  }

  const columns: ColumnInventory[] = [];
  const lines = content.split('\n');
  let pendingDecorator = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('@Column') ||
      trimmed.startsWith('@PrimaryColumn') ||
      trimmed.startsWith('@PrimaryGeneratedColumn') ||
      trimmed.startsWith('@CreateDateColumn') ||
      trimmed.startsWith('@UpdateDateColumn') ||
      trimmed.startsWith('@DeleteDateColumn')
    ) {
      pendingDecorator = trimmed;
      continue;
    }

    if (!pendingDecorator) {
      continue;
    }

    const propertyMatch = trimmed.match(/^([A-Za-z0-9_]+)\??:\s*([^;]+);/);
    if (!propertyMatch) {
      continue;
    }

    const [, propertyName, propertyType] = propertyMatch;
    const isPrimary = pendingDecorator.startsWith('@Primary');
    const isGenerated = pendingDecorator.startsWith('@PrimaryGeneratedColumn');
    const isNullable = pendingDecorator.includes('nullable: true') || propertyType.includes('null');
    const type = propertyType.replace(/\s+/g, ' ').trim();

    columns.push({
      propertyName,
      databaseName: propertyName,
      type,
      isPrimary,
      isNullable,
      isGenerated,
    });

    pendingDecorator = '';
  }

  return {
    entity: classMatch[1],
    tableName: entityMatch[1],
    schema: 'public',
    columns,
    relations: [],
    indexes: [],
    uniques: [],
  };
}

function buildFallbackEntityInventory(baseDir: string): EntityInventory[] {
  const entityFiles = readFilesRecursively(baseDir, '.entity.ts');
  return entityFiles.map(parseEntityFile).filter((entity): entity is EntityInventory => Boolean(entity));
}

function tableKey(metadata: EntityMetadata): string {
  return metadata.schema ? `${metadata.schema}.${metadata.tableName}` : `public.${metadata.tableName}`;
}

function serializeEntity(metadata: EntityMetadata): EntityInventory {
  return {
    entity: metadata.name,
    tableName: metadata.tableName,
    schema: metadata.schema || 'public',
    columns: metadata.columns.map((column) => ({
      propertyName: column.propertyName,
      databaseName: column.databaseName,
      type: String(column.type),
      isPrimary: column.isPrimary,
      isNullable: column.isNullable,
      isGenerated: column.isGenerated,
      default: column.default === undefined ? undefined : String(column.default),
      enumValues: column.enum,
    })),
    relations: metadata.relations.map((relation) => ({
      propertyName: relation.propertyName,
      type: relation.relationType,
      targetTable: relation.inverseEntityMetadata?.tableName,
      joinColumns: relation.joinColumns.map((joinColumn) => joinColumn.databaseName),
    })),
    indexes: metadata.indices.map((index) => index.name).filter(Boolean),
    uniques: metadata.uniques.map((unique) => unique.name).filter(Boolean),
  };
}

function buildLoadOrder(entities: EntityMetadata[]): string[] {
  const remaining = new Map(entities.map((metadata) => [tableKey(metadata), metadata]));
  const ordered: string[] = [];

  while (remaining.size > 0) {
    const ready = [...remaining.entries()].filter(([, metadata]) => {
      const dependencies = metadata.foreignKeys
        .map((foreignKey) => {
          const referenced = foreignKey.referencedEntityMetadata;
          return referenced ? tableKey(referenced) : null;
        })
        .filter((dependency): dependency is string => Boolean(dependency));

      return dependencies.every((dependency) => dependency === tableKey(metadata) || !remaining.has(dependency));
    });

    if (ready.length === 0) {
      ordered.push(...[...remaining.keys()].sort());
      break;
    }

    for (const [key] of ready.sort(([left], [right]) => left.localeCompare(right))) {
      ordered.push(key);
      remaining.delete(key);
    }
  }

  return ordered;
}

function buildReconciliationSql(loadOrder: string[]): string {
  const selects = loadOrder.map((table) => {
    const [schema, tableName] = table.split('.');
    return `select '${schema}.${tableName}' as table_name, count(*)::bigint as row_count from "${schema}"."${tableName}"`;
  });

  return [
    '-- Run this on both the legacy database and Supabase after load, then diff the results.',
    '-- It intentionally checks row counts only; add domain-specific checksums after the first dry run.',
    selects.join('\nunion all\n'),
    'order by table_name;',
    '',
  ].join('\n');
}

function buildRlsMatrix(entities: EntityInventory[]): string {
  const lines = [
    '# Supabase RLS Policy Matrix',
    '',
    'Generated from TypeORM metadata. Treat this as a review worksheet, not as final policy SQL.',
    '',
    '| table | owner column | tenant column | initial policy posture |',
    '| --- | --- | --- | --- |',
  ];

  for (const entity of entities.sort((left, right) => left.tableName.localeCompare(right.tableName))) {
    const columnNames = new Set(entity.columns.map((column) => column.databaseName));
    const ownerColumn = columnNames.has('user_id')
      ? 'user_id'
      : columnNames.has('profile_id')
        ? 'profile_id'
        : columnNames.has('customer_id')
          ? 'customer_id'
          : '';
    const tenantColumn = columnNames.has('restaurant_id') ? 'restaurant_id' : '';
    const posture = tenantColumn
      ? 'authenticated users with active user_roles for restaurant_id'
      : ownerColumn
        ? 'authenticated owner access via auth.uid()'
        : 'deny direct client access until reviewed';

    lines.push(`| ${entity.schema}.${entity.tableName} | ${ownerColumn || '-'} | ${tenantColumn || '-'} | ${posture} |`);
  }

  lines.push('');
  lines.push('Notes:');
  lines.push('- Authorization claims must come from Supabase app_metadata or database lookups, never user_metadata.');
  lines.push('- Add indexes on columns used by policies before exposing tables through the Data API.');
  lines.push('- UPDATE policies also need a matching SELECT policy in Postgres RLS.');

  return `${lines.join('\n')}\n`;
}

async function readDatabaseTables(dataSource: DataSource) {
  return dataSource.query(
    `
      select table_schema, table_name
      from information_schema.tables
      where table_type = 'BASE TABLE'
        and table_schema <> all($1)
      order by table_schema, table_name
    `,
    [SUPABASE_RESERVED_SCHEMAS],
  );
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const migrations = [
    ...readMigrationFiles(ACTIVE_MIGRATIONS_DIR, true),
    ...readMigrationFiles(LEGACY_MIGRATIONS_DIR, false),
  ];

  let inventory: EntityInventory[] = [];
  let loadOrder: string[] = [];
  let databaseTables: Array<{ table_schema: string; table_name: string }> = [];
  let sourceMode: 'online' | 'offline' = 'online';

  try {
    await AppDataSource.initialize();
    const entities = AppDataSource.entityMetadatas.sort((left, right) => tableKey(left).localeCompare(tableKey(right)));
    inventory = entities.map(serializeEntity);
    loadOrder = buildLoadOrder(entities);
    databaseTables = await readDatabaseTables(AppDataSource);
  } catch (error) {
    sourceMode = 'offline';
    const fallbackEntities = buildFallbackEntityInventory(join(__dirname, '../modules'));
    inventory = fallbackEntities;
    loadOrder = fallbackEntities.map((entity) => `${entity.schema}.${entity.tableName}`).sort();
    databaseTables = [];
    console.warn('Database connection unavailable; generated inventory from entity files only.');
    if (process.env.DEBUG_SUPABASE_MIGRATION_INVENTORY === 'true') {
      console.warn(error);
    }
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }

  writeFileSync(
    join(OUTPUT_DIR, 'schema-inventory.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: basename(process.cwd()),
        mode: sourceMode,
        entities: inventory,
        databaseTables,
      },
      null,
      2,
    ),
  );

  writeFileSync(
    join(OUTPUT_DIR, 'migration-chain.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        activeMigrationsDir: ACTIVE_MIGRATIONS_DIR,
        legacyMigrationsDir: LEGACY_MIGRATIONS_DIR,
        migrations,
        warnings: [
          'Only src/database/migrations is referenced by TypeORM runtime and CLI config.',
          'src/migrations is treated as legacy input for review, not as an executable chain.',
        ],
      },
      null,
      2,
    ),
  );

  writeFileSync(join(OUTPUT_DIR, 'load-order.txt'), `${loadOrder.join('\n')}\n`);
  writeFileSync(join(OUTPUT_DIR, 'reconciliation-counts.sql'), buildReconciliationSql(loadOrder));
  writeFileSync(join(OUTPUT_DIR, 'rls-policy-matrix.md'), buildRlsMatrix(inventory));

  console.warn(`Supabase migration inventory written to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error('Failed to generate Supabase migration inventory');
  console.error(error);
  process.exit(1);
});
