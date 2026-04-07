import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceCallsTable1765100000003 implements MigrationInterface {
  name = 'CreateServiceCallsTable1765100000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "call_type_enum" AS ENUM ('waiter', 'manager', 'help', 'emergency')
    `);

    await queryRunner.query(`
      CREATE TYPE "service_call_status_enum" AS ENUM ('pending', 'acknowledged', 'resolved', 'cancelled')
    `);

    // Create service_calls table
    await queryRunner.query(`
      CREATE TABLE "service_calls" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" UUID NOT NULL,
        "table_id" UUID,
        "user_id" UUID NOT NULL,
        "call_type" "call_type_enum" NOT NULL,
        "status" "service_call_status_enum" NOT NULL DEFAULT 'pending',
        "message" VARCHAR(500),
        "called_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "acknowledged_at" TIMESTAMP WITH TIME ZONE,
        "acknowledged_by" UUID,
        "resolved_at" TIMESTAMP WITH TIME ZONE,
        "resolved_by" UUID,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_service_calls" PRIMARY KEY ("id"),
        CONSTRAINT "FK_service_calls_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_service_calls_user" FOREIGN KEY ("user_id")
          REFERENCES "profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_service_calls_acknowledged_by" FOREIGN KEY ("acknowledged_by")
          REFERENCES "profiles"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_service_calls_resolved_by" FOREIGN KEY ("resolved_by")
          REFERENCES "profiles"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_service_calls_restaurant_id" ON "service_calls" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_calls_status" ON "service_calls" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_calls_user_id" ON "service_calls" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_calls_called_at" ON "service_calls" ("called_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_calls_called_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_calls_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_calls_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_calls_restaurant_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_calls"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "service_call_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "call_type_enum"`);
  }
}
