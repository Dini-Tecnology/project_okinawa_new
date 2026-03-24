import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderGuest, OrderGuestStatus } from './entities/order-guest.entity';
import { Order } from './entities/order.entity';
import { AddOrderGuestDto } from './dto/add-order-guest.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { PAGINATION } from '@common/constants/limits';

@Injectable()
export class OrderGuestsService {
  constructor(
    @InjectRepository(OrderGuest)
    private orderGuestsRepository: Repository<OrderGuest>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Add a guest to an order (shared order)
   */
  async addGuest(
    orderId: string,
    hostUserId: string,
    addGuestDto: AddOrderGuestDto,
  ): Promise<OrderGuest> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['guests'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user is the host
    if (order.user_id !== hostUserId) {
      // Check if they are a guest with permission
      const existingGuest = order.guests?.find(
        (g) => g.guest_user_id === hostUserId && g.is_host,
      );
      if (!existingGuest) {
        throw new ForbiddenException('Only host can add guests');
      }
    }

    // Check if guest already exists
    if (addGuestDto.guest_user_id) {
      const existingGuest = order.guests?.find(
        (g) => g.guest_user_id === addGuestDto.guest_user_id,
      );
      if (existingGuest) {
        throw new BadRequestException('Guest already added to this order');
      }
    }

    // Create guest
    const guest = this.orderGuestsRepository.create({
      order_id: orderId,
      guest_user_id: addGuestDto.guest_user_id,
      guest_name: addGuestDto.guest_name,
      is_host: false,
      status: OrderGuestStatus.JOINED,
    });

    const saved = await this.orderGuestsRepository.save(guest);

    // Update order to be shared
    if (!order.is_shared) {
      await this.ordersRepository.update(orderId, { is_shared: true });
    }

    // Send notification to guest
    if (addGuestDto.guest_user_id) {
      await this.notificationsService.create({
        user_id: addGuestDto.guest_user_id,
        type: NotificationType.ORDER_GUEST_ADDED,
        title: 'Adicionado a Pedido',
        message: `Você foi adicionado a um pedido compartilhado`,
        data: {
          order_id: orderId,
          guest_id: saved.id,
        },
      });
    }

    return saved;
  }

  /**
   * Remove a guest from an order
   */
  async removeGuest(
    orderId: string,
    guestId: string,
    userId: string,
  ): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only host can remove guests
    if (order.user_id !== userId) {
      throw new ForbiddenException('Only host can remove guests');
    }

    const guest = await this.orderGuestsRepository.findOne({
      where: { id: guestId, order_id: orderId },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    await this.orderGuestsRepository.remove(guest);
  }

  /**
   * Get all guests for an order
   */
  async getOrderGuests(orderId: string): Promise<OrderGuest[]> {
    return this.orderGuestsRepository.find({
      where: { order_id: orderId },
      relations: ['guest_user'],
      order: { joined_at: 'ASC' },
    });
  }

  /**
   * Guest leaves the order
   */
  async leaveOrder(orderId: string, userId: string): Promise<void> {
    const guest = await this.orderGuestsRepository.findOne({
      where: { order_id: orderId, guest_user_id: userId },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found in this order');
    }

    if (guest.is_host) {
      throw new BadRequestException('Host cannot leave the order');
    }

    guest.status = OrderGuestStatus.LEFT;
    guest.left_at = new Date();

    await this.orderGuestsRepository.save(guest);
  }

  /**
   * Get orders where user is a guest with pagination
   */
  async getOrdersAsGuest(userId: string, page: number = 1, limit: number = PAGINATION.GUEST_ORDERS_DEFAULT) {
    const validLimit = Math.min(Math.max(1, limit), PAGINATION.GUEST_ORDERS_MAX);
    const validPage = Math.max(1, page);
    const skip = (validPage - 1) * validLimit;

    const [orders, total] = await this.orderGuestsRepository.findAndCount({
      where: { guest_user_id: userId },
      relations: ['order', 'order.restaurant', 'order.items'],
      order: { joined_at: 'DESC' },
      take: validLimit,
      skip,
    });

    return {
      data: orders,
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  /**
   * Update guest payment status
   * Only the order host, the guest themselves, or restaurant staff can update
   */
  async updateGuestPayment(
    orderId: string,
    guestId: string,
    amountPaid: number,
    userId: string,
  ): Promise<OrderGuest> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const guest = await this.orderGuestsRepository.findOne({
      where: { id: guestId, order_id: orderId },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    // Verify authorization: must be order host or the guest themselves
    const isHost = order.user_id === userId;
    const isGuest = guest.guest_user_id === userId;

    if (!isHost && !isGuest) {
      throw new ForbiddenException('Only the order host or the guest can update payment');
    }

    guest.amount_paid = amountPaid;

    const amountDue = parseFloat(guest.amount_due.toString());
    if (amountPaid >= amountDue) {
      guest.payment_completed = true;
      guest.payment_completed_at = new Date();
      guest.status = OrderGuestStatus.PAYMENT_COMPLETED;
    } else {
      guest.status = OrderGuestStatus.PAYMENT_PENDING;
    }

    return this.orderGuestsRepository.save(guest);
  }
}
