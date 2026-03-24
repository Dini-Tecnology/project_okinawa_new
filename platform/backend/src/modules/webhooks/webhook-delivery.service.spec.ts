import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { WebhookSignatureService } from './webhook-signature.service';
import { CircuitBreakerService } from '@common/utils/circuit-breaker.module';
import { WebhookSubscription, WebhookEvent } from './entities/webhook-subscription.entity';
import { WebhookDelivery, DeliveryStatus } from './entities/webhook-delivery.entity';

// Mock axios
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));
import axios from 'axios';

describe('WebhookDeliveryService', () => {
  let service: WebhookDeliveryService;
  let subscriptionRepository: Repository<WebhookSubscription>;
  let deliveryRepository: Repository<WebhookDelivery>;

  const mockSubscription = {
    id: 'sub-1',
    restaurant_id: 'restaurant-1',
    url: 'https://example.com/webhook',
    events: [WebhookEvent.ORDER_CREATED],
    secret: 'test-secret',
    is_active: true,
    failure_count: 0,
    headers: null,
    last_triggered_at: null,
    last_success_at: null,
    last_failure_at: null,
  };

  const mockDelivery = {
    id: 'delivery-1',
    subscription_id: 'sub-1',
    event_type: WebhookEvent.ORDER_CREATED,
    payload: { event: 'order.created', timestamp: '2024-01-01T00:00:00Z', data: { id: '1' }, webhook_id: 'sub-1' },
    status: DeliveryStatus.PENDING,
    retry_count: 0,
    max_retries: 3,
    created_at: new Date('2024-01-01'),
    subscription: mockSubscription,
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockSubscriptionRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    save: jest.fn(),
  };

  const mockDeliveryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSignatureService = {
    generateSignature: jest.fn().mockReturnValue('mock-signature'),
  };

  // The CircuitBreaker execute() just passes through to the function
  const mockCircuitBreaker = {
    execute: jest.fn((fn: () => Promise<any>) => fn()),
  };

  const mockCircuitBreakerService = {
    getBreaker: jest.fn().mockReturnValue(mockCircuitBreaker),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookDeliveryService,
        { provide: getRepositoryToken(WebhookSubscription), useValue: mockSubscriptionRepository },
        { provide: getRepositoryToken(WebhookDelivery), useValue: mockDeliveryRepository },
        { provide: WebhookSignatureService, useValue: mockSignatureService },
        { provide: CircuitBreakerService, useValue: mockCircuitBreakerService },
      ],
    }).compile();

    service = module.get<WebhookDeliveryService>(WebhookDeliveryService);
    subscriptionRepository = module.get(getRepositoryToken(WebhookSubscription));
    deliveryRepository = module.get(getRepositoryToken(WebhookDelivery));

    jest.clearAllMocks();
    // Re-setup passthrough after clearAllMocks
    mockCircuitBreaker.execute.mockImplementation((fn: () => Promise<any>) => fn());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('triggerEvent', () => {
    it('should create deliveries for all active subscriptions', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockSubscription]);
      mockDeliveryRepository.create.mockReturnValue({ ...mockDelivery });
      mockDeliveryRepository.save.mockResolvedValue([{ ...mockDelivery }]);
      mockDeliveryRepository.findOne.mockResolvedValue({ ...mockDelivery, subscription: mockSubscription });
      (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: { ok: true } });

      await service.triggerEvent('restaurant-1', WebhookEvent.ORDER_CREATED, { id: 'order-1' });

      expect(mockSubscriptionRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockDeliveryRepository.create).toHaveBeenCalled();
      expect(mockDeliveryRepository.save).toHaveBeenCalled();
    });

    it('should skip when no active subscriptions exist', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.triggerEvent('restaurant-1', WebhookEvent.ORDER_CREATED, { id: 'order-1' });

      expect(mockDeliveryRepository.create).not.toHaveBeenCalled();
    });

    it('should create a delivery with correct payload structure', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockSubscription]);
      mockDeliveryRepository.create.mockImplementation((data) => data);
      mockDeliveryRepository.save.mockResolvedValue([]);

      await service.triggerEvent('restaurant-1', WebhookEvent.ORDER_CREATED, { id: 'order-1' });

      expect(mockDeliveryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_id: 'sub-1',
          event_type: WebhookEvent.ORDER_CREATED,
          status: DeliveryStatus.PENDING,
          retry_count: 0,
          max_retries: 3,
        }),
      );
    });
  });

  describe('deliverWebhook', () => {
    it('should deliver payload via HTTP POST and mark as SUCCESS', async () => {
      mockDeliveryRepository.findOne.mockResolvedValue({ ...mockDelivery, subscription: mockSubscription });
      mockDeliveryRepository.save.mockImplementation((d) => Promise.resolve(d));
      mockSubscriptionRepository.save.mockImplementation((s) => Promise.resolve(s));
      (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: { ok: true } });

      await service.deliverWebhook('delivery-1');

      expect(axios.post).toHaveBeenCalledWith(
        mockSubscription.url,
        mockDelivery.payload,
        expect.objectContaining({ timeout: 10000 }),
      );
      expect(mockSignatureService.generateSignature).toHaveBeenCalledWith(
        mockDelivery.payload,
        mockSubscription.secret,
      );
      expect(mockDeliveryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: DeliveryStatus.SUCCESS }),
      );
    });

    it('should skip if delivery is already successful', async () => {
      mockDeliveryRepository.findOne.mockResolvedValue({
        ...mockDelivery,
        status: DeliveryStatus.SUCCESS,
        subscription: mockSubscription,
      });

      await service.deliverWebhook('delivery-1');

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should skip if subscription is inactive', async () => {
      mockDeliveryRepository.findOne.mockResolvedValue({
        ...mockDelivery,
        subscription: { ...mockSubscription, is_active: false },
      });

      await service.deliverWebhook('delivery-1');

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle delivery not found gracefully', async () => {
      mockDeliveryRepository.findOne.mockResolvedValue(null);

      await expect(service.deliverWebhook('unknown-id')).resolves.toBeUndefined();
    });

    it('should use circuit breaker for HTTP delivery', async () => {
      mockDeliveryRepository.findOne.mockResolvedValue({ ...mockDelivery, subscription: mockSubscription });
      mockDeliveryRepository.save.mockImplementation((d) => Promise.resolve(d));
      mockSubscriptionRepository.save.mockImplementation((s) => Promise.resolve(s));
      (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: {} });

      await service.deliverWebhook('delivery-1');

      expect(mockCircuitBreaker.execute).toHaveBeenCalled();
    });
  });

  describe('retryDelivery', () => {
    it('should reset status to PENDING and re-deliver', async () => {
      const failedDelivery = {
        ...mockDelivery,
        status: DeliveryStatus.FAILED,
        next_retry_at: new Date(),
      };
      mockDeliveryRepository.findOne
        .mockResolvedValueOnce(failedDelivery)
        .mockResolvedValueOnce({ ...failedDelivery, status: DeliveryStatus.PENDING, subscription: mockSubscription });
      mockDeliveryRepository.save.mockImplementation((d) => Promise.resolve(d));
      mockSubscriptionRepository.save.mockImplementation((s) => Promise.resolve(s));
      (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: {} });

      const result = await service.retryDelivery('delivery-1');

      expect(result.status).toBe(DeliveryStatus.PENDING);
      expect(result.next_retry_at).toBeNull();
    });

    it('should throw NotFoundException if delivery does not exist', async () => {
      mockDeliveryRepository.findOne.mockResolvedValue(null);

      await expect(service.retryDelivery('unknown-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw error for already successful delivery', async () => {
      mockDeliveryRepository.findOne.mockResolvedValue({
        ...mockDelivery,
        status: DeliveryStatus.SUCCESS,
      });

      await expect(service.retryDelivery('delivery-1')).rejects.toThrow('Cannot retry successful delivery');
    });
  });

  describe('testWebhook', () => {
    it('should create a test delivery with max_retries=0 and deliver it', async () => {
      const testDelivery = {
        ...mockDelivery,
        id: 'test-delivery',
        event_type: 'webhook.test',
        max_retries: 0,
      };

      mockDeliveryRepository.create.mockReturnValue(testDelivery);
      mockDeliveryRepository.save.mockResolvedValue(testDelivery);
      mockDeliveryRepository.findOne.mockResolvedValue({
        ...testDelivery,
        subscription: mockSubscription,
        status: DeliveryStatus.SUCCESS,
      });
      mockSubscriptionRepository.save.mockImplementation((s) => Promise.resolve(s));
      (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: { ok: true } });

      const result = await service.testWebhook(mockSubscription as any);

      expect(mockDeliveryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'webhook.test',
          max_retries: 0,
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('processRetries', () => {
    it('should re-deliver retryable deliveries', async () => {
      const retryable = {
        ...mockDelivery,
        status: DeliveryStatus.RETRYING,
        subscription: { ...mockSubscription, is_active: true },
      };

      mockDeliveryRepository.find.mockResolvedValue([retryable]);
      mockDeliveryRepository.findOne.mockResolvedValue(retryable);
      mockDeliveryRepository.save.mockImplementation((d) => Promise.resolve(d));
      mockSubscriptionRepository.save.mockImplementation((s) => Promise.resolve(s));
      (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: {} });

      await service.processRetries();

      expect(mockDeliveryRepository.find).toHaveBeenCalled();
    });

    it('should skip inactive subscriptions during retry', async () => {
      const retryable = {
        ...mockDelivery,
        status: DeliveryStatus.RETRYING,
        subscription: { ...mockSubscription, is_active: false },
      };

      mockDeliveryRepository.find.mockResolvedValue([retryable]);

      await service.processRetries();

      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});
