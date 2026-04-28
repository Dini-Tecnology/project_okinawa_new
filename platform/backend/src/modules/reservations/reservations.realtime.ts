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

export interface ReservationEventPayload {
  id?: string;
  restaurant_id: string;
  user_id?: string;
  status?: string;
  party_size?: number;
  reservation_time?: string;
  [key: string]: unknown;
}

export class ReservationsGateway implements OnGatewayConnection, OnGatewayDisconnect, BeforeApplicationShutdown {
  private readonly logger = new Logger(ReservationsGateway.name);

  @WebSocketServer()
  server: WsServer;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.warn(`Reservations client ${client.id} rejected: no token`);
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
        `Reservations client connected: ${client.id} (user: ${client.user.email})`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Reservations client ${client.id} auth error: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.id ?? 'unknown';
    this.logger.log(`Reservations client disconnected: ${client.id} (user: ${userId})`);
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

  notifyReservationCreated(reservation: ReservationEventPayload) {
    this.server.to(`restaurant:${reservation.restaurant_id}`).emit('reservation:created', reservation);
  }

  notifyReservationUpdated(reservation: ReservationEventPayload) {
    this.server.to(`restaurant:${reservation.restaurant_id}`).emit('reservation:updated', reservation);
    this.server.to(`user:${reservation.user_id}`).emit('reservation:updated', reservation);
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
