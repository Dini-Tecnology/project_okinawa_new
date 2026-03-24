import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ClubEntry,
  GuestListEntry,
  VipTableReservation,
  VipTableGuest,
  VipTableTab,
  VipTableTabItem,
  QueueEntry,
  Lineup,
  LineupSlot,
  ClubCheckInOut,
  BirthdayEntry,
  Promoter,
  PromoterSale,
  PromoterPayment,
} from './entities';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { EventsModule } from '@/modules/events/events.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { ClubEntriesService } from './club-entries.service';
import { ClubEntriesController } from './club-entries.controller';
import { GuestListService } from './guest-list.service';
import { GuestListController } from './guest-list.controller';
import { VipTableReservationsService } from './vip-table-reservations.service';
import { VipTableReservationsController } from './vip-table-reservations.controller';
import { VipTableTabsService } from './vip-table-tabs.service';
import { VipTableTabsController } from './vip-table-tabs.controller';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueGateway } from './queue.gateway';
import { LineupService } from './lineup.service';
import { LineupController } from './lineup.controller';
import { OccupancyService } from './occupancy.service';
import { OccupancyController } from './occupancy.controller';
import { BirthdayEntryService } from './birthday-entry.service';
import { BirthdayEntryController } from './birthday-entry.controller';
import { PromoterService } from './promoter.service';
import { PromoterController } from './promoter.controller';
import { QrCodeService } from './qr-code.service';
import { QrCodeController } from './qr-code.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClubEntry,
      GuestListEntry,
      VipTableReservation,
      VipTableGuest,
      VipTableTab,
      VipTableTabItem,
      QueueEntry,
      Lineup,
      LineupSlot,
      ClubCheckInOut,
      BirthdayEntry,
      Promoter,
      PromoterSale,
      PromoterPayment,
      MenuItem,
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
  controllers: [
    ClubEntriesController,
    GuestListController,
    VipTableReservationsController,
    VipTableTabsController,
    QueueController,
    LineupController,
    OccupancyController,
    BirthdayEntryController,
    PromoterController,
    QrCodeController,
  ],
  providers: [
    ClubEntriesService,
    GuestListService,
    VipTableReservationsService,
    VipTableTabsService,
    QueueService,
    QueueGateway,
    LineupService,
    OccupancyService,
    BirthdayEntryService,
    PromoterService,
    QrCodeService,
  ],
  exports: [
    ClubEntriesService,
    GuestListService,
    VipTableReservationsService,
    VipTableTabsService,
    QueueService,
    LineupService,
    OccupancyService,
    BirthdayEntryService,
    PromoterService,
    QrCodeService,
  ],
})
export class ClubModule {}
