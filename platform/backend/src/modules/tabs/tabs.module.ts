import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TabsService } from './tabs.service';
import { TabMembersService } from './tab-members.service';
import { TabPaymentsService } from './tab-payments.service';
import { TabsController } from './tabs.controller';
import { TabsGateway } from './tabs.realtime';
import { Tab, TabMember, TabItem, TabPayment, HappyHourSchedule, WaiterCall } from './entities';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { EventsModule } from '@/modules/events/events.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { WaiterCallsService } from './waiter-calls.service';
import { WaiterCallsController } from './waiter-calls.controller';
import { HappyHourService } from './happy-hour.service';
import { HappyHourController } from './happy-hour.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tab,
      TabMember,
      TabItem,
      TabPayment,
      HappyHourSchedule,
      WaiterCall,
      MenuItem,
      RestaurantTable,
      Profile,
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
    EventsModule,
    NotificationsModule,
  ],
  controllers: [TabsController, WaiterCallsController, HappyHourController],
  providers: [
    TabMembersService,
    TabPaymentsService,
    TabsService,
    TabsGateway,
    WaiterCallsService,
    HappyHourService,
  ],
  exports: [TabsService, TabMembersService, TabPaymentsService, WaiterCallsService, HappyHourService],
})
export class TabsModule {}
