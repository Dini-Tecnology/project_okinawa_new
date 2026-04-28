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
import { Approval } from './entities/approval.entity';

export class ApprovalsGateway implements OnGatewayConnection, OnGatewayDisconnect, BeforeApplicationShutdown {
  private readonly logger = new Logger(ApprovalsGateway.name);

  @WebSocketServer()
  server: WsServer;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.warn(`Approval client ${client.id} rejected: no token`);
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
        `Approval client connected: ${client.id} (user: ${client.user.email})`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Approval client ${client.id} auth error: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.id ?? 'unknown';
    this.logger.log(`Approval client disconnected: ${client.id} (user: ${userId})`);
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
    client.join(`restaurant:${data.restaurantId}:managers`);
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
    client.leave(`restaurant:${data.restaurantId}:managers`);
    return { event: 'left', data: { restaurantId: data.restaurantId } };
  }

  /**
   * Emit new approval request to managers/owners of the restaurant
   */
  emitNewApproval(restaurantId: string, approval: Approval) {
    this.server
      .to(`restaurant:${restaurantId}:managers`)
      .emit('approval:new', {
        id: approval.id,
        type: approval.type,
        itemName: approval.item_name,
        amount: approval.amount,
        reason: approval.reason,
        requester_id: approval.requester_id,
        createdAt: approval.created_at,
      });
  }

  /**
   * Emit resolution result to the original requester
   */
  emitResolved(requesterId: string, result: {
    id: string;
    decision: string;
    note?: string;
    resolvedBy: string;
    resolvedAt: Date;
  }) {
    this.server
      .to(`user:${requesterId}`)
      .emit('approval:resolved', result);

    // Also emit to the restaurant managers room for real-time updates
    // The restaurant_id is not passed here, so we broadcast on the approval id room
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
