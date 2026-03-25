import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Profile } from '@/modules/users/entities/profile.entity';
import {
  TokenBlacklistService,
  AuditLogService,
} from '@/modules/identity';

interface JwtDecodedPayload {
  sub: string;
  email: string;
  roles?: string[];
  restaurant_id?: string;
  jti?: string;
  exp?: number;
  iat?: number;
}

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
    private auditLogService: AuditLogService,
  ) {}

  async generateTokens(user: Profile) {
    // Load roles if not already loaded
    let userWithRoles = user;
    if (!user.roles) {
      const loaded = await this.profileRepository.findOne({
        where: { id: user.id },
        relations: ['roles', 'roles.restaurant'],
      });
      if (loaded) {
        userWithRoles = loaded;
      }
    }

    // Extract restaurant IDs and roles
    const restaurants =
      userWithRoles?.roles?.map((role) => ({
        id: role.restaurant_id,
        role: role.role,
        name: role.restaurant?.name,
      })) || [];

    const now = Math.floor(Date.now() / 1000);

    // Generate unique JTI (JWT ID) for each token - enables secure blacklisting
    const accessJti = crypto.randomUUID();
    const refreshJti = crypto.randomUUID();

    const basePayload = {
      sub: user.id,
      email: user.email,
      full_name: user.full_name,
      roles: userWithRoles?.roles?.map((r) => r.role) || [],
      restaurants: restaurants,
      restaurant_id: restaurants.length > 0 ? restaurants[0].id : null,
      iat: now,
    };

    const accessToken = this.jwtService.sign({ ...basePayload, jti: accessJti });
    const refreshToken = this.jwtService.sign({ ...basePayload, jti: refreshJti }, {
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 minutes in seconds (access token lifetime)
      refresh_expires_in: 604800, // 7 days in seconds (refresh token lifetime)
    };
  }

  async refreshToken(refreshToken: string, ipAddress?: string) {
    // Decode token to get JTI for blacklist check
    const decodedPayload = this.jwtService.decode(refreshToken) as JwtDecodedPayload | null;
    if (!decodedPayload?.jti) {
      throw new UnauthorizedException('Invalid token format');
    }

    // Check if token is blacklisted using JTI
    const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(decodedPayload.jti);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Get fresh user data
      const user = await this.profileRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles', 'roles.restaurant'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('Account is inactive');
      }

      // Blacklist the old refresh token using JTI (token rotation for security)
      const expiresAt = new Date(payload.exp * 1000);
      await this.tokenBlacklistService.blacklistToken(
        payload.jti,
        user.id,
        'refresh',
        expiresAt,
        'token_rotation',
        ipAddress,
      );

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          roles: user.roles,
        },
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async blacklistTokensOnLogout(
    userId: string,
    accessToken: string,
    refreshToken?: string,
    ipAddress?: string,
  ) {
    // Blacklist the access token using JTI
    const accessTokenPayload = this.jwtService.decode(accessToken) as JwtDecodedPayload | null;
    if (accessTokenPayload?.exp && accessTokenPayload?.jti) {
      const expiresAt = new Date(accessTokenPayload.exp * 1000);
      await this.tokenBlacklistService.blacklistToken(
        accessTokenPayload.jti,
        userId,
        'access',
        expiresAt,
        'logout',
        ipAddress,
      );
    }

    // Blacklist the refresh token if provided using JTI
    if (refreshToken) {
      const refreshTokenPayload = this.jwtService.decode(refreshToken) as JwtDecodedPayload | null;
      if (refreshTokenPayload?.exp && refreshTokenPayload?.jti) {
        const expiresAt = new Date(refreshTokenPayload.exp * 1000);
        await this.tokenBlacklistService.blacklistToken(
          refreshTokenPayload.jti,
          userId,
          'refresh',
          expiresAt,
          'logout',
          ipAddress,
        );
      }
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const payload = this.jwtService.decode(token) as JwtDecodedPayload | null;
    if (!payload?.jti) {
      return false; // Tokens without JTI cannot be in blacklist
    }
    return this.tokenBlacklistService.isTokenBlacklisted(payload.jti);
  }
}
