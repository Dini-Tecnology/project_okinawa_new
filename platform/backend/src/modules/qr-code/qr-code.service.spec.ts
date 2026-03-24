import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QrCodeService } from './qr-code.service';
import { QrCodeSecurityService } from './qr-code-security.service';

describe('QrCodeService', () => {
  let service: QrCodeService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    const mockSecurityService = {
      generateSignature: jest.fn().mockReturnValue('mock-signature'),
      validateSignature: jest.fn().mockReturnValue(true),
      generateTableQRUrl: jest.fn().mockReturnValue('https://app.okinawa.com/scan/r1/t1?sig=abc&v=1'),
      generateDeepLinkUrl: jest.fn(),
      parseQRUrl: jest.fn(),
      validateQRUrl: jest.fn(),
      generateDisplayHash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrCodeService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: QrCodeSecurityService, useValue: mockSecurityService },
      ],
    }).compile();

    service = module.get<QrCodeService>(QrCodeService);
  });

  describe('generateTableQR', () => {
    it('should generate QR code for table', async () => {
      const result = await service.generateTableQR('restaurant-1', 'table-1');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('data:image/png;base64,');
    });
  });

  describe('generateMenuQR', () => {
    it('should generate QR code for menu', async () => {
      const result = await service.generateMenuQR('restaurant-1');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('data:image/png;base64,');
    });
  });

  describe('generatePaymentQR', () => {
    it('should generate QR code for payment', async () => {
      const result = await service.generatePaymentQR('restaurant-1', 'order-1', 100);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('data:image/png;base64,');
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code from URL', async () => {
      const result = await service.generateQRCode('https://example.com');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('data:image/png;base64,');
    });
  });
});
