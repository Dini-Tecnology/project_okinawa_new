import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { DrinkRecipe } from './entities/drink-recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PaginationDto, paginate } from '@/common/dto/pagination.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(DrinkRecipe)
    private recipeRepository: Repository<DrinkRecipe>,
  ) {}

  /**
   * List all active recipes for a restaurant, including global defaults.
   * Global defaults have restaurant_id = null.
   */
  async findByRestaurant(restaurantId: string, pagination?: PaginationDto) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.recipeRepository.findAndCount({
      where: [
        { restaurant_id: restaurantId, is_active: true },
        { restaurant_id: IsNull(), is_active: true },
      ],
      order: { category: 'ASC', name: 'ASC' },
      skip,
      take: limit,
    });

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  /**
   * List only global/default recipes (restaurant_id = null).
   */
  async findDefaults(pagination?: PaginationDto) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.recipeRepository.findAndCount({
      where: { restaurant_id: IsNull(), is_active: true },
      order: { category: 'ASC', name: 'ASC' },
      skip,
      take: limit,
    });

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  /**
   * Get a single recipe by ID.
   */
  async findOne(id: string): Promise<DrinkRecipe> {
    const recipe = await this.recipeRepository.findOne({ where: { id } });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID "${id}" not found`);
    }
    return recipe;
  }

  /**
   * Create a new custom recipe for a restaurant.
   */
  async create(restaurantId: string, createRecipeDto: CreateRecipeDto): Promise<DrinkRecipe> {
    const recipe = this.recipeRepository.create({
      ...createRecipeDto,
      restaurant_id: restaurantId,
    });
    return this.recipeRepository.save(recipe);
  }

  /**
   * Update an existing recipe.
   */
  async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<DrinkRecipe> {
    const recipe = await this.findOne(id);
    Object.assign(recipe, updateRecipeDto);
    return this.recipeRepository.save(recipe);
  }

  /**
   * Soft delete a recipe by setting is_active to false.
   */
  async softDelete(id: string): Promise<DrinkRecipe> {
    const recipe = await this.findOne(id);
    recipe.is_active = false;
    return this.recipeRepository.save(recipe);
  }

  /**
   * Seed default recipes (global, restaurant_id = null).
   * Skips recipes that already exist by name with restaurant_id = null.
   */
  async seedDefaults(recipes: Partial<DrinkRecipe>[]): Promise<DrinkRecipe[]> {
    const existingNames = await this.recipeRepository.find({
      where: { restaurant_id: IsNull() },
      select: ['name'],
    });

    const existingNameSet = new Set(existingNames.map((r) => r.name));

    const newRecipes = recipes
      .filter((r) => !existingNameSet.has(r.name!))
      .map((r) => this.recipeRepository.create({ ...r, restaurant_id: null }));

    if (newRecipes.length === 0) {
      return [];
    }

    return this.recipeRepository.save(newRecipes);
  }
}
