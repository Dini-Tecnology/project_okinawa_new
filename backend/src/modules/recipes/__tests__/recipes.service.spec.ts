import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RecipesService } from '../recipes.service';
import { DrinkRecipe, RecipeDifficulty } from '../entities/drink-recipe.entity';

describe('RecipesService', () => {
  let service: RecipesService;
  let repository: Repository<DrinkRecipe>;

  const mockRecipe: Partial<DrinkRecipe> = {
    id: 'recipe-uuid-1',
    restaurant_id: null,
    name: 'Gin Tonica Aurora',
    category: 'Gin',
    description: 'A refreshing gin tonic',
    difficulty: RecipeDifficulty.EASY,
    preparation_time_minutes: 5,
    glass_type: 'Highball',
    garnish: 'Pepino + Cardamomo',
    base_spirit: 'Gin',
    serving_temp: 'gelado',
    ingredients: [
      { name: 'Gin Artesanal', amount: '60', unit: 'ml' },
      { name: 'Tonica Premium', amount: '120', unit: 'ml' },
    ],
    steps: [
      'Encha a taca com gelo.',
      'Despeje o gin.',
      'Complete com tonica.',
    ],
    tags: ['refreshing', 'floral'],
    price: 38.0,
    image_url: 'https://example.com/gin.jpg',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCustomRecipe: Partial<DrinkRecipe> = {
    id: 'recipe-uuid-2',
    restaurant_id: 'restaurant-uuid-1',
    name: 'Custom Drink',
    category: 'Signature',
    difficulty: RecipeDifficulty.HARD,
    preparation_time_minutes: 10,
    glass_type: 'Coupe',
    ingredients: [{ name: 'Vodka', amount: '60', unit: 'ml' }],
    steps: ['Mix everything.'],
    tags: ['signature'],
    is_active: true,
  };

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: getRepositoryToken(DrinkRecipe),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
    repository = module.get<Repository<DrinkRecipe>>(getRepositoryToken(DrinkRecipe));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByRestaurant', () => {
    it('should return paginated recipes including global defaults', async () => {
      const recipes = [mockRecipe as DrinkRecipe, mockCustomRecipe as DrinkRecipe];
      mockRepository.findAndCount.mockResolvedValue([recipes, 2]);

      const result = await service.findByRestaurant('restaurant-uuid-1');

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [
          { restaurant_id: 'restaurant-uuid-1', is_active: true },
          { restaurant_id: IsNull(), is_active: true },
        ],
        order: { category: 'ASC', name: 'ASC' },
        skip: 0,
        take: 20,
      });
      expect(result.items).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should respect pagination parameters', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findByRestaurant('restaurant-uuid-1', { page: 2, limit: 5 } as any);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });
  });

  describe('findDefaults', () => {
    it('should return only global recipes (restaurant_id = null)', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockRecipe as DrinkRecipe], 1]);

      const result = await service.findDefaults();

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { restaurant_id: IsNull(), is_active: true },
        order: { category: 'ASC', name: 'ASC' },
        skip: 0,
        take: 20,
      });
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a recipe by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockRecipe as DrinkRecipe);

      const result = await service.findOne('recipe-uuid-1');

      expect(result).toEqual(mockRecipe);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'recipe-uuid-1' },
      });
    });

    it('should throw NotFoundException when recipe does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a recipe for a restaurant', async () => {
      const createDto = {
        name: 'New Drink',
        category: 'Signature',
        difficulty: RecipeDifficulty.MEDIUM,
        preparation_time_minutes: 7,
        glass_type: 'Coupe',
        ingredients: [{ name: 'Vodka', amount: '60', unit: 'ml' }],
        steps: ['Shake and serve.'],
      };
      const created = { ...createDto, id: 'new-uuid', restaurant_id: 'rest-1' };
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      const result = await service.create('rest-1', createDto as any);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        restaurant_id: 'rest-1',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(created);
      expect(result.restaurant_id).toBe('rest-1');
    });
  });

  describe('update', () => {
    it('should update an existing recipe', async () => {
      const existingRecipe = { ...mockRecipe } as DrinkRecipe;
      mockRepository.findOne.mockResolvedValue(existingRecipe);
      mockRepository.save.mockResolvedValue({ ...existingRecipe, name: 'Updated Name' });

      const result = await service.update('recipe-uuid-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when updating nonexistent recipe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should set is_active to false', async () => {
      const existingRecipe = { ...mockRecipe, is_active: true } as DrinkRecipe;
      mockRepository.findOne.mockResolvedValue(existingRecipe);
      mockRepository.save.mockResolvedValue({ ...existingRecipe, is_active: false });

      const result = await service.softDelete('recipe-uuid-1');

      expect(result.is_active).toBe(false);
    });

    it('should throw NotFoundException when soft-deleting nonexistent recipe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.softDelete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('seedDefaults', () => {
    it('should seed recipes that do not already exist', async () => {
      mockRepository.find.mockResolvedValue([{ name: 'Gin Tonica Aurora' }]);

      const newRecipes = [
        { name: 'Gin Tonica Aurora', category: 'Gin' },
        { name: 'Moscow Mule', category: 'Vodka' },
      ];
      const created = { ...newRecipes[1], id: 'new-uuid', restaurant_id: null };
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue([created]);

      const result = await service.seedDefaults(newRecipes as any);

      // Should only create Moscow Mule since Gin Tonica Aurora already exists
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Moscow Mule', restaurant_id: null }),
      );
    });

    it('should return empty array if all recipes already exist', async () => {
      mockRepository.find.mockResolvedValue([
        { name: 'Gin Tonica Aurora' },
        { name: 'Moscow Mule' },
      ]);

      const result = await service.seedDefaults([
        { name: 'Gin Tonica Aurora' } as any,
        { name: 'Moscow Mule' } as any,
      ]);

      expect(result).toEqual([]);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
