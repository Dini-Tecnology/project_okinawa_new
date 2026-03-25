import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { UpdateServiceConfigDto } from './dto/update-service-config.dto';
import { RestaurantsService } from './restaurants.service';

@Injectable()
export class RestaurantConfigService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    private restaurantsService: RestaurantsService,
  ) {}

  async getServiceConfig(id: string) {
    const restaurant = await this.restaurantsService.findOne(id);
    return {
      service_config: restaurant.service_config || null,
    };
  }

  async updateServiceConfig(id: string, updateConfigDto: UpdateServiceConfigDto) {
    const restaurant = await this.restaurantsService.findOne(id);

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
}
