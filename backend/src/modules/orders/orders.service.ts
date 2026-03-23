import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UserRole as UserRoleEnum } from '@/common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddItemsToOrderDto } from './dto/add-items-to-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '@common/enums';
import { EventsGateway } from '@/modules/events/events.gateway';
import { LoyaltyService } from '@/modules/loyalty/loyalty.service';
import { ReservationsService } from '@/modules/reservations/reservations.service';
import { TablesService } from '@/modules/tables/tables.service';
import { PaginationDto, paginate } from '@/common/dto/pagination.dto';
import {
  OrderCalculatorHelper,
  KdsFormatterHelper,
  WaiterStatsHelper,
  MaitreFormatterHelper,
} from './helpers';

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
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private eventsGateway: EventsGateway,
    private loyaltyService: LoyaltyService,
    @Inject(forwardRef(() => ReservationsService))
    private reservationsService: ReservationsService,
    @Inject(forwardRef(() => TablesService))
    private tablesService: TablesService,
    private dataSource: DataSource,
    private orderCalculator: OrderCalculatorHelper,
    private kdsFormatter: KdsFormatterHelper,
    private waiterStatsHelper: WaiterStatsHelper,
    private maitreFormatter: MaitreFormatterHelper,
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
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.orderRepository.findAndCount({
      where: { restaurant_id: restaurantId },
      relations: ['items', 'items.menu_item', 'user'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  async findByUser(userId: string, pagination?: PaginationDto) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.orderRepository.findAndCount({
      where: { user_id: userId },
      relations: ['items', 'items.menu_item', 'restaurant'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return paginate(items, total, { page, limit } as PaginationDto);
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
      const isStaff = roles.some(role =>
        [UserRoleEnum.OWNER, UserRoleEnum.MANAGER, UserRoleEnum.WAITER, UserRoleEnum.CHEF, UserRoleEnum.BARMAN, UserRoleEnum.MAITRE].includes(role)
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
        this.logger.error(`Failed to award loyalty points for order ${order.id}: ${err.message}`, err.stack);
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
      const isStaff = roles.some(role =>
        [UserRoleEnum.OWNER, UserRoleEnum.MANAGER, UserRoleEnum.WAITER].includes(role)
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

  async getKdsOrders(params: { type?: string; status?: string; restaurant_id?: string }) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.menu_item', 'menu_item')
      .leftJoinAndSelect('order.table', 'table')
      .where('order.status IN (:...statuses)', {
        statuses: params.status
          ? [params.status]
          : [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING],
      });

    if (params.restaurant_id) {
      query.andWhere('order.restaurant_id = :restaurantId', {
        restaurantId: params.restaurant_id,
      });
    }

    const barCategories = this.kdsFormatter.getBarCategories();
    if (params.type === 'bar') {
      query.andWhere('menu_item.category IN (:...categories)', { categories: barCategories });
    } else if (params.type === 'kitchen') {
      query.andWhere('menu_item.category NOT IN (:...categories)', { categories: barCategories });
    }

    query.orderBy('order.created_at', 'ASC');
    const orders = await query.getMany();

    const waiterIds = orders.filter((o) => o.waiter_id).map((o) => o.waiter_id as string);
    const waiterMap = new Map<string, string>();

    if (waiterIds.length > 0) {
      const waiters = await this.profileRepository.find({
        where: { id: In(waiterIds) },
        select: ['id', 'full_name'],
      });
      waiters.forEach((w) => waiterMap.set(w.id, w.full_name || 'Staff'));
    }

    return this.kdsFormatter.formatOrdersForKds(orders, waiterMap);
  }

  async getWaiterTables(waiterId: string) {
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

  async getWaiterStats(waiterId: string, params: { start_date?: string; end_date?: string }) {
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

  async getMaitreOverview(restaurantId: string) {
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

  // ========== PARTIAL ORDER METHODS (EPIC 17) ==========

  /** Valid statuses that allow adding items */
  private static readonly ADDABLE_STATUSES = [
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.OPEN_FOR_ADDITIONS,
  ];

  /**
   * Mark an existing order as open for additions (comanda aberta).
   * Allows the customer or waiter to add more items later.
   */
  async openOrderForAdditions(orderId: string, userId?: string, roles?: UserRoleEnum[]) {
    const order = await this.findOne(orderId, userId, roles);

    // Only pending, confirmed, or preparing orders can be opened
    const openableStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING];
    if (!openableStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Cannot open order for additions. Current status: ${order.status}. Order must be pending, confirmed, or preparing.`,
      );
    }

    order.status = OrderStatus.OPEN_FOR_ADDITIONS;
    const updatedOrder = await this.orderRepository.save(order);

    this.eventsGateway.notifyOrderUpdate(orderId, {
      order_id: orderId,
      status: OrderStatus.OPEN_FOR_ADDITIONS,
      message: this.orderCalculator.getStatusMessage(OrderStatus.OPEN_FOR_ADDITIONS),
    });

    this.logger.log(`Order ${orderId} opened for additions`);
    return updatedOrder;
  }

  /**
   * Add items to an existing open order.
   * Validates items, calculates new totals, saves everything in a transaction.
   */
  async addItemsToExistingOrder(
    orderId: string,
    addItemsDto: AddItemsToOrderDto,
    userId: string,
    roles?: UserRoleEnum[],
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Security: verify access
    if (userId && roles) {
      const isStaff = roles.some((role) =>
        [UserRoleEnum.OWNER, UserRoleEnum.MANAGER, UserRoleEnum.WAITER].includes(role),
      );
      if (!isStaff && order.user_id !== userId) {
        throw new ForbiddenException('Access denied');
      }
    }

    // Validate order is in an addable status
    if (!OrdersService.ADDABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        `Cannot add items to order. Current status: ${order.status}. Order must be confirmed, preparing, or open_for_additions.`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate menu items
      const menuItemIds = addItemsDto.items.map((item) => item.menu_item_id);
      const menuItems = await this.menuItemRepository.find({
        where: { id: In(menuItemIds) },
      });

      if (menuItems.length !== menuItemIds.length) {
        const foundIds = menuItems.map((mi) => mi.id);
        const missingIds = menuItemIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(`Menu items not found: ${missingIds.join(', ')}`);
      }

      const menuItemMap = new Map(menuItems.map((mi) => [mi.id, mi]));
      let additionalSubtotal = 0;
      const newOrderItems: OrderItem[] = [];

      for (const itemDto of addItemsDto.items) {
        const menuItem = menuItemMap.get(itemDto.menu_item_id);

        if (!menuItem) {
          throw new NotFoundException(`Menu item ${itemDto.menu_item_id} not found`);
        }

        if (!menuItem.is_available) {
          throw new BadRequestException(`Menu item ${menuItem.name} is not available`);
        }

        const unitPrice = Number(menuItem.price);
        const totalPrice = unitPrice * itemDto.quantity;
        additionalSubtotal += totalPrice;

        const orderItem = this.orderItemRepository.create({
          order_id: orderId,
          menu_item_id: itemDto.menu_item_id,
          quantity: itemDto.quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          customizations: itemDto.customizations,
          special_instructions: itemDto.special_instructions,
          ordered_by: userId,
        });

        newOrderItems.push(orderItem);
      }

      // Save new items
      await queryRunner.manager.save(newOrderItems);

      // Recalculate totals
      const newSubtotal = Number(order.subtotal) + additionalSubtotal;
      const { taxAmount, totalAmount } = this.orderCalculator.calculateTotals(
        newSubtotal,
        Number(order.tip_amount) || 0,
      );

      order.subtotal = newSubtotal;
      order.tax_amount = taxAmount;
      order.total_amount = totalAmount;

      const updatedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      // Notify
      try {
        this.eventsGateway.notifyOrderUpdate(orderId, {
          order_id: orderId,
          status: order.status,
          message: `${addItemsDto.items.length} item(s) added`,
          items_added: addItemsDto.items.length,
          new_total: totalAmount,
        });
      } catch (notifyError) {
        const err = notifyError as Error;
        this.logger.warn(`Failed to notify items added: ${err.message}`);
      }

      this.logger.log(
        `Added ${addItemsDto.items.length} items to order ${orderId}. New total: ${totalAmount}`,
      );

      // Return updated order with items
      return this.findOne(orderId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;
      this.logger.error(`Failed to add items to order ${orderId}: ${err.message}`, err.stack);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add items to order');
    } finally {
      await queryRunner.release();
    }
  }
}
