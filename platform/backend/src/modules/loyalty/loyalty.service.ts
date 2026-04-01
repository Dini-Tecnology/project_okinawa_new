import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LoyaltyProgram, LoyaltyTier as LoyaltyTierEnum } from './entities/loyalty-program.entity';
import { StampCard } from './entities/stamp-card.entity';
import { AddPointsDto } from './dto/add-points.dto';
import { RedeemRewardDto } from './dto/redeem-reward.dto';
import { UpdateLoyaltyProgramDto } from './dto/update-loyalty-program.dto';
import { AddStampDto } from './dto/add-stamp.dto';
import { EventsGateway } from '@/modules/events/events.gateway';
import { PAGINATION } from '@common/constants/limits';

export interface LoyaltyTierInfo {
  name: LoyaltyTierEnum;
  min_points: number;
  max_points: number | null;
  benefits: string[];
  discount_percentage: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  type: 'discount' | 'free_item' | 'upgrade' | 'special';
  value: string | number | Record<string, unknown>;
  valid_until?: Date;
  terms?: string;
}

@Injectable()
export class LoyaltyService {
  private readonly TIERS: LoyaltyTierInfo[] = [
    {
      name: LoyaltyTierEnum.BRONZE,
      min_points: 0,
      max_points: 499,
      benefits: ['Acumular pontos', 'Ofertas especiais'],
      discount_percentage: 0,
    },
    {
      name: LoyaltyTierEnum.SILVER,
      min_points: 500,
      max_points: 1999,
      benefits: [
        'Tudo do Bronze',
        '5% desconto',
        'Aniversário especial',
        'Prioridade em reservas',
      ],
      discount_percentage: 5,
    },
    {
      name: LoyaltyTierEnum.GOLD,
      min_points: 2000,
      max_points: 4999,
      benefits: [
        'Tudo do Silver',
        '10% desconto',
        'Eventos exclusivos',
        'Upgrade gratuito',
        'Early access novas ofertas',
      ],
      discount_percentage: 10,
    },
    {
      name: LoyaltyTierEnum.PLATINUM,
      min_points: 5000,
      max_points: null,
      benefits: [
        'Tudo do Gold',
        '15% desconto',
        'Concierge service',
        'Mesa VIP reservada',
        'Degustação exclusiva',
        'Convite eventos privados',
      ],
      discount_percentage: 15,
    },
  ];

  private readonly AVAILABLE_REWARDS: Reward[] = [
    {
      id: 'reward_1',
      name: 'Sobremesa Grátis',
      description: 'Uma sobremesa à sua escolha',
      points_cost: 100,
      type: 'free_item',
      value: { category: 'dessert' },
    },
    {
      id: 'reward_2',
      name: 'Bebida Grátis',
      description: 'Uma bebida não-alcoólica à sua escolha',
      points_cost: 80,
      type: 'free_item',
      value: { category: 'beverage', alcoholic: false },
    },
    {
      id: 'reward_3',
      name: 'Desconto 10%',
      description: '10% de desconto em sua próxima conta',
      points_cost: 200,
      type: 'discount',
      value: { percentage: 10 },
    },
    {
      id: 'reward_4',
      name: 'Desconto 20%',
      description: '20% de desconto em sua próxima conta',
      points_cost: 400,
      type: 'discount',
      value: { percentage: 20 },
    },
    {
      id: 'reward_5',
      name: 'Entrada Grátis',
      description: 'Uma entrada à sua escolha',
      points_cost: 250,
      type: 'free_item',
      value: { category: 'appetizer' },
    },
    {
      id: 'reward_6',
      name: 'Upgrade Mesa VIP',
      description: 'Upgrade para mesa VIP em sua próxima reserva',
      points_cost: 500,
      type: 'upgrade',
      value: { type: 'vip_table' },
    },
    {
      id: 'reward_7',
      name: 'Jantar Aniversário',
      description: 'Jantar especial de aniversário com cortesia',
      points_cost: 1000,
      type: 'special',
      value: { occasion: 'birthday', includes: ['cake', 'champagne'] },
    },
  ];

