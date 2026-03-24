import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '@/modules/orders/entities/order.entity';
import { ForecastHelper, ForecastResult } from './helpers/forecast.helper';
import { ANALYTICS } from '@common/constants/limits';

@Injectable()
export class AnalyticsForecastService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private forecastHelper: ForecastHelper,
  ) {}

  /**
   * Get revenue forecast (simple linear projection) based on historical orders.
   */
  async getRevenueForecast(
    restaurantId: string,
    days: number = ANALYTICS.DEFAULT_DAYS_LOOKBACK,
  ): Promise<ForecastResult> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - ANALYTICS.DEFAULT_DAYS_LOOKBACK * 24 * 60 * 60 * 1000);

    const orders = await this.orderRepository.find({
      where: { restaurant_id: restaurantId, created_at: Between(startDate, endDate) },
    });

    return this.forecastHelper.buildForecast(orders, days);
  }
}
