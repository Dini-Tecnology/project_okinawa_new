import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { Profile } from '../users/entities/profile.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { EmailService } from '@/common/services/email.service';
import { AuditLogService } from '../identity/services/audit-log.service';
import { CredentialService } from '../identity/services/credential.service';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let profileRepository: Repository<Profile>;
  let resetTokenRepository: Repository<PasswordResetToken>;
  let emailService: EmailService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
    is_active: true,
    preferences: {},
    roles: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockResetTokenRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockEmailService = {
    sendPasswordResetEmail: jest.fn(),
    sendPasswordChangedEmail: jest.fn(),
  };

  const mockAuditLogService = {
    logPasswordChange: jest.fn().mockResolvedValue(undefined),
  };

  const mockCredentialService = {
    changePassword: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: mockResetTokenRepository,
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
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
    resetTokenRepository = module.get<Repository<PasswordResetToken>>(
      getRepositoryToken(PasswordResetToken),
    );
    emailService = module.get<EmailService>(EmailService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resetPassword', () => {
    it('should create a password reset token and send email when user exists', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'test@example.com',
      };

      const mockToken = {
        id: '1',
        user_id: mockUser.id,
        token: 'reset_token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        is_used: false,
        created_at: new Date(),
      };

      mockProfileRepository.findOne.mockResolvedValue(mockUser);
      mockResetTokenRepository.update.mockResolvedValue({ affected: 0 });
      mockResetTokenRepository.create.mockReturnValue(mockToken);
      mockResetTokenRepository.save.mockResolvedValue(mockToken);
      mockResetTokenRepository.delete.mockResolvedValue({ affected: 0 });
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toHaveProperty('message');
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { email: resetPasswordDto.email },
      });
      expect(mockResetTokenRepository.update).toHaveBeenCalledWith(
        { user_id: mockUser.id, is_used: false },
        { is_used: true, used_at: expect.any(Date) },
      );
      expect(mockResetTokenRepository.create).toHaveBeenCalled();
      expect(mockResetTokenRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.any(String),
        mockUser.full_name,
      );
      expect(mockResetTokenRepository.delete).toHaveBeenCalled();
    });

    it('should return generic message and not send email when user does not exist (security)', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'nonexistent@example.com',
      };

      mockProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toHaveProperty('message', 'If email exists, reset instructions will be sent');
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(mockResetTokenRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('confirmResetPassword', () => {
    it('should successfully reset password with a valid token', async () => {
      const confirmResetDto: ConfirmResetPasswordDto = {
        token: 'valid_token',
        new_password: 'NewPassword123!',
      };

      const mockToken = {
        id: '1',
        user_id: mockUser.id,
        token: 'valid_token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        is_used: false,
      };

      mockResetTokenRepository.findOne.mockResolvedValue(mockToken);
      mockProfileRepository.findOne.mockResolvedValue(mockUser);
      mockResetTokenRepository.save.mockResolvedValue({ ...mockToken, is_used: true });
      mockCredentialService.changePassword.mockResolvedValue({ success: true });
      mockEmailService.sendPasswordChangedEmail.mockResolvedValue(undefined);

      const result = await service.confirmResetPassword(confirmResetDto);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Password has been reset successfully');
      expect(mockCredentialService.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        confirmResetDto.new_password,
      );
      expect(mockResetTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_used: true, used_at: expect.any(Date) }),
      );
      expect(mockAuditLogService.logPasswordChange).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordChangedEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if token is not found', async () => {
      const confirmResetDto: ConfirmResetPasswordDto = {
        token: 'invalid_token',
        new_password: 'NewPassword123!',
      };

      mockResetTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.confirmResetPassword(confirmResetDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirmResetPassword(confirmResetDto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });

    it('should throw BadRequestException if token has expired', async () => {
      const confirmResetDto: ConfirmResetPasswordDto = {
        token: 'expired_token',
        new_password: 'NewPassword123!',
      };

      const expiredToken = {
        id: '1',
        user_id: mockUser.id,
        token: 'expired_token',
        expires_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        is_used: false,
      };

      mockResetTokenRepository.findOne.mockResolvedValue(expiredToken);

      await expect(service.confirmResetPassword(confirmResetDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirmResetPassword(confirmResetDto)).rejects.toThrow(
        'Reset token has expired',
      );
    });

    it('should throw NotFoundException if user associated with token does not exist', async () => {
      const confirmResetDto: ConfirmResetPasswordDto = {
        token: 'valid_token',
        new_password: 'NewPassword123!',
      };

      const mockToken = {
        id: '1',
        user_id: 'nonexistent_user',
        token: 'valid_token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        is_used: false,
      };

      mockResetTokenRepository.findOne.mockResolvedValue(mockToken);
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.confirmResetPassword(confirmResetDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if credential service fails to change password', async () => {
      const confirmResetDto: ConfirmResetPasswordDto = {
        token: 'valid_token',
        new_password: 'WeakPass',
      };

      const mockToken = {
        id: '1',
        user_id: mockUser.id,
        token: 'valid_token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        is_used: false,
      };

      mockResetTokenRepository.findOne.mockResolvedValue(mockToken);
      mockProfileRepository.findOne.mockResolvedValue(mockUser);
      mockCredentialService.changePassword.mockResolvedValue({
        success: false,
        message: 'Password does not meet policy requirements',
      });

      await expect(service.confirmResetPassword(confirmResetDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
