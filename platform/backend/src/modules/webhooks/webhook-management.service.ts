import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import {
  CreateWebhookSubscriptionDto,
  UpdateWebhookSubscriptionDto,
} from './dto/create-webhook-subscription.dto';
import { WebhookSignatureService } from './webhook-signature.service';

@Injectable()
export class WebhookManagementService {
  constructor(
    @InjectRepository(WebhookSubscription)
    private subscriptionRepository: Repository<WebhookSubscription>,
    @InjectRepository(WebhookDelivery)
    private deliveryRepository: Repository<WebhookDelivery>,
    private readonly signatureService: WebhookSignatureService,
  ) {}

  /**
   * Create webhook subscription with auto-generated secret.
   */
  async createSubscription(createDto: CreateWebhookSubscriptionDto) {
    const secret = this.signatureService.generateSecret();

    const subscription = this.subscriptionRepository.create({
      ...createDto,
      secret,
      is_active: true,
      failure_count: 0,
    });

    return this.subscriptionRepository.save(subscription);
  }

  /**
   * Get all subscriptions for a restaurant.
   */
  async getSubscriptions(restaurantId: string) {
    return this.subscriptionRepository.find({
      where: { restaurant_id: restaurantId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get single subscription by ID.
   */
  async getSubscription(id: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Webhook subscription not found');
    }

    return subscription;
  }

  /**
   * Update subscription.
   */
  async updateSubscription(id: string, updateDto: UpdateWebhookSubscriptionDto) {
    const subscription = await this.getSubscription(id);

    Object.assign(subscription, updateDto);

    // Reset failure count if reactivating
    if (updateDto.is_active === true && !subscription.is_active) {
      subscription.failure_count = 0;
    }

    return this.subscriptionRepository.save(subscription);
  }

  /**
   * Delete subscription.
   */
  async deleteSubscription(id: string) {
    const subscription = await this.getSubscription(id);
    await this.subscriptionRepository.remove(subscription);
    return { message: 'Webhook subscription deleted successfully' };
  }

  /**
   * Get delivery history for a subscription.
   */
  async getDeliveries(
    subscriptionId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const [deliveries, total] = await this.deliveryRepository.findAndCount({
      where: { subscription_id: subscriptionId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      deliveries,
      total,
      limit,
      offset,
    };
  }
}
