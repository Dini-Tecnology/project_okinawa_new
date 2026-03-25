import { Injectable } from '@nestjs/common';
import { WebhookManagementService } from './webhook-management.service';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { WebhookSignatureService } from './webhook-signature.service';
import {
  CreateWebhookSubscriptionDto,
  UpdateWebhookSubscriptionDto,
} from './dto/create-webhook-subscription.dto';
import { WebhookEvent } from './entities/webhook-subscription.entity';

// Re-export interface so existing consumers are not broken
export { WebhookPayload } from './webhook-delivery.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly managementService: WebhookManagementService,
    private readonly deliveryService: WebhookDeliveryService,
    private readonly signatureService: WebhookSignatureService,
  ) {}

  // ────────── Management delegates ──────────

  createSubscription(createDto: CreateWebhookSubscriptionDto) {
    return this.managementService.createSubscription(createDto);
  }

  getSubscriptions(restaurantId: string) {
    return this.managementService.getSubscriptions(restaurantId);
  }

  getSubscription(id: string) {
    return this.managementService.getSubscription(id);
  }

  updateSubscription(id: string, updateDto: UpdateWebhookSubscriptionDto) {
    return this.managementService.updateSubscription(id, updateDto);
  }

  deleteSubscription(id: string) {
    return this.managementService.deleteSubscription(id);
  }

  getDeliveries(subscriptionId: string, limit?: number, offset?: number) {
    return this.managementService.getDeliveries(subscriptionId, limit, offset);
  }

  // ────────── Delivery delegates ──────────

  triggerEvent(restaurantId: string, event: WebhookEvent, data: Record<string, unknown>) {
    return this.deliveryService.triggerEvent(restaurantId, event, data);
  }

  deliverWebhook(deliveryId: string) {
    return this.deliveryService.deliverWebhook(deliveryId);
  }

  retryDelivery(deliveryId: string) {
    return this.deliveryService.retryDelivery(deliveryId);
  }

  async testWebhook(subscriptionId: string) {
    const subscription = await this.managementService.getSubscription(subscriptionId);
    return this.deliveryService.testWebhook(subscription);
  }

  // ────────── Signature delegates ──────────

  generateSignature(payload: Record<string, unknown>, secret: string) {
    return this.signatureService.generateSignature(payload, secret);
  }

  verifySignature(payload: Record<string, unknown>, secret: string, receivedSignature: string) {
    return this.signatureService.verifySignature(payload, secret, receivedSignature);
  }
}
