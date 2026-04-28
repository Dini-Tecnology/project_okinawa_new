import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { Review } from './entities/review.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { OwnerResponseDto } from './dto/owner-response.dto';
import { EventsGateway } from '@/modules/events/events.realtime';
import { UserRole as UserRoleEnum } from '@/common/enums';
import { PAGINATION } from '@common/constants/limits';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Create a new review
   */
  async create(userId: string, createReviewDto: CreateReviewDto) {
    // Check if user already reviewed this restaurant
    const existingReview = await this.reviewRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: createReviewDto.restaurant_id,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this restaurant. Please update your existing review instead.'
      );
    }

    // Perform sentiment analysis on comment (placeholder - will integrate with AI module)
    let sentiment = 'neutral';
    let sentimentAnalysis = {};

    if (createReviewDto.comment) {
      const analysis = this.analyzeSentiment(createReviewDto.comment);
      sentiment = analysis.sentiment;
      sentimentAnalysis = analysis.details;
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      user_id: userId,
      sentiment,
      sentiment_analysis: sentimentAnalysis,
      is_verified: createReviewDto.order_id ? true : false, // Verified if linked to order
      is_visible: true,
      helpful_count: 0,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update restaurant rating (would require Restaurant service)
    // await this.updateRestaurantRating(createReviewDto.restaurant_id);

    // Emit WebSocket event
    this.eventsGateway.notifyRestaurant(createReviewDto.restaurant_id, {
      type: 'review:created',
      review_id: savedReview.id,
      rating: savedReview.rating,
      sentiment: savedReview.sentiment,
      user_id: userId,
    });

    return savedReview;
  }

  /**
   * Get all reviews for a restaurant
   */
  async findByRestaurant(
    restaurantId: string,
    options?: {
      min_rating?: number;
      max_rating?: number;
      verified_only?: boolean;
      with_images_only?: boolean;
      limit?: number;
      offset?: number;
    }
  ) {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('review.is_visible = true');

    if (options?.min_rating) {
      query.andWhere('review.rating >= :minRating', { minRating: options.min_rating });
    }

    if (options?.max_rating) {
      query.andWhere('review.rating <= :maxRating', { maxRating: options.max_rating });
    }

    if (options?.verified_only) {
      query.andWhere('review.is_verified = true');
    }

    if (options?.with_images_only) {
      query.andWhere('review.images IS NOT NULL');
      query.andWhere('array_length(review.images, 1) > 0');
    }

    query
      .orderBy('review.created_at', 'DESC')
      .take(options?.limit || PAGINATION.REVIEWS_DEFAULT)
      .skip(options?.offset || 0);

    const [reviews, total] = await query.getManyAndCount();

    // Calculate statistics
    const stats = await this.getRestaurantReviewStats(restaurantId);

    return {
      reviews,
      total,
      stats,
    };
  }

  /**
   * Get review statistics for a restaurant using optimized aggregation queries
   */
  async getRestaurantReviewStats(restaurantId: string) {
    // Use aggregated query instead of loading all reviews
    const aggregateResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('COUNT(*)', 'total_reviews')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'average_rating')
      .addSelect('COALESCE(AVG(review.food_rating), 0)', 'avg_food_rating')
      .addSelect('COALESCE(AVG(review.service_rating), 0)', 'avg_service_rating')
      .addSelect('COALESCE(AVG(review.ambiance_rating), 0)', 'avg_ambiance_rating')
      .addSelect('COALESCE(AVG(review.value_rating), 0)', 'avg_value_rating')
      .where('review.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('review.is_visible = true')
      .getRawOne();

    const totalReviews = parseInt(aggregateResult.total_reviews, 10) || 0;

    if (totalReviews === 0) {
      return {
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
        detailed_ratings: { food: 0, service: 0, ambiance: 0, value: 0 },
      };
    }

    // Get rating distribution with separate query
    const ratingDistributionResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('review.is_visible = true')
      .groupBy('review.rating')
      .getRawMany();

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of ratingDistributionResult) {
      ratingDistribution[row.rating] = parseInt(row.count, 10);
    }

    // Get sentiment distribution with separate query
    const sentimentDistributionResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select("COALESCE(review.sentiment, 'neutral')", 'sentiment')
      .addSelect('COUNT(*)', 'count')
      .where('review.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('review.is_visible = true')
      .groupBy('review.sentiment')
      .getRawMany();

    const sentimentDistribution: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
    for (const row of sentimentDistributionResult) {
      const sentiment = row.sentiment || 'neutral';
      sentimentDistribution[sentiment] = parseInt(row.count, 10);
    }

    return {
      total_reviews: totalReviews,
      average_rating: Math.round(parseFloat(aggregateResult.average_rating) * 10) / 10,
      rating_distribution: ratingDistribution,
      sentiment_distribution: sentimentDistribution,
      detailed_ratings: {
        food: Math.round(parseFloat(aggregateResult.avg_food_rating || 0) * 10) / 10,
        service: Math.round(parseFloat(aggregateResult.avg_service_rating || 0) * 10) / 10,
        ambiance: Math.round(parseFloat(aggregateResult.avg_ambiance_rating || 0) * 10) / 10,
        value: Math.round(parseFloat(aggregateResult.avg_value_rating || 0) * 10) / 10,
      },
    };
  }

  /**
   * Get reviews by user
   */
  async findByUser(userId: string) {
    return this.reviewRepository.find({
      where: { user_id: userId },
      relations: ['restaurant'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get single review
   */
  async findOne(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'restaurant'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  /**
   * Update a review (only by owner)
   */
  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.findOne(id);

    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Re-analyze sentiment if comment changed
    if (updateReviewDto.comment && updateReviewDto.comment !== review.comment) {
      const analysis = this.analyzeSentiment(updateReviewDto.comment);
      review.sentiment = analysis.sentiment;
      review.sentiment_analysis = analysis.details;
    }

    Object.assign(review, updateReviewDto);
    const updatedReview = await this.reviewRepository.save(review);

    // Emit event
    this.eventsGateway.notifyRestaurant(review.restaurant_id, {
      type: 'review:updated',
      review_id: id,
      rating: updatedReview.rating,
    });

    return updatedReview;
  }

  /**
   * Owner response to review
   */
  async addOwnerResponse(
    id: string,
    ownerUserId: string,
    ownerResponseDto: OwnerResponseDto,
  ) {
    const review = await this.findOne(id);

    // Verify that ownerUserId is actually owner/manager of this restaurant
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user_id: ownerUserId,
        restaurant_id: review.restaurant_id,
        role: In([UserRoleEnum.OWNER, UserRoleEnum.MANAGER]),
      },
    });

    if (!userRole) {
      throw new ForbiddenException(
        'You must be an owner or manager of this restaurant to respond to reviews'
      );
    }

    review.owner_response = ownerResponseDto.response;
    review.owner_responded_at = new Date();

    const updatedReview = await this.reviewRepository.save(review);

    // Notify user that owner responded
    this.eventsGateway.notifyUser(review.user_id, {
      type: 'review:owner_responded',
      review_id: id,
      restaurant_name: review.restaurant?.name,
    });

    // Emit to restaurant
    this.eventsGateway.notifyRestaurant(review.restaurant_id, {
      type: 'review:response_added',
      review_id: id,
    });

    return updatedReview;
  }

  /**
   * Mark review as helpful
   */
  async markAsHelpful(id: string) {
    const review = await this.findOne(id);

    review.helpful_count += 1;
    const updatedReview = await this.reviewRepository.save(review);

    // Emit event
    this.eventsGateway.notifyRestaurant(review.restaurant_id, {
      type: 'review:helpful_updated',
      review_id: id,
      helpful_count: updatedReview.helpful_count,
    });

    return updatedReview;
  }

  /**
   * Hide/Show review (moderation)
   */
  async toggleVisibility(id: string, visible: boolean) {
    const review = await this.findOne(id);

    review.is_visible = visible;
    return this.reviewRepository.save(review);
  }

  /**
   * Delete review (soft delete - mark as not visible)
   */
  async remove(id: string, userId: string) {
    const review = await this.findOne(id);

    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Soft delete
    review.is_visible = false;
    await this.reviewRepository.save(review);

    return { message: 'Review deleted successfully' };
  }

  /**
   * Get recent reviews (for homepage/feed)
   */
  async getRecentReviews(limit: number = PAGINATION.RECENT_REVIEWS) {
    return this.reviewRepository.find({
      where: {
        is_visible: true,
        created_at: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // Last 7 days
      },
      relations: ['user', 'restaurant'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get top rated reviews for a restaurant
   */
  async getTopReviews(restaurantId: string, limit: number = PAGINATION.TOP_REVIEWS) {
    return this.reviewRepository.find({
      where: {
        restaurant_id: restaurantId,
        is_visible: true,
        rating: MoreThan(3), // 4 or 5 stars
      },
      relations: ['user'],
      order: {
        helpful_count: 'DESC',
        created_at: 'DESC',
      },
      take: limit,
    });
  }

  // ========== Private Helper Methods ==========

  /**
   * Simple sentiment analysis (placeholder for AI integration)
   */
  private analyzeSentiment(text: string): { sentiment: string; details: Record<string, unknown> } {
    // This is a placeholder. In production, integrate with AI module or external service
    const lowerText = text.toLowerCase();

    const positiveWords = ['excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'delicious', 'perfect', 'love', 'best'];
    const negativeWords = ['terrible', 'awful', 'horrible', 'disgusting', 'worst', 'bad', 'disappointing', 'poor'];

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    let sentiment = 'neutral';
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    }

    return {
      sentiment,
      details: {
        positive_keywords: positiveCount,
        negative_keywords: negativeCount,
        text_length: text.length,
        analyzed_at: new Date(),
      },
    };
  }

  /**
   * Calculate average from array of numbers
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / numbers.length) * 10) / 10;
  }
}
