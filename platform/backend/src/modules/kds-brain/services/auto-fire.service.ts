import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { FireSchedule } from '../entities/fire-schedule.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { OrderItem } from '@/modules/orders/entities/order-item.entity';
import { OrdersGateway } from '@/modules/orders/orders.realtime';

/**
 * Course firing order — drinks and appetizers fire immediately,
 * subsequent courses fire when the previous one completes.
 */
const COURSE_ORDER: string[] = ['drink', 'appetizer', 'main', 'dessert', 'side'];

/** Courses that fire immediately (first wave). */
const IMMEDIATE_COURSES = new Set(['drink', 'appetizer']);

/** Buffer in minutes subtracted from delivery rider ETA. */
const DELIVERY_BUFFER_MINUTES = 3;

@Injectable()
export class AutoFireService {
  private readonly logger = new Logger(AutoFireService.name);

  constructor(
    @InjectRepository(FireSchedule)
    private readonly fireScheduleRepo: Repository<FireSchedule>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    private readonly ordersGateway: OrdersGateway,
  ) {}

  // ─── Public API ──────────────────────────────────────────────────

  /**
   * Create fire schedules for every item in an order.
   * Must be called with an order that has `items` and `items.menu_item` loaded.
   */
  async createFireSchedule(order: Order): Promise<FireSchedule[]> {
    if (!order.items || order.items.length === 0) return [];

    const now = new Date();

    // Group items by course
    const byCourse = new Map<string, OrderItem[]>();
    for (const item of order.items) {
      const course = (item as any).course || (item.menu_item as any)?.course || 'main';
      if (!byCourse.has(course)) byCourse.set(course, []);
      byCourse.get(course)!.push(item);
    }

    // Sort courses by the defined order
    const sortedCourses = [...byCourse.keys()].sort(
      (a, b) => (COURSE_ORDER.indexOf(a) === -1 ? 99 : COURSE_ORDER.indexOf(a))
            - (COURSE_ORDER.indexOf(b) === -1 ? 99 : COURSE_ORDER.indexOf(b)),
    );

    // Check for delivery order with rider ETA
    const deliveryRiderEta = (order as any).delivery_rider_eta
      ? new Date((order as any).delivery_rider_eta)
      : null;

    const schedules: FireSchedule[] = [];

    for (const course of sortedCourses) {
      const items = byCourse.get(course)!;
      const isImmediate = IMMEDIATE_COURSES.has(course);

      // Find the slowest prep time in this course
      const slowestPrepMinutes = Math.max(
        ...items.map((item) =>
          item.menu_item?.preparation_time
          || (item.menu_item as any)?.estimated_prep_minutes
          || 10,
        ),
      );

      for (const item of items) {
        const itemPrepMinutes =
          item.menu_item?.preparation_time
          || (item.menu_item as any)?.estimated_prep_minutes
          || 10;

        const stationId = (item as any).station_id || (item.menu_item as any)?.station_id;
        if (!stationId) continue; // Cannot schedule without a station

        let fireAt: Date | null = null;
        let expectedReadyAt: Date | null = null;
        let fireMode: string;
        let fired = false;

        if (isImmediate) {
          // First wave — fire right now
          fireMode = 'immediate';
          fireAt = now;
          fired = true;

          // Stagger faster items so everything finishes together
          const delayMinutes = slowestPrepMinutes - itemPrepMinutes;
          const adjustedFireAt = new Date(now.getTime() + delayMinutes * 60_000);
          fireAt = adjustedFireAt;
          expectedReadyAt = new Date(adjustedFireAt.getTime() + itemPrepMinutes * 60_000);

          // Update the OrderItem fire_at so the KDS shows it
          await this.orderItemRepo.update(item.id, {
            fire_at: fireAt,
            expected_ready_at: expectedReadyAt,
          });
        } else if (deliveryRiderEta) {
          // Delivery order — calculate backward from rider ETA
          fireMode = 'auto';
          const bufferMs = DELIVERY_BUFFER_MINUTES * 60_000;
          expectedReadyAt = new Date(deliveryRiderEta.getTime() - bufferMs);
          fireAt = new Date(expectedReadyAt.getTime() - itemPrepMinutes * 60_000);

          // Stagger: adjust so all items in this course finish at the same time
          const courseReadyAt = new Date(deliveryRiderEta.getTime() - bufferMs);
          const delayMinutes = slowestPrepMinutes - itemPrepMinutes;
          fireAt = new Date(
            courseReadyAt.getTime() - slowestPrepMinutes * 60_000 + delayMinutes * 60_000,
          );
          expectedReadyAt = new Date(fireAt.getTime() + itemPrepMinutes * 60_000);
        } else {
          // Subsequent course — fire_at is null, set when previous course completes
          fireMode = 'auto';
          fireAt = null;
          expectedReadyAt = null;
        }

        const schedule = this.fireScheduleRepo.create({
          order_id: order.id,
          order_item_id: item.id,
          station_id: stationId,
          course,
          fire_at: fireAt,
          expected_ready_at: expectedReadyAt,
          fired,
          fire_mode: fireMode,
        });

        schedules.push(schedule);
      }
    }

    if (schedules.length > 0) {
      await this.fireScheduleRepo.save(schedules);
      this.logger.log(
        `Created ${schedules.length} fire schedules for order ${order.id}`,
      );
    }

    return schedules;
  }

