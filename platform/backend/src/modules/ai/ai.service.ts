import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import axios, { AxiosError } from 'axios';
import { Review } from '@/modules/reviews/entities/review.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';

export interface SentimentAnalysis {
  review_id: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // 0-100
  keywords: string[];
  aspects: {
    food: number;
    service: number;
    ambiance: number;
    value: number;
  };
}

export interface MenuRecommendation {
  item_id: string;
  item_name: string;
  confidence: number; // 0-100
  reason: string;
  based_on: 'popularity' | 'user_history' | 'similar_users' | 'trending';
}

export interface ChurnPrediction {
  user_id: string;
  churn_probability: number; // 0-100
  risk_level: 'low' | 'medium' | 'high';
  factors: string[];
  retention_suggestions: string[];
}

export interface DemandForecast {
  date: string;
  expected_orders: number;
  confidence: number;
  peak_hours: number[];
  recommended_staff: number;
}

/** Shape returned by the OpenAI-powered sentiment analysis */
interface OpenAISentimentResponse {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  keywords: string[];
  aspects: {
    food: number;
    service: number;
    ambiance: number;
    value: number;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openaiApiKey: string | undefined;
  private readonly openaiModel: string;

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(LoyaltyProgram)
    private loyaltyRepository: Repository<LoyaltyProgram>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    private configService: ConfigService,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || undefined;
    this.openaiModel = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4-turbo-preview';

    if (this.openaiApiKey) {
      this.logger.log('OpenAI API key detected — AI-powered analysis enabled');
    } else {
      this.logger.warn(
        'OPENAI_API_KEY not set — falling back to rule-based analysis',
      );
    }
  }

  /**
   * Returns true when a real OpenAI API key is configured.
   */
  private get isOpenAIAvailable(): boolean {
    return !!this.openaiApiKey;
  }

