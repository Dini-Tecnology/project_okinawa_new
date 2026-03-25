import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Profile } from '@/modules/users/entities/profile.entity';
import { LoginDto } from './dto/login.dto';
import {
  AuditLogService,
  CredentialService,
} from '@/modules/identity';
import { TokenService } from './token.service';

@Injectable()
export class AuthLoginService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private auditLogService: AuditLogService,
    private credentialService: CredentialService,
    private tokenService: TokenService,
  ) {}

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
}
