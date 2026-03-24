import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsAggregationService } from './analytics-aggregation.service';
import {
  MetricsCalculatorHelper,
  SalesAggregatorHelper,
  CustomerAnalyticsHelper,
  PerformanceMetricsHelper,
} from './helpers';
import { Order } from '@/modules/orders/entities/order.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Review } from '@/modules/reviews/entities/review.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';
import { Tip } from '@/modules/tips/entities/tip.entity';
import { Attendance } from '@/modules/hr/entities/attendance.entity';

describe('AnalyticsAggregationService', () => {
  let service: AnalyticsAggregationService;
  let orderRepository: Repository<Order>;
  let reservationRepository: Repository<Reservation>;
  let reviewRepository: Repository<Review>;
  let loyaltyRepository: Repository<LoyaltyProgram>;
  let tipRepository: Repository<Tip>;
  let attendanceRepository: Repository<Attendance>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsAggregationService,
        MetricsCalculatorHelper,
        SalesAggregatorHelper,
        CustomerAnalyticsHelper,
        PerformanceMetricsHelper,
        {
          provide: getRepositoryToken(Order),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(LoyaltyProgram),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Tip),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Attendance),
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AnalyticsAggregationService>(AnalyticsAggregationService);
    orderRepository = module.get(getRepositoryToken(Order));
    reservationRepository = module.get(getRepositoryToken(Reservation));
    reviewRepository = module.get(getRepositoryToken(Review));
    loyaltyRepository = module.get(getRepositoryToken(LoyaltyProgram));
    tipRepository = module.get(getRepositoryToken(Tip));
    attendanceRepository = module.get(getRepositoryToken(Attendance));
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

  describe('getRestaurantPerformance', () => {
    it('should return restaurant performance metrics', async () => {
      jest.spyOn(reviewRepository, 'find').mockResolvedValue([
        { rating: 5, comment: 'Great!' },
        { rating: 4, comment: 'Good' },
      ] as any);
      jest.spyOn(reservationRepository, 'find').mockResolvedValue([
        { id: 'res-1', status: 'completed' },
        { id: 'res-2', status: 'no_show' },
        { id: 'res-3', status: 'completed' },
      ] as any);
      jest.spyOn(tipRepository, 'find').mockResolvedValue([
        { staff_id: 'staff-1', amount: 10 },
        { staff_id: 'staff-1', amount: 15 },
        { staff_id: 'staff-2', amount: 20 },
      ] as any);
      jest.spyOn(attendanceRepository, 'find').mockResolvedValue([
        { status: 'present' },
        { status: 'late' },
        { status: 'absent' },
      ] as any);

      const result = await service.getRestaurantPerformance('restaurant-1');

      expect(result.overall_rating).toBeDefined();
      expect(result.total_reviews).toBe(2);
      expect(result.rating_distribution).toBeDefined();
      expect(result.reservation_no_show_rate).toBeDefined();
      expect(result.staff_efficiency.average_tips_per_staff).toBeDefined();
      expect(result.staff_efficiency.attendance_rate).toBeDefined();
    });

    it('should handle no reviews gracefully', async () => {
      jest.spyOn(reviewRepository, 'find').mockResolvedValue([]);
      jest.spyOn(reservationRepository, 'find').mockResolvedValue([]);
      jest.spyOn(tipRepository, 'find').mockResolvedValue([]);
      jest.spyOn(attendanceRepository, 'find').mockResolvedValue([]);

      const result = await service.getRestaurantPerformance('restaurant-1');

      expect(result.overall_rating).toBe(0);
      expect(result.total_reviews).toBe(0);
      expect(result.reservation_no_show_rate).toBe(0);
    });

    it('should calculate no-show rate correctly', async () => {
      jest.spyOn(reviewRepository, 'find').mockResolvedValue([]);
      jest.spyOn(reservationRepository, 'find').mockResolvedValue([
        { id: 'r1', status: 'completed' },
        { id: 'r2', status: 'no_show' },
      ] as any);
      jest.spyOn(tipRepository, 'find').mockResolvedValue([]);
      jest.spyOn(attendanceRepository, 'find').mockResolvedValue([]);

      const result = await service.getRestaurantPerformance('restaurant-1');

      expect(result.reservation_no_show_rate).toBe(50);
    });
  });
});
