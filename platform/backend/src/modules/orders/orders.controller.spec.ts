import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetKdsOrdersDto } from './dto/get-kds-orders.dto';
import { GetWaiterStatsDto } from './dto/get-waiter-stats.dto';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    findByRestaurant: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    getKdsOrders: jest.fn(),
    getWaiterTables: jest.fn(),
    getWaiterStats: jest.fn(),
    getMaitreOverview: jest.fn(),
  };

  const mockOrder = {
    id: 'order-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    subtotal: 100,
    total_amount: 110,
    status: 'pending',
    items: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const createDto: CreateOrderDto = {
        restaurant_id: 'restaurant-1',
        items: [{ menu_item_id: 'item-1', quantity: 2 }],
      } as any;

      mockOrdersService.create.mockResolvedValue(mockOrder);

      const result = await controller.create(user, createDto);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.create).toHaveBeenCalledWith('user-1', createDto);
    });
  });

  describe('findByRestaurant', () => {
    it('should get orders by restaurant', async () => {
      const restaurantId = 'restaurant-1';
      const orders = [mockOrder];
      const pagination = { page: 1, limit: 10 };

      mockOrdersService.findByRestaurant.mockResolvedValue(orders);

      const result = await controller.findByRestaurant(restaurantId, pagination as any);

      expect(result).toEqual(orders);
      expect(mockOrdersService.findByRestaurant).toHaveBeenCalledWith(restaurantId, pagination);
    });
  });

  describe('findByUser', () => {
    it('should get orders by current user', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const orders = [mockOrder];
      const pagination = { page: 1, limit: 10 };

      mockOrdersService.findByUser.mockResolvedValue(orders);

      const result = await controller.findByUser(user, pagination as any);

      expect(result).toEqual(orders);
      expect(mockOrdersService.findByUser).toHaveBeenCalledWith('user-1', pagination);
    });
  });

  describe('findOne', () => {
    it('should get order by id', async () => {
      mockOrdersService.findOne.mockResolvedValue(mockOrder);
      const mockUser = mockAuthenticatedUser({ id: 'user-1', roles: ['customer'] });

      const result = await controller.findOne('order-1', mockUser);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith('order-1', 'user-1', ['customer']);
    });
  });

  describe('update', () => {
    it('should update order', async () => {
      const updateDto: UpdateOrderDto = {
        special_instructions: 'No onions',
      };
      const mockUser = mockAuthenticatedUser({ id: 'user-1', roles: ['customer'] });

      const updatedOrder = { ...mockOrder, special_instructions: 'No onions' };
      mockOrdersService.update.mockResolvedValue(updatedOrder);

      const result = await controller.update('order-1', updateDto, mockUser);

      expect(result).toEqual(updatedOrder);
      expect(mockOrdersService.update).toHaveBeenCalledWith('order-1', updateDto, 'user-1', ['customer']);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const statusDto: UpdateOrderStatusDto = {
        status: 'confirmed',
      } as any;

      const updatedOrder = { ...mockOrder, status: 'confirmed' };
      mockOrdersService.updateStatus.mockResolvedValue(updatedOrder);

      const result = await controller.updateStatus('order-1', statusDto);

      expect(result).toEqual(updatedOrder);
      expect(mockOrdersService.updateStatus).toHaveBeenCalledWith('order-1', statusDto);
    });
  });

  describe('KDS endpoints', () => {
    describe('getKitchenOrders', () => {
      it('should get kitchen KDS orders', async () => {
        const query: GetKdsOrdersDto = {
          restaurant_id: 'restaurant-1',
        };

        const kdsOrders = [mockOrder];
        mockOrdersService.getKdsOrders.mockResolvedValue(kdsOrders);

        const result = await controller.getKitchenOrders(query);

        expect(result).toEqual(kdsOrders);
        expect(mockOrdersService.getKdsOrders).toHaveBeenCalledWith({
          ...query,
          type: 'kitchen',
        });
      });
    });

    describe('getBarOrders', () => {
      it('should get bar KDS orders', async () => {
        const query: GetKdsOrdersDto = {
          restaurant_id: 'restaurant-1',
        };

        const kdsOrders = [mockOrder];
        mockOrdersService.getKdsOrders.mockResolvedValue(kdsOrders);

        const result = await controller.getBarOrders(query);

        expect(result).toEqual(kdsOrders);
        expect(mockOrdersService.getKdsOrders).toHaveBeenCalledWith({
          ...query,
          type: 'bar',
        });
      });
    });
  });

  describe('Waiter endpoints', () => {
    describe('getWaiterTables', () => {
      it('should get waiter assigned tables with orders', async () => {
        const user = mockAuthenticatedUser({ id: 'waiter-1' });
        const tables = [
          {
            id: 'table-1',
            number: '5',
            orders: [mockOrder],
          },
        ];

        mockOrdersService.getWaiterTables.mockResolvedValue(tables);

        const result = await controller.getWaiterTables(user);

        expect(result).toEqual(tables);
        expect(mockOrdersService.getWaiterTables).toHaveBeenCalledWith('waiter-1');
      });
    });

    describe('getWaiterStats', () => {
      it('should get waiter statistics', async () => {
        const user = mockAuthenticatedUser({ id: 'waiter-1' });
        const query: GetWaiterStatsDto = {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        };

        const stats = {
          total_sales: 5000,
          total_tips: 500,
          total_tables: 25,
          average_ticket: 200,
        };

        mockOrdersService.getWaiterStats.mockResolvedValue(stats);

        const result = await controller.getWaiterStats(user, query);

        expect(result).toEqual(stats);
        expect(mockOrdersService.getWaiterStats).toHaveBeenCalledWith('waiter-1', query);
      });
    });
  });

  describe('Maitre endpoints', () => {
    describe('getMaitreOverview', () => {
      it('should get maitre dashboard overview', async () => {
        const overview = {
          active_orders: 15,
          pending_orders: 5,
          completed_today: 50,
          total_revenue_today: 10000,
        };

        mockOrdersService.getMaitreOverview.mockResolvedValue(overview);

        const result = await controller.getMaitreOverview('restaurant-1');

        expect(result).toEqual(overview);
        expect(mockOrdersService.getMaitreOverview).toHaveBeenCalledWith('restaurant-1');
      });
    });
  });
});
