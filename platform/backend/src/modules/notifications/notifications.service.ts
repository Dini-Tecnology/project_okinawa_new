import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan } from 'typeorm';
import { Notification, NotificationType, RelatedType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { EventsGateway } from '@/modules/events/events.realtime';
import { PAGINATION } from '@common/constants/limits';

// Re-export for consumers
export { NotificationType, RelatedType } from './entities/notification.entity';

export interface NotificationPayload {
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  related_id?: string;
  related_type?: RelatedType;
  metadata?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Create a notification and send via WebSocket
   */
  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      user_id: createNotificationDto.user_id,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      notification_type: createNotificationDto.type || NotificationType.SYSTEM,
      metadata: createNotificationDto.data || {},
      is_read: false,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Send real-time notification via WebSocket
    this.eventsGateway.notifyUser(createNotificationDto.user_id, {
      id: savedNotification.id,
      type: savedNotification.notification_type,
      title: savedNotification.title,
      message: savedNotification.message,
      created_at: savedNotification.created_at,
      metadata: savedNotification.metadata,
    });

    return savedNotification;
  }

  /**
   * Bulk create notifications (useful for broadcasting)
   */
  async createBulk(notifications: NotificationPayload[]) {
    const createdNotifications = [];

    for (const notifData of notifications) {
      const notification = await this.create({
        user_id: notifData.user_id,
        title: notifData.title,
        message: notifData.message,
        type: notifData.notification_type,
        data: notifData.metadata,
      });

      createdNotifications.push(notification);
    }

    return createdNotifications;
  }

  /**
   * Send notification to all users of a restaurant (staff)
   */
  async notifyRestaurantStaff(
    restaurantId: string,
    title: string,
    message: string,
    type: NotificationType | string,
    metadata?: Record<string, any>,
  ) {
    // This would require UserRole repository to get all staff
    // For now, emit via WebSocket to restaurant room
    this.eventsGateway.notifyRestaurant(restaurantId, {
      type: 'notification',
      title,
      message,
      notification_type: type,
      metadata,
    });

    return { message: 'Notification sent to restaurant staff' };
  }

  /**
   * Get all notifications for a user
   */
  async findAllByUser(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      type?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const limit = Math.min(Math.max(options?.limit || PAGINATION.NOTIFICATIONS_DEFAULT, 1), PAGINATION.NOTIFICATIONS_MAX);
    const offset = Math.min(Math.max(options?.offset || 0, 0), PAGINATION.NOTIFICATIONS_MAX_OFFSET);

    const query = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId });

    if (options?.unreadOnly) {
      query.andWhere('notification.is_read = false');
    }

    if (options?.type) {
      query.andWhere('notification.notification_type = :type', { type: options.type });
    }

    query
      .orderBy('notification.created_at', 'DESC')
      .take(limit)
      .skip(offset);

    const notifications = await query.getMany();
    const total = await query.getCount();

    return {
      notifications,
      total,
      unread_count: await this.getUnreadCount(userId),
    };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  }

  /**
   * Get a single notification
   */
  async findOne(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.findOne(id, userId);

    if (!notification.is_read) {
      notification.is_read = true;
      notification.read_at = new Date();
      await this.notificationRepository.save(notification);

      // Emit event
      this.eventsGateway.notifyUser(userId, {
        type: 'notification:marked_as_read',
        notification_id: id,
        unread_count: await this.getUnreadCount(userId),
      });
    }

    return notification;
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(markAsReadDto: MarkAsReadDto, userId: string) {
    const notifications = await this.notificationRepository.find({
      where: {
        id: In(markAsReadDto.notification_ids),
        user_id: userId,
        is_read: false,
      },
    });

    const now = new Date();
    for (const notification of notifications) {
      notification.is_read = true;
      notification.read_at = now;
    }

    await this.notificationRepository.save(notifications);

    // Emit batch read event
    this.eventsGateway.notifyUser(userId, {
      type: 'notification:batch_read',
      count: notifications.length,
      unread_count: await this.getUnreadCount(userId),
    });

    return {
      marked_count: notifications.length,
      unread_count: await this.getUnreadCount(userId),
    };
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ is_read: true, read_at: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('is_read = false')
      .execute();

    // Emit event
    this.eventsGateway.notifyUser(userId, {
      type: 'notification:all_read',
      count: result.affected || 0,
      unread_count: 0,
    });

    return {
      marked_count: result.affected || 0,
      unread_count: 0,
    };
  }

  /**
   * Delete a notification
   */
  async remove(id: string, userId: string) {
    const notification = await this.findOne(id, userId);
    await this.notificationRepository.remove(notification);

    // Emit event
    this.eventsGateway.notifyUser(userId, {
      type: 'notification:deleted',
      notification_id: id,
      unread_count: await this.getUnreadCount(userId),
    });

    return { message: 'Notification deleted' };
  }

  /**
   * Delete all read notifications for a user
   */
  async deleteAllRead(userId: string) {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('user_id = :userId', { userId })
      .andWhere('is_read = true')
      .execute();

    return {
      deleted_count: result.affected || 0,
    };
  }

  /**
   * Get notification statistics for a user
   */
  async getStatistics(userId: string) {
    const [total, unread, last24h] = await Promise.all([
      this.notificationRepository.count({
        where: { user_id: userId },
      }),
      this.notificationRepository.count({
        where: { user_id: userId, is_read: false },
      }),
      this.notificationRepository.count({
        where: {
          user_id: userId,
          created_at: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        },
      }),
    ]);

    // Get notifications by type
    const byType = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.notification_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.user_id = :userId', { userId })
      .groupBy('notification.notification_type')
      .getRawMany();

    return {
      total,
      unread,
      last_24_hours: last24h,
      by_type: byType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  // ========== Helper Methods for Other Modules ==========

  /**
   * Notify user about new order
   */
  async notifyOrderCreated(userId: string, orderId: string, restaurantName: string) {
    return this.create({
      user_id: userId,
      title: 'Pedido Criado',
      message: `Seu pedido em ${restaurantName} foi criado com sucesso!`,
      type: NotificationType.ORDER_PLACED,
      data: {
        order_id: orderId,
        restaurant_name: restaurantName,
      },
    });
  }

  /**
   * Notify user about order status update
   */
  async notifyOrderUpdated(
    userId: string,
    orderId: string,
    status: string,
    message: string,
  ) {
    return this.create({
      user_id: userId,
      title: 'Status do Pedido Atualizado',
      message,
      type: NotificationType.ORDER_CONFIRMED,
      data: {
        order_id: orderId,
        status,
      },
    });
  }

  /**
   * Notify user that order is ready
   */
  async notifyOrderReady(userId: string, orderId: string, restaurantName: string) {
    return this.create({
      user_id: userId,
      title: 'Pedido Pronto!',
      message: `Seu pedido em ${restaurantName} está pronto para retirada!`,
      type: NotificationType.ORDER_READY,
      data: {
        order_id: orderId,
        restaurant_name: restaurantName,
        priority: 'high',
      },
    });
  }

  /**
   * Notify user about reservation confirmation
   */
  async notifyReservationConfirmed(
    userId: string,
    reservationId: string,
    restaurantName: string,
    dateTime: Date,
  ) {
    return this.create({
      user_id: userId,
      title: 'Reserva Confirmada',
      message: `Sua reserva em ${restaurantName} foi confirmada!`,
      type: NotificationType.RESERVATION_CONFIRMED,
      data: {
        reservation_id: reservationId,
        restaurant_name: restaurantName,
        date_time: dateTime,
      },
    });
  }

  /**
   * Send reservation reminder
   */
  async sendReservationReminder(
    userId: string,
    reservationId: string,
    restaurantName: string,
    dateTime: Date,
  ) {
    return this.create({
      user_id: userId,
      title: 'Lembrete de Reserva',
      message: `Sua reserva em ${restaurantName} é daqui a 30 minutos!`,
      type: NotificationType.RESERVATION_REMINDER,
      data: {
        reservation_id: reservationId,
        restaurant_name: restaurantName,
        date_time: dateTime,
        priority: 'urgent',
      },
    });
  }

  /**
   * Notify staff about tip received
   */
  async notifyTipReceived(staffId: string, amount: number, customerName?: string) {
    return this.create({
      user_id: staffId,
      title: 'Gorjeta Recebida!',
      message: customerName
        ? `Você recebeu R$ ${amount.toFixed(2)} de gorjeta de ${customerName}!`
        : `Você recebeu R$ ${amount.toFixed(2)} de gorjeta!`,
      type: NotificationType.TIP_RECEIVED,
      data: {
        amount,
        customer_name: customerName,
      },
    });
  }

  /**
   * Notify user about loyalty points earned
   */
  async notifyLoyaltyPointsEarned(
    userId: string,
    points: number,
    restaurantName: string,
  ) {
    return this.create({
      user_id: userId,
      title: 'Pontos de Fidelidade Ganhos!',
      message: `Você ganhou ${points} pontos em ${restaurantName}!`,
      type: NotificationType.LOYALTY_POINTS_EARNED,
      data: {
        points,
        restaurant_name: restaurantName,
      },
    });
  }

  /**
   * Update a notification
   */
  async update(id: string, updateNotificationDto: UpdateNotificationDto, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // SECURITY: Verify ownership
    if (notification.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    Object.assign(notification, updateNotificationDto);

    // If marking as read, set read_at timestamp
    if (updateNotificationDto.is_read === true && !notification.read_at) {
      notification.read_at = new Date();
    }

    return this.notificationRepository.save(notification);
  }
}
