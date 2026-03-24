import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('AiController', () => {
  let controller: AiController;

  const mockAiService = {
    analyzeSentiment: jest.fn(),
    batchAnalyzeSentiments: jest.fn(),
    getMenuRecommendations: jest.fn(),
    predictChurnRisk: jest.fn(),
    forecastDemand: jest.fn(),
    analyzeMenuPerformance: jest.fn(),
    getBusinessInsights: jest.fn(),
  };

  const mockUser = mockAuthenticatedUser({ id: 'user-1', sub: 'user-1' });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: mockAiService }],
    })
      .overrideGuard(
        require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard,
      )
      .useValue({ canActivate: () => true })
      .overrideGuard(
        require('@/modules/auth/guards/roles.guard').RolesGuard,
      )
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AiController>(AiController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('analyzeSentiment', () => {
    it('should analyze sentiment for a specific review', async () => {
      const sentimentResult = {
        review_id: 'review-1',
        sentiment: 'positive',
        score: 80,
        keywords: ['excellent', 'great'],
        aspects: { food: 90, service: 85, ambiance: 80, value: 75 },
      };
      mockAiService.analyzeSentiment.mockResolvedValue(sentimentResult);

      const result = await controller.analyzeSentiment('review-1');

      expect(result).toEqual(sentimentResult);
      expect(mockAiService.analyzeSentiment).toHaveBeenCalledWith('review-1');
    });

    it('should return negative sentiment for a bad review', async () => {
      const negativeResult = {
        review_id: 'review-2',
        sentiment: 'negative',
        score: 25,
        keywords: ['terrible', 'bad'],
        aspects: { food: 20, service: 30, ambiance: 40, value: 20 },
      };
      mockAiService.analyzeSentiment.mockResolvedValue(negativeResult);

      const result = await controller.analyzeSentiment('review-2');

      expect(result.sentiment).toBe('negative');
      expect(mockAiService.analyzeSentiment).toHaveBeenCalledWith('review-2');
    });
  });

  describe('batchAnalyzeSentiments', () => {
    it('should batch analyze sentiments for a restaurant', async () => {
      const batchResult = {
        overall_sentiment: 'positive',
        average_score: 72.5,
        positive_count: 8,
        negative_count: 2,
        neutral_count: 1,
        trending_keywords: ['excellent', 'delicious', 'fresh'],
      };
      mockAiService.batchAnalyzeSentiments.mockResolvedValue(batchResult);

      const result = await controller.batchAnalyzeSentiments('restaurant-1');

      expect(result).toEqual(batchResult);
      expect(mockAiService.batchAnalyzeSentiments).toHaveBeenCalledWith(
        'restaurant-1',
      );
    });

    it('should handle restaurant with no reviews', async () => {
      const emptyResult = {
        overall_sentiment: 'neutral',
        average_score: 0,
        positive_count: 0,
        negative_count: 0,
        neutral_count: 0,
        trending_keywords: [],
      };
      mockAiService.batchAnalyzeSentiments.mockResolvedValue(emptyResult);

      const result = await controller.batchAnalyzeSentiments('restaurant-empty');

      expect(result.positive_count).toBe(0);
    });
  });

  describe('getMenuRecommendations', () => {
    it('should return personalized menu recommendations for user', async () => {
      const recommendations = [
        {
          item_id: 'item-1',
          item_name: 'Pizza Margherita',
          confidence: 85,
          reason: 'Popular choice - ordered 25 times this month',
          based_on: 'popularity',
        },
        {
          item_id: 'item-2',
          item_name: 'Pasta Carbonara',
          confidence: 75,
          reason: 'Trending item among customers',
          based_on: 'trending',
        },
      ];
      mockAiService.getMenuRecommendations.mockResolvedValue(recommendations);

      const result = await controller.getMenuRecommendations(
        mockUser,
        'restaurant-1',
      );

      expect(result).toEqual(recommendations);
      expect(mockAiService.getMenuRecommendations).toHaveBeenCalledWith(
        'user-1',
        'restaurant-1',
      );
    });

    it('should return empty recommendations for new user', async () => {
      mockAiService.getMenuRecommendations.mockResolvedValue([]);

      const result = await controller.getMenuRecommendations(
        mockUser,
        'restaurant-new',
      );

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('predictChurnRisk', () => {
    it('should predict low churn risk for an active customer', async () => {
      const churnResult = {
        user_id: 'user-1',
        churn_probability: 15,
        risk_level: 'low',
        factors: [],
        retention_suggestions: [],
      };
      mockAiService.predictChurnRisk.mockResolvedValue(churnResult);

      const result = await controller.predictChurnRisk(
        'user-1',
        'restaurant-1',
      );

      expect(result).toEqual(churnResult);
      expect(mockAiService.predictChurnRisk).toHaveBeenCalledWith(
        'user-1',
        'restaurant-1',
      );
    });

    it('should predict high churn risk for an inactive customer', async () => {
      const churnResult = {
        user_id: 'user-inactive',
        churn_probability: 75,
        risk_level: 'high',
        factors: ['No orders in 90 days', 'Low engagement with loyalty program'],
        retention_suggestions: [
          'Send personalized discount offer',
          'Remind about available rewards',
        ],
      };
      mockAiService.predictChurnRisk.mockResolvedValue(churnResult);

      const result = await controller.predictChurnRisk(
        'user-inactive',
        'restaurant-1',
      );

      expect(result.risk_level).toBe('high');
      expect(result.churn_probability).toBeGreaterThan(60);
    });
  });

  describe('forecastDemand', () => {
    it('should forecast demand for next 7 days by default', async () => {
      const forecasts = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split('T')[0],
        expected_orders: 30 + i,
        confidence: 70,
        peak_hours: [12, 13, 20],
        recommended_staff: 5,
      }));
      mockAiService.forecastDemand.mockResolvedValue(forecasts);

      const result = await controller.forecastDemand('restaurant-1', undefined);

      expect(result).toEqual(forecasts);
      expect(mockAiService.forecastDemand).toHaveBeenCalledWith(
        'restaurant-1',
        undefined,
      );
    });

    it('should forecast demand for a custom number of days', async () => {
      const forecasts = Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split('T')[0],
        expected_orders: 25,
        confidence: 65,
        peak_hours: [19, 20, 21],
        recommended_staff: 4,
      }));
      mockAiService.forecastDemand.mockResolvedValue(forecasts);

      const result = await controller.forecastDemand('restaurant-1', 14);

      expect(result).toHaveLength(14);
      expect(mockAiService.forecastDemand).toHaveBeenCalledWith(
        'restaurant-1',
        14,
      );
    });
  });

  describe('analyzeMenuPerformance', () => {
    it('should return menu performance analysis', async () => {
      const performanceResult = {
        top_performers: [
          {
            item_id: 'item-1',
            item_name: 'Grilled Salmon',
            orders: 120,
            revenue: 6000,
          },
        ],
        low_performers: [
          {
            item_id: 'item-99',
            item_name: 'Kale Salad',
            orders: 2,
            revenue: 50,
          },
        ],
        suggestions: [
          'Consider removing or revamping items with very low orders (< 5 in 30 days)',
          'Promote top performers with special combos or upselling',
        ],
      };
      mockAiService.analyzeMenuPerformance.mockResolvedValue(performanceResult);

      const result = await controller.analyzeMenuPerformance('restaurant-1');

      expect(result).toEqual(performanceResult);
      expect(mockAiService.analyzeMenuPerformance).toHaveBeenCalledWith(
        'restaurant-1',
      );
    });

    it('should return empty results for restaurant with no order history', async () => {
      const emptyResult = {
        top_performers: [],
        low_performers: [],
        suggestions: ['Average revenue per item: R$ 0.00'],
      };
      mockAiService.analyzeMenuPerformance.mockResolvedValue(emptyResult);

      const result = await controller.analyzeMenuPerformance('restaurant-new');

      expect(result.top_performers).toHaveLength(0);
    });
  });

  describe('getBusinessInsights', () => {
    it('should return business insights and recommendations', async () => {
      const insightsResult = {
        insights: [
          'Last 7 days: 45 orders, R$ 4500.00 revenue',
          'Average order value: R$ 100.00',
          'Customer sentiment: positive (72.5/100)',
        ],
        recommendations: [
          'Create combo meals to increase order value',
        ],
        alerts: [],
      };
      mockAiService.getBusinessInsights.mockResolvedValue(insightsResult);

      const result = await controller.getBusinessInsights('restaurant-1');

      expect(result).toEqual(insightsResult);
      expect(mockAiService.getBusinessInsights).toHaveBeenCalledWith(
        'restaurant-1',
      );
    });

    it('should include alerts when performance is poor', async () => {
      const alertResult = {
        insights: ['Last 7 days: 3 orders, R$ 300.00 revenue'],
        recommendations: [
          'Run a limited-time discount campaign',
          'Increase social media presence',
        ],
        alerts: [
          'Low order volume in last 7 days - consider promotions',
          'Negative customer sentiment detected - review recent feedback',
        ],
      };
      mockAiService.getBusinessInsights.mockResolvedValue(alertResult);

      const result = await controller.getBusinessInsights('restaurant-low');

      expect(result.alerts).toHaveLength(2);
    });
  });
});
