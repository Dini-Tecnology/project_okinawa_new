import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { EnableMfaDto, VerifyMfaDto, DisableMfaDto } from './dto/enable-mfa.dto';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MfaService } from './services/mfa.service';

@ApiTags('auth')
@Controller('auth')
@Throttle({ strict: { ttl: 60000, limit: 10 } })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mfaService: MfaService,
  ) {}

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  @Public()
  @Post('login')
  @Throttle({ strict: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Public()
  @Post('reset-password')
  @Throttle({ strict: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('confirm-reset-password')
  @ApiOperation({ summary: 'Confirm password reset with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async confirmResetPassword(
    @Body() confirmResetPasswordDto: ConfirmResetPasswordDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);
    return this.authService.confirmResetPassword(
      confirmResetPasswordDto,
      ipAddress,
      userAgent,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @SkipThrottle()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Returns current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getCurrentUser(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateAuthDto: UpdateAuthDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);
    return this.authService.updateProfile(user.id, updateAuthDto, ipAddress, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string' },
      },
      required: ['refresh_token'],
    },
  })
  async refresh(
    @Body('refresh_token') refreshToken: string,
    @Req() req: Request,
  ) {
    const ipAddress = this.getClientIp(req);
    return this.authService.refreshToken(refreshToken, ipAddress);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and invalidate tokens' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string', description: 'Optional refresh token to revoke' },
      },
    },
  })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Headers('authorization') authorization: string,
    @Headers('user-agent') userAgent?: string,
    @Body('refresh_token') refreshToken?: string,
  ) {
    const ipAddress = this.getClientIp(req);
    const accessToken = authorization?.replace('Bearer ', '');
    return this.authService.logout(user.id, accessToken, refreshToken, ipAddress, userAgent);
  }

  // ============ MFA ENDPOINTS ============

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup MFA for user account' })
  @ApiResponse({ status: 200, description: 'Returns MFA secret and QR code URL' })
  @ApiResponse({ status: 400, description: 'MFA already enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setupMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.mfaService.setupMfa(user.id);
  }

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable MFA after verifying TOTP code' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully' })
  @ApiResponse({ status: 400, description: 'MFA setup not initiated' })
  @ApiResponse({ status: 401, description: 'Invalid TOTP code' })
  async enableMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() enableMfaDto: EnableMfaDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);
    return this.mfaService.enableMfa(user.id, enableMfaDto.totp_code, ipAddress, userAgent);
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ strict: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Disable MFA (requires password and TOTP)' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  @ApiResponse({ status: 400, description: 'MFA not enabled' })
  @ApiResponse({ status: 401, description: 'Invalid password or TOTP code' })
  async disableMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() disableMfaDto: DisableMfaDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);
    return this.mfaService.disableMfa(
      user.id,
      disableMfaDto.password,
      disableMfaDto.totp_code,
      (userId, password) => this.authService.validatePassword(userId, password),
      ipAddress,
      userAgent,
    );
  }

  @Post('mfa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ strict: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Verify MFA code (for login flow)' })
  @ApiResponse({ status: 200, description: 'MFA code verified' })
  @ApiResponse({ status: 401, description: 'Invalid MFA code' })
  async verifyMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() verifyMfaDto: VerifyMfaDto,
  ) {
    const isValid = await this.mfaService.verifyMfaCode(user.id, verifyMfaDto.totp_code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }
    return { success: true, message: 'MFA code verified' };
  }

  @Get('mfa/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @SkipThrottle()
  @ApiOperation({ summary: 'Check MFA status for current user' })
  @ApiResponse({ status: 200, description: 'Returns MFA enabled status' })
  async getMfaStatus(@CurrentUser() user: AuthenticatedUser) {
    const enabled = await this.mfaService.isMfaEnabled(user.id);
    return { mfa_enabled: enabled };
  }

  @Post('mfa/backup-codes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ strict: { ttl: 60000, limit: 2 } })
  @ApiOperation({ summary: 'Regenerate backup codes (requires TOTP)' })
  @ApiResponse({ status: 200, description: 'New backup codes generated' })
  @ApiResponse({ status: 400, description: 'MFA not enabled' })
  @ApiResponse({ status: 401, description: 'Invalid TOTP code' })
  async regenerateBackupCodes(
    @CurrentUser() user: AuthenticatedUser,
    @Body() verifyMfaDto: VerifyMfaDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);
    const backupCodes = await this.mfaService.regenerateBackupCodes(
      user.id,
      verifyMfaDto.totp_code,
      ipAddress,
      userAgent,
    );
    return { backup_codes: backupCodes };
  }
}
