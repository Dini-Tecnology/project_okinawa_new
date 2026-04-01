import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { UserRole as UserRoleEnum } from '@/common/enums';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository, In, DataSource, LessThan } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { RestaurantTable, TableStatus } from '@/modules/tables/entities/restaurant-table.entity';
import { WaitlistEntry, WaitlistStatus } from '@/modules/restaurant-waitlist/entities/waitlist-entry.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, OrderType } from '@common/enums';
import { EventsGateway } from '@/modules/events/events.gateway';
import { LoyaltyService } from '@/modules/loyalty/loyalty.service';
import { PaginationDto, paginate, toPaginationDto } from '@/common/dto/pagination.dto';
import { OrderCalculatorHelper } from './helpers';
import { StockService } from '@/modules/stock/services/stock.service';
import { CustomerCrmService } from '@/modules/customer-crm/services/customer-crm.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(RestaurantTable)
    private tableRepository: Repository<RestaurantTable>,
    @InjectRepository(WaitlistEntry)
    private waitlistRepository: Repository<WaitlistEntry>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private eventsGateway: EventsGateway,
    private loyaltyService: LoyaltyService,
    private dataSource: DataSource,
    private orderCalculator: OrderCalculatorHelper,
    private stockService: StockService,
    private customerCrmService: CustomerCrmService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const menuItemIds = createOrderDto.items.map((item) => item.menu_item_id);
      const menuItems = await this.menuItemRepository.find({
        where: { id: In(menuItemIds) },
      });

      if (menuItems.length !== menuItemIds.length) {
        const foundIds = menuItems.map((mi) => mi.id);
        const missingIds = menuItemIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(`Menu items not found: ${missingIds.join(', ')}`);
      }

      const menuItemMap = new Map(menuItems.map((mi) => [mi.id, mi]));
      let subtotal = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        const menuItem = menuItemMap.get(itemDto.menu_item_id);

        if (!menuItem) {
          throw new NotFoundException(`Menu item ${itemDto.menu_item_id} not found`);
        }

        if (!menuItem.is_available) {
          throw new BadRequestException(`Menu item ${menuItem.name} is not available`);
        }

        const unitPrice = Number(menuItem.price);
        const totalPrice = unitPrice * itemDto.quantity;
        subtotal += totalPrice;

        const orderItem = this.orderItemRepository.create({
          menu_item_id: itemDto.menu_item_id,
          quantity: itemDto.quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          customizations: itemDto.customizations,
          special_instructions: itemDto.special_instructions,
        });

        orderItems.push(orderItem);
      }

      // Check stock availability for each item (warning only, does not block order)
      for (const itemDto of createOrderDto.items) {
        try {
          const { available, missingIngredients } = await this.stockService.checkAvailability(
            itemDto.menu_item_id,
            createOrderDto.restaurant_id,
            itemDto.quantity,
          );
          if (!available) {
            this.logger.warn(
              `Stock insufficient for menu item ${itemDto.menu_item_id}: missing ${missingIngredients.join(', ')}`,
            );
          }
        } catch (stockCheckError) {
          const err = stockCheckError as Error;
          this.logger.warn(
            `Stock availability check failed for menu item ${itemDto.menu_item_id}: ${err.message}`,
          );
        }
      }

      const { taxAmount, totalAmount } = this.orderCalculator.calculateTotals(
        subtotal,
        createOrderDto.tip_amount || 0,
      );

      const order = this.orderRepository.create({
        restaurant_id: createOrderDto.restaurant_id,
        user_id: userId,
        table_id: createOrderDto.table_id,
        order_type: createOrderDto.order_type,
        subtotal,
        tax_amount: taxAmount,
        tip_amount: createOrderDto.tip_amount || 0,
        total_amount: totalAmount,
        special_instructions: createOrderDto.special_instructions,
        status: OrderStatus.PENDING,
        items: orderItems,
      });

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      // F8: Generate pickup code for pickup/delivery orders (Quick Service / Drive-Thru)
      if (savedOrder.order_type === OrderType.PICKUP || savedOrder.order_type === OrderType.DELIVERY) {
        try {
          const pickupCode = `#${savedOrder.id.substring(0, 4).toUpperCase()}`;
          savedOrder.metadata = { ...savedOrder.metadata, pickup_code: pickupCode };
          await this.orderRepository.save(savedOrder);
        } catch (pickupErr) {
          const err = pickupErr as Error;
          this.logger.warn(`Failed to generate pickup code for order ${savedOrder.id}: ${err.message}`);
        }
      }

      try {
        this.eventsGateway.notifyNewOrder(createOrderDto.restaurant_id, {
          order_id: savedOrder.id,
          user_id: userId,
          items: orderItems,
          total_amount: totalAmount,
          order_type: createOrderDto.order_type || 'dine_in',
          table_id: createOrderDto.table_id,
        });
      } catch (notifyError) {
        const err = notifyError as Error;
        this.logger.warn(`Failed to notify new order: ${err.message}`);
      }

      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;
      this.logger.error(`Failed to create order: ${err.message}`, err.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create order');
    } finally {
      await queryRunner.release();
    }
  }

  async findByRestaurant(restaurantId: string, pagination?: PaginationDto) {
    const dto = toPaginationDto(pagination);

    const [items, total] = await this.orderRepository.findAndCount({
      where: { restaurant_id: restaurantId },
      relations: ['items', 'items.menu_item', 'user'],
      order: { created_at: 'DESC' },
      skip: dto.offset,
      take: dto.limit,
    });

    return paginate(items, total, dto);
  }

  async findByUser(userId: string, pagination?: PaginationDto) {
    const dto = toPaginationDto(pagination);

    const [items, total] = await this.orderRepository.findAndCount({
      where: { user_id: userId },
      relations: ['items', 'items.menu_item', 'restaurant'],
      order: { created_at: 'DESC' },
      skip: dto.offset,
      take: dto.limit,
    });

    return paginate(items, total, dto);
  }

  async findOne(id: string, userId?: string, roles?: UserRoleEnum[]) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.menu_item', 'restaurant', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // SECURITY: Verify access permission
    if (userId && roles) {
      const isStaff = roles.some((role) =>
        [
          UserRoleEnum.OWNER,
          UserRoleEnum.MANAGER,
          UserRoleEnum.WAITER,
          UserRoleEnum.CHEF,
          UserRoleEnum.BARMAN,
          UserRoleEnum.MAITRE,
        ].includes(role),
      );

      // If not staff, must be the owner of the order
      if (!isStaff && order.user_id !== userId) {
        throw new ForbiddenException('Access denied');
      }
    }

    return order;
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    order.status = updateStatusDto.status;

    if (updateStatusDto.status === OrderStatus.READY) {
      order.actual_ready_at = new Date();

      // FIX-7: Push notification placeholder — order ready
      this.logger.debug(
        `[PUSH_PENDING] Notification to user ${order.user_id} — requires FCM integration`,
      );
    }

    if (updateStatusDto.status === OrderStatus.COMPLETED) {
      order.completed_at = new Date();

      try {
        await this.loyaltyService.awardPointsFromOrder(
          order.user_id,
          order.restaurant_id,
          Number(order.total_amount),
          order.id,
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Failed to award loyalty points for order ${order.id}: ${err.message}`,
          err.stack,
        );
      }

      // GAP Sprint 2: Stock deduction for each order item
      try {
        const fullOrder = await this.orderRepository.findOne({
          where: { id: order.id },
          relations: ['items'],
        });
        if (fullOrder?.items) {
          for (const item of fullOrder.items) {
            await this.stockService.deductForOrder(
              item.menu_item_id,
              order.restaurant_id,
              item.quantity,
            );
          }
        }
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Failed to deduct stock for order ${order.id}: ${err.message}`,
          err.stack,
        );
      }

      // Emit event for COGS recording + NFC-e emission (via EventEmitter2)
      this.eventEmitter.emit('order.payment.confirmed', {
        orderId: order.id,
        restaurantId: order.restaurant_id,
      });

      // GAP Sprint 2: CRM — record customer visit
      try {
        await this.customerCrmService.recordVisit(
          order.user_id,
          order.restaurant_id,
          Number(order.total_amount),
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Failed to record CRM visit for order ${order.id}: ${err.message}`,
          err.stack,
        );
      }

      // F9: Auto-award stamp if restaurant has stamp program
      try {
        await this.loyaltyService.addStamp({
          user_id: order.user_id,
          restaurant_id: order.restaurant_id,
          service_type: order.order_type || 'dine_in',
        });
      } catch {
        // Non-blocking: stamp award is best-effort
      }

      // F13: Schedule review prompt (fire-and-forget)
      // In production: use Bull queue with delay of 30 minutes
      this.logger.log(
        `TODO: Schedule review prompt for user ${order.user_id} in 30 minutes (order ${order.id.substring(0, 8)})`,
      );

      // F4: Table State Machine — free table when order completes
      if (order.table_id) {
        try {
          await this.tableRepository.update(order.table_id, {
            status: TableStatus.AVAILABLE,
            occupied_since: null as any,
          });

          this.eventsGateway.server
            .to(`restaurant:${order.restaurant_id}`)
            .emit('table:status_changed', {
              table_id: order.table_id,
              status: 'available',
            });

          this.logger.log(
            `Table ${order.table_id} freed after order ${order.id} completed`,
          );

          // F5: Waitlist Auto-Advance — notify next waiting entry when table freed
          try {
            const waitlistEntry = await this.waitlistRepository.findOne({
              where: { restaurant_id: order.restaurant_id, status: WaitlistStatus.WAITING },
              order: { created_at: 'ASC' },
            });
            if (waitlistEntry) {
              this.logger.log(
                `Auto-calling waitlist entry ${waitlistEntry.id} for freed table ${order.table_id}`,
              );
              this.eventsGateway.server
                .to(`restaurant:${order.restaurant_id}`)
                .emit('waitlist:auto_called', {
                  waitlist_entry_id: waitlistEntry.id,
                  customer_name: waitlistEntry.customer_name,
                  party_size: waitlistEntry.party_size,
                  freed_table_id: order.table_id,
                });
            }
          } catch {
            // Non-blocking: waitlist auto-advance is best-effort
          }
        } catch (error) {
          const err = error as Error;
          this.logger.error(
            `Failed to free table ${order.table_id} after order ${order.id}: ${err.message}`,
            err.stack,
          );
        }
      }
    }

    const updatedOrder = await this.orderRepository.save(order);

    this.eventsGateway.notifyOrderUpdate(id, {
      order_id: id,
      status: updateStatusDto.status,
      message: this.orderCalculator.getStatusMessage(updateStatusDto.status),
    });

    return updatedOrder;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, userId?: string, roles?: UserRoleEnum[]) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // SECURITY: Verify access permission
    if (userId && roles) {
      const isStaff = roles.some((role) =>
        [UserRoleEnum.OWNER, UserRoleEnum.MANAGER, UserRoleEnum.WAITER].includes(role),
      );

      // If not staff, must be the owner of the order
      if (!isStaff && order.user_id !== userId) {
        throw new ForbiddenException('Access denied');
      }
    }

    if (updateOrderDto.status) {
      order.status = updateOrderDto.status;

      if (updateOrderDto.status === OrderStatus.READY) {
        order.actual_ready_at = new Date();
      }
      if (updateOrderDto.status === OrderStatus.COMPLETED) {
        order.completed_at = new Date();
      }
    }

    if (updateOrderDto.special_instructions !== undefined) {
      order.special_instructions = updateOrderDto.special_instructions;
    }

    if (updateOrderDto.table_id !== undefined) {
      order.table_id = updateOrderDto.table_id;
    }

    const updatedOrder = await this.orderRepository.save(order);

    if (updateOrderDto.status) {
      this.eventsGateway.notifyOrderUpdate(id, {
        order_id: id,
        status: updateOrderDto.status,
        message: this.orderCalculator.getStatusMessage(updateOrderDto.status),
      });
    }

    return updatedOrder;
  }

  /**
   * Confirm cash payment for an order.
   * Sets status to COMPLETED, triggers loyalty points, stock deduction, and CRM visit.
   */
  async confirmCashPayment(orderId: string, staffUserId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only allow confirmation for non-terminal statuses
    const allowedStatuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.DELIVERING,
    ];

    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Order cannot be confirmed for cash payment in status "${order.status}"`,
      );
    }

    // Critical: update order status inside a transaction to guarantee atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedOrder: Order;
    try {
      order.status = OrderStatus.COMPLETED;
      order.completed_at = new Date();
      order.metadata = {
        ...(order.metadata || {}),
        payment_method: 'cash',
        cash_confirmed_by: staffUserId,
        cash_confirmed_at: new Date().toISOString(),
      };

      savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;
      this.logger.error(
        `Failed to commit cash payment for order ${orderId}: ${err.message}`,
        err.stack,
      );
      throw new InternalServerErrorException('Failed to confirm cash payment');
    } finally {
      await queryRunner.release();
    }

    // --- Best-effort downstream operations (post-payment cascade) ---
    // Each operation is independent; failures are logged with enough context for manual retry.

    // Post-payment cascade: loyalty points
    try {
      await this.loyaltyService.awardPointsFromOrder(
        order.user_id,
        order.restaurant_id,
        Number(order.total_amount),
        order.id,
      );
    } catch (error) {
      this.logger.warn({
        message: 'Post-payment cascade failed: loyalty points',
        orderId: order.id,
        userId: order.user_id,
        restaurantId: order.restaurant_id,
        error: error instanceof Error ? error.message : 'Unknown',
        retryable: true,
      });
    }

    // Post-payment cascade: stock deduction
    try {
      if (order.items) {
        for (const item of order.items) {
          await this.stockService.deductForOrder(
            item.menu_item_id,
            order.restaurant_id,
            item.quantity,
          );
        }
      }
    } catch (error) {
      this.logger.warn({
        message: 'Post-payment cascade failed: stock deduction',
        orderId: order.id,
        userId: order.user_id,
        restaurantId: order.restaurant_id,
        error: error instanceof Error ? error.message : 'Unknown',
        retryable: true,
      });
    }

    // Post-payment cascade: CRM visit
    try {
      await this.customerCrmService.recordVisit(
        order.user_id,
        order.restaurant_id,
        Number(order.total_amount),
      );
    } catch (error) {
      this.logger.warn({
        message: 'Post-payment cascade failed: CRM visit',
        orderId: order.id,
        userId: order.user_id,
        restaurantId: order.restaurant_id,
        error: error instanceof Error ? error.message : 'Unknown',
        retryable: true,
      });
    }

    // Emit event for COGS recording + NFC-e emission (via EventEmitter2)
    this.eventEmitter.emit('order.payment.confirmed', {
      orderId: order.id,
      restaurantId: order.restaurant_id,
    });

    // Free table if dine-in
    if (order.table_id) {
      try {
        await this.tableRepository.update(order.table_id, { status: TableStatus.AVAILABLE });
      } catch (error) {
        this.logger.warn({
          message: 'Post-payment cascade failed: free table',
          orderId: order.id,
          tableId: order.table_id,
          userId: order.user_id,
          restaurantId: order.restaurant_id,
          error: error instanceof Error ? error.message : 'Unknown',
          retryable: true,
        });
      }
    }

    // WebSocket notification
    this.eventsGateway.notifyOrderUpdate(orderId, {
      order_id: orderId,
      status: OrderStatus.COMPLETED,
      message: 'Pagamento em dinheiro confirmado',
    });

    return savedOrder;
  }

  /**
   * Serialize an order for restaurant staff consumption.
   * Applies LGPD data minimisation:
   * - DINE_IN orders: exclude delivery_phone and delivery_address
   * - DELIVERY orders: include all delivery info
   * - Other types: exclude delivery info (not relevant)
   */
  serializeOrderForRestaurant(order: Order): Omit<Order, 'delivery_phone' | 'delivery_address'> & {
    delivery_phone?: string;
    delivery_address?: string;
  } {
    const serialized = { ...order };

    if (order.order_type !== OrderType.DELIVERY) {
      delete (serialized as any).delivery_phone;
      delete (serialized as any).delivery_address;
    }

    return serialized;
  }

  /**
   * Serialize an array of orders for restaurant staff.
   */
  serializeOrdersForRestaurant(orders: Order[]): any[] {
    return orders.map((order) => this.serializeOrderForRestaurant(order));
  }

  /**
   * Cron: Detect orders stuck in PREPARING status for more than 2 hours.
   * Runs every 5 minutes.
   */
  @Cron('*/5 * * * *')
  async detectStuckOrders() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const stuckOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.PREPARING,
        updated_at: LessThan(twoHoursAgo),
      },
    });

    for (const order of stuckOrders) {
      this.logger.warn(`Order ${order.id} stuck in PREPARING for >2h`);
      try {
        // Notify restaurant via WebSocket
        this.eventsGateway.server
          .to(`restaurant:${order.restaurant_id}`)
          .emit('order:stuck', {
            orderId: order.id,
            status: order.status,
            stuckSince: order.updated_at,
          });
      } catch {}
    }
  }
}
