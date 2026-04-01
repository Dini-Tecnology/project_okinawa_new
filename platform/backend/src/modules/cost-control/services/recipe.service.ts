import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from '../entities/recipe.entity';
import { RecipeIngredient } from '../entities/recipe-ingredient.entity';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { AddRecipeIngredientDto } from '../dto/add-recipe-ingredient.dto';
import { IngredientService } from './ingredient.service';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';

@Injectable()
export class RecipeService {
  private readonly logger = new Logger(RecipeService.name);

  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepo: Repository<RecipeIngredient>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    private readonly ingredientService: IngredientService,
  ) {}

  /**
   * List all recipes for a restaurant with their calculated costs.
   */
  async findAll(restaurantId: string): Promise<any[]> {
    const recipes = await this.recipeRepo.find({
      where: { restaurant_id: restaurantId },
      relations: ['menu_item', 'ingredients', 'ingredients.ingredient'],
      order: { created_at: 'DESC' },
    });

    return recipes.map((recipe) => ({
      id: recipe.id,
      menu_item_id: recipe.menu_item_id,
      menu_item_name: recipe.menu_item?.name || 'Unknown',
      sale_price: recipe.menu_item ? Number(recipe.menu_item.price) : 0,
      calculated_cost: recipe.calculated_cost ? Number(recipe.calculated_cost) : null,
      calculated_margin_pct: recipe.calculated_margin_pct ? Number(recipe.calculated_margin_pct) : null,
      last_calculated_at: recipe.last_calculated_at,
      ingredient_count: recipe.ingredients?.length || 0,
      ingredients: recipe.ingredients?.map((ri) => ({
        id: ri.id,
        ingredient_id: ri.ingredient_id,
        ingredient_name: ri.ingredient?.name || 'Unknown',
        quantity: Number(ri.quantity),
        unit: ri.ingredient?.unit || '',
      })),
    }));
  }

  /**
   * Create a new recipe (technical sheet) for a menu item.
   * Enforces 1:1 relationship between Recipe and MenuItem.
   */
  async create(dto: CreateRecipeDto): Promise<Recipe> {
    // Verify menu item exists
    const menuItem = await this.menuItemRepo.findOne({ where: { id: dto.menu_item_id } });
    if (!menuItem) throw new NotFoundException('Menu item not found');

    // Check if recipe already exists for this menu item
    const existing = await this.recipeRepo.findOne({
      where: { menu_item_id: dto.menu_item_id },
    });
    if (existing) throw new ConflictException('Recipe already exists for this menu item');

    const recipe = this.recipeRepo.create(dto);
    return this.recipeRepo.save(recipe);
  }

  /**
   * Add an ingredient to a recipe.
   */
  async addIngredient(recipeId: string, dto: AddRecipeIngredientDto): Promise<RecipeIngredient> {
    const recipe = await this.recipeRepo.findOne({ where: { id: recipeId } });
    if (!recipe) throw new NotFoundException('Recipe not found');

    // Verify ingredient exists
    await this.ingredientService.findOne(dto.ingredient_id);

    // Check if ingredient already in recipe
    const existing = await this.recipeIngredientRepo.findOne({
      where: { recipe_id: recipeId, ingredient_id: dto.ingredient_id },
    });
    if (existing) throw new ConflictException('Ingredient already in recipe');

    const recipeIngredient = this.recipeIngredientRepo.create({
      recipe_id: recipeId,
      ingredient_id: dto.ingredient_id,
      quantity: dto.quantity,
    });
    return this.recipeIngredientRepo.save(recipeIngredient);
  }

  /**
   * Remove an ingredient from a recipe.
   */
  async removeIngredient(recipeId: string, ingredientId: string): Promise<{ message: string }> {
    const recipeIngredient = await this.recipeIngredientRepo.findOne({
      where: { recipe_id: recipeId, ingredient_id: ingredientId },
    });
    if (!recipeIngredient) throw new NotFoundException('Ingredient not found in recipe');

    await this.recipeIngredientRepo.remove(recipeIngredient);
    return { message: 'Ingredient removed from recipe' };
  }

  /**
   * Calculate the cost of a recipe by summing (quantity x latest_price) for each ingredient.
   * Updates the Recipe's cached cost and margin fields.
   */
  async calculateCost(recipeId: string): Promise<{
    cost: number;
    sale_price: number;
    margin_pct: number;
    ingredients: Array<{
      name: string;
      quantity: number;
      unit: string;
      unit_price: number;
      line_cost: number;
    }>;
  }> {
    const recipe = await this.recipeRepo.findOne({
      where: { id: recipeId },
      relations: ['menu_item', 'ingredients', 'ingredients.ingredient'],
    });
    if (!recipe) throw new NotFoundException('Recipe not found');

    const salePrice = recipe.menu_item ? Number(recipe.menu_item.price) : 0;
    let totalCost = 0;
    const ingredientBreakdown: Array<{
      name: string;
      quantity: number;
      unit: string;
      unit_price: number;
      line_cost: number;
    }> = [];

    for (const ri of recipe.ingredients || []) {
      const latestPrice = await this.ingredientService.getLatestPrice(ri.ingredient_id);
      const unitPrice = latestPrice ? Number(latestPrice.price_per_unit) : 0;
      const lineCost = Number(ri.quantity) * unitPrice;
      totalCost += lineCost;

      ingredientBreakdown.push({
        name: ri.ingredient?.name || 'Unknown',
        quantity: Number(ri.quantity),
        unit: ri.ingredient?.unit || '',
        unit_price: unitPrice,
        line_cost: Math.round(lineCost * 100) / 100,
      });
    }

    totalCost = Math.round(totalCost * 100) / 100;
    const marginPct = salePrice > 0
      ? Math.round(((salePrice - totalCost) / salePrice) * 10000) / 100
      : 0;

    // Update cached values
    recipe.calculated_cost = totalCost;
    recipe.calculated_margin_pct = marginPct;
    recipe.last_calculated_at = new Date();
    await this.recipeRepo.save(recipe);

    return {
      cost: totalCost,
      sale_price: salePrice,
      margin_pct: marginPct,
      ingredients: ingredientBreakdown,
    };
  }

  /**
   * Get a recipe by menu_item_id (used by CogsService).
   */
  async findByMenuItem(menuItemId: string): Promise<Recipe | null> {
    return this.recipeRepo.findOne({
      where: { menu_item_id: menuItemId },
      relations: ['ingredients', 'ingredients.ingredient'],
    });
  }

  /**
   * Find all recipe ingredients that use a given ingredient ID.
   * Returns RecipeIngredients with their parent recipe loaded.
   * Used by StockDepletionListener to find affected menu items.
   */
  async findRecipeIngredientsByIngredientId(ingredientId: string): Promise<RecipeIngredient[]> {
    return this.recipeIngredientRepo.find({
      where: { ingredient_id: ingredientId },
      relations: ['recipe'],
    });
  }
}
