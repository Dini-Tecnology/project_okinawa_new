import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { HappyHourSchedule } from './entities/happy-hour-schedule.entity';
import { CreateHappyHourScheduleDto } from './dto';
import { DayOfWeek } from '@/common/enums';

@Injectable()
export class HappyHourService {
  constructor(
    @InjectRepository(HappyHourSchedule)
    private scheduleRepository: Repository<HappyHourSchedule>,
  ) {}

  async createSchedule(dto: CreateHappyHourScheduleDto): Promise<HappyHourSchedule> {
    const schedule = this.scheduleRepository.create(dto as DeepPartial<HappyHourSchedule>);
    return this.scheduleRepository.save(schedule as HappyHourSchedule);
  }

  async updateSchedule(id: string, dto: Partial<CreateHappyHourScheduleDto>): Promise<HappyHourSchedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    Object.assign(schedule, dto);
    return this.scheduleRepository.save(schedule);
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.scheduleRepository.delete(id);
  }

  async getRestaurantSchedules(restaurantId: string): Promise<HappyHourSchedule[]> {
    return this.scheduleRepository.find({
      where: { restaurant_id: restaurantId, is_active: true },
      order: { start_time: 'ASC' },
    });
  }

  /**
   * Get active happy hour promotions for the current time
   */
  async getActivePromotions(restaurantId: string): Promise<HappyHourSchedule[]> {
    const now = new Date();
    const currentDay = this.getCurrentDayOfWeek();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm format

    const schedules = await this.scheduleRepository.find({
      where: { restaurant_id: restaurantId, is_active: true },
    });

    return schedules.filter(schedule => {
      // Check if current day is in schedule
      if (!schedule.days.includes(currentDay)) {
        return false;
      }

      // Check if current time is within schedule
      return currentTime >= schedule.start_time && currentTime <= schedule.end_time;
    });
  }

  /**
   * Calculate discount for a menu item based on active promotions
   */
  async calculateDiscount(
    restaurantId: string,
    itemId: string,
    categoryId: string,
    originalPrice: number,
  ): Promise<{ discountedPrice: number; discountAmount: number; discountReason: string | null }> {
    const activePromotions = await this.getActivePromotions(restaurantId);

    if (activePromotions.length === 0) {
      return { discountedPrice: originalPrice, discountAmount: 0, discountReason: null };
    }

    // Find applicable promotion
    const applicablePromotion = activePromotions.find(promo => {
      if (promo.applies_to === 'all') return true;
      if (promo.applies_to === 'categories' && promo.category_ids?.includes(categoryId)) return true;
      if (promo.applies_to === 'items' && promo.item_ids?.includes(itemId)) return true;
      return false;
    });

    if (!applicablePromotion) {
      return { discountedPrice: originalPrice, discountAmount: 0, discountReason: null };
    }

    let discountAmount = 0;
    switch (applicablePromotion.discount_type) {
      case 'percentage':
        discountAmount = originalPrice * (Number(applicablePromotion.discount_value) / 100);
        break;
      case 'fixed':
        discountAmount = Number(applicablePromotion.discount_value);
        break;
      case 'bogo':
        // Buy One Get One - handled at order level, not item level
        discountAmount = 0;
        break;
    }

    return {
      discountedPrice: originalPrice - discountAmount,
      discountAmount,
      discountReason: applicablePromotion.name,
    };
  }

  private getCurrentDayOfWeek(): DayOfWeek {
    const days: DayOfWeek[] = [DayOfWeek.SUN, DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI, DayOfWeek.SAT];
    return days[new Date().getDay()];
  }
}
