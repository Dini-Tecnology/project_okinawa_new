import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { AuthRegistrationService } from './auth-registration.service';
import { AuthLoginService } from './auth-login.service';
import { PasswordResetService } from './password-reset.service';
import { TokenService } from './token.service';
import { Profile } from '../users/entities/profile.entity';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { EmailService } from '@/common/services/email.service';
import { AuditLogService } from '../identity/services/audit-log.service';
import { CredentialService } from '../identity/services/credential.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let profileRepository: Repository<Profile>;
  let emailService: EmailService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '1234567890',
    avatar_url: null,
    is_active: true,
    preferences: {
      password: 'hashedPassword123',
    },
    roles: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockEmailService = {
    sendPasswordResetEmail: jest.fn(),
    sendPasswordChangedEmail: jest.fn(),
  };

  const mockAuditLogService = {
    log: jest.fn().mockResolvedValue(undefined),
    logFailedLogin: jest.fn().mockResolvedValue(undefined),
    logSuccessfulLogin: jest.fn().mockResolvedValue(undefined),
    logPasswordChange: jest.fn().mockResolvedValue(undefined),
    logPasswordReset: jest.fn().mockResolvedValue(undefined),
    logLogin: jest.fn().mockResolvedValue(undefined),
    logLogout: jest.fn().mockResolvedValue(undefined),
    logTokenRefresh: jest.fn().mockResolvedValue(undefined),
    logAccountLockout: jest.fn().mockResolvedValue(undefined),
  };

  const mockCredentialService = {
    createCredential: jest.fn().mockResolvedValue({ id: 'cred-1' }),
    validateCredential: jest.fn().mockResolvedValue(true),
    updatePassword: jest.fn().mockResolvedValue(undefined),
    getCredential: jest.fn().mockResolvedValue({ password_hash: 'hashedPassword123' }),
    verifyPassword: jest.fn().mockResolvedValue({ valid: true, needsUpgrade: false }),
    changePassword: jest.fn().mockResolvedValue({ success: true }),
    hasPassword: jest.fn().mockResolvedValue(true),
    migrateFromPreferences: jest.fn().mockResolvedValue(undefined),
  };

  // Mocked PasswordResetService — delegates tested separately
  const mockPasswordResetService = {
    resetPassword: jest.fn().mockResolvedValue({ message: 'If email exists, reset instructions will be sent' }),
    confirmResetPassword: jest.fn().mockResolvedValue({ success: true, message: 'Password has been reset successfully' }),
  };

  // Mocked TokenService — delegates tested separately
  const mockTokenService = {
    generateTokens: jest.fn().mockResolvedValue({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 900,
      refresh_expires_in: 604800,
    }),
    refreshToken: jest.fn().mockResolvedValue({
      access_token: 'new_access_token',
      refresh_token: 'new_refresh_token',
      expires_in: 900,
      refresh_expires_in: 604800,
      user: { id: '1', email: 'test@example.com' },
    }),
    blacklistTokensOnLogout: jest.fn().mockResolvedValue(undefined),
    isTokenBlacklisted: jest.fn().mockResolvedValue(false),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthRegistrationService,
        AuthLoginService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
        {
          provide: CredentialService,
          useValue: mockCredentialService,
        },
        {
          provide: PasswordResetService,
          useValue: mockPasswordResetService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
    emailService = module.get<EmailService>(EmailService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        full_name: 'New User',
      };

      mockProfileRepository.findOne.mockResolvedValue(null);
      mockProfileRepository.create.mockReturnValue({
        ...mockUser,
        email: registerDto.email,
        full_name: registerDto.full_name,
      });
      mockProfileRepository.save.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        full_name: registerDto.full_name,
      });
      mockTokenService.generateTokens.mockResolvedValue({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 900,
        refresh_expires_in: 604800,
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockCredentialService.createCredential).toHaveBeenCalledWith(
        expect.any(String),
        registerDto.password,
      );
      expect(mockTokenService.generateTokens).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        full_name: 'Existing User',
      };

      mockProfileRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockProfileRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockProfileRepository.findOne.mockResolvedValue(mockUser);
      mockCredentialService.verifyPassword.mockResolvedValue({ valid: true });
      mockTokenService.generateTokens.mockResolvedValue({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 900,
        refresh_expires_in: 604800,
      });

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException with invalid email', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };

      const userWithPassword = {
        ...mockUser,
        preferences: { password: 'hashedPassword123' },
      };

      mockProfileRepository.findOne.mockResolvedValue(userWithPassword);
      mockCredentialService.verifyPassword.mockResolvedValue({
        valid: false,
        reason: 'invalid_password',
        attemptsRemaining: 4,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is inactive', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const inactiveUser = {
        ...mockUser,
        is_active: false,
        preferences: { password: 'hashedPassword123' },
      };

      mockProfileRepository.findOne.mockResolvedValue(inactiveUser);
      mockCredentialService.verifyPassword.mockResolvedValue({ valid: true });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if account is locked', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockProfileRepository.findOne.mockResolvedValue(mockUser);
      mockCredentialService.verifyPassword.mockResolvedValue({
        valid: false,
        locked: true,
      });

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should migrate legacy password on successful login with old format', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const userWithLegacyPassword = {
        ...mockUser,
        preferences: { password: 'hashedLegacyPassword' },
      };

      mockProfileRepository.findOne.mockResolvedValue(userWithLegacyPassword);
      mockCredentialService.verifyPassword.mockResolvedValue({
        valid: false,
        reason: 'no_credential',
        attemptsRemaining: 5,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockProfileRepository.save.mockResolvedValue(userWithLegacyPassword);
      mockTokenService.generateTokens.mockResolvedValue({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 900,
        refresh_expires_in: 604800,
      });

      const result = await service.login(loginDto);

      expect(mockCredentialService.migrateFromPreferences).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('logout', () => {
    it('should blacklist tokens and log logout', async () => {
      await service.logout('user-1', 'access_token', 'refresh_token', '127.0.0.1', 'Mozilla');

      expect(mockTokenService.blacklistTokensOnLogout).toHaveBeenCalledWith(
        'user-1',
        'access_token',
        'refresh_token',
        '127.0.0.1',
      );
      expect(mockAuditLogService.logLogout).toHaveBeenCalledWith(
        'user-1',
        '127.0.0.1',
        'Mozilla',
      );
    });

    it('should return success message', async () => {
      const result = await service.logout('user-1', 'access_token');

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('resetPassword', () => {
    it('should delegate to PasswordResetService.resetPassword', async () => {
      const resetPasswordDto: ResetPasswordDto = { email: 'test@example.com' };

      mockPasswordResetService.resetPassword.mockResolvedValue({
        message: 'If email exists, reset instructions will be sent',
      });

      const result = await service.resetPassword(resetPasswordDto);

      expect(mockPasswordResetService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
      expect(result).toHaveProperty('message');
    });

    it('should not throw error if email does not exist (security, handled by PasswordResetService)', async () => {
      const resetPasswordDto: ResetPasswordDto = { email: 'nonexistent@example.com' };

      mockPasswordResetService.resetPassword.mockResolvedValue({
        message: 'If email exists, reset instructions will be sent',
      });

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toHaveProperty('message');
    });
  });

  describe('confirmResetPassword', () => {
    it('should delegate to PasswordResetService.confirmResetPassword', async () => {
      const confirmResetDto: ConfirmResetPasswordDto = {
        token: 'valid_token',
        new_password: 'NewPassword123!',
      };

      mockPasswordResetService.confirmResetPassword.mockResolvedValue({
        success: true,
        message: 'Password has been reset successfully',
      });

      const result = await service.confirmResetPassword(confirmResetDto);

      expect(mockPasswordResetService.confirmResetPassword).toHaveBeenCalledWith(
        confirmResetDto,
        undefined,
        undefined,
      );
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user with roles', async () => {
      mockProfileRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser(mockUser.id);

      expect(result).toHaveProperty('id', mockUser.id);
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).toHaveProperty('full_name', mockUser.full_name);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['roles', 'roles.restaurant'],
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.getCurrentUser('999')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should delegate to TokenService.refreshToken', async () => {
      const refreshToken = 'valid_refresh_token';

      mockTokenService.refreshToken.mockResolvedValue({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        expires_in: 900,
        refresh_expires_in: 604800,
        user: { id: '1' },
      });

      const result = await service.refreshToken(refreshToken, '127.0.0.1');

      expect(mockTokenService.refreshToken).toHaveBeenCalledWith(refreshToken, '127.0.0.1');
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('update', () => {
    it('should successfully update password', async () => {
      const updateDto = {
        current_password: 'OldPassword123!',
        password: 'NewPassword123!',
      };

      const userWithPassword = {
        ...mockUser,
        preferences: { password: 'hashedOldPassword' },
      };

      mockProfileRepository.findOne.mockResolvedValue(userWithPassword);
      mockCredentialService.verifyPassword.mockResolvedValue({ valid: true });
      mockCredentialService.changePassword.mockResolvedValue({ success: true });
      mockProfileRepository.save.mockResolvedValue(userWithPassword);
      mockEmailService.sendPasswordChangedEmail.mockResolvedValue(undefined);

      const result = await service.update(mockUser.id, updateDto);

      expect(result).toHaveProperty('message', 'Authentication details updated successfully');
      expect(mockEmailService.sendPasswordChangedEmail).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', { password: 'NewPassword123!' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if current password not provided', async () => {
      mockProfileRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.update(mockUser.id, { password: 'NewPassword123!' }),
      ).rejects.toThrow('Current password is required to change password');
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      const updateDto = {
        current_password: 'WrongPassword!',
        password: 'NewPassword123!',
      };

      const userWithPassword = {
        ...mockUser,
        preferences: { password: 'hashedOldPassword' },
      };

      mockProfileRepository.findOne.mockResolvedValue(userWithPassword);
      mockCredentialService.verifyPassword.mockResolvedValue({
        valid: false,
        reason: 'invalid_password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.update(mockUser.id, updateDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully update email', async () => {
      const updateDto = { email: 'newemail@example.com' };

      mockProfileRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockProfileRepository.save.mockResolvedValue({
        ...mockUser,
        email: updateDto.email,
      });

      const result = await service.update(mockUser.id, updateDto);

      expect(result).toHaveProperty('email', updateDto.email);
      expect(result).toHaveProperty('message', 'Authentication details updated successfully');
    });

    it('should throw ConflictException if email already in use', async () => {
      const updateDto = { email: 'existing@example.com' };

      const existingUser = { id: 'different_id', email: 'existing@example.com' };

      mockProfileRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(existingUser);

      await expect(service.update(mockUser.id, updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProfile', () => {
    it('should delegate to update method', async () => {
      const updateDto = { email: 'newemail@example.com' };

      mockProfileRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockProfileRepository.save.mockResolvedValue({
        ...mockUser,
        email: updateDto.email,
      });

      const result = await service.updateProfile(mockUser.id, updateDto);

      expect(result).toHaveProperty('email', updateDto.email);
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should delegate to TokenService.isTokenBlacklisted', async () => {
      mockTokenService.isTokenBlacklisted.mockResolvedValue(true);

      const result = await service.isTokenBlacklisted('some_token');

      expect(mockTokenService.isTokenBlacklisted).toHaveBeenCalledWith('some_token');
      expect(result).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password via credential service', async () => {
      mockCredentialService.verifyPassword.mockResolvedValue({ valid: true });

      const result = await service.validatePassword(mockUser.id, 'correct_password');

      expect(result).toBe(true);
    });

    it('should fall back to legacy password if credential service returns invalid', async () => {
      // Reset mocks to avoid leakage from prior tests
      mockCredentialService.verifyPassword.mockReset();
      mockProfileRepository.findOne.mockReset();
      (bcrypt.compare as jest.Mock).mockReset();

      mockCredentialService.verifyPassword.mockResolvedValue({ valid: false, locked: false, attemptsRemaining: 0 });
      mockProfileRepository.findOne.mockResolvedValue({
        ...mockUser,
        preferences: { password: 'hashedLegacyPassword' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(mockUser.id, 'legacy_password');

      expect(bcrypt.compare).toHaveBeenCalledWith('legacy_password', 'hashedLegacyPassword');
      expect(result).toBe(true);
    });

    it('should return false if credential service invalid and no legacy password', async () => {
      mockCredentialService.verifyPassword.mockResolvedValue({ valid: false });
      mockProfileRepository.findOne.mockResolvedValue({
        ...mockUser,
        preferences: {},
      });

      const result = await service.validatePassword(mockUser.id, 'wrong_password');

      expect(result).toBe(false);
    });
  });
});
