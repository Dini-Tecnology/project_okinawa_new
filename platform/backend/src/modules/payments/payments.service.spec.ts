import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WalletType, TransactionType } from '@common/enums';
import { CashbackService } from '@/modules/loyalty/cashback.service';
import { EventsGateway } from '@/modules/events/events.realtime';
import { FinancialTransactionService } from '@/modules/financial/financial-transaction.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let walletRepository: Repository<Wallet>;
  let transactionRepository: Repository<WalletTransaction>;
  let paymentMethodRepository: Repository<PaymentMethod>;
  let orderRepository: Repository<Order>;

  const mockWallet = {
    id: 'wallet-1',
    user_id: 'user-1',
    wallet_type: WalletType.CLIENT,
    balance: 100,
  };

  const mockPaymentMethod = {
    id: 'pm-1',
    user_id: 'user-1',
    type: 'credit_card',
    is_default: true,
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  };

  const mockWalletRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockPaymentMethodRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockOrderRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(WalletTransaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(PaymentMethod),
          useValue: mockPaymentMethodRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: EventsGateway,
          useValue: { server: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } },
        },
        {
          provide: FinancialTransactionService,
          useValue: { createTransaction: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: CashbackService,
          useValue: {
            processOrderCashback: jest.fn().mockResolvedValue({ credited: false }),
            processOrderPoints: jest.fn().mockResolvedValue({ credited: false }),
          },
        },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn().mockResolvedValue({ id: 'notif-1' }) },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    walletRepository = module.get(getRepositoryToken(Wallet));
    transactionRepository = module.get(getRepositoryToken(WalletTransaction));
    paymentMethodRepository = module.get(getRepositoryToken(PaymentMethod));
    orderRepository = module.get(getRepositoryToken(Order));

    jest.clearAllMocks();
  });

  describe('getWallet', () => {
    it('should return existing wallet', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.getWallet('user-1');

      expect(result).toEqual(mockWallet);
      expect(mockWalletRepository.findOne).toHaveBeenCalled();
    });

    it('should create wallet if not exists', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);
      mockWalletRepository.create.mockReturnValue(mockWallet);
      mockWalletRepository.save.mockResolvedValue(mockWallet);

      const result = await service.getWallet('user-1');

      expect(result).toBeDefined();
      expect(mockWalletRepository.create).toHaveBeenCalled();
      expect(mockWalletRepository.save).toHaveBeenCalled();
    });
  });

  describe('rechargeWallet', () => {
    it('should recharge wallet successfully', async () => {
      const rechargeDto = {
        amount: 50,
        payment_method_id: 'pm-1',
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepository.create.mockReturnValue({
        wallet_id: mockWallet.id,
        amount: 50,
      });
      mockQueryRunner.manager.save.mockResolvedValue(mockWallet);

      const result = await service.rechargeWallet('user-1', rechargeDto);

      expect(result).toHaveProperty('wallet');
      expect(result).toHaveProperty('transaction');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      const rechargeDto = {
        amount: 50,
        payment_method_id: 'pm-1',
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockQueryRunner.manager.save.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.rechargeWallet('user-1', rechargeDto),
      ).rejects.toThrow();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('withdrawWallet', () => {
    it('should withdraw from wallet successfully', async () => {
      const withdrawDto = {
        amount: 30,
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepository.create.mockReturnValue({
        wallet_id: mockWallet.id,
        amount: 30,
      });
      mockQueryRunner.manager.save.mockResolvedValue(mockWallet);

      const result = await service.withdrawWallet('user-1', withdrawDto);

      expect(result).toHaveProperty('wallet');
      expect(result).toHaveProperty('transaction');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for insufficient balance', async () => {
      const withdrawDto = {
        amount: 200,
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      await expect(
        service.withdrawWallet('user-1', withdrawDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentMethods', () => {
    it('should return payment methods for user', async () => {
      mockPaymentMethodRepository.find.mockResolvedValue([mockPaymentMethod]);

      const result = await service.getPaymentMethods('user-1');

      expect(result).toEqual([mockPaymentMethod]);
      expect(mockPaymentMethodRepository.find).toHaveBeenCalled();
    });
  });

  describe('createPaymentMethod', () => {
    it('should add payment method successfully', async () => {
      const createDto = {
        method_type: 'credit_card' as any,
        card_last_four: '4242',
      };

      mockPaymentMethodRepository.create.mockReturnValue(mockPaymentMethod);
      mockPaymentMethodRepository.save.mockResolvedValue(mockPaymentMethod);

      const result = await service.createPaymentMethod('user-1', createDto);

      expect(result).toEqual(mockPaymentMethod);
      expect(mockPaymentMethodRepository.save).toHaveBeenCalled();
    });
  });

  describe('getTransactions', () => {
    it('should return wallet transactions', async () => {
      const mockTransactions = [
        { id: 'tx-1', amount: 50 },
        { id: 'tx-2', amount: 30 },
      ];

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getTransactions('user-1');

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionRepository.find).toHaveBeenCalled();
    });
  });

  describe('deletePaymentMethod', () => {
    it('should soft delete payment method', async () => {
      mockPaymentMethodRepository.findOne.mockResolvedValue(mockPaymentMethod);
      mockPaymentMethodRepository.save.mockResolvedValue({
        ...mockPaymentMethod,
        is_active: false,
      });

      const result = await service.deletePaymentMethod('user-1', 'pm-1');

      expect(result.is_active).toBe(false);
      expect(mockPaymentMethodRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if payment method not found', async () => {
      mockPaymentMethodRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deletePaymentMethod('user-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePaymentMethod', () => {
    it('should update payment method', async () => {
      const updateDto = {
        is_default: true,
      };

      mockPaymentMethodRepository.findOne.mockResolvedValue(mockPaymentMethod);
      mockPaymentMethodRepository.update.mockResolvedValue({ affected: 1 });
      mockPaymentMethodRepository.save.mockResolvedValue({
        ...mockPaymentMethod,
        is_default: true,
      });

      const result = await service.updatePaymentMethod('user-1', 'pm-1', updateDto);

      expect(result.is_default).toBe(true);
      expect(mockPaymentMethodRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if payment method not found', async () => {
      mockPaymentMethodRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updatePaymentMethod('user-1', 'nonexistent', { is_default: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should unset other defaults when setting new default', async () => {
      const updateDto = {
        is_default: true,
      };

      mockPaymentMethodRepository.findOne.mockResolvedValue(mockPaymentMethod);
      mockPaymentMethodRepository.update.mockResolvedValue({ affected: 1 });
      mockPaymentMethodRepository.save.mockResolvedValue({
        ...mockPaymentMethod,
        is_default: true,
      });

      await service.updatePaymentMethod('user-1', 'pm-1', updateDto);

      expect(mockPaymentMethodRepository.update).toHaveBeenCalledWith(
        { user_id: 'user-1', is_default: true },
        { is_default: false },
      );
    });
  });

  describe('processPayment', () => {
    const mockOrder = {
      id: 'order-1',
      user_id: 'user-1',
      total_amount: 100,
    };

    it('should process wallet payment successfully', async () => {
      const processDto = {
        order_id: 'order-1',
        amount: 100,
        payment_method: 'wallet' as any,
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepository.create.mockReturnValue({
        wallet_id: mockWallet.id,
        amount: 100,
      });
      mockQueryRunner.manager.save.mockResolvedValue(mockWallet);

      const result = await service.processPayment('user-1', processDto);

      expect(result.success).toBe(true);
      expect(result.order_id).toBe('order-1');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should process credit card payment successfully', async () => {
      const processDto = {
        order_id: 'order-1',
        amount: 100,
        payment_method: 'credit_card' as any,
        tokenized_card: {
          payment_token: 'tok_test_12345',
          last_four: '4242',
        },
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.processPayment('user-1', processDto);

      expect(result.success).toBe(true);
      expect(result.payment_method).toBe('credit_card');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should process pix payment successfully', async () => {
      const processDto = {
        order_id: 'order-1',
        amount: 100,
        payment_method: 'pix' as any,
        pix_key: 'user@email.com',
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.processPayment('user-1', processDto);

      expect(result.success).toBe(true);
      expect(result.payment_method).toBe('pix');
    });

    it('should return pending status for cash payment', async () => {
      const processDto = {
        order_id: 'order-1',
        amount: 100,
        payment_method: 'cash' as any,
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.processPayment('user-1', processDto);

      expect(result.success).toBe(true);
      expect(result.payment_status).toBe('pending');
    });

    it('should throw NotFoundException if order not found', async () => {
      const processDto = {
        order_id: 'nonexistent',
        amount: 100,
        payment_method: 'wallet' as any,
      };

      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.processPayment('user-1', processDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if amount does not match', async () => {
      const processDto = {
        order_id: 'order-1',
        amount: 50,
        payment_method: 'wallet' as any,
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      await expect(
        service.processPayment('user-1', processDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for insufficient wallet balance', async () => {
      const processDto = {
        order_id: 'order-1',
        amount: 100,
        payment_method: 'wallet' as any,
      };

      const lowBalanceWallet = { ...mockWallet, balance: 10 };
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockWalletRepository.findOne.mockResolvedValue(lowBalanceWallet);

      await expect(
        service.processPayment('user-1', processDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid payment method', async () => {
      const processDto = {
        order_id: 'order-1',
        amount: 100,
        payment_method: 'invalid_method' as any,
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      await expect(
        service.processPayment('user-1', processDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
