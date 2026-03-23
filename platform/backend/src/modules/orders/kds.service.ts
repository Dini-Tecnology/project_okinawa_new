import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { OrderStatus } from '@common/enums';
import { KdsFormatterHelper, KdsOrder } from './helpers';

@Injectable()
export class KdsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private kdsFormatter: KdsFormatterHelper,
  ) {}

  /**
   * Fetch and format orders for the Kitchen Display System.
   * Optionally filters by station type ('kitchen' | 'bar') and order status.
   */
  async getKdsOrders(params: {
    type?: string;
    status?: string;
    restaurant_id?: string;
  }): Promise<KdsOrder[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.menu_item', 'menu_item')
      .leftJoinAndSelect('order.table', 'table')
      .where('order.status IN (:...statuses)', {
        statuses: params.status
          ? [params.status]
          : [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING],
      });

    if (params.restaurant_id) {
      query.andWhere('order.restaurant_id = :restaurantId', {
        restaurantId: params.restaurant_id,
      });
    }

    const barCategories = this.kdsFormatter.getBarCategories();
    if (params.type === 'bar') {
      query.andWhere('menu_item.category IN (:...categories)', { categories: barCategories });
    } else if (params.type === 'kitchen') {
      query.andWhere('menu_item.category NOT IN (:...categories)', { categories: barCategories });
    }

    query.orderBy('order.created_at', 'ASC');
    const orders = await query.getMany();

    const waiterIds = orders
      .filter((o) => o.waiter_id)
      .map((o) => o.waiter_id as string);

    const waiterMap = new Map<string, string>();

    if (waiterIds.length > 0) {
      const waiters = await this.profileRepository.find({
        where: { id: In(waiterIds) },
        select: ['id', 'full_name'],
      });
      waiters.forEach((w) => waiterMap.set(w.id, w.full_name || 'Staff'));
    }

    return this.kdsFormatter.formatOrdersForKds(orders, waiterMap);
  }
}
