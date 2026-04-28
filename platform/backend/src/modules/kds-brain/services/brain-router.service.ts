import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OrderItem } from '@/modules/orders/entities/order-item.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { CookStation } from '../entities/cook-station.entity';
import { PrepAnalytics } from '../entities/prep-analytics.entity';
import { OrdersGateway } from '@/modules/orders/orders.realtime';
import { OrderItemStatus, OrderStatus } from '@/common/enums';
import { KDS_MESSAGES } from '@/common/i18n/kds-brain.i18n';
import { BrainPriorityService } from './brain-priority.service';
import { AutoFireService } from './auto-fire.service';
import { AutoSyncService } from './auto-sync.service';
import { FinancialEventListenerService } from '@/modules/financial/services/financial-event-listener.service';
import { StationQueueItemDto } from '../dto/station-queue.dto';
import { ChefOverviewDto } from '../dto/chef-overview.dto';

const ACTIVE_STATUSES = [
  OrderItemStatus.PENDING,
  OrderItemStatus.PREPARING,
  OrderItemStatus.READY,
];

/** Valid KDS bump transitions: pending -> preparing -> ready */
const BUMP_TRANSITIONS: Record<string, OrderItemStatus | undefined> = {
  [OrderItemStatus.PENDING]: OrderItemStatus.PREPARING,
  [OrderItemStatus.PREPARING]: OrderItemStatus.READY,
};

/** Valid KDS undo transitions: ready -> preparing -> pending */
const UNDO_TRANSITIONS: Record<string, OrderItemStatus | undefined> = {
  [OrderItemStatus.READY]: OrderItemStatus.PREPARING,
  [OrderItemStatus.PREPARING]: OrderItemStatus.PENDING,
};

@Injectable()
export class BrainRouterService {
  private readonly logger = new Logger(BrainRouterService.name);

  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(CookStation)
    private readonly stationRepo: Repository<CookStation>,

    @InjectRepository(PrepAnalytics)
    private readonly analyticsRepo: Repository<PrepAnalytics>,

