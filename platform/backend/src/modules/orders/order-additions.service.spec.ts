import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderAdditionsService } from './order-additions.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { EventsGateway } from '@/modules/events/events.realtime';
import { OrderCalculatorHelper } from './helpers';
import { OrdersService } from './orders.service';
import { OrderStatus, UserRole as UserRoleEnum } from '@common/enums';

describe('OrderAdditionsService', () => {
  let service: OrderAdditionsService;

  const mockOrderRepository = { findOne: jest.fn(), save: jest.fn() };
  const mockOrderItemRepository = { create: jest.fn() };
  const mockMenuItemRepository = { find: jest.fn() };
  const mockEventsGateway = { notifyOrderUpdate: jest.fn() };
  const mockOrderCalculator = {
    calculateTotals: jest.fn().mockReturnValue({ taxAmount: 12, totalAmount: 132 }),
    getStatusMessage: jest.fn().mockReturnValue('Order opened for additions'),
  };
  const mockOrdersService = { findOne: jest.fn() };
  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: { save: jest.fn() },
  };
  const mockDataSource = { createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner) };

  const mockOrder = {
    id: 'order-001',
    user_id: 'user-1',
    status: OrderStatus.CONFIRMED,
    subtotal: 100,
    tax_amount: 10,
    tip_amount: 0,
    total_amount: 110,
    items: [],
    restaurant_id: 'restaurant-1',
  };

  const mockMenuItem = {
    id: 'menu-item-1',
    name: 'Sashimi',
    price: '60',
    is_available: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderAdditionsService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemRepository },
        { provide: getRepositoryToken(MenuItem), useValue: mockMenuItemRepository },
        { provide: EventsGateway, useValue: mockEventsGateway },
        { provide: DataSource, useValue: mockDataSource },
        { provide: OrderCalculatorHelper, useValue: mockOrderCalculator },
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    }).compile();

    service = module.get<OrderAdditionsService>(OrderAdditionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── openOrderForAdditions ───────────────────────────────────────────────

  describe('openOrderForAdditions', () => {
    it('should open a CONFIRMED order for additions', async () => {
      const order = { ...mockOrder, status: OrderStatus.CONFIRMED };
      mockOrdersService.findOne.mockResolvedValue(order);
      mockOrderRepository.save.mockResolvedValue({ ...order, status: OrderStatus.OPEN_FOR_ADDITIONS });

      const result = await service.openOrderForAdditions('order-001');

      expect(result.status).toBe(OrderStatus.OPEN_FOR_ADDITIONS);
      expect(mockEventsGateway.notifyOrderUpdate).toHaveBeenCalledWith(
        'order-001',
        expect.objectContaining({ status: OrderStatus.OPEN_FOR_ADDITIONS }),
      );
    });

    it('should open a PENDING order for additions', async () => {
      const order = { ...mockOrder, status: OrderStatus.PENDING };
      mockOrdersService.findOne.mockResolvedValue(order);
      mockOrderRepository.save.mockResolvedValue({ ...order, status: OrderStatus.OPEN_FOR_ADDITIONS });

      const result = await service.openOrderForAdditions('order-001');

      expect(result.status).toBe(OrderStatus.OPEN_FOR_ADDITIONS);
    });

    it('should throw BadRequestException for non-openable statuses', async () => {
      const order = { ...mockOrder, status: OrderStatus.COMPLETED };
      mockOrdersService.findOne.mockResolvedValue(order);

      await expect(service.openOrderForAdditions('order-001')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for CANCELLED orders', async () => {
      const order = { ...mockOrder, status: OrderStatus.CANCELLED };
      mockOrdersService.findOne.mockResolvedValue(order);

      await expect(service.openOrderForAdditions('order-001')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── addItemsToExistingOrder ─────────────────────────────────────────────

  describe('addItemsToExistingOrder', () => {
    const addItemsDto = {
      items: [{ menu_item_id: 'menu-item-1', quantity: 2, customizations: null, special_instructions: null }],
    };

    beforeEach(() => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder, status: OrderStatus.OPEN_FOR_ADDITIONS });
      mockMenuItemRepository.find.mockResolvedValue([mockMenuItem]);
      mockOrderItemRepository.create.mockImplementation((dto) => ({ ...dto, id: 'oi-new' }));
      mockQueryRunner.manager.save.mockResolvedValue({ ...mockOrder, total_amount: 232 });
      mockOrdersService.findOne.mockResolvedValue({ ...mockOrder, total_amount: 232 });
    });

    it('should add items to an open order', async () => {
      const result = await service.addItemsToExistingOrder(
        'order-001',
        addItemsDto as any,
        'user-1',
      );

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockOrdersService.findOne).toHaveBeenCalledWith('order-001');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException for unknown order', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addItemsToExistingOrder('bad-id', addItemsDto as any, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when non-staff tries to add to another user order', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder, user_id: 'other-user' });

      await expect(
        service.addItemsToExistingOrder('order-001', addItemsDto as any, 'user-1', [
          UserRoleEnum.CUSTOMER,
        ]),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow staff (waiter) to add to any order', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder, user_id: 'other-user', status: OrderStatus.OPEN_FOR_ADDITIONS });

      const result = await service.addItemsToExistingOrder('order-001', addItemsDto as any, 'waiter-1', [
        UserRoleEnum.WAITER,
      ]);

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when order status does not allow additions', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder, status: OrderStatus.COMPLETED });

      await expect(
        service.addItemsToExistingOrder('order-001', addItemsDto as any, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when menu item does not exist', async () => {
      mockMenuItemRepository.find.mockResolvedValue([]);

      await expect(
        service.addItemsToExistingOrder('order-001', addItemsDto as any, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when menu item is unavailable', async () => {
      mockMenuItemRepository.find.mockResolvedValue([{ ...mockMenuItem, is_available: false }]);

      await expect(
        service.addItemsToExistingOrder('order-001', addItemsDto as any, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should rollback transaction on failure and rethrow', async () => {
      mockMenuItemRepository.find.mockRejectedValue(new Error('DB error'));

      await expect(
        service.addItemsToExistingOrder('order-001', addItemsDto as any, 'user-1'),
      ).rejects.toThrow();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
