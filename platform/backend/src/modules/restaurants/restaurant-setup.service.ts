import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { UpdateSetupProgressDto } from './dto/update-setup-progress.dto';
import { RestaurantsService } from './restaurants.service';

@Injectable()
export class RestaurantSetupService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    private restaurantsService: RestaurantsService,
  ) {}

  async getSetupProgress(id: string) {
    const restaurant = await this.restaurantsService.findOne(id);
    return {
      setup_progress: restaurant.setup_progress || [],
    };
  }

  async updateSetupProgress(id: string, updateProgressDto: UpdateSetupProgressDto) {
    const restaurant = await this.restaurantsService.findOne(id);
    restaurant.setup_progress = updateProgressDto.completedSteps;
    const savedRestaurant = await this.restaurantRepository.save(restaurant);

    return {
      setup_progress: savedRestaurant.setup_progress,
    };
  }
}
