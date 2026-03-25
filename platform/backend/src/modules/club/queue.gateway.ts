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

export interface QueueEntryPayload {
  id: string;
  userId: string;
  partySize: number;
  position: number;
  status: string;
  estimatedWaitMinutes?: number;
  [key: string]: unknown;
}

export interface QueuePositionPayload {
  position: number;
  estimatedWaitMinutes: number;
  [key: string]: unknown;
}

export interface QueueStatsPayload {
  totalWaiting: number;
  avgWaitMinutes: number;
  tablesAvailable: number;
  [key: string]: unknown;
}

@WebSocketGateway({
  namespace: '/queue',
  cors: getWsCorsConfig(),
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(QueueGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.warn(`Queue client ${client.id} rejected: no token`);
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
        `Queue client connected: ${client.id} (user: ${client.user.email})`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Queue client ${client.id} auth error: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.id ?? 'unknown';
    this.logger.log(`Queue client disconnected: ${client.id} (user: ${userId})`);
  }

  @SubscribeMessage('joinQueueRoom')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() restaurantId: string,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.join(`queue:${restaurantId}`);
    return { event: 'joined', restaurantId };
  }

  @SubscribeMessage('leaveQueueRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() restaurantId: string,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.leave(`queue:${restaurantId}`);
    return { event: 'left', restaurantId };
  }

  @SubscribeMessage('subscribeToMyPosition')
  handleSubscribePosition(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { restaurantId: string; userId: string },
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.join(`queue:${data.restaurantId}:user:${data.userId}`);
    return { event: 'subscribed', ...data };
  }

  /**
   * Notify all users in queue about position updates
   */
  notifyQueueUpdate(restaurantId: string, queue: QueueEntryPayload[]) {
    this.server.to(`queue:${restaurantId}`).emit('queueUpdate', {
      type: 'queue_updated',
      queue,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify specific user about their position change
   */
  notifyPositionUpdate(restaurantId: string, userId: string, data: QueuePositionPayload) {
    this.server.to(`queue:${restaurantId}:user:${userId}`).emit('positionUpdate', {
      type: 'position_changed',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify user they are being called
   */
  notifyUserCalled(restaurantId: string, userId: string) {
    this.server.to(`queue:${restaurantId}:user:${userId}`).emit('called', {
      type: 'your_turn',
      message: 'Sua vez! Apresente-se na entrada em 5 minutos.',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify staff about queue stats update
   */
  notifyStatsUpdate(restaurantId: string, stats: QueueStatsPayload) {
    this.server.to(`queue:${restaurantId}`).emit('statsUpdate', {
      type: 'stats_updated',
      stats,
      timestamp: new Date().toISOString(),
    });
  }
}
