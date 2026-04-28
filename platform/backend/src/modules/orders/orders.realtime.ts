import {
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsServer,
} from '@common/legacy/ws-noop';
import { Logger, BeforeApplicationShutdown } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedSocket } from '@common/interfaces/authenticated-socket.interface';
import { OrdersService } from './orders.service';

export interface OrderEventPayload {
  id?: string;
  restaurant_id: string;
  user_id?: string;
  status?: string;
  items?: Array<{ menu_item_id: string; quantity: number; price: number }>;
  total_amount?: number;
  [key: string]: unknown;
}

export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect, BeforeApplicationShutdown {
  private readonly logger = new Logger(OrdersGateway.name);

  @WebSocketServer()
  server: WsServer;

  constructor(
    private ordersService: OrdersService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.warn(`Orders client ${client.id} rejected: no token`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);

      client.user = {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles || [],
        restaurant_id: payload.restaurant_id,
      };

      this.logger.log(
        `Orders client connected: ${client.id} (user: ${client.user.email})`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Orders client ${client.id} auth error: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.id ?? 'unknown';
    this.logger.log(`Orders client disconnected: ${client.id} (user: ${userId})`);
  }

  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.join(`restaurant:${data.restaurantId}`);
    return { event: 'joined', data: { restaurantId: data.restaurantId } };
  }

  @SubscribeMessage('leaveRestaurant')
  handleLeaveRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.leave(`restaurant:${data.restaurantId}`);
    return { event: 'left', data: { restaurantId: data.restaurantId } };
  }

  notifyOrderCreated(order: OrderEventPayload) {
    this.server.to(`restaurant:${order.restaurant_id}`).emit('order:created', order);
  }

  notifyOrderUpdated(order: OrderEventPayload) {
    this.server.to(`restaurant:${order.restaurant_id}`).emit('order:updated', order);
    this.server.to(`user:${order.user_id}`).emit('order:updated', order);
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