  /**
   * Make a chat completion request to the OpenAI API.
   * Handles timeout, rate-limit, and generic errors gracefully.
   */
  private async callOpenAI<T>(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<T> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15_000, // 15 second timeout
      },
    );

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return JSON.parse(content) as T;
  }

  /**
   * Verify user has access to restaurant data (owner or staff)
   */
  private async verifyRestaurantAccess(
    restaurantId: string,
    userId: string,
  ): Promise<void> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Basic access control - owner can access
    // In production, this should also check user roles for staff access
    if (restaurant.owner_id !== userId) {
      throw new ForbiddenException('Access denied to restaurant data');
    }
  }

  /**
   * Rule-based fallback sentiment analysis.
   * Used when OpenAI is unavailable or when the API call fails.
   */
  private buildFallbackSentiment(
    review: Review,
    reviewId: string,
  ): SentimentAnalysis {
    const rating = review.rating;
    let sentiment: 'positive' | 'negative' | 'neutral';
    let score: number;

    if (rating >= 4) {
      sentiment = 'positive';
      score = 60 + (rating - 4) * 20;
    } else if (rating <= 2) {
      sentiment = 'negative';
      score = rating * 20;
    } else {
      sentiment = 'neutral';
      score = 50;
    }

    const keywords: string[] = [];
    if (review.comment) {
      const words = review.comment.toLowerCase().split(/\s+/);
      const positiveWords = [
        'excellent',
        'great',
        'amazing',
        'delicious',
        'wonderful',
      ];
      const negativeWords = ['bad', 'terrible', 'poor', 'awful', 'horrible'];

      words.forEach((word) => {
        if (positiveWords.includes(word) || negativeWords.includes(word)) {
          keywords.push(word);
        }
      });
    }

    return {
      review_id: reviewId,
      sentiment,
      score,
      keywords: keywords.slice(0, 5),
      aspects: {
        food: review.food_rating ? (review.food_rating / 5) * 100 : score,
        service: review.service_rating
          ? (review.service_rating / 5) * 100
          : score,
        ambiance: review.ambiance_rating
          ? (review.ambiance_rating / 5) * 100
          : score,
        value: review.value_rating ? (review.value_rating / 5) * 100 : score,
      },
    };
  }

  /**
   * Analyze sentiment of a review.
   *
   * When OPENAI_API_KEY is configured, uses OpenAI chat completions for
   * NLP-powered analysis. Falls back to rule-based heuristics when the
   * key is absent or the API call fails (timeout, rate-limit, etc.).
   */
  async analyzeSentiment(reviewId: string): Promise<SentimentAnalysis> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    // If OpenAI is not available, return rule-based result immediately
    if (!this.isOpenAIAvailable) {
      return this.buildFallbackSentiment(review, reviewId);
    }

    try {
      const systemPrompt = `You are a restaurant review sentiment analyzer. Analyze the review and return a JSON object with:
- "sentiment": one of "positive", "negative", "neutral"
- "score": number 0–100 (0 = most negative, 100 = most positive)
- "keywords": array of up to 5 notable keywords from the review
- "aspects": object with "food", "service", "ambiance", "value" each scored 0–100

Context: The review has a numeric rating of ${review.rating}/5.${review.food_rating ? ` Food rating: ${review.food_rating}/5.` : ''}${review.service_rating ? ` Service rating: ${review.service_rating}/5.` : ''}${review.ambiance_rating ? ` Ambiance rating: ${review.ambiance_rating}/5.` : ''}${review.value_rating ? ` Value rating: ${review.value_rating}/5.` : ''}`;

      const userPrompt = review.comment
        ? `Review text: "${review.comment}"`
        : `No text provided. Rating: ${review.rating}/5.`;

      const aiResult = await this.callOpenAI<OpenAISentimentResponse>(
        systemPrompt,
        userPrompt,
      );

      return {
        review_id: reviewId,
        sentiment: aiResult.sentiment,
        score: Math.max(0, Math.min(100, aiResult.score)),
        keywords: (aiResult.keywords || []).slice(0, 5),
        aspects: {
          food: Math.max(0, Math.min(100, aiResult.aspects?.food ?? 50)),
          service: Math.max(0, Math.min(100, aiResult.aspects?.service ?? 50)),
          ambiance: Math.max(0, Math.min(100, aiResult.aspects?.ambiance ?? 50)),
          value: Math.max(0, Math.min(100, aiResult.aspects?.value ?? 50)),
        },
      };
    } catch (error) {
      // Log the error and degrade gracefully to rule-based analysis
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          this.logger.warn(
            `OpenAI rate limit hit — falling back to rule-based sentiment for review ${reviewId}`,
          );
        } else if (error.code === 'ECONNABORTED') {
          this.logger.warn(
            `OpenAI request timed out — falling back to rule-based sentiment for review ${reviewId}`,
          );
        } else {
          this.logger.error(
            `OpenAI API error (${error.response?.status ?? error.code}) — falling back to rule-based sentiment for review ${reviewId}`,
          );
        }
      } else {
        this.logger.error(
          `Unexpected error during OpenAI call — falling back to rule-based sentiment for review ${reviewId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }

      return this.buildFallbackSentiment(review, reviewId);
    }
  }

  /**
   * Batch analyze sentiments for restaurant
   */
  async batchAnalyzeSentiments(
    restaurantId: string,
  ): Promise<{
    overall_sentiment: 'positive' | 'negative' | 'neutral';
    average_score: number;
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    trending_keywords: string[];
  }> {
    const reviews = await this.reviewRepository.find({
      where: { restaurant_id: restaurantId },
      order: { created_at: 'DESC' },
      take: 100,
    });

    const sentiments = await Promise.all(
      reviews.map((r) => this.analyzeSentiment(r.id)),
    );

    const positive = sentiments.filter((s) => s.sentiment === 'positive').length;
    const negative = sentiments.filter((s) => s.sentiment === 'negative').length;
    const neutral = sentiments.filter((s) => s.sentiment === 'neutral').length;

    const avgScore =
      sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;

    let overallSentiment: 'positive' | 'negative' | 'neutral';
    if (avgScore >= 60) overallSentiment = 'positive';
    else if (avgScore <= 40) overallSentiment = 'negative';
    else overallSentiment = 'neutral';

    // Collect all keywords
    const allKeywords = sentiments.flatMap((s) => s.keywords);
    const keywordCounts = allKeywords.reduce(
      (acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const trendingKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);

    return {
      overall_sentiment: overallSentiment,
      average_score: avgScore,
      positive_count: positive,
      negative_count: negative,
      neutral_count: neutral,
      trending_keywords: trendingKeywords,
    };
  }

  /**
   * Get personalized menu recommendations for user
   */
  async getMenuRecommendations(
    userId: string,
    restaurantId: string,
  ): Promise<MenuRecommendation[]> {
    // Get user's order history
    const userOrders = await this.orderRepository.find({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
      },
      relations: ['items'],
      order: { created_at: 'DESC' },
      take: 10,
    });

    // Get all menu items for restaurant
    const menuItems = await this.menuItemRepository.find({
      where: { restaurant_id: restaurantId, is_available: true },
    });

    // Simple recommendation algorithm
    const recommendations: MenuRecommendation[] = [];

    // 1. Popular items (items ordered most in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentOrders = await this.orderRepository.find({
      where: {
        restaurant_id: restaurantId,
        created_at: MoreThan(thirtyDaysAgo),
      },
      relations: ['items'],
    });

    const itemPopularity: Record<string, number> = {};
    recentOrders.forEach((order) => {
      order.items?.forEach((item) => {
        itemPopularity[item.menu_item_id] =
          (itemPopularity[item.menu_item_id] || 0) + item.quantity;
      });
    });

    // Get user's previous items
    const userItemIds = new Set<string>();
    userOrders.forEach((order) => {
      order.items?.forEach((item) => {
        userItemIds.add(item.menu_item_id);
      });
    });

    // Recommend popular items user hasn't tried
    const popularItems = Object.entries(itemPopularity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .filter(([itemId]) => !userItemIds.has(itemId));

    for (const [itemId, count] of popularItems.slice(0, 3)) {
      const menuItem = menuItems.find((m) => m.id === itemId);
      if (menuItem) {
        recommendations.push({
          item_id: itemId,
          item_name: menuItem.name,
          confidence: Math.min(95, 60 + count * 2),
          reason: `Popular choice - ordered ${count} times this month`,
          based_on: 'popularity',
        });
      }
    }

    // 2. Trending items (items with increasing orders)
    const trendingItems = Object.entries(itemPopularity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [itemId] of trendingItems) {
      if (!recommendations.find((r) => r.item_id === itemId)) {
        const menuItem = menuItems.find((m) => m.id === itemId);
        if (menuItem && recommendations.length < 5) {
          recommendations.push({
            item_id: itemId,
            item_name: menuItem.name,
            confidence: 75,
            reason: 'Trending item among customers',
            based_on: 'trending',
          });
        }
      }
    }

    // Fill with random items if not enough recommendations
    while (recommendations.length < 5 && menuItems.length > 0) {
      const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      if (!recommendations.find((r) => r.item_id === randomItem.id)) {
        recommendations.push({
          item_id: randomItem.id,
          item_name: randomItem.name,
          confidence: 50,
          reason: 'You might like this',
          based_on: 'popularity',
        });
      }
    }

    return recommendations;
  }

  /**
   * Predict customer churn risk
   */
  async predictChurnRisk(
    userId: string,
    restaurantId: string,
  ): Promise<ChurnPrediction> {
    const loyalty = await this.loyaltyRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
    });

    if (!loyalty) {
      return {
        user_id: userId,
        churn_probability: 0,
        risk_level: 'low',
        factors: ['User has no loyalty program enrollment'],
        retention_suggestions: ['Enroll user in loyalty program'],
      };
    }

    // Get user's order history
    const orders = await this.orderRepository.find({
      where: { user_id: userId, restaurant_id: restaurantId },
      order: { created_at: 'DESC' },
      take: 20,
    });

    const factors: string[] = [];
    let churnScore = 0;

    // Factor 1: Days since last order
    if (orders.length > 0) {
      const lastOrderDate = orders[0].created_at;
      const daysSinceLastOrder = Math.floor(
        (Date.now() - lastOrderDate.getTime()) / (24 * 60 * 60 * 1000),
      );

      if (daysSinceLastOrder > 60) {
        churnScore += 40;
        factors.push(`No orders in ${daysSinceLastOrder} days`);
      } else if (daysSinceLastOrder > 30) {
        churnScore += 20;
        factors.push(`Last order was ${daysSinceLastOrder} days ago`);
      }
    } else {
      churnScore += 50;
      factors.push('No order history');
    }

    // Factor 2: Order frequency declining
    if (orders.length >= 5) {
      const recentOrders = orders.slice(0, 3).length;
      const olderOrders = orders.slice(3, 6).length;

      if (recentOrders < olderOrders) {
        churnScore += 20;
        factors.push('Order frequency declining');
      }
    }

    // Factor 3: Low loyalty points
    if (loyalty.points < 100) {
      churnScore += 10;
      factors.push('Low engagement with loyalty program');
    }

    // Factor 4: Never redeemed rewards
    if (loyalty.total_visits > 5 && loyalty.points > 500) {
      churnScore += 10;
      factors.push('Has points but never redeemed rewards');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (churnScore >= 60) riskLevel = 'high';
    else if (churnScore >= 30) riskLevel = 'medium';
    else riskLevel = 'low';

    // Generate retention suggestions
    const suggestions: string[] = [];
    if (churnScore > 30) {
      suggestions.push('Send personalized discount offer');
      suggestions.push('Notify about new menu items');
    }
    if (loyalty.points > 500) {
      suggestions.push('Remind about available rewards');
    }
    if (orders.length === 0 || orders.length < 3) {
      suggestions.push('Send welcome back message');
      suggestions.push('Offer first-time/comeback bonus points');
    }

    return {
      user_id: userId,
      churn_probability: churnScore,
      risk_level: riskLevel,
      factors,
      retention_suggestions: suggestions,
    };
  }

  /**
   * Forecast demand for future dates
   */
  async forecastDemand(
    restaurantId: string,
    days: number = 7,
  ): Promise<DemandForecast[]> {
    // Get historical data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const orders = await this.orderRepository.find({
      where: {
        restaurant_id: restaurantId,
        created_at: MoreThan(thirtyDaysAgo),
      },
    });

    // Calculate daily averages
    const dailyOrders: Record<string, number> = {};
    orders.forEach((order) => {
      const date = order.created_at.toISOString().split('T')[0];
      dailyOrders[date] = (dailyOrders[date] || 0) + 1;
    });

    const averageDailyOrders =
      Object.values(dailyOrders).reduce((sum, count) => sum + count, 0) /
      Object.keys(dailyOrders).length;

    // Calculate hourly distribution
    const hourlyOrders: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyOrders[i] = 0;
    }

    orders.forEach((order) => {
      const hour = order.created_at.getHours();
      hourlyOrders[hour]++;
    });

    // Find peak hours
    const peakHours = Object.entries(hourlyOrders)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Generate forecasts
    const forecasts: DemandForecast[] = [];
    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = forecastDate.getDay();

      // Adjust for weekend (typically higher)
      let expectedOrders = averageDailyOrders;
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        // Friday or Saturday
        expectedOrders *= 1.3;
      } else if (dayOfWeek === 0) {
        // Sunday
        expectedOrders *= 1.1;
      }

      // Recommended staff (1 staff per 10 orders, minimum 3)
      const recommendedStaff = Math.max(3, Math.ceil(expectedOrders / 10));

      forecasts.push({
        date: forecastDate.toISOString().split('T')[0],
        expected_orders: Math.round(expectedOrders),
        confidence: 70, // Placeholder confidence
        peak_hours: peakHours,
        recommended_staff: recommendedStaff,
      });
    }

    return forecasts;
  }

  /**
   * Analyze menu performance and suggest optimizations
   */
  async analyzeMenuPerformance(restaurantId: string): Promise<{
    top_performers: Array<{
      item_id: string;
      item_name: string;
      orders: number;
      revenue: number;
    }>;
    low_performers: Array<{
      item_id: string;
      item_name: string;
      orders: number;
      revenue: number;
    }>;
    suggestions: string[];
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get all orders with items
    const orders = await this.orderRepository.find({
      where: {
        restaurant_id: restaurantId,
        created_at: MoreThan(thirtyDaysAgo),
      },
      relations: ['items'],
    });

    // Get menu items
    const menuItems = await this.menuItemRepository.find({
      where: { restaurant_id: restaurantId },
    });

    // Calculate performance metrics
    const itemMetrics: Record<
      string,
      { orders: number; revenue: number; name: string }
    > = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!itemMetrics[item.menu_item_id]) {
          const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
          itemMetrics[item.menu_item_id] = {
            orders: 0,
            revenue: 0,
            name: menuItem?.name || 'Unknown',
          };
        }
        itemMetrics[item.menu_item_id].orders += item.quantity;
        itemMetrics[item.menu_item_id].revenue +=
          item.quantity * Number(item.unit_price);
      });
    });

    // Sort by revenue
    const sortedItems = Object.entries(itemMetrics).sort(
      (a, b) => b[1].revenue - a[1].revenue,
    );

    const topPerformers = sortedItems
      .slice(0, 5)
      .map(([item_id, metrics]) => ({
        item_id,
        item_name: metrics.name,
        orders: metrics.orders,
        revenue: metrics.revenue,
      }));

    const lowPerformers = sortedItems
      .slice(-5)
      .map(([item_id, metrics]) => ({
        item_id,
        item_name: metrics.name,
        orders: metrics.orders,
        revenue: metrics.revenue,
      }));

    // Generate suggestions
    const suggestions: string[] = [];

    if (lowPerformers[0] && lowPerformers[0].orders < 5) {
      suggestions.push(
        `Consider removing or revamping items with very low orders (< 5 in 30 days)`,
      );
    }

    if (topPerformers[0] && topPerformers[0].orders > 100) {
      suggestions.push(
        `Promote top performers with special combos or upselling`,
      );
    }

    const avgRevenue =
      sortedItems.reduce((sum, [_, m]) => sum + m.revenue, 0) /
      sortedItems.length;

    suggestions.push(
      `Average revenue per item: R$ ${avgRevenue.toFixed(2)}. Focus on items above this threshold.`,
    );

    return {
      top_performers: topPerformers,
      low_performers: lowPerformers,
      suggestions,
    };
  }

  /**
   * Get insights and recommendations for restaurant
   */
  async getBusinessInsights(restaurantId: string): Promise<{
    insights: string[];
    recommendations: string[];
    alerts: string[];
  }> {
    const insights: string[] = [];
    const recommendations: string[] = [];
    const alerts: string[] = [];

    // Analyze recent performance
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOrders = await this.orderRepository.find({
      where: {
        restaurant_id: restaurantId,
        created_at: MoreThan(sevenDaysAgo),
      },
    });

    const recentRevenue = recentOrders.reduce(
      (sum, o) => sum + Number(o.total_amount),
      0,
    );
    const avgOrderValue =
      recentOrders.length > 0 ? recentRevenue / recentOrders.length : 0;

    insights.push(
      `Last 7 days: ${recentOrders.length} orders, R$ ${recentRevenue.toFixed(2)} revenue`,
    );
    insights.push(`Average order value: R$ ${avgOrderValue.toFixed(2)}`);

    // Check for low order volume
    if (recentOrders.length < 10) {
      alerts.push('Low order volume in last 7 days - consider promotions');
      recommendations.push('Run a limited-time discount campaign');
      recommendations.push('Increase social media presence');
    }

    // Check average order value
    if (avgOrderValue < 30) {
      recommendations.push('Implement minimum order value for delivery');
      recommendations.push('Create combo meals to increase order value');
    }

    // Get sentiment analysis
    const sentiment = await this.batchAnalyzeSentiments(restaurantId);
    insights.push(
      `Customer sentiment: ${sentiment.overall_sentiment} (${sentiment.average_score.toFixed(1)}/100)`,
    );

    if (sentiment.overall_sentiment === 'negative') {
      alerts.push(
        'Negative customer sentiment detected - review recent feedback',
      );
      recommendations.push('Address common complaints in reviews');
      recommendations.push('Reach out to unsatisfied customers');
    }

    return {
      insights,
      recommendations,
      alerts,
    };
  }
}
