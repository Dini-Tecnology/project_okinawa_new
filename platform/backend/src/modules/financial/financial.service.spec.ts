import { Test, TestingModule } from '@nestjs/testing';
import { FinancialService } from './financial.service';
import { FinancialTransactionService } from './financial-transaction.service';
import { FinancialReportService } from './financial-report.service';
import { FinancialExportService } from './financial-export.service';
import {
  TransactionType,
  TransactionCategory,
} from './entities/financial-transaction.entity';

describe('FinancialService (facade)', () => {
  let service: FinancialService;
  let transactionService: FinancialTransactionService;
  let reportService: FinancialReportService;
  let exportService: FinancialExportService;

  const mockTransaction = {
    id: 'transaction-1',
    restaurant_id: 'restaurant-1',
    type: TransactionType.SALE,
    category: TransactionCategory.FOOD_SALES,
    amount: 100,
    description: 'Sale from order',
  };

  const mockTransactionService = {
    createTransaction: jest.fn().mockResolvedValue(mockTransaction),
    recordSale: jest.fn().mockResolvedValue(mockTransaction),
    recordTip: jest.fn().mockResolvedValue(mockTransaction),
    recordExpense: jest.fn().mockResolvedValue(mockTransaction),
    getTransactions: jest.fn().mockResolvedValue({ transactions: [mockTransaction], total: 1, limit: 50, offset: 0 }),
    updateTransaction: jest.fn().mockResolvedValue(mockTransaction),
  };

  const mockReportService = {
    getSummary: jest.fn().mockResolvedValue({ summary: { total_revenue: 100 } }),
    getDailySummary: jest.fn().mockResolvedValue([{ date: '2024-01-01', total_sales: 100 }]),
    getRevenueByCategory: jest.fn().mockResolvedValue([{ category: 'food_sales', total: 100 }]),
    getExpensesByCategory: jest.fn().mockResolvedValue([{ category: 'supplies', total: 50 }]),
    getProfitLossStatement: jest.fn().mockResolvedValue({ net_profit: 50 }),
    getCashFlow: jest.fn().mockResolvedValue({ summary: { net_cash_flow: 50 } }),
  };

  const mockExportService = {
    exportReport: jest.fn().mockResolvedValue({ format: 'pdf', data: {} }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
        { provide: FinancialTransactionService, useValue: mockTransactionService },
        { provide: FinancialReportService, useValue: mockReportService },
        { provide: FinancialExportService, useValue: mockExportService },
      ],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
    transactionService = module.get(FinancialTransactionService);
    reportService = module.get(FinancialReportService);
    exportService = module.get(FinancialExportService);

    jest.clearAllMocks();
  });

  // ────────── Transaction delegates ──────────

  describe('createTransaction', () => {
    it('should delegate to transactionService.createTransaction', async () => {
      const dto = { restaurant_id: 'r1', type: TransactionType.SALE, category: TransactionCategory.FOOD_SALES, amount: 100 } as any;
      await service.createTransaction(dto);
      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(dto);
    });
  });

  describe('recordSale', () => {
    it('should delegate to transactionService.recordSale', async () => {
      await service.recordSale('r1', 'o1', 100, TransactionCategory.BEVERAGE_SALES);
      expect(mockTransactionService.recordSale).toHaveBeenCalledWith('r1', 'o1', 100, TransactionCategory.BEVERAGE_SALES);
    });
  });

  describe('recordTip', () => {
    it('should delegate to transactionService.recordTip', async () => {
      await service.recordTip('r1', 'tip-1', 50);
      expect(mockTransactionService.recordTip).toHaveBeenCalledWith('r1', 'tip-1', 50);
    });
  });

  describe('recordExpense', () => {
    it('should delegate to transactionService.recordExpense', async () => {
      await service.recordExpense('r1', TransactionCategory.SUPPLIES, 200, 'Supplies', { vendor: 'X' });
      expect(mockTransactionService.recordExpense).toHaveBeenCalledWith('r1', TransactionCategory.SUPPLIES, 200, 'Supplies', { vendor: 'X' });
    });
  });

  describe('getTransactions', () => {
    it('should delegate to transactionService.getTransactions', async () => {
      const queryDto = { start_date: '2024-01-01', end_date: '2024-12-31' } as any;
      await service.getTransactions('r1', queryDto, 50, 0);
      expect(mockTransactionService.getTransactions).toHaveBeenCalledWith('r1', queryDto, 50, 0);
    });
  });

  describe('updateTransaction', () => {
    it('should delegate to transactionService.updateTransaction', async () => {
      const dto = { description: 'Updated' } as any;
      await service.updateTransaction('tx-1', dto);
      expect(mockTransactionService.updateTransaction).toHaveBeenCalledWith('tx-1', dto);
    });
  });

  // ────────── Report delegates ──────────

  describe('getSummary', () => {
    it('should delegate to reportService.getSummary', async () => {
      const queryDto = { start_date: '2024-01-01', end_date: '2024-12-31' } as any;
      await service.getSummary('r1', queryDto);
      expect(mockReportService.getSummary).toHaveBeenCalledWith('r1', queryDto);
    });
  });

  describe('getDailySummary', () => {
    it('should delegate to reportService.getDailySummary', async () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      await service.getDailySummary('r1', start, end);
      expect(mockReportService.getDailySummary).toHaveBeenCalledWith('r1', start, end);
    });
  });

  describe('getRevenueByCategory', () => {
    it('should delegate to reportService.getRevenueByCategory', async () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      await service.getRevenueByCategory('r1', start, end);
      expect(mockReportService.getRevenueByCategory).toHaveBeenCalledWith('r1', start, end);
    });
  });

  describe('getExpensesByCategory', () => {
    it('should delegate to reportService.getExpensesByCategory', async () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      await service.getExpensesByCategory('r1', start, end);
      expect(mockReportService.getExpensesByCategory).toHaveBeenCalledWith('r1', start, end);
    });
  });

  describe('getProfitLossStatement', () => {
    it('should delegate to reportService.getProfitLossStatement', async () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      await service.getProfitLossStatement('r1', start, end);
      expect(mockReportService.getProfitLossStatement).toHaveBeenCalledWith('r1', start, end);
    });
  });

  describe('getCashFlow', () => {
    it('should delegate to reportService.getCashFlow', async () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      await service.getCashFlow('r1', start, end);
      expect(mockReportService.getCashFlow).toHaveBeenCalledWith('r1', start, end);
    });
  });

  // ────────── Export delegates ──────────

  describe('exportReport', () => {
    it('should delegate to exportService.exportReport', async () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      await service.exportReport('r1', start, end, 'pdf', 'summary');
      expect(mockExportService.exportReport).toHaveBeenCalledWith('r1', start, end, 'pdf', 'summary');
    });
  });
});
