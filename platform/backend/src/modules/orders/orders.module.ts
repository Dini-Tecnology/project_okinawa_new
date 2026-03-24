import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { OrderGuestsService } from './order-guests.service';
import { OrderGuestsController } from './order-guests.controller';
import { KdsService } from './kds.service';
import { WaiterStatsService } from './waiter-stats.service';
import { OrderAdditionsService } from './order-additions.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderGuest } from './entities/order-guest.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { EventsModule } from '@/modules/events/events.module';
import { LoyaltyModule } from '@/modules/loyalty/loyalty.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { ReservationsModule } from '@/modules/reservations/reservations.module';
import { TablesModule } from '@/modules/tables/tables.module';
import {
  OrderCalculatorHelper,
  KdsFormatterHelper,
  WaiterStatsHelper,
  MaitreFormatterHelper,
} from './helpers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderGuest, MenuItem, RestaurantTable, Profile]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '7d',
        },
      }),
    }),
    EventsModule,
    LoyaltyModule,
    NotificationsModule,
    forwardRef(() => ReservationsModule),
    forwardRef(() => TablesModule),
  ],
  controllers: [OrdersController, OrderGuestsController],
  providers: [
    OrdersService,
    KdsService,
    WaiterStatsService,
    OrderAdditionsService,
    OrdersGateway,
    OrderGuestsService,
    OrderCalculatorHelper,
    KdsFormatterHelper,
    WaiterStatsHelper,
    MaitreFormatterHelper,
  ],
  exports: [OrdersService, KdsService, WaiterStatsService, OrderAdditionsService, OrdersGateway, OrderGuestsService],
})
export class OrdersModule {}
