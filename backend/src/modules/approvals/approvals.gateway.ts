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
import { Server, Socket } from 'socket.io';
import { Approval } from './entities/approval.entity';

@WebSocketGateway({
  namespace: '/approvals',
  cors: {
    origin: '*',
  },
})
export class ApprovalsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ApprovalsGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Approval client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Approval client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`restaurant:${data.restaurantId}`);
    client.join(`restaurant:${data.restaurantId}:managers`);
    return { event: 'joined', data: { restaurantId: data.restaurantId } };
  }

  @SubscribeMessage('leaveRestaurant')
  handleLeaveRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: Socket,
  ) {
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
}
