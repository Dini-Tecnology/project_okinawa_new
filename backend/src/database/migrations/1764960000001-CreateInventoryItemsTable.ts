import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventoryItemsTable1764960000001 implements MigrationInterface {
  name = 'CreateInventoryItemsTable1764960000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "inventory_category_enum" AS ENUM (
        'meats', 'grains', 'vegetables', 'dairy',
        'beverages', 'spirits', 'condiments', 'packaging', 'cleaning', 'other'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "inventory_unit_enum" AS ENUM (
        'kg', 'g', 'l', 'ml', 'un', 'cx', 'pct', 'dz'
      )
    `);

    // Create inventory_items table
    await queryRunner.query(`
      CREATE TABLE "inventory_items" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" UUID NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "category" "inventory_category_enum" NOT NULL,
        "current_level" DECIMAL(10,3) NOT NULL CHECK ("current_level" >= 0),
        "unit" "inventory_unit_enum" NOT NULL,
        "min_level" DECIMAL(10,3) NOT NULL CHECK ("min_level" > 0),
        "max_level" DECIMAL(10,3),
        "unit_cost" DECIMAL(10,2),
        "supplier" VARCHAR(200),
        "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
        "notes" TEXT,
        "last_restocked_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_inventory_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_inventory_items_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_inventory_restaurant" ON "inventory_items" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_inventory_category" ON "inventory_items" ("category")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_inventory_restaurant_category" ON "inventory_items" ("restaurant_id", "category")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_inventory_active" ON "inventory_items" ("restaurant_id", "is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_restaurant_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_restaurant"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_items"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "inventory_unit_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "inventory_category_enum"`);
  }
}
