import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Review } from '@/modules/reviews/entities/review.entity';
import { Tip } from '@/modules/tips/entities/tip.entity';
import { Attendance } from '@/modules/hr/entities/attendance.entity';
import { PerformanceMetricsHelper } from './helpers';
import { RestaurantPerformance } from './analytics.service';

@Injectable()
export class AnalyticsPerformanceService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Tip)
    private tipRepository: Repository<Tip>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private performanceMetrics: PerformanceMetricsHelper,
  ) {}

  /**
   * Get restaurant performance metrics (reviews, reservations, tips, attendance).
   *
   * Optimization: Uses SQL-level aggregation (COUNT, AVG, CASE) for review stats
   * and reservation no-show rate instead of loading all rows into memory.
   * Tips and attendance still use find() with column selection since the helper
   * methods need per-row data for staff-level grouping.
   */
  async getRestaurantPerformance(restaurantId: string): Promise<RestaurantPerformance> {
    const [reviewStats, reservationStats, tips, attendances] = await Promise.all([
      // SQL-level aggregation for review stats — avoids loading every review row
      this.reviewRepository
        .createQueryBuilder('review')
        .select([
          'COUNT(*) as total_reviews',
          'COALESCE(AVG(review.rating), 0) as average_rating',
          'COALESCE(AVG(review.rating / 5.0 * 100), 0) as sentiment_score',
          `COUNT(CASE WHEN review.rating = 5 THEN 1 END) as five_star`,
          `COUNT(CASE WHEN review.rating = 4 THEN 1 END) as four_star`,
          `COUNT(CASE WHEN review.rating = 3 THEN 1 END) as three_star`,
          `COUNT(CASE WHEN review.rating = 2 THEN 1 END) as two_star`,
          `COUNT(CASE WHEN review.rating = 1 THEN 1 END) as one_star`,
        ])
        .where('review.restaurant_id = :restaurantId', { restaurantId })
        .getRawOne(),

      // SQL-level aggregation for no-show rate — avoids loading every reservation row
      this.reservationRepository
        .createQueryBuilder('reservation')
        .select([
          'COUNT(*) as total_reservations',
          `COUNT(CASE WHEN reservation.status = 'no_show' THEN 1 END) as no_show_count`,
        ])
        .where('reservation.restaurant_id = :restaurantId', { restaurantId })
        .getRawOne(),

      // Tips: select only columns needed for staff grouping
      this.tipRepository.find({
        where: { restaurant_id: restaurantId },
        select: ['id', 'staff_id', 'amount'],
      }),

      // Attendance: select only columns needed for rate calculation
      this.attendanceRepository.find({
        where: { restaurant_id: restaurantId },
        select: ['id', 'status'],
      }),
    ]);

    const totalReviews = Number(reviewStats.total_reviews) || 0;
    const averageRating = Number(reviewStats.average_rating) || 0;
    const sentimentScore = Number(reviewStats.sentiment_score) || 0;
    const totalReservations = Number(reservationStats.total_reservations) || 0;
    const noShowCount = Number(reservationStats.no_show_count) || 0;
    const noShowRate = totalReservations > 0 ? (noShowCount / totalReservations) * 100 : 0;

    return {
      overall_rating: averageRating,
      total_reviews: totalReviews,
      rating_distribution: {
        five_star: Number(reviewStats.five_star) || 0,
        four_star: Number(reviewStats.four_star) || 0,
        three_star: Number(reviewStats.three_star) || 0,
        two_star: Number(reviewStats.two_star) || 0,
        one_star: Number(reviewStats.one_star) || 0,
      },
      sentiment_score: sentimentScore,
      table_turnover_rate: 0,
      average_wait_time: 0,
      reservation_no_show_rate: noShowRate,
      staff_efficiency: this.performanceMetrics.buildStaffEfficiency(tips, attendances),
    };
  }
}
