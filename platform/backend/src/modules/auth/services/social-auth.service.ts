/**
 * Social Auth Service
 * 
 * Handles OAuth authentication with Apple and Google.
 * Validates ID tokens and manages user creation/linking.
 */

import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as crypto from 'crypto';
import { Profile } from '@/modules/users/entities/profile.entity';
import { SocialProvider } from '../dto/social-auth.dto';
import { AuditLogService, AuditAction } from '@/modules/identity';

interface AppleTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  email?: string;
  email_verified?: boolean;
}

interface GoogleTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  exp: number;
  iat: number;
}

interface SocialAuthResult {
  isNewUser: boolean;
  user?: Profile;
  tempToken?: string;
  needsPhoneVerification: boolean;
  providerData: {
    providerId: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  };
}

@Injectable()
export class SocialAuthService {
  private readonly logger = new Logger(SocialAuthService.name);

  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Authenticate via social provider
   */
  async authenticate(
    provider: SocialProvider,
    idToken: string,
    deviceInfo?: Record<string, string>,
    ipAddress?: string,
  ): Promise<SocialAuthResult> {
    // Validate token with provider
    const tokenData = await this.validateProviderToken(provider, idToken);

    if (!tokenData.valid) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    // Check if user exists with this provider ID
    const existingUser = await this.findUserByProviderId(provider, tokenData.sub);

    if (existingUser) {
      // Existing user - check if phone is verified
      const needsPhone = !existingUser.phone || !existingUser.phone_verified;

      await this.auditLogService.log({
        userId: existingUser.id,
        action: AuditAction.SOCIAL_LOGIN,
        entityType: 'user',
        entityId: existingUser.id,
        ipAddress,
        metadata: { provider, deviceInfo },
        success: true,
      });

      return {
        isNewUser: false,
        user: existingUser,
        needsPhoneVerification: needsPhone,
        providerData: {
          providerId: tokenData.sub,
          email: tokenData.email,
          name: tokenData.name,
          avatarUrl: tokenData.avatarUrl,
        },
      };
    }

    // Check if user exists with same email
    if (tokenData.email) {
      const userByEmail = await this.profileRepository.findOne({
        where: { email: tokenData.email },
      });

      if (userByEmail) {
        // Link social account to existing email user
        await this.linkSocialAccount(userByEmail.id, provider, tokenData.sub);

        await this.auditLogService.log({
          userId: userByEmail.id,
          action: AuditAction.SOCIAL_LINK,
          entityType: 'user',
          entityId: userByEmail.id,
          ipAddress,
          metadata: { provider },
          success: true,
        });

        return {
          isNewUser: false,
          user: userByEmail,
          needsPhoneVerification: !userByEmail.phone || !userByEmail.phone_verified,
          providerData: {
            providerId: tokenData.sub,
            email: tokenData.email,
            name: tokenData.name,
            avatarUrl: tokenData.avatarUrl,
          },
        };
      }
    }

    // New user - generate temp token for phone verification
    const tempToken = this.generateTempToken(provider, tokenData);

    await this.auditLogService.log({
      action: AuditAction.SOCIAL_REGISTER_START,
      entityType: 'social',
      entityId: tokenData.sub,
      ipAddress,
      metadata: { provider, email: tokenData.email },
      success: true,
    });

    return {
      isNewUser: true,
      tempToken,
      needsPhoneVerification: true,
      providerData: {
        providerId: tokenData.sub,
        email: tokenData.email,
        name: tokenData.name,
        avatarUrl: tokenData.avatarUrl,
      },
    };
  }

  /**
   * Complete registration after phone verification
   */
  async completeRegistration(
    tempToken: string,
    phoneNumber: string,
    additionalData?: {
      fullName?: string;
      email?: string;
      birthDate?: string;
    },
    ipAddress?: string,
  ): Promise<Profile> {
    const tokenData = this.validateTempToken(tempToken);
    if (!tokenData) {
      throw new BadRequestException('Invalid or expired registration session');
    }

    // Create user profile
    const user = this.profileRepository.create({
      email: additionalData?.email || tokenData.email,
      full_name: additionalData?.fullName || tokenData.name || 'User',
      phone: phoneNumber,
      phone_verified: true,
      avatar_url: tokenData.avatarUrl,
      preferences: {
        birth_date: additionalData?.birthDate,
        social_providers: [
          {
            provider: tokenData.provider,
            provider_id: tokenData.providerId,
            linked_at: new Date().toISOString(),
          },
        ],
      },
    } as DeepPartial<Profile>);

    await this.profileRepository.save(user as Profile);

    await this.auditLogService.log({
      userId: user.id,
      action: AuditAction.REGISTER,
      entityType: 'user',
      entityId: user.id,
      ipAddress,
      metadata: { provider: tokenData.provider, via: 'social' },
      success: true,
    });

    return user;
  }

