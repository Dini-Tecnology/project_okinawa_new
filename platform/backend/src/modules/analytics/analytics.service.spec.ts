import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { AnalyticsMetricsService } from './analytics-metrics.service';
import { AnalyticsAggregationService } from './analytics-aggregation.service';
import { AnalyticsForecastService } from './analytics-forecast.service';

describe('AnalyticsService (facade)', () => {
  let service: AnalyticsService;
  let metricsService: AnalyticsMetricsService;
  let aggregationService: AnalyticsAggregationService;
  let forecastService: AnalyticsForecastService;

  const mockDashboard = {
    today: { revenue: 500, orders: 10, reservations: 5, average_order_value: 50 },
    week: { revenue: 3500, orders: 70, reservations: 35, average_order_value: 50 },
    month: { revenue: 15000, orders: 300, reservations: 150, average_order_value: 50 },
    comparisons: {
      revenue_vs_last_week: 9.38,
      orders_vs_last_week: 7.69,
      revenue_vs_last_month: 7.14,
      orders_vs_last_month: 7.14,
    },
  };

  const mockRealTime = {
    active_orders: 10,
    active_reservations: 5,
    occupied_tables: 15,
    staff_on_duty: 8,
    revenue_last_hour: 125,
  };

  const mockSales = {
    period: { start_date: new Date(), end_date: new Date() },
    total_revenue: 250,
    total_orders: 2,
    average_order_value: 125,
    top_selling_items: [],
    sales_by_day: [],
    sales_by_hour: [],
    peak_hours: [],
  };

  const mockCustomer = {
    total_customers: 2,
    new_customers: 1,
    returning_customers: 1,
    loyalty_members: 2,
    loyalty_distribution: [],
    average_visits_per_customer: 1.5,
    average_spend_per_customer: 162.5,
    top_customers: [],
  };

  const mockPerformance = {
    overall_rating: 4.5,
    total_reviews: 2,
    rating_distribution: { five_star: 1, four_star: 1, three_star: 0, two_star: 0, one_star: 0 },
    sentiment_score: 90,
    table_turnover_rate: 0,
    average_wait_time: 0,
    reservation_no_show_rate: 33.33,
    staff_efficiency: { average_order_completion_time: 0, average_tips_per_staff: 22.5, attendance_rate: 66.67 },
  };

  const mockForecast = {
    forecast: [{ date: '2024-02-01', predicted_revenue: 550 }],
    confidence: 85,
  };

  const mockMetricsService = {
    getDashboardMetrics: jest.fn().mockResolvedValue(mockDashboard),
    getRealTimeMetrics: jest.fn().mockResolvedValue(mockRealTime),
  };

  const mockAggregationService = {
    getSalesAnalytics: jest.fn().mockResolvedValue(mockSales),
    getCustomerAnalytics: jest.fn().mockResolvedValue(mockCustomer),
    getRestaurantPerformance: jest.fn().mockResolvedValue(mockPerformance),
  };

  const mockForecastService = {
    getRevenueForecast: jest.fn().mockResolvedValue(mockForecast),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: AnalyticsMetricsService, useValue: mockMetricsService },
        { provide: AnalyticsAggregationService, useValue: mockAggregationService },
        { provide: AnalyticsForecastService, useValue: mockForecastService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    metricsService = module.get(AnalyticsMetricsService);
    aggregationService = module.get(AnalyticsAggregationService);
    forecastService = module.get(AnalyticsForecastService);

    jest.clearAllMocks();
  });

  // ────────── Metrics delegates ──────────

  describe('getDashboardMetrics', () => {
    it('should delegate to metricsService.getDashboardMetrics', async () => {
      await service.getDashboardMetrics('r1');
      expect(mockMetricsService.getDashboardMetrics).toHaveBeenCalledWith('r1');
    });
  });

  describe('getRealTimeMetrics', () => {
    it('should delegate to metricsService.getRealTimeMetrics', async () => {
      await service.getRealTimeMetrics('r1');
      expect(mockMetricsService.getRealTimeMetrics).toHaveBeenCalledWith('r1');
    });
  });

  // ────────── Aggregation delegates ──────────

  describe('getSalesAnalytics', () => {
    it('should delegate to aggregationService.getSalesAnalytics', async () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      await service.getSalesAnalytics('r1', start, end);
      expect(mockAggregationService.getSalesAnalytics).toHaveBeenCalledWith('r1', start, end);
    });
  });

  describe('getCustomerAnalytics', () => {
    it('should delegate to aggregationService.getCustomerAnalytics', async () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      await service.getCustomerAnalytics('r1', start, end);
      expect(mockAggregationService.getCustomerAnalytics).toHaveBeenCalledWith('r1', start, end);
    });
  });

  describe('getRestaurantPerformance', () => {
    it('should delegate to aggregationService.getRestaurantPerformance', async () => {
      await service.getRestaurantPerformance('r1');
      expect(mockAggregationService.getRestaurantPerformance).toHaveBeenCalledWith('r1');
    });
  });

  // ────────── Forecast delegates ──────────

  describe('getRevenueForecast', () => {
    it('should delegate to forecastService.getRevenueForecast', async () => {
      await service.getRevenueForecast('r1', 7);
      expect(mockForecastService.getRevenueForecast).toHaveBeenCalledWith('r1', 7);
    });

    it('should pass undefined days when not specified', async () => {
      await service.getRevenueForecast('r1');
      expect(mockForecastService.getRevenueForecast).toHaveBeenCalledWith('r1', undefined);
    });
  });
});
