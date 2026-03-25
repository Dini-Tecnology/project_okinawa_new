import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedSocket } from '@common/interfaces/authenticated-socket.interface';
import { getWsCorsConfig } from '@common/config/ws-cors.config';
import { WaitlistEntry } from './entities';

export interface WaitlistUpdatePayload {
  type: 'position_change' | 'called' | 'seated' | 'cancelled' | 'no_show' | 'new_entry' | 'bar_order';
  entryId: string;
  newPosition?: number;
  estimatedWaitMinutes?: number;
  tableNumber?: string;
  queueStats: {
    totalWaiting: number;
    tablesAvailable: number;
    avgWaitMinutes: number;
  };
}

@WebSocketGateway({
  namespace: '/waitlist',
  cors: getWsCorsConfig(),
})
export class WaitlistGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WaitlistGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.warn(`Waitlist client ${client.id} rejected: no token`);
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
        `Waitlist client connected: ${client.id} (user: ${client.user.email})`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Waitlist client ${client.id} auth error: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.id ?? 'unknown';
    this.logger.log(`Waitlist client disconnected: ${client.id} (user: ${userId})`);
  }

  /**
   * Client subscribes to waitlist updates for a restaurant
   */
  @SubscribeMessage('subscribe:waitlist')
  handleSubscribeWaitlist(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { restaurantId: string },
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    const room = `waitlist:${data.restaurantId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'subscribed', restaurantId: data.restaurantId };
  }

  /**
   * Client unsubscribes from waitlist updates
   */
  @SubscribeMessage('unsubscribe:waitlist')
  handleUnsubscribeWaitlist(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { restaurantId: string },
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    const room = `waitlist:${data.restaurantId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { event: 'unsubscribed', restaurantId: data.restaurantId };
  }

  /**
   * Client subscribes to personal position updates
   */
  @SubscribeMessage('subscribe:myPosition')
  handleSubscribePosition(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { restaurantId: string; userId: string },
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    const room = `waitlist:${data.restaurantId}:user:${data.userId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to position in ${room}`);
    return { event: 'subscribed_position', ...data };
  }

  /**
   * Notify all clients in waitlist room about an update
   */
  notifyWaitlistUpdate(restaurantId: string, payload: WaitlistUpdatePayload) {
    this.server.to(`waitlist:${restaurantId}`).emit('waitlist:update', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify a specific customer that they have been called
   */
  notifyUserCalled(
    restaurantId: string,
    userId: string,
    data: { entryId: string; tableNumber?: string; message?: string },
  ) {
    this.server
      .to(`waitlist:${restaurantId}:user:${userId}`)
      .emit('waitlist:called', {
        type: 'called',
        entryId: data.entryId,
        tableNumber: data.tableNumber,
        message: data.message || 'Sua mesa esta pronta! Dirija-se a recepcao.',
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Notify a specific user about position change
   */
  notifyPositionUpdate(
    restaurantId: string,
    userId: string,
    data: { position: number; estimatedWaitMinutes: number },
  ) {
    this.server
      .to(`waitlist:${restaurantId}:user:${userId}`)
      .emit('waitlist:positionUpdate', {
        type: 'position_change',
        ...data,
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Broadcast updated queue to staff room
   */
  notifyQueueRefresh(restaurantId: string, queue: WaitlistEntry[]) {
    this.server.to(`waitlist:${restaurantId}`).emit('waitlist:queueRefresh', {
      type: 'queue_refresh',
      queue,
      timestamp: new Date().toISOString(),
    });
  }
}
