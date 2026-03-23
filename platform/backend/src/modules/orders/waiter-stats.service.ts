import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { ReservationsService } from '@/modules/reservations/reservations.service';
import { TablesService } from '@/modules/tables/tables.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import {
  WaiterStatsHelper,
  WaiterTable,
  WaiterStatistics,
  MaitreFormatterHelper,
  MaitreOverview,
} from './helpers';

@Injectable()
export class WaiterStatsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(RestaurantTable)
    private tableRepository: Repository<RestaurantTable>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @Inject(forwardRef(() => ReservationsService))
    private reservationsService: ReservationsService,
    @Inject(forwardRef(() => TablesService))
    private tablesService: TablesService,
    private waiterStatsHelper: WaiterStatsHelper,
    private maitreFormatter: MaitreFormatterHelper,
  ) {}

  /**
   * Return all active tables currently assigned to a waiter, grouped by table.
   */
  async getWaiterTables(waiterId: string): Promise<WaiterTable[]> {
    const orders = await this.orderRepository.find({
      where: {
        waiter_id: waiterId,
        status: In(this.waiterStatsHelper.getActiveStatuses()),
      },
      relations: ['table', 'items', 'guests'],
      order: { created_at: 'DESC' },
    });

    return this.waiterStatsHelper.groupOrdersByTable(orders, waiterId);
  }

  /**
   * Calculate sales, tips, and activity statistics for a waiter over a date range.
   */
  async getWaiterStats(
    waiterId: string,
    params: { start_date?: string; end_date?: string },
  ): Promise<WaiterStatistics> {
    const { startDate, endDate } = this.waiterStatsHelper.parseDateRange(
      params.start_date,
      params.end_date,
    );

    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.created_at >= :startDate', { startDate })
      .andWhere('order.created_at <= :endDate', { endDate })
      .andWhere('order.waiter_id = :waiterId', { waiterId })
      .getMany();

    const tablesAssigned = await this.tableRepository.count({
      where: {
        assigned_waiter_id: waiterId,
        status: In(['occupied', 'reserved']),
      },
    });

    return this.waiterStatsHelper.calculateStatistics(orders, tablesAssigned);
  }

  /**
   * Build a full maitre dashboard overview: reservations, tables, and summary stats.
   */
  async getMaitreOverview(restaurantId: string): Promise<MaitreOverview> {
    const paginationParams = Object.assign(new PaginationDto(), { page: 1, limit: 100 });
    const reservationsResponse = await this.reservationsService.findByRestaurant(
      restaurantId,
      paginationParams,
    );

    const tablesPaginationParams = Object.assign(new PaginationDto(), { page: 1, limit: 100 });
    const tablesResponse = await this.tablesService.findAll(restaurantId, tablesPaginationParams);

    const waiterIds = [
      ...new Set(
        tablesResponse.items
          .filter((t: any) => t.assigned_waiter_id)
          .map((t: any) => t.assigned_waiter_id as string),
      ),
    ];

    const waiters =
      waiterIds.length > 0
        ? await this.profileRepository.find({
            where: { id: In(waiterIds) },
            select: ['id', 'full_name'],
          })
        : [];

    const waiterMap = new Map(waiters.map((w) => [w.id, w.full_name || 'Staff']));

    return this.maitreFormatter.buildOverview(
      reservationsResponse.items,
      tablesResponse.items,
      waiterMap,
    );
  }
}
