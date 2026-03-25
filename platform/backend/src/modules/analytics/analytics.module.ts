import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsMetricsService } from './analytics-metrics.service';
import { AnalyticsAggregationService } from './analytics-aggregation.service';
import { AnalyticsPerformanceService } from './analytics-performance.service';
import { AnalyticsForecastService } from './analytics-forecast.service';
import { AnalyticsController } from './analytics.controller';
import { Order } from '@/modules/orders/entities/order.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Review } from '@/modules/reviews/entities/review.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';
import { Tip } from '@/modules/tips/entities/tip.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';
import { FinancialTransaction } from '@/modules/financial/entities/financial-transaction.entity';
import { Attendance } from '@/modules/hr/entities/attendance.entity';
import {
  MetricsCalculatorHelper,
  SalesAggregatorHelper,
  CustomerAnalyticsHelper,
  PerformanceMetricsHelper,
  ForecastHelper,
} from './helpers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Reservation,
      Review,
      LoyaltyProgram,
      Tip,
      RestaurantTable,
      FinancialTransaction,
      Attendance,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [
    MetricsCalculatorHelper,
    SalesAggregatorHelper,
    CustomerAnalyticsHelper,
    PerformanceMetricsHelper,
    ForecastHelper,
    AnalyticsMetricsService,
    AnalyticsAggregationService,
    AnalyticsPerformanceService,
    AnalyticsForecastService,
    AnalyticsService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
