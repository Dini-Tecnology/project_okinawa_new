import { Injectable } from '@nestjs/common';
import { FinancialTransactionService } from './financial-transaction.service';
import { FinancialReportService, DailySummary, CategoryBreakdown } from './financial-report.service';
import { FinancialExportService } from './financial-export.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FinancialReportQueryDto } from './dto/financial-report-query.dto';
import { TransactionCategory } from './entities/financial-transaction.entity';

// Re-export interfaces so existing consumers are not broken
export { DailySummary, CategoryBreakdown } from './financial-report.service';

@Injectable()
export class FinancialService {
  constructor(
    private readonly transactionService: FinancialTransactionService,
    private readonly reportService: FinancialReportService,
    private readonly exportService: FinancialExportService,
  ) {}

  // ────────── Transaction delegates ──────────

  createTransaction(createTransactionDto: CreateTransactionDto) {
    return this.transactionService.createTransaction(createTransactionDto);
  }

  recordSale(
    restaurantId: string,
    orderId: string,
    amount: number,
    category?: TransactionCategory,
  ) {
    return this.transactionService.recordSale(restaurantId, orderId, amount, category);
  }

  recordTip(restaurantId: string, tipId: string, amount: number) {
    return this.transactionService.recordTip(restaurantId, tipId, amount);
  }

  recordExpense(
    restaurantId: string,
    category: TransactionCategory,
    amount: number,
    description: string,
    metadata?: Record<string, any>,
  ) {
    return this.transactionService.recordExpense(
      restaurantId,
      category,
      amount,
      description,
      metadata,
    );
  }

  getTransactions(
    restaurantId: string,
    queryDto: FinancialReportQueryDto,
    limit?: number,
    offset?: number,
  ) {
    return this.transactionService.getTransactions(restaurantId, queryDto, limit, offset);
  }

  updateTransaction(id: string, updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.updateTransaction(id, updateTransactionDto);
  }

  // ────────── Report delegates ──────────

  getSummary(restaurantId: string, queryDto: FinancialReportQueryDto) {
    return this.reportService.getSummary(restaurantId, queryDto);
  }

  getDailySummary(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailySummary[]> {
    return this.reportService.getDailySummary(restaurantId, startDate, endDate);
  }

  getRevenueByCategory(restaurantId: string, startDate: Date, endDate: Date) {
    return this.reportService.getRevenueByCategory(restaurantId, startDate, endDate);
  }

  getExpensesByCategory(restaurantId: string, startDate: Date, endDate: Date) {
    return this.reportService.getExpensesByCategory(restaurantId, startDate, endDate);
  }

  getProfitLossStatement(restaurantId: string, startDate: Date, endDate: Date) {
    return this.reportService.getProfitLossStatement(restaurantId, startDate, endDate);
  }

  getCashFlow(restaurantId: string, startDate: Date, endDate: Date) {
    return this.reportService.getCashFlow(restaurantId, startDate, endDate);
  }

  // ────────── Export delegates ──────────

  exportReport(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
    format: 'pdf' | 'csv' | 'excel',
    reportType: 'summary' | 'detailed' | 'transactions',
  ) {
    return this.exportService.exportReport(
      restaurantId,
      startDate,
      endDate,
      format,
      reportType,
    );
  }
}
