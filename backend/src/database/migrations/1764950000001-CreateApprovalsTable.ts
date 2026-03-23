import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApprovalsTable1764950000001 implements MigrationInterface {
  name = 'CreateApprovalsTable1764950000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "approval_type_enum" AS ENUM ('cancel', 'courtesy', 'refund', 'discount')
    `);

    await queryRunner.query(`
      CREATE TYPE "approval_status_enum" AS ENUM ('pending', 'approved', 'rejected')
    `);

    // Create approvals table
    await queryRunner.query(`
      CREATE TABLE "approvals" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" UUID NOT NULL,
        "type" "approval_type_enum" NOT NULL,
        "item_name" VARCHAR(255) NOT NULL,
        "table_id" UUID,
        "requester_id" UUID NOT NULL,
        "resolver_id" UUID,
        "reason" TEXT NOT NULL,
        "resolution_note" TEXT,
        "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "status" "approval_status_enum" NOT NULL DEFAULT 'pending',
        "order_id" UUID,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "resolved_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_approvals" PRIMARY KEY ("id"),
        CONSTRAINT "FK_approvals_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_approvals_requester" FOREIGN KEY ("requester_id")
          REFERENCES "profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_approvals_resolver" FOREIGN KEY ("resolver_id")
          REFERENCES "profiles"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_approvals_order" FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_approvals_restaurant_id" ON "approvals" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_approvals_status" ON "approvals" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_approvals_requester_id" ON "approvals" ("requester_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_approvals_created_at" ON "approvals" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_approvals_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_approvals_requester_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_approvals_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_approvals_restaurant_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "approvals"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "approval_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "approval_type_enum"`);
  }
}
