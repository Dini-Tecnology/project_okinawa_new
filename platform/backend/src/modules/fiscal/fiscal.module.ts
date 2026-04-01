import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { FiscalDocument } from './entities/fiscal-document.entity';
import { FiscalConfig } from './entities/fiscal-config.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

// Adapters
import { FocusNfeAdapter } from './adapters/focus-nfe/focus-nfe.adapter';
import { SefazDirectAdapter } from './adapters/sefaz-direct/sefaz-direct.adapter';

// Services
import { FiscalEmissionService } from './services/fiscal-emission.service';
import { FiscalOnboardingService } from './services/fiscal-onboarding.service';
import { FiscalEventService } from './services/fiscal-event.service';

// Listeners
import { FiscalEventListener } from './listeners/fiscal-event.listener';
import { FiscalNotificationListener } from './listeners/fiscal-notification.listener';

// Controllers
import { FiscalController } from './controllers/fiscal.controller';
import { FiscalWebhookController } from './controllers/fiscal-webhook.controller';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';

/**
 * FiscalModule -- NFC-e emission with adapter pattern.
 *
 * Phase 1: Focus NFe (intermediary API)
 * Phase 2: SEFAZ Direct (direct webservice communication)
 *
 * The FISCAL_ADAPTER token injects the Focus NFe adapter by default.
 * To switch to SEFAZ Direct, change the provider factory below.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([FiscalDocument, FiscalConfig, Restaurant]),
    OrdersModule,
    EventsModule,
    NotificationsModule,
  ],
  controllers: [FiscalController, FiscalWebhookController],
  providers: [
    // Adapters
    FocusNfeAdapter,
    SefazDirectAdapter,

    // Adapter injection token -- Phase 1 uses Focus NFe
    {
      provide: 'FISCAL_ADAPTER',
      useExisting: FocusNfeAdapter,
    },

    // Services
    FiscalEmissionService,
    FiscalOnboardingService,
    FiscalEventService,

    // Event listeners
    FiscalEventListener,
    FiscalNotificationListener,
  ],
  exports: [FiscalEmissionService, FiscalOnboardingService],
})
export class FiscalModule {}
