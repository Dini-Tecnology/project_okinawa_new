/**
 * Migration: Create Restaurant Configs Table
 *
 * Central configuration table for the Config Hub (EPIC 8).
 * Stores all restaurant settings as JSONB columns for maximum flexibility.
 * Each restaurant has exactly one config row (unique constraint on restaurant_id).
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateRestaurantConfigTable1742745600000 implements MigrationInterface {
  name = 'CreateRestaurantConfigTable1742745600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'restaurant_configs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'restaurant_id',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'profile',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'",
          },
          {
            name: 'service_types',
            type: 'jsonb',
            isNullable: true,
            default: `'{"primary":"casual_dining","supported":["casual_dining"]}'`,
          },
          {
            name: 'experience_flags',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'",
          },
          {
            name: 'floor_layout',
            type: 'jsonb',
            isNullable: true,
            default: `'{"sections":[],"tables":[]}'`,
          },
          {
            name: 'kitchen_stations',
            type: 'jsonb',
            isNullable: true,
            default: `'{"stations":[],"routing":{"kitchen":[],"bar":[]}}'`,
          },
          {
            name: 'payment_config',
            type: 'jsonb',
            isNullable: true,
            default: `'{"enabledMethods":["cash","credit_card","debit_card","pix"],"serviceFeePct":10,"tipOptions":[10,12,15],"splitModes":["equal","custom"]}'`,
          },
          {
            name: 'enabled_features',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'",
          },
          {
            name: 'team_config',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'",
          },
          {
            name: 'setup_complete',
            type: 'boolean',
            default: false,
          },
          {
            name: 'setup_completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Unique index on restaurant_id (enforced at DB level)
    await queryRunner.createIndex(
      'restaurant_configs',
      new TableIndex({
        name: 'idx_restaurant_configs_restaurant_id',
        columnNames: ['restaurant_id'],
        isUnique: true,
      }),
    );

    // Foreign key to restaurants table
    await queryRunner.createForeignKey(
      'restaurant_configs',
      new TableForeignKey({
        name: 'fk_restaurant_configs_restaurant_id',
        columnNames: ['restaurant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'restaurants',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('restaurant_configs', 'fk_restaurant_configs_restaurant_id');
    await queryRunner.dropIndex('restaurant_configs', 'idx_restaurant_configs_restaurant_id');
    await queryRunner.dropTable('restaurant_configs');
  }
}
