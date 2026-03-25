/**
 * Biometric Service
 * 
 * Manages biometric enrollment, token generation, and authentication.
 */

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import { BiometricToken } from '../entities/biometric-token.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { BiometricAuthType } from '../dto/biometric-auth.dto';
import { AuditLogService, AuditAction } from '@/modules/identity';

// Token validity: 90 days
const BIOMETRIC_TOKEN_EXPIRY_DAYS = 90;

@Injectable()
export class BiometricService {
  constructor(
    @InjectRepository(BiometricToken)
    private biometricTokenRepository: Repository<BiometricToken>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Enroll biometric authentication for a user/device
   */
  async enroll(
    userId: string,
    enrollmentToken: string,
    biometricType: BiometricAuthType,
    deviceInfo?: Record<string, string>,
    publicKey?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    biometricToken: string;
    expiresAt: string;
  }> {
    // Validate enrollment token (should be issued after successful auth)
    const tokenValid = this.validateEnrollmentToken(enrollmentToken, userId);
    if (!tokenValid) {
      throw new BadRequestException('Invalid or expired enrollment token');
    }

    const deviceId = deviceInfo?.device_id || crypto.randomUUID();

    // Check for existing enrollment for this device
    await this.biometricTokenRepository.update(
      { user_id: userId, device_id: deviceId, is_revoked: false },
      { is_revoked: true, revoked_at: new Date(), revoke_reason: 'new_enrollment' },
    );

    // Generate biometric token
    const biometricToken = this.generateBiometricToken(userId, deviceId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + BIOMETRIC_TOKEN_EXPIRY_DAYS);

    // Store token
    const tokenEntity = this.biometricTokenRepository.create({
      user_id: userId,
      device_id: deviceId,
      token_hash: this.hashToken(biometricToken),
      biometric_type: biometricType,
      public_key: publicKey,
      expires_at: expiresAt,
      device_info: deviceInfo,
      is_revoked: false,
      ip_address: ipAddress,
    });

    await this.biometricTokenRepository.save(tokenEntity);

    await this.auditLogService.log({
      userId,
      action: AuditAction.BIOMETRIC_ENROLL,
      entityType: 'biometric',
      entityId: tokenEntity.id,
      ipAddress,
      userAgent,
      metadata: { biometricType, deviceId },
      success: true,
    });

    return {
      biometricToken,
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Authenticate using biometric token
   */
  async authenticate(
    biometricToken: string,
    deviceInfo?: Record<string, string>,
    signature?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    trustLevel: 'high' | 'medium' | 'low';
    user: Record<string, unknown>;
  }> {
    // Find token
    const tokenHash = this.hashToken(biometricToken);
    const tokenEntity = await this.biometricTokenRepository.findOne({
      where: {
        token_hash: tokenHash,
        is_revoked: false,
        expires_at: MoreThan(new Date()),
      },
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid or expired biometric token');
    }

    // Verify device match if device info provided
    if (deviceInfo?.device_id && tokenEntity.device_id !== deviceInfo.device_id) {
      await this.auditLogService.log({
        userId: tokenEntity.user_id,
        action: AuditAction.BIOMETRIC_DEVICE_MISMATCH,
        entityType: 'biometric',
        entityId: tokenEntity.id,
        ipAddress,
        metadata: { expected: tokenEntity.device_id, received: deviceInfo.device_id },
        success: false,
      });

      throw new UnauthorizedException('Device mismatch');
    }

    // Get user
    const user = await this.profileRepository.findOne({
      where: { id: tokenEntity.user_id },
      relations: ['roles', 'roles.restaurant'],
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Update last used
    tokenEntity.last_used_at = new Date();
    await this.biometricTokenRepository.save(tokenEntity);

    // Generate tokens
    const tokens = await this.generateAuthTokens(user);

    await this.auditLogService.log({
      userId: user.id,
      action: AuditAction.BIOMETRIC_LOGIN,
      entityType: 'user',
      entityId: user.id,
      ipAddress,
      userAgent,
      metadata: { biometricType: tokenEntity.biometric_type },
      success: true,
    });

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      trustLevel: 'high', // Biometric auth = high trust
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        roles: user.roles,
      },
    };
  }

  /**
   * Generate enrollment token (issued after successful auth)
   */
  generateEnrollmentToken(userId: string): string {
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    const secret = this.configService.get('JWT_SECRET') || 'default-secret';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${userId}|${expiry}|biometric_enroll`)
      .digest('hex')
      .slice(0, 16);

    return Buffer.from(`${userId}|${expiry}|${signature}`).toString('base64');
  }

  /**
   * Revoke biometric token (logout from device)
   */
  async revokeToken(
    userId: string,
    deviceId?: string,
    revokeAll: boolean = false,
    ipAddress?: string,
  ): Promise<void> {
    const query = this.biometricTokenRepository
      .createQueryBuilder()
      .update()
      .set({ is_revoked: true, revoked_at: new Date(), revoke_reason: 'user_request' });

    if (revokeAll) {
      query.where('user_id = :userId AND is_revoked = false', { userId });
    } else if (deviceId) {
      query.where('user_id = :userId AND device_id = :deviceId AND is_revoked = false', {
        userId,
        deviceId,
      });
    }

    await query.execute();

    await this.auditLogService.log({
      userId,
      action: AuditAction.BIOMETRIC_REVOKE,
      entityType: 'biometric',
      entityId: deviceId || 'all',
      ipAddress,
      metadata: { revokeAll },
      success: true,
    });
  }

  // ============ Private Methods ============

  private validateEnrollmentToken(token: string, expectedUserId: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [userId, expiry, signature] = decoded.split('|');

      if (userId !== expectedUserId) return false;
      if (Date.now() > parseInt(expiry, 10)) return false;

      const secret = this.configService.get('JWT_SECRET') || 'default-secret';
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(`${userId}|${expiry}|biometric_enroll`)
        .digest('hex')
        .slice(0, 16);

      return signature === expectedSig;
    } catch {
      return false;
    }
  }

  private generateBiometricToken(userId: string, deviceId: string): string {
    const random = crypto.randomBytes(32).toString('hex');
    return `bio_${userId.slice(0, 8)}_${deviceId.slice(0, 8)}_${random}`;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateAuthTokens(user: Profile): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const now = Math.floor(Date.now() / 1000);
    const accessJti = crypto.randomUUID();
    const refreshJti = crypto.randomUUID();

    const restaurants = user.roles?.map((role) => ({
      id: role.restaurant_id,
      role: role.role,
      name: role.restaurant?.name,
    })) || [];

    const basePayload = {
      sub: user.id,
      email: user.email,
      full_name: user.full_name,
      roles: user.roles?.map((r) => r.role) || [],
      restaurants,
      restaurant_id: restaurants.length > 0 ? restaurants[0].id : null,
      auth_method: 'biometric',
      trust_level: 'high',
      iat: now,
    };

    const accessToken = this.jwtService.sign({ ...basePayload, jti: accessJti });
    const refreshToken = this.jwtService.sign(
      { ...basePayload, jti: refreshJti },
      { expiresIn: '30d' },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 604800,
    };
  }
}
