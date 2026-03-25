import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { QrCodeSecurityService } from './qr-code-security.service';
import { QRCodeStyle } from '../tables/entities/table-qr-code.entity';

export interface QRCodeData {
  type: 'table' | 'menu' | 'payment' | 'restaurant';
  restaurantId: string;
  tableId?: string;
  orderId?: string;
  metadata?: Record<string, any>;
}

export interface QRGenerationOptions {
  width?: number;
  margin?: number;
  style?: QRCodeStyle;
  colorPrimary?: string;
  colorSecondary?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

@Injectable()
export class QrCodeService {
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    private securityService: QrCodeSecurityService,
  ) {
    this.baseUrl = this.configService.get<string>('APP_URL') || 'https://okinawa.app';
  }

  /**
   * Generate secure QR code for table with HMAC signature
   */
  async generateSecureTableQR(
    restaurantId: string,
    tableId: string,
    version: number = 1,
    options: QRGenerationOptions = {},
  ): Promise<{ qrCodeImage: string; qrCodeData: string; signature: string }> {
    const signature = this.securityService.generateSignature(restaurantId, tableId, version);
    const qrCodeData = this.securityService.generateTableQRUrl(restaurantId, tableId, version);
    
    const qrCodeImage = await this.generateStyledQRCode(qrCodeData, options);

    return {
      qrCodeImage,
      qrCodeData,
      signature,
    };
  }

  /**
   * Generate QR code for table (legacy method)
   */
  async generateTableQR(restaurantId: string, tableId: string): Promise<string> {
    const data: QRCodeData = {
      type: 'table',
      restaurantId,
      tableId,
    };

    const url = `${this.baseUrl}/client/qr-scanner?data=${encodeURIComponent(JSON.stringify(data))}`;

    return this.generateQRCode(url);
  }

  /**
   * Generate QR code for restaurant menu
   */
  async generateMenuQR(restaurantId: string): Promise<string> {
    const data: QRCodeData = {
      type: 'menu',
      restaurantId,
    };

    const url = `${this.baseUrl}/client/restaurant/${restaurantId}`;

    return this.generateQRCode(url);
  }

  /**
   * Generate QR code for payment
   */
  async generatePaymentQR(restaurantId: string, orderId: string, amount: number): Promise<string> {
    const data: QRCodeData = {
      type: 'payment',
      restaurantId,
      orderId,
      metadata: { amount },
    };

    const url = `${this.baseUrl}/client/payment?data=${encodeURIComponent(JSON.stringify(data))}`;

    return this.generateQRCode(url);
  }

  /**
   * Generate styled QR code with custom colors
   */
  async generateStyledQRCode(
    url: string,
    options: QRGenerationOptions = {},
  ): Promise<string> {
    const {
      width = 300,
      margin = 2,
      colorPrimary = '#000000',
      colorSecondary = '#FFFFFF',
      errorCorrectionLevel = 'H',
    } = options;

    try {
      const qrCode = await QRCode.toDataURL(url, {
        errorCorrectionLevel,
        type: 'image/png',
        width,
        margin,
        color: {
          dark: colorPrimary,
          light: colorSecondary,
        },
      });

      return qrCode;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate styled QR code: ${message}`);
    }
  }

  /**
   * Generate generic QR code from URL
   */
  async generateQRCode(url: string): Promise<string> {
    try {
      // Generate QR code as data URL (base64)
      const qrCode = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrCode;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate QR code: ${message}`);
    }
  }

  /**
   * Batch generate QR codes for multiple tables
   */
  async batchGenerateTableQR(
    restaurantId: string,
    tables: Array<{ tableId: string; tableNumber: string }>,
    options: QRGenerationOptions = {},
  ): Promise<Array<{
    tableId: string;
    tableNumber: string;
    qrCodeImage: string;
    qrCodeData: string;
    signature: string;
    version: number;
  }>> {
    const results = await Promise.all(
      tables.map(async (table) => {
        const version = 1;
        const { qrCodeImage, qrCodeData, signature } = await this.generateSecureTableQR(
          restaurantId,
          table.tableId,
          version,
          options,
        );

        return {
          tableId: table.tableId,
          tableNumber: table.tableNumber,
          qrCodeImage,
          qrCodeData,
          signature,
          version,
        };
      }),
    );

    return results;
  }

  /**
   * Parse QR code data
   */
  parseQRData(dataString: string): QRCodeData {
    try {
      return JSON.parse(decodeURIComponent(dataString));
    } catch (error) {
      throw new Error('Invalid QR code data');
    }
  }

  /**
   * Validate QR code data
   */
  validateQRData(data: QRCodeData): boolean {
    if (!data.type || !data.restaurantId) {
      return false;
    }

    if (data.type === 'table' && !data.tableId) {
      return false;
    }

    if (data.type === 'payment' && !data.orderId) {
      return false;
    }

    return true;
  }

  /**
   * Validate secure QR code URL
   */
  validateSecureQRCode(url: string): {
    valid: boolean;
    restaurantId?: string;
    tableId?: string;
    version?: number;
    error?: string;
  } {
    return this.securityService.validateQRUrl(url);
  }
}
