import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promoter, PromoterSale, PromoterPayment } from './entities/promoter.entity';

/**
 * PromoterService handles all promoter-related business logic
 * Including registration, commission calculation, and payment processing
 */
@Injectable()
export class PromoterService {
  constructor(
    @InjectRepository(Promoter)
    private readonly promoterRepo: Repository<Promoter>,
    @InjectRepository(PromoterSale)
    private readonly saleRepo: Repository<PromoterSale>,
    @InjectRepository(PromoterPayment)
    private readonly paymentRepo: Repository<PromoterPayment>,
  ) {}

  /**
   * Register a new promoter
   */
  async registerPromoter(
    restaurantId: string,
    data: {
      userId: string;
      name: string;
      nickname?: string;
      phone?: string;
      email?: string;
      commissionType?: 'percentage' | 'fixed_per_entry' | 'fixed_per_table' | 'tiered';
      commissionRate?: number;
      pixKey?: string;
    },
  ): Promise<Promoter> {
    // Generate unique promoter code
    const promoterCode = this.generatePromoterCode(data.name);

    // Check for duplicate code
    const existing = await this.promoterRepo.findOne({ where: { promoterCode } });
    if (existing) {
      throw new ConflictException('Promoter code already exists');
    }

    const promoter = this.promoterRepo.create({
      restaurantId,
      userId: data.userId,
      name: data.name,
      nickname: data.nickname,
      phone: data.phone,
      email: data.email,
      promoterCode,
      commissionType: data.commissionType || 'percentage',
      commissionRate: data.commissionRate || 10,
      status: 'pending_approval',
      totalEntriesSold: 0,
      totalTablesSold: 0,
      totalRevenueGenerated: 0,
      totalCommissionEarned: 0,
      pendingCommission: 0,
      pixKey: data.pixKey,
    });

    return this.promoterRepo.save(promoter);
  }

  /**
   * Get promoter by ID
   */
  async getPromoterById(id: string): Promise<Promoter> {
    const promoter = await this.promoterRepo.findOne({ where: { id } });
    if (!promoter) {
      throw new NotFoundException('Promoter not found');
    }
    return promoter;
  }

  /**
   * Get promoter by code
   */
  async getPromoterByCode(code: string): Promise<Promoter> {
    const promoter = await this.promoterRepo.findOne({
      where: { promoterCode: code.toUpperCase() },
    });
    if (!promoter) {
      throw new NotFoundException('Promoter not found');
    }
    return promoter;
  }

