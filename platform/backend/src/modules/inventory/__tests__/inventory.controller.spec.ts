import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from '../inventory.controller';
import { InventoryService } from '../inventory.service';
import { CreateInventoryItemDto } from '../dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from '../dto/update-inventory-item.dto';
import { UpdateItemLevelDto } from '../dto/update-item-level.dto';
import { InventoryCategory, InventoryUnit } from '../entities/inventory-item.entity';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventoryService = {
    findAll: jest.fn(),
    getAlerts: jest.fn(),
    getStats: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateLevel: jest.fn(),
    remove: jest.fn(),
  };

  const mockItemResponse = {
    id: 'item-1',
    restaurant_id: 'restaurant-1',
    name: 'File Mignon',
    category: 'meats',
    current_level: 2.5,
    unit: 'kg',
    min_level: 10,
    max_level: 30,
    unit_cost: 89.9,
    supplier: 'Frigor',
    is_active: true,
    notes: null,
    last_restocked_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    status: 'low',
    level_pct: 25,
  };

  const mockStats = {
    total: 10,
    ok: 5,
    low: 3,
    critical: 2,
    estimatedStockValue: 1500.0,
  };

  const mockUser = mockAuthenticatedUser({ id: 'user-1', roles: ['manager'] });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return inventory items', async () => {
      const items = [mockItemResponse];
      mockInventoryService.findAll.mockResolvedValue(items);

      const result = await controller.findAll('restaurant-1');

      expect(result).toEqual(items);
      expect(mockInventoryService.findAll).toHaveBeenCalledWith(
        'restaurant-1',
        undefined,
        undefined,
      );
    });

    it('should pass category and status filters', async () => {
      mockInventoryService.findAll.mockResolvedValue([]);

      await controller.findAll('restaurant-1', 'meats', 'critical');

      expect(mockInventoryService.findAll).toHaveBeenCalledWith(
        'restaurant-1',
        'meats',
        'critical',
      );
    });
  });

  describe('getAlerts', () => {
    it('should return alert items', async () => {
      const alerts = [mockItemResponse];
      mockInventoryService.getAlerts.mockResolvedValue(alerts);

      const result = await controller.getAlerts('restaurant-1');

      expect(result).toEqual(alerts);
      expect(mockInventoryService.getAlerts).toHaveBeenCalledWith('restaurant-1');
    });
  });

  describe('getStats', () => {
    it('should return inventory stats', async () => {
      mockInventoryService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats('restaurant-1');

      expect(result).toEqual(mockStats);
      expect(mockInventoryService.getStats).toHaveBeenCalledWith('restaurant-1');
    });
  });

  describe('findOne', () => {
    it('should return a single item', async () => {
      mockInventoryService.findOne.mockResolvedValue(mockItemResponse);

      const result = await controller.findOne('item-1');

      expect(result).toEqual(mockItemResponse);
      expect(mockInventoryService.findOne).toHaveBeenCalledWith('item-1');
    });
  });

  describe('create', () => {
    it('should create an inventory item', async () => {
      const dto: CreateInventoryItemDto = {
        restaurant_id: 'restaurant-1',
        name: 'Tomate',
        category: InventoryCategory.VEGETABLES,
        current_level: 5,
        unit: InventoryUnit.KG,
        min_level: 3,
      };

      mockInventoryService.create.mockResolvedValue({
        ...mockItemResponse,
        name: 'Tomate',
      });

      const result = await controller.create(dto);

      expect(result.name).toBe('Tomate');
      expect(mockInventoryService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update an inventory item', async () => {
      const dto: UpdateInventoryItemDto = { name: 'Picanha' };
      const updated = { ...mockItemResponse, name: 'Picanha' };
      mockInventoryService.update.mockResolvedValue(updated);

      const result = await controller.update('item-1', dto);

      expect(result.name).toBe('Picanha');
      expect(mockInventoryService.update).toHaveBeenCalledWith('item-1', dto);
    });
  });

  describe('updateLevel', () => {
    it('should update item level', async () => {
      const dto: UpdateItemLevelDto = {
        current_level: 25,
        notes: 'Delivery received',
      };
      const updated = {
        ...mockItemResponse,
        current_level: 25,
        status: 'ok',
        level_pct: 250,
      };
      mockInventoryService.updateLevel.mockResolvedValue(updated);

      const result = await controller.updateLevel('item-1', dto, mockUser);

      expect(result.current_level).toBe(25);
      expect(mockInventoryService.updateLevel).toHaveBeenCalledWith('item-1', dto);
    });
  });

  describe('remove', () => {
    it('should soft delete an inventory item', async () => {
      const response = { message: 'Inventory item deactivated successfully' };
      mockInventoryService.remove.mockResolvedValue(response);

      const result = await controller.remove('item-1');

      expect(result).toEqual(response);
      expect(mockInventoryService.remove).toHaveBeenCalledWith('item-1');
    });
  });
});
