import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '@/modules/orders/entities/order.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Review } from '@/modules/reviews/entities/review.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';
import { Tip } from '@/modules/tips/entities/tip.entity';
import { Attendance } from '@/modules/hr/entities/attendance.entity';
import {
  MetricsCalculatorHelper,
  SalesAggregatorHelper,
  CustomerAnalyticsHelper,
  PerformanceMetricsHelper,
} from './helpers';
import {
  SalesAnalytics,
  CustomerAnalytics,
  RestaurantPerformance,
} from './analytics.service';

@Injectable()
export class AnalyticsAggregationService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(LoyaltyProgram)
    private loyaltyRepository: Repository<LoyaltyProgram>,
    @InjectRepository(Tip)
    private tipRepository: Repository<Tip>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private metricsCalculator: MetricsCalculatorHelper,
    private salesAggregator: SalesAggregatorHelper,
    private customerAnalytics: CustomerAnalyticsHelper,
    private performanceMetrics: PerformanceMetricsHelper,
  ) {}

  /**
   * Get sales analytics for a given period.
   */
  async getSalesAnalytics(restaurantId: string, startDate: Date, endDate: Date): Promise<SalesAnalytics> {
    const orders = await this.orderRepository.find({
      where: { restaurant_id: restaurantId, created_at: Between(startDate, endDate) },
      relations: ['items'],
    });

    const totalRevenue = this.salesAggregator.calculateTotalRevenue(orders);
    const itemSales = this.salesAggregator.aggregateItemSales(orders);
    const salesByDay = this.salesAggregator.aggregateSalesByDay(orders);
    const salesByHour = this.salesAggregator.aggregateSalesByHour(orders);

    return {
      period: { start_date: startDate, end_date: endDate },
      total_revenue: totalRevenue,
      total_orders: orders.length,
      average_order_value: this.metricsCalculator.calculateAverageOrderValue(totalRevenue, orders.length),
      top_selling_items: this.salesAggregator.getTopSellingItems(itemSales),
      sales_by_day: Object.entries(salesByDay).map(([date, data]) => ({ date, ...data })),
      sales_by_hour: Object.entries(salesByHour).map(([hour, data]) => ({ hour: parseInt(hour), ...data })),
      peak_hours: this.salesAggregator.getPeakHours(salesByHour),
    };
  }

  /**
   * Get customer analytics for a given period.
   */
  async getCustomerAnalytics(restaurantId: string, startDate: Date, endDate: Date): Promise<CustomerAnalytics> {
    const orders = await this.orderRepository.find({
      where: { restaurant_id: restaurantId, created_at: Between(startDate, endDate) },
    });

    const loyaltyPrograms = await this.loyaltyRepository.find({
      where: { restaurant_id: restaurantId },
    });

    const customerSpending = this.customerAnalytics.analyzeCustomerSpending(orders);
    const totalCustomers = Object.keys(customerSpending).length;
    const { newCustomers, returningCustomers } = this.customerAnalytics.calculateCustomerRetention(customerSpending);
    const { averageVisits, averageSpend } = this.customerAnalytics.calculateCustomerAverages(orders, totalCustomers);

    return {
      total_customers: totalCustomers,
      new_customers: newCustomers,
      returning_customers: returningCustomers,
      loyalty_members: loyaltyPrograms.length,
      loyalty_distribution: this.customerAnalytics.calculateLoyaltyDistribution(loyaltyPrograms),
      average_visits_per_customer: averageVisits,
      average_spend_per_customer: averageSpend,
      top_customers: this.customerAnalytics.getTopCustomers(customerSpending, loyaltyPrograms),
    };
  }

  /**
   * Get restaurant performance metrics (reviews, reservations, tips, attendance).
   */
  async getRestaurantPerformance(restaurantId: string): Promise<RestaurantPerformance> {
    const [reviews, reservations, tips, attendances] = await Promise.all([
      this.reviewRepository.find({ where: { restaurant_id: restaurantId } }),
      this.reservationRepository.find({ where: { restaurant_id: restaurantId } }),
      this.tipRepository.find({ where: { restaurant_id: restaurantId } }),
      this.attendanceRepository.find({ where: { restaurant_id: restaurantId } }),
    ]);

    const reviewStats = this.performanceMetrics.calculateReviewStats(reviews);

    return {
      overall_rating: reviewStats.averageRating,
      total_reviews: reviewStats.totalReviews,
      rating_distribution: reviewStats.ratingDistribution,
      sentiment_score: reviewStats.sentimentScore,
      table_turnover_rate: 0,
      average_wait_time: 0,
      reservation_no_show_rate: this.performanceMetrics.calculateNoShowRate(reservations),
      staff_efficiency: this.performanceMetrics.buildStaffEfficiency(tips, attendances),
    };
  }
}
