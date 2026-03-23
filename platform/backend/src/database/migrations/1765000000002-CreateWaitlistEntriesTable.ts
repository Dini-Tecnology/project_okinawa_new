import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWaitlistEntriesTable1765000000002 implements MigrationInterface {
  name = 'CreateWaitlistEntriesTable1765000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "waitlist_status_enum" AS ENUM ('waiting', 'called', 'seated', 'no_show', 'cancelled')
    `);

    await queryRunner.query(`
      CREATE TYPE "seating_preference_enum" AS ENUM ('salao', 'terraco', 'qualquer')
    `);

    // Create waitlist_entries table
    await queryRunner.query(`
      CREATE TABLE "waitlist_entries" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" UUID NOT NULL,
        "customer_id" UUID,
        "customer_name" VARCHAR(150) NOT NULL,
        "customer_phone" VARCHAR(20),
        "party_size" INTEGER NOT NULL,
        "preference" "seating_preference_enum" NOT NULL DEFAULT 'qualquer',
        "has_kids" BOOLEAN NOT NULL DEFAULT false,
        "kids_ages" JSONB,
        "kids_allergies" JSONB,
        "waitlist_bar_orders" JSONB DEFAULT '[]',
        "status" "waitlist_status_enum" NOT NULL DEFAULT 'waiting',
        "estimated_wait_minutes" INTEGER,
        "position" INTEGER NOT NULL,
        "notes" TEXT,
        "table_number" VARCHAR(50),
        "called_at" TIMESTAMP WITH TIME ZONE,
        "seated_at" TIMESTAMP WITH TIME ZONE,
        "no_show_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_waitlist_entries" PRIMARY KEY ("id"),
        CONSTRAINT "FK_waitlist_entries_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_waitlist_entries_customer" FOREIGN KEY ("customer_id")
          REFERENCES "profiles"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_waitlist_restaurant" ON "waitlist_entries" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_waitlist_customer" ON "waitlist_entries" ("customer_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_waitlist_status" ON "waitlist_entries" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_waitlist_position" ON "waitlist_entries" ("restaurant_id", "position")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_waitlist_created_at" ON "waitlist_entries" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_waitlist_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_waitlist_position"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_waitlist_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_waitlist_customer"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_waitlist_restaurant"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "waitlist_entries"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "seating_preference_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "waitlist_status_enum"`);
  }
}
