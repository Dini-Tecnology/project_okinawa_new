import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsAggregationService } from './analytics-aggregation.service';
import {
  MetricsCalculatorHelper,
  SalesAggregatorHelper,
  CustomerAnalyticsHelper,
} from './helpers';
import { Order } from '@/modules/orders/entities/order.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';

describe('AnalyticsAggregationService', () => {
  let service: AnalyticsAggregationService;
  let orderRepository: Repository<Order>;
  let loyaltyRepository: Repository<LoyaltyProgram>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsAggregationService,
        MetricsCalculatorHelper,
        SalesAggregatorHelper,
        CustomerAnalyticsHelper,
        {
          provide: getRepositoryToken(Order),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(LoyaltyProgram),
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AnalyticsAggregationService>(AnalyticsAggregationService);
    orderRepository = module.get(getRepositoryToken(Order));
    loyaltyRepository = module.get(getRepositoryToken(LoyaltyProgram));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSalesAnalytics', () => {
    it('should return sales analytics for a period', async () => {
      const mockOrders = [
        {
          id: 'order-1', total_amount: 100,
          created_at: new Date('2024-01-15T10:00:00'),
          items: [
            { menu_item_id: 'item-1', quantity: 2, unit_price: 25 },
            { menu_item_id: 'item-2', quantity: 1, unit_price: 50 },
          ],
        },
        {
          id: 'order-2', total_amount: 150,
          created_at: new Date('2024-01-15T14:00:00'),
          items: [
            { menu_item_id: 'item-1', quantity: 3, unit_price: 25 },
            { menu_item_id: 'item-3', quantity: 1, unit_price: 75 },
          ],
        },
      ];

      jest.spyOn(orderRepository, 'find').mockResolvedValue(mockOrders as any);

      const result = await service.getSalesAnalytics(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result.total_revenue).toBe(250);
      expect(result.total_orders).toBe(2);
      expect(result.average_order_value).toBe(125);
      expect(result.top_selling_items).toBeDefined();
      expect(result.sales_by_day).toBeDefined();
      expect(result.sales_by_hour).toBeDefined();
      expect(result.peak_hours).toBeDefined();
    });

    it('should handle empty orders', async () => {
      jest.spyOn(orderRepository, 'find').mockResolvedValue([]);

      const result = await service.getSalesAnalytics(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result.total_revenue).toBe(0);
      expect(result.total_orders).toBe(0);
      expect(result.average_order_value).toBe(0);
    });

    it('should include period dates in the result', async () => {
      jest.spyOn(orderRepository, 'find').mockResolvedValue([]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await service.getSalesAnalytics('restaurant-1', startDate, endDate);

      expect(result.period.start_date).toBe(startDate);
      expect(result.period.end_date).toBe(endDate);
    });
  });

  describe('getCustomerAnalytics', () => {
    it('should return customer analytics', async () => {
      const mockOrders = [
        { user_id: 'user-1', total_amount: 100 },
        { user_id: 'user-2', total_amount: 150 },
        { user_id: 'user-1', total_amount: 75 },
      ];

      const mockLoyaltyPrograms = [
        { tier: 'gold', user_id: 'user-1', restaurant_id: 'restaurant-1' },
        { tier: 'silver', user_id: 'user-2', restaurant_id: 'restaurant-1' },
      ];

      jest.spyOn(orderRepository, 'find').mockResolvedValue(mockOrders as any);
      jest.spyOn(loyaltyRepository, 'find').mockResolvedValue(mockLoyaltyPrograms as any);

      const result = await service.getCustomerAnalytics(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result.total_customers).toBe(2);
      expect(result.loyalty_members).toBe(2);
      expect(result.returning_customers).toBe(1); // user-1 has 2 orders
      expect(result.new_customers).toBe(1); // user-2 has 1 order
    });

    it('should handle no customers', async () => {
      jest.spyOn(orderRepository, 'find').mockResolvedValue([]);
      jest.spyOn(loyaltyRepository, 'find').mockResolvedValue([]);

      const result = await service.getCustomerAnalytics(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result.total_customers).toBe(0);
      expect(result.loyalty_members).toBe(0);
    });

    it('should include loyalty distribution', async () => {
      jest.spyOn(orderRepository, 'find').mockResolvedValue([
        { user_id: 'user-1', total_amount: 100 },
      ] as any);
      jest.spyOn(loyaltyRepository, 'find').mockResolvedValue([
        { tier: 'gold', user_id: 'user-1', restaurant_id: 'r1' },
      ] as any);

      const result = await service.getCustomerAnalytics(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result.loyalty_distribution).toBeDefined();
      expect(Array.isArray(result.loyalty_distribution)).toBe(true);
    });
  });
});
