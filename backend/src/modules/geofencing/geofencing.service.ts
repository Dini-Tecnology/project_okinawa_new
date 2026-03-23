import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

export interface GeofenceCheckResult {
  isNearby: boolean;
  restaurantId: string;
  distanceMeters: number;
  radiusMeters: number;
}

@Injectable()
export class GeofencingService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  /**
   * Haversine formula — great-circle distance between two points on Earth
   */
  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in metres
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async checkUserLocation(
    restaurantId: string,
    userLat: number,
    userLng: number,
  ): Promise<GeofenceCheckResult> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) throw new NotFoundException(`Restaurant ${restaurantId} not found`);

    const restaurantLat = Number((restaurant as any).lat);
    const restaurantLng = Number((restaurant as any).lng);
    const radius = Number((restaurant as any).geofence_radius) || 500;

    if (!restaurantLat || !restaurantLng) {
      return { isNearby: false, restaurantId, distanceMeters: -1, radiusMeters: radius };
    }

    const distance = this.haversineDistance(userLat, userLng, restaurantLat, restaurantLng);

    return {
      isNearby: distance <= radius,
      restaurantId,
      distanceMeters: Math.round(distance),
      radiusMeters: radius,
    };
  }

  async updateGeofenceConfig(
    restaurantId: string,
    lat: number,
    lng: number,
    radiusMeters: number,
  ): Promise<void> {
    await this.restaurantRepo.update(restaurantId, {
      lat,
      lng,
      geofence_radius: radiusMeters,
    } as any);
  }

  async getGeofenceConfig(restaurantId: string) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: restaurantId },
      select: ['id', 'name', 'lat', 'lng', 'geofence_radius'] as any,
    });
    if (!restaurant) throw new NotFoundException(`Restaurant ${restaurantId} not found`);
    return {
      restaurantId: restaurant.id,
      lat: (restaurant as any).lat,
      lng: (restaurant as any).lng,
      radiusMeters: (restaurant as any).geofence_radius ?? 500,
    };
  }
}
