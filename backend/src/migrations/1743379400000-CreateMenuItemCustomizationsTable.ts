/**
 * Migration: Create Menu Item Customization Groups Table
 *
 * Part of Epic 16 -- Backend Completions.
 * Creates the `menu_item_customization_groups` table for dynamic dish customization.
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateMenuItemCustomizationsTable1743379400000 implements MigrationInterface {
  name = 'CreateMenuItemCustomizationsTable1743379400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'menu_item_customization_groups',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'menu_item_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'min_select',
            type: 'int',
            default: 0,
          },
          {
            name: 'max_select',
            type: 'int',
            default: 1,
          },
          {
            name: 'is_required',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
          },
          {
            name: 'options',
            type: 'jsonb',
            default: "'[]'",
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

    // Index: menu_item_id
    await queryRunner.createIndex(
      'menu_item_customization_groups',
      new TableIndex({
        name: 'idx_customization_menu_item',
        columnNames: ['menu_item_id'],
      }),
    );

    // Index: menu_item_id + sort_order
    await queryRunner.createIndex(
      'menu_item_customization_groups',
      new TableIndex({
        name: 'idx_customization_sort',
        columnNames: ['menu_item_id', 'sort_order'],
      }),
    );

    // Foreign key: menu_item_id -> menu_items
    await queryRunner.createForeignKey(
      'menu_item_customization_groups',
      new TableForeignKey({
        name: 'fk_customization_menu_item_id',
        columnNames: ['menu_item_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'menu_items',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('menu_item_customization_groups', 'fk_customization_menu_item_id');
    await queryRunner.dropIndex('menu_item_customization_groups', 'idx_customization_sort');
    await queryRunner.dropIndex('menu_item_customization_groups', 'idx_customization_menu_item');
    await queryRunner.dropTable('menu_item_customization_groups');
  }
}
