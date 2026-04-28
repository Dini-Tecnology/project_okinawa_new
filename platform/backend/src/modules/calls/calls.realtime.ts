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
import { ServiceCall } from './entities/service-call.entity';

export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect, BeforeApplicationShutdown {
  private readonly logger = new Logger(CallsGateway.name);

  @WebSocketServer()
  server: WsServer;

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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Calls client ${client.id} auth error: ${message}`);
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

  @SubscribeMessage('joinUser')
  handleJoinUser(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.join(`user:${client.user.id}`);
    return { event: 'joined', data: { userId: client.user.id } };
  }

  @SubscribeMessage('leaveUser')
  handleLeaveUser(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.leave(`user:${client.user.id}`);
    return { event: 'left', data: { userId: client.user.id } };
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
   * AND to the user who created the call
   */
  emitCallUpdated(restaurantId: string, call: ServiceCall) {
    const payload = {
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
    };

    // Notify restaurant staff
    this.server
      .to(`restaurant:${restaurantId}:staff`)
      .emit('call:updated', payload);

    // Notify the user who created the call
    if (call.user_id) {
      this.server
        .to(`user:${call.user_id}`)
        .emit('call:updated', payload);
    }
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
