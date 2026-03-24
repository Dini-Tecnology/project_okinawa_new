import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { GenerateReceiptDto } from './dto/generate-receipt.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('ReceiptsController', () => {
  let controller: ReceiptsController;

  const mockReceiptsService = {
    findByOrder: jest.fn(),
    findByUser: jest.fn(),
    generate: jest.fn(),
  };

  const mockReceipt = {
    id: 'receipt-1',
    order_id: 'order-1',
    payment_id: 'payment-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    items_snapshot: [
      { name: 'Frango Grelhado', qty: 2, unit_price: 35.0, total: 70.0 },
    ],
    subtotal: 70.0,
    service_fee: 7.0,
    tip: 5.0,
    total: 82.0,
    payment_method: 'credit_card',
    generated_at: new Date('2024-06-15T20:00:00Z'),
    created_at: new Date('2024-06-15T20:00:00Z'),
  };

  const mockUser = mockAuthenticatedUser({ sub: 'user-1', id: 'user-1', email: 'user@example.com' });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsController],
      providers: [
        {
          provide: ReceiptsService,
          useValue: mockReceiptsService,
        },
      ],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReceiptsController>(ReceiptsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByOrder', () => {
    it('should return a receipt for a specific order', async () => {
      mockReceiptsService.findByOrder.mockResolvedValue(mockReceipt);

      const result = await controller.findByOrder('order-1');

      expect(result).toEqual(mockReceipt);
      expect(mockReceiptsService.findByOrder).toHaveBeenCalledWith('order-1');
    });

    it('should propagate NotFoundException when receipt does not exist', async () => {
      mockReceiptsService.findByOrder.mockRejectedValue(
        new NotFoundException('Receipt not found for this order'),
      );

      await expect(controller.findByOrder('nonexistent-order')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMyReceipts', () => {
    it('should return paginated receipts for the current user', async () => {
      const paginatedResult = {
        items: [mockReceipt],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockReceiptsService.findByUser.mockResolvedValue(paginatedResult);

      const pagination = { page: 1, limit: 10 } as PaginationDto;

      const result = await controller.findMyReceipts(mockUser, pagination);

      expect(result).toEqual(paginatedResult);
      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockReceiptsService.findByUser).toHaveBeenCalledWith('user-1', pagination);
    });

    it('should return empty result when user has no receipts', async () => {
      const emptyResult = {
        items: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockReceiptsService.findByUser.mockResolvedValue(emptyResult);

      const pagination = { page: 1, limit: 10 } as PaginationDto;

      const result = await controller.findMyReceipts(mockUser, pagination);

      expect(result.items).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('generate', () => {
    it('should generate a receipt for a completed order', async () => {
      const generateDto: GenerateReceiptDto = {
        orderId: 'order-1',
        paymentId: 'payment-1',
      };

      mockReceiptsService.generate.mockResolvedValue(mockReceipt);

      const result = await controller.generate(mockUser, generateDto);

      expect(result).toEqual(mockReceipt);
      expect(mockReceiptsService.generate).toHaveBeenCalledWith(
        'order-1',
        'payment-1',
        'user-1',
        '',   // restaurant_id placeholder
        [],   // items_snapshot placeholder
        0,    // subtotal placeholder
        0,    // service_fee placeholder
        0,    // tip placeholder
        0,    // total placeholder
        '',   // payment_method placeholder
      );
    });

    it('should generate receipt without a payment ID', async () => {
      const generateDto: GenerateReceiptDto = {
        orderId: 'order-2',
      };

      const receiptWithNullPayment = { ...mockReceipt, order_id: 'order-2', payment_id: null };
      mockReceiptsService.generate.mockResolvedValue(receiptWithNullPayment);

      const result = await controller.generate(mockUser, generateDto);

      expect(result).toEqual(receiptWithNullPayment);
      expect(mockReceiptsService.generate).toHaveBeenCalledWith(
        'order-2',
        null,
        'user-1',
        '',
        [],
        0,
        0,
        0,
        0,
        '',
      );
    });

    it('should propagate ConflictException when receipt already exists', async () => {
      const generateDto: GenerateReceiptDto = { orderId: 'order-1' };
      mockReceiptsService.generate.mockRejectedValue(
        new ConflictException('Receipt already exists for this order'),
      );

      await expect(controller.generate(mockUser, generateDto)).rejects.toThrow(ConflictException);
    });

    it('should use current user sub as user_id when generating receipt', async () => {
      const generateDto: GenerateReceiptDto = { orderId: 'order-5' };
      const differentUser = mockAuthenticatedUser({ sub: 'user-99', id: 'user-99', email: 'other@example.com' });
      mockReceiptsService.generate.mockResolvedValue({ ...mockReceipt, user_id: 'user-99' });

      await controller.generate(differentUser, generateDto);

      const callArgs = mockReceiptsService.generate.mock.calls[0];
      expect(callArgs[2]).toBe('user-99');
    });
  });
});
