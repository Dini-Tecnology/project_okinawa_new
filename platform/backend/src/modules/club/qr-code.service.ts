import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * QrCodeService handles generation and validation of QR codes for various purposes:
 * - Club entries (tickets)
 * - VIP table reservations
 * - Birthday entries
 * - Guest list entries
 * - Check-in/check-out tracking
 */
@Injectable()
export class QrCodeService {
  private readonly SECRET_KEY: string;

  // In-memory storage for QR validation (replace with Redis in production)
  private validatedCodes: Map<string, { validatedAt: Date; type: string; referenceId: string }> = new Map();

  constructor() {
    const key = process.env.QR_SECRET_KEY;
    if (!key) {
      throw new Error('QR_SECRET_KEY environment variable is required');
    }
    this.SECRET_KEY = key;
  }

  /**
   * Generate a unique QR code for an entry
   */
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
    const signature = this.generateSignature(payloadString);
    
    // Base64 encode the payload with signature
    const qrPayload = Buffer.from(
      JSON.stringify({ p: payloadString, s: signature })
    ).toString('base64');

    // Generate a shorter human-readable code
    const qrCode = this.generateShortCode(data.entryType, data.entryId);

    return { qrCode, qrPayload };
  }

  /**
   * Validate a QR code payload
   */
  validateQrPayload(qrPayload: string): {
    valid: boolean;
    data?: {
      entryId: string;
      userId: string;
      restaurantId: string;
      eventDate: Date;
      entryType: string;
      quantity: number;
      expiresAt: Date;
    };
    error?: string;
  } {
    try {
      const decoded = Buffer.from(qrPayload, 'base64').toString('utf-8');
      const { p: payloadString, s: signature } = JSON.parse(decoded);

      // Verify signature
      const expectedSignature = this.generateSignature(payloadString);
      if (signature !== expectedSignature) {
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

  /**
   * Mark a QR code as used
   */
  markAsUsed(entryId: string, type: string): void {
    this.validatedCodes.set(entryId, {
      validatedAt: new Date(),
      type,
      referenceId: entryId,
    });
  }

  /**
   * Check if a code has been used
   */
  isCodeUsed(entryId: string): boolean {
    return this.validatedCodes.has(entryId);
  }

  /**
   * Generate QR code for check-in tracking
   */
  generateCheckInQrCode(data: {
    sessionId: string;
    userId: string;
    restaurantId: string;
    tableId?: string;
    checkInTime: Date;
  }): { qrCode: string; qrPayload: string } {
    const payload = {
      sid: data.sessionId,
      u: data.userId,
      r: data.restaurantId,
      t: data.tableId,
      ci: data.checkInTime.toISOString(),
      type: 'check_in',
    };

    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString);
    
    const qrPayload = Buffer.from(
      JSON.stringify({ p: payloadString, s: signature })
    ).toString('base64');

    const qrCode = `CI-${data.sessionId.substring(0, 8).toUpperCase()}`;

    return { qrCode, qrPayload };
  }

  /**
   * Generate QR code for wristband (clubs)
   */
  generateWristbandQrCode(data: {
    entryId: string;
    userId: string;
    restaurantId: string;
    eventDate: Date;
    wristbandColor: string;
    vipLevel?: number;
    consumptionCredit?: number;
  }): { qrCode: string; qrPayload: string } {
    const payload = {
      id: data.entryId,
      u: data.userId,
      r: data.restaurantId,
      d: data.eventDate.toISOString().split('T')[0],
      type: 'wristband',
      color: data.wristbandColor,
      vip: data.vipLevel || 0,
      credit: data.consumptionCredit || 0,
      ts: Date.now(),
    };

    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString);
    
    const qrPayload = Buffer.from(
      JSON.stringify({ p: payloadString, s: signature })
    ).toString('base64');

    const qrCode = `WB-${data.wristbandColor.toUpperCase()}-${data.entryId.substring(0, 6).toUpperCase()}`;

    return { qrCode, qrPayload };
  }

  /**
   * Validate wristband for purchases
   */
  validateWristbandForPurchase(
    qrPayload: string,
    amount: number
  ): {
    valid: boolean;
    remainingCredit?: number;
    error?: string;
  } {
    const validation = this.validateQrPayload(qrPayload);
    
    if (!validation.valid) {
      return { valid: false, error: validation.error };
    }

    // In production, check database for actual credit
    // This is a simplified example
    return {
      valid: true,
      remainingCredit: 100 - amount, // Placeholder
    };
  }

  /**
   * Generate promoter tracking QR code
   */
  generatePromoterQrCode(data: {
    promoterId: string;
    promoterCode: string;
    restaurantId: string;
    eventDate?: Date;
  }): { qrCode: string; qrPayload: string; linkUrl: string } {
    const payload = {
      pid: data.promoterId,
      code: data.promoterCode,
      r: data.restaurantId,
      d: data.eventDate?.toISOString().split('T')[0],
      type: 'promoter',
      ts: Date.now(),
    };

    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString);
    
    const qrPayload = Buffer.from(
      JSON.stringify({ p: payloadString, s: signature })
    ).toString('base64');

    const qrCode = data.promoterCode;
    const linkUrl = `https://app.okinawa.com.br/p/${data.promoterCode}`;

    return { qrCode, qrPayload, linkUrl };
  }

  /**
   * Generate batch QR codes for bulk ticket sales
   */
  generateBatchQrCodes(
    baseData: {
      restaurantId: string;
      eventDate: Date;
      entryType: 'ticket' | 'guest_list';
      expiresAt?: Date;
    },
    count: number
  ): Array<{ entryId: string; qrCode: string; qrPayload: string }> {
    const codes: Array<{ entryId: string; qrCode: string; qrPayload: string }> = [];

    for (let i = 0; i < count; i++) {
      const entryId = this.generateId();
      const { qrCode, qrPayload } = this.generateEntryQrCode({
        entryId,
        userId: 'bulk',
        restaurantId: baseData.restaurantId,
        eventDate: baseData.eventDate,
        entryType: baseData.entryType,
        quantity: 1,
        expiresAt: baseData.expiresAt,
      });

      codes.push({ entryId, qrCode, qrPayload });
    }

    return codes;
  }

  /**
   * Generate signature for payload
   */
  private generateSignature(payload: string): string {
    return crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(payload)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Generate a short human-readable code
   */
  private generateShortCode(type: string, id: string): string {
    const prefixes: Record<string, string> = {
      ticket: 'TK',
      guest_list: 'GL',
      birthday: 'BD',
      vip_table: 'VT',
    };

    const prefix = prefixes[type] || 'EN';
    const suffix = id.substring(0, 6).toUpperCase();
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();

    return `${prefix}-${suffix}-${random}`;
  }

  /**
   * Get default expiry (end of event day + 6 hours)
   */
  private getDefaultExpiry(eventDate: Date): string {
    const expiry = new Date(eventDate);
    expiry.setHours(30, 0, 0, 0); // Next day 6 AM
    return expiry.toISOString();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return crypto.randomBytes(12).toString('hex');
  }

  /**
   * Stats for validated codes (for monitoring)
   */
  getValidationStats(): {
    totalValidated: number;
    byType: Record<string, number>;
    recentValidations: Array<{ code: string; validatedAt: Date; type: string }>;
  } {
    const stats = {
      totalValidated: this.validatedCodes.size,
      byType: {} as Record<string, number>,
      recentValidations: [] as Array<{ code: string; validatedAt: Date; type: string }>,
    };

    this.validatedCodes.forEach((value, key) => {
      stats.byType[value.type] = (stats.byType[value.type] || 0) + 1;
      stats.recentValidations.push({
        code: key,
        validatedAt: value.validatedAt,
        type: value.type,
      });
    });

    // Sort by most recent and limit to 20
    stats.recentValidations = stats.recentValidations
      .sort((a, b) => b.validatedAt.getTime() - a.validatedAt.getTime())
      .slice(0, 20);

    return stats;
  }
}
