import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePromoterTables1765200000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid-ossp extension is available
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create enum types
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE promoter_commission_type_enum AS ENUM ('percentage', 'fixed_per_entry', 'fixed_per_table', 'tiered');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE promoter_status_enum AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE promoter_sale_type_enum AS ENUM ('entry', 'vip_table', 'guest_list');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE promoter_commission_status_enum AS ENUM ('pending', 'approved', 'paid', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE promoter_payment_method_enum AS ENUM ('pix', 'bank_transfer', 'cash');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE promoter_payment_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create promoters table
    await queryRunner.createTable(
      new Table({
        name: 'promoters',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'varchar', isNullable: false },
          { name: 'restaurant_id', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'nickname', type: 'varchar', isNullable: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'email', type: 'varchar', isNullable: true },
          { name: 'photo_url', type: 'varchar', isNullable: true },
          {
            name: 'promoter_code',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'commission_type',
            type: 'promoter_commission_type_enum',
            default: "'percentage'",
          },
          {
            name: 'commission_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 10.0,
          },
          {
            name: 'fixed_commission_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          { name: 'tiered_rates', type: 'jsonb', isNullable: true },
          {
            name: 'status',
            type: 'promoter_status_enum',
            default: "'pending_approval'",
          },
          { name: 'total_entries_sold', type: 'int', default: 0 },
          { name: 'total_tables_sold', type: 'int', default: 0 },
          {
            name: 'total_revenue_generated',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'total_commission_earned',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'pending_commission',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          { name: 'pix_key', type: 'varchar', isNullable: true },
          { name: 'bank_account', type: 'jsonb', isNullable: true },
          { name: 'notes', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Create promoter_sales table
    await queryRunner.createTable(
      new Table({
        name: 'promoter_sales',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'promoter_id', type: 'uuid', isNullable: false },
          { name: 'restaurant_id', type: 'uuid', isNullable: false },
          { name: 'event_date', type: 'date', isNullable: false },
          {
            name: 'sale_type',
            type: 'promoter_sale_type_enum',
            default: "'entry'",
          },
          { name: 'reference_id', type: 'varchar', isNullable: false },
          { name: 'customer_name', type: 'varchar', isNullable: true },
          { name: 'customer_phone', type: 'varchar', isNullable: true },
          { name: 'quantity', type: 'int', default: 1 },
          {
            name: 'sale_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'commission_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'commission_status',
            type: 'promoter_commission_status_enum',
            default: "'pending'",
          },
          { name: 'paid_at', type: 'timestamp', isNullable: true },
          { name: 'payment_reference', type: 'varchar', isNullable: true },
          { name: 'notes', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Create promoter_payments table
    await queryRunner.createTable(
      new Table({
        name: 'promoter_payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'promoter_id', type: 'uuid', isNullable: false },
          { name: 'restaurant_id', type: 'uuid', isNullable: false },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'payment_method',
            type: 'promoter_payment_method_enum',
            default: "'pix'",
          },
          {
            name: 'status',
            type: 'promoter_payment_status_enum',
            default: "'pending'",
          },
          { name: 'period_start', type: 'date', isNullable: false },
          { name: 'period_end', type: 'date', isNullable: false },
          { name: 'sales_count', type: 'int', isNullable: false },
          { name: 'sale_ids', type: 'jsonb', isNullable: false },
          { name: 'payment_proof_url', type: 'varchar', isNullable: true },
          { name: 'transaction_id', type: 'varchar', isNullable: true },
          { name: 'processed_by', type: 'varchar', isNullable: true },
          { name: 'processed_at', type: 'timestamp', isNullable: true },
          { name: 'notes', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Indexes for promoters
    await queryRunner.createIndex(
      'promoters',
      new TableIndex({
        name: 'IDX_promoters_restaurant_id',
        columnNames: ['restaurant_id'],
      }),
    );
    await queryRunner.createIndex(
      'promoters',
      new TableIndex({
        name: 'IDX_promoters_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'promoters',
      new TableIndex({
        name: 'IDX_promoters_promoter_code',
        columnNames: ['promoter_code'],
      }),
    );

    // Indexes for promoter_sales
    await queryRunner.createIndex(
      'promoter_sales',
      new TableIndex({
        name: 'IDX_promoter_sales_promoter_id',
        columnNames: ['promoter_id'],
      }),
    );
    await queryRunner.createIndex(
      'promoter_sales',
      new TableIndex({
        name: 'IDX_promoter_sales_restaurant_id',
        columnNames: ['restaurant_id'],
      }),
    );
    await queryRunner.createIndex(
      'promoter_sales',
      new TableIndex({
        name: 'IDX_promoter_sales_event_date',
        columnNames: ['event_date'],
      }),
    );
    await queryRunner.createIndex(
      'promoter_sales',
      new TableIndex({
        name: 'IDX_promoter_sales_promoter_commission_status',
        columnNames: ['promoter_id', 'commission_status'],
      }),
    );

    // Indexes for promoter_payments
    await queryRunner.createIndex(
      'promoter_payments',
      new TableIndex({
        name: 'IDX_promoter_payments_promoter_id',
        columnNames: ['promoter_id'],
      }),
    );
    await queryRunner.createIndex(
      'promoter_payments',
      new TableIndex({
        name: 'IDX_promoter_payments_restaurant_id',
        columnNames: ['restaurant_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes (dropped automatically with tables, but explicit for clarity)
    await queryRunner.dropTable('promoter_payments', true);
    await queryRunner.dropTable('promoter_sales', true);
    await queryRunner.dropTable('promoters', true);

    // Drop enum types
    await queryRunner.query('DROP TYPE IF EXISTS promoter_payment_status_enum');
    await queryRunner.query('DROP TYPE IF EXISTS promoter_payment_method_enum');
    await queryRunner.query('DROP TYPE IF EXISTS promoter_commission_status_enum');
    await queryRunner.query('DROP TYPE IF EXISTS promoter_sale_type_enum');
    await queryRunner.query('DROP TYPE IF EXISTS promoter_status_enum');
    await queryRunner.query('DROP TYPE IF EXISTS promoter_commission_type_enum');
  }
}