  /**
   * Fire the next course after a completed course.
   * Sets fire_at = now for all unfired items in the next course.
   */
  async fireNextCourse(orderId: string, completedCourse: string): Promise<void> {
    const completedIndex = COURSE_ORDER.indexOf(completedCourse);
    if (completedIndex === -1) return;

    // Find the next course that has unfired schedules
    const allSchedules = await this.fireScheduleRepo.find({
      where: { order_id: orderId, fired: false },
    });

    if (allSchedules.length === 0) return;

    // Get courses present in unfired schedules, sorted by course order
    const unfiredCourses = [...new Set(allSchedules.map((s) => s.course))].sort(
      (a, b) =>
        (COURSE_ORDER.indexOf(a!) === -1 ? 99 : COURSE_ORDER.indexOf(a!))
        - (COURSE_ORDER.indexOf(b!) === -1 ? 99 : COURSE_ORDER.indexOf(b!)),
    );

    // Find the first unfired course that comes after the completed course
    const nextCourse = unfiredCourses.find((c) => {
      const idx = COURSE_ORDER.indexOf(c!);
      return idx > completedIndex;
    });

    if (!nextCourse) return;

    const now = new Date();
    const nextSchedules = allSchedules.filter((s) => s.course === nextCourse);

    // Find slowest prep time in next course
    const slowestPrepMinutes = await this.getSlowestPrepInCourse(nextSchedules);

    for (const schedule of nextSchedules) {
      const itemPrepMinutes = await this.getItemPrepMinutes(schedule.order_item_id);
      const delayMinutes = slowestPrepMinutes - itemPrepMinutes;

      schedule.fire_at = new Date(now.getTime() + delayMinutes * 60_000);
      schedule.expected_ready_at = new Date(
        schedule.fire_at.getTime() + itemPrepMinutes * 60_000,
      );
    }

    await this.fireScheduleRepo.save(nextSchedules);

    this.logger.log(
      `Fired next course "${nextCourse}" (${nextSchedules.length} items) for order ${orderId}`,
    );
  }

  // ─── Cron: Process fire queue every 30 seconds ─────────────────

  @Cron('*/30 * * * * *')
  async processFireQueue(): Promise<void> {
    const now = new Date();

    const readyToFire = await this.fireScheduleRepo.find({
      where: {
        fired: false,
        fire_at: LessThanOrEqual(now),
      },
    });

    if (readyToFire.length === 0) return;

    for (const schedule of readyToFire) {
      schedule.fired = true;
      await this.fireScheduleRepo.save(schedule);

      // Update OrderItem.fire_at so the KDS shows the item as fired
      await this.orderItemRepo.update(schedule.order_item_id, {
        fire_at: schedule.fire_at ?? undefined,
        expected_ready_at: schedule.expected_ready_at ?? undefined,
      } as any);

      // Load order to get restaurant_id for WebSocket room
      const order = await this.orderRepo.findOne({
        where: { id: schedule.order_id },
      });

      if (order) {
        this.ordersGateway.notifyOrderUpdated({
          id: order.id,
          restaurant_id: order.restaurant_id,
          user_id: order.user_id,
          status: order.status,
          kds_event: 'item:fired',
          item_id: schedule.order_item_id,
          course: schedule.course,
          fire_at: schedule.fire_at?.toISOString() ?? null,
        });
      }
    }

    this.logger.log(`Fired ${readyToFire.length} scheduled items`);
  }

  // ─── Helpers ───────────────────────────────────────────────────

  private async getSlowestPrepInCourse(schedules: FireSchedule[]): Promise<number> {
    let max = 0;
    for (const s of schedules) {
      const prep = await this.getItemPrepMinutes(s.order_item_id);
      if (prep > max) max = prep;
    }
    return max;
  }

  private async getItemPrepMinutes(orderItemId: string): Promise<number> {
    const item = await this.orderItemRepo.findOne({
      where: { id: orderItemId },
      relations: ['menu_item'],
    });
    if (!item || !item.menu_item) return 10;
    return (
      item.menu_item.preparation_time
      || (item.menu_item as any).estimated_prep_minutes
      || 10
    );
  }
}
