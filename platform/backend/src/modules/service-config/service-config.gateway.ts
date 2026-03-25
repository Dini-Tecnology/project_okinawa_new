import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedSocket } from '@common/interfaces/authenticated-socket.interface';
import { getWsCorsConfig } from '@common/config/ws-cors.config';

@WebSocketGateway({
  namespace: '/service-config',
  cors: getWsCorsConfig(),
})
export class ServiceConfigGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ServiceConfigGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.warn(`ServiceConfig client ${client.id} rejected: no token`);
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
        `ServiceConfig client connected: ${client.id} (user: ${client.user.email})`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`ServiceConfig client ${client.id} auth error: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.id ?? 'unknown';
    this.logger.log(`ServiceConfig client disconnected: ${client.id} (user: ${userId})`);
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
    this.logger.log(`Client ${client.id} joined room restaurant:${data.restaurantId}`);
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
    this.logger.log(`Client ${client.id} left room restaurant:${data.restaurantId}`);
    return { event: 'left', data: { restaurantId: data.restaurantId } };
  }

  /**
   * Emit config:updated event to all connected clients in the restaurant room.
   * Allows all apps (Restaurant App, Client App, KDS, Waiter App) to sync in real-time.
   *
   * @param restaurantId - The restaurant whose config was updated
   * @param domain - Which section changed (e.g. 'profile', 'payment_config', 'floor_layout')
   */
  emitConfigUpdated(restaurantId: string, domain: string): void {
    const payload = {
      domain,
      restaurantId,
      updatedAt: new Date(),
    };

    this.server
      .to(`restaurant:${restaurantId}`)
      .emit('config:updated', payload);

    this.logger.log(
      `Emitted config:updated for restaurant ${restaurantId}, domain: ${domain}`,
    );
  }
}
