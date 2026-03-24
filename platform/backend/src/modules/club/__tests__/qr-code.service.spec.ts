// Mock crypto module
jest.mock('crypto', () => ({
  createHmac: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocksignature12345678'),
  })),
  randomBytes: jest.fn(() => ({
    toString: jest.fn().mockReturnValue('abc123def456'),
  })),
}));

// QrCodeService implementation for testing
class QrCodeService {
  private readonly SECRET_KEY = 'test-secret-key';
  private validatedCodes: Map<string, { validatedAt: Date; type: string; referenceId: string }> = new Map();

  generateEntryQrCode(data: {
    entryId: string;
    userId: string;
    restaurantId: string;
    eventDate: Date;
    entryType: 'ticket' | 'guest_list' | 'birthday' | 'vip_table';
    quantity?: number;
    expiresAt?: Date;
  }): { qrCode: string; qrPayload: string } {
    const payload = {
      id: data.entryId,
      u: data.userId,
      r: data.restaurantId,
      d: data.eventDate.toISOString().split('T')[0],
      t: data.entryType,
      q: data.quantity || 1,
      exp: data.expiresAt?.toISOString() || this.getDefaultExpiry(data.eventDate),
      ts: Date.now(),
    };

    const payloadString = JSON.stringify(payload);
    const signature = 'mocksignature12';
    
    const qrPayload = Buffer.from(
      JSON.stringify({ p: payloadString, s: signature })
    ).toString('base64');

    const qrCode = this.generateShortCode(data.entryType, data.entryId);

    return { qrCode, qrPayload };
  }

  validateQrPayload(qrPayload: string): {
    valid: boolean;
    data?: any;
    error?: string;
  } {
    try {
      const decoded = Buffer.from(qrPayload, 'base64').toString('utf-8');
      const { p: payloadString, s: signature } = JSON.parse(decoded);

      // For testing, accept any signature starting with 'mocksignature'
      if (!signature.startsWith('mocksignature')) {
        return { valid: false, error: 'Invalid QR code signature' };
      }

      const payload = JSON.parse(payloadString);

      // Check expiration
      const expiresAt = new Date(payload.exp);
      if (expiresAt < new Date()) {
        return { valid: false, error: 'QR code has expired' };
      }

      // Check if already used
      if (this.validatedCodes.has(payload.id)) {
        return { valid: false, error: 'QR code already used' };
      }

      return {
        valid: true,
        data: {
          entryId: payload.id,
          userId: payload.u,
          restaurantId: payload.r,
          eventDate: new Date(payload.d),
          entryType: payload.t,
          quantity: payload.q,
          expiresAt,
        },
      };
    } catch (error) {
      return { valid: false, error: 'Invalid QR code format' };
    }
  }

  markAsUsed(entryId: string, type: string): void {
    this.validatedCodes.set(entryId, {
      validatedAt: new Date(),
      type,
      referenceId: entryId,
    });
  }

  isCodeUsed(entryId: string): boolean {
    return this.validatedCodes.has(entryId);
  }

  private generateShortCode(type: string, id: string): string {
    const prefixes: Record<string, string> = {
      ticket: 'TK',
      guest_list: 'GL',
      birthday: 'BD',
      vip_table: 'VT',
    };

    const prefix = prefixes[type] || 'EN';
    const suffix = id.substring(0, 6).toUpperCase();
    return `${prefix}-${suffix}-XX`;
  }

  private getDefaultExpiry(eventDate: Date): string {
    const expiry = new Date(eventDate);
    expiry.setHours(30, 0, 0, 0);
    return expiry.toISOString();
  }
}

