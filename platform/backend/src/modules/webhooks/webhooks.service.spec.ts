import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { WebhookManagementService } from './webhook-management.service';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { WebhookSignatureService } from './webhook-signature.service';
import { WebhookEvent } from './entities/webhook-subscription.entity';

describe('WebhooksService (facade)', () => {
  let service: WebhooksService;
  let managementService: WebhookManagementService;
  let deliveryService: WebhookDeliveryService;
  let signatureService: WebhookSignatureService;

  const mockSubscription = {
    id: 'sub-1',
    restaurant_id: 'restaurant-1',
    url: 'https://example.com/webhook',
    events: [WebhookEvent.ORDER_CREATED],
    secret: 'secret-key',
    is_active: true,
    created_at: new Date(),
  };

  const mockDelivery = {
    id: 'delivery-1',
    subscription_id: 'sub-1',
    event_type: 'order.created',
    payload: { order_id: 'order-1' },
    status: 'pending',
  };

  const mockManagementService = {
    createSubscription: jest.fn().mockResolvedValue(mockSubscription),
    getSubscriptions: jest.fn().mockResolvedValue([mockSubscription]),
    getSubscription: jest.fn().mockResolvedValue(mockSubscription),
    updateSubscription: jest.fn().mockResolvedValue({ ...mockSubscription, is_active: false }),
    deleteSubscription: jest.fn().mockResolvedValue({ message: 'Webhook subscription deleted successfully' }),
    getDeliveries: jest.fn().mockResolvedValue({ deliveries: [mockDelivery], total: 1, limit: 50, offset: 0 }),
  };

  const mockDeliveryService = {
    triggerEvent: jest.fn().mockResolvedValue(undefined),
    deliverWebhook: jest.fn().mockResolvedValue(undefined),
    retryDelivery: jest.fn().mockResolvedValue(mockDelivery),
    testWebhook: jest.fn().mockResolvedValue(mockDelivery),
  };

  const mockSignatureService = {
    generateSignature: jest.fn().mockReturnValue('mock-signature'),
    verifySignature: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: WebhookManagementService, useValue: mockManagementService },
        { provide: WebhookDeliveryService, useValue: mockDeliveryService },
        { provide: WebhookSignatureService, useValue: mockSignatureService },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    managementService = module.get(WebhookManagementService);
    deliveryService = module.get(WebhookDeliveryService);
    signatureService = module.get(WebhookSignatureService);

    jest.clearAllMocks();
  });

  // ────────── Management delegates ──────────

  describe('createSubscription', () => {
    it('should delegate to managementService.createSubscription', async () => {
      const dto = { restaurant_id: 'r1', url: 'https://example.com', events: [WebhookEvent.ORDER_CREATED] } as any;
      await service.createSubscription(dto);
      expect(mockManagementService.createSubscription).toHaveBeenCalledWith(dto);
    });
  });

  describe('getSubscriptions', () => {
    it('should delegate to managementService.getSubscriptions', async () => {
      await service.getSubscriptions('restaurant-1');
      expect(mockManagementService.getSubscriptions).toHaveBeenCalledWith('restaurant-1');
    });
  });

  describe('getSubscription', () => {
    it('should delegate to managementService.getSubscription', async () => {
      await service.getSubscription('sub-1');
      expect(mockManagementService.getSubscription).toHaveBeenCalledWith('sub-1');
    });
  });

  describe('updateSubscription', () => {
    it('should delegate to managementService.updateSubscription', async () => {
      const dto = { is_active: false } as any;
      await service.updateSubscription('sub-1', dto);
      expect(mockManagementService.updateSubscription).toHaveBeenCalledWith('sub-1', dto);
    });
  });

  describe('deleteSubscription', () => {
    it('should delegate to managementService.deleteSubscription', async () => {
      await service.deleteSubscription('sub-1');
      expect(mockManagementService.deleteSubscription).toHaveBeenCalledWith('sub-1');
    });
  });

  describe('getDeliveries', () => {
    it('should delegate to managementService.getDeliveries', async () => {
      await service.getDeliveries('sub-1', 50, 0);
      expect(mockManagementService.getDeliveries).toHaveBeenCalledWith('sub-1', 50, 0);
    });
  });

  // ────────── Delivery delegates ──────────

  describe('triggerEvent', () => {
    it('should delegate to deliveryService.triggerEvent', async () => {
      await service.triggerEvent('restaurant-1', WebhookEvent.ORDER_CREATED, { id: 'order-1' });
      expect(mockDeliveryService.triggerEvent).toHaveBeenCalledWith(
        'restaurant-1',
        WebhookEvent.ORDER_CREATED,
        { id: 'order-1' },
      );
    });
  });

  describe('deliverWebhook', () => {
    it('should delegate to deliveryService.deliverWebhook', async () => {
      await service.deliverWebhook('delivery-1');
      expect(mockDeliveryService.deliverWebhook).toHaveBeenCalledWith('delivery-1');
    });
  });

  describe('retryDelivery', () => {
    it('should delegate to deliveryService.retryDelivery', async () => {
      await service.retryDelivery('delivery-1');
      expect(mockDeliveryService.retryDelivery).toHaveBeenCalledWith('delivery-1');
    });
  });

  describe('testWebhook', () => {
    it('should fetch subscription then delegate to deliveryService.testWebhook', async () => {
      await service.testWebhook('sub-1');
      expect(mockManagementService.getSubscription).toHaveBeenCalledWith('sub-1');
      expect(mockDeliveryService.testWebhook).toHaveBeenCalledWith(mockSubscription);
    });
  });

  // ────────── Signature delegates ──────────

  describe('generateSignature', () => {
    it('should delegate to signatureService.generateSignature', () => {
      const payload = { event: 'order.created' };
      service.generateSignature(payload, 'secret');
      expect(mockSignatureService.generateSignature).toHaveBeenCalledWith(payload, 'secret');
    });
  });

  describe('verifySignature', () => {
    it('should delegate to signatureService.verifySignature', () => {
      const payload = { event: 'order.created' };
      service.verifySignature(payload, 'secret', 'sig');
      expect(mockSignatureService.verifySignature).toHaveBeenCalledWith(payload, 'secret', 'sig');
    });
  });
});
