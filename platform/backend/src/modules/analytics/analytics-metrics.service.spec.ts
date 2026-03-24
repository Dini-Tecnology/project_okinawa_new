import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsMetricsService } from './analytics-metrics.service';
import { MetricsCalculatorHelper } from './helpers';
import { Order } from '@/modules/orders/entities/order.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';
import { Attendance } from '@/modules/hr/entities/attendance.entity';

describe('AnalyticsMetricsService', () => {
  let service: AnalyticsMetricsService;
  let orderRepository: Repository<Order>;
  let reservationRepository: Repository<Reservation>;
  let tableRepository: Repository<RestaurantTable>;
  let attendanceRepository: Repository<Attendance>;

  const mockQueryBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsMetricsService,
        MetricsCalculatorHelper,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder()),
          },
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder()),
          },
        },
        {
          provide: getRepositoryToken(RestaurantTable),
          useValue: { count: jest.fn() },
        },
        {
          provide: getRepositoryToken(Attendance),
          useValue: { count: jest.fn(), find: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AnalyticsMetricsService>(AnalyticsMetricsService);
    orderRepository = module.get(getRepositoryToken(Order));
    reservationRepository = module.get(getRepositoryToken(Reservation));
    tableRepository = module.get(getRepositoryToken(RestaurantTable));
    attendanceRepository = module.get(getRepositoryToken(Attendance));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics with today, week, month, and comparisons', async () => {
      const ordersQB = mockQueryBuilder();
      ordersQB.getRawOne.mockResolvedValue({
        today_revenue: 500,
        today_orders: 10,
        week_revenue: 3500,
        week_orders: 70,
        last_week_revenue: 3200,
        last_week_orders: 65,
        month_revenue: 15000,
        month_orders: 300,
        last_month_revenue: 14000,
        last_month_orders: 280,
      });
      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(ordersQB as any);

      const reservationsQB = mockQueryBuilder();
      reservationsQB.getRawOne.mockResolvedValue({
        today_reservations: 5,
        week_reservations: 35,
        month_reservations: 150,
      });
      jest.spyOn(reservationRepository, 'createQueryBuilder').mockReturnValue(reservationsQB as any);

      const result = await service.getDashboardMetrics('restaurant-1');

      expect(result).toBeDefined();
      expect(result.today).toBeDefined();
      expect(result.today.revenue).toBe(500);
      expect(result.today.orders).toBe(10);
      expect(result.week).toBeDefined();
      expect(result.month).toBeDefined();
      expect(result.comparisons).toBeDefined();
    });

    it('should handle zero values gracefully', async () => {
      const ordersQB = mockQueryBuilder();
      ordersQB.getRawOne.mockResolvedValue({
        today_revenue: 0, today_orders: 0,
        week_revenue: 0, week_orders: 0,
        last_week_revenue: 0, last_week_orders: 0,
        month_revenue: 0, month_orders: 0,
        last_month_revenue: 0, last_month_orders: 0,
      });
      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(ordersQB as any);

      const reservationsQB = mockQueryBuilder();
      reservationsQB.getRawOne.mockResolvedValue({
        today_reservations: 0, week_reservations: 0, month_reservations: 0,
      });
      jest.spyOn(reservationRepository, 'createQueryBuilder').mockReturnValue(reservationsQB as any);

      const result = await service.getDashboardMetrics('restaurant-1');

      expect(result.today.revenue).toBe(0);
      expect(result.today.average_order_value).toBe(0);
      expect(result.comparisons.revenue_vs_last_week).toBe(0);
    });

    it('should handle null metrics from database', async () => {
      const ordersQB = mockQueryBuilder();
      ordersQB.getRawOne.mockResolvedValue({
        today_revenue: null, today_orders: null,
        week_revenue: null, week_orders: null,
        last_week_revenue: null, last_week_orders: null,
        month_revenue: null, month_orders: null,
        last_month_revenue: null, last_month_orders: null,
      });
      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(ordersQB as any);

      const reservationsQB = mockQueryBuilder();
      reservationsQB.getRawOne.mockResolvedValue({
        today_reservations: null, week_reservations: null, month_reservations: null,
      });
      jest.spyOn(reservationRepository, 'createQueryBuilder').mockReturnValue(reservationsQB as any);

      const result = await service.getDashboardMetrics('restaurant-1');

      expect(result.today.revenue).toBe(0);
      expect(result.today.orders).toBe(0);
    });
  });

  describe('getRealTimeMetrics', () => {
    it('should return real-time metrics', async () => {
      jest.spyOn(orderRepository, 'count').mockResolvedValue(10);
      jest.spyOn(reservationRepository, 'count').mockResolvedValue(5);
      jest.spyOn(tableRepository, 'count').mockResolvedValue(15);
      jest.spyOn(attendanceRepository, 'count').mockResolvedValue(8);
      jest.spyOn(orderRepository, 'find').mockResolvedValue([
        { total_amount: 50 },
        { total_amount: 75 },
      ] as any);

      const result = await service.getRealTimeMetrics('restaurant-1');

      expect(result.active_orders).toBe(10);
      expect(result.active_reservations).toBe(5);
      expect(result.occupied_tables).toBe(15);
      expect(result.staff_on_duty).toBe(8);
      expect(result.revenue_last_hour).toBe(125);
    });

    it('should return zero revenue when no recent orders exist', async () => {
      jest.spyOn(orderRepository, 'count').mockResolvedValue(0);
      jest.spyOn(reservationRepository, 'count').mockResolvedValue(0);
      jest.spyOn(tableRepository, 'count').mockResolvedValue(0);
      jest.spyOn(attendanceRepository, 'count').mockResolvedValue(0);
      jest.spyOn(orderRepository, 'find').mockResolvedValue([]);

      const result = await service.getRealTimeMetrics('restaurant-1');

      expect(result.revenue_last_hour).toBe(0);
      expect(result.active_orders).toBe(0);
    });

    it('should calculate revenue_last_hour from recent orders', async () => {
      jest.spyOn(orderRepository, 'count').mockResolvedValue(3);
      jest.spyOn(reservationRepository, 'count').mockResolvedValue(0);
      jest.spyOn(tableRepository, 'count').mockResolvedValue(0);
      jest.spyOn(attendanceRepository, 'count').mockResolvedValue(0);
      jest.spyOn(orderRepository, 'find').mockResolvedValue([
        { total_amount: 100 },
        { total_amount: 200 },
        { total_amount: 300 },
      ] as any);

      const result = await service.getRealTimeMetrics('restaurant-1');

      expect(result.revenue_last_hour).toBe(600);
    });
  });
});
