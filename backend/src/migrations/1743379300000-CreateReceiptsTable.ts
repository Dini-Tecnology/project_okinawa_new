/**
 * Migration: Create Receipts Table
 *
 * Part of Epic 16 -- Backend Completions.
 * Creates the `receipts` table for digital receipt storage.
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateReceiptsTable1743379300000 implements MigrationInterface {
  name = 'CreateReceiptsTable1743379300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'receipts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_id',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'payment_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'restaurant_id',
            type: 'uuid',
          },
          {
            name: 'items_snapshot',
            type: 'jsonb',
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'service_fee',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'tip',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'payment_method',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'generated_at',
            type: 'timestamptz',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Unique index on order_id
    await queryRunner.createIndex(
      'receipts',
      new TableIndex({
        name: 'uq_receipts_order',
        columnNames: ['order_id'],
        isUnique: true,
      }),
    );

    // Index: user_id
    await queryRunner.createIndex(
      'receipts',
      new TableIndex({
        name: 'idx_receipts_user',
        columnNames: ['user_id'],
      }),
    );

    // Index: restaurant_id
    await queryRunner.createIndex(
      'receipts',
      new TableIndex({
        name: 'idx_receipts_restaurant',
        columnNames: ['restaurant_id'],
      }),
    );

    // Foreign key: user_id -> profiles
    await queryRunner.createForeignKey(
      'receipts',
      new TableForeignKey({
        name: 'fk_receipts_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'profiles',
        onDelete: 'CASCADE',
      }),
    );

    // Foreign key: restaurant_id -> restaurants
    await queryRunner.createForeignKey(
      'receipts',
      new TableForeignKey({
        name: 'fk_receipts_restaurant_id',
        columnNames: ['restaurant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'restaurants',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('receipts', 'fk_receipts_restaurant_id');
    await queryRunner.dropForeignKey('receipts', 'fk_receipts_user_id');
    await queryRunner.dropIndex('receipts', 'idx_receipts_restaurant');
    await queryRunner.dropIndex('receipts', 'idx_receipts_user');
    await queryRunner.dropIndex('receipts', 'uq_receipts_order');
    await queryRunner.dropTable('receipts');
  }
}
