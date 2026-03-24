import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { Receipt, ReceiptItemSnapshot } from './entities/receipt.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';

describe('ReceiptsService', () => {
  let service: ReceiptsService;

  const mockItemsSnapshot: ReceiptItemSnapshot[] = [
    { name: 'Frango Grelhado', qty: 2, unit_price: 35.0, total: 70.0 },
    { name: 'Suco de Laranja', qty: 1, unit_price: 12.0, total: 12.0 },
  ];

  const mockReceipt: Receipt = {
    id: 'receipt-1',
    order_id: 'order-1',
    payment_id: 'payment-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    items_snapshot: mockItemsSnapshot,
    subtotal: 82.0,
    service_fee: 8.2,
    tip: 10.0,
    total: 100.2,
    payment_method: 'credit_card',
    generated_at: new Date('2024-06-15T20:00:00Z'),
    created_at: new Date('2024-06-15T20:00:00Z'),
  };

  const mockReceiptRepo = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsService,
        {
          provide: getRepositoryToken(Receipt),
          useValue: mockReceiptRepo,
        },
      ],
    }).compile();

    service = module.get<ReceiptsService>(ReceiptsService);

    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('should generate a receipt successfully', async () => {
      mockReceiptRepo.findOne.mockResolvedValue(null); // No existing receipt
      mockReceiptRepo.create.mockReturnValue(mockReceipt);
      mockReceiptRepo.save.mockResolvedValue(mockReceipt);

      const result = await service.generate(
        'order-1',
        'payment-1',
        'user-1',
        'restaurant-1',
        mockItemsSnapshot,
        82.0,
        8.2,
        10.0,
        100.2,
        'credit_card',
      );

      expect(result).toEqual(mockReceipt);
      expect(mockReceiptRepo.findOne).toHaveBeenCalledWith({ where: { order_id: 'order-1' } });
      expect(mockReceiptRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: 'order-1',
          payment_id: 'payment-1',
          user_id: 'user-1',
          restaurant_id: 'restaurant-1',
          subtotal: 82.0,
          service_fee: 8.2,
          tip: 10.0,
          total: 100.2,
          payment_method: 'credit_card',
        }),
      );
      expect(mockReceiptRepo.save).toHaveBeenCalledWith(mockReceipt);
    });

    it('should throw ConflictException if receipt already exists for the order', async () => {
      mockReceiptRepo.findOne.mockResolvedValue(mockReceipt);

      await expect(
        service.generate(
          'order-1',
          'payment-1',
          'user-1',
          'restaurant-1',
          mockItemsSnapshot,
          82.0,
          8.2,
          10.0,
          100.2,
          'credit_card',
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockReceiptRepo.create).not.toHaveBeenCalled();
      expect(mockReceiptRepo.save).not.toHaveBeenCalled();
    });

    it('should generate a receipt with null payment_id', async () => {
      const receiptWithNoPayment = { ...mockReceipt, payment_id: null as any };
      mockReceiptRepo.findOne.mockResolvedValue(null);
      mockReceiptRepo.create.mockReturnValue(receiptWithNoPayment);
      mockReceiptRepo.save.mockResolvedValue(receiptWithNoPayment);

      const result = await service.generate(
        'order-2',
        null,
        'user-1',
        'restaurant-1',
        [],
        50.0,
        0,
        0,
        50.0,
        'cash',
      );

      expect(result).toBeDefined();
      expect(mockReceiptRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_id: null,
        }),
      );
    });

    it('should include a generated_at timestamp when creating receipt', async () => {
      mockReceiptRepo.findOne.mockResolvedValue(null);
      mockReceiptRepo.create.mockImplementation((data) => ({ ...data, id: 'receipt-new' }));
      mockReceiptRepo.save.mockImplementation((data) => Promise.resolve(data));

      const before = new Date();
      const result = await service.generate(
        'order-3',
        'pay-3',
        'user-3',
        'rest-3',
        [],
        20.0,
        2.0,
        3.0,
        25.0,
        'debit_card',
      );
      const after = new Date();

      expect(result.generated_at).toBeDefined();
      expect(new Date(result.generated_at).getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(new Date(result.generated_at).getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('findByOrder', () => {
    it('should return a receipt by order ID', async () => {
      mockReceiptRepo.findOne.mockResolvedValue(mockReceipt);

      const result = await service.findByOrder('order-1');

      expect(result).toEqual(mockReceipt);
      expect(mockReceiptRepo.findOne).toHaveBeenCalledWith({
        where: { order_id: 'order-1' },
      });
    });

    it('should throw NotFoundException when no receipt exists for the order', async () => {
      mockReceiptRepo.findOne.mockResolvedValue(null);

      await expect(service.findByOrder('nonexistent-order')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return paginated receipts for a user', async () => {
      const receipts = [mockReceipt, { ...mockReceipt, id: 'receipt-2', order_id: 'order-2' }];
      mockReceiptRepo.findAndCount.mockResolvedValue([receipts, 2]);

      const pagination = { page: 1, limit: 10 } as PaginationDto;

      const result = await service.findByUser('user-1', pagination);

      expect(result.items).toEqual(receipts);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(mockReceiptRepo.findAndCount).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        order: { generated_at: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should return empty paginated list when user has no receipts', async () => {
      mockReceiptRepo.findAndCount.mockResolvedValue([[], 0]);

      const pagination = { page: 1, limit: 10 } as PaginationDto;

      const result = await service.findByUser('user-no-receipts', pagination);

      expect(result.items).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should calculate correct skip for page 2', async () => {
      mockReceiptRepo.findAndCount.mockResolvedValue([[], 0]);

      const pagination = { page: 2, limit: 5 } as PaginationDto;

      await service.findByUser('user-1', pagination);

      expect(mockReceiptRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });

    it('should use defaults when page and limit are not provided', async () => {
      mockReceiptRepo.findAndCount.mockResolvedValue([[], 0]);

      const pagination = {} as PaginationDto;

      await service.findByUser('user-1', pagination);

      expect(mockReceiptRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should include hasNextPage and hasPreviousPage in meta', async () => {
      const manyReceipts = Array.from({ length: 5 }, (_, i) => ({
        ...mockReceipt,
        id: `receipt-${i}`,
        order_id: `order-${i}`,
      }));
      mockReceiptRepo.findAndCount.mockResolvedValue([manyReceipts, 15]);

      const pagination = { page: 2, limit: 5 } as PaginationDto;

      const result = await service.findByUser('user-1', pagination);

      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
      expect(result.meta.totalPages).toBe(3);
    });
  });
});
