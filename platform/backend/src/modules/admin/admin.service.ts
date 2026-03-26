/**
 * AdminService - Operational support service for the Admin Panel
 *
 * Provides business logic for:
 * - User management (listing, details, deactivation)
 * - System health aggregation
 * - LGPD data request tracking
 * - Basic analytics overview
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, DataSource } from 'typeorm';
import { Profile } from '@/modules/users/entities/profile.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { UserConsent } from '@/modules/identity/entities/user-consent.entity';
import { ConsentService } from '@/modules/identity/services/consent.service';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export interface LgpdRequest {
  id: string;
  user_id: string;
  email: string;
  request_type: 'export' | 'deletion' | 'rectification';
  status: 'pending' | 'processing' | 'completed';
  created_at: Date;
  processed_at?: Date;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  /**
   * In-memory LGPD request store (foundation — will be replaced by a
   * dedicated entity/table in a future iteration).
   */
  private lgpdRequests: LgpdRequest[] = [];

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(UserConsent)
    private readonly consentRepository: Repository<UserConsent>,
    private readonly consentService: ConsentService,
    private readonly dataSource: DataSource,
  ) {}

  // ========== USER MANAGEMENT ==========

  /**
   * List all users with pagination and optional search by email/name
   */
  async listUsers(options: PaginationOptions) {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: any[] = [];
    if (options.search) {
      where.push(
        { email: ILike(`%${options.search}%`) },
        { full_name: ILike(`%${options.search}%`) },
      );
    }

    const [users, total] = await this.profileRepository.findAndCount({
      where: where.length > 0 ? where : undefined,
      relations: ['roles'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
      withDeleted: false,
    });

    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        phone: u.phone,
        is_active: u.is_active,
        created_at: u.created_at,
        roles: u.roles?.map((r) => r.role) ?? [],
      })),
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single user's details with roles and consent history
   */
  async getUserDetails(userId: string) {
    const user = await this.profileRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
      withDeleted: false,
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const consentHistory = await this.consentService.getConsentHistory(userId);

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      phone_verified: user.phone_verified,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      marketing_consent: user.marketing_consent,
      dietary_restrictions: user.dietary_restrictions,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles: user.roles?.map((r) => ({ id: r.id, role: r.role, restaurant_id: r.restaurant_id })) ?? [],
      consent_history: consentHistory.map((c) => ({
        id: c.id,
        consent_type: c.consent_type,
        version: c.version,
        accepted_at: c.accepted_at,
        revoked_at: c.revoked_at,
      })),
    };
  }

  /**
   * Deactivate a user account (soft disable, not deletion)
   */
  async deactivateUser(userId: string) {
    const user = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    user.is_active = false;
    await this.profileRepository.save(user);

    this.logger.warn(`User ${userId} (${user.email}) deactivated by admin`);

    return {
      id: user.id,
      email: user.email,
      is_active: false,
      deactivated_at: new Date().toISOString(),
    };
  }

  // ========== SYSTEM HEALTH ==========

  /**
   * Aggregated system health check — DB connectivity, memory, uptime
   */
  async getSystemHealth() {
    const checks: Record<string, any> = {};

    // Database check
    try {
      await this.dataSource.query('SELECT 1');
      checks.database = { status: 'up' };
    } catch (error) {
      checks.database = { status: 'down', error: (error as Error).message };
    }

    // Redis check (via Bull queue connection)
    try {
      // Simple check — if DataSource is connected, we're good on DB side
      checks.redis = { status: 'unknown', note: 'Check /health endpoint for full Redis status' };
    } catch {
      checks.redis = { status: 'unknown' };
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    checks.memory = {
      heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss_mb: Math.round(memUsage.rss / 1024 / 1024),
      external_mb: Math.round(memUsage.external / 1024 / 1024),
    };

    // Uptime
    checks.uptime_seconds = Math.round(process.uptime());

    // Overall status
    const isHealthy = checks.database?.status === 'up';

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  // ========== LGPD REQUESTS ==========

  /**
   * List pending LGPD data requests
   */
  async listLgpdRequests(status?: string) {
    if (status) {
      return this.lgpdRequests.filter((r) => r.status === status);
    }
    return this.lgpdRequests;
  }

  /**
   * Mark an LGPD request as processed
   */
  async processLgpdRequest(requestId: string) {
    const request = this.lgpdRequests.find((r) => r.id === requestId);

    if (!request) {
      throw new NotFoundException(`LGPD request ${requestId} not found`);
    }

    request.status = 'completed';
    request.processed_at = new Date();

    this.logger.log(
      `LGPD request ${requestId} (${request.request_type}) for user ${request.user_id} marked as processed`,
    );

    return request;
  }

  /**
   * Create an LGPD request (used internally when users request data export/deletion)
   */
  createLgpdRequest(
    userId: string,
    email: string,
    requestType: 'export' | 'deletion' | 'rectification',
  ): LgpdRequest {
    const request: LgpdRequest = {
      id: `lgpd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: userId,
      email,
      request_type: requestType,
      status: 'pending',
      created_at: new Date(),
    };

    this.lgpdRequests.push(request);
    this.logger.log(
      `LGPD ${requestType} request created for user ${userId} (${email})`,
    );

    return request;
  }

  // ========== ANALYTICS OVERVIEW ==========

  /**
   * Basic analytics overview — total users, orders today, revenue today
   */
  async getAnalyticsOverview() {
    // Total users
    const totalUsers = await this.profileRepository.count({
      withDeleted: false,
    });

    // Active users
    const activeUsers = await this.profileRepository.count({
      where: { is_active: true },
      withDeleted: false,
    });

    // Orders today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersToday = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.created_at >= :today', { today })
      .getCount();

    // Revenue today
    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total_amount), 0)', 'revenue')
      .where('order.created_at >= :today', { today })
      .andWhere('order.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: ['cancelled', 'rejected'],
      })
      .getRawOne();

    const revenueToday = parseFloat(revenueResult?.revenue || '0');

    // Total consents
    const totalConsents = await this.consentRepository.count();

    // Pending LGPD requests
    const pendingLgpdRequests = this.lgpdRequests.filter(
      (r) => r.status === 'pending',
    ).length;

    return {
      total_users: totalUsers,
      active_users: activeUsers,
      orders_today: ordersToday,
      revenue_today: revenueToday,
      total_consents: totalConsents,
      pending_lgpd_requests: pendingLgpdRequests,
      generated_at: new Date().toISOString(),
    };
  }
}