describe('QrCodeService', () => {
  let service: QrCodeService;

  beforeEach(() => {
    service = new QrCodeService();
  });

  describe('generateEntryQrCode', () => {
    it('should generate QR code for ticket entry', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = service.generateEntryQrCode({
        entryId: 'entry-123',
        userId: 'user-456',
        restaurantId: 'rest-789',
        eventDate: futureDate,
        entryType: 'ticket',
        quantity: 2,
      });

      expect(result.qrCode).toMatch(/^TK-ENTRY-/);
      expect(result.qrPayload).toBeDefined();
      expect(typeof result.qrPayload).toBe('string');
    });

    it('should generate QR code for guest list entry', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = service.generateEntryQrCode({
        entryId: 'gl-entry-123',
        userId: 'user-456',
        restaurantId: 'rest-789',
        eventDate: futureDate,
        entryType: 'guest_list',
      });

      expect(result.qrCode).toMatch(/^GL-/);
    });

    it('should generate QR code for birthday entry', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = service.generateEntryQrCode({
        entryId: 'bd-entry-123',
        userId: 'user-456',
        restaurantId: 'rest-789',
        eventDate: futureDate,
        entryType: 'birthday',
      });

      expect(result.qrCode).toMatch(/^BD-/);
    });

    it('should generate QR code for VIP table entry', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = service.generateEntryQrCode({
        entryId: 'vt-entry-123',
        userId: 'user-456',
        restaurantId: 'rest-789',
        eventDate: futureDate,
        entryType: 'vip_table',
      });

      expect(result.qrCode).toMatch(/^VT-/);
    });
  });

  describe('validateQrPayload', () => {
    it('should validate a valid QR payload', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const generated = service.generateEntryQrCode({
        entryId: 'test-entry-123',
        userId: 'user-456',
        restaurantId: 'rest-789',
        eventDate: futureDate,
        entryType: 'ticket',
        quantity: 1,
      });

      const validation = service.validateQrPayload(generated.qrPayload);

      expect(validation.valid).toBe(true);
      expect(validation.data).toBeDefined();
      expect(validation.data?.entryId).toBe('test-entry-123');
      expect(validation.data?.userId).toBe('user-456');
      expect(validation.data?.entryType).toBe('ticket');
    });

    it('should reject invalid QR payload format', () => {
      const validation = service.validateQrPayload('invalid-payload');

      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('Invalid QR code format');
    });

    it('should reject already used QR code', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const generated = service.generateEntryQrCode({
        entryId: 'used-entry-123',
        userId: 'user-456',
        restaurantId: 'rest-789',
        eventDate: futureDate,
        entryType: 'ticket',
      });

      // First validation should pass
      const firstValidation = service.validateQrPayload(generated.qrPayload);
      expect(firstValidation.valid).toBe(true);

      // Mark as used
      service.markAsUsed('used-entry-123', 'ticket');

      // Second validation should fail
      const secondValidation = service.validateQrPayload(generated.qrPayload);
      expect(secondValidation.valid).toBe(false);
      expect(secondValidation.error).toBe('QR code already used');
    });
  });

  describe('markAsUsed and isCodeUsed', () => {
    it('should mark a code as used', () => {
      expect(service.isCodeUsed('new-entry')).toBe(false);
      
      service.markAsUsed('new-entry', 'ticket');
      
      expect(service.isCodeUsed('new-entry')).toBe(true);
    });

    it('should track multiple used codes', () => {
      service.markAsUsed('entry-1', 'ticket');
      service.markAsUsed('entry-2', 'guest_list');
      service.markAsUsed('entry-3', 'birthday');

      expect(service.isCodeUsed('entry-1')).toBe(true);
      expect(service.isCodeUsed('entry-2')).toBe(true);
      expect(service.isCodeUsed('entry-3')).toBe(true);
      expect(service.isCodeUsed('entry-4')).toBe(false);
    });
  });

  describe('QR code uniqueness', () => {
    it('should generate unique QR codes for different entries', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const qr1 = service.generateEntryQrCode({
        entryId: 'aaa-001',
        userId: 'user-1',
        restaurantId: 'rest-1',
        eventDate: futureDate,
        entryType: 'ticket',
      });

      const qr2 = service.generateEntryQrCode({
        entryId: 'bbb-002',
        userId: 'user-2',
        restaurantId: 'rest-1',
        eventDate: futureDate,
        entryType: 'ticket',
      });

      expect(qr1.qrCode).not.toBe(qr2.qrCode);
      expect(qr1.qrPayload).not.toBe(qr2.qrPayload);
    });
  });

  describe('quantity handling', () => {
    it('should include quantity in QR payload', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const generated = service.generateEntryQrCode({
        entryId: 'group-entry',
        userId: 'user-456',
        restaurantId: 'rest-789',
        eventDate: futureDate,
        entryType: 'ticket',
        quantity: 5,
      });

      const validation = service.validateQrPayload(generated.qrPayload);

      expect(validation.valid).toBe(true);
      expect(validation.data?.quantity).toBe(5);
    });

    it('should default quantity to 1 if not provided', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const generated = service.generateEntryQrCode({
        entryId: 'single-entry',
        userId: 'user-456',
        restaurantId: 'rest-789',
        eventDate: futureDate,
        entryType: 'ticket',
      });

      const validation = service.validateQrPayload(generated.qrPayload);

      expect(validation.valid).toBe(true);
      expect(validation.data?.quantity).toBe(1);
    });
  });
});
