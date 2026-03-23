import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { FilterRestaurantDto } from './dto/filter-restaurant.dto';
import { UpdateServiceConfigDto } from './dto/update-service-config.dto';
import { UpdateSetupProgressDto } from './dto/update-setup-progress.dto';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { UserRole as UserRoleEnum } from '@/common/enums';
import { PaginatedResponseDto } from '@/common/dto/pagination.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async findAll(filters: FilterRestaurantDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.service_configs', 'configs')
      .where('restaurant.is_active = :isActive', { isActive: true });

    if (filters.city) {
      query.andWhere('restaurant.city = :city', { city: filters.city });
    }

    if (filters.serviceType) {
      query.andWhere(':serviceType = ANY(restaurant.service_types)', {
        serviceType: filters.serviceType,
      });
    }

    if (filters.latitude && filters.longitude && filters.radius) {
      const radiusInMeters = filters.radius * 1000;
      query.andWhere(
        `ST_DWithin(
          restaurant.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius
        )`,
        {
          latitude: filters.latitude,
          longitude: filters.longitude,
          radius: radiusInMeters,
        },
      );
    }

    const [items, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return new PaginatedResponseDto(items, total, page, limit);
  }

  async findOne(id: string) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['service_configs'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async create(createRestaurantDto: CreateRestaurantDto, userId: string) {
    const restaurant = this.restaurantRepository.create(createRestaurantDto);
    const savedRestaurant = await this.restaurantRepository.save(restaurant);

    // Automatically assign creator as OWNER
    const ownerRole = this.userRoleRepository.create({
      user_id: userId,
      restaurant_id: savedRestaurant.id,
      role: UserRoleEnum.OWNER,
      is_active: true,
    });
    await this.userRoleRepository.save(ownerRole);

    return savedRestaurant;
  }

  async update(id: string, updateData: Partial<CreateRestaurantDto>) {
    const restaurant = await this.findOne(id);
    Object.assign(restaurant, updateData);
    return this.restaurantRepository.save(restaurant);
  }

  // ========== SERVICE CONFIG METHODS ==========

  async getServiceConfig(id: string) {
    const restaurant = await this.findOne(id);
    return {
      service_config: restaurant.service_config || null,
    };
  }

  async updateServiceConfig(id: string, updateConfigDto: UpdateServiceConfigDto) {
    const restaurant = await this.findOne(id);

    // Merge new config with existing config
    const currentConfig = restaurant.service_config || {};
    const updatedConfig = {
      ...currentConfig,
      ...updateConfigDto,
    };

    restaurant.service_config = updatedConfig;
    const savedRestaurant = await this.restaurantRepository.save(restaurant);

    return {
      service_config: savedRestaurant.service_config,
    };
  }

  // ========== SETUP PROGRESS METHODS ==========

  async getSetupProgress(id: string) {
    const restaurant = await this.findOne(id);
    return {
      setup_progress: restaurant.setup_progress || [],
    };
  }

  async updateSetupProgress(id: string, updateProgressDto: UpdateSetupProgressDto) {
    const restaurant = await this.findOne(id);
    restaurant.setup_progress = updateProgressDto.completedSteps;
    const savedRestaurant = await this.restaurantRepository.save(restaurant);

    return {
      setup_progress: savedRestaurant.setup_progress,
    };
  }

  async softDelete(id: string) {
    const restaurant = await this.findOne(id);
    restaurant.is_active = false;
    await this.restaurantRepository.save(restaurant);
    return { message: 'Restaurant deactivated successfully' };
  }

  // ========== GEOFENCING METHODS ==========

  /**
   * Haversine formula: calculate distance in meters between two lat/lng points.
   */
  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Find nearby restaurants within a given radius (km).
   * Uses Haversine formula for distance calculation.
   */
  async findNearby(lat: number, lng: number, radiusKm: number = 5) {
    const restaurants = await this.restaurantRepository.find({
      where: { is_active: true },
    });

    const radiusMeters = radiusKm * 1000;

    const nearby = restaurants
      .filter((r) => r.lat != null && r.lng != null)
      .map((r) => {
        const distance = this.haversineDistance(lat, lng, Number(r.lat), Number(r.lng));
        return { ...r, distance: Math.round(distance) };
      })
      .filter((r) => r.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);

    return nearby;
  }

  /**
   * Check if a user position is inside a restaurant's geofence.
   * Returns the distance and whether the user is inside the geofence radius.
   */
  async getGeofenceStatus(restaurantId: string, userLat: number, userLng: number) {
    const restaurant = await this.findOne(restaurantId);

    if (restaurant.lat == null || restaurant.lng == null) {
      throw new NotFoundException('Restaurant does not have geolocation configured');
    }

    const distance = this.haversineDistance(
      userLat,
      userLng,
      Number(restaurant.lat),
      Number(restaurant.lng),
    );

    const geofenceRadius = restaurant.geofence_radius || 500;
    const isInside = distance <= geofenceRadius;

    return {
      isInside,
      distance: Math.round(distance),
      geofenceRadius,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    };
  }
}
