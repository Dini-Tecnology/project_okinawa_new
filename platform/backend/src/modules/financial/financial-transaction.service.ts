import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FinancialTransaction,
  TransactionType,
  TransactionCategory,
  ReferenceType,
} from './entities/financial-transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FinancialReportQueryDto } from './dto/financial-report-query.dto';
import { EventsGateway } from '@/modules/events/events.gateway';
import { PAGINATION } from '@common/constants/limits';

@Injectable()
export class FinancialTransactionService {
  private readonly logger = new Logger(FinancialTransactionService.name);

  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly transactionRepo: Repository<FinancialTransaction>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Create a financial transaction
   */
  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const transaction = this.transactionRepo.create(createTransactionDto);
    const savedTransaction = await this.transactionRepo.save(transaction);

    // Notify restaurant about financial activity
    this.eventsGateway.notifyRestaurant(
      createTransactionDto.restaurant_id,
      {
        type: 'financial:transaction_created',
        transaction_id: savedTransaction.id,
        transaction_type: savedTransaction.type,
        amount: savedTransaction.amount,
        category: savedTransaction.category,
      },
    );

    return savedTransaction;
  }

  /**
   * Record sale transaction from order (called by Orders/Payments module)
   */
  async recordSale(
    restaurantId: string,
    orderId: string,
    amount: number,
    category: TransactionCategory = TransactionCategory.FOOD_SALES,
  ) {
    return this.createTransaction({
      restaurant_id: restaurantId,
      type: TransactionType.SALE,
      category: category,
      amount: amount,
      description: `Sale from order`,
      reference_id: orderId,
      reference_type: ReferenceType.ORDER,
      metadata: {},
    });
  }

  /**
   * Record tip transaction
   */
  async recordTip(restaurantId: string, tipId: string, amount: number) {
    return this.createTransaction({
      restaurant_id: restaurantId,
      type: TransactionType.TIP,
      category: TransactionCategory.TIP_INCOME,
      amount: amount,
      description: `Tip received`,
      reference_id: tipId,
      reference_type: ReferenceType.TIP,
      metadata: {},
    });
  }

  /**
   * Record expense transaction
   */
  async recordExpense(
    restaurantId: string,
    category: TransactionCategory,
    amount: number,
    description: string,
    metadata?: Record<string, any>,
  ) {
    return this.createTransaction({
      restaurant_id: restaurantId,
      type: TransactionType.EXPENSE,
      category: category,
      amount: amount,
      description: description,
      metadata: metadata,
    });
  }

  /**
   * Get detailed transactions list
   */
  async getTransactions(
    restaurantId: string,
    queryDto: FinancialReportQueryDto,
    limit: number = PAGINATION.DEFAULT_PAGE_SIZE,
    offset: number = 0,
  ) {
    const startDate = new Date(queryDto.start_date);
    const endDate = new Date(queryDto.end_date);

    const queryBuilder = this.transactionRepo
      .createQueryBuilder('transaction')
      .where('transaction.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('transaction.transaction_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (queryDto.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: queryDto.type });
    }

    if (queryDto.category) {
      queryBuilder.andWhere('transaction.category = :category', {
        category: queryDto.category,
      });
    }

    const [transactions, total] = await queryBuilder
      .orderBy('transaction.transaction_date', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  /**
   * Update financial transaction.
   * Note: Transaction amounts are immutable, only status, description, and metadata can be updated.
   */
  async updateTransaction(id: string, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.transactionRepo.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (updateTransactionDto.description !== undefined) {
      transaction.description = updateTransactionDto.description;
    }

    if (updateTransactionDto.reference_id !== undefined) {
      transaction.reference_id = updateTransactionDto.reference_id;
    }

    // Store status and notes in metadata since FinancialTransaction entity may not have these fields
    if (updateTransactionDto.status !== undefined || updateTransactionDto.notes !== undefined) {
      transaction.metadata = {
        ...transaction.metadata,
        ...(updateTransactionDto.status && { status: updateTransactionDto.status }),
        ...(updateTransactionDto.notes && { notes: updateTransactionDto.notes }),
      };
    }

    return this.transactionRepo.save(transaction);
  }

  /**
   * Find COGS transactions for a restaurant in a period, with metadata type filter.
   * Used by MarginTrackerService.
   */
  async findCogsTransactions(
    restaurantId: string,
    since: Date,
  ): Promise<FinancialTransaction[]> {
    return this.transactionRepo
      .createQueryBuilder('t')
      .where('t.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('t.category = :category', { category: TransactionCategory.SUPPLIES })
      .andWhere('t.transaction_date >= :since', { since })
      .andWhere("t.metadata->>'type' = :metaType", { metaType: 'cogs' })
      .getMany();
  }

  /**
   * Find sale transactions for a restaurant in a period.
   * Used by MarginTrackerService.
   */
  async findSaleTransactions(
    restaurantId: string,
    since: Date,
    categories: TransactionCategory[],
  ): Promise<FinancialTransaction[]> {
    return this.transactionRepo
      .createQueryBuilder('t')
      .where('t.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('t.type = :type', { type: TransactionType.SALE })
      .andWhere('t.category IN (:...categories)', { categories })
      .andWhere('t.transaction_date >= :since', { since })
      .getMany();
  }

  /**
   * Get aggregated COGS total for a restaurant in a period.
   * Used by MarginTrackerService.getFoodCost().
   */
  async sumCogsAmount(restaurantId: string, since: Date): Promise<number> {
    const result = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('t.category = :category', { category: TransactionCategory.SUPPLIES })
      .andWhere('t.transaction_date >= :since', { since })
      .andWhere("t.metadata->>'type' = :metaType", { metaType: 'cogs' })
      .getRawOne();
    return Number(result?.total || 0);
  }

  /**
   * Get aggregated sale revenue for a restaurant in a period.
   * Used by MarginTrackerService.getFoodCost().
   */
  async sumSaleRevenue(
    restaurantId: string,
    since: Date,
    categories: TransactionCategory[],
  ): Promise<number> {
    const result = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('t.type = :type', { type: TransactionType.SALE })
      .andWhere('t.category IN (:...categories)', { categories })
      .andWhere('t.transaction_date >= :since', { since })
      .getRawOne();
    return Number(result?.total || 0);
  }
}
