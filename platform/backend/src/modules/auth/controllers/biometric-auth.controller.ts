/**
 * Biometric Auth Controller
 * 
 * Handles biometric enrollment and authentication.
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { BiometricService } from '../services/biometric.service';
import { BiometricEnrollDto, BiometricAuthenticateDto } from '../dto/biometric-auth.dto';

@ApiTags('auth/biometric')
@Controller('auth/biometric')
export class BiometricAuthController {
  constructor(private readonly biometricService: BiometricService) {}

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }

  @Post('enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enroll biometric authentication for device' })
  @ApiResponse({ status: 200, description: 'Biometric enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid enrollment token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enroll(
    @CurrentUser() user: AuthenticatedUser,
    @Body() enrollDto: BiometricEnrollDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);

    const result = await this.biometricService.enroll(
      user.id,
      enrollDto.enrollment_token,
      enrollDto.biometric_type,
      enrollDto.device_info,
      enrollDto.public_key,
      ipAddress,
      userAgent,
    );

    return {
      status: 'enrolled',
      biometric_token: result.biometricToken,
      expires_at: result.expiresAt,
    };
  }

  @Public()
  @Post('authenticate')
  @Throttle({ strict: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate using biometric token' })
  @ApiResponse({ status: 200, description: 'Authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired biometric token' })
  async authenticate(
    @Body() authDto: BiometricAuthenticateDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);

    const result = await this.biometricService.authenticate(
      authDto.biometric_token,
      authDto.device_info,
      authDto.signature,
      ipAddress,
      userAgent,
    );

    return {
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      expires_in: result.expiresIn,
      trust_level: result.trustLevel,
      user: result.user,
    };
  }
}
