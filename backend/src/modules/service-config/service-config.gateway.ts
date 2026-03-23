import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/service-config',
  cors: { origin: '*' },
})
export class ServiceConfigGateway {
  private readonly logger = new Logger(ServiceConfigGateway.name);

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`restaurant:${data.restaurantId}`);
    this.logger.log(`Client ${client.id} joined room restaurant:${data.restaurantId}`);
    return { event: 'joined', data: { restaurantId: data.restaurantId } };
  }

  @SubscribeMessage('leaveRestaurant')
  handleLeaveRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: Socket,
  ) {
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
