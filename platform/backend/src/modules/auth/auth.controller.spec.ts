import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MfaService } from './services/mfa.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    resetPassword: jest.fn(),
    confirmResetPassword: jest.fn(),
    getCurrentUser: jest.fn(),
    updateProfile: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockMfaService = {
    setupMfa: jest.fn(),
    enableMfa: jest.fn(),
    disableMfa: jest.fn(),
    verifyMfaCode: jest.fn(),
    isMfaEnabled: jest.fn(),
    regenerateBackupCodes: jest.fn(),
  };

  const mockUser = mockAuthenticatedUser({ id: 'user-1', email: 'test@example.com' });

  const mockTokens = {
    access_token: 'access-token-123',
    refresh_token: 'refresh-token-123',
    user: mockUser,
  };

  const mockRequest = {
    headers: { 'x-forwarded-for': '127.0.0.1' },
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
  } as any;

  const mockUserAgent = 'Mozilla/5.0 Test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MfaService, useValue: mockMfaService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'password123',
        full_name: 'New User',
      };

      mockAuthService.register.mockResolvedValue(mockTokens);

      const result = await controller.register(registerDto, mockRequest, mockUserAgent);

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        registerDto,
        '127.0.0.1',
        mockUserAgent,
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockTokens);

      const result = await controller.login(loginDto, mockRequest, mockUserAgent);

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto,
        '127.0.0.1',
        mockUserAgent,
      );
    });
  });

  describe('resetPassword', () => {
    it('should request password reset', async () => {
      const resetDto: ResetPasswordDto = {
        email: 'test@example.com',
      };

      mockAuthService.resetPassword.mockResolvedValue({
        message: 'Password reset email sent',
      });

      const result = await controller.resetPassword(resetDto);

      expect(result).toEqual({ message: 'Password reset email sent' });
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(resetDto);
    });
  });

  describe('confirmResetPassword', () => {
    it('should confirm password reset with token', async () => {
      const confirmDto: ConfirmResetPasswordDto = {
        token: 'reset-token-123',
        new_password: 'newpassword123',
      };

      mockAuthService.confirmResetPassword.mockResolvedValue({
        message: 'Password reset successfully',
      });

      const result = await controller.confirmResetPassword(
        confirmDto,
        mockRequest,
        mockUserAgent,
      );

      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(mockAuthService.confirmResetPassword).toHaveBeenCalledWith(
        confirmDto,
        '127.0.0.1',
        mockUserAgent,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user profile', async () => {
      const currentUser = mockAuthenticatedUser({ id: 'user-1' });

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(currentUser);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const currentUser = mockAuthenticatedUser({ id: 'user-1' });
      const updateDto: UpdateAuthDto = {
        email: 'updated@example.com',
      };

      const updatedUser = { ...mockUser, email: 'updated@example.com' };
      mockAuthService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(
        currentUser,
        updateDto,
        mockRequest,
        mockUserAgent,
      );

      expect(result).toEqual(updatedUser);
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(
        'user-1',
        updateDto,
        '127.0.0.1',
        mockUserAgent,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh access token', async () => {
      const refreshToken = 'refresh-token-123';
      const newTokens = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(newTokens);

      const result = await controller.refresh(refreshToken, mockRequest);

      expect(result).toEqual(newTokens);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshToken,
        '127.0.0.1',
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const currentUser = mockAuthenticatedUser({ id: 'user-1' });
      const authorization = 'Bearer access-token-123';
      const refreshToken = 'refresh-token-123';

      mockAuthService.logout.mockResolvedValue({ message: 'Logged out successfully' });

      const result = await controller.logout(
        currentUser,
        mockRequest,
        authorization,
        mockUserAgent,
        refreshToken,
      );

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockAuthService.logout).toHaveBeenCalledWith(
        'user-1',
        'access-token-123',
        refreshToken,
        '127.0.0.1',
        mockUserAgent,
      );
    });
  });

  describe('MFA endpoints', () => {
    const currentUser = mockAuthenticatedUser({ id: 'user-1' });

    describe('setupMfa', () => {
      it('should setup MFA and return secret', async () => {
        const mfaSetup = {
          secret: 'JBSWY3DPEHPK3PXP',
          qrCodeUrl: 'otpauth://totp/ProjectOkinawa:user-1?secret=JBSWY3DPEHPK3PXP',
          backupCodes: ['CODE1', 'CODE2', 'CODE3'],
        };
        mockMfaService.setupMfa.mockResolvedValue(mfaSetup);

        const result = await controller.setupMfa(currentUser);

        expect(result).toEqual(mfaSetup);
        expect(mockMfaService.setupMfa).toHaveBeenCalledWith('user-1');
      });
    });

    describe('enableMfa', () => {
      it('should enable MFA with valid TOTP code', async () => {
        const enableDto = { totp_code: '123456' };
        mockMfaService.enableMfa.mockResolvedValue({ success: true, message: 'MFA enabled' });

        const result = await controller.enableMfa(currentUser, enableDto, mockRequest, mockUserAgent);

        expect(result).toEqual({ success: true, message: 'MFA enabled' });
        expect(mockMfaService.enableMfa).toHaveBeenCalledWith('user-1', '123456', '127.0.0.1', mockUserAgent);
      });
    });

    describe('getMfaStatus', () => {
      it('should return MFA status', async () => {
        mockMfaService.isMfaEnabled.mockResolvedValue(true);

        const result = await controller.getMfaStatus(currentUser);

        expect(result).toEqual({ mfa_enabled: true });
        expect(mockMfaService.isMfaEnabled).toHaveBeenCalledWith('user-1');
      });
    });

    describe('verifyMfa', () => {
      it('should verify valid MFA code', async () => {
        const verifyDto = { totp_code: '123456' };
        mockMfaService.verifyMfaCode.mockResolvedValue(true);

        const result = await controller.verifyMfa(currentUser, verifyDto);

        expect(result).toEqual({ success: true, message: 'MFA code verified' });
      });

      it('should throw error for invalid MFA code', async () => {
        const verifyDto = { totp_code: '000000' };
        mockMfaService.verifyMfaCode.mockResolvedValue(false);

        await expect(controller.verifyMfa(currentUser, verifyDto)).rejects.toThrow('Invalid MFA code');
      });
    });

    describe('disableMfa', () => {
      it('should disable MFA with valid password and TOTP', async () => {
        const disableDto = { password: 'password123', totp_code: '123456' };
        mockMfaService.disableMfa.mockResolvedValue({ success: true, message: 'MFA disabled' });

        const result = await controller.disableMfa(currentUser, disableDto, mockRequest, mockUserAgent);

        expect(result).toEqual({ success: true, message: 'MFA disabled' });
      });
    });

    describe('regenerateBackupCodes', () => {
      it('should regenerate backup codes', async () => {
        const verifyDto = { totp_code: '123456' };
        const newCodes = ['NEW1', 'NEW2', 'NEW3'];
        mockMfaService.regenerateBackupCodes.mockResolvedValue(newCodes);

        const result = await controller.regenerateBackupCodes(currentUser, verifyDto, mockRequest, mockUserAgent);

        expect(result).toEqual({ backup_codes: newCodes });
      });
    });
  });
});
