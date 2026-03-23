import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { Profile } from '../users/entities/profile.entity';
import { TokenBlacklistService } from '../identity/services/token-blacklist.service';
import { AuditLogService } from '../identity/services/audit-log.service';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let profileRepository: Repository<Profile>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
    avatar_url: null,
    is_active: true,
    preferences: {},
    roles: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
  };

  const mockTokenBlacklistService = {
    isTokenBlacklisted: jest.fn().mockResolvedValue(false),
    blacklistToken: jest.fn().mockResolvedValue(undefined),
  };

  const mockAuditLogService = {
    logLogout: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens with correct structure', async () => {
      mockJwtService.sign.mockReturnValue('mock-token');
      mockProfileRepository.findOne.mockResolvedValue({ ...mockUser, roles: [] });

      const result = await service.generateTokens(mockUser as any);

      expect(result).toHaveProperty('access_token', 'mock-token');
      expect(result).toHaveProperty('refresh_token', 'mock-token');
      expect(result).toHaveProperty('expires_in', 900);
      expect(result).toHaveProperty('refresh_expires_in', 604800);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should call sign with refresh token options for refresh token', async () => {
      mockJwtService.sign.mockReturnValue('mock-token');
      mockProfileRepository.findOne.mockResolvedValue({ ...mockUser, roles: [] });

      await service.generateTokens(mockUser as any);

      // Second call should include expiresIn: '7d'
      const secondCallArgs = mockJwtService.sign.mock.calls[1];
      expect(secondCallArgs[1]).toEqual({ expiresIn: '7d' });
    });

    it('should load roles from database when roles are not present on user', async () => {
      const userWithoutRoles = { ...mockUser, roles: undefined };
      const userWithRoles = { ...mockUser, roles: [] };

      mockProfileRepository.findOne.mockResolvedValue(userWithRoles);
      mockJwtService.sign.mockReturnValue('mock-token');

      await service.generateTokens(userWithoutRoles as any);

      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['roles', 'roles.restaurant'],
      });
    });

    it('should include restaurants in token payload from roles', async () => {
      const roleWithRestaurant = {
        restaurant_id: 'rest-1',
        role: 'admin',
        restaurant: { name: 'Test Restaurant' },
      };
      const userWithRoles = { ...mockUser, roles: [roleWithRestaurant] };

      mockJwtService.sign.mockReturnValue('mock-token');

      await service.generateTokens(userWithRoles as any);

      const firstCallPayload = mockJwtService.sign.mock.calls[0][0];
      expect(firstCallPayload.restaurants).toHaveLength(1);
      expect(firstCallPayload.restaurants[0]).toMatchObject({
        id: 'rest-1',
        role: 'admin',
        name: 'Test Restaurant',
      });
      expect(firstCallPayload.restaurant_id).toBe('rest-1');
    });

    it('should set restaurant_id to null when user has no roles', async () => {
      mockJwtService.sign.mockReturnValue('mock-token');
      mockProfileRepository.findOne.mockResolvedValue({ ...mockUser, roles: [] });

      await service.generateTokens(mockUser as any);

      const firstCallPayload = mockJwtService.sign.mock.calls[0][0];
      expect(firstCallPayload.restaurant_id).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token with a valid token', async () => {
      const validRefreshToken = 'valid_refresh_token';
      const payload = {
        sub: mockUser.id,
        email: mockUser.email,
        jti: 'test-jti-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJwtService.decode.mockReturnValue(payload);
      mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verify.mockReturnValue(payload);
      mockProfileRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new_token');

      const result = await service.refreshToken(validRefreshToken);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user.id).toBe(mockUser.id);
      expect(mockJwtService.decode).toHaveBeenCalledWith(validRefreshToken);
      expect(mockTokenBlacklistService.isTokenBlacklisted).toHaveBeenCalledWith('test-jti-123');
      expect(mockTokenBlacklistService.blacklistToken).toHaveBeenCalledWith(
        payload.jti,
        mockUser.id,
        'refresh',
        expect.any(Date),
        'token_rotation',
        undefined,
      );
    });

    it('should throw UnauthorizedException if token has no JTI', async () => {
      mockJwtService.decode.mockReturnValue({ sub: mockUser.id });

      await expect(service.refreshToken('invalid_token')).rejects.toThrow(
        new UnauthorizedException('Invalid token format'),
      );
    });

    it('should throw UnauthorizedException if token is blacklisted', async () => {
      const payload = {
        sub: mockUser.id,
        jti: 'blacklisted-jti',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJwtService.decode.mockReturnValue(payload);
      mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(true);

      await expect(service.refreshToken('blacklisted_token')).rejects.toThrow(
        new UnauthorizedException('Token has been revoked'),
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const payload = {
        sub: 'nonexistent',
        jti: 'test-jti',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJwtService.decode.mockReturnValue(payload);
      mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verify.mockReturnValue(payload);
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken('valid_token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is inactive', async () => {
      const payload = {
        sub: mockUser.id,
        jti: 'test-jti',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const inactiveUser = { ...mockUser, is_active: false };

      mockJwtService.decode.mockReturnValue(payload);
      mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verify.mockReturnValue(payload);
      mockProfileRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(service.refreshToken('valid_token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if JWT verify throws', async () => {
      const payload = {
        sub: mockUser.id,
        jti: 'test-jti',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJwtService.decode.mockReturnValue(payload);
      mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshToken('expired_token')).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token'),
      );
    });
  });

  describe('blacklistTokensOnLogout', () => {
    it('should blacklist access token on logout', async () => {
      const accessTokenPayload = {
        jti: 'access-jti',
        exp: Math.floor(Date.now() / 1000) + 900,
      };

      mockJwtService.decode.mockReturnValueOnce(accessTokenPayload);

      await service.blacklistTokensOnLogout(mockUser.id, 'access_token');

      expect(mockTokenBlacklistService.blacklistToken).toHaveBeenCalledWith(
        'access-jti',
        mockUser.id,
        'access',
        expect.any(Date),
        'logout',
        undefined,
      );
    });

    it('should blacklist both access and refresh tokens when refresh token is provided', async () => {
      const accessPayload = { jti: 'access-jti', exp: Math.floor(Date.now() / 1000) + 900 };
      const refreshPayload = { jti: 'refresh-jti', exp: Math.floor(Date.now() / 1000) + 604800 };

      mockJwtService.decode
        .mockReturnValueOnce(accessPayload)
        .mockReturnValueOnce(refreshPayload);

      await service.blacklistTokensOnLogout(
        mockUser.id,
        'access_token',
        'refresh_token',
        '127.0.0.1',
      );

      expect(mockTokenBlacklistService.blacklistToken).toHaveBeenCalledTimes(2);
      expect(mockTokenBlacklistService.blacklistToken).toHaveBeenCalledWith(
        'access-jti',
        mockUser.id,
        'access',
        expect.any(Date),
        'logout',
        '127.0.0.1',
      );
      expect(mockTokenBlacklistService.blacklistToken).toHaveBeenCalledWith(
        'refresh-jti',
        mockUser.id,
        'refresh',
        expect.any(Date),
        'logout',
        '127.0.0.1',
      );
    });

    it('should not blacklist if access token has no JTI or exp', async () => {
      mockJwtService.decode.mockReturnValue({ sub: mockUser.id });

      await service.blacklistTokensOnLogout(mockUser.id, 'invalid_access_token');

      expect(mockTokenBlacklistService.blacklistToken).not.toHaveBeenCalled();
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return false for tokens without JTI', async () => {
      mockJwtService.decode.mockReturnValue({ sub: mockUser.id });

      const result = await service.isTokenBlacklisted('token_without_jti');

      expect(result).toBe(false);
      expect(mockTokenBlacklistService.isTokenBlacklisted).not.toHaveBeenCalled();
    });

    it('should delegate to TokenBlacklistService when JTI is present', async () => {
      mockJwtService.decode.mockReturnValue({ jti: 'some-jti' });
      mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(true);

      const result = await service.isTokenBlacklisted('token_with_jti');

      expect(result).toBe(true);
      expect(mockTokenBlacklistService.isTokenBlacklisted).toHaveBeenCalledWith('some-jti');
    });

    it('should return false when token is not in blacklist', async () => {
      mockJwtService.decode.mockReturnValue({ jti: 'valid-jti' });
      mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);

      const result = await service.isTokenBlacklisted('valid_token');

      expect(result).toBe(false);
    });
  });
});
