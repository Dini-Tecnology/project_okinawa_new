/**
 * Migration: Create Promotions and Stamp Cards Tables
 *
 * Part of Epic 9 — Loyalty & Promotions.
 * Creates the `promotions` table for coupon/promotion management
 * and the `stamp_cards` table for the loyalty stamp card system.
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePromotionsAndStampCards1743292800000 implements MigrationInterface {
  name = 'CreatePromotionsAndStampCards1743292800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create promotion_type enum
    await queryRunner.query(`
      CREATE TYPE "promotion_type_enum" AS ENUM ('percentage', 'fixed', 'free_item', 'bogo', 'happy_hour')
    `);

    // Create promotion_status enum
    await queryRunner.query(`
      CREATE TYPE "promotion_status_enum" AS ENUM ('active', 'inactive', 'expired', 'scheduled')
    `);

    // ========== PROMOTIONS TABLE ==========
    await queryRunner.createTable(
      new Table({
        name: 'promotions',
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
            name: 'code',
            type: 'varchar',
            length: '30',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'promotion_type_enum',
          },
          {
            name: 'status',
            type: 'promotion_status_enum',
            default: "'active'",
          },
          {
            name: 'discount_value',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'free_item_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'min_order_value',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'max_uses',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'current_uses',
            type: 'int',
            default: 0,
          },
          {
            name: 'max_uses_per_user',
            type: 'int',
            default: 1,
          },
          {
            name: 'valid_from',
            type: 'timestamp',
          },
          {
            name: 'valid_until',
            type: 'timestamp',
          },
          {
            name: 'days_of_week',
            type: 'int[]',
            isNullable: true,
          },
          {
            name: 'hours_from',
            type: 'varchar',
            length: '5',
            isNullable: true,
          },
          {
            name: 'hours_until',
            type: 'varchar',
            length: '5',
            isNullable: true,
          },
          {
            name: 'applicable_categories',
            type: 'varchar[]',
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

    // Unique index: code + restaurant_id
    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'idx_promotions_code_restaurant',
        columnNames: ['code', 'restaurant_id'],
        isUnique: true,
      }),
    );

    // Index: restaurant_id
    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'idx_promotions_restaurant',
        columnNames: ['restaurant_id'],
      }),
    );

    // Index: status
    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'idx_promotions_status',
        columnNames: ['status'],
      }),
    );

    // Foreign key to restaurants
    await queryRunner.createForeignKey(
      'promotions',
      new TableForeignKey({
        name: 'fk_promotions_restaurant_id',
        columnNames: ['restaurant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'restaurants',
        onDelete: 'CASCADE',
      }),
    );

    // ========== STAMP CARDS TABLE ==========
    await queryRunner.createTable(
      new Table({
        name: 'stamp_cards',
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
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'service_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'current_stamps',
            type: 'int',
            default: 0,
          },
          {
            name: 'required_stamps',
            type: 'int',
            default: 10,
          },
          {
            name: 'reward_description',
            type: 'varchar',
            length: '255',
            default: "''",
          },
          {
            name: 'completed_cycles',
            type: 'int',
            default: 0,
          },
          {
            name: 'completed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'completed_at',
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

    // Unique index: user_id + restaurant_id + service_type
    await queryRunner.createIndex(
      'stamp_cards',
      new TableIndex({
        name: 'uq_stamp_user_restaurant_service',
        columnNames: ['user_id', 'restaurant_id', 'service_type'],
        isUnique: true,
      }),
    );

    // Index: user_id
    await queryRunner.createIndex(
      'stamp_cards',
      new TableIndex({
        name: 'idx_stamp_cards_user',
        columnNames: ['user_id'],
      }),
    );

    // Index: restaurant_id
    await queryRunner.createIndex(
      'stamp_cards',
      new TableIndex({
        name: 'idx_stamp_cards_restaurant',
        columnNames: ['restaurant_id'],
      }),
    );

    // Foreign key: restaurant_id
    await queryRunner.createForeignKey(
      'stamp_cards',
      new TableForeignKey({
        name: 'fk_stamp_cards_restaurant_id',
        columnNames: ['restaurant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'restaurants',
        onDelete: 'CASCADE',
      }),
    );

    // Foreign key: user_id
    await queryRunner.createForeignKey(
      'stamp_cards',
      new TableForeignKey({
        name: 'fk_stamp_cards_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'profiles',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop stamp_cards
    await queryRunner.dropForeignKey('stamp_cards', 'fk_stamp_cards_user_id');
    await queryRunner.dropForeignKey('stamp_cards', 'fk_stamp_cards_restaurant_id');
    await queryRunner.dropIndex('stamp_cards', 'idx_stamp_cards_restaurant');
    await queryRunner.dropIndex('stamp_cards', 'idx_stamp_cards_user');
    await queryRunner.dropIndex('stamp_cards', 'uq_stamp_user_restaurant_service');
    await queryRunner.dropTable('stamp_cards');

    // Drop promotions
    await queryRunner.dropForeignKey('promotions', 'fk_promotions_restaurant_id');
    await queryRunner.dropIndex('promotions', 'idx_promotions_status');
    await queryRunner.dropIndex('promotions', 'idx_promotions_restaurant');
    await queryRunner.dropIndex('promotions', 'idx_promotions_code_restaurant');
    await queryRunner.dropTable('promotions');

    // Drop enums
    await queryRunner.query('DROP TYPE IF EXISTS "promotion_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "promotion_type_enum"');
  }
}
