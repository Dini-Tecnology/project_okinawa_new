import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RechargeWalletDto } from './dto/recharge-wallet.dto';
import { WithdrawWalletDto } from './dto/withdraw-wallet.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: PaymentsService;

  const mockPaymentsService = {
    processPayment: jest.fn(),
    getWallet: jest.fn(),
    rechargeWallet: jest.fn(),
    withdrawWallet: jest.fn(),
    getTransactions: jest.fn(),
    getPaymentMethods: jest.fn(),
    createPaymentMethod: jest.fn(),
    updatePaymentMethod: jest.fn(),
    deletePaymentMethod: jest.fn(),
  };

  const mockWallet = {
    id: 'wallet-1',
    user_id: 'user-1',
    balance: 1000,
    currency: 'USD',
  };

  const mockPaymentMethod = {
    id: 'pm-1',
    user_id: 'user-1',
    type: 'credit_card',
    is_default: true,
    last4: '4242',
  };

  const mockPayment = {
    id: 'payment-1',
    order_id: 'order-1',
    amount: 100,
    status: 'completed',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockPaymentsService }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get<PaymentsService>(PaymentsService);

    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should process payment for order', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const processDto: ProcessPaymentDto = {
        order_id: 'order-1',
        payment_method_id: 'pm-1',
        amount: 100,
      } as any;

      mockPaymentsService.processPayment.mockResolvedValue(mockPayment);

      const result = await controller.processPayment(user, processDto);

      expect(result).toEqual(mockPayment);
      expect(mockPaymentsService.processPayment).toHaveBeenCalledWith('user-1', processDto);
    });
  });

  describe('getWallet', () => {
    it('should get wallet balance', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });

      mockPaymentsService.getWallet.mockResolvedValue(mockWallet);

      const result = await controller.getWallet(user);

      expect(result).toEqual(mockWallet);
      expect(mockPaymentsService.getWallet).toHaveBeenCalledWith('user-1');
    });
  });

  describe('rechargeWallet', () => {
    it('should recharge wallet', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const rechargeDto: RechargeWalletDto = {
        amount: 500,
        payment_method_id: 'pm-1',
      } as any;

      const rechargedWallet = { ...mockWallet, balance: 1500 };
      mockPaymentsService.rechargeWallet.mockResolvedValue(rechargedWallet);

      const result = await controller.rechargeWallet(user, rechargeDto);

      expect(result).toEqual(rechargedWallet);
      expect(mockPaymentsService.rechargeWallet).toHaveBeenCalledWith('user-1', rechargeDto);
    });
  });

  describe('withdrawWallet', () => {
    it('should withdraw from wallet', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const withdrawDto: WithdrawWalletDto = {
        amount: 200,
      } as any;

      const withdrawnWallet = { ...mockWallet, balance: 800 };
      mockPaymentsService.withdrawWallet.mockResolvedValue(withdrawnWallet);

      const result = await controller.withdrawWallet(user, withdrawDto);

      expect(result).toEqual(withdrawnWallet);
      expect(mockPaymentsService.withdrawWallet).toHaveBeenCalledWith('user-1', withdrawDto);
    });
  });

  describe('getTransactions', () => {
    it('should get wallet transactions', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const transactions = [
        {
          id: 'txn-1',
          wallet_id: 'wallet-1',
          amount: 100,
          type: 'credit',
        },
      ];

      mockPaymentsService.getTransactions.mockResolvedValue(transactions);

      const result = await controller.getTransactions(user);

      expect(result).toEqual(transactions);
      expect(mockPaymentsService.getTransactions).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getPaymentMethods', () => {
    it('should get payment methods', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const methods = [mockPaymentMethod];

      mockPaymentsService.getPaymentMethods.mockResolvedValue(methods);

      const result = await controller.getPaymentMethods(user);

      expect(result).toEqual(methods);
      expect(mockPaymentsService.getPaymentMethods).toHaveBeenCalledWith('user-1');
    });
  });

  describe('createPaymentMethod', () => {
    it('should create payment method', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const createDto: CreatePaymentMethodDto = {
        type: 'credit_card',
        card_number: '4242424242424242',
        exp_month: 12,
        exp_year: 2025,
        cvv: '123',
      } as any;

      mockPaymentsService.createPaymentMethod.mockResolvedValue(mockPaymentMethod);

      const result = await controller.createPaymentMethod(user, createDto);

      expect(result).toEqual(mockPaymentMethod);
      expect(mockPaymentsService.createPaymentMethod).toHaveBeenCalledWith('user-1', createDto);
    });
  });

  describe('updatePaymentMethod', () => {
    it('should update payment method', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const updateDto: UpdatePaymentMethodDto = {
        is_default: false,
      };

      const updatedMethod = { ...mockPaymentMethod, is_default: false };
      mockPaymentsService.updatePaymentMethod.mockResolvedValue(updatedMethod);

      const result = await controller.updatePaymentMethod(user, 'pm-1', updateDto);

      expect(result).toEqual(updatedMethod);
      expect(mockPaymentsService.updatePaymentMethod).toHaveBeenCalledWith(
        'user-1',
        'pm-1',
        updateDto,
      );
    });
  });

  describe('deletePaymentMethod', () => {
    it('should delete payment method', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const deleteResponse = { message: 'Payment method deleted successfully' };

      mockPaymentsService.deletePaymentMethod.mockResolvedValue(deleteResponse);

      const result = await controller.deletePaymentMethod(user, 'pm-1');

      expect(result).toEqual(deleteResponse);
      expect(mockPaymentsService.deletePaymentMethod).toHaveBeenCalledWith('user-1', 'pm-1');
    });
  });
});
