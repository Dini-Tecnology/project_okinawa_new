import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Profile } from '@/modules/users/entities/profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { EmailService } from '@/common/services/email.service';
// Identity module services (provided globally)
import {
  AuditLogService,
  CredentialService,
  AuditAction,
} from '@/modules/identity';
import { PasswordResetService } from './password-reset.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private emailService: EmailService,
    // Identity module services (injected from global module)
    private auditLogService: AuditLogService,
    private credentialService: CredentialService,
    // Focused sub-services
    private passwordResetService: PasswordResetService,
    private tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const existingUser = await this.profileRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create user profile (no password in preferences anymore)
    const user = this.profileRepository.create({
      email: registerDto.email,
      full_name: registerDto.full_name,
      preferences: {},
    });

    await this.profileRepository.save(user);

    // Create credentials in separate table (secure storage)
    await this.credentialService.createCredential(user.id, registerDto.password);

    // Log registration
    await this.auditLogService.log({
      userId: user.id,
      action: AuditAction.REGISTER,
      entityType: 'user',
      entityId: user.id,
      ipAddress,
      userAgent,
      success: true,
    });

    const tokens = await this.tokenService.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.profileRepository.findOne({
      where: { email: loginDto.email },
      relations: ['roles', 'roles.restaurant'],
    });

    if (!user) {
      await this.auditLogService.logFailedLogin(
        loginDto.email,
        ipAddress,
        userAgent,
        'User not found',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check credentials using the new credential service
    const verifyResult = await this.credentialService.verifyPassword(
      user.id,
      loginDto.password,
      ipAddress,
    );

    if (verifyResult.locked) {
      await this.auditLogService.logAccountLockout(user.id, ipAddress, 'max_attempts');
      throw new ForbiddenException(
        'Account is temporarily locked due to too many failed login attempts. Please try again later.',
      );
    }

    if (!verifyResult.valid) {
      // Check if password is in old preferences format (migration support)
      const legacyPassword = user.preferences?.password;
      if (legacyPassword) {
        const isLegacyValid = await bcrypt.compare(loginDto.password, legacyPassword);
        if (isLegacyValid) {
          // Migrate to new credential table
          await this.credentialService.migrateFromPreferences(user.id, legacyPassword);
          // Clear password from preferences (security cleanup)
          user.preferences = { ...user.preferences };
          delete user.preferences.password;
          await this.profileRepository.save(user);
        } else {
          await this.auditLogService.logFailedLogin(
            loginDto.email,
            ipAddress,
            userAgent,
            `Invalid password. ${verifyResult.attemptsRemaining} attempts remaining.`,
          );
          throw new UnauthorizedException('Invalid credentials');
        }
      } else {
        await this.auditLogService.logFailedLogin(
          loginDto.email,
          ipAddress,
          userAgent,
          `Invalid password. ${verifyResult.attemptsRemaining} attempts remaining.`,
        );
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Log successful login
    await this.auditLogService.logLogin(user.id, ipAddress, userAgent);

    const tokens = await this.tokenService.generateTokens(user);

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
  }

  async logout(
    userId: string,
    accessToken: string,
    refreshToken?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    await this.tokenService.blacklistTokensOnLogout(userId, accessToken, refreshToken, ipAddress);

    // Log logout
    await this.auditLogService.logLogout(userId, ipAddress, userAgent);

    return { message: 'Logged out successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(resetPasswordDto);
  }

  async confirmResetPassword(
    confirmResetPasswordDto: ConfirmResetPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.passwordResetService.confirmResetPassword(
      confirmResetPasswordDto,
      ipAddress,
      userAgent,
    );
  }

  async getCurrentUser(userId: string) {
    const user = await this.profileRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.restaurant'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      roles: user.roles,
    };
  }

  async refreshToken(refreshToken: string, ipAddress?: string) {
    return this.tokenService.refreshToken(refreshToken, ipAddress);
  }

  /**
   * Update user authentication details (email, password)
   */
  async update(
    userId: string,
    updateAuthDto: UpdateAuthDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If changing password, verify current password and use credential service
    if (updateAuthDto.password) {
      if (!updateAuthDto.current_password) {
        throw new BadRequestException('Current password is required to change password');
      }

      // Verify current password
      const verifyResult = await this.credentialService.verifyPassword(
        userId,
        updateAuthDto.current_password,
      );

      if (!verifyResult.valid) {
        // Try legacy password if credential service fails
        const legacyPassword = user.preferences?.password;
        if (legacyPassword) {
          const isLegacyValid = await bcrypt.compare(
            updateAuthDto.current_password,
            legacyPassword,
          );
          if (!isLegacyValid) {
            throw new UnauthorizedException('Current password is incorrect');
          }
        } else {
          throw new UnauthorizedException('Current password is incorrect');
        }
      }

      // Change password using credential service
      const result = await this.credentialService.changePassword(userId, updateAuthDto.password);

      if (!result.success) {
        throw new BadRequestException(result.message);
      }

      // Log password change
      await this.auditLogService.logPasswordChange(userId, ipAddress, userAgent);

      // Send confirmation email
      await this.emailService.sendPasswordChangedEmail(user.email, user.full_name);
    }

    // Update email if provided
    if (updateAuthDto.email && updateAuthDto.email !== user.email) {
      const existingUser = await this.profileRepository.findOne({
        where: { email: updateAuthDto.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }

      user.email = updateAuthDto.email;
    }

    const updatedUser = await this.profileRepository.save(user);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      message: 'Authentication details updated successfully',
    };
  }

  /**
   * Update user profile (alias for update method)
   */
  async updateProfile(
    userId: string,
    updateAuthDto: UpdateAuthDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.update(userId, updateAuthDto, ipAddress, userAgent);
  }

  /**
   * Check if a token is blacklisted by extracting JTI
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.tokenService.isTokenBlacklisted(token);
  }

  /**
   * Validate user password (for MFA disable flow)
   */
  async validatePassword(userId: string, password: string): Promise<boolean> {
    const verifyResult = await this.credentialService.verifyPassword(userId, password);

    if (verifyResult.valid) {
      return true;
    }

    // Try legacy password if credential service fails
    const user = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (user?.preferences?.password) {
      return bcrypt.compare(password, user.preferences.password);
    }

    return false;
  }
}
