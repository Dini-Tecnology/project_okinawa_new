import { Injectable } from '@nestjs/common';
import { AnalyticsMetricsService } from './analytics-metrics.service';
import { AnalyticsAggregationService } from './analytics-aggregation.service';
import { AnalyticsForecastService } from './analytics-forecast.service';

// Re-export interfaces so existing consumers are not broken
export interface DashboardMetrics {
  today: { revenue: number; orders: number; reservations: number; average_order_value: number };
  week: { revenue: number; orders: number; reservations: number; average_order_value: number };
  month: { revenue: number; orders: number; reservations: number; average_order_value: number };
  comparisons: {
    revenue_vs_last_week: number;
    orders_vs_last_week: number;
    revenue_vs_last_month: number;
    orders_vs_last_month: number;
  };
}

export interface SalesAnalytics {
  period: { start_date: Date; end_date: Date };
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  top_selling_items: Array<{ item_name: string; quantity_sold: number; revenue: number }>;
  sales_by_day: Array<{ date: string; revenue: number; orders: number }>;
  sales_by_hour: Array<{ hour: number; revenue: number; orders: number }>;
  peak_hours: Array<{ hour: number; orders: number }>;
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  loyalty_members: number;
  loyalty_distribution: Array<{ tier: string; count: number; percentage: number }>;
  average_visits_per_customer: number;
  average_spend_per_customer: number;
  top_customers: Array<{ user_id: string; total_spent: number; total_orders: number; loyalty_tier: string }>;
}

export interface RestaurantPerformance {
  overall_rating: number;
  total_reviews: number;
  rating_distribution: { five_star: number; four_star: number; three_star: number; two_star: number; one_star: number };
  sentiment_score: number;
  table_turnover_rate: number;
  average_wait_time: number;
  reservation_no_show_rate: number;
  staff_efficiency: { average_order_completion_time: number; average_tips_per_staff: number; attendance_rate: number };
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly metricsService: AnalyticsMetricsService,
    private readonly aggregationService: AnalyticsAggregationService,
    private readonly forecastService: AnalyticsForecastService,
  ) {}

  // ────────── Metrics delegates ──────────

  getDashboardMetrics(restaurantId: string): Promise<DashboardMetrics> {
    return this.metricsService.getDashboardMetrics(restaurantId);
  }

  getRealTimeMetrics(restaurantId: string) {
    return this.metricsService.getRealTimeMetrics(restaurantId);
  }

  // ────────── Aggregation delegates ──────────

  getSalesAnalytics(restaurantId: string, startDate: Date, endDate: Date): Promise<SalesAnalytics> {
    return this.aggregationService.getSalesAnalytics(restaurantId, startDate, endDate);
  }

  getCustomerAnalytics(restaurantId: string, startDate: Date, endDate: Date): Promise<CustomerAnalytics> {
    return this.aggregationService.getCustomerAnalytics(restaurantId, startDate, endDate);
  }

  getRestaurantPerformance(restaurantId: string): Promise<RestaurantPerformance> {
    return this.aggregationService.getRestaurantPerformance(restaurantId);
  }

  // ────────── Forecast delegates ──────────

  getRevenueForecast(restaurantId: string, days?: number) {
    return this.forecastService.getRevenueForecast(restaurantId, days);
  }
}
