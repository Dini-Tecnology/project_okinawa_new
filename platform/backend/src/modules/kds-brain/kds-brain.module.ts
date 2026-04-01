import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CookStation } from './entities/cook-station.entity';
import { FireSchedule } from './entities/fire-schedule.entity';
import { PrepAnalytics } from './entities/prep-analytics.entity';
import { PrepTimeSuggestion } from './entities/prep-time-suggestion.entity';
import { KdsBrainConfig } from './entities/kds-brain-config.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { OrderItem } from '@/modules/orders/entities/order-item.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { PlatformConnection } from '@/modules/integrations/entities/platform-connection.entity';
import { ExternalMenuMapping } from '@/modules/integrations/entities/external-menu-mapping.entity';
import { OrdersModule } from '@/modules/orders/orders.module';
import { FinancialModule } from '@/modules/financial/financial.module';
import { CookStationService } from './services/cook-station.service';
import { BrainRouterService } from './services/brain-router.service';
import { BrainPriorityService } from './services/brain-priority.service';
import { BrainCountdownService } from './services/brain-countdown.service';
import { ItemAvailabilityService } from './services/item-availability.service';
import { AutoFireService } from './services/auto-fire.service';
import { AutoSyncService } from './services/auto-sync.service';
import { AnalyticsService } from './services/analytics.service';
import { SelfLearningService } from './services/self-learning.service';
import { KdsBrainConfigService } from './services/kds-brain-config.service';
import { CookStationController } from './controllers/cook-station.controller';
import { KdsBrainController } from './controllers/kds-brain.controller';
import { StockDepletionListener } from './listeners/stock-depletion.listener';
import { CostControlModule } from '@/modules/cost-control/cost-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CookStation,
      FireSchedule,
      PrepAnalytics,
      PrepTimeSuggestion,
      KdsBrainConfig,
      Order,
      OrderItem,
      MenuItem,
      Restaurant,
      PlatformConnection,
      ExternalMenuMapping,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '7d',
        },
      }),
    }),
    OrdersModule,
    FinancialModule,
    CostControlModule,
  ],
  controllers: [CookStationController, KdsBrainController],
  providers: [
    CookStationService,
    BrainRouterService,
    BrainPriorityService,
    BrainCountdownService,
    ItemAvailabilityService,
    AutoFireService,
    AutoSyncService,
    AnalyticsService,
    SelfLearningService,
    KdsBrainConfigService,
    StockDepletionListener,
  ],
  exports: [
    CookStationService,
    BrainRouterService,
    BrainPriorityService,
    BrainCountdownService,
    ItemAvailabilityService,
    AutoFireService,
    AutoSyncService,
    AnalyticsService,
    SelfLearningService,
    KdsBrainConfigService,
  ],
})
export class KdsBrainModule {}