    private readonly ordersGateway: OrdersGateway,
    private readonly priorityService: BrainPriorityService,
    @Inject(forwardRef(() => AutoFireService))
    private readonly autoFireService: AutoFireService,
    @Inject(forwardRef(() => AutoSyncService))
    private readonly autoSyncService: AutoSyncService,
    private readonly financialEventListener: FinancialEventListenerService,
  ) {}

  /**
   * Get the queue of items for a specific cook station.
   *
   * Queries OrderItems where station_id matches, joins Order and MenuItem,
   * filters by active statuses (pending, preparing, ready), groups by order,
   * calculates countdown and priority for each item.
   *
   * FALLBACK: if station_id is null on items, use legacy category-based filtering
   * (items linked to menu_items that have matching station_id).
   */
  async getStationQueue(params: {
    station_id: string;
    restaurant_id: string;
    status?: string;
  }): Promise<StationQueueItemDto[]> {
    const { station_id, restaurant_id, status } = params;

    const statusFilter = status
      ? [status as OrderItemStatus]
      : ACTIVE_STATUSES;

    // Primary query: items with station_id set directly on the OrderItem
    const qb = this.orderItemRepo
      .createQueryBuilder('oi')
      .leftJoinAndSelect('oi.order', 'o')
      .leftJoinAndSelect('oi.menu_item', 'mi')
      .leftJoin('o.table', 't')
      .addSelect('t.table_number')
      .leftJoin('o.waiter', 'w')
      .addSelect(['w.first_name', 'w.last_name'])
      .where('o.restaurant_id = :restaurant_id', { restaurant_id })
      .andWhere('oi.status IN (:...statuses)', { statuses: statusFilter });

    // Try station_id on OrderItem first, fallback to MenuItem.station_id
    qb.andWhere(
      '(oi.station_id = :station_id OR (oi.station_id IS NULL AND mi.station_id = :station_id))',
      { station_id },
    );

    qb.orderBy('oi.created_at', 'ASC');

    const items = await qb.getMany();

    return items.map((item) => this.mapToQueueItem(item));
  }

  /**
   * Route order items after order creation.
   *
   * Loads order with items and their menu items, copies station_id and course
   * from MenuItem to OrderItem for each item, then saves.
   */
  async routeOrderItems(orderId: string): Promise<OrderItem[]> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menu_item'],
    });

    if (!order) {
      throw new NotFoundException(KDS_MESSAGES.ITEM_NOT_FOUND);
    }

    const updatedItems: OrderItem[] = [];

    for (const item of order.items) {
      if (!item.menu_item) continue;

      let changed = false;

      // Copy station_id from MenuItem if not already set
      if (!(item as any).station_id && (item.menu_item as any).station_id) {
        (item as any).station_id = (item.menu_item as any).station_id;
        changed = true;
      }

      // Copy course from MenuItem if not already set
      if (!(item as any).course && (item.menu_item as any).course) {
        (item as any).course = (item.menu_item as any).course;
        changed = true;
      }

      if (changed) {
        updatedItems.push(item);
      }
    }

    if (updatedItems.length > 0) {
      await this.orderItemRepo.save(updatedItems);
      this.logger.log(
        `Routed ${updatedItems.length} items for order ${orderId}`,
      );
    }

    // Create fire schedules after routing (reload order to get updated items)
    try {
      const freshOrder = await this.orderRepo.findOne({
        where: { id: orderId },
        relations: ['items', 'items.menu_item'],
      });
      if (freshOrder) {
        await this.autoFireService.createFireSchedule(freshOrder);
      }
    } catch (err) {
      const error = err as Error;
      this.logger.warn(
        `Failed to create fire schedules for order ${orderId}: ${error.message}`,
      );
    }

    return updatedItems;
  }

  /**
   * Bump an item to the next status: pending -> preparing -> ready.
   *
   * Sets prepared_at when marking ready.
   * Emits WebSocket event for real-time KDS updates.
   */
  async bumpItem(itemId: string): Promise<OrderItem> {
    const item = await this.orderItemRepo.findOne({
      where: { id: itemId },
      relations: ['order', 'menu_item'],
    });

    if (!item) {
      throw new NotFoundException(KDS_MESSAGES.ITEM_NOT_FOUND);
    }

    const nextStatus = BUMP_TRANSITIONS[item.status];
    if (!nextStatus) {
      throw new BadRequestException(KDS_MESSAGES.INVALID_STATUS_TRANSITION);
    }

    item.status = nextStatus;

    // Set prepared_at when marking as ready
    if (nextStatus === OrderItemStatus.READY) {
      item.prepared_at = new Date();
    }

    const saved = await this.orderItemRepo.save(item);

    // Emit WebSocket event
    this.ordersGateway.notifyOrderUpdated({
      id: item.order_id,
      restaurant_id: item.order.restaurant_id,
      user_id: item.order.user_id,
      status: item.order.status,
      kds_event: 'item:bumped',
      item_id: itemId,
      item_status: nextStatus,
    });

    this.logger.log(
      `Item ${itemId} bumped to ${nextStatus} (order ${item.order_id})`,
    );

    // Check convergence when item reaches 'ready'
    if (nextStatus === OrderItemStatus.READY) {
      try {
        await this.autoSyncService.checkConvergence(itemId);
      } catch (err) {
        const error = err as Error;
        this.logger.warn(
          `Convergence check failed for item ${itemId}: ${error.message}`,
        );
      }

      // Collect prep analytics (non-blocking)
      try {
        await this.collectPrepAnalytics(item);
      } catch (err) {
        const error = err as Error;
        this.logger.warn(
          `Analytics collection failed for item ${itemId}: ${error.message}`,
        );
      }

      // GAP-2: Trigger financial event for COGS recording (non-blocking)
      try {
        await this.financialEventListener.onItemReady(
          itemId,
          item.order.restaurant_id,
        );
      } catch (err) {
        const error = err as Error;
        this.logger.warn(
          `Financial event (onItemReady) failed for item ${itemId}: ${error.message}`,
        );
      }
    }

    return saved;
  }

  /**
   * Undo an item to the previous status: ready -> preparing -> pending.
   *
   * Clears prepared_at and prepared_by when going back from ready.
   * Emits WebSocket event for real-time KDS updates.
   */
  async undoItem(itemId: string): Promise<OrderItem> {
    const item = await this.orderItemRepo.findOne({
      where: { id: itemId },
      relations: ['order', 'menu_item'],
    });

    if (!item) {
      throw new NotFoundException(KDS_MESSAGES.ITEM_NOT_FOUND);
    }

    const prevStatus = UNDO_TRANSITIONS[item.status];
    if (!prevStatus) {
      throw new BadRequestException(KDS_MESSAGES.INVALID_STATUS_TRANSITION);
    }

    // Clear prepared_at/prepared_by when going back from ready
    if (item.status === OrderItemStatus.READY) {
      item.prepared_at = null as any;
      item.prepared_by = null as any;
    }

    item.status = prevStatus;

    const saved = await this.orderItemRepo.save(item);

    // Emit WebSocket event
    this.ordersGateway.notifyOrderUpdated({
      id: item.order_id,
      restaurant_id: item.order.restaurant_id,
      user_id: item.order.user_id,
      status: item.order.status,
      kds_event: 'item:undone',
      item_id: itemId,
      item_status: prevStatus,
    });

    this.logger.log(
      `Item ${itemId} undone to ${prevStatus} (order ${item.order_id})`,
    );

    return saved;
  }

  // ─── Chef Overview ──────────────────────────────────────────────

  /**
   * Build the Chef Overview for a restaurant.
   *
   * Aggregates station-level activity, kitchen-wide metrics and alerts
   * so the chef can see a bird's-eye view of the entire kitchen.
   */
  async getChefOverview(restaurantId: string): Promise<ChefOverviewDto> {
    // 1. Load all active cook-stations for this restaurant
    const stations = await this.stationRepo.find({
      where: { restaurant_id: restaurantId, is_active: true },
      order: { display_order: 'ASC' },
    });

    // 2. Load all active order items for the restaurant
    const activeItems = await this.orderItemRepo
      .createQueryBuilder('oi')
      .leftJoinAndSelect('oi.order', 'o')
      .leftJoinAndSelect('oi.menu_item', 'mi')
      .where('o.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('oi.status IN (:...statuses)', {
        statuses: [OrderItemStatus.PENDING, OrderItemStatus.PREPARING],
      })
      .getMany();

    // Map items with countdown info
    const mappedItems = activeItems.map((item) => ({
      item,
      dto: this.mapToQueueItem(item),
    }));

    // 3. Per-station aggregation
    const stationSummaries = stations.map((station) => {
      const stationItems = mappedItems.filter((mi) => {
        const stationId = (mi.item as any).station_id || (mi.item.menu_item as any)?.station_id;
        return stationId === station.id;
      });

      const lateItems = stationItems.filter((mi) => mi.dto.countdown_minutes < 0);

      const avgRemaining =
        stationItems.length > 0
          ? Math.round(
              stationItems.reduce((sum, mi) => sum + mi.dto.countdown_minutes, 0) /
                stationItems.length,
            )
          : 0;

      return {
        station_id: station.id,
        name: station.name,
        emoji: station.emoji || '',
        active_count: stationItems.length,
        late_count: lateItems.length,
        avg_remaining_minutes: avgRemaining,
      };
    });

    // 4. Kitchen-wide metrics
    const activeTableIds = new Set(
      activeItems
        .filter((item) => item.order?.table_id)
        .map((item) => item.order.table_id),
    );

    const deliveryQueue = await this.orderRepo.count({
      where: {
        restaurant_id: restaurantId,
        order_type: 'delivery' as any,
        status: In([OrderStatus.CONFIRMED, OrderStatus.PREPARING]),
      },
    });

    const avgPrepMinutes =
      mappedItems.length > 0
        ? Math.round(
            mappedItems.reduce((sum, mi) => {
              const prep =
                mi.item.menu_item?.preparation_time ||
                (mi.item.menu_item as any)?.estimated_prep_minutes ||
                10;
              return sum + prep;
            }, 0) / mappedItems.length,
          )
        : 0;

    // 5. Build alerts
    const alerts: ChefOverviewDto['alerts'] = [];

    // Late items
    for (const mi of mappedItems) {
      if (mi.dto.countdown_minutes < 0) {
        const stationId = (mi.item as any).station_id || (mi.item.menu_item as any)?.station_id;
        const station = stations.find((s) => s.id === stationId);
        alerts.push({
          type: 'item_late',
          message: `${mi.dto.item_name} is ${Math.abs(mi.dto.countdown_minutes)} min late`,
          order_id: mi.dto.order_id,
          station_name: station?.name || 'Unknown',
          minutes_late: Math.abs(mi.dto.countdown_minutes),
        });
      }
    }

    // Capacity warning: if any station has more than 20 active items
    const CAPACITY_THRESHOLD = 20;
    for (const summary of stationSummaries) {
      if (summary.active_count >= CAPACITY_THRESHOLD) {
        alerts.push({
          type: 'capacity_warning',
          message: `${summary.name} has ${summary.active_count} active items`,
          order_id: '',
          station_name: summary.name,
        });
      }
    }

    return {
      stations: stationSummaries,
      metrics: {
        active_tables: activeTableIds.size,
        delivery_queue: deliveryQueue,
        avg_prep_minutes: avgPrepMinutes,
      },
      alerts,
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────

  private mapToQueueItem(item: OrderItem): StationQueueItemDto {
    const order = item.order;
    const menuItem = item.menu_item;

    const priorityInput = {
      fire_at: (item as any).fire_at || null,
      expected_ready_at: (item as any).expected_ready_at || null,
      created_at: item.created_at,
      estimated_prep_minutes: menuItem?.preparation_time || (menuItem as any)?.estimated_prep_minutes || 10,
      delivery_rider_eta: (order as any)?.delivery_rider_eta || null,
      status: item.status,
    };

    const countdown = this.priorityService.calculateCountdown(priorityInput);
    const priority = this.priorityService.calculatePriority(priorityInput);

    return {
      order_id: order.id,
      order_item_id: item.id,
      order_number: `#${order.id.slice(0, 8)}`,
      table_number: (order as any).table?.table_number || null,
      source: (order as any).source || 'noowe',
      order_type: order.order_type,
      course: (item as any).course || null,
      item_name: menuItem?.name || 'Unknown',
      quantity: item.quantity,
      special_instructions: item.special_instructions || null,
      customizations: item.customizations || null,
      status: item.status,
      countdown_minutes: countdown,
      priority,
      is_late: countdown < 0,
      is_fired: !!(item as any).fire_at,
      fire_at: (item as any).fire_at || null,
      expected_ready_at: (item as any).expected_ready_at || null,
      waiter_name: this.formatWaiterName(order),
      delivery_rider_eta: (order as any).delivery_rider_eta || null,
      created_at: item.created_at,
    };
  }

  private formatWaiterName(order: Order): string | null {
    const waiter = (order as any).waiter;
    if (!waiter) return null;
    const first = waiter.first_name || '';
    const last = waiter.last_name || '';
    return `${first} ${last}`.trim() || null;
  }

  /**
   * Collect prep analytics when an item is bumped to 'ready'.
   * Calculates actual_prep_minutes from fire_at (or created_at) to now.
   * Non-blocking — errors are caught by the caller.
   */
  private async collectPrepAnalytics(item: OrderItem): Promise<void> {
    const now = new Date();
    const startTime = (item as any).fire_at
      ? new Date((item as any).fire_at)
      : item.created_at;

    const actualPrepMinutes = Math.round(
      (now.getTime() - startTime.getTime()) / 60_000,
    );

    const expectedPrepMinutes =
      item.menu_item?.preparation_time
      || (item.menu_item as any)?.estimated_prep_minutes
      || 10;

    const wasLate = actualPrepMinutes > expectedPrepMinutes;

    // Determine shift based on current hour
    const hour = now.getHours();
    let shift: string;
    if (hour < 15) {
      shift = 'lunch';
    } else if (hour < 23) {
      shift = 'dinner';
    } else {
      shift = 'late_night';
    }

    // Determine day of week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[now.getDay()];

    // Get source from the order
    const source = (item.order as any)?.source || 'noowe';

    const stationId = (item as any).station_id || (item.menu_item as any)?.station_id;
    if (!stationId) return; // Cannot record without a station

    const record = this.analyticsRepo.create({
      restaurant_id: item.order.restaurant_id,
      station_id: stationId,
      menu_item_id: item.menu_item_id,
      order_item_id: item.id,
      expected_prep_minutes: expectedPrepMinutes,
      actual_prep_minutes: actualPrepMinutes,
      was_late: wasLate,
      shift,
      source,
      day_of_week: dayOfWeek,
    });

    await this.analyticsRepo.save(record);

    this.logger.debug(
      `Analytics recorded for item ${item.id}: ${actualPrepMinutes}min (expected ${expectedPrepMinutes}min)`,
    );
  }
}
