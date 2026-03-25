import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { EventsGateway } from '@/modules/events/events.gateway';
import { LoyaltyService } from '@/modules/loyalty/loyalty.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus, OrderType } from '@common/enums';
import { OrderCalculatorHelper } from './helpers';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;
  let menuItemRepository: Repository<MenuItem>;
  let tableRepository: Repository<RestaurantTable>;
  let profileRepository: Repository<Profile>;
  let eventsGateway: EventsGateway;
  let loyaltyService: LoyaltyService;

  const mockOrder = {
    id: 'order-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    status: OrderStatus.PENDING,
    subtotal: 100,
    tax_amount: 10,
    tip_amount: 15,
    total_amount: 125,
    waiter_id: 'waiter-1',
    party_size: 2,
    created_at: new Date(),
    table: { id: 'table-1', table_number: '1', seats: 4 },
    guests: [],
    items: [
      {
        id: 'item-1',
        menu_item_id: 'item-1',
        quantity: 2,
        menu_item: { id: 'item-1', name: 'Test Dish', category: 'main' },
        special_instructions: null,
        customizations: null,
      },
    ],
  };

  const mockMenuItem = {
    id: 'item-1',
    name: 'Test Item',
    price: '25.00',
    is_available: true,
    restaurant_id: 'restaurant-1',
  };

  const mockTable = {
    id: 'table-1',
    table_number: '1',
    seats: 4,
    status: 'occupied',
    assigned_waiter_id: 'waiter-1',
  };

  const mockProfile = {
    id: 'waiter-1',
    full_name: 'Test Waiter',
  };

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[mockOrder], 1]),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockOrder]),
      getOne: jest.fn().mockResolvedValue(null),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getRawOne: jest.fn().mockResolvedValue({}),
      getRawMany: jest.fn().mockResolvedValue([]),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    })),
  };

  const mockOrderItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockMenuItemRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getRawOne: jest.fn().mockResolvedValue({}),
      getRawMany: jest.fn().mockResolvedValue([]),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    }),
  };

  const mockTableRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const mockProfileRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getRawOne: jest.fn().mockResolvedValue({}),
      getRawMany: jest.fn().mockResolvedValue([]),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    }),
  };

  const mockEventsGateway = {
    notifyNewOrder: jest.fn(),
    notifyOrderStatusChange: jest.fn(),
    notifyOrderUpdate: jest.fn(),
  };

  const mockLoyaltyService = {
    addPointsForOrder: jest.fn(),
    awardPointsFromOrder: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve({ ...entity, id: 'order-1' })),
    },
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb({
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      }),
    })),
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useValue: mockMenuItemRepository,
        },
        {
          provide: getRepositoryToken(RestaurantTable),
          useValue: mockTableRepository,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
        {
          provide: LoyaltyService,
          useValue: mockLoyaltyService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        OrderCalculatorHelper,
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order));
    orderItemRepository = module.get(getRepositoryToken(OrderItem));
    menuItemRepository = module.get(getRepositoryToken(MenuItem));
    tableRepository = module.get(getRepositoryToken(RestaurantTable));
    profileRepository = module.get(getRepositoryToken(Profile));
    eventsGateway = module.get(EventsGateway);
    loyaltyService = module.get(LoyaltyService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const createOrderDto = {
        restaurant_id: 'restaurant-1',
        order_type: OrderType.DINE_IN,
        items: [
          {
            menu_item_id: 'item-1',
            quantity: 2,
          },
        ],
      };

      mockMenuItemRepository.find.mockResolvedValue([mockMenuItem]);
      mockOrderItemRepository.create.mockReturnValue({
        menu_item_id: 'item-1',
        quantity: 2,
        unit_price: 25,
        total_price: 50,
      });
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockEventsGateway.notifyNewOrder.mockResolvedValue(undefined);

      const result = await service.create('user-1', createOrderDto);

      expect(result).toBeDefined();
      expect(mockMenuItemRepository.find).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(mockEventsGateway.notifyNewOrder).toHaveBeenCalled();
    });

    it('should throw NotFoundException if menu item not found', async () => {
      const createOrderDto = {
        restaurant_id: 'restaurant-1',
        order_type: OrderType.DINE_IN,
        items: [
          {
            menu_item_id: 'nonexistent-item',
            quantity: 1,
          },
        ],
      };

      mockMenuItemRepository.find.mockResolvedValue([]);

      await expect(service.create('user-1', createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if menu item is not available', async () => {
      const createOrderDto = {
        restaurant_id: 'restaurant-1',
        order_type: OrderType.DINE_IN,
        items: [
          {
            menu_item_id: 'item-1',
            quantity: 1,
          },
        ],
      };

      const unavailableItem = {
        ...mockMenuItem,
        is_available: false,
      };

      mockMenuItemRepository.find.mockResolvedValue([unavailableItem]);

      await expect(service.create('user-1', createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne('order-1');

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        relations: expect.any(Array),
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      const updateDto = {
        status: OrderStatus.CONFIRMED,
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });
      mockEventsGateway.notifyOrderUpdate.mockResolvedValue(undefined);

      const result = await service.updateStatus('order-1', updateDto);

      expect(result.status).toBe(OrderStatus.CONFIRMED);
      expect(mockEventsGateway.notifyOrderUpdate).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('nonexistent', { status: OrderStatus.CONFIRMED }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByRestaurant', () => {
    it('should return orders for a restaurant', async () => {
      mockOrderRepository.findAndCount.mockResolvedValue([[mockOrder], 1]);

      const result = await service.findByRestaurant('restaurant-1');

      expect(result.items).toEqual([mockOrder]);
      expect(result.meta.total).toBe(1);
      expect(mockOrderRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return orders for a user', async () => {
      mockOrderRepository.findAndCount.mockResolvedValue([[mockOrder], 1]);

      const result = await service.findByUser('user-1');

      expect(result.items).toEqual([mockOrder]);
      expect(result.meta.total).toBe(1);
      expect(mockOrderRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update order successfully', async () => {
      const updateDto = {
        special_instructions: 'No onions',
        table_id: 'table-2',
      };

      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder, items: [] });
      mockOrderRepository.save.mockResolvedValue({
        ...mockOrder,
        special_instructions: 'No onions',
        table_id: 'table-2',
      });

      const result = await service.update('order-1', updateDto);

      expect(result).toBeDefined();
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { special_instructions: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update status and timestamps when status is READY', async () => {
      const updateDto = {
        status: OrderStatus.READY,
      };

      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder, items: [] });
      mockOrderRepository.save.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.READY,
        actual_ready_at: expect.any(Date),
      });
      mockEventsGateway.notifyOrderUpdate.mockResolvedValue(undefined);

      const result = await service.update('order-1', updateDto);

      expect(result.status).toBe(OrderStatus.READY);
      expect(mockEventsGateway.notifyOrderUpdate).toHaveBeenCalled();
    });
  });

});
