import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDrinkRecipesTable1765000000001 implements MigrationInterface {
  name = 'CreateDrinkRecipesTable1765000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create difficulty enum type
    await queryRunner.query(`
      CREATE TYPE "recipe_difficulty_enum" AS ENUM ('easy', 'medium', 'hard')
    `);

    // Create drink_recipes table
    await queryRunner.query(`
      CREATE TABLE "drink_recipes" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" UUID,
        "name" VARCHAR(120) NOT NULL,
        "category" VARCHAR(80) NOT NULL,
        "description" TEXT,
        "difficulty" "recipe_difficulty_enum" NOT NULL DEFAULT 'easy',
        "preparation_time_minutes" INTEGER NOT NULL,
        "glass_type" VARCHAR(80) NOT NULL,
        "garnish" VARCHAR(200),
        "base_spirit" VARCHAR(80),
        "serving_temp" VARCHAR(60) NOT NULL DEFAULT 'gelado',
        "ingredients" JSONB NOT NULL DEFAULT '[]',
        "steps" JSONB NOT NULL DEFAULT '[]',
        "tags" JSONB DEFAULT '[]',
        "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "image_url" VARCHAR(500),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_drink_recipes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_drink_recipes_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_drink_recipe_restaurant_active"
        ON "drink_recipes" ("restaurant_id", "is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_drink_recipe_restaurant_name"
        ON "drink_recipes" ("restaurant_id", "name")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_drink_recipe_category"
        ON "drink_recipes" ("category")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_drink_recipe_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_drink_recipe_restaurant_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_drink_recipe_restaurant_active"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drink_recipes"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "recipe_difficulty_enum"`);
  }
}
