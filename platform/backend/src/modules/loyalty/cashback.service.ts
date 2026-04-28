import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LoyaltyConfig } from './entities/loyalty-config.entity';
import { LoyaltyProgram } from './entities/loyalty-program.entity';
import { Wallet } from '../payments/entities/wallet.entity';
import { WalletTransaction } from '../payments/entities/wallet-transaction.entity';
import { WalletType, TransactionType } from '@common/enums';
import { EventsGateway } from '@/modules/events/events.realtime';

@Injectable()
export class CashbackService {
  private readonly logger = new Logger(CashbackService.name);

  constructor(
    @InjectRepository(LoyaltyConfig)
    private configRepository: Repository<LoyaltyConfig>,
    @InjectRepository(LoyaltyProgram)
    private loyaltyRepository: Repository<LoyaltyProgram>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
    private eventsGateway: EventsGateway,
    private dataSource: DataSource,
  ) {}

  // ========== Config CRUD ==========

  /**
   * Get loyalty config for a restaurant
   */
  async getConfig(restaurantId: string): Promise<LoyaltyConfig | null> {
    return this.configRepository.findOne({
      where: { restaurant_id: restaurantId },
    });
  }

  /**
   * Upsert loyalty config for a restaurant
   */
  async upsertConfig(
    restaurantId: string,
    data: Partial<LoyaltyConfig>,
  ): Promise<LoyaltyConfig> {
    let config = await this.configRepository.findOne({
      where: { restaurant_id: restaurantId },
    });

    if (!config) {
      config = this.configRepository.create({
        restaurant_id: restaurantId,
        ...data,
      });
    } else {
      Object.assign(config, data);
    }

    return this.configRepository.save(config);
  }

  // ========== Cashback Processing ==========

