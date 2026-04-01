import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan, In } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { RechargeWalletDto } from './dto/recharge-wallet.dto';
import { WithdrawWalletDto } from './dto/withdraw-wallet.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { WalletType, TransactionType } from '@common/enums';
import { OrdersService } from '@/modules/orders/orders.service';
import { CashbackService } from '@/modules/loyalty/cashback.service';
import { EventsGateway } from '@/modules/events/events.gateway';
import {
  FinancialTransactionService,
} from '@/modules/financial/financial-transaction.service';
import {
  TransactionType as FinancialTransactionType,
  TransactionCategory,
  ReferenceType,
} from '@/modules/financial/entities/financial-transaction.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    private ordersService: OrdersService,
    private dataSource: DataSource,
    private cashbackService: CashbackService,
    private eventsGateway: EventsGateway,
    private financialTransactionService: FinancialTransactionService,
  ) {}

  /**
   * Calculate total wallet transaction volume for a given period.
   * Used for daily/monthly limit enforcement.
   */
  private async getTransactionVolume(
    walletId: string,
    since: Date,
    types: TransactionType[],
  ): Promise<number> {
    const transactions = await this.transactionRepository.find({
      where: {
        wallet_id: walletId,
        created_at: MoreThan(since),
        transaction_type: In(types),
      },
    });

    return (transactions || [])
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
  }

  /**
   * Validate wallet compliance limits before a transaction.
   * Checks max_balance, daily_limit, and monthly_limit.
   */
  private async validateWalletLimits(
    wallet: Wallet,
    amount: number,
    transactionType: 'recharge' | 'withdrawal',
  ): Promise<void> {
    if (transactionType === 'recharge') {
      // Check max balance
      const projectedBalance = Number(wallet.balance) + amount;
      if (projectedBalance > Number(wallet.max_balance)) {
        throw new BadRequestException(
          `Recharge would exceed maximum wallet balance of R$ ${Number(wallet.max_balance).toFixed(2)}. ` +
            `Current balance: R$ ${Number(wallet.balance).toFixed(2)}, recharge: R$ ${amount.toFixed(2)}`,
        );
      }
    }

    // Check daily limit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailyVolume = await this.getTransactionVolume(
      wallet.id,
      startOfDay,
      [TransactionType.RECHARGE, TransactionType.WITHDRAWAL, TransactionType.PAYMENT],
    );

    if (dailyVolume + amount > Number(wallet.daily_limit)) {
      throw new BadRequestException(
        `Transaction would exceed daily limit of R$ ${Number(wallet.daily_limit).toFixed(2)}. ` +
          `Today's volume: R$ ${dailyVolume.toFixed(2)}, this transaction: R$ ${amount.toFixed(2)}`,
      );
    }

    // Check monthly limit
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyVolume = await this.getTransactionVolume(
      wallet.id,
      startOfMonth,
      [TransactionType.RECHARGE, TransactionType.WITHDRAWAL, TransactionType.PAYMENT],
    );

    if (monthlyVolume + amount > Number(wallet.monthly_limit)) {
      throw new BadRequestException(
        `Transaction would exceed monthly limit of R$ ${Number(wallet.monthly_limit).toFixed(2)}. ` +
          `This month's volume: R$ ${monthlyVolume.toFixed(2)}, this transaction: R$ ${amount.toFixed(2)}`,
      );
    }
  }

  async getWallet(userId: string, walletType: WalletType = WalletType.CLIENT) {
    let wallet = await this.walletRepository.findOne({
      where: { user_id: userId, wallet_type: walletType },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        user_id: userId,
        wallet_type: walletType,
        balance: 0,
      });
      await this.walletRepository.save(wallet);
    }

    return wallet;
  }

  async rechargeWallet(userId: string, rechargeDto: RechargeWalletDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock wallet row to prevent concurrent modifications
      const Wallet = (await import('../entities/wallet.entity')).Wallet;
      let wallet = await queryRunner.manager.findOne(Wallet, {
        where: { user_id: userId, wallet_type: 'client' },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        wallet = queryRunner.manager.create(Wallet, {
          user_id: userId,
          wallet_type: 'client',
          balance: 0,
        });
        await queryRunner.manager.save(wallet);
      }

      // Validate compliance limits before proceeding
      await this.validateWalletLimits(wallet, rechargeDto.amount, 'recharge');

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + rechargeDto.amount;

      wallet.balance = balanceAfter;
      await queryRunner.manager.save(wallet);

      const transaction = this.transactionRepository.create({
        wallet_id: wallet.id,
        transaction_type: TransactionType.RECHARGE,
        amount: rechargeDto.amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: rechargeDto.description || 'Wallet recharge',
        payment_method_id: rechargeDto.payment_method_id,
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return { wallet, transaction };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async withdrawWallet(userId: string, withdrawDto: WithdrawWalletDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock wallet row to prevent concurrent modifications
      const Wallet = (await import('../entities/wallet.entity')).Wallet;
      let wallet = await queryRunner.manager.findOne(Wallet, {
        where: { user_id: userId, wallet_type: 'client' },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);

      if (balanceBefore < withdrawDto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Validate compliance limits before proceeding
      await this.validateWalletLimits(wallet, withdrawDto.amount, 'withdrawal');

      const balanceAfter = balanceBefore - withdrawDto.amount;

      wallet.balance = balanceAfter;
      await queryRunner.manager.save(wallet);

      const transaction = this.transactionRepository.create({
        wallet_id: wallet.id,
        transaction_type: TransactionType.WITHDRAWAL,
        amount: withdrawDto.amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: withdrawDto.description || 'Wallet withdrawal',
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return { wallet, transaction };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(userId: string) {
    const wallet = await this.getWallet(userId);
    return this.transactionRepository.find({
      where: { wallet_id: wallet.id },
      order: { created_at: 'DESC' },
    });
  }

  async getPaymentMethods(userId: string) {
    return this.paymentMethodRepository.find({
      where: { user_id: userId, is_active: true },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  async createPaymentMethod(userId: string, createDto: CreatePaymentMethodDto) {
    const paymentMethod = this.paymentMethodRepository.create({
      ...createDto,
      user_id: userId,
    });

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId, user_id: userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    paymentMethod.is_active = false;
    return this.paymentMethodRepository.save(paymentMethod);
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    userId: string,
    paymentMethodId: string,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId, user_id: userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    // If setting this as default, unset other defaults
    if (updatePaymentMethodDto.is_default === true) {
      await this.paymentMethodRepository.update(
        { user_id: userId, is_default: true },
        { is_default: false },
      );
    }

    Object.assign(paymentMethod, updatePaymentMethodDto);

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async processPayment(userId: string, processDto: ProcessPaymentDto) {
    const startTime = Date.now();
    const paymentCorrelationId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log({
      message: 'Payment processing initiated',
      correlationId: paymentCorrelationId,
      userId,
      orderId: processDto.order_id,
      amount: processDto.amount,
      paymentMethod: processDto.payment_method,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify order exists and belongs to user
      let order;
      try {
        order = await this.ordersService.findOne(processDto.order_id);
      } catch {
        this.logger.warn({
          message: 'Payment failed - order not found',
          correlationId: paymentCorrelationId,
          userId,
          orderId: processDto.order_id,
          duration: Date.now() - startTime,
        });
        throw new NotFoundException('Order not found');
      }

      if (order.user_id !== userId) {
        this.logger.warn({
          message: 'Payment failed - order not found',
          correlationId: paymentCorrelationId,
          userId,
          orderId: processDto.order_id,
          duration: Date.now() - startTime,
        });
        throw new NotFoundException('Order not found');
      }

      // Verify amount matches order total using precision-safe comparison
      // Round both values to 2 decimal places to avoid floating-point precision issues
      const paymentAmount = Math.round(processDto.amount * 100) / 100;
      const orderTotal = Math.round(Number(order.total_amount) * 100) / 100;
      if (paymentAmount !== orderTotal) {
        this.logger.warn({
          message: 'Payment failed - amount mismatch',
          correlationId: paymentCorrelationId,
          userId,
          orderId: processDto.order_id,
          paymentAmount,
          orderTotal,
          duration: Date.now() - startTime,
        });
        throw new BadRequestException('Payment amount does not match order total');
      }

      let paymentStatus = 'completed';
      let transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Process based on payment method
      switch (processDto.payment_method) {
        case 'wallet': {
          // Load wallet with pessimistic lock to prevent concurrent balance race
          const Wallet = (await import('../entities/wallet.entity')).Wallet;
          let wallet = await queryRunner.manager.findOne(Wallet, {
            where: { user_id: userId, wallet_type: 'client' },
            lock: { mode: 'pessimistic_write' },
          });

          if (!wallet) {
            wallet = queryRunner.manager.create(Wallet, {
              user_id: userId,
              wallet_type: 'client',
              balance: 0,
            });
            await queryRunner.manager.save(wallet);
          }

          const balanceBefore = Number(wallet.balance);
          if (balanceBefore < processDto.amount) {
            this.logger.warn({
              message: 'Payment failed - insufficient wallet balance',
              correlationId: paymentCorrelationId,
              userId,
              orderId: processDto.order_id,
              walletBalance: balanceBefore,
              requiredAmount: processDto.amount,
              duration: Date.now() - startTime,
            });
            throw new BadRequestException('Insufficient wallet balance');
          }

          wallet.balance = balanceBefore - processDto.amount;
          await queryRunner.manager.save(wallet);

          // Create transaction record
          const transaction = this.transactionRepository.create({
            wallet_id: wallet.id,
            transaction_type: TransactionType.PAYMENT,
            amount: processDto.amount,
            balance_before: balanceBefore,
            balance_after: Number(wallet.balance),
            description: `Payment for order #${order.id.substring(0, 8)}`,
            order_id: order.id,
          });
          await queryRunner.manager.save(transaction);
          break;
        }

        case 'credit_card':
        case 'debit_card':
          // In production, integrate with payment gateway (Stripe, etc)
          // For now, simulate successful payment using tokenized card
          this.logger.log(`Processing ${processDto.payment_method} payment for order ${order.id.substring(0, 8)}`);
          break;

        case 'pix':
          // In production, generate PIX QR code and await payment
          // For now, simulate successful payment
          this.logger.log(`Processing PIX payment for order ${order.id.substring(0, 8)}`);
          break;

        case 'cash':
          // Cash payment - mark as pending until confirmed
          paymentStatus = 'pending';
          break;

        default:
          throw new BadRequestException('Invalid payment method');
      }

      // Payment processed successfully
      // Note: Order entity doesn't have payment fields
      // Payment tracking is done through transactions

      await queryRunner.commitTransaction();

      // Process loyalty cashback & points (fire-and-forget, non-blocking)
      if (paymentStatus === 'completed' && order.restaurant_id) {
        this.processLoyaltyRewards(userId, order.restaurant_id, processDto.amount).catch(
          (err) => this.logger.warn(`Loyalty rewards processing failed: ${err.message}`),
        );
      }

      // FIX-9: Push notification placeholder — payment received
      this.logger.log(
        `TODO: Push notification to restaurant ${order.restaurant_id} — payment received R$${processDto.amount.toFixed(2)} for order #${order.id.substring(0, 8)}`,
      );

      const duration = Date.now() - startTime;
      this.logger.log({
        message: 'Payment processed successfully',
        correlationId: paymentCorrelationId,
        userId,
        orderId: order.id,
        transactionId,
        paymentMethod: processDto.payment_method,
        amount: processDto.amount,
        status: paymentStatus,
        duration,
      });

      // Emit WebSocket event after successful payment
      if (paymentStatus === 'completed' && order.restaurant_id) {
        const paymentEventData = {
          type: 'payment:completed',
          orderId: order.id,
          amount: processDto.amount,
          payment_method: processDto.payment_method,
          transactionId,
        };

        this.eventsGateway.notifyRestaurant(order.restaurant_id, paymentEventData);
        this.eventsGateway.notifyUser(userId, paymentEventData);
      }

      return {
        success: true,
        transaction_id: transactionId,
        payment_status: paymentStatus,
        order_id: order.id,
        amount: processDto.amount,
        payment_method: processDto.payment_method,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;
      const duration = Date.now() - startTime;
      this.logger.error({
        message: 'Payment processing failed',
        correlationId: paymentCorrelationId,
        userId,
        orderId: processDto.order_id,
        paymentMethod: processDto.payment_method,
        amount: processDto.amount,
        error: err.message,
        duration,
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Process a refund for a paid order.
   * Supports full and partial refunds via optional amount parameter.
   */
  async refundPayment(orderId: string, amount?: number): Promise<{ success: boolean; refund_amount: number }> {
    const refundCorrelationId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log({
      message: 'Refund processing initiated',
      correlationId: refundCorrelationId,
      orderId,
      requestedAmount: amount,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Find order and verify it exists (via OrdersService)
      const order = await this.ordersService.findOne(orderId);

      const orderTotal = Math.round(Number(order.total_amount) * 100) / 100;
      const refundAmount = amount
        ? Math.round(amount * 100) / 100
        : orderTotal;

      if (refundAmount <= 0) {
        throw new BadRequestException('Refund amount must be greater than zero');
      }

      if (refundAmount > orderTotal) {
        throw new BadRequestException('Refund amount cannot exceed order total');
      }

      // 2. Get or create wallet for the user and credit the refund
      const wallet = await this.getWallet(order.user_id);
      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + refundAmount;

      wallet.balance = balanceAfter;
      await queryRunner.manager.save(wallet);

      // 3. Create WalletTransaction (type: REFUND)
      const walletTransaction = this.transactionRepository.create({
        wallet_id: wallet.id,
        transaction_type: TransactionType.REFUND,
        amount: refundAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Refund for order #${order.id.substring(0, 8)}${amount ? ' (partial)' : ''}`,
        order_id: order.id,
      });
      await queryRunner.manager.save(walletTransaction);

      await queryRunner.commitTransaction();

      // 5. Create FinancialTransaction (type: REFUND) — fire-and-forget
      if (order.restaurant_id) {
        this.financialTransactionService.createTransaction({
          restaurant_id: order.restaurant_id,
          type: FinancialTransactionType.REFUND,
          category: TransactionCategory.FOOD_SALES,
          amount: -refundAmount,
          description: `Refund for order #${order.id.substring(0, 8)}`,
          reference_id: order.id,
          reference_type: ReferenceType.REFUND,
          metadata: { correlationId: refundCorrelationId, partial: !!amount },
        }).catch((err) => this.logger.warn(`Financial transaction recording failed: ${err.message}`));
      }

      // 6. Emit WebSocket event 'payment:refunded'
      if (order.restaurant_id) {
        const refundEventData = {
          type: 'payment:refunded',
          orderId: order.id,
          refund_amount: refundAmount,
          partial: !!amount,
        };

        this.eventsGateway.notifyRestaurant(order.restaurant_id, refundEventData);
        this.eventsGateway.notifyUser(order.user_id, refundEventData);
      }

      // 7. Log with correlation ID
      this.logger.log({
        message: 'Refund processed successfully',
        correlationId: refundCorrelationId,
        orderId: order.id,
        refundAmount,
        partial: !!amount,
      });

      return { success: true, refund_amount: refundAmount };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;
      this.logger.error({
        message: 'Refund processing failed',
        correlationId: refundCorrelationId,
        orderId,
        error: err.message,
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Process loyalty cashback and points after successful payment.
   * Runs asynchronously — failures are logged but don't affect payment.
   */
  private async processLoyaltyRewards(
    userId: string,
    restaurantId: string,
    amount: number,
  ): Promise<void> {
    const [cashbackResult, pointsResult] = await Promise.allSettled([
      this.cashbackService.processOrderCashback(userId, restaurantId, amount),
      this.cashbackService.processOrderPoints(userId, restaurantId, amount),
    ]);

    if (cashbackResult.status === 'fulfilled' && cashbackResult.value.credited) {
      this.logger.log(
        `Cashback R$ ${cashbackResult.value.cashback_amount.toFixed(2)} credited to user ${userId.slice(0, 8)}`,
      );
    }

    if (pointsResult.status === 'fulfilled' && pointsResult.value.credited) {
      this.logger.log(
        `${pointsResult.value.points_earned} loyalty points credited to user ${userId.slice(0, 8)}`,
      );
    }
  }
}
