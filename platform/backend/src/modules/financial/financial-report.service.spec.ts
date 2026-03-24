import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialReportService } from './financial-report.service';
import {
  FinancialTransaction,
  TransactionType,
  TransactionCategory,
} from './entities/financial-transaction.entity';

describe('FinancialReportService', () => {
  let service: FinancialReportService;
  let transactionRepository: Repository<FinancialTransaction>;

  const mockTransaction = {
    id: 'transaction-1',
    restaurant_id: 'restaurant-1',
    type: TransactionType.SALE,
    category: TransactionCategory.FOOD_SALES,
    amount: 100,
    description: 'Sale from order',
    reference_id: 'order-1',
    reference_type: 'order',
    transaction_date: new Date(),
    metadata: {},
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialReportService,
        {
          provide: getRepositoryToken(FinancialTransaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<FinancialReportService>(FinancialReportService);
    transactionRepository = module.get(getRepositoryToken(FinancialTransaction));

    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return financial summary', async () => {
      const transactions = [
        { ...mockTransaction, type: TransactionType.SALE, amount: 100 },
        { ...mockTransaction, type: TransactionType.TIP, amount: 20 },
        { ...mockTransaction, type: TransactionType.EXPENSE, amount: 50 },
        { ...mockTransaction, type: TransactionType.REFUND, amount: 10 },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(transactions);

      const queryDto = {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };

      const result = await service.getSummary('restaurant-1', queryDto as any);

      expect(result.summary.sales).toBe(100);
      expect(result.summary.tips).toBe(20);
      expect(result.summary.expenses).toBe(50);
      expect(result.summary.refunds).toBe(10);
      expect(result.summary.total_revenue).toBe(120);
      expect(result.summary.total_costs).toBe(60);
      expect(result.summary.net_profit).toBe(60);
      expect(result.summary.profit_margin).toBeCloseTo(50, 1); // 60/120 * 100 = 50%
    });

    it('should filter by type', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockTransaction]);

      const queryDto = {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        type: TransactionType.SALE,
      };

      await service.getSummary('restaurant-1', queryDto as any);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('transaction.type = :type', {
        type: TransactionType.SALE,
      });
    });

    it('should filter by category', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockTransaction]);

      const queryDto = {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        category: TransactionCategory.FOOD_SALES,
      };

      await service.getSummary('restaurant-1', queryDto as any);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.category = :category',
        { category: TransactionCategory.FOOD_SALES },
      );
    });
  });

  describe('getDailySummary', () => {
    it('should return daily summary', async () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');

      const transactions = [
        { ...mockTransaction, transaction_date: date1, type: TransactionType.SALE, amount: 100 },
        { ...mockTransaction, transaction_date: date1, type: TransactionType.EXPENSE, amount: 30 },
        { ...mockTransaction, transaction_date: date2, type: TransactionType.SALE, amount: 200 },
      ];

      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getDailySummary(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result).toHaveLength(2);
      expect(result[0].total_sales).toBe(100);
      expect(result[0].total_expenses).toBe(30);
      expect(result[0].net_profit).toBe(70);
      expect(result[1].total_sales).toBe(200);
      expect(result[1].net_profit).toBe(200);
    });
  });

  describe('getRevenueByCategory', () => {
    it('should return revenue grouped by category', async () => {
      const transactions = [
        { ...mockTransaction, category: TransactionCategory.FOOD_SALES, amount: 100 },
        { ...mockTransaction, category: TransactionCategory.FOOD_SALES, amount: 50 },
        { ...mockTransaction, category: TransactionCategory.BEVERAGE_SALES, amount: 30 },
      ];

      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getRevenueByCategory(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result).toHaveLength(2);
      const foodSales = result.find((r: any) => r.category === TransactionCategory.FOOD_SALES);
      expect(foodSales?.total).toBe(150);
      expect(foodSales?.count).toBe(2);
    });
  });

  describe('getExpensesByCategory', () => {
    it('should return expenses grouped by category', async () => {
      const transactions = [
        { ...mockTransaction, type: TransactionType.EXPENSE, category: TransactionCategory.SUPPLIES, amount: 100 },
        { ...mockTransaction, type: TransactionType.EXPENSE, category: TransactionCategory.SUPPLIES, amount: 50 },
        { ...mockTransaction, type: TransactionType.EXPENSE, category: TransactionCategory.UTILITIES, amount: 30 },
      ];

      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getExpensesByCategory(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result).toHaveLength(2);
      const supplies = result.find((r: any) => r.category === TransactionCategory.SUPPLIES);
      expect(supplies?.total).toBe(150);
      expect(supplies?.count).toBe(2);
    });
  });

  describe('getProfitLossStatement', () => {
    it('should return profit and loss statement', async () => {
      const revenue = [
        { category: TransactionCategory.FOOD_SALES, total: 500, count: 10 },
        { category: TransactionCategory.BEVERAGE_SALES, total: 200, count: 5 },
      ];

      const expenses = [
        { category: TransactionCategory.SUPPLIES, total: 300, count: 5 },
        { category: TransactionCategory.UTILITIES, total: 100, count: 2 },
      ];

      jest.spyOn(service, 'getRevenueByCategory').mockResolvedValue(revenue);
      jest.spyOn(service, 'getExpensesByCategory').mockResolvedValue(expenses);

      const result = await service.getProfitLossStatement(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result.revenue.total).toBe(700);
      expect(result.expenses.total).toBe(400);
      expect(result.net_profit).toBe(300);
      expect(result.profit_margin).toBeCloseTo(42.86, 1); // 300/700 * 100
    });
  });

  describe('getCashFlow', () => {
    it('should return cash flow report', async () => {
      const transactions = [
        { ...mockTransaction, type: TransactionType.SALE, amount: 100, transaction_date: new Date('2024-01-01') },
        { ...mockTransaction, type: TransactionType.EXPENSE, amount: 30, transaction_date: new Date('2024-01-02') },
        { ...mockTransaction, type: TransactionType.TIP, amount: 20, transaction_date: new Date('2024-01-03') },
        { ...mockTransaction, type: TransactionType.REFUND, amount: 10, transaction_date: new Date('2024-01-04') },
      ];

      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getCashFlow(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result.summary.total_inflow).toBe(120);
      expect(result.summary.total_outflow).toBe(40);
      expect(result.summary.net_cash_flow).toBe(80);
      expect(result.summary.ending_balance).toBe(80);
      expect(result.items).toHaveLength(4);
      expect(result.items[0].running_balance).toBe(100);
      expect(result.items[1].running_balance).toBe(70);
      expect(result.items[2].running_balance).toBe(90);
      expect(result.items[3].running_balance).toBe(80);
    });
  });

  describe('calculateCategoryBreakdown', () => {
    it('should calculate category breakdown with percentages', () => {
      const transactions = [
        { ...mockTransaction, category: TransactionCategory.FOOD_SALES, amount: 60 },
        { ...mockTransaction, category: TransactionCategory.FOOD_SALES, amount: 40 },
        { ...mockTransaction, category: TransactionCategory.BEVERAGE_SALES, amount: 50 },
      ] as unknown as FinancialTransaction[];

      const result = service.calculateCategoryBreakdown(transactions);

      expect(result).toHaveLength(2);
      // Sorted by amount descending
      expect(result[0].category).toBe(TransactionCategory.FOOD_SALES);
      expect(result[0].amount).toBe(100);
      expect(result[0].percentage).toBeCloseTo(66.67, 1);
      expect(result[0].count).toBe(2);
      expect(result[1].category).toBe(TransactionCategory.BEVERAGE_SALES);
      expect(result[1].amount).toBe(50);
      expect(result[1].percentage).toBeCloseTo(33.33, 1);
      expect(result[1].count).toBe(1);
    });

    it('should handle empty transactions', () => {
      const result = service.calculateCategoryBreakdown([]);
      expect(result).toEqual([]);
    });
  });
});
