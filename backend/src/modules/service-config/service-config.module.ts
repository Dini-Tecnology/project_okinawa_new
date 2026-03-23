import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceConfigService } from './service-config.service';
import { ServiceConfigController } from './service-config.controller';
import { ServiceConfigGateway } from './service-config.gateway';
import { RestaurantConfig } from './entities/restaurant-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantConfig])],
  controllers: [ServiceConfigController],
  providers: [ServiceConfigService, ServiceConfigGateway],
  exports: [ServiceConfigService, ServiceConfigGateway],
})
export class ServiceConfigModule {}