  // ============ Private Methods ============

  private async validateProviderToken(
    provider: SocialProvider,
    idToken: string,
  ): Promise<{
    valid: boolean;
    sub: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  }> {
    try {
      if (provider === SocialProvider.APPLE) {
        return this.validateAppleToken(idToken);
      } else if (provider === SocialProvider.GOOGLE) {
        return this.validateGoogleToken(idToken);
      }

      return { valid: false, sub: '' };
    } catch (error) {
      this.logger.error(`${provider} token validation failed: ${(error as Error).message}`, (error as Error).stack);
      return { valid: false, sub: '' };
    }
  }

  private async validateAppleToken(idToken: string): Promise<{
    valid: boolean;
    sub: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  }> {
    try {
      // Fetch Apple's public keys (JWKS) for cryptographic signature verification
      const jwksResponse = await fetch('https://appleid.apple.com/auth/keys');
      if (!jwksResponse.ok) {
        this.logger.error('Failed to fetch Apple JWKS');
        return { valid: false, sub: '' };
      }

      const jwks = (await jwksResponse.json()) as { keys: Array<{ kid: string; kty: string; n: string; e: string; alg: string }> };

      // Decode header to get key ID (kid) and algorithm
      const headerB64 = idToken.split('.')[0];
      const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
      const matchingKey = jwks.keys?.find((k) => k.kid === header.kid);

      if (!matchingKey) {
        this.logger.warn(`Apple JWKS: No matching key found for kid="${header.kid}"`);
        return { valid: false, sub: '' };
      }

      // Convert JWK RSA key to PEM format for cryptographic verification
      const pem = this.jwkToPem(matchingKey);

      // Verify signature cryptographically using the public key
      const [headerPart, payloadPart, signaturePart] = idToken.split('.');
      const signatureBuffer = Buffer.from(signaturePart, 'base64url');
      const dataToVerify = `${headerPart}.${payloadPart}`;

      const isSignatureValid = crypto.verify(
        'RSA-SHA256',
        Buffer.from(dataToVerify),
        { key: pem, padding: crypto.constants.RSA_PKCS1_PADDING },
        signatureBuffer,
      );

      if (!isSignatureValid) {
        this.logger.warn('Apple token: cryptographic signature verification failed');
        return { valid: false, sub: '' };
      }

      // Decode payload after signature is verified
      const decoded = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as AppleTokenPayload;

      if (!decoded || !decoded.sub) {
        return { valid: false, sub: '' };
      }

      // Verify issuer
      if (decoded.iss !== 'https://appleid.apple.com') {
        this.logger.warn(`Apple token: invalid issuer "${decoded.iss}"`);
        return { valid: false, sub: '' };
      }

      // Verify audience matches our client ID (MANDATORY)
      const appleClientId = this.configService.get<string>('APPLE_CLIENT_ID');
      if (!appleClientId) {
        this.logger.error('APPLE_CLIENT_ID not configured — cannot validate Apple tokens');
        return { valid: false, sub: '' };
      }
      if (decoded.aud !== appleClientId) {
        this.logger.warn(`Apple token: audience mismatch. Expected="${appleClientId}", got="${decoded.aud}"`);
        return { valid: false, sub: '' };
      }

      // Verify expiration
      if (decoded.exp * 1000 < Date.now()) {
        this.logger.warn('Apple token: expired');
        return { valid: false, sub: '' };
      }

      return {
        valid: true,
        sub: decoded.sub,
        email: decoded.email,
      };
    } catch (error) {
      this.logger.error(`Apple token validation error: ${(error as Error).message}`, (error as Error).stack);
      return { valid: false, sub: '' };
    }
  }

  /**
   * Convert a JWK RSA public key to PEM format
   * Used for cryptographic verification of Apple Sign In tokens
   */
  private jwkToPem(jwk: { n: string; e: string }): string {
    // Convert base64url-encoded modulus and exponent to buffers
    const n = Buffer.from(jwk.n, 'base64url');
    const e = Buffer.from(jwk.e, 'base64url');

    // Build DER-encoded RSA public key
    const encodedN = this.derEncodeInteger(n);
    const encodedE = this.derEncodeInteger(e);
    const rsaSequence = this.derSequence(Buffer.concat([encodedN, encodedE]));

    // Wrap in BIT STRING
    const bitString = Buffer.concat([
      Buffer.from([0x03]),
      this.derLength(rsaSequence.length + 1),
      Buffer.from([0x00]),
      rsaSequence,
    ]);

    // RSA OID: 1.2.840.113549.1.1.1
    const rsaOid = Buffer.from([
      0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86,
      0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
    ]);

    const outerSequence = this.derSequence(Buffer.concat([rsaOid, bitString]));
    const base64 = outerSequence.toString('base64');
    const lines = base64.match(/.{1,64}/g) || [];

    return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
  }

