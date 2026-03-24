import { Test, TestingModule } from '@nestjs/testing';
import { FinancialExportService } from './financial-export.service';
import { FinancialReportService } from './financial-report.service';
import { FinancialTransactionService } from './financial-transaction.service';

describe('FinancialExportService', () => {
  let service: FinancialExportService;
  let reportService: FinancialReportService;
  let transactionService: FinancialTransactionService;

  const mockSummary = {
    period: {
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31'),
    },
    summary: {
      total_revenue: 1000,
      sales: 900,
      tips: 100,
      total_costs: 400,
      expenses: 350,
      refunds: 50,
      net_profit: 600,
      profit_margin: 60,
      transaction_count: 20,
    },
    category_breakdown: [],
  };

  const mockProfitLoss = {
    period: { start_date: new Date('2024-01-01'), end_date: new Date('2024-12-31') },
    revenue: { by_category: [], total: 1000 },
    expenses: { by_category: [], total: 400 },
    net_profit: 600,
    profit_margin: 60,
  };

  const mockCashFlow = {
    period: { start_date: new Date('2024-01-01'), end_date: new Date('2024-12-31') },
    summary: { total_inflow: 1000, total_outflow: 400, net_cash_flow: 600, ending_balance: 600 },
    items: [],
  };

  const mockTransactions = {
    transactions: [
      {
        id: 'tx-1',
        transaction_date: new Date('2024-01-15'),
        type: 'sale',
        category: 'food_sales',
        amount: 100,
        description: 'Test sale',
      },
      {
        id: 'tx-2',
        transaction_date: new Date('2024-02-20'),
        type: 'expense',
        category: 'supplies',
        amount: 50,
        description: 'Office supplies',
      },
    ],
    total: 2,
    limit: 1000,
    offset: 0,
  };

  const mockReportService = {
    getSummary: jest.fn().mockResolvedValue(mockSummary),
    getProfitLossStatement: jest.fn().mockResolvedValue(mockProfitLoss),
    getCashFlow: jest.fn().mockResolvedValue(mockCashFlow),
  };

  const mockTransactionService = {
    getTransactions: jest.fn().mockResolvedValue(mockTransactions),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialExportService,
        {
          provide: FinancialReportService,
          useValue: mockReportService,
        },
        {
          provide: FinancialTransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    service = module.get<FinancialExportService>(FinancialExportService);
    reportService = module.get(FinancialReportService);
    transactionService = module.get(FinancialTransactionService);

    jest.clearAllMocks();
  });

  describe('exportReport', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    describe('summary report', () => {
      it('should export summary as PDF', async () => {
        mockReportService.getSummary.mockResolvedValue(mockSummary);

        const result = await service.exportReport(
          'restaurant-1',
          startDate,
          endDate,
          'pdf',
          'summary',
        );

        expect(result).toEqual(
          expect.objectContaining({
            format: 'pdf',
            report_type: 'summary',
            data: mockSummary,
          }),
        );
        expect(mockReportService.getSummary).toHaveBeenCalledWith('restaurant-1', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });
      });

      it('should export summary as CSV', async () => {
        mockReportService.getSummary.mockResolvedValue(mockSummary);

        const result = await service.exportReport(
          'restaurant-1',
          startDate,
          endDate,
          'csv',
          'summary',
        );

        expect(typeof result).toBe('string');
        expect(result).toContain('total_revenue,1000');
        expect(result).toContain('net_profit,600');
      });

      it('should export summary as Excel', async () => {
        mockReportService.getSummary.mockResolvedValue(mockSummary);

        const result = await service.exportReport(
          'restaurant-1',
          startDate,
          endDate,
          'excel',
          'summary',
        ) as any;

        expect(result.format).toBe('excel');
        expect(result.sheets).toHaveLength(1);
        expect(result.sheets[0].name).toBe('Summary');
      });
    });

    describe('detailed report', () => {
      it('should export detailed report as PDF', async () => {
        mockReportService.getProfitLossStatement.mockResolvedValue(mockProfitLoss);
        mockReportService.getCashFlow.mockResolvedValue(mockCashFlow);

        const result = await service.exportReport(
          'restaurant-1',
          startDate,
          endDate,
          'pdf',
          'detailed',
        ) as any;

        expect(result.format).toBe('pdf');
        expect(result.report_type).toBe('detailed');
        expect(result.data.profit_loss).toBeDefined();
        expect(result.data.cash_flow).toBeDefined();
        expect(mockReportService.getProfitLossStatement).toHaveBeenCalled();
        expect(mockReportService.getCashFlow).toHaveBeenCalled();
      });
    });

    describe('transactions report', () => {
      it('should export transactions as CSV', async () => {
        mockTransactionService.getTransactions.mockResolvedValue(mockTransactions);

        const result = await service.exportReport(
          'restaurant-1',
          startDate,
          endDate,
          'csv',
          'transactions',
        );

        expect(typeof result).toBe('string');
        expect(result).toContain('Date,Type,Category,Amount,Description');
        expect(result).toContain('sale');
        expect(result).toContain('expense');
      });

      it('should export transactions as Excel', async () => {
        mockTransactionService.getTransactions.mockResolvedValue(mockTransactions);

        const result = await service.exportReport(
          'restaurant-1',
          startDate,
          endDate,
          'excel',
          'transactions',
        ) as any;

        expect(result.format).toBe('excel');
        expect(result.sheets[0].name).toBe('Transactions');
        expect(result.sheets[0].data).toHaveLength(2);
      });
    });
  });
});
