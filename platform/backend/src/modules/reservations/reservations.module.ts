import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { ReservationsGateway } from './reservations.gateway';
import { Reservation } from './entities/reservation.entity';
import { ReservationGuest } from './entities/reservation-guest.entity';
import { ReservationGuestsService } from './reservation-guests.service';
import { ReservationGuestsController } from './reservation-guests.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationGuest]),
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
  ],
  controllers: [ReservationsController, ReservationGuestsController],
  providers: [ReservationsService, ReservationsGateway, ReservationGuestsService],
  exports: [ReservationsService, ReservationsGateway, ReservationGuestsService],
})
export class ReservationsModule {}
