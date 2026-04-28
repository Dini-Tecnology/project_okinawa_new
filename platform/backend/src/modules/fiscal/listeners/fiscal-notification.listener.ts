import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsGateway } from '@/modules/events/events.realtime';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { NotificationType } from '@/modules/notifications/entities/notification.entity';

/**
 * FiscalNotificationListener — Handles fiscal NFC-e events and notifies
 * restaurant staff via WebSocket + creates persistent notifications for owners.
 *
 * Events handled:
 *   - fiscal.nfce.authorized  → WebSocket to restaurant room with document details
 *   - fiscal.nfce.failed      → WebSocket fiscal:error to restaurant + notification for owner
 *   - fiscal.nfce.cancelled   → WebSocket to restaurant room
 */
@Injectable()
export class FiscalNotificationListener {
  private readonly logger = new Logger(FiscalNotificationListener.name);

  constructor(
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  @OnEvent('fiscal.nfce.authorized', { async: true })
  async handleNfceAuthorized(payload: {
    orderId: string;
    documentId: string;
    accessKey?: string;
    restaurantId: string;
  }): Promise<void> {
    try {
      this.eventsGateway.server
        .to(`restaurant:${payload.restaurantId}`)
        .emit('fiscal:authorized', {
          type: 'fiscal:authorized',
          document_id: payload.documentId,
          order_id: payload.orderId,
          access_key: payload.accessKey,
          restaurant_id: payload.restaurantId,
          timestamp: new Date().toISOString(),
        });

      this.logger.log(
        `Notified restaurant ${payload.restaurantId} — NFC-e authorized for order ${payload.orderId}`,
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Failed to notify NFC-e authorized: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('fiscal.nfce.failed', { async: true })
  async handleNfceFailed(payload: {
    orderId: string;
    documentId: string;
    errorMessage?: string;
    restaurantId: string;
  }): Promise<void> {
    try {
      // 1. WebSocket fiscal:error to restaurant room
      this.eventsGateway.server
        .to(`restaurant:${payload.restaurantId}`)
        .emit('fiscal:error', {
          type: 'fiscal:error',
          document_id: payload.documentId,
          order_id: payload.orderId,
          error_message: payload.errorMessage || 'NFC-e emission failed',
          restaurant_id: payload.restaurantId,
          timestamp: new Date().toISOString(),
        });

      // 2. Create persistent notification for owner
      const restaurant = await this.restaurantRepo.findOne({
        where: { id: payload.restaurantId },
      });

      if (restaurant?.owner_id) {
        await this.notificationsService.create({
          user_id: restaurant.owner_id,
          title: 'Erro na emissão fiscal',
          message: `Falha ao emitir NFC-e para o pedido ${payload.orderId.substring(0, 8)}. ${payload.errorMessage || 'Verifique a configuração fiscal.'}`,
          type: NotificationType.SYSTEM,
          data: {
            document_id: payload.documentId,
            order_id: payload.orderId,
            error_message: payload.errorMessage,
            restaurant_id: payload.restaurantId,
            priority: 'high',
          },
        });
      }

      this.logger.warn(
        `Notified restaurant ${payload.restaurantId} — NFC-e failed for order ${payload.orderId}: ${payload.errorMessage}`,
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Failed to notify NFC-e failure: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('fiscal.nfce.cancelled', { async: true })
  async handleNfceCancelled(payload: {
    documentId: string;
    orderId: string;
    restaurantId: string;
  }): Promise<void> {
    try {
      this.eventsGateway.server
        .to(`restaurant:${payload.restaurantId}`)
        .emit('fiscal:cancelled', {
          type: 'fiscal:cancelled',
          document_id: payload.documentId,
          order_id: payload.orderId,
          restaurant_id: payload.restaurantId,
          timestamp: new Date().toISOString(),
        });

      this.logger.log(
        `Notified restaurant ${payload.restaurantId} — NFC-e cancelled for document ${payload.documentId}`,
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Failed to notify NFC-e cancellation: ${error.message}`,
        error.stack,
      );
    }
  }
}
