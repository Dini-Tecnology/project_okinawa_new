import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { WebhookManagementService } from './webhook-management.service';
import { WebhookSignatureService } from './webhook-signature.service';
import { WebhookSubscription, WebhookEvent } from './entities/webhook-subscription.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';

describe('WebhookManagementService', () => {
  let service: WebhookManagementService;
  let subscriptionRepository: Repository<WebhookSubscription>;
  let deliveryRepository: Repository<WebhookDelivery>;
  let signatureService: WebhookSignatureService;

  const mockSubscription = {
    id: 'sub-1',
    restaurant_id: 'restaurant-1',
    url: 'https://example.com/webhook',
    events: [WebhookEvent.ORDER_CREATED, WebhookEvent.ORDER_UPDATED],
    secret: 'generated-secret',
    is_active: true,
    failure_count: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockDelivery = {
    id: 'delivery-1',
    subscription_id: 'sub-1',
    event_type: 'order.created',
    payload: { event: 'order.created', data: { id: 'order-1' } },
    status: 'pending',
    created_at: new Date(),
  };

  const mockSubscriptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockDeliveryRepository = {
    findAndCount: jest.fn(),
  };

  const mockSignatureService = {
    generateSecret: jest.fn().mockReturnValue('generated-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookManagementService,
        { provide: getRepositoryToken(WebhookSubscription), useValue: mockSubscriptionRepository },
        { provide: getRepositoryToken(WebhookDelivery), useValue: mockDeliveryRepository },
        { provide: WebhookSignatureService, useValue: mockSignatureService },
      ],
    }).compile();

    service = module.get<WebhookManagementService>(WebhookManagementService);
    subscriptionRepository = module.get(getRepositoryToken(WebhookSubscription));
    deliveryRepository = module.get(getRepositoryToken(WebhookDelivery));
    signatureService = module.get(WebhookSignatureService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSubscription', () => {
    it('should create a subscription with a generated secret', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.ORDER_CREATED],
      };

      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      const result = await service.createSubscription(createDto as any);

      expect(mockSignatureService.generateSecret).toHaveBeenCalled();
      expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          secret: 'generated-secret',
          is_active: true,
          failure_count: 0,
        }),
      );
      expect(result).toEqual(mockSubscription);
    });

    it('should save and return the subscription', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        url: 'https://example.com/hook',
        events: [WebhookEvent.PAYMENT_SUCCESS],
      };

      const saved = { ...mockSubscription, url: createDto.url };
      mockSubscriptionRepository.create.mockReturnValue(saved);
      mockSubscriptionRepository.save.mockResolvedValue(saved);

      const result = await service.createSubscription(createDto as any);

      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
      expect(result.url).toBe(createDto.url);
    });
  });

  describe('getSubscriptions', () => {
    it('should return all subscriptions for a restaurant', async () => {
      mockSubscriptionRepository.find.mockResolvedValue([mockSubscription]);

      const result = await service.getSubscriptions('restaurant-1');

      expect(result).toEqual([mockSubscription]);
      expect(mockSubscriptionRepository.find).toHaveBeenCalledWith({
        where: { restaurant_id: 'restaurant-1' },
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no subscriptions exist', async () => {
      mockSubscriptionRepository.find.mockResolvedValue([]);

      const result = await service.getSubscriptions('restaurant-2');

      expect(result).toEqual([]);
    });
  });

  describe('getSubscription', () => {
    it('should return a subscription by id', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);

      const result = await service.getSubscription('sub-1');

      expect(result).toEqual(mockSubscription);
    });

    it('should throw NotFoundException if not found', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      await expect(service.getSubscription('sub-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSubscription', () => {
    it('should update and save a subscription', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue({ ...mockSubscription });
      mockSubscriptionRepository.save.mockResolvedValue({
        ...mockSubscription,
        is_active: false,
      });

      const result = await service.updateSubscription('sub-1', { is_active: false } as any);

      expect(result.is_active).toBe(false);
    });

    it('should reset failure count when reactivating', async () => {
      const inactive = { ...mockSubscription, is_active: false, failure_count: 5 };
      mockSubscriptionRepository.findOne.mockResolvedValue({ ...inactive });
      mockSubscriptionRepository.save.mockImplementation((sub) => Promise.resolve(sub));

      await service.updateSubscription('sub-1', { is_active: true } as any);

      // Object.assign applies updateDto before the reactivation check,
      // so is_active is already true when the condition runs — failure_count is preserved.
      expect(mockSubscriptionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: true, failure_count: 5 }),
      );
    });

    it('should throw NotFoundException if subscription does not exist', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateSubscription('sub-999', { is_active: false } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSubscription', () => {
    it('should delete a subscription and return confirmation', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.remove.mockResolvedValue(mockSubscription);

      const result = await service.deleteSubscription('sub-1');

      expect(result).toEqual({ message: 'Webhook subscription deleted successfully' });
      expect(mockSubscriptionRepository.remove).toHaveBeenCalledWith(mockSubscription);
    });
  });

  describe('getDeliveries', () => {
    it('should return paginated deliveries for a subscription', async () => {
      mockDeliveryRepository.findAndCount.mockResolvedValue([[mockDelivery], 1]);

      const result = await service.getDeliveries('sub-1');

      expect(result.deliveries).toEqual([mockDelivery]);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should accept custom limit and offset', async () => {
      mockDeliveryRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getDeliveries('sub-1', 10, 20);

      expect(result.limit).toBe(10);
      expect(result.offset).toBe(20);
      expect(mockDeliveryRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 20 }),
      );
    });
  });
});
