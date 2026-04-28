import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '@/modules/orders/entities/order-item.entity';
import { CookStation } from '../entities/cook-station.entity';
import { OrdersGateway } from '@/modules/orders/orders.realtime';
import { OrderItemStatus } from '@/common/enums';
import { AutoFireService } from './auto-fire.service';

interface StationConvergenceStatus {
  station_id: string;
  station_name: string;
  station_emoji: string | null;
  status: 'waiting' | 'preparing' | 'ready';
}

export interface ConvergenceState {
  order_id: string;
  course: string | null;
  stations: StationConvergenceStatus[];
  ready_count: number;
  total_count: number;
  is_complete: boolean;
}

@Injectable()
export class AutoSyncService {
  private readonly logger = new Logger(AutoSyncService.name);

  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(CookStation)
    private readonly cookStationRepo: Repository<CookStation>,

    private readonly ordersGateway: OrdersGateway,
    private readonly autoFireService: AutoFireService,
  ) {}

  /**
   * Get the convergence state of an order, optionally filtered by course.
   * Shows which stations are waiting, preparing, or ready.
   */
  async getConvergenceState(
    orderId: string,
    course?: string,
  ): Promise<ConvergenceState> {
    const qb = this.orderItemRepo
      .createQueryBuilder('oi')
      .where('oi.order_id = :orderId', { orderId });

    if (course) {
      qb.andWhere('oi.course = :course', { course });
    }

    // Only consider active statuses (not cancelled/delivered)
    qb.andWhere('oi.status IN (:...statuses)', {
      statuses: [OrderItemStatus.PENDING, OrderItemStatus.PREPARING, OrderItemStatus.READY],
    });

    const items = await qb.getMany();

    // Group by station_id
    const byStation = new Map<string, OrderItem[]>();
    for (const item of items) {
      const stationId = item.station_id || 'unassigned';
      if (!byStation.has(stationId)) byStation.set(stationId, []);
      byStation.get(stationId)!.push(item);
    }

    // Load station metadata
    const stationIds = [...byStation.keys()].filter((id) => id !== 'unassigned');
    const stations =
      stationIds.length > 0
        ? await this.cookStationRepo.findByIds(stationIds)
        : [];
    const stationMap = new Map(stations.map((s) => [s.id, s]));

    const stationStatuses: StationConvergenceStatus[] = [];
    let readyCount = 0;
    let totalCount = 0;

    for (const [stationId, stationItems] of byStation) {
      totalCount += stationItems.length;

      const station = stationMap.get(stationId);
      const allReady = stationItems.every(
        (i) => i.status === OrderItemStatus.READY,
      );
      const anyPreparing = stationItems.some(
        (i) => i.status === OrderItemStatus.PREPARING,
      );

      const readyItems = stationItems.filter(
        (i) => i.status === OrderItemStatus.READY,
      );
      readyCount += readyItems.length;

      let status: 'waiting' | 'preparing' | 'ready';
      if (allReady) {
        status = 'ready';
      } else if (anyPreparing) {
        status = 'preparing';
      } else {
        status = 'waiting';
      }

      stationStatuses.push({
        station_id: stationId,
        station_name: station?.name || 'Unassigned',
        station_emoji: station?.emoji || null,
        status,
      });
    }

    return {
      order_id: orderId,
      course: course || null,
      stations: stationStatuses,
      ready_count: readyCount,
      total_count: totalCount,
      is_complete: totalCount > 0 && readyCount === totalCount,
    };
  }

  /**
   * Check convergence after an item is bumped to 'ready'.
   * If all items in the same course are ready, emits a convergence:complete
   * event and triggers the next course to fire.
   */
  async checkConvergence(orderItemId: string): Promise<void> {
    const item = await this.orderItemRepo.findOne({
      where: { id: orderItemId },
      relations: ['order'],
    });

    if (!item || !item.order) return;

    const course = item.course;
    if (!course) return;

    // Get all items for the same order + same course
    const courseItems = await this.orderItemRepo.find({
      where: {
        order_id: item.order_id,
        course,
      },
    });

    // Filter to active items only (not cancelled)
    const activeItems = courseItems.filter(
      (i) => i.status !== OrderItemStatus.CANCELLED,
    );

    const allReady = activeItems.every(
      (i) => i.status === OrderItemStatus.READY,
    );

    if (allReady && activeItems.length > 0) {
      this.logger.log(
        `Convergence complete for order ${item.order_id}, course "${course}"`,
      );

      // Emit WebSocket convergence event
      this.ordersGateway.notifyOrderUpdated({
        id: item.order_id,
        restaurant_id: item.order.restaurant_id,
        user_id: item.order.user_id,
        status: item.order.status,
        kds_event: 'convergence:complete',
        course,
      });

      // Fire the next course
      await this.autoFireService.fireNextCourse(item.order_id, course);
    }
  }
}
