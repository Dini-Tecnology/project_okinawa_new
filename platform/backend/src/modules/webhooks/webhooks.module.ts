import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { WebhooksService } from './webhooks.service';
import { WebhookManagementService } from './webhook-management.service';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { WebhookSignatureService } from './webhook-signature.service';
import { WebhooksController } from './webhooks.controller';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookSubscription, WebhookDelivery]),
    ScheduleModule.forRoot(),
  ],
  controllers: [WebhooksController],
  providers: [
    WebhookSignatureService,
    WebhookManagementService,
    WebhookDeliveryService,
    WebhooksService,
  ],
  exports: [WebhooksService],
})
export class WebhooksModule {}
