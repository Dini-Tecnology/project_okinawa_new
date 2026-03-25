import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '@/modules/orders/entities/order.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';
import {
  MetricsCalculatorHelper,
  SalesAggregatorHelper,
  CustomerAnalyticsHelper,
} from './helpers';
import {
  SalesAnalytics,
  CustomerAnalytics,
} from './analytics.service';

@Injectable()
export class AnalyticsAggregationService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(LoyaltyProgram)
    private loyaltyRepository: Repository<LoyaltyProgram>,
    private metricsCalculator: MetricsCalculatorHelper,
    private salesAggregator: SalesAggregatorHelper,
    private customerAnalytics: CustomerAnalyticsHelper,
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
   *
   * Optimization: fetches orders and loyalty programs in parallel via Promise.all
   * instead of sequential awaits. Selects only required columns to reduce data
   * transferred from the database.
   */
  async getCustomerAnalytics(restaurantId: string, startDate: Date, endDate: Date): Promise<CustomerAnalytics> {
    // Parallel fetch eliminates sequential waterfall (was 2 serial round-trips)
    const [orders, loyaltyPrograms] = await Promise.all([
      this.orderRepository.find({
        where: { restaurant_id: restaurantId, created_at: Between(startDate, endDate) },
        select: ['id', 'user_id', 'total_amount', 'created_at'],
      }),
      this.loyaltyRepository.find({
        where: { restaurant_id: restaurantId },
        select: ['id', 'user_id', 'tier', 'restaurant_id'],
      }),
    ]);

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
}
