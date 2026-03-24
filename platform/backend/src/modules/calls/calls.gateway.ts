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
import { ServiceCall } from './entities/service-call.entity';

@WebSocketGateway({
  namespace: '/calls',
  cors: getWsCorsConfig(),
})
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(CallsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.warn(`Calls client ${client.id} rejected: no token`);
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
        `Calls client connected: ${client.id} (user: ${client.user.email})`,
      );
    } catch (error: any) {
      this.logger.error(`Calls client ${client.id} auth error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.id ?? 'unknown';
    this.logger.log(`Calls client disconnected: ${client.id} (user: ${userId})`);
  }

  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.join(`restaurant:${data.restaurantId}:staff`);
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
    client.leave(`restaurant:${data.restaurantId}:staff`);
    return { event: 'left', data: { restaurantId: data.restaurantId } };
  }

  /**
   * Emit a new service call to the restaurant staff room
   */
  emitNewCall(restaurantId: string, call: ServiceCall) {
    this.server
      .to(`restaurant:${restaurantId}:staff`)
      .emit('call:new', {
        id: call.id,
        restaurant_id: call.restaurant_id,
        table_id: call.table_id,
        user_id: call.user_id,
        call_type: call.call_type,
        status: call.status,
        message: call.message,
        called_at: call.called_at,
        created_at: call.created_at,
      });
  }

  /**
   * Emit call update (acknowledged, resolved, cancelled) to the restaurant staff room
   */
  emitCallUpdated(restaurantId: string, call: ServiceCall) {
    this.server
      .to(`restaurant:${restaurantId}:staff`)
      .emit('call:updated', {
        id: call.id,
        restaurant_id: call.restaurant_id,
        table_id: call.table_id,
        user_id: call.user_id,
        call_type: call.call_type,
        status: call.status,
        message: call.message,
        called_at: call.called_at,
        acknowledged_at: call.acknowledged_at,
        acknowledged_by: call.acknowledged_by,
        resolved_at: call.resolved_at,
        resolved_by: call.resolved_by,
      });
  }
}
