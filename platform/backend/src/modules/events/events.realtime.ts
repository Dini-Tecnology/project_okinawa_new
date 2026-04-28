import {
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsServer,
  WsSocket,
} from '@common/legacy/ws-noop';
import { Logger, UnauthorizedException, BeforeApplicationShutdown } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface AuthenticatedSocket extends WsSocket {
  user?: {
    id: string;
    email: string;
    roles: string[];
    restaurant_id?: string;
  };
}

export interface OrderNotificationData {
  order_id: string;
  status?: string;
  restaurant_id?: string;
  user_id?: string;
  [key: string]: unknown;
}

export interface ReservationNotificationData {
  reservation_id?: string;
  restaurant_id?: string;
  user_id?: string;
  status?: string;
  [key: string]: unknown;
}

export interface NotificationData {
  id?: string;
  type: string;
  title?: string;
  message?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect, BeforeApplicationShutdown {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: WsServer;

  private userSockets: Map<string, Set<string>> = new Map();
  private restaurantSockets: Map<string, Set<string>> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token;

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = await this.jwtService.verifyAsync(token);

      client.user = {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles || [],
        restaurant_id: payload.restaurant_id,
      };

      // Track user socket
      if (!this.userSockets.has(client.user.id)) {
        this.userSockets.set(client.user.id, new Set());
      }
      this.userSockets.get(client.user.id)?.add(client.id);

      // If user is restaurant staff, auto-join restaurant room
      if (client.user.restaurant_id) {
        const restaurantRoom = `restaurant:${client.user.restaurant_id}`;
        client.join(restaurantRoom);

        if (!this.restaurantSockets.has(client.user.restaurant_id)) {
          this.restaurantSockets.set(client.user.restaurant_id, new Set());
        }
        this.restaurantSockets.get(client.user.restaurant_id)?.add(client.id);

        this.logger.log(
          `Staff ${client.user.email} joined restaurant room: ${restaurantRoom}`
        );
      }

      this.logger.log(`Client connected: ${client.id} (${client.user.email})`);
    } catch (error) {
      this.logger.error('WebSocket auth error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      const userSocketSet = this.userSockets.get(client.user.id);
      if (userSocketSet) {
        userSocketSet.delete(client.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(client.user.id);
        }
      }

      if (client.user.restaurant_id) {
        const restaurantSocketSet = this.restaurantSockets.get(
          client.user.restaurant_id
        );
        if (restaurantSocketSet) {
          restaurantSocketSet.delete(client.id);
          if (restaurantSocketSet.size === 0) {
            this.restaurantSockets.delete(client.user.restaurant_id);
          }
        }
      }

      this.logger.log(`Client disconnected: ${client.id} (${client.user.email})`);
    }
  }