  /**
   * Get all promoters for a restaurant
   */
  async getRestaurantPromoters(
    restaurantId: string,
    filters?: {
      status?: string;
      search?: string;
    },
  ): Promise<Promoter[]> {
    const qb = this.promoterRepo
      .createQueryBuilder('p')
      .where('p.restaurantId = :restaurantId', { restaurantId });

    if (filters?.status) {
      qb.andWhere('p.status = :status', { status: filters.status });
    }

    if (filters?.search) {
      qb.andWhere(
        '(LOWER(p.name) LIKE :search OR LOWER(p.nickname) LIKE :search OR LOWER(p.promoterCode) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }

    return qb.getMany();
  }

  /**
   * Update promoter status
   */
  async updatePromoterStatus(
    id: string,
    status: 'active' | 'inactive' | 'suspended' | 'pending_approval',
  ): Promise<Promoter> {
    const promoter = await this.getPromoterById(id);
    promoter.status = status;
    promoter.updatedAt = new Date();
    return this.promoterRepo.save(promoter);
  }

  /**
   * Update promoter commission settings
   */
  async updateCommissionSettings(
    id: string,
    data: {
      commissionType?: 'percentage' | 'fixed_per_entry' | 'fixed_per_table' | 'tiered';
      commissionRate?: number;
      fixedCommissionAmount?: number;
      tieredRates?: { tier: number; minEntries: number; maxEntries?: number; rate: number }[];
    },
  ): Promise<Promoter> {
    const promoter = await this.getPromoterById(id);

    if (data.commissionType) promoter.commissionType = data.commissionType;
    if (data.commissionRate !== undefined) promoter.commissionRate = data.commissionRate;
    if (data.fixedCommissionAmount !== undefined) promoter.fixedCommissionAmount = data.fixedCommissionAmount;
    if (data.tieredRates) promoter.tieredRates = data.tieredRates;

    promoter.updatedAt = new Date();
    return this.promoterRepo.save(promoter);
  }

  /**
   * Record a sale for a promoter
   */
  async recordSale(
    promoterId: string,
    data: {
      eventDate: Date;
      saleType: 'entry' | 'vip_table' | 'guest_list';
      referenceId: string;
      customerName?: string;
      customerPhone?: string;
      quantity: number;
      saleAmount: number;
    },
  ): Promise<PromoterSale> {
    const promoter = await this.getPromoterById(promoterId);

    if (promoter.status !== 'active') {
      throw new BadRequestException('Promoter is not active');
    }

    // Calculate commission
    const commissionAmount = this.calculateCommission(promoter, data.saleAmount, data.quantity);

    const sale = this.saleRepo.create({
      promoterId,
      restaurantId: promoter.restaurantId,
      eventDate: data.eventDate,
      saleType: data.saleType,
      referenceId: data.referenceId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      quantity: data.quantity,
      saleAmount: data.saleAmount,
      commissionAmount,
      commissionStatus: 'pending',
    });

    const savedSale = await this.saleRepo.save(sale);

    // Update promoter stats
    promoter.totalRevenueGenerated = Number(promoter.totalRevenueGenerated) + data.saleAmount;
    promoter.pendingCommission = Number(promoter.pendingCommission) + commissionAmount;

    if (data.saleType === 'entry' || data.saleType === 'guest_list') {
      promoter.totalEntriesSold += data.quantity;
    } else if (data.saleType === 'vip_table') {
      promoter.totalTablesSold += data.quantity;
    }

    promoter.updatedAt = new Date();
    await this.promoterRepo.save(promoter);

    return savedSale;
  }

  /**
   * Calculate commission based on promoter settings
   */
  private calculateCommission(promoter: Promoter, saleAmount: number, quantity: number): number {
    switch (promoter.commissionType) {
      case 'percentage':
        return (saleAmount * Number(promoter.commissionRate)) / 100;

      case 'fixed_per_entry':
        return (Number(promoter.fixedCommissionAmount) || 0) * quantity;

      case 'fixed_per_table':
        return Number(promoter.fixedCommissionAmount) || 0;

      case 'tiered':
        if (!promoter.tieredRates?.length) return 0;

        // Find applicable tier based on total entries sold
        const totalSales = promoter.totalEntriesSold + quantity;
        const tier = promoter.tieredRates
          .sort((a, b) => b.minEntries - a.minEntries)
          .find(t => totalSales >= t.minEntries);

        if (tier) {
          return (saleAmount * tier.rate) / 100;
        }
        return (saleAmount * Number(promoter.commissionRate)) / 100;

      default:
        return (saleAmount * Number(promoter.commissionRate)) / 100;
    }
  }

  /**
   * Get sales for a promoter
   */
  async getPromoterSales(
    promoterId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      saleType?: string;
      commissionStatus?: string;
    },
  ): Promise<PromoterSale[]> {
    const qb = this.saleRepo
      .createQueryBuilder('s')
      .where('s.promoterId = :promoterId', { promoterId });

    if (filters?.startDate) {
      qb.andWhere('s.eventDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      qb.andWhere('s.eventDate <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.saleType) {
      qb.andWhere('s.saleType = :saleType', { saleType: filters.saleType });
    }

    if (filters?.commissionStatus) {
      qb.andWhere('s.commissionStatus = :commissionStatus', {
        commissionStatus: filters.commissionStatus,
      });
    }

    qb.orderBy('s.createdAt', 'DESC');

    return qb.getMany();
  }

  /**
   * Approve pending commissions
   */
  async approveCommissions(saleIds: string[]): Promise<PromoterSale[]> {
    const sales = await this.saleRepo.findByIds(saleIds);

    const approvedSales = sales.filter(s => s.commissionStatus === 'pending');

    if (approvedSales.length === 0) {
      return [];
    }

    const now = new Date();
    for (const sale of approvedSales) {
      sale.commissionStatus = 'approved';
      sale.updatedAt = now;
    }

    return this.saleRepo.save(approvedSales);
  }

  /**
   * Process payment to promoter
   */
  async processPayment(
    promoterId: string,
    data: {
      saleIds: string[];
      paymentMethod: 'pix' | 'bank_transfer' | 'cash';
      processedBy: string;
    },
  ): Promise<PromoterPayment> {
    const promoter = await this.getPromoterById(promoterId);

    // Get approved sales
    const allSales = await this.saleRepo.findByIds(data.saleIds);
    const salesToPay = allSales.filter(s => s.commissionStatus === 'approved');

    if (salesToPay.length === 0) {
      throw new BadRequestException('No approved sales to pay');
    }

    // Calculate total payment
    const totalAmount = salesToPay.reduce((sum, s) => sum + Number(s.commissionAmount), 0);

    // Get period range
    const dates = salesToPay.map(s => new Date(s.eventDate));
    const periodStart = new Date(Math.min(...dates.map(d => d.getTime())));
    const periodEnd = new Date(Math.max(...dates.map(d => d.getTime())));

    const payment = this.paymentRepo.create({
      promoterId,
      restaurantId: promoter.restaurantId,
      amount: totalAmount,
      paymentMethod: data.paymentMethod,
      status: 'completed',
      periodStart,
      periodEnd,
      salesCount: salesToPay.length,
      saleIds: salesToPay.map(s => s.id),
      processedBy: data.processedBy,
      processedAt: new Date(),
    });

    const savedPayment = await this.paymentRepo.save(payment);

    // Update sales status
    const now = new Date();
    for (const sale of salesToPay) {
      sale.commissionStatus = 'paid';
      sale.paidAt = now;
      sale.paymentReference = savedPayment.id;
      sale.updatedAt = now;
    }
    await this.saleRepo.save(salesToPay);

    // Update promoter stats
    promoter.totalCommissionEarned = Number(promoter.totalCommissionEarned) + totalAmount;
    promoter.pendingCommission = Number(promoter.pendingCommission) - totalAmount;
    promoter.updatedAt = now;
    await this.promoterRepo.save(promoter);

    return savedPayment;
  }

  /**
   * Get payment history for promoter
   */
  async getPromoterPayments(promoterId: string): Promise<PromoterPayment[]> {
    return this.paymentRepo.find({
      where: { promoterId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get promoter dashboard stats
   */
  async getPromoterDashboard(promoterId: string): Promise<{
    promoter: Promoter;
    currentMonthSales: number;
    currentMonthRevenue: number;
    currentMonthCommission: number;
    pendingSales: PromoterSale[];
    recentPayments: PromoterPayment[];
  }> {
    const promoter = await this.getPromoterById(promoterId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Current month aggregated stats
    const monthStats = await this.saleRepo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.quantity), 0)', 'totalQuantity')
      .addSelect('COALESCE(SUM(s.saleAmount), 0)', 'totalRevenue')
      .addSelect('COALESCE(SUM(s.commissionAmount), 0)', 'totalCommission')
      .where('s.promoterId = :promoterId', { promoterId })
      .andWhere('s.eventDate >= :startOfMonth', { startOfMonth })
      .getRawOne();

    // Pending sales
    const pendingSales = await this.saleRepo.find({
      where: { promoterId, commissionStatus: 'pending' },
      order: { createdAt: 'DESC' },
    });

    // Recent payments (last 5)
    const recentPayments = await this.paymentRepo.find({
      where: { promoterId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      promoter,
      currentMonthSales: Number(monthStats?.totalQuantity) || 0,
      currentMonthRevenue: Number(monthStats?.totalRevenue) || 0,
      currentMonthCommission: Number(monthStats?.totalCommission) || 0,
      pendingSales,
      recentPayments,
    };
  }

  /**
   * Get leaderboard for restaurant promoters
   */
  async getPromoterLeaderboard(
    restaurantId: string,
    period: 'day' | 'week' | 'month' | 'all',
  ): Promise<Array<Promoter & { periodSales: number; periodRevenue: number }>> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    // Get active promoters for the restaurant
    const promoters = await this.promoterRepo.find({
      where: { restaurantId, status: 'active' },
    });

    if (promoters.length === 0) {
      return [];
    }

    const promoterIds = promoters.map(p => p.id);

    // Aggregate sales per promoter for the period
    const salesAgg = await this.saleRepo
      .createQueryBuilder('s')
      .select('s.promoterId', 'promoterId')
      .addSelect('COALESCE(SUM(s.quantity), 0)', 'totalQuantity')
      .addSelect('COALESCE(SUM(s.saleAmount), 0)', 'totalRevenue')
      .where('s.promoterId IN (:...promoterIds)', { promoterIds })
      .andWhere('s.eventDate >= :startDate', { startDate })
      .groupBy('s.promoterId')
      .getRawMany();

    // Build a lookup map
    const salesMap = new Map<string, { totalQuantity: number; totalRevenue: number }>();
    for (const row of salesAgg) {
      salesMap.set(row.promoterId, {
        totalQuantity: Number(row.totalQuantity) || 0,
        totalRevenue: Number(row.totalRevenue) || 0,
      });
    }

    // Merge and sort
    const leaderboard = promoters.map(promoter => {
      const stats = salesMap.get(promoter.id);
      return {
        ...promoter,
        periodSales: stats?.totalQuantity || 0,
        periodRevenue: stats?.totalRevenue || 0,
      };
    });

    return leaderboard.sort((a, b) => b.periodSales - a.periodSales);
  }

  /**
   * Generate unique promoter code
   */
  private generatePromoterCode(name: string): string {
    const prefix = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);

    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${suffix}`;
  }
}
