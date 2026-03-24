import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Order } from '@/modules/orders/entities/order.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { RestaurantTable, TableStatus } from '@/modules/tables/entities/restaurant-table.entity';
import { Attendance } from '@/modules/hr/entities/attendance.entity';
import { MetricsCalculatorHelper } from './helpers';
import { ANALYTICS } from '@common/constants/limits';
import { DashboardMetrics } from './analytics.service';

@Injectable()
export class AnalyticsMetricsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(RestaurantTable)
    private tableRepository: Repository<RestaurantTable>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private metricsCalculator: MetricsCalculatorHelper,
  ) {}

  /**
   * Get dashboard metrics - Today, Week, Month (Optimized - Single Query)
   */
  async getDashboardMetrics(restaurantId: string): Promise<DashboardMetrics> {
    const dates = this.metricsCalculator.getDateBoundaries();

    const ordersMetrics = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        `SUM(CASE WHEN order.created_at >= :today THEN order.total_amount ELSE 0 END) as today_revenue`,
        `COUNT(CASE WHEN order.created_at >= :today THEN 1 END) as today_orders`,
        `SUM(CASE WHEN order.created_at >= :weekAgo THEN order.total_amount ELSE 0 END) as week_revenue`,
        `COUNT(CASE WHEN order.created_at >= :weekAgo THEN 1 END) as week_orders`,
        `SUM(CASE WHEN order.created_at BETWEEN :twoWeeksAgo AND :weekAgo THEN order.total_amount ELSE 0 END) as last_week_revenue`,
        `COUNT(CASE WHEN order.created_at BETWEEN :twoWeeksAgo AND :weekAgo THEN 1 END) as last_week_orders`,
        `SUM(CASE WHEN order.created_at >= :monthAgo THEN order.total_amount ELSE 0 END) as month_revenue`,
        `COUNT(CASE WHEN order.created_at >= :monthAgo THEN 1 END) as month_orders`,
        `SUM(CASE WHEN order.created_at BETWEEN :twoMonthsAgo AND :monthAgo THEN order.total_amount ELSE 0 END) as last_month_revenue`,
        `COUNT(CASE WHEN order.created_at BETWEEN :twoMonthsAgo AND :monthAgo THEN 1 END) as last_month_orders`,
      ])
      .where('order.restaurant_id = :restaurantId', { restaurantId })
      .setParameters({
        today: dates.today,
        weekAgo: dates.weekAgo,
        twoWeeksAgo: dates.twoWeeksAgo,
        monthAgo: dates.monthAgo,
        twoMonthsAgo: dates.twoMonthsAgo,
      })
      .getRawOne();

    const reservationsMetrics = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select([
        `COUNT(CASE WHEN reservation.reservation_date >= :today THEN 1 END) as today_reservations`,
        `COUNT(CASE WHEN reservation.reservation_date >= :weekAgo THEN 1 END) as week_reservations`,
        `COUNT(CASE WHEN reservation.reservation_date >= :monthAgo THEN 1 END) as month_reservations`,
      ])
      .where('reservation.restaurant_id = :restaurantId', { restaurantId })
      .setParameters({ today: dates.today, weekAgo: dates.weekAgo, monthAgo: dates.monthAgo })
      .getRawOne();

    const todayRevenue = Number(ordersMetrics.today_revenue) || 0;
    const todayOrders = Number(ordersMetrics.today_orders) || 0;
    const weekRevenue = Number(ordersMetrics.week_revenue) || 0;
    const weekOrders = Number(ordersMetrics.week_orders) || 0;
    const lastWeekRevenue = Number(ordersMetrics.last_week_revenue) || 0;
    const lastWeekOrders = Number(ordersMetrics.last_week_orders) || 0;
    const monthRevenue = Number(ordersMetrics.month_revenue) || 0;
    const monthOrders = Number(ordersMetrics.month_orders) || 0;
    const lastMonthRevenue = Number(ordersMetrics.last_month_revenue) || 0;
    const lastMonthOrders = Number(ordersMetrics.last_month_orders) || 0;

    return {
      today: this.metricsCalculator.buildPeriodMetrics(
        todayRevenue, todayOrders, Number(reservationsMetrics.today_reservations) || 0,
      ),
      week: this.metricsCalculator.buildPeriodMetrics(
        weekRevenue, weekOrders, Number(reservationsMetrics.week_reservations) || 0,
      ),
      month: this.metricsCalculator.buildPeriodMetrics(
        monthRevenue, monthOrders, Number(reservationsMetrics.month_reservations) || 0,
      ),
      comparisons: this.metricsCalculator.buildComparisonMetrics(
        weekRevenue, lastWeekRevenue, weekOrders, lastWeekOrders,
        monthRevenue, lastMonthRevenue, monthOrders, lastMonthOrders,
      ),
    };
  }

  /**
   * Get real-time metrics (last 1 hour)
   */
  async getRealTimeMetrics(restaurantId: string) {
    const oneHourAgo = new Date(Date.now() - ANALYTICS.REALTIME_HOURS_LOOKBACK * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeOrders, activeReservations, occupiedTables, staffOnDuty, recentOrders] = await Promise.all([
      this.orderRepository.count({ where: { restaurant_id: restaurantId, status: 'pending' as any } }),
      this.reservationRepository.count({
        where: { restaurant_id: restaurantId, reservation_date: MoreThanOrEqual(today), status: 'confirmed' as any },
      }),
      this.tableRepository.count({ where: { restaurant_id: restaurantId, status: TableStatus.OCCUPIED } }),
      this.attendanceRepository.count({
        where: { restaurant_id: restaurantId, date: MoreThanOrEqual(today), check_in: MoreThanOrEqual('00:00:00' as any), check_out: null as any },
      }),
      this.orderRepository.find({ where: { restaurant_id: restaurantId, created_at: MoreThanOrEqual(oneHourAgo) } }),
    ]);

    return {
      active_orders: activeOrders,
      active_reservations: activeReservations,
      occupied_tables: occupiedTables,
      staff_on_duty: staffOnDuty,
      revenue_last_hour: recentOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
    };
  }
}
