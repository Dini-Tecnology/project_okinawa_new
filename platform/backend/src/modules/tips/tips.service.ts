import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Tip, TipStatus } from './entities/tip.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { CreateTipDto } from './dto/create-tip.dto';
import { DistributeTipsDto } from './dto/distribute-tips.dto';
import { UpdateTipDto } from './dto/update-tip.dto';
import { EventsGateway } from '@/modules/events/events.realtime';

@Injectable()
export class TipsService {
  private readonly logger = new Logger(TipsService.name);

  constructor(
    @InjectRepository(Tip)
    private tipRepository: Repository<Tip>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private eventsGateway: EventsGateway,
  ) {}

  async create(customerId: string, createTipDto: CreateTipDto) {
    const tip = this.tipRepository.create({
      ...createTipDto,
      customer_id: customerId,
      status: TipStatus.PENDING,
    });

    const savedTip = await this.tipRepository.save(tip);

    // Get customer profile for name
    const customerProfile = await this.profileRepository.findOne({
      where: { id: customerId },
    });
    const customerName = customerProfile?.full_name || 'Customer';

    // Notify restaurant about tip
    this.eventsGateway.notifyRestaurant(createTipDto.restaurant_id, {
      type: 'tip:created',
      tip_id: savedTip.id,
      amount: savedTip.amount,
      order_id: savedTip.order_id,
      customer_name: customerName,
    });

    // Notify staff if direct tip
    if (createTipDto.staff_id) {
      this.eventsGateway.notifyUser(createTipDto.staff_id, {
        type: 'tip:received',
        tip_id: savedTip.id,
        amount: savedTip.amount,
        customer_name: customerName,
      });
    }

    return savedTip;
  }

