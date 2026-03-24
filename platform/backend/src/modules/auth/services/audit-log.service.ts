import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export interface AuditLogData {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  success?: boolean;
  failureReason?: string;
}

/**
 * AuditLogService - Tracks all security-relevant actions in the system
 */
@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log an audit event
   */
  async log(data: AuditLogData): Promise<AuditLog> {
    // Sanitize sensitive data before logging
    const sanitizedOldValues = this.sanitizeSensitiveData(data.oldValues);
    const sanitizedNewValues = this.sanitizeSensitiveData(data.newValues);
    const sanitizedMetadata = this.sanitizeSensitiveData(data.metadata);

    const auditLog = this.auditLogRepository.create({
      user_id: data.userId,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
      metadata: { ...sanitizedMetadata, old_values: sanitizedOldValues, new_values: sanitizedNewValues },
      success: data.success ?? true,
      failure_reason: data.failureReason,
    } as DeepPartial<AuditLog>);

    return this.auditLogRepository.save(auditLog as AuditLog);
  }

  /**
   * Log a successful login
   */
  async logLogin(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'login',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      metadata,
      success: true,
    });
  }

  /**
   * Log a failed login attempt
   */
  async logFailedLogin(
    email: string,
    ipAddress?: string,
    userAgent?: string,
    reason?: string,
  ): Promise<void> {
    await this.log({
      action: 'login_failed',
      entityType: 'user',
      ipAddress,
      userAgent,
      metadata: { email },
      success: false,
      failureReason: reason,
    });
  }

  /**
   * Log a logout
   */
  async logLogout(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'logout',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * Log a password change
   */
  async logPasswordChange(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'password_change',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * Log MFA enable/disable
   */
  async logMfaChange(
    userId: string,
    enabled: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: enabled ? 'mfa_enabled' : 'mfa_disabled',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * Log account lockout
   */
  async logAccountLockout(
    userId: string,
    ipAddress?: string,
    reason?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'account_locked',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      metadata: { reason },
      success: true,
    });
  }

  /**
   * Get audit logs for a user
   */
  async getLogsForUser(
    userId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get recent failed logins for an IP
   */
  async getRecentFailedLogins(
    ipAddress: string,
    minutes: number = 15,
  ): Promise<number> {
    const since = new Date();
    since.setMinutes(since.getMinutes() - minutes);

    const result = await this.auditLogRepository
      .createQueryBuilder('log')
      .where('log.action = :action', { action: 'login_failed' })
      .andWhere('log.ip_address = :ip', { ip: ipAddress })
      .andWhere('log.created_at > :since', { since })
      .getCount();

    return result;
  }

  /**
   * Remove sensitive fields from data before logging
   */
  private sanitizeSensitiveData(
    data?: Record<string, any>,
  ): Record<string, any> | undefined {
    if (!data) return undefined;

    const sensitiveFields = [
      'password',
      'password_hash',
      'token',
      'access_token',
      'refresh_token',
      'secret',
      'mfa_secret',
      'card_number',
      'cvv',
      'authorization',
    ];

    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Also check nested objects
    for (const key of Object.keys(sanitized)) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeSensitiveData(sanitized[key]);
      }
    }

    return sanitized;
  }
}
