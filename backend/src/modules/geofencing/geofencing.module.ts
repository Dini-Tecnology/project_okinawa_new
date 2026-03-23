import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { GeofencingService } from './geofencing.service';
import { GeofencingController } from './geofencing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  controllers: [GeofencingController],
  providers: [GeofencingService],
  exports: [GeofencingService],
})
export class GeofencingModule {}