  async getSummary(restaurantId: string, startDate: Date, endDate: Date) {
    const tips = await this.tipRepository.find({
      where: {
        restaurant_id: restaurantId,
        created_at: Between(startDate, endDate),
      },
      relations: ['staff'],
    });

    const totalTips = tips.reduce((sum, tip) => sum + Number(tip.amount), 0);
    const tipsCount = tips.length;
    const averageTip = tipsCount > 0 ? totalTips / tipsCount : 0;
    const pendingDistribution = tips
      .filter(t => t.status === TipStatus.PENDING)
      .reduce((sum, tip) => sum + Number(tip.amount), 0);

    // Group by staff
    const staffTips = tips.reduce((acc, tip) => {
      if (tip.staff_id) {
        if (!acc[tip.staff_id]) {
          acc[tip.staff_id] = {
            staff_id: tip.staff_id,
            staff_name: tip.staff?.full_name || 'Unknown',
            total_tips: 0,
            tips_count: 0,
          };
        }
        acc[tip.staff_id].total_tips += Number(tip.amount);
        acc[tip.staff_id].tips_count += 1;
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      total_tips: totalTips,
      tips_count: tipsCount,
      average_tip: averageTip,
      pending_distribution: pendingDistribution,
      staff_tips: Object.values(staffTips),
    };
  }

  async getTransactions(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 20,
  ) {
    const validLimit = Math.min(Math.max(1, limit), 100);
    const validPage = Math.max(1, page);
    const skip = (validPage - 1) * validLimit;

    const [transactions, total] = await this.tipRepository.findAndCount({
      where: {
        restaurant_id: restaurantId,
        created_at: Between(startDate, endDate),
      },
      relations: ['customer', 'staff'],
      order: { created_at: 'DESC' },
      take: validLimit,
      skip,
    });

    return {
      data: transactions,
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  async distributePending(restaurantId: string, distributeTipsDto: DistributeTipsDto) {
    const pendingTips = await this.tipRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: TipStatus.PENDING,
      },
    });

    const distributionResults = [];

    for (const tip of pendingTips) {
      tip.status = TipStatus.DISTRIBUTED;
      tip.distributed_at = new Date();
      tip.distribution_details = distributeTipsDto.distribution_method || {
        method: 'equal_split',
        staff_count: distributeTipsDto.staff_ids?.length || 0,
      };

      await this.tipRepository.save(tip);

      // Notify staff members
      if (distributeTipsDto.staff_ids) {
        const amountPerStaff = Number(tip.amount) / distributeTipsDto.staff_ids.length;

        for (const staffId of distributeTipsDto.staff_ids) {
          this.eventsGateway.notifyUser(staffId, {
            type: 'tip:distributed',
            tip_id: tip.id,
            amount: amountPerStaff,
            distribution_date: new Date(),
          });
        }
      }

      distributionResults.push(tip);
    }

    // Notify restaurant
    this.eventsGateway.notifyRestaurant(restaurantId, {
      type: 'tips:distributed',
      count: distributionResults.length,
      total_amount: distributionResults.reduce((sum, tip) => sum + Number(tip.amount), 0),
    });

    return {
      distributed_count: distributionResults.length,
      total_amount: distributionResults.reduce((sum, tip) => sum + Number(tip.amount), 0),
      tips: distributionResults,
    };
  }

  async findByStaff(staffId: string, startDate: Date, endDate: Date) {
    return this.tipRepository.find({
      where: {
        staff_id: staffId,
        created_at: Between(startDate, endDate),
      },
      order: { created_at: 'DESC' },
    });
  }

  async findByOrder(orderId: string) {
    return this.tipRepository.findOne({
      where: { order_id: orderId },
      relations: ['customer', 'staff'],
    });
  }

  /**
   * Update tip record (status, notes, distribution details)
   * Note: Tip amounts are immutable, only status and metadata can be updated
   */
  async update(id: string, updateTipDto: UpdateTipDto) {
    const tip = await this.tipRepository.findOne({
      where: { id },
    });

    if (!tip) {
      throw new NotFoundException('Tip not found');
    }

    if (updateTipDto.status !== undefined) {
      tip.status = updateTipDto.status;
    }

    if (updateTipDto.distributed_at !== undefined) {
      tip.distributed_at = new Date(updateTipDto.distributed_at);
    }

    if (updateTipDto.distribution_details !== undefined) {
      tip.distribution_details = JSON.parse(updateTipDto.distribution_details);
    }

    if (updateTipDto.notes !== undefined) {
      // Store notes in distribution_details
      tip.distribution_details = {
        ...tip.distribution_details,
        notes: updateTipDto.notes,
      };
    }

    return this.tipRepository.save(tip);
  }

  /**
   * GAP-3: Auto-distribute pending tips when cash register closes.
   *
   * 1. Find all PENDING tips for this restaurant between session open and close times
   * 2. Get all active staff for this restaurant (from user_roles)
   * 3. Divide equally among staff
   * 4. Mark each tip as DISTRIBUTED
   * 5. Log distribution details
   */
  async autoDistributeOnClose(
    restaurantId: string,
    sessionOpenedAt: Date,
    sessionClosedAt: Date,
  ): Promise<void> {
    // 1. Find all PENDING tips for this restaurant in the session window
    const pendingTips = await this.tipRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: TipStatus.PENDING,
        created_at: Between(sessionOpenedAt, sessionClosedAt),
      },
    });

    if (pendingTips.length === 0) {
      this.logger.log(
        `No pending tips to distribute for restaurant ${restaurantId}`,
      );
      return;
    }

    // 2. Get all active staff for this restaurant
    const activeStaffRoles = await this.userRoleRepository.find({
      where: {
        restaurant_id: restaurantId,
        is_active: true,
      },
    });

    // Deduplicate staff by user_id
    const uniqueStaffIds = [...new Set(activeStaffRoles.map((r) => r.user_id))];

    if (uniqueStaffIds.length === 0) {
      this.logger.warn(
        `No active staff found for restaurant ${restaurantId} — tips remain PENDING`,
      );
      return;
    }

    // 3. Distribute each tip equally among staff
    const now = new Date();
    const totalDistributed = pendingTips.reduce(
      (sum, tip) => sum + Number(tip.amount),
      0,
    );

    for (const tip of pendingTips) {
      const amountPerStaff = Number(tip.amount) / uniqueStaffIds.length;

      tip.status = TipStatus.DISTRIBUTED;
      tip.distributed_at = now;
      tip.distribution_details = {
        method: 'auto_close_equal_split',
        staff_count: uniqueStaffIds.length,
        amount_per_staff: amountPerStaff,
        staff_ids: uniqueStaffIds,
        session_opened_at: sessionOpenedAt.toISOString(),
        session_closed_at: sessionClosedAt.toISOString(),
      };

      await this.tipRepository.save(tip);

      // Notify each staff member
      for (const staffId of uniqueStaffIds) {
        this.eventsGateway.notifyUser(staffId, {
          type: 'tip:auto_distributed',
          tip_id: tip.id,
          amount: amountPerStaff,
          distribution_date: now,
        });
      }
    }

    // 5. Log distribution summary
    this.logger.log(
      `Auto-distributed ${pendingTips.length} tips (total R$ ${totalDistributed.toFixed(2)}) ` +
        `among ${uniqueStaffIds.length} staff for restaurant ${restaurantId}`,
    );

    // Notify restaurant
    this.eventsGateway.notifyRestaurant(restaurantId, {
      type: 'tips:auto_distributed',
      count: pendingTips.length,
      total_amount: totalDistributed,
      staff_count: uniqueStaffIds.length,
    });
  }
}
