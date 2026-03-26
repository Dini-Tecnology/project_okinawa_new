import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { I18nModule } from 'nestjs-i18n';
import { typeOrmConfig } from './config/typeorm.config';
import { redisConfig } from './config/redis.config';
import { throttlerConfig } from './config/throttler.config';
import { validationSchema, validationOptions } from './config/validation.config';
import { i18nConfig } from './config/i18n.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { TablesModule } from './modules/tables/tables.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { TipsModule } from './modules/tips/tips.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FinancialModule } from './modules/financial/financial.module';
import { HrModule } from './modules/hr/hr.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import { EventsModule } from './modules/events/events.module';
import { UserRolesModule } from './modules/user-roles/user-roles.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { QrCodeModule } from './modules/qr-code/qr-code.module';
import { CommonModule } from './common/common.module';
import { I18nApiModule } from './modules/i18n/i18n.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { TabsModule } from './modules/tabs/tabs.module';
import { ClubModule } from './modules/club/club.module';
import { ServiceConfigModule } from './modules/service-config/service-config.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { RestaurantWaitlistModule } from './modules/restaurant-waitlist/restaurant-waitlist.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { CallsModule } from './modules/calls/calls.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { MenuCustomizationModule } from './modules/menu-customization/menu-customization.module';
import { GeofencingModule } from './modules/geofencing/geofencing.module';
import { LegalModule } from './modules/legal/legal.module';
import { FraudDetectionModule } from './modules/fraud-detection/fraud-detection.module';
import { IncidentResponseModule } from './modules/incident-response/incident-response.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Configuration with Joi validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      validationSchema,
      validationOptions,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
    }),

    // Redis & Queue
    BullModule.forRootAsync({
      useFactory: redisConfig,
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: throttlerConfig,
    }),

    // Scheduled tasks (LGPD data retention, webhook delivery, etc.)
    ScheduleModule.forRoot(),

    // Internationalization (i18n)
    I18nModule.forRootAsync({
      useFactory: i18nConfig,
      inject: [ConfigService],
    }),

    // Common module (global)
    CommonModule,

    // Identity module (global - handles credentials, MFA, audit)
    IdentityModule,

    // Feature modules
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    ReservationsModule,
    PaymentsModule,
    MenuItemsModule,
    TablesModule,
    ReviewsModule,
    LoyaltyModule,
    TipsModule,
    NotificationsModule,
    FinancialModule,
    HrModule,
    WebhooksModule,
    AnalyticsModule,
    AiModule,
    EventsModule,
    UserRolesModule,
    FavoritesModule,
    QrCodeModule,
    I18nApiModule,
    HealthModule,
    
    // Entertainment modules (Pub & Bar, Club & Balada)
    TabsModule,
    ClubModule,

    // Config Hub (EPIC 8)
    ServiceConfigModule,

    // Manager Approvals (EPIC 4)
    ApprovalsModule,

    // Stock Inventory (EPIC 5)
    InventoryModule,

    // Smart Waitlist (EPIC 10)
    RestaurantWaitlistModule,

    // Drink Recipes (EPIC 6)
    RecipesModule,

    // Loyalty & Promotions (EPIC 9)
    PromotionsModule,

    // Service Calls (EPIC 12)
    CallsModule,

    // Backend Completions (EPIC 16)
    AddressesModule,
    ReceiptsModule,
    MenuCustomizationModule,
    GeofencingModule,

    // Legal (Privacy Policy & Terms of Service)
    LegalModule,

    // Fraud Detection & Security
    FraudDetectionModule,

    // Incident Response (LGPD Sprint 2)
    IncidentResponseModule,

    // Prometheus Metrics
    MetricsModule,

    // Admin Panel (operational support)
    AdminModule,
  ],
})
export class AppModule {}
