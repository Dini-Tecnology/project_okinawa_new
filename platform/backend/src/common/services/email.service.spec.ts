import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { CircuitBreakerService } from '@common/utils/circuit-breaker.module';
import * as sgMail from '@sendgrid/mail';

jest.mock('@sendgrid/mail');

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let circuitBreakerService: CircuitBreakerService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockCircuitBreakerService = {
    getBreaker: jest.fn().mockReturnValue({
      execute: jest.fn().mockImplementation(async (fn: any, fallback?: any) => {
        try {
          return await fn();
        } catch {
          if (fallback) return fallback();
          return false;
        }
      }),
      isOpen: jest.fn().mockReturnValue(false),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CircuitBreakerService, useValue: mockCircuitBreakerService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
    circuitBreakerService = module.get<CircuitBreakerService>(CircuitBreakerService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send email when service is enabled', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SENDGRID_API_KEY') return 'valid-api-key';
        if (key === 'SENDGRID_FROM_EMAIL') return 'test@okinawa.com';
        if (key === 'SENDGRID_FROM_NAME') return 'Test Okinawa';
        return null;
      });

      const newService = new EmailService(configService, circuitBreakerService);
      (sgMail.send as jest.Mock).mockResolvedValue([{}, {}]);

      const result = await newService.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      });

      expect(result).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'recipient@example.com',
          subject: 'Test Subject',
          html: '<p>Test</p>',
        }),
      );
    });

    it('should return false when service is disabled', async () => {
      mockConfigService.get.mockReturnValue(null);
      const newService = new EmailService(configService, circuitBreakerService);

      const result = await newService.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result).toBe(false);
      expect(sgMail.send).not.toHaveBeenCalled();
    });

    it('should return false when sending fails', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SENDGRID_API_KEY') return 'valid-api-key';
        return null;
      });

      const newService = new EmailService(configService, circuitBreakerService);
      (sgMail.send as jest.Mock).mockRejectedValue(new Error('Send failed'));

      const result = await newService.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result).toBe(false);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with user name', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SENDGRID_API_KEY') return 'valid-api-key';
        if (key === 'FRONTEND_URL') return 'https://okinawa.com';
        return null;
      });

      const newService = new EmailService(configService, circuitBreakerService);
      (sgMail.send as jest.Mock).mockResolvedValue([{}, {}]);

      const result = await newService.sendPasswordResetEmail(
        'test@example.com',
        'reset-token-123',
        'John Doe',
      );

      expect(result).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Redefinir Senha - Project Okinawa',
        }),
      );
    });

    it('should send password reset email without user name', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SENDGRID_API_KEY') return 'valid-api-key';
        if (key === 'FRONTEND_URL') return 'https://okinawa.com';
        return null;
      });

      const newService = new EmailService(configService, circuitBreakerService);
      (sgMail.send as jest.Mock).mockResolvedValue([{}, {}]);

      const result = await newService.sendPasswordResetEmail(
        'test@example.com',
        'reset-token-123',
      );

      expect(result).toBe(true);
    });
  });

  describe('sendPasswordChangedEmail', () => {
    it('should send password changed confirmation email', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SENDGRID_API_KEY') return 'valid-api-key';
        if (key === 'FRONTEND_URL') return 'https://okinawa.com';
        return null;
      });

      const newService = new EmailService(configService, circuitBreakerService);
      (sgMail.send as jest.Mock).mockResolvedValue([{}, {}]);

      const result = await newService.sendPasswordChangedEmail(
        'test@example.com',
        'John Doe',
      );

      expect(result).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Senha Alterada - Project Okinawa',
        }),
      );
    });
  });
});
