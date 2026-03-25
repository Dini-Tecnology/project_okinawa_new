import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '@/modules/users/entities/profile.entity';
import { RegisterDto } from './dto/register.dto';
import {
  AuditLogService,
  CredentialService,
  AuditAction,
} from '@/modules/identity';
import { TokenService } from './token.service';

@Injectable()
export class AuthRegistrationService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private auditLogService: AuditLogService,
    private credentialService: CredentialService,
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
}
