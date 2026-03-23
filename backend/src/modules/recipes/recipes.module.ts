import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { DrinkRecipe } from './entities/drink-recipe.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DrinkRecipe, UserRole])],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
