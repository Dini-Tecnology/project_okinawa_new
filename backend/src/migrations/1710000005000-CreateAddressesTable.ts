/**
 * Migration: Create Addresses Table
 *
 * Part of Epic 16 -- Backend Completions.
 * Creates the `addresses` table for user address management.
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAddressesTable1710000005000 implements MigrationInterface {
  name = 'CreateAddressesTable1710000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'restaurant_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'label',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'street',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'number',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'complement',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'neighborhood',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'state',
            type: 'varchar',
            length: '2',
          },
          {
            name: 'postal_code',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'country',
            type: 'varchar',
            length: '5',
            default: "'BR'",
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
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

    // Index: user_id
    await queryRunner.createIndex(
      'addresses',
      new TableIndex({
        name: 'idx_addresses_user',
        columnNames: ['user_id'],
      }),
    );

    // Index: user_id + is_default
    await queryRunner.createIndex(
      'addresses',
      new TableIndex({
        name: 'idx_addresses_user_default',
        columnNames: ['user_id', 'is_default'],
      }),
    );

    // Foreign key: user_id -> profiles
    await queryRunner.createForeignKey(
      'addresses',
      new TableForeignKey({
        name: 'fk_addresses_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'profiles',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('addresses', 'fk_addresses_user_id');
    await queryRunner.dropIndex('addresses', 'idx_addresses_user_default');
    await queryRunner.dropIndex('addresses', 'idx_addresses_user');
    await queryRunner.dropTable('addresses');
  }
}
