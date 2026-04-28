import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ServiceConfigService } from './service-config.service';
import { ServiceConfigController } from './service-config.controller';
import { ServiceConfigGateway } from './service-config.realtime';
import { RestaurantConfig } from './entities/restaurant-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantConfig]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '7d',
        },
      }),
    }),
  ],
  controllers: [ServiceConfigController],
  providers: [ServiceConfigService, ServiceConfigGateway],
  exports: [ServiceConfigService, ServiceConfigGateway],
})
export class ServiceConfigModule {}
