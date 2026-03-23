/**
 * Migration: Create Service Calls Table
 *
 * Supports the Service Calls feature (EPIC 12).
 * Stores customer-to-staff call requests with type, status, and timestamps.
 */

import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

export class CreateServiceCallsTable1710000004000 implements MigrationInterface {
  name = 'CreateServiceCallsTable1710000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure enum types exist
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "service_call_type_enum" AS ENUM ('waiter', 'manager', 'help', 'emergency');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "service_call_status_enum" AS ENUM ('pending', 'acknowledged', 'resolved', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.createTable(
      new Table({
        name: 'service_calls',
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
          },
          {
            name: 'table_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'call_type',
            type: 'service_call_type_enum',
          },
          {
            name: 'status',
            type: 'service_call_status_enum',
            default: "'pending'",
          },
          {
            name: 'message',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'called_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'acknowledged_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'acknowledged_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'resolved_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'resolved_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    // Create indexes for common query patterns
    await queryRunner.createIndex(
      'service_calls',
      new TableIndex({
        name: 'IDX_service_calls_restaurant_id',
        columnNames: ['restaurant_id'],
      }),
    );

    await queryRunner.createIndex(
      'service_calls',
      new TableIndex({
        name: 'IDX_service_calls_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'service_calls',
      new TableIndex({
        name: 'IDX_service_calls_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'service_calls',
      new TableIndex({
        name: 'IDX_service_calls_called_at',
        columnNames: ['called_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('service_calls', 'IDX_service_calls_called_at');
    await queryRunner.dropIndex('service_calls', 'IDX_service_calls_user_id');
    await queryRunner.dropIndex('service_calls', 'IDX_service_calls_status');
    await queryRunner.dropIndex('service_calls', 'IDX_service_calls_restaurant_id');
    await queryRunner.dropTable('service_calls');
    await queryRunner.query('DROP TYPE IF EXISTS "service_call_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "service_call_type_enum"');
  }
}
