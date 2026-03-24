import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSignatureService {
  /**
   * Generate a random secret for webhook signature verification.
   */
  generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate HMAC-SHA256 signature for a webhook payload.
   */
  generateSignature(payload: any, secret: string): string {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }

  /**
   * Verify that a received signature matches the expected HMAC for the payload.
   */
  verifySignature(payload: any, secret: string, receivedSignature: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex'),
    );
  }
}
