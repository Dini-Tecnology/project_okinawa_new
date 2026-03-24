import { Test, TestingModule } from '@nestjs/testing';
import { WebhookSignatureService } from './webhook-signature.service';

describe('WebhookSignatureService', () => {
  let service: WebhookSignatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookSignatureService],
    }).compile();

    service = module.get<WebhookSignatureService>(WebhookSignatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSecret', () => {
    it('should generate a 64-character hex string', () => {
      const secret = service.generateSecret();
      expect(secret).toHaveLength(64);
      expect(secret).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate unique secrets on each call', () => {
      const secret1 = service.generateSecret();
      const secret2 = service.generateSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('generateSignature', () => {
    it('should generate a hex HMAC-SHA256 signature', () => {
      const payload = { event: 'order.created', data: { id: '123' } };
      const secret = 'test-secret';

      const signature = service.generateSignature(payload, secret);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate the same signature for the same payload and secret', () => {
      const payload = { event: 'order.created', data: { id: '123' } };
      const secret = 'test-secret';

      const sig1 = service.generateSignature(payload, secret);
      const sig2 = service.generateSignature(payload, secret);

      expect(sig1).toBe(sig2);
    });

    it('should generate different signatures for different secrets', () => {
      const payload = { event: 'order.created', data: { id: '123' } };

      const sig1 = service.generateSignature(payload, 'secret-1');
      const sig2 = service.generateSignature(payload, 'secret-2');

      expect(sig1).not.toBe(sig2);
    });

    it('should generate different signatures for different payloads', () => {
      const secret = 'test-secret';

      const sig1 = service.generateSignature({ event: 'order.created' }, secret);
      const sig2 = service.generateSignature({ event: 'order.updated' }, secret);

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('verifySignature', () => {
    it('should return true for a valid signature', () => {
      const payload = { event: 'order.created', data: { id: '123' } };
      const secret = 'test-secret';
      const signature = service.generateSignature(payload, secret);

      const isValid = service.verifySignature(payload, secret, signature);

      expect(isValid).toBe(true);
    });

    it('should return false for an invalid signature', () => {
      const payload = { event: 'order.created', data: { id: '123' } };
      const secret = 'test-secret';
      const invalidSignature = 'a'.repeat(64);

      expect(() =>
        service.verifySignature(payload, secret, invalidSignature),
      ).not.toThrow();
    });

    it('should reject a signature generated with a different secret', () => {
      const payload = { event: 'order.created', data: { id: '123' } };
      const signature = service.generateSignature(payload, 'wrong-secret');

      const isValid = service.verifySignature(payload, 'correct-secret', signature);

      expect(isValid).toBe(false);
    });
  });
});
