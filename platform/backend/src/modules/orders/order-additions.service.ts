import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { UserRole as UserRoleEnum } from '@/common/enums';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { AddItemsToOrderDto } from './dto/add-items-to-order.dto';
import { OrderStatus } from '@common/enums';
import { EventsGateway } from '@/modules/events/events.realtime';
import { OrderCalculatorHelper } from './helpers';
import { OrdersService } from './orders.service';

@Injectable()
export class OrderAdditionsService {
  private readonly logger = new Logger(OrderAdditionsService.name);

  static readonly ADDABLE_STATUSES = [
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.OPEN_FOR_ADDITIONS,
  ];

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    private eventsGateway: EventsGateway,
    private dataSource: DataSource,
    private orderCalculator: OrderCalculatorHelper,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
  ) {}

  /**
   * Mark an existing order as open for additions (comanda aberta).
   * Allows the customer or waiter to add more items later.
   */
  async openOrderForAdditions(orderId: string, userId?: string, roles?: UserRoleEnum[]) {
    const order = await this.ordersService.findOne(orderId, userId, roles);

    const openableStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING];
    if (!openableStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Cannot open order for additions. Current status: ${order.status}. Order must be pending, confirmed, or preparing.`,
      );
    }

    order.status = OrderStatus.OPEN_FOR_ADDITIONS;
    const updatedOrder = await this.orderRepository.save(order);

    const updatePayload = {
      order_id: orderId,
      status: OrderStatus.OPEN_FOR_ADDITIONS,
      message: this.orderCalculator.getStatusMessage(OrderStatus.OPEN_FOR_ADDITIONS),
    };
    this.eventsGateway.notifyOrderUpdate(orderId, updatePayload);

    // Notify restaurant room so KDS sees the status change
    if (order.restaurant_id) {
      this.eventsGateway.server
        .to(`restaurant:${order.restaurant_id}`)
        .emit('order:update', updatePayload);
    }

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
    if (!OrderAdditionsService.ADDABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        `Cannot add items to order. Current status: ${order.status}. Order must be confirmed, preparing, or open_for_additions.`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      await queryRunner.manager.save(newOrderItems);

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

      try {
        const additionPayload = {
          order_id: orderId,
          status: order.status,
          message: `${addItemsDto.items.length} item(s) added`,
          items_added: addItemsDto.items.length,
          new_total: totalAmount,
        };
        this.eventsGateway.notifyOrderUpdate(orderId, additionPayload);

        // Notify restaurant room so KDS sees new items on open orders
        if (order.restaurant_id) {
          this.eventsGateway.server
            .to(`restaurant:${order.restaurant_id}`)
            .emit('order:update', additionPayload);
        }
      } catch (notifyError) {
        const err = notifyError as Error;
        this.logger.warn(`Failed to notify items added: ${err.message}`);
      }

      this.logger.log(
        `Added ${addItemsDto.items.length} items to order ${orderId}. New total: ${totalAmount}`,
      );

      return this.ordersService.findOne(orderId);
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
