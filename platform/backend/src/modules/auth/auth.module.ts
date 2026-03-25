/**
 * AuthModule - Authentication and Authorization
 *
 * This module handles authentication and authorization, including:
 * - User login/registration (email/password)
 * - Phone-based OTP authentication
 * - Social login (Apple/Google)
 * - Biometric authentication
 * - JWT token management
 * - Multi-factor authentication (MFA)
 * - Password reset
 * - Audit logging
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// Core Auth
import { AuthService } from './auth.service';
import { AuthRegistrationService } from './auth-registration.service';
import { AuthLoginService } from './auth-login.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PasswordResetService } from './password-reset.service';
import { TokenService } from './token.service';

// Phone Auth
import { PhoneAuthController } from './controllers/phone-auth.controller';
import { OTPService } from './services/otp.service';

// Social Auth
import { SocialAuthController } from './controllers/social-auth.controller';
import { SocialAuthService } from './services/social-auth.service';

// Biometric Auth
import { BiometricAuthController } from './controllers/biometric-auth.controller';
import { BiometricService } from './services/biometric.service';

// MFA
import { MfaService } from './services/mfa.service';

// Common Services
import { AuditLogService } from './services/audit-log.service';
import { EmailService } from '@/common/services/email.service';
import { PasswordExpiryGuard } from './guards/password-expiry.guard';

// Entities
import { Profile } from '@/modules/users/entities/profile.entity';
import { PasswordResetToken, UserCredential, AuditLog } from '@/modules/identity';
import { OTPToken } from './entities/otp-token.entity';
import { BiometricToken } from './entities/biometric-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      PasswordResetToken,
      UserCredential,
      AuditLog,
      OTPToken,
      BiometricToken,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          algorithm: 'HS256', // Explicitly set algorithm for security
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
          issuer: 'okinawa-api',
          audience: 'okinawa-clients',
        },
        verifyOptions: {
          algorithms: ['HS256'], // Only accept HS256 tokens
          issuer: 'okinawa-api',
          audience: 'okinawa-clients',
        },
      }),
    }),
  ],
  controllers: [
    AuthController,
    PhoneAuthController,
    SocialAuthController,
    BiometricAuthController,
  ],
  providers: [
    // Core Auth
    AuthRegistrationService,
    AuthLoginService,
    AuthService,
    PasswordResetService,
    TokenService,
    JwtStrategy,
    PasswordExpiryGuard,

    // Phone Auth
    OTPService,

    // Social Auth
    SocialAuthService,

    // Biometric Auth
    BiometricService,

    // MFA
    MfaService,

    // Common
    EmailService,
    AuditLogService,
  ],
  exports: [
    AuthService,
    AuthRegistrationService,
    AuthLoginService,
    PasswordResetService,
    TokenService,
    JwtStrategy,
    PassportModule,
    PasswordExpiryGuard,
    MfaService,
    AuditLogService,
    OTPService,
    SocialAuthService,
    BiometricService,
  ],
})
export class AuthModule {}