  constructor(
    @InjectRepository(LoyaltyProgram)
    private loyaltyRepository: Repository<LoyaltyProgram>,
    @InjectRepository(StampCard)
    private stampCardRepository: Repository<StampCard>,
    private eventsGateway: EventsGateway,
    private dataSource: DataSource,
  ) {}

  /**
   * Get all loyalty programs for a user across all restaurants
   */
  async getAllUserPrograms(userId: string) {
    const programs = await this.loyaltyRepository.find({
      where: { user_id: userId },
      relations: ['restaurant'],
      order: { points: 'DESC' },
    });

    // Update tiers for all programs
    return programs.map((program) => {
      const tier = this.calculateTier(program.points);
      return {
        id: program.id,
        restaurant: program.restaurant,
        points_balance: program.points,
        total_visits: program.total_visits,
        total_spent: program.total_spent,
        tier: tier.name,
        last_visit: program.last_visit,
        rewards_claimed: program.rewards_claimed || [],
        available_rewards: program.available_rewards || [],
      };
    });
  }

  /**
   * Get or create loyalty profile for user in restaurant
   */
  async getProfile(userId: string, restaurantId: string) {
    let profile = await this.loyaltyRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
      relations: ['user', 'restaurant'],
    });

    if (!profile) {
      profile = await this.createProfile(userId, restaurantId);
    }

    // Calculate tier based on current points
    const tier = this.calculateTier(profile.points);
    if (profile.tier !== tier.name) {
      profile.tier = tier.name;
      await this.loyaltyRepository.save(profile);

      // Notify user about tier upgrade
      this.eventsGateway.notifyUser(userId, {
        type: 'loyalty:tier_upgrade',
        new_tier: tier.name,
        benefits: tier.benefits,
        restaurant_id: restaurantId,
      });
    }

    return {
      ...profile,
      current_tier: tier,
      next_tier: this.getNextTier(tier.name),
      points_to_next_tier: this.getPointsToNextTier(profile.points),
    };
  }

  /**
   * Create new loyalty profile
   */
  private async createProfile(userId: string, restaurantId: string): Promise<LoyaltyProgram> {
    const profile = this.loyaltyRepository.create({
      user_id: userId,
      restaurant_id: restaurantId,
      points: 0,
      total_visits: 0,
      total_spent: 0,
      tier: LoyaltyTierEnum.BRONZE,
      is_active: true,
      rewards_claimed: [],
      available_rewards: [],
      awarded_order_ids: [],
    });

    return this.loyaltyRepository.save(profile);
  }

  /**
   * Add points to user's loyalty profile
   */
  async addPoints(
    userId: string,
    restaurantId: string,
    addPointsDto: AddPointsDto,
  ) {
    const profile = await this.getProfile(userId, restaurantId);

    const oldPoints = profile.points;
    const oldTier = profile.tier;

    profile.points += addPointsDto.points;

    // Update tier if needed
    const newTier = this.calculateTier(profile.points);
    profile.tier = newTier.name;

    const updatedProfile = await this.loyaltyRepository.save(profile);

    // Notify user about points earned
    this.eventsGateway.notifyUser(userId, {
      type: 'loyalty:points_earned',
      points: addPointsDto.points,
      total_points: updatedProfile.points,
      reason: addPointsDto.reason,
      restaurant_id: restaurantId,
    });

    // Check if tier upgraded
    if (oldTier !== newTier.name) {
      this.eventsGateway.notifyUser(userId, {
        type: 'loyalty:tier_upgrade',
        old_tier: oldTier,
        new_tier: newTier.name,
        benefits: newTier.benefits,
        restaurant_id: restaurantId,
      });
    }

    return {
      ...updatedProfile,
      points_earned: addPointsDto.points,
      tier_upgraded: oldTier !== newTier.name,
      old_tier: oldTier,
      new_tier: newTier.name,
    };
  }

  /**
   * Award points based on order amount (called by Orders module)
   * Uses pessimistic locking to prevent race conditions during concurrent point awards
   */
  async awardPointsFromOrder(
    userId: string,
    restaurantId: string,
    orderAmount: number,
    orderId: string,
  ) {
    // 1 point per R$ 10 spent
    const pointsEarned = Math.floor(orderAmount / 10);

    if (pointsEarned <= 0) {
      return {
        points_earned: 0,
        total_points: 0,
        tier: LoyaltyTierEnum.BRONZE,
        tier_upgraded: false,
      };
    }

    return this.dataSource.transaction(async (manager) => {
      // First, try to get existing profile with lock
      let profile = await manager.findOne(LoyaltyProgram, {
        where: { user_id: userId, restaurant_id: restaurantId },
        lock: { mode: 'pessimistic_write' },
      });

      // If no profile exists, create one (within transaction)
      if (!profile) {
        profile = manager.create(LoyaltyProgram, {
          user_id: userId,
          restaurant_id: restaurantId,
          points: 0,
          total_visits: 0,
          total_spent: 0,
          tier: LoyaltyTierEnum.BRONZE,
          is_active: true,
          rewards_claimed: [],
          available_rewards: [],
          awarded_order_ids: [],
        });
        profile = await manager.save(LoyaltyProgram, profile);
      }

      // Idempotency check: skip if points were already awarded for this order
      const alreadyAwarded = (profile.awarded_order_ids || []).includes(orderId);
      if (alreadyAwarded) {
        return {
          points_earned: 0,
          total_points: profile.points,
          tier: profile.tier,
          tier_upgraded: false,
          already_awarded: true,
        };
      }

      const oldTier = profile.tier;

      // Atomic update using increment operations + record the awarded order ID
      await manager
        .createQueryBuilder()
        .update(LoyaltyProgram)
        .set({
          points: () => `points + ${pointsEarned}`,
          total_visits: () => `total_visits + 1`,
          total_spent: () => `total_spent + ${orderAmount}`,
          last_visit: new Date(),
          awarded_order_ids: () => `array_append(awarded_order_ids, '${orderId}')`,
        })
        .where('id = :id', { id: profile.id })
        .execute();

      // Get updated values
      const newPoints = profile.points + pointsEarned;
      const newTier = this.calculateTier(newPoints);
      const tierUpgraded = oldTier !== newTier.name;

      // Update tier if needed
      if (tierUpgraded) {
        await manager.update(LoyaltyProgram, { id: profile.id }, { tier: newTier.name });
      }

      // Notify user (outside transaction scope is fine)
      this.eventsGateway.notifyUser(userId, {
        type: 'loyalty:points_earned',
        points: pointsEarned,
        total_points: newPoints,
        reason: `Pedido #${orderId.slice(0, 8)}`,
        order_id: orderId,
        restaurant_id: restaurantId,
      });

      if (tierUpgraded) {
        this.eventsGateway.notifyUser(userId, {
          type: 'loyalty:tier_upgrade',
          new_tier: newTier.name,
          benefits: newTier.benefits,
          restaurant_id: restaurantId,
        });
      }

      return {
        points_earned: pointsEarned,
        total_points: newPoints,
        tier: newTier.name,
        tier_upgraded: tierUpgraded,
      };
    });
  }

  /**
   * Get loyalty history (points transactions)
   */
  async getHistory(userId: string, restaurantId: string) {
    const profile = await this.getProfile(userId, restaurantId);

    // In a full implementation, you would have a separate LoyaltyTransaction entity
    // For now, we return the rewards claimed history
    return {
      profile: {
        points: profile.points,
        tier: profile.tier,
        total_visits: profile.total_visits,
        total_spent: profile.total_spent,
      },
      rewards_claimed: profile.rewards_claimed || [],
      history_summary: {
        total_points_earned: profile.points,
        total_rewards_claimed: (profile.rewards_claimed || []).length,
        member_since: profile.created_at,
        last_activity: profile.last_visit || profile.updated_at,
      },
    };
  }

  /**
   * Get available rewards for user
   */
  async getAvailableRewards(userId: string, restaurantId: string) {
    const profile = await this.getProfile(userId, restaurantId);

    // Filter rewards user can afford
    const affordableRewards = this.AVAILABLE_REWARDS.filter(
      (reward) => reward.points_cost <= profile.points,
    );

    const unaffordableRewards = this.AVAILABLE_REWARDS.filter(
      (reward) => reward.points_cost > profile.points,
    );

    return {
      user_points: profile.points,
      affordable_rewards: affordableRewards,
      upcoming_rewards: unaffordableRewards.slice(0, 3), // Next 3 rewards to unlock
      tier_benefits: this.calculateTier(profile.points),
    };
  }

  /**
   * Redeem a reward
   */
  async redeemReward(
    userId: string,
    restaurantId: string,
    redeemDto: RedeemRewardDto,
  ) {
    const profile = await this.getProfile(userId, restaurantId);

    // Find reward
    const reward = this.AVAILABLE_REWARDS.find(
      (r) => r.id === redeemDto.reward_id,
    );

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    // Check if user has enough points
    if (profile.points < reward.points_cost) {
      throw new BadRequestException(
        `Insufficient points. You have ${profile.points} points but need ${reward.points_cost}`,
      );
    }

    // Deduct points
    profile.points -= reward.points_cost;

    // Add to claimed rewards
    const claimedReward = {
      ...reward,
      claimed_at: new Date(),
      redeemed: false,
      redemption_code: this.generateRedemptionCode(),
    };

    if (!profile.rewards_claimed) {
      profile.rewards_claimed = [];
    }
    profile.rewards_claimed.push(claimedReward);

    // Update tier if downgraded
    const newTier = this.calculateTier(profile.points);
    profile.tier = newTier.name;

    const updatedProfile = await this.loyaltyRepository.save(profile);

    // Notify user
    this.eventsGateway.notifyUser(userId, {
      type: 'loyalty:reward_redeemed',
      reward_name: reward.name,
      points_spent: reward.points_cost,
      remaining_points: updatedProfile.points,
      redemption_code: claimedReward.redemption_code,
      restaurant_id: restaurantId,
    });

    // Notify restaurant
    this.eventsGateway.notifyRestaurant(restaurantId, {
      type: 'loyalty:reward_claimed',
      user_id: userId,
      reward_id: reward.id,
      reward_name: reward.name,
      redemption_code: claimedReward.redemption_code,
    });

    return {
      success: true,
      reward: claimedReward,
      remaining_points: updatedProfile.points,
      current_tier: newTier.name,
    };
  }

  /**
   * Get all loyalty tiers
   */
  getTiers() {
    return this.TIERS;
  }

  /**
   * Get leaderboard for restaurant with pagination
   */
  async getLeaderboard(restaurantId: string, limit: number = PAGINATION.LEADERBOARD_DEFAULT, page: number = 1) {
    const validLimit = Math.min(Math.max(1, limit), PAGINATION.LEADERBOARD_MAX);
    const validPage = Math.max(1, page);
    const skip = (validPage - 1) * validLimit;

    const [topProfiles, total] = await this.loyaltyRepository.findAndCount({
      where: { restaurant_id: restaurantId, is_active: true },
      relations: ['user'],
      order: { points: 'DESC' },
      take: validLimit,
      skip,
    });

    return {
      data: topProfiles.map((profile, index) => ({
        rank: skip + index + 1,
        user_name: profile.user?.full_name || 'Anonymous',
        points: profile.points,
        tier: profile.tier,
        total_visits: profile.total_visits,
      })),
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  /**
   * Get loyalty statistics for restaurant
   * Uses aggregated queries to avoid loading all profiles into memory
   */
  async getStatistics(restaurantId: string) {
    // Use aggregation query instead of loading all records
    const aggregateResult = await this.loyaltyRepository
      .createQueryBuilder('loyalty')
      .select('COUNT(*)', 'total_members')
      .addSelect('COALESCE(SUM(loyalty.points), 0)', 'total_points_issued')
      .addSelect('COALESCE(SUM(loyalty.total_visits), 0)', 'total_visits')
      .addSelect('COALESCE(SUM(loyalty.total_spent), 0)', 'total_spent')
      .where('loyalty.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('loyalty.is_active = true')
      .getRawOne();

    // Get tier distribution with separate query
    const tierDistributionResult = await this.loyaltyRepository
      .createQueryBuilder('loyalty')
      .select('loyalty.tier', 'tier')
      .addSelect('COUNT(*)', 'count')
      .where('loyalty.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('loyalty.is_active = true')
      .groupBy('loyalty.tier')
      .getRawMany();

    const totalMembers = parseInt(aggregateResult.total_members, 10) || 0;
    const totalPointsIssued = parseInt(aggregateResult.total_points_issued, 10) || 0;
    const totalVisits = parseInt(aggregateResult.total_visits, 10) || 0;
    const totalSpent = parseFloat(aggregateResult.total_spent) || 0;

    // Build tier distribution object
    const tierDistribution: Record<string, number> = {};
    for (const row of tierDistributionResult) {
      tierDistribution[row.tier] = parseInt(row.count, 10);
    }

    // Calculate averages
    const avgPointsPerMember = totalMembers > 0 ? totalPointsIssued / totalMembers : 0;
    const avgVisitsPerMember = totalMembers > 0 ? totalVisits / totalMembers : 0;
    const avgSpentPerMember = totalMembers > 0 ? totalSpent / totalMembers : 0;

    return {
      total_members: totalMembers,
      total_points_issued: totalPointsIssued,
      total_visits: totalVisits,
      total_spent: totalSpent,
      tier_distribution: tierDistribution,
      averages: {
        points_per_member: Math.round(avgPointsPerMember),
        visits_per_member: Math.round(avgVisitsPerMember * 10) / 10,
        spent_per_member: Math.round(avgSpentPerMember * 100) / 100,
      },
    };
  }

  /**
   * Update loyalty program
   */
  async update(id: string, updateLoyaltyProgramDto: UpdateLoyaltyProgramDto) {
    const loyaltyProgram = await this.loyaltyRepository.findOne({
      where: { id }
    });

    if (!loyaltyProgram) {
      throw new NotFoundException('Loyalty program not found');
    }

    Object.assign(loyaltyProgram, updateLoyaltyProgramDto);

    // Recalculate tier if points changed
    if (updateLoyaltyProgramDto.points !== undefined) {
      const tier = this.calculateTier(loyaltyProgram.points);
      loyaltyProgram.tier = tier.name;
    }

    return this.loyaltyRepository.save(loyaltyProgram);
  }

  /**
   * Update loyalty profile by userId and restaurantId
   */
  async updateProfile(userId: string, restaurantId: string, updateLoyaltyProgramDto: UpdateLoyaltyProgramDto) {
    const loyaltyProgram = await this.loyaltyRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId }
    });

    if (!loyaltyProgram) {
      throw new NotFoundException('Loyalty profile not found');
    }

    Object.assign(loyaltyProgram, updateLoyaltyProgramDto);

    // Recalculate tier if points changed
    if (updateLoyaltyProgramDto.points !== undefined) {
      const tier = this.calculateTier(loyaltyProgram.points);
      loyaltyProgram.tier = tier.name;
    }

    return this.loyaltyRepository.save(loyaltyProgram);
  }

  // ========== Stamp Card Methods ==========

  /**
   * Get user's stamp cards for a restaurant
   */
  async getStampCards(userId: string, restaurantId: string): Promise<StampCard[]> {
    return this.stampCardRepository.find({
      where: { user_id: userId, restaurant_id: restaurantId },
      order: { service_type: 'ASC' },
    });
  }

  /**
   * Add a stamp to a user's card (called by WAITER, BARMAN, OWNER, MANAGER roles)
   */
  async addStamp(dto: AddStampDto): Promise<StampCard> {
    let card = await this.stampCardRepository.findOne({
      where: {
        user_id: dto.user_id,
        restaurant_id: dto.restaurant_id,
        service_type: dto.service_type,
      },
    });

    // Create card if it doesn't exist
    if (!card) {
      card = this.stampCardRepository.create({
        user_id: dto.user_id,
        restaurant_id: dto.restaurant_id,
        service_type: dto.service_type,
        current_stamps: 0,
        required_stamps: 10,
        reward_description: '',
        completed_cycles: 0,
        completed: false,
        completed_at: null,
      });
    }

    // If already completed, reset for a new cycle
    if (card.completed) {
      card.current_stamps = 0;
      card.completed = false;
      card.completed_at = null;
    }

    // Add stamp
    card.current_stamps += 1;

    // Check if card is now completed
    if (card.current_stamps >= card.required_stamps) {
      card.completed = true;
      card.completed_at = new Date();
      card.completed_cycles += 1;

      // Notify user about completed stamp card
      this.eventsGateway.notifyUser(dto.user_id, {
        type: 'loyalty:stamp_card_completed',
        service_type: dto.service_type,
        completed_cycles: card.completed_cycles,
        restaurant_id: dto.restaurant_id,
      });
    }

    // Notify user about stamp added
    this.eventsGateway.notifyUser(dto.user_id, {
      type: 'loyalty:stamp_added',
      service_type: dto.service_type,
      current_stamps: card.current_stamps,
      required_stamps: card.required_stamps,
      restaurant_id: dto.restaurant_id,
    });

    return this.stampCardRepository.save(card);
  }

  /**
   * Redeem a completed stamp card reward.
   * Deducts stamps and increments completed cycles.
   */
  async redeemStampReward(
    userId: string,
    restaurantId: string,
  ): Promise<{ redeemed: boolean; reward: string }> {
    const card = await this.stampCardRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
    });

    if (!card || card.current_stamps < card.required_stamps) {
      return { redeemed: false, reward: '' };
    }

    card.current_stamps -= card.required_stamps;
    card.completed_cycles += 1;
    card.completed = false;
    card.completed_at = null;
    await this.stampCardRepository.save(card);

    const reward = card.reward_description || 'Free item!';

    // Notify user about redemption
    this.eventsGateway.notifyUser(userId, {
      type: 'loyalty:stamp_reward_redeemed',
      reward,
      completed_cycles: card.completed_cycles,
      restaurant_id: restaurantId,
    });

    return { redeemed: true, reward };
  }

  // ========== Private Helper Methods ==========

  /**
   * Calculate tier based on points
   */
  private calculateTier(points: number): LoyaltyTierInfo {
    for (let i = this.TIERS.length - 1; i >= 0; i--) {
      const tier = this.TIERS[i];
      if (
        points >= tier.min_points &&
        (tier.max_points === null || points <= tier.max_points)
      ) {
        return tier;
      }
    }
    return this.TIERS[0]; // Default to bronze
  }

  /**
   * Get next tier
   */
  private getNextTier(currentTierName: LoyaltyTierEnum): LoyaltyTierInfo | null {
    const currentIndex = this.TIERS.findIndex((t) => t.name === currentTierName);
    if (currentIndex < this.TIERS.length - 1) {
      return this.TIERS[currentIndex + 1];
    }
    return null; // Already at max tier
  }

  /**
   * Calculate points needed to reach next tier
   */
  private getPointsToNextTier(currentPoints: number): number | null {
    const currentTier = this.calculateTier(currentPoints);
    const nextTier = this.getNextTier(currentTier.name);

    if (nextTier) {
      return nextTier.min_points - currentPoints;
    }

    return null; // Already at max tier
  }

  /**
   * Generate redemption code
   */
  private generateRedemptionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
