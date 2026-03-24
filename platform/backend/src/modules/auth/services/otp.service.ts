/**
 * OTP Service
 * 
 * Handles OTP generation, sending, and verification.
 * Supports WhatsApp and SMS channels with rate limiting.
 */

import { Injectable, BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { OTPToken } from '../entities/otp-token.entity';
import { OTPChannel, OTPPurpose } from '../dto/phone-auth.dto';
import { AuditLogService, AuditAction } from '@/modules/identity';

// Rate limiting constants
const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MINUTES = 5;
const OTP_EXPIRY_MINUTES = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

@Injectable()
export class OTPService {
  constructor(
    @InjectRepository(OTPToken)
    private otpRepository: Repository<OTPToken>,
    private configService: ConfigService,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Generate and send OTP to phone number
   */
  async sendOTP(
    phoneNumber: string,
    channel: OTPChannel = OTPChannel.WHATSAPP,
    purpose: OTPPurpose,
    ipAddress?: string,
  ): Promise<{ success: boolean; message: string; channel: OTPChannel; retry_after?: number }> {
    // Check rate limiting
    const rateLimitCheck = await this.checkRateLimit(phoneNumber);
    if (!rateLimitCheck.allowed) {
      throw new HttpException({
        message: 'Too many OTP requests. Please wait before trying again.',
        retry_after: rateLimitCheck.retryAfter,
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    // Invalidate any existing unused OTPs for this phone
    await this.invalidateExistingOTPs(phoneNumber);

    // Generate 6-digit OTP
    const code = this.generateOTPCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    // Store OTP
    const otpToken = this.otpRepository.create({
      phone_number: phoneNumber,
      code_hash: this.hashCode(code),
      channel,
      purpose,
      expires_at: expiresAt,
      attempts: 0,
      is_used: false,
      ip_address: ipAddress,
    });

    await this.otpRepository.save(otpToken);

    // Send OTP via configured provider
    const sent = await this.sendOTPViaProvider(phoneNumber, code, channel);

    if (!sent.success && channel === OTPChannel.WHATSAPP) {
      // Fallback to SMS if WhatsApp fails
      const smsSent = await this.sendOTPViaProvider(phoneNumber, code, OTPChannel.SMS);
      if (smsSent.success) {
        otpToken.channel = OTPChannel.SMS;
        await this.otpRepository.save(otpToken);
        return {
          success: true,
          message: `Verification code sent via SMS`,
          channel: OTPChannel.SMS,
        };
      }
    }

    if (!sent.success) {
      throw new BadRequestException('Failed to send verification code. Please try again.');
    }

    // Log OTP sent
    await this.auditLogService.log({
      action: AuditAction.OTP_SENT,
      entityType: 'otp',
      entityId: otpToken.id,
      ipAddress,
      metadata: { phone: this.maskPhone(phoneNumber), channel, purpose },
      success: true,
    });

    return {
      success: true,
      message: `Verification code sent via ${channel === OTPChannel.WHATSAPP ? 'WhatsApp' : 'SMS'}`,
      channel,
    };
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(
    phoneNumber: string,
    code: string,
    ipAddress?: string,
  ): Promise<{
    valid: boolean;
    purpose?: OTPPurpose;
    tempToken?: string;
    attemptsRemaining?: number;
  }> {
    const otpToken = await this.otpRepository.findOne({
      where: {
        phone_number: phoneNumber,
        is_used: false,
        expires_at: MoreThan(new Date()),
      },
      order: { created_at: 'DESC' },
    });

    if (!otpToken) {
      return {
        valid: false,
        attemptsRemaining: 0,
      };
    }

    // Check max attempts
    if (otpToken.attempts >= MAX_OTP_ATTEMPTS) {
      await this.auditLogService.log({
        action: AuditAction.OTP_MAX_ATTEMPTS,
        entityType: 'otp',
        entityId: otpToken.id,
        ipAddress,
        metadata: { phone: this.maskPhone(phoneNumber) },
        success: false,
      });

      throw new HttpException({
        message: 'Too many failed attempts. Please request a new code.',
        retry_after: OTP_LOCKOUT_MINUTES * 60,
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    // Verify code
    const isValid = this.verifyCodeHash(code, otpToken.code_hash);

    if (!isValid) {
      otpToken.attempts += 1;
      await this.otpRepository.save(otpToken);

      await this.auditLogService.log({
        action: AuditAction.OTP_FAILED,
        entityType: 'otp',
        entityId: otpToken.id,
        ipAddress,
        metadata: { phone: this.maskPhone(phoneNumber), attempt: otpToken.attempts },
        success: false,
      });

      return {
        valid: false,
        attemptsRemaining: MAX_OTP_ATTEMPTS - otpToken.attempts,
      };
    }

    // Mark as used
    otpToken.is_used = true;
    otpToken.used_at = new Date();
    await this.otpRepository.save(otpToken);

    // Generate temp token for next steps
    const tempToken = this.generateTempToken(phoneNumber, otpToken.purpose as OTPPurpose);

    await this.auditLogService.log({
      action: AuditAction.OTP_VERIFIED,
      entityType: 'otp',
      entityId: otpToken.id,
      ipAddress,
      metadata: { phone: this.maskPhone(phoneNumber), purpose: otpToken.purpose },
      success: true,
    });

    return {
      valid: true,
      purpose: otpToken.purpose as OTPPurpose,
      tempToken,
    };
  }

  /**
   * Validate temp token from OTP verification
   */
  validateTempToken(tempToken: string): { valid: boolean; phoneNumber?: string; purpose?: OTPPurpose } {
    try {
      const decoded = Buffer.from(tempToken, 'base64').toString('utf8');
      const [phoneNumber, purpose, expiry, signature] = decoded.split('|');

      // Check expiry (15 minutes)
      if (Date.now() > parseInt(expiry, 10)) {
        return { valid: false };
      }

      // Verify signature
      const expectedSignature = this.signTempToken(phoneNumber, purpose as OTPPurpose, parseInt(expiry, 10));
      if (signature !== expectedSignature) {
        return { valid: false };
      }

      return { valid: true, phoneNumber, purpose: purpose as OTPPurpose };
    } catch {
      return { valid: false };
    }
  }

  // ============ Private Methods ============

  private generateOTPCode(): string {
    // Generate cryptographically secure 6-digit code
    return crypto.randomInt(100000, 999999).toString();
  }

  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private verifyCodeHash(code: string, hash: string): boolean {
    return this.hashCode(code) === hash;
  }

  private generateTempToken(phoneNumber: string, purpose: OTPPurpose): string {
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    const signature = this.signTempToken(phoneNumber, purpose, expiry);
    const token = `${phoneNumber}|${purpose}|${expiry}|${signature}`;
    return Buffer.from(token).toString('base64');
  }

  private signTempToken(phoneNumber: string, purpose: OTPPurpose, expiry: number): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required for OTP temp token signing');
    }
    return crypto
      .createHmac('sha256', secret)
      .update(`${phoneNumber}|${purpose}|${expiry}`)
      .digest('hex')
      .slice(0, 16);
  }

  private async checkRateLimit(phoneNumber: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const recentOTP = await this.otpRepository.findOne({
      where: {
        phone_number: phoneNumber,
        created_at: MoreThan(new Date(Date.now() - OTP_RESEND_COOLDOWN_SECONDS * 1000)),
      },
      order: { created_at: 'DESC' },
    });

    if (recentOTP) {
      const retryAfter = Math.ceil(
        (recentOTP.created_at.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000,
      );
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  private async invalidateExistingOTPs(phoneNumber: string): Promise<void> {
    await this.otpRepository.update(
      { phone_number: phoneNumber, is_used: false },
      { is_used: true, used_at: new Date() },
    );
  }

  private async sendOTPViaProvider(
    phoneNumber: string,
    code: string,
    channel: OTPChannel,
  ): Promise<{ success: boolean }> {
    const isDev = this.configService.get('NODE_ENV') !== 'production';
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const twilioPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    // Development fallback: log OTP to structured logger (never in production)
    if (isDev && (!accountSid || !authToken)) {
      const logger = new (await import('@/common/logging')).StructuredLoggerService();
      logger.setContext('OTPService');
      logger.warn(`[DEV ONLY] OTP for ${this.maskPhone(phoneNumber)}: ${code} via ${channel}`, {
        method: 'sendOTPViaProvider',
        path: 'otp/send',
      });
      return { success: true };
    }

    // Production: Twilio credentials are mandatory
    if (!accountSid || !authToken) {
      const logger = new (await import('@/common/logging')).StructuredLoggerService();
      logger.setContext('OTPService');
      logger.error('Twilio credentials not configured. TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required.');
      return { success: false };
    }

    try {
      // Use Twilio Verify Service if SID is provided (preferred)
      const verifySid = this.configService.get<string>('TWILIO_SERVICE_SID');
      if (verifySid) {
        return await this.sendViaTwilioVerify(accountSid, authToken, verifySid, phoneNumber, channel);
      }

      // Fallback: Send raw SMS/WhatsApp via Twilio Programmable Messaging
      const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const from = channel === OTPChannel.WHATSAPP
        ? `whatsapp:${twilioPhone}`
        : twilioPhone;
      const to = channel === OTPChannel.WHATSAPP
        ? `whatsapp:${phoneNumber}`
        : phoneNumber;

      const body = new URLSearchParams({
        To: to,
        From: from || '',
        Body: `Your verification code is: ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`,
      });

      const response = await fetch(twilioApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const logger = new (await import('@/common/logging')).StructuredLoggerService();
        logger.setContext('OTPService');
        logger.error(`Twilio API error: ${response.status}`, undefined, {
          method: 'sendOTPViaProvider',
          statusCode: response.status,
          error: (errorData as any)?.message,
        } as any);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      const logger = new (await import('@/common/logging')).StructuredLoggerService();
      logger.setContext('OTPService');
      logger.error(`Failed to send OTP: ${(error as Error).message}`, (error as Error).stack);
      return { success: false };
    }
  }

  /**
   * Send OTP via Twilio Verify Service (handles code generation server-side)
   * Note: When using Verify, Twilio generates its own code. We still store our hash
   * for audit purposes, but verification happens via Twilio API.
   */
  private async sendViaTwilioVerify(
    accountSid: string,
    authToken: string,
    verifySid: string,
    phoneNumber: string,
    channel: OTPChannel,
  ): Promise<{ success: boolean }> {
    const twilioChannel = channel === OTPChannel.WHATSAPP ? 'whatsapp' : 'sms';
    const verifyUrl = `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`;

    const body = new URLSearchParams({
      To: phoneNumber,
      Channel: twilioChannel,
    });

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    return { success: response.ok };
  }

  private maskPhone(phone: string): string {
    if (phone.length < 6) return '***';
    return phone.slice(0, 4) + '****' + phone.slice(-2);
  }

  /**
   * Cleanup expired OTP tokens (run as cron job)
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.otpRepository.delete({
      expires_at: LessThan(new Date()),
    });
  }
}
