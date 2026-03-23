import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { GeofencingService } from './geofencing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class CheckLocationDto {
  restaurantId: string;
  lat: number;
  lng: number;
}

class UpdateGeofenceDto {
  lat: number;
  lng: number;
  radiusMeters: number;
}

@Controller('geofencing')
@UseGuards(JwtAuthGuard)
export class GeofencingController {
  constructor(private readonly service: GeofencingService) {}

  @Get(':restaurantId')
  getConfig(@Param('restaurantId') restaurantId: string) {
    return this.service.getGeofenceConfig(restaurantId);
  }

  @Post('check')
  checkLocation(@Body() dto: CheckLocationDto) {
    return this.service.checkUserLocation(dto.restaurantId, dto.lat, dto.lng);
  }

  @Patch(':restaurantId')
  updateConfig(@Param('restaurantId') restaurantId: string, @Body() dto: UpdateGeofenceDto) {
    return this.service.updateGeofenceConfig(restaurantId, dto.lat, dto.lng, dto.radiusMeters);
  }
}
