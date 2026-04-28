import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemsService } from './menu-items.service';
import { MenuItem } from './entities/menu-item.entity';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItemCustomizationGroup } from './entities/menu-item-customization-group.entity';
import { EventsGateway } from '@/modules/events/events.realtime';
import { NotFoundException } from '@nestjs/common';

describe('MenuItemsService', () => {
  let service: MenuItemsService;
  let menuItemRepository: Repository<MenuItem>;
  let categoryRepository: Repository<MenuCategory>;

  const mockMenuItem = {
    id: 'item-1',
    name: 'Sushi Roll',
    description: 'Fresh salmon roll',
    price: '25.00',
    category: 'Sushi',
    restaurant_id: 'restaurant-1',
    is_available: true,
  };

  const mockCategory = {
    id: 'cat-1',
    name: 'Sushi',
    description: 'Fresh sushi items',
    restaurant_id: 'restaurant-1',
    is_active: true,
    display_order: 1,
  };

  const mockMenuItemRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCustomizationGroupRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        {
          provide: getRepositoryToken(MenuItem),
          useValue: mockMenuItemRepository,
        },
        {
          provide: getRepositoryToken(MenuCategory),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(MenuItemCustomizationGroup),
          useValue: mockCustomizationGroupRepository,
        },
        {
          provide: EventsGateway,
          useValue: { emitToRestaurant: jest.fn(), notifyRestaurant: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MenuItemsService>(MenuItemsService);
    menuItemRepository = module.get(getRepositoryToken(MenuItem));
    categoryRepository = module.get(getRepositoryToken(MenuCategory));

    jest.clearAllMocks();
  });

  describe('findByRestaurant', () => {
    it('should return menu items for a restaurant', async () => {
      mockMenuItemRepository.findAndCount.mockResolvedValue([[mockMenuItem], 1]);

      const result = await service.findByRestaurant('restaurant-1');

      expect(result.items).toEqual([mockMenuItem]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(mockMenuItemRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findCategories', () => {
    it('should return categories for a restaurant', async () => {
      mockCategoryRepository.find.mockResolvedValue([mockCategory]);

      const result = await service.findCategories('restaurant-1');

      expect(result).toEqual([mockCategory]);
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        where: { restaurant_id: 'restaurant-1', is_active: true },
        order: { display_order: 'ASC' },
      });
    });
  });

  describe('createItem', () => {
    it('should create a menu item', async () => {
      const createDto = {
        name: 'New Item',
        price: '15.00',
        restaurant_id: 'restaurant-1',
        category: 'Appetizers',
      };

      mockMenuItemRepository.create.mockReturnValue(mockMenuItem);
      mockMenuItemRepository.save.mockResolvedValue(mockMenuItem);

      const result = await service.createItem(createDto as any);

      expect(result).toEqual(mockMenuItem);
      expect(mockMenuItemRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockMenuItemRepository.save).toHaveBeenCalled();
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createDto = {
        name: 'Desserts',
        restaurant_id: 'restaurant-1',
        display_order: 5,
      };

      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.createCategory(createDto as any);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockCategoryRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('should update a menu item', async () => {
      const updateData = { price: 30.00 };

      mockMenuItemRepository.findOne.mockResolvedValue(mockMenuItem);
      mockMenuItemRepository.save.mockResolvedValue({
        ...mockMenuItem,
        price: 30.00,
      });

      const result = await service.updateItem('item-1', updateData);

      expect(result.price).toBe(30.00);
      expect(mockMenuItemRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if item not found', async () => {
      mockMenuItemRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateItem('nonexistent', { price: 30.00 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteItem', () => {
    it('should soft delete a menu item', async () => {
      mockMenuItemRepository.findOne.mockResolvedValue(mockMenuItem);
      mockMenuItemRepository.save.mockResolvedValue({
        ...mockMenuItem,
        is_available: false,
      });

      const result = await service.deleteItem('item-1');

      expect(result.is_available).toBe(false);
      expect(mockMenuItemRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if item not found', async () => {
      mockMenuItemRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteItem('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
