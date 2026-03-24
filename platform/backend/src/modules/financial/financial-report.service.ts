import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, FindOperator } from 'typeorm';
import {
  FinancialTransaction,
  TransactionType,
} from './entities/financial-transaction.entity';
import { FinancialReportQueryDto } from './dto/financial-report-query.dto';

export interface DailySummary {
  date: string;
  total_sales: number;
  total_expenses: number;
  net_profit: number;
  transaction_count: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

@Injectable()
export class FinancialReportService {
  private readonly logger = new Logger(FinancialReportService.name);

  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly transactionRepo: Repository<FinancialTransaction>,
  ) {}

  /** Get financial summary for a date range */
  async getSummary(restaurantId: string, queryDto: FinancialReportQueryDto) {
    try {
      const startDate = new Date(queryDto.start_date);
      const endDate = new Date(queryDto.end_date);
      this.validateDateRange(startDate, endDate);

      const queryBuilder = this.transactionRepo
        .createQueryBuilder('transaction')
        .where('transaction.restaurant_id = :restaurantId', { restaurantId })
        .andWhere('transaction.transaction_date BETWEEN :startDate AND :endDate', { startDate, endDate });

      if (queryDto.type) {
        queryBuilder.andWhere('transaction.type = :type', { type: queryDto.type });
      }
      if (queryDto.category) {
        queryBuilder.andWhere('transaction.category = :category', { category: queryDto.category });
      }

      const transactions = await queryBuilder.getMany();
      const sumByType = (type: TransactionType) =>
        transactions.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount), 0);

      const salesTotal = sumByType(TransactionType.SALE);
      const tipsTotal = sumByType(TransactionType.TIP);
      const expensesTotal = sumByType(TransactionType.EXPENSE);
      const refundsTotal = sumByType(TransactionType.REFUND);
      const totalRevenue = salesTotal + tipsTotal;
      const totalCosts = expensesTotal + refundsTotal;
      const netProfit = totalRevenue - totalCosts;

      return {
        period: { start_date: startDate, end_date: endDate },
        summary: {
          total_revenue: totalRevenue,
          sales: salesTotal,
          tips: tipsTotal,
          total_costs: totalCosts,
          expenses: expensesTotal,
          refunds: refundsTotal,
          net_profit: netProfit,
          profit_margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
          transaction_count: transactions.length,
        },
        category_breakdown: this.calculateCategoryBreakdown(transactions),
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const err = error as Error;
      this.logger.error(`Failed to get financial summary: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to retrieve financial summary');
    }
  }

  /** Get daily summary for a date range */
  async getDailySummary(restaurantId: string, startDate: Date, endDate: Date): Promise<DailySummary[]> {
    const transactions = await this.transactionRepo.find({
      where: { restaurant_id: restaurantId, transaction_date: Between(startDate, endDate) },
      order: { transaction_date: 'ASC' },
    });

    const dailyMap = new Map<string, DailySummary>();
    for (const tx of transactions) {
      const dateKey = tx.transaction_date.toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { date: dateKey, total_sales: 0, total_expenses: 0, net_profit: 0, transaction_count: 0 });
      }
      const daily = dailyMap.get(dateKey)!;
      daily.transaction_count++;
      const amount = Number(tx.amount);
      if (tx.type === TransactionType.SALE || tx.type === TransactionType.TIP) {
        daily.total_sales += amount;
        daily.net_profit += amount;
      } else if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.REFUND) {
        daily.total_expenses += amount;
        daily.net_profit -= amount;
      }
    }
    return Array.from(dailyMap.values());
  }

  /** Get revenue by category */
  async getRevenueByCategory(restaurantId: string, startDate: Date, endDate: Date) {
    return this.groupByCategory(restaurantId, startDate, endDate, In([TransactionType.SALE, TransactionType.TIP]));
  }

  /** Get expenses by category */
  async getExpensesByCategory(restaurantId: string, startDate: Date, endDate: Date) {
    return this.groupByCategory(restaurantId, startDate, endDate, TransactionType.EXPENSE);
  }

  /** Get profit/loss statement */
  async getProfitLossStatement(restaurantId: string, startDate: Date, endDate: Date) {
    const revenue = await this.getRevenueByCategory(restaurantId, startDate, endDate);
    const expenses = await this.getExpensesByCategory(restaurantId, startDate, endDate);
    const totalRevenue = revenue.reduce((sum, r) => sum + r.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      period: { start_date: startDate, end_date: endDate },
      revenue: { by_category: revenue, total: totalRevenue },
      expenses: { by_category: expenses, total: totalExpenses },
      net_profit: netProfit,
      profit_margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    };
  }

  /** Get cash flow report */
  async getCashFlow(restaurantId: string, startDate: Date, endDate: Date) {
    const transactions = await this.transactionRepo.find({
      where: { restaurant_id: restaurantId, transaction_date: Between(startDate, endDate) },
      order: { transaction_date: 'ASC' },
    });

    let runningBalance = 0;
    const cashFlowItems = transactions.map((tx) => {
      const amount = Number(tx.amount);
      const isInflow = tx.type === TransactionType.SALE || tx.type === TransactionType.TIP;
      runningBalance += isInflow ? amount : -amount;
      return {
        date: tx.transaction_date, type: tx.type, category: tx.category,
        amount, is_inflow: isInflow, running_balance: runningBalance, description: tx.description,
      };
    });

    const totalInflow = transactions
      .filter((t) => t.type === TransactionType.SALE || t.type === TransactionType.TIP)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalOutflow = transactions
      .filter((t) => t.type === TransactionType.EXPENSE || t.type === TransactionType.REFUND)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      period: { start_date: startDate, end_date: endDate },
      summary: {
        total_inflow: totalInflow, total_outflow: totalOutflow,
        net_cash_flow: totalInflow - totalOutflow, ending_balance: runningBalance,
      },
      items: cashFlowItems,
    };
  }

  /** Calculate category breakdown (used internally by getSummary) */
  calculateCategoryBreakdown(transactions: FinancialTransaction[]): CategoryBreakdown[] {
    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const categoryMap = transactions.reduce((acc, tx) => {
      const cat = tx.category;
      if (!acc[cat]) acc[cat] = { category: cat, amount: 0, percentage: 0, count: 0 };
      acc[cat].amount += Number(tx.amount);
      acc[cat].count += 1;
      return acc;
    }, {} as Record<string, CategoryBreakdown>);

    Object.values(categoryMap).forEach((item) => {
      item.percentage = total > 0 ? (item.amount / total) * 100 : 0;
    });
    return Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
  }

  // ── Private helpers ──────────────────────────────────────────────────

  private validateDateRange(startDate: Date, endDate: Date): void {
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    if (startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }
    const maxRangeMs = 365 * 24 * 60 * 60 * 1000;
    if (endDate.getTime() - startDate.getTime() > maxRangeMs) {
      throw new BadRequestException('Date range cannot exceed 1 year');
    }
  }

  private async groupByCategory(
    restaurantId: string, startDate: Date, endDate: Date,
    type: TransactionType | FindOperator<TransactionType>,
  ) {
    const transactions = await this.transactionRepo.find({
      where: { restaurant_id: restaurantId, transaction_date: Between(startDate, endDate), type },
    });
    const categoryTotals = transactions.reduce((acc, tx) => {
      const cat = tx.category;
      if (!acc[cat]) acc[cat] = { category: cat, total: 0, count: 0 };
      acc[cat].total += Number(tx.amount);
      acc[cat].count += 1;
      return acc;
    }, {} as Record<string, any>);
    return Object.values(categoryTotals);
  }
}