  private derEncodeInteger(buf: Buffer): Buffer {
    // Prepend 0x00 if high bit is set (to indicate positive integer)
    const padded = buf[0] & 0x80 ? Buffer.concat([Buffer.from([0x00]), buf]) : buf;
    return Buffer.concat([Buffer.from([0x02]), this.derLength(padded.length), padded]);
  }

  private derSequence(content: Buffer): Buffer {
    return Buffer.concat([Buffer.from([0x30]), this.derLength(content.length), content]);
  }

  private derLength(length: number): Buffer {
    if (length < 0x80) return Buffer.from([length]);
    if (length < 0x100) return Buffer.from([0x81, length]);
    return Buffer.from([0x82, (length >> 8) & 0xff, length & 0xff]);
  }

  private async validateGoogleToken(idToken: string): Promise<{
    valid: boolean;
    sub: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  }> {
    try {
      // Verify with Google's tokeninfo endpoint
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      );

      if (!response.ok) {
        return { valid: false, sub: '' };
      }

      const data = (await response.json()) as GoogleTokenPayload;

      // Verify audience matches our client ID (MANDATORY in production)
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      if (!clientId) {
        this.logger.error('GOOGLE_CLIENT_ID not configured — cannot validate Google tokens');
        return { valid: false, sub: '' };
      }
      if (data.aud !== clientId) {
        this.logger.warn(`Google token: audience mismatch. Expected="${clientId}", got="${data.aud}"`);
        return { valid: false, sub: '' };
      }

      // Verify issuer
      if (!['accounts.google.com', 'https://accounts.google.com'].includes(data.iss)) {
        return { valid: false, sub: '' };
      }

      // Verify expiration
      if (data.exp * 1000 < Date.now()) {
        return { valid: false, sub: '' };
      }

      return {
        valid: true,
        sub: data.sub,
        email: data.email,
        name: data.name,
        avatarUrl: data.picture,
      };
    } catch {
      return { valid: false, sub: '' };
    }
  }

  private async findUserByProviderId(
    provider: SocialProvider,
    providerId: string,
  ): Promise<Profile | null> {
    // Query users with matching social provider in preferences
    const users = await this.profileRepository
      .createQueryBuilder('user')
      .where(
        `user.preferences->'social_providers' @> :providerData::jsonb`,
        { providerData: JSON.stringify([{ provider, provider_id: providerId }]) },
      )
      .getOne();

    return users;
  }

  private async linkSocialAccount(
    userId: string,
    provider: SocialProvider,
    providerId: string,
  ): Promise<void> {
    const user = await this.profileRepository.findOne({ where: { id: userId } });
    if (!user) return;

    const socialProviders = user.preferences?.social_providers || [];
    socialProviders.push({
      provider,
      provider_id: providerId,
      linked_at: new Date().toISOString(),
    });

    user.preferences = {
      ...user.preferences,
      social_providers: socialProviders,
    };

    await this.profileRepository.save(user);
  }

  private generateTempToken(
    provider: SocialProvider,
    tokenData: { sub: string; email?: string; name?: string; avatarUrl?: string },
  ): string {
    const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes
    const payload = {
      provider,
      providerId: tokenData.sub,
      email: tokenData.email,
      name: tokenData.name,
      avatarUrl: tokenData.avatarUrl,
      exp: expiry,
    };

    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required for social auth temp token signing');
    }
    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')
      .slice(0, 16);

    return Buffer.from(JSON.stringify({ ...payload, sig: signature })).toString('base64');
  }

  private validateTempToken(tempToken: string): {
    provider: SocialProvider;
    providerId: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  } | null {
    try {
      const decoded = JSON.parse(Buffer.from(tempToken, 'base64').toString('utf8'));

      // Check expiry
      if (decoded.exp < Date.now()) {
        return null;
      }

      // Verify signature
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        return null;
      }
      const { sig, ...payload } = decoded;
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex')
        .slice(0, 16);

      if (sig !== expectedSig) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }
}
