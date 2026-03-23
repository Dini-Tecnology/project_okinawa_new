import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { InventoryService } from '../inventory.service';
import { InventoryItem, InventoryCategory, InventoryUnit } from '../entities/inventory-item.entity';

describe('InventoryService', () => {
  let service: InventoryService;
  let repository: Repository<InventoryItem>;

  const restaurantId = 'restaurant-uuid-1';

  const mockItems: Partial<InventoryItem>[] = [
    {
      id: 'item-1',
      restaurant_id: restaurantId,
      name: 'File Mignon',
      category: InventoryCategory.MEATS,
      current_level: 2.5,
      unit: InventoryUnit.KG,
      min_level: 10,
      max_level: 30,
      unit_cost: 89.9,
      supplier: 'Frigor',
      is_active: true,
      notes: null,
      last_restocked_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'item-2',
      restaurant_id: restaurantId,
      name: 'Cerveja IPA',
      category: InventoryCategory.BEVERAGES,
      current_level: 48,
      unit: InventoryUnit.UN,
      min_level: 24,
      max_level: 100,
      unit_cost: 8.5,
      supplier: null,
      is_active: true,
      notes: null,
      last_restocked_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'item-3',
      restaurant_id: restaurantId,
      name: 'Arroz Integral',
      category: InventoryCategory.GRAINS,
      current_level: 3,
      unit: InventoryUnit.KG,
      min_level: 10,
      max_level: 40,
      unit_cost: 6.0,
      supplier: null,
      is_active: true,
      notes: null,
      last_restocked_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    repository = module.get(getRepositoryToken(InventoryItem));

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all active items with computed status', async () => {
      mockRepository.find.mockResolvedValue(mockItems);

      const result = await service.findAll(restaurantId);

      expect(result).toHaveLength(3);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { restaurant_id: restaurantId, is_active: true },
        order: { name: 'ASC' },
      });

      // File Mignon: 2.5/10 = 25% => low
      expect(result.find((r) => r.id === 'item-1')?.status).toBe('low');
      // Cerveja IPA: 48/24 = 200% => ok
      expect(result.find((r) => r.id === 'item-2')?.status).toBe('ok');
      // Arroz Integral: 3/10 = 30% => low
      expect(result.find((r) => r.id === 'item-3')?.status).toBe('low');
    });

    it('should filter by category', async () => {
      mockRepository.find.mockResolvedValue([mockItems[0]]);

      const result = await service.findAll(restaurantId, InventoryCategory.MEATS);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          restaurant_id: restaurantId,
          is_active: true,
          category: InventoryCategory.MEATS,
        },
        order: { name: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });

    it('should filter by computed status', async () => {
      mockRepository.find.mockResolvedValue(mockItems);

      const result = await service.findAll(restaurantId, undefined, 'ok');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cerveja IPA');
    });

    it('should sort by status priority (critical first, then low, then ok)', async () => {
      const criticalItem = {
        ...mockItems[0],
        id: 'critical-item',
        current_level: 0.5, // 0.5/10 = 5% => critical
      };
      mockRepository.find.mockResolvedValue([...mockItems, criticalItem]);

      const result = await service.findAll(restaurantId);

      expect(result[0].status).toBe('critical');
      expect(result[result.length - 1].status).toBe('ok');
    });
  });

  describe('getAlerts', () => {
    it('should return only low and critical items', async () => {
      mockRepository.find.mockResolvedValue(mockItems);

      const result = await service.getAlerts(restaurantId);

      // File Mignon (25% = low), Arroz Integral (30% = low), Cerveja IPA (200% = ok, excluded)
      expect(result).toHaveLength(2);
      result.forEach((item) => {
        expect(['low', 'critical']).toContain(item.status);
      });
    });
  });

  describe('getStats', () => {
    it('should return correct counts by status', async () => {
      mockRepository.find.mockResolvedValue(mockItems);

      const stats = await service.getStats(restaurantId);

      expect(stats.total).toBe(3);
      expect(stats.ok).toBe(1);   // Cerveja IPA
      expect(stats.low).toBe(2);  // File Mignon + Arroz Integral
      expect(stats.critical).toBe(0);
    });

    it('should calculate estimated stock value', async () => {
      mockRepository.find.mockResolvedValue(mockItems);

      const stats = await service.getStats(restaurantId);

      // File Mignon: 2.5 * 89.9 = 224.75
      // Cerveja IPA: 48 * 8.5 = 408
      // Arroz Integral: 3 * 6 = 18
      // Total: 650.75
      expect(stats.estimatedStockValue).toBe(650.75);
    });
  });

  describe('findOne', () => {
    it('should return a single item with computed status', async () => {
      mockRepository.findOne.mockResolvedValue(mockItems[0]);

      const result = await service.findOne('item-1');

      expect(result.id).toBe('item-1');
      expect(result.status).toBe('low');
      expect(result.level_pct).toBe(25);
    });

    it('should throw NotFoundException if item not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new inventory item', async () => {
      const dto = {
        restaurant_id: restaurantId,
        name: 'Tomate Cereja',
        category: InventoryCategory.VEGETABLES,
        current_level: 5,
        unit: InventoryUnit.KG,
        min_level: 3,
      };

      const created = {
        ...dto,
        id: 'new-item-uuid',
        is_active: true,
        notes: null,
        last_restocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      const result = await service.create(dto as any);

      expect(result.name).toBe('Tomate Cereja');
      expect(result.status).toBe('ok'); // 5/3 = 166% => ok
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update item configuration', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockItems[0] });
      mockRepository.save.mockImplementation((item) => Promise.resolve(item));

      const result = await service.update('item-1', { name: 'Picanha' });

      expect(result.name).toBe('Picanha');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if item not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLevel', () => {
    it('should update current_level and last_restocked_at', async () => {
      const item = { ...mockItems[0] };
      mockRepository.findOne.mockResolvedValue(item);
      mockRepository.save.mockImplementation((i) => Promise.resolve(i));

      const result = await service.updateLevel('item-1', {
        current_level: 25,
        notes: 'Delivery received',
      });

      expect(result.current_level).toBe(25);
      expect(result.notes).toBe('Delivery received');
      expect(result.last_restocked_at).toBeDefined();
      expect(result.status).toBe('ok'); // 25/10 = 250% => ok
    });

    it('should throw NotFoundException if item not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateLevel('nonexistent', { current_level: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete (set is_active = false)', async () => {
      const item = { ...mockItems[0] };
      mockRepository.findOne.mockResolvedValue(item);
      mockRepository.save.mockImplementation((i) => Promise.resolve(i));

      const result = await service.remove('item-1');

      expect(result.message).toBe('Inventory item deactivated successfully');
      expect(item.is_active).toBe(false);
    });

    it('should throw NotFoundException if item not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
