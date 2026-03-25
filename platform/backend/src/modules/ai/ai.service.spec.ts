import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AiService } from './ai.service';
import { Review } from '@/modules/reviews/entities/review.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';

describe('AiService', () => {
  let service: AiService;
  let reviewRepository: Repository<Review>;
  let orderRepository: Repository<Order>;
  let menuItemRepository: Repository<MenuItem>;
  let loyaltyRepository: Repository<LoyaltyProgram>;
  let restaurantRepository: Repository<Restaurant>;

  const mockReview = {
    id: 'review-1',
    restaurant_id: 'restaurant-1',
    user_id: 'user-1',
    rating: 5,
    comment: 'Excellent food and great service',
    food_rating: 5,
    service_rating: 5,
    ambiance_rating: 4,
    value_rating: 5,
    created_at: new Date(),
  };

  const mockOrder = {
    id: 'order-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    total_amount: 100,
    items: [{ menu_item_id: 'item-1', quantity: 2 }],
    created_at: new Date(),
  };

  const mockMenuItem = {
    id: 'item-1',
    name: 'Pizza',
    price: 50,
    category: 'Main Course',
    is_available: true,
  };

  const mockLoyalty = {
    id: 'loyalty-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    points: 500,
    total_visits: 10,
    total_spent: 1000,
    last_visit: new Date(),
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getRawOne: jest.fn().mockResolvedValue({}),
    getRawMany: jest.fn().mockResolvedValue([]),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockReviewRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockOrderRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockMenuItemRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockLoyaltyRepository = {
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

  const mockRestaurantRepository = {
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
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    }),
  };

  // ConfigService mock — no API key set so tests use fallback logic
  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        OPENAI_API_KEY: '',
        OPENAI_MODEL: 'gpt-4-turbo-preview',
      };
      return config[key] ?? undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: getRepositoryToken(Review), useValue: mockReviewRepository },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: getRepositoryToken(MenuItem), useValue: mockMenuItemRepository },
        { provide: getRepositoryToken(LoyaltyProgram), useValue: mockLoyaltyRepository },
        { provide: getRepositoryToken(Restaurant), useValue: mockRestaurantRepository },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    reviewRepository = module.get(getRepositoryToken(Review));
    orderRepository = module.get(getRepositoryToken(Order));
    menuItemRepository = module.get(getRepositoryToken(MenuItem));
    loyaltyRepository = module.get(getRepositoryToken(LoyaltyProgram));
    restaurantRepository = module.get(getRepositoryToken(Restaurant));

    jest.clearAllMocks();
  });

  describe('analyzeSentiment', () => {
    it('should analyze sentiment as positive for high rating', async () => {
      mockReviewRepository.findOne.mockResolvedValue(mockReview);

      const result = await service.analyzeSentiment('review-1');

      expect(result).toBeDefined();
      expect(result.sentiment).toBe('positive');
      expect(result.score).toBeGreaterThan(60);
      expect(result.keywords).toBeDefined();
      expect(result.keywords).toContain('excellent');
      expect(result.aspects).toBeDefined();
    });

    it('should analyze sentiment as negative for low rating', async () => {
      const badReview = { ...mockReview, rating: 2, comment: 'Terrible food and bad service' };
      mockReviewRepository.findOne.mockResolvedValue(badReview);

      const result = await service.analyzeSentiment('review-1');

      expect(result.sentiment).toBe('negative');
      expect(result.score).toBeLessThan(50);
      expect(result.keywords).toContain('terrible');
    });

    it('should analyze sentiment as neutral for medium rating', async () => {
      const neutralReview = { ...mockReview, rating: 3, comment: 'Average experience' };
      mockReviewRepository.findOne.mockResolvedValue(neutralReview);

      const result = await service.analyzeSentiment('review-1');

      expect(result.sentiment).toBe('neutral');
      expect(result.score).toBe(50);
    });

    it('should throw error if review not found', async () => {
      mockReviewRepository.findOne.mockResolvedValue(null);

      await expect(service.analyzeSentiment('review-1')).rejects.toThrow('Review not found');
    });
  });

  describe('batchAnalyzeSentiments', () => {
    it('should batch analyze sentiments for restaurant', async () => {
      mockReviewRepository.find.mockResolvedValue([
        mockReview,
        { ...mockReview, id: 'review-2', rating: 4 },
        { ...mockReview, id: 'review-3', rating: 2 },
      ]);

      const result = await service.batchAnalyzeSentiments('restaurant-1');

      expect(result).toBeDefined();
      expect(result.overall_sentiment).toBeDefined();
      expect(result.average_score).toBeDefined();
      expect(result.positive_count).toBeGreaterThan(0);
      expect(result.trending_keywords).toBeDefined();
    });
  });

  describe('getMenuRecommendations', () => {
    it('should return menu recommendations', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { menu_item_id: 'item-1', order_count: '10' },
      ]);
      mockMenuItemRepository.find.mockResolvedValue([mockMenuItem]);

      const result = await service.getMenuRecommendations('user-1', 'restaurant-1');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('predictChurnRisk', () => {
    it('should predict low churn risk for active user', async () => {
      const recentDate = new Date();
      mockLoyaltyRepository.findOne.mockResolvedValue({
        ...mockLoyalty,
        last_visit: recentDate,
        total_visits: 20,
      });
      mockOrderRepository.find.mockResolvedValue([mockOrder, mockOrder, mockOrder]);

      const result = await service.predictChurnRisk('user-1', 'restaurant-1');

      expect(result).toBeDefined();
      expect(result.risk_level).toBe('low');
      expect(result.churn_probability).toBeLessThan(40);
    });

    it('should predict high churn risk for inactive user', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);
      mockLoyaltyRepository.findOne.mockResolvedValue({
        ...mockLoyalty,
        last_visit: oldDate,
        total_visits: 2,
      });
      mockOrderRepository.find.mockResolvedValue([]);

      const result = await service.predictChurnRisk('user-1', 'restaurant-1');

      expect(result).toBeDefined();
      expect(result.risk_level).toBe('high');
      expect(result.churn_probability).toBeGreaterThan(60);
    });

    it('should return low risk when loyalty program not found', async () => {
      mockLoyaltyRepository.findOne.mockResolvedValue(null);

      const result = await service.predictChurnRisk('user-1', 'restaurant-1');

      expect(result).toBeDefined();
      expect(result.risk_level).toBe('low');
      expect(result.churn_probability).toBe(0);
    });
  });

  describe('forecastDemand', () => {
    it('should forecast demand for next week', async () => {
      const pastOrders = Array.from({ length: 30 }, (_, i) => ({
        ...mockOrder,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      }));
      mockOrderRepository.find.mockResolvedValue(pastOrders);

      const result = await service.forecastDemand('restaurant-1', 7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
      result.forEach((forecast) => {
        expect(forecast.date).toBeDefined();
        expect(forecast.expected_orders).toBeDefined();
        expect(forecast.confidence).toBeDefined();
      });
    });
  });

  describe('analyzeMenuPerformance', () => {
    it('should analyze menu performance', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          menu_item_id: 'item-1',
          item_name: 'Pizza',
          order_count: '50',
          total_revenue: '2500',
        },
      ]);
      mockMenuItemRepository.find.mockResolvedValue([mockMenuItem]);

      const result = await service.analyzeMenuPerformance('restaurant-1');

      expect(result).toBeDefined();
      expect(result.top_performers).toBeDefined();
      expect(result.low_performers).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });
  });

  describe('getBusinessInsights', () => {
    it('should return business insights', async () => {
      mockReviewRepository.find.mockResolvedValue([mockReview]);
      mockOrderRepository.find.mockResolvedValue([mockOrder]);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { menu_item_id: 'item-1', order_count: '10' },
      ]);
      mockMenuItemRepository.find.mockResolvedValue([mockMenuItem]);

      const result = await service.getBusinessInsights('restaurant-1');

      expect(result).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.alerts).toBeDefined();
    });
  });
});
