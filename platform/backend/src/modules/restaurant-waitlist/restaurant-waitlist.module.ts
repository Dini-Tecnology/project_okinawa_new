import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WaitlistEntry } from './entities';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { WaitlistGateway } from './waitlist.realtime';
import { TablesModule } from '../tables/tables.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WaitlistEntry]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '7d',
        },
      }),
    }),
    TablesModule,
  ],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistGateway],
  exports: [WaitlistService, WaitlistGateway],
})
export class RestaurantWaitlistModule {}
