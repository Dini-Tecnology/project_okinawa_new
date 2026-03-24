/**
 * AuditLog entity - Stores security audit events
 * Tracks authentication attempts, password changes, and other security events
 *
 * Part of Identity Module (AUDIT-010)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  LOGIN = 'login',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_COMPLETE = 'password_reset_complete',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  MFA_BACKUP_REGENERATED = 'mfa_backup_regenerated',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  PROFILE_UPDATED = 'profile_updated',
  TOKEN_REFRESH = 'token_refresh',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BIOMETRIC_ENROLL = 'biometric_enroll',
  BIOMETRIC_DEVICE_MISMATCH = 'biometric_device_mismatch',
  BIOMETRIC_LOGIN = 'biometric_login',
  BIOMETRIC_REVOKE = 'biometric_revoke',
  OTP_SENT = 'otp_sent',
  OTP_MAX_ATTEMPTS = 'otp_max_attempts',
  OTP_FAILED = 'otp_failed',
  OTP_VERIFIED = 'otp_verified',
  SOCIAL_LOGIN = 'social_login',
  SOCIAL_LINK = 'social_link',
  SOCIAL_REGISTER_START = 'social_register_start',
}

@Entity('audit_logs')
@Index(['user_id'])
@Index(['action'])
@Index(['created_at'])
@Index(['ip_address'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null; // For failed logins where user doesn't exist

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'varchar', nullable: true })
  entity_type: string; // e.g., 'user', 'session'

  @Column({ type: 'uuid', nullable: true })
  entity_id: string;

  @Column({ type: 'varchar', nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'boolean', default: true })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
