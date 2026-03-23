import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOpenForAdditionsOrderStatus1765100000002 implements MigrationInterface {
  name = 'AddOpenForAdditionsOrderStatus1765100000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new value to the order_status enum type
    // Using IF NOT EXISTS pattern to be idempotent
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum
          WHERE enumlabel = 'open_for_additions'
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'orders_status_enum'
          )
        ) THEN
          ALTER TYPE "orders_status_enum" ADD VALUE 'open_for_additions';
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values directly.
    // The safest approach is to update any rows using the value and recreate the type.
    // For rollback safety, we set affected rows back to 'confirmed'.
    await queryRunner.query(`
      UPDATE "orders"
      SET "status" = 'confirmed'
      WHERE "status" = 'open_for_additions'
    `);
  }
}
