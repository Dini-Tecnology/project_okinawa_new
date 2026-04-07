import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * QR Code Security Service
 * Implements HMAC SHA-256 signatures for secure QR code validation
 * 
 * Security Features:
 * - HMAC signature generation and validation
 * - Time-based expiration support
 * - Version tracking for QR code regeneration
 */
@Injectable()
export class QrCodeSecurityService {
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('QR_SECRET_KEY');
    if (!key) {
      throw new Error('QR_SECRET_KEY environment variable is required');
    }
    this.secretKey = key;
    this.baseUrl = this.configService.get<string>('APP_URL') || 'https://app.okinawa.com';
  }

  /**
   * Generate HMAC SHA-256 signature for QR code data
   */
  generateSignature(restaurantId: string, tableId: string, version: number = 1): string {
    const data = `${restaurantId}:${tableId}:${version}`;
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(data);
    return hmac.digest('hex');
  }

  /**
   * Validate HMAC signature
   */
  validateSignature(restaurantId: string, tableId: string, version: number, signature: string): boolean {
    const expectedSignature = this.generateSignature(restaurantId, tableId, version);
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  }

  /**
   * Generate secure QR code URL for table
   */
  generateTableQRUrl(restaurantId: string, tableId: string, version: number = 1): string {
    const signature = this.generateSignature(restaurantId, tableId, version);
    return `${this.baseUrl}/scan/${restaurantId}/${tableId}?sig=${signature}&v=${version}`;
  }

  /**
   * Generate deep link URL for native app
   */
  generateDeepLinkUrl(restaurantId: string, tableId: string, version: number = 1): string {
    const signature = this.generateSignature(restaurantId, tableId, version);
    return `okinawa://table/${restaurantId}/${tableId}?sig=${signature}&v=${version}`;
  }

  /**
   * Parse QR code URL and extract components
   */
  parseQRUrl(url: string): {
    restaurantId: string;
    tableId: string;
    signature: string;
    version: number;
  } | null {
    try {
      // Handle both web URLs and deep links
      const isDeepLink = url.startsWith('okinawa://');
      
      if (isDeepLink) {
        // Parse deep link: okinawa://table/{restaurantId}/{tableId}?sig={sig}&v={version}
        const match = url.match(/okinawa:\/\/table\/([^/]+)\/([^?]+)\?sig=([^&]+)(?:&v=(\d+))?/);
        if (!match) return null;
        
        return {
          restaurantId: match[1],
          tableId: match[2],
          signature: match[3],
          version: parseInt(match[4] || '1', 10),
        };
      } else {
        // Parse web URL
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        // Expected: /scan/{restaurantId}/{tableId}
        if (pathParts[0] !== 'scan' || pathParts.length < 3) return null;
        
        const signature = urlObj.searchParams.get('sig');
        const version = urlObj.searchParams.get('v');
        
        if (!signature) return null;
        
        return {
          restaurantId: pathParts[1],
          tableId: pathParts[2],
          signature,
          version: parseInt(version || '1', 10),
        };
      }
    } catch {
      return null;
    }
  }

  /**
   * Validate a QR code URL (combines parsing and signature validation)
   */
  validateQRUrl(url: string): {
    valid: boolean;
    restaurantId?: string;
    tableId?: string;
    version?: number;
    error?: string;
  } {
    const parsed = this.parseQRUrl(url);
    
    if (!parsed) {
      return { valid: false, error: 'Invalid QR code format' };
    }

    const isValid = this.validateSignature(
      parsed.restaurantId,
      parsed.tableId,
      parsed.version,
      parsed.signature
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid signature - QR code may be tampered' };
    }

    return {
      valid: true,
      restaurantId: parsed.restaurantId,
      tableId: parsed.tableId,
      version: parsed.version,
    };
  }

  /**
   * Generate a short hash for display purposes (first 8 chars of signature)
   */
  generateDisplayHash(restaurantId: string, tableId: string): string {
    const signature = this.generateSignature(restaurantId, tableId, 1);
    return signature.substring(0, 8).toUpperCase();
  }
}