  // Order events
  @SubscribeMessage('order:join')
  handleOrderJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { order_id: string }
  ) {
    client.join(`order:${data.order_id}`);
    this.logger.debug(`Client ${client.id} joined order room: ${data.order_id}`);
  }

  @SubscribeMessage('order:leave')
  handleOrderLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { order_id: string }
  ) {
    client.leave(`order:${data.order_id}`);
  }

  @SubscribeMessage('order:status_update')
  handleOrderStatusUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { order_id: string; status: string; estimated_time?: number }
  ) {
    // Broadcast to order room (customer listening)
    this.server.to(`order:${data.order_id}`).emit('order:update', {
      order_id: data.order_id,
      status: data.status,
      estimated_time: data.estimated_time,
      updated_by: client.user?.email,
    });
  }

  @SubscribeMessage('order:ready')
  handleOrderReady(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { order_id: string }
  ) {
    this.server.to(`order:${data.order_id}`).emit('order:update', {
      order_id: data.order_id,
      status: 'ready',
      message: 'Your order is ready!',
    });
  }

  // Restaurant events
  @SubscribeMessage('restaurant:join')
  handleRestaurantJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { restaurant_id: string }
  ) {
    client.join(`restaurant:${data.restaurant_id}`);
    this.logger.debug(`Client ${client.id} joined restaurant room: ${data.restaurant_id}`);
  }

  @SubscribeMessage('restaurant:leave')
  handleRestaurantLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { restaurant_id: string }
  ) {
    client.leave(`restaurant:${data.restaurant_id}`);
  }

  // Reservation events
  @SubscribeMessage('reservation:join')
  handleReservationJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { reservation_id: string }
  ) {
    client.join(`reservation:${data.reservation_id}`);
    this.logger.debug(`Client ${client.id} joined reservation room: ${data.reservation_id}`);
  }

  @SubscribeMessage('reservation:leave')
  handleReservationLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { reservation_id: string }
  ) {
    client.leave(`reservation:${data.reservation_id}`);
  }

  // Table events
  @SubscribeMessage('table:status_update')
  handleTableStatusUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { table_id: string; status: string }
  ) {
    if (client.user?.restaurant_id) {
      this.server
        .to(`restaurant:${client.user.restaurant_id}`)
        .emit('table:update', {
          table_id: data.table_id,
          status: data.status,
          updated_by: client.user.email,
        });
    }
  }

  // Public methods to be called by services

  notifyNewOrder(restaurantId: string, orderData: OrderNotificationData) {
    this.server.to(`restaurant:${restaurantId}`).emit('order:new', orderData);
  }

  notifyOrderUpdate(orderId: string, updateData: OrderNotificationData) {
    this.server.to(`order:${orderId}`).emit('order:update', updateData);
  }

  notifyOrderCancelled(orderId: string, restaurantId: string, data: OrderNotificationData) {
    // Notify restaurant
    this.server.to(`restaurant:${restaurantId}`).emit('order:cancelled', data);
    // Notify customer
    this.server.to(`order:${orderId}`).emit('order:update', {
      ...data,
      order_id: orderId,
      status: 'cancelled',
    });
  }

  notifyNewReservation(restaurantId: string, reservationData: ReservationNotificationData) {
    this.server
      .to(`restaurant:${restaurantId}`)
      .emit('reservation:new', reservationData);
  }

  notifyReservationUpdate(reservationId: string, updateData: ReservationNotificationData) {
    // Notify the reservation room
    this.server.to(`reservation:${reservationId}`).emit('reservation:update', updateData);
  }

  notifyReservationConfirmed(reservationId: string, userId: string, data: ReservationNotificationData) {
    // Notify reservation room
    this.server.to(`reservation:${reservationId}`).emit('reservation:confirmed', {
      reservation_id: reservationId,
      ...data,
    });
    // Also notify user directly
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.forEach((socketId) => {
        this.server.to(socketId).emit('reservation:confirmed', {
          reservation_id: reservationId,
          ...data,
        });
      });
    }
  }

  notifyReservationCancelled(reservationId: string, restaurantId: string, userId: string, data: ReservationNotificationData) {
    // Notify restaurant
    this.server.to(`restaurant:${restaurantId}`).emit('reservation:cancelled', {
      reservation_id: reservationId,
      ...data,
    });
    // Notify user
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.forEach((socketId) => {
        this.server.to(socketId).emit('reservation:cancelled', {
          reservation_id: reservationId,
          ...data,
        });
      });
    }
  }

  notifyUser(userId: string, notification: NotificationData) {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
        this.server.to(socketId).emit('notification:new', notification);
      });
    }
  }

  notifyRestaurant(restaurantId: string, notification: NotificationData) {
    this.server
      .to(`restaurant:${restaurantId}`)
      .emit('notification', notification);
    this.server
      .to(`restaurant:${restaurantId}`)
      .emit('notification:new', notification);
  }

  // Notification specific events
  @SubscribeMessage('notification:join')
  handleNotificationJoin(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.user) {
      client.join(`user:${client.user.id}:notifications`);
      this.logger.debug(`Client ${client.id} joined notification room for user: ${client.user.id}`);
    }
  }

  @SubscribeMessage('notification:leave')
  handleNotificationLeave(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.user) {
      client.leave(`user:${client.user.id}:notifications`);
    }
  }

  @SubscribeMessage('notification:mark_read')
  handleNotificationMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notification_id: string }
  ) {
    if (client.user) {
      // Broadcast to all user's devices
      const userSocketSet = this.userSockets.get(client.user.id);
      if (userSocketSet) {
        userSocketSet.forEach((socketId) => {
          if (socketId !== client.id) {
            this.server.to(socketId).emit('notification:read', {
              notification_id: data.notification_id,
            });
          }
        });
      }
    }
  }

  @SubscribeMessage('notification:mark_all_read')
  handleNotificationMarkAllRead(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.user) {
      const userSocketSet = this.userSockets.get(client.user.id);
      if (userSocketSet) {
        userSocketSet.forEach((socketId) => {
          if (socketId !== client.id) {
            this.server.to(socketId).emit('notification:all_read', {
              user_id: client.user?.id,
            });
          }
        });
      }
    }
  }

  // Public method to send notification with badge update
  sendNotification(userId: string, notification: NotificationData) {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.forEach((socketId) => {
        this.server.to(socketId).emit('notification:new', notification);
      });
    }
  }

  // Public method to update unread count
  updateUnreadCount(userId: string, count: number) {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.forEach((socketId) => {
        this.server.to(socketId).emit('notification:unread_count', { count });
      });
    }
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    const userSocketSet = this.userSockets.get(userId);
    return userSocketSet ? userSocketSet.size > 0 : false;
  }

  // Get online users for a restaurant
  getOnlineRestaurantStaff(restaurantId: string): number {
    const restaurantSocketSet = this.restaurantSockets.get(restaurantId);
    return restaurantSocketSet ? restaurantSocketSet.size : 0;
  }

  async beforeApplicationShutdown() {
    this.logger.log('Shutting down — disconnecting all clients...');
    if (this.server) {
      const sockets = await this.server.fetchSockets();
      for (const socket of sockets) {
        socket.disconnect(true);
      }
    }
  }
}
