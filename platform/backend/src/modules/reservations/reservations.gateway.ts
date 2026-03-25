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

export interface ReservationEventPayload {
  id?: string;
  restaurant_id: string;
  user_id?: string;
  status?: string;
  party_size?: number;
  reservation_time?: string;
  [key: string]: unknown;
}

@WebSocketGateway({
  namespace: '/reservations',
  cors: getWsCorsConfig(),
})
export class ReservationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ReservationsGateway.name);

  @WebSocketServer()
  server: Server;

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
}
