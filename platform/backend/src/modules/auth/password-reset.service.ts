import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as crypto from 'crypto';
import { Profile } from '@/modules/users/entities/profile.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { EmailService } from '@/common/services/email.service';
import {
  PasswordResetToken,
  AuditLogService,
  CredentialService,
} from '@/modules/identity';

@Injectable()
export class PasswordResetService {
  private readonly RESET_TOKEN_EXPIRY_MINUTES = 30;

  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(PasswordResetToken)
    private resetTokenRepository: Repository<PasswordResetToken>,
    private emailService: EmailService,
    private auditLogService: AuditLogService,
    private credentialService: CredentialService,
  ) {}

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.profileRepository.findOne({
      where: { email: resetPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If email exists, reset instructions will be sent' };
    }

    // Invalidate any existing unused tokens for this user
    await this.resetTokenRepository.update(
      {
        user_id: user.id,
        is_used: false,
      },
      {
        is_used: true,
        used_at: new Date(),
      },
    );

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.RESET_TOKEN_EXPIRY_MINUTES);

    // Save token to database
    const resetToken = this.resetTokenRepository.create({
      user_id: user.id,
      token: token,
      expires_at: expiresAt,
      is_used: false,
    });

    await this.resetTokenRepository.save(resetToken);

    // Send email with reset link
    await this.emailService.sendPasswordResetEmail(user.email, token, user.full_name);

    // Delete expired tokens (cleanup)
    await this.resetTokenRepository.delete({
      expires_at: LessThan(new Date()),
    });

    return { message: 'If email exists, reset instructions will be sent' };
  }

  async confirmResetPassword(
    confirmResetPasswordDto: ConfirmResetPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Find valid token
    const resetToken = await this.resetTokenRepository.findOne({
      where: {
        token: confirmResetPasswordDto.token,
        is_used: false,
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token has expired
    if (new Date() > resetToken.expires_at) {
      throw new BadRequestException('Reset token has expired');
    }

    // Get user
    const user = await this.profileRepository.findOne({
      where: { id: resetToken.user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Change password using credential service
    const result = await this.credentialService.changePassword(
      user.id,
      confirmResetPasswordDto.new_password,
    );

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    // Mark token as used
    resetToken.is_used = true;
    resetToken.used_at = new Date();
    await this.resetTokenRepository.save(resetToken);

    // Log password change
    await this.auditLogService.logPasswordChange(user.id, ipAddress, userAgent);

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(user.email, user.full_name);

    return {
      message: 'Password has been reset successfully',
      success: true,
    };
  }
}
