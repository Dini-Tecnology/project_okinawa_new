import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsForecastService } from './analytics-forecast.service';
import { ForecastHelper } from './helpers/forecast.helper';
import { Order } from '@/modules/orders/entities/order.entity';

describe('AnalyticsForecastService', () => {
  let service: AnalyticsForecastService;
  let orderRepository: Repository<Order>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsForecastService,
        ForecastHelper,
        {
          provide: getRepositoryToken(Order),
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AnalyticsForecastService>(AnalyticsForecastService);
    orderRepository = module.get(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRevenueForecast', () => {
    it('should return forecast with predicted revenue and confidence', async () => {
      const mockOrders = [
        { total_amount: 500, created_at: new Date('2024-01-01') },
        { total_amount: 550, created_at: new Date('2024-01-02') },
        { total_amount: 600, created_at: new Date('2024-01-03') },
      ];
      jest.spyOn(orderRepository, 'find').mockResolvedValue(mockOrders as any);

      const result = await service.getRevenueForecast('restaurant-1', 7);

      expect(result).toBeDefined();
      expect(result.forecast).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(Array.isArray(result.forecast)).toBe(true);
      expect(result.forecast.length).toBe(7);
    });

    it('should default to 30 days when no days parameter is given', async () => {
      jest.spyOn(orderRepository, 'find').mockResolvedValue([
        { total_amount: 100, created_at: new Date('2024-01-01') },
      ] as any);

      const result = await service.getRevenueForecast('restaurant-1');

      expect(result.forecast.length).toBe(30);
    });

    it('should handle empty order history', async () => {
      jest.spyOn(orderRepository, 'find').mockResolvedValue([]);

      const result = await service.getRevenueForecast('restaurant-1', 7);

      expect(result.forecast).toBeDefined();
      expect(result.confidence).toBe(0);
      expect(result.forecast.every((f) => f.predicted_revenue === 0)).toBe(true);
    });

    it('should include dates in forecast entries', async () => {
      jest.spyOn(orderRepository, 'find').mockResolvedValue([
        { total_amount: 200, created_at: new Date('2024-01-10') },
      ] as any);

      const result = await service.getRevenueForecast('restaurant-1', 3);

      expect(result.forecast.length).toBe(3);
      result.forecast.forEach((entry) => {
        expect(entry.date).toBeDefined();
        expect(entry.predicted_revenue).toBeDefined();
      });
    });

    it('should have high confidence for consistent revenue', async () => {
      const mockOrders = Array.from({ length: 10 }, (_, i) => ({
        total_amount: 500,
        created_at: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
      }));
      jest.spyOn(orderRepository, 'find').mockResolvedValue(mockOrders as any);

      const result = await service.getRevenueForecast('restaurant-1', 7);

      expect(result.confidence).toBe(100);
    });
  });
});