  /**
   * Process cashback for a completed order.
   * Credits the user's wallet with amount * cashback_percentage / 100.
   */
  async processOrderCashback(
    userId: string,
    restaurantId: string,
    orderAmount: number,
  ): Promise<{ cashback_amount: number; credited: boolean }> {
    const config = await this.configRepository.findOne({
      where: { restaurant_id: restaurantId },
    });

    if (!config || !config.cashback_enabled) {
      return { cashback_amount: 0, credited: false };
    }

    const cashbackAmount =
      Math.round(orderAmount * Number(config.cashback_percentage)) / 100;

    if (cashbackAmount <= 0) {
      return { cashback_amount: 0, credited: false };
    }

    // Credit wallet
    await this.dataSource.transaction(async (manager) => {
      let wallet = await manager.findOne(Wallet, {
        where: { user_id: userId, wallet_type: WalletType.CLIENT },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        wallet = manager.create(Wallet, {
          user_id: userId,
          wallet_type: WalletType.CLIENT,
          balance: 0,
        });
        wallet = await manager.save(Wallet, wallet);
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + cashbackAmount;

      wallet.balance = balanceAfter;
      await manager.save(Wallet, wallet);

      const transaction = manager.create(WalletTransaction, {
        wallet_id: wallet.id,
        transaction_type: TransactionType.RECHARGE,
        amount: cashbackAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Cashback ${Number(config.cashback_percentage)}% — R$ ${cashbackAmount.toFixed(2)}`,
        metadata: {
          type: 'cashback',
          restaurant_id: restaurantId,
          order_amount: orderAmount,
          cashback_percentage: Number(config.cashback_percentage),
        },
      });
      await manager.save(WalletTransaction, transaction);
    });

    // Notify user
    this.eventsGateway.notifyUser(userId, {
      type: 'loyalty:cashback_earned',
      cashback_amount: cashbackAmount,
      restaurant_id: restaurantId,
    });

    this.logger.log(
      `Cashback R$ ${cashbackAmount.toFixed(2)} credited to user ${userId.slice(0, 8)} from restaurant ${restaurantId.slice(0, 8)}`,
    );

    return { cashback_amount: cashbackAmount, credited: true };
  }

  // ========== Points Processing ==========

  /**
   * Process points for a completed order.
   * Awards floor(amount * points_per_real) points.
   */
  async processOrderPoints(
    userId: string,
    restaurantId: string,
    orderAmount: number,
  ): Promise<{ points_earned: number; credited: boolean }> {
    const config = await this.configRepository.findOne({
      where: { restaurant_id: restaurantId },
    });

    if (!config || !config.points_enabled) {
      return { points_earned: 0, credited: false };
    }

    const pointsEarned = Math.floor(orderAmount * config.points_per_real);

    if (pointsEarned <= 0) {
      return { points_earned: 0, credited: false };
    }

    await this.dataSource.transaction(async (manager) => {
      let profile = await manager.findOne(LoyaltyProgram, {
        where: { user_id: userId, restaurant_id: restaurantId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!profile) {
        profile = manager.create(LoyaltyProgram, {
          user_id: userId,
          restaurant_id: restaurantId,
          points: 0,
          total_visits: 0,
          total_spent: 0,
          is_active: true,
          rewards_claimed: [],
          available_rewards: [],
        });
        profile = await manager.save(LoyaltyProgram, profile);
      }

      await manager
        .createQueryBuilder()
        .update(LoyaltyProgram)
        .set({
          points: () => `points + ${pointsEarned}`,
        })
        .where('id = :id', { id: profile.id })
        .execute();
    });

    this.eventsGateway.notifyUser(userId, {
      type: 'loyalty:config_points_earned',
      points: pointsEarned,
      restaurant_id: restaurantId,
    });

    this.logger.log(
      `${pointsEarned} points credited to user ${userId.slice(0, 8)} from restaurant ${restaurantId.slice(0, 8)}`,
    );

    return { points_earned: pointsEarned, credited: true };
  }

  // ========== Points Redemption ==========

  /**
   * Redeem points for wallet credit.
   * Converts points to R$ using points_redemption_rate.
   */
  async redeemPoints(
    userId: string,
    restaurantId: string,
    points: number,
  ): Promise<{ amount_credited: number; points_redeemed: number }> {
    const config = await this.configRepository.findOne({
      where: { restaurant_id: restaurantId },
    });

    if (!config || !config.points_enabled) {
      throw new BadRequestException('Points program is not enabled for this restaurant');
    }

    if (points < config.min_points_for_redemption) {
      throw new BadRequestException(
        `Minimum ${config.min_points_for_redemption} points required for redemption`,
      );
    }

    const profile = await this.loyaltyRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
    });

    if (!profile || profile.points < points) {
      throw new BadRequestException('Insufficient points');
    }

    const amountCredited =
      Math.round(points * Number(config.points_redemption_rate) * 100) / 100;

    await this.dataSource.transaction(async (manager) => {
      // Deduct points
      await manager
        .createQueryBuilder()
        .update(LoyaltyProgram)
        .set({
          points: () => `points - ${points}`,
        })
        .where('id = :id', { id: profile.id })
        .execute();

      // Credit wallet
      let wallet = await manager.findOne(Wallet, {
        where: { user_id: userId, wallet_type: WalletType.CLIENT },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        wallet = manager.create(Wallet, {
          user_id: userId,
          wallet_type: WalletType.CLIENT,
          balance: 0,
        });
        wallet = await manager.save(Wallet, wallet);
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + amountCredited;

      wallet.balance = balanceAfter;
      await manager.save(Wallet, wallet);

      const transaction = manager.create(WalletTransaction, {
        wallet_id: wallet.id,
        transaction_type: TransactionType.RECHARGE,
        amount: amountCredited,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Resgate de ${points} pontos — R$ ${amountCredited.toFixed(2)}`,
        metadata: {
          type: 'points_redemption',
          restaurant_id: restaurantId,
          points_redeemed: points,
          redemption_rate: Number(config.points_redemption_rate),
        },
      });
      await manager.save(WalletTransaction, transaction);
    });

    this.eventsGateway.notifyUser(userId, {
      type: 'loyalty:points_redeemed',
      points_redeemed: points,
      amount_credited: amountCredited,
      restaurant_id: restaurantId,
    });

    this.logger.log(
      `${points} points redeemed for R$ ${amountCredited.toFixed(2)} by user ${userId.slice(0, 8)}`,
    );

    return { amount_credited: amountCredited, points_redeemed: points };
  }

  // ========== Points Balance ==========

  /**
   * Get points balance for user at a restaurant
   */
  async getPointsBalance(
    userId: string,
    restaurantId: string,
  ): Promise<{ points: number; monetary_value: number }> {
    const profile = await this.loyaltyRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
    });

    const config = await this.configRepository.findOne({
      where: { restaurant_id: restaurantId },
    });

    const points = profile?.points ?? 0;
    const rate = config ? Number(config.points_redemption_rate) : 0;
    const monetaryValue = Math.round(points * rate * 100) / 100;

    return { points, monetary_value: monetaryValue };
  }
}
