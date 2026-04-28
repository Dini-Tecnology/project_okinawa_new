import {
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsServer,
} from '@common/legacy/ws-noop';
import { Logger, BeforeApplicationShutdown } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedSocket } from '@common/interfaces/authenticated-socket.interface';

export interface TabItemPayload {
  id: string;
  name: string;
  price: number;
  quantity: number;
  [key: string]: unknown;
}

export interface TabMemberPayload {
  userId: string;
  name: string;
  [key: string]: unknown;
}

export interface TabPaymentPayload {
  userId: string;
  amount: number;
  method: string;
  [key: string]: unknown;
}

export class TabsGateway implements OnGatewayConnection, OnGatewayDisconnect, BeforeApplicationShutdown {
  private readonly logger = new Logger(TabsGateway.name);

  @WebSocketServer()
  server: WsServer;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.warn(`Tab client ${client.id} rejected: no token`);
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
        `Tab client connected: ${client.id} (user: ${client.user.email})`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Tab client ${client.id} auth error: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.id ?? 'unknown';
    this.logger.log(`Tab client disconnected: ${client.id} (user: ${userId})`);
  }

  @SubscribeMessage('joinTab')
  handleJoinTab(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() tabId: string,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.join(`tab:${tabId}`);
    return { event: 'joined', tabId };
  }

  @SubscribeMessage('leaveTab')
  handleLeaveTab(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() tabId: string,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.leave(`tab:${tabId}`);
    return { event: 'left', tabId };
  }

  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { restaurantId: string },
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.join(`restaurant:${data.restaurantId}`);
    return { event: 'joined', data: { restaurantId: data.restaurantId } };
  }

  @SubscribeMessage('leaveRestaurant')
  handleLeaveRestaurant(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { restaurantId: string },
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.leave(`restaurant:${data.restaurantId}`);
    return { event: 'left', data: { restaurantId: data.restaurantId } };
  }

  /**
   * Notify all members of a tab about an update (tab room)
   */
  notifyTabUpdate(tabId: string, eventType: string, data: Record<string, unknown>) {
    const payload = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    };
    this.server.to(`tab:${tabId}`).emit('tabUpdate', payload);
  }

  /**
   * Notify restaurant staff about a tab event (restaurant room)
   */
  notifyRestaurant(restaurantId: string, eventType: string, data: Record<string, unknown>) {
    this.server.to(`restaurant:${restaurantId}`).emit(`tab:${eventType}`, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify a specific user about a tab event
   */
  notifyUser(userId: string, eventType: string, data: Record<string, unknown>) {
    this.server.to(`user:${userId}`).emit(`tab:${eventType}`, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify about new item added — emits to tab, restaurant, and host user rooms
   */
  notifyItemAdded(tabId: string, restaurantId: string, hostUserId: string, item: TabItemPayload) {
    this.notifyTabUpdate(tabId, 'item_added', item);
    this.notifyRestaurant(restaurantId, 'item_added', { tabId, ...item });
    this.notifyUser(hostUserId, 'item_added', { tabId, ...item });
  }

  /**
   * Notify about member joined
   */
  notifyMemberJoined(tabId: string, member: TabMemberPayload) {
    this.notifyTabUpdate(tabId, 'member_joined', member);
  }

  /**
   * Notify about member left
   */
  notifyMemberLeft(tabId: string, userId: string) {
    this.notifyTabUpdate(tabId, 'member_left', { userId });
  }

  /**
   * Notify about payment made — emits to tab, restaurant, and host user rooms
   */
  notifyPaymentMade(tabId: string, restaurantId: string, hostUserId: string, payment: TabPaymentPayload) {
    this.notifyTabUpdate(tabId, 'payment_made', payment);
    this.notifyRestaurant(restaurantId, 'payment_processed', { tabId, ...payment });
    this.notifyUser(hostUserId, 'payment_processed', { tabId, ...payment });
  }

  /**
   * Notify about tab closed — emits to tab, restaurant, and host user rooms
   */
  notifyTabClosed(tabId: string, restaurantId: string, hostUserId: string) {
    const data = { closedAt: new Date() };
    this.notifyTabUpdate(tabId, 'tab_closed', data);
    this.notifyRestaurant(restaurantId, 'closed', { tabId, ...data });
    this.notifyUser(hostUserId, 'closed', { tabId, ...data });
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
