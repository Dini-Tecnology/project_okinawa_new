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
import { PaginationDto, paginate, toPaginationDto } from '@/common/dto/pagination.dto';
import { OrderCalculatorHelper } from './helpers';
import { KdsService } from './kds.service';
import { WaiterStatsService } from './waiter-stats.service';
import { OrderAdditionsService } from './order-additions.service';

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
    private dataSource: DataSource,
    private orderCalculator: OrderCalculatorHelper,
    private kdsService: KdsService,
    private waiterStatsService: WaiterStatsService,
    @Inject(forwardRef(() => OrderAdditionsService))
    private orderAdditionsService: OrderAdditionsService,
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

  // ========== DELEGATION: KDS ==========

  async getKdsOrders(params: { type?: string; status?: string; restaurant_id?: string }) {
    return this.kdsService.getKdsOrders(params);
  }

  // ========== DELEGATION: WAITER / MAITRE ==========

  async getWaiterTables(waiterId: string) {
    return this.waiterStatsService.getWaiterTables(waiterId);
  }

  async getWaiterStats(waiterId: string, params: { start_date?: string; end_date?: string }) {
    return this.waiterStatsService.getWaiterStats(waiterId, params);
  }

  async getMaitreOverview(restaurantId: string) {
    return this.waiterStatsService.getMaitreOverview(restaurantId);
  }

  // ========== DELEGATION: PARTIAL ORDER ADDITIONS (EPIC 17) ==========

  async openOrderForAdditions(orderId: string, userId?: string, roles?: UserRoleEnum[]) {
    return this.orderAdditionsService.openOrderForAdditions(orderId, userId, roles);
  }

  async addItemsToExistingOrder(
    orderId: string,
    addItemsDto: AddItemsToOrderDto,
    userId: string,
    roles?: UserRoleEnum[],
  ) {
    return this.orderAdditionsService.addItemsToExistingOrder(orderId, addItemsDto, userId, roles);
  }
}
