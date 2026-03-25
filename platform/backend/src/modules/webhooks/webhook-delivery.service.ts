import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { AxiosError } from 'axios';
import {
  WebhookSubscription,
  WebhookEvent,
} from './entities/webhook-subscription.entity';
import {
  WebhookDelivery,
  DeliveryStatus,
} from './entities/webhook-delivery.entity';
import { WebhookSignatureService } from './webhook-signature.service';
import { CircuitBreakerService } from '@common/utils/circuit-breaker.module';
import { CircuitBreaker } from '@common/utils/circuit-breaker';
import { EXPORT } from '@common/constants/limits';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
  webhook_id: string;
}

@Injectable()
export class WebhookDeliveryService {
  private readonly logger = new Logger(WebhookDeliveryService.name);
  private readonly deliveryCircuitBreaker: CircuitBreaker;

  constructor(
    @InjectRepository(WebhookSubscription)
    private subscriptionRepository: Repository<WebhookSubscription>,
    @InjectRepository(WebhookDelivery)
    private deliveryRepository: Repository<WebhookDelivery>,
    private readonly signatureService: WebhookSignatureService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {
    this.deliveryCircuitBreaker = this.circuitBreakerService.getBreaker(
      'webhook-delivery',
      {
        failureThreshold: 10, // higher threshold — many endpoints may fail independently
        resetTimeout: 30_000,
        halfOpenMax: 2,
      },
    );
  }

  /** Trigger a webhook event -- find active subscriptions and enqueue deliveries. */
  async triggerEvent(restaurantId: string, event: WebhookEvent, data: Record<string, unknown>) {
    const subscriptions = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .where('subscription.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('subscription.is_active = true')
      .andWhere(':event = ANY(subscription.events)', { event })
      .getMany();

    if (subscriptions.length === 0) {
      this.logger.log(`No active subscriptions for event ${event} in restaurant ${restaurantId}`);
      return;
    }

    const deliveries = subscriptions.map((subscription) => {
      const payload: WebhookPayload = {
        event, timestamp: new Date().toISOString(), data, webhook_id: subscription.id,
      };
      return this.deliveryRepository.create({
        subscription_id: subscription.id, event_type: event, payload,
        status: DeliveryStatus.PENDING, retry_count: 0, max_retries: 3,
      });
    });

    await this.deliveryRepository.save(deliveries);

    for (const delivery of deliveries) {
      this.deliverWebhook(delivery.id).catch((err) =>
        this.logger.error(`Failed to deliver webhook ${delivery.id}:`, err),
      );
    }
  }

  /** Deliver webhook to endpoint via HTTP POST. */
  async deliverWebhook(deliveryId: string) {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId }, relations: ['subscription'],
    });
    if (!delivery) { this.logger.error(`Delivery ${deliveryId} not found`); return; }
    if (delivery.status === DeliveryStatus.SUCCESS) { return; }
    const subscription = delivery.subscription;
    if (!subscription.is_active) { return; }

    try {
      const signature = this.signatureService.generateSignature(delivery.payload, subscription.secret || '');
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': delivery.event_type,
        'X-Webhook-ID': delivery.id,
        'X-Webhook-Timestamp': delivery.created_at.toISOString(),
        ...subscription.headers,
      };

      const response = await this.deliveryCircuitBreaker.execute(() =>
        axios.post(subscription.url, delivery.payload, { headers, timeout: 10000 }),
      );

      delivery.status = DeliveryStatus.SUCCESS;
      delivery.response_code = response.status;
      delivery.response_body = JSON.stringify(response.data).substring(0, EXPORT.MAX_RESPONSE_BODY_LENGTH);
      delivery.delivered_at = new Date();
      subscription.last_triggered_at = new Date();
      subscription.last_success_at = new Date();
      subscription.failure_count = 0;

      await this.deliveryRepository.save(delivery);
      await this.subscriptionRepository.save(subscription);
      this.logger.log(`Webhook delivered successfully: ${deliveryId}`);
    } catch (error) {
      await this.handleDeliveryFailure(delivery, subscription, error);
    }
  }

  /** Retry a failed delivery by resetting its status and re-delivering. */
  async retryDelivery(deliveryId: string) {
    const delivery = await this.deliveryRepository.findOne({ where: { id: deliveryId } });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.status === DeliveryStatus.SUCCESS) throw new Error('Cannot retry successful delivery');

    delivery.status = DeliveryStatus.PENDING;
    delivery.next_retry_at = null;
    await this.deliveryRepository.save(delivery);
    await this.deliverWebhook(deliveryId);
    return delivery;
  }

  /** Send a test webhook to verify endpoint connectivity. */
  async testWebhook(subscription: WebhookSubscription) {
    const testPayload: WebhookPayload = {
      event: 'webhook.test', timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook delivery', subscription_id: subscription.id },
      webhook_id: subscription.id,
    };
    const delivery = this.deliveryRepository.create({
      subscription_id: subscription.id, event_type: 'webhook.test', payload: testPayload,
      status: DeliveryStatus.PENDING, retry_count: 0, max_retries: 0,
    });
    const savedDelivery = await this.deliveryRepository.save(delivery);
    await this.deliverWebhook(savedDelivery.id);
    return this.deliveryRepository.findOne({ where: { id: savedDelivery.id } });
  }

  /** Cron job to process queued retries (runs every minute). */
  @Cron(CronExpression.EVERY_MINUTE)
  async processRetries() {
    const retriableDeliveries = await this.deliveryRepository.find({
      where: { status: DeliveryStatus.RETRYING, next_retry_at: LessThan(new Date()) },
      relations: ['subscription'],
      take: EXPORT.WEBHOOK_BATCH_SIZE,
    });
    if (retriableDeliveries.length > 0) {
      this.logger.log(`Processing ${retriableDeliveries.length} webhook retries`);
    }
    for (const delivery of retriableDeliveries) {
      if (delivery.subscription.is_active) await this.deliverWebhook(delivery.id);
    }
  }

  // ── Private ────────────────────────────────────────────────────────

  /** Handle delivery failure with exponential backoff and subscription deactivation. */
  private async handleDeliveryFailure(
    delivery: WebhookDelivery, subscription: WebhookSubscription, error: unknown,
  ) {
    delivery.retry_count++;
    delivery.error_message = error instanceof Error ? error.message : String(error);

    if (error instanceof AxiosError) {
      if (error.response?.status) delivery.response_code = error.response.status;
      if (error.response?.data)
        delivery.response_body = JSON.stringify(error.response.data).substring(0, EXPORT.MAX_RESPONSE_BODY_LENGTH);
    }

    if (delivery.retry_count < delivery.max_retries) {
      delivery.status = DeliveryStatus.RETRYING;
      const delays = [60_000, 300_000, 900_000];
      const delay = delays[delivery.retry_count - 1] || 900_000;
      delivery.next_retry_at = new Date(Date.now() + delay);
      this.logger.warn(`Delivery ${delivery.id} failed, retry in ${delay / 1000}s: ${error instanceof Error ? error.message : String(error)}`);
    } else {
      delivery.status = DeliveryStatus.FAILED;
      subscription.failure_count++;
      subscription.last_failure_at = new Date();
      if (subscription.failure_count >= 10) {
        subscription.is_active = false;
        this.logger.error(`Subscription ${subscription.id} deactivated after ${subscription.failure_count} failures`);
      }
      this.logger.error(`Delivery ${delivery.id} permanently failed after ${delivery.retry_count} retries`);
    }

    subscription.last_triggered_at = new Date();
    await this.deliveryRepository.save(delivery);
    await this.subscriptionRepository.save(subscription);
  }
}
