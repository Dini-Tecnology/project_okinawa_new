import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { IngredientPrice } from './entities/ingredient-price.entity';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Supplier } from './entities/supplier.entity';
import { IngredientSupplier } from './entities/ingredient-supplier.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { IngredientService } from './services/ingredient.service';
import { RecipeService } from './services/recipe.service';
import { CogsService } from './services/cogs.service';
import { MarginTrackerService } from './services/margin-tracker.service';
import { SupplierService } from './services/supplier.service';
import { CostControlController } from './controllers/cost-control.controller';
import { CostControlEventListener } from './listeners/cost-control-event.listener';
import { FinancialModule } from '../financial/financial.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ingredient,
      IngredientPrice,
      Recipe,
      RecipeIngredient,
      Supplier,
      IngredientSupplier,
      MenuItem,
    ]),
    FinancialModule,
    OrdersModule,
  ],
  controllers: [CostControlController],
  providers: [
    IngredientService,
    RecipeService,
    CogsService,
    MarginTrackerService,
    SupplierService,
    CostControlEventListener,
  ],
  exports: [CogsService, RecipeService, MarginTrackerService, IngredientService, SupplierService],
})
export class CostControlModule {}
