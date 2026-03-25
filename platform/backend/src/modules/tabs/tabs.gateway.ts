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

export interface TabItemPayload {
  id: string;
  name: string;
  price: number;
  quantity: number;
  [key: string]: unknown;
}

export interface TabMemberPayload {
  userId: string;
  name: string;
  [key: string]: unknown;
}

export interface TabPaymentPayload {
  userId: string;
  amount: number;
  method: string;
  [key: string]: unknown;
}

@WebSocketGateway({
  namespace: '/tabs',
  cors: getWsCorsConfig(),
})
export class TabsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TabsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.warn(`Tab client ${client.id} rejected: no token`);
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
        `Tab client connected: ${client.id} (user: ${client.user.email})`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Tab client ${client.id} auth error: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.id ?? 'unknown';
    this.logger.log(`Tab client disconnected: ${client.id} (user: ${userId})`);
  }

  @SubscribeMessage('joinTab')
  handleJoinTab(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() tabId: string,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.join(`tab:${tabId}`);
    return { event: 'joined', tabId };
  }

  @SubscribeMessage('leaveTab')
  handleLeaveTab(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() tabId: string,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }
    client.leave(`tab:${tabId}`);
    return { event: 'left', tabId };
  }

  /**
   * Notify all members of a tab about an update
   */
  notifyTabUpdate(tabId: string, eventType: string, data: Record<string, unknown>) {
    this.server.to(`tab:${tabId}`).emit('tabUpdate', {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify about new item added
   */
  notifyItemAdded(tabId: string, item: TabItemPayload) {
    this.notifyTabUpdate(tabId, 'item_added', item);
  }

  /**
   * Notify about member joined
   */
  notifyMemberJoined(tabId: string, member: TabMemberPayload) {
    this.notifyTabUpdate(tabId, 'member_joined', member);
  }

  /**
   * Notify about member left
   */
  notifyMemberLeft(tabId: string, userId: string) {
    this.notifyTabUpdate(tabId, 'member_left', { userId });
  }

  /**
   * Notify about payment made
   */
  notifyPaymentMade(tabId: string, payment: TabPaymentPayload) {
    this.notifyTabUpdate(tabId, 'payment_made', payment);
  }

  /**
   * Notify about tab closed
   */
  notifyTabClosed(tabId: string) {
    this.notifyTabUpdate(tabId, 'tab_closed', { closedAt: new Date() });
  }
}
