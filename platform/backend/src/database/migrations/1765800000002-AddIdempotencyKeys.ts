import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds idempotency columns to prevent duplicate processing on retries.
 *
 * Changes:
 *  - tab_payments: add idempotency_key (varchar 255, nullable, unique)
 *  - loyalty_programs: add awarded_order_ids (text[], default '{}')
 */
export class AddIdempotencyKeys1765800000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // tab_payments — idempotency key for duplicate payment prevention
    await queryRunner.query(`
      ALTER TABLE "tab_payments"
        ADD COLUMN "idempotency_key" varchar(255) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "tab_payments"
        ADD CONSTRAINT "uq_tab_payments_idempotency_key"
        UNIQUE ("idempotency_key");
    `);

    // loyalty_programs — track which orders have already been awarded points
    await queryRunner.query(`
      ALTER TABLE "loyalty_programs"
        ADD COLUMN "awarded_order_ids" text[] NOT NULL DEFAULT '{}';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "loyalty_programs"
        DROP COLUMN "awarded_order_ids";
    `);

    await queryRunner.query(`
      ALTER TABLE "tab_payments"
        DROP CONSTRAINT "uq_tab_payments_idempotency_key";
    `);

    await queryRunner.query(`
      ALTER TABLE "tab_payments"
        DROP COLUMN "idempotency_key";
    `);
  }
}
