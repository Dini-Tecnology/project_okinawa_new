import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialTransactionService } from './financial-transaction.service';
import {
  FinancialTransaction,
  TransactionType,
  TransactionCategory,
} from './entities/financial-transaction.entity';
import { EventsGateway } from '@/modules/events/events.gateway';
import { NotFoundException } from '@nestjs/common';

describe('FinancialTransactionService', () => {
  let service: FinancialTransactionService;
  let transactionRepository: Repository<FinancialTransaction>;
  let eventsGateway: EventsGateway;

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

  const mockEventsGateway = {
    notifyRestaurant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialTransactionService,
        {
          provide: getRepositoryToken(FinancialTransaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
      ],
    }).compile();

    service = module.get<FinancialTransactionService>(FinancialTransactionService);
    transactionRepository = module.get(getRepositoryToken(FinancialTransaction));
    eventsGateway = module.get(EventsGateway);

    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a transaction and notify restaurant', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        type: TransactionType.SALE,
        category: TransactionCategory.FOOD_SALES,
        amount: 100,
        description: 'Test sale',
        metadata: {},
      };

      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.createTransaction(createDto as any);

      expect(result).toBeDefined();
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockTransactionRepository.save).toHaveBeenCalled();
      expect(mockEventsGateway.notifyRestaurant).toHaveBeenCalledWith(
        'restaurant-1',
        expect.objectContaining({
          type: 'financial:transaction_created',
          transaction_id: mockTransaction.id,
        }),
      );
    });
  });

  describe('recordSale', () => {
    it('should record a sale transaction', async () => {
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.recordSale('restaurant-1', 'order-1', 100);

      expect(result).toBeDefined();
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurant_id: 'restaurant-1',
          type: TransactionType.SALE,
          amount: 100,
          reference_id: 'order-1',
        }),
      );
    });

    it('should use custom category if provided', async () => {
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      await service.recordSale(
        'restaurant-1',
        'order-1',
        100,
        TransactionCategory.BEVERAGE_SALES,
      );

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: TransactionCategory.BEVERAGE_SALES,
        }),
      );
    });
  });

  describe('recordTip', () => {
    it('should record a tip transaction', async () => {
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.recordTip('restaurant-1', 'tip-1', 50);

      expect(result).toBeDefined();
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.TIP,
          category: TransactionCategory.TIP_INCOME,
          amount: 50,
        }),
      );
    });
  });

  describe('recordExpense', () => {
    it('should record an expense transaction', async () => {
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.recordExpense(
        'restaurant-1',
        TransactionCategory.SUPPLIES,
        200,
        'Food supplies',
        { vendor: 'Supplier Inc' },
      );

      expect(result).toBeDefined();
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.EXPENSE,
          category: TransactionCategory.SUPPLIES,
          amount: 200,
          description: 'Food supplies',
        }),
      );
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTransaction], 1]);

      const queryDto = {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };

      const result = await service.getTransactions('restaurant-1', queryDto as any, 50, 0);

      expect(result.transactions).toEqual([mockTransaction]);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction description', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        description: 'Updated description',
      });

      const result = await service.updateTransaction('transaction-1', {
        description: 'Updated description',
      } as any);

      expect(result.description).toBe('Updated description');
    });

    it('should update reference_id', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        reference_id: 'new-ref-id',
      });

      const result = await service.updateTransaction('transaction-1', {
        reference_id: 'new-ref-id',
      } as any);

      expect(result.reference_id).toBe('new-ref-id');
    });

    it('should store status in metadata', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        metadata: { status: 'pending' },
      });

      const result = await service.updateTransaction('transaction-1', {
        status: 'pending',
      } as any);

      expect(result.metadata).toEqual({ status: 'pending' });
    });

    it('should store notes in metadata', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        metadata: { notes: 'Test note' },
      });

      const result = await service.updateTransaction('transaction-1', {
        notes: 'Test note',
      } as any);

      expect(result.metadata).toEqual({ notes: 'Test note' });
    });

    it('should throw NotFoundException if transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTransaction('transaction-1', { description: 'Test' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
