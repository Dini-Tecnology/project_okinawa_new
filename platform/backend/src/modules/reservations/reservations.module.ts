import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { ReservationsGateway } from './reservations.realtime';
import { Reservation } from './entities/reservation.entity';
import { ReservationGuest } from './entities/reservation-guest.entity';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { ReservationGuestsService } from './reservation-guests.service';
import { ReservationGuestsController } from './reservation-guests.controller';
import { GoogleReserveAdapter } from './adapters/google-reserve.adapter';
import { NotificationsModule } from '../notifications/notifications.module';
import { TablesModule } from '../tables/tables.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationGuest, Restaurant]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '7d',
        },
      }),
    }),
    NotificationsModule,
    TablesModule,
  ],
  controllers: [ReservationsController, ReservationGuestsController],
  providers: [ReservationsService, ReservationsGateway, ReservationGuestsService, GoogleReserveAdapter],
  exports: [ReservationsService, ReservationsGateway, ReservationGuestsService, GoogleReserveAdapter],
})
export class ReservationsModule {}
