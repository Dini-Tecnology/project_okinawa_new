import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PromoterService } from '../promoter.service';
import { Promoter, PromoterSale, PromoterPayment } from '../entities/promoter.entity';

const createMockQueryBuilder = (result: any = []) => {
  const qb: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(Array.isArray(result) ? result : []),
    getRawOne: jest.fn().mockResolvedValue(result),
    getRawMany: jest.fn().mockResolvedValue(Array.isArray(result) ? result : []),
  };
  return qb;
};

describe('PromoterService', () => {
  let service: PromoterService;

  const mockPromoterRepo = {
    findOne: jest.fn(),
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn((entity) => Promise.resolve({ id: 'promoter-1', ...entity })),
    find: jest.fn(),
    findByIds: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSaleRepo = {
    findOne: jest.fn(),
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn((entity) =>
      Promise.resolve(Array.isArray(entity) ? entity : { id: 'sale-1', ...entity }),
    ),
    find: jest.fn(),
    findByIds: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPaymentRepo = {
    findOne: jest.fn(),
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn((entity) => Promise.resolve({ id: 'payment-1', ...entity })),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromoterService,
        { provide: getRepositoryToken(Promoter), useValue: mockPromoterRepo },
        { provide: getRepositoryToken(PromoterSale), useValue: mockSaleRepo },
        { provide: getRepositoryToken(PromoterPayment), useValue: mockPaymentRepo },
      ],
    }).compile();

    service = module.get<PromoterService>(PromoterService);
    jest.clearAllMocks();
  });

  const createPromoter = (overrides: Partial<Promoter> = {}): Promoter =>
    ({
      id: 'promoter-1',
      restaurantId: 'restaurant-1',
      userId: 'user-1',
      name: 'John Doe',
      promoterCode: 'JD1234',
      commissionType: 'percentage',
      commissionRate: 10,
      fixedCommissionAmount: 0,
      tieredRates: null,
      status: 'active',
      totalEntriesSold: 0,
      totalTablesSold: 0,
      totalRevenueGenerated: 0,
      totalCommissionEarned: 0,
      pendingCommission: 0,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      ...overrides,
    }) as Promoter;

  const createSale = (overrides: Partial<PromoterSale> = {}): PromoterSale =>
    ({
      id: 'sale-1',
      promoterId: 'promoter-1',
      restaurantId: 'restaurant-1',
      eventDate: new Date('2026-03-15'),
      saleType: 'entry',
      referenceId: 'ref-1',
      quantity: 2,
      saleAmount: 100,
      commissionAmount: 10,
      commissionStatus: 'pending',
      createdAt: new Date('2026-03-15'),
      updatedAt: new Date('2026-03-15'),
      ...overrides,
    }) as PromoterSale;

  describe('registerPromoter', () => {
    it('should register a new promoter', async () => {
      mockPromoterRepo.findOne.mockResolvedValue(null);

      const result = await service.registerPromoter('restaurant-1', {
        userId: 'user-1',
        name: 'John Doe',
        email: 'john@test.com',
        commissionRate: 15,
      });

      expect(mockPromoterRepo.findOne).toHaveBeenCalled();
      expect(mockPromoterRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurantId: 'restaurant-1',
          userId: 'user-1',
          name: 'John Doe',
          commissionRate: 15,
          status: 'pending_approval',
        }),
      );
      expect(mockPromoterRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if promoter code already exists', async () => {
      mockPromoterRepo.findOne.mockResolvedValue(createPromoter());

      await expect(
        service.registerPromoter('restaurant-1', {
          userId: 'user-1',
          name: 'John Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should use default commission type and rate if not provided', async () => {
      mockPromoterRepo.findOne.mockResolvedValue(null);

      await service.registerPromoter('restaurant-1', {
        userId: 'user-1',
        name: 'Jane Smith',
      });

      expect(mockPromoterRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          commissionType: 'percentage',
          commissionRate: 10,
        }),
      );
    });
  });

  describe('getPromoterById', () => {
    it('should return promoter when found', async () => {
      const promoter = createPromoter();
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      const result = await service.getPromoterById('promoter-1');

      expect(result).toEqual(promoter);
      expect(mockPromoterRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'promoter-1' },
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockPromoterRepo.findOne.mockResolvedValue(null);

      await expect(service.getPromoterById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPromoterByCode', () => {
    it('should return promoter when found by code', async () => {
      const promoter = createPromoter();
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      const result = await service.getPromoterByCode('jd1234');

      expect(result).toEqual(promoter);
      expect(mockPromoterRepo.findOne).toHaveBeenCalledWith({
        where: { promoterCode: 'JD1234' },
      });
    });

    it('should throw NotFoundException when code not found', async () => {
      mockPromoterRepo.findOne.mockResolvedValue(null);

      await expect(service.getPromoterByCode('INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRestaurantPromoters', () => {
    it('should query promoters by restaurant', async () => {
      const qb = createMockQueryBuilder([createPromoter()]);
      mockPromoterRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getRestaurantPromoters('restaurant-1');

      expect(mockPromoterRepo.createQueryBuilder).toHaveBeenCalledWith('p');
      expect(qb.where).toHaveBeenCalledWith('p.restaurantId = :restaurantId', {
        restaurantId: 'restaurant-1',
      });
      expect(result).toHaveLength(1);
    });

    it('should filter by status when provided', async () => {
      const qb = createMockQueryBuilder([]);
      mockPromoterRepo.createQueryBuilder.mockReturnValue(qb);

      await service.getRestaurantPromoters('restaurant-1', { status: 'active' });

      expect(qb.andWhere).toHaveBeenCalledWith('p.status = :status', { status: 'active' });
    });

    it('should filter by search when provided', async () => {
      const qb = createMockQueryBuilder([]);
      mockPromoterRepo.createQueryBuilder.mockReturnValue(qb);

      await service.getRestaurantPromoters('restaurant-1', { search: 'John' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(p.name) LIKE :search'),
        { search: '%john%' },
      );
    });
  });

  describe('updatePromoterStatus', () => {
    it('should update promoter status', async () => {
      const promoter = createPromoter({ status: 'pending_approval' });
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      await service.updatePromoterStatus('promoter-1', 'active');

      expect(mockPromoterRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' }),
      );
    });

    it('should throw NotFoundException for invalid promoter', async () => {
      mockPromoterRepo.findOne.mockResolvedValue(null);

      await expect(service.updatePromoterStatus('invalid', 'active')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCommissionSettings', () => {
    it('should update commission type and rate', async () => {
      const promoter = createPromoter();
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      await service.updateCommissionSettings('promoter-1', {
        commissionType: 'fixed_per_entry',
        fixedCommissionAmount: 5,
      });

      expect(mockPromoterRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          commissionType: 'fixed_per_entry',
          fixedCommissionAmount: 5,
        }),
      );
    });

    it('should update tiered rates', async () => {
      const promoter = createPromoter();
      mockPromoterRepo.findOne.mockResolvedValue(promoter);
      const tiers = [{ tier: 1, minEntries: 0, maxEntries: 50, rate: 5 }];

      await service.updateCommissionSettings('promoter-1', {
        commissionType: 'tiered',
        tieredRates: tiers,
      });

      expect(mockPromoterRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ tieredRates: tiers }),
      );
    });
  });

  describe('recordSale', () => {
    const saleData = {
      eventDate: new Date('2026-03-15'),
      saleType: 'entry' as const,
      referenceId: 'ref-1',
      quantity: 3,
      saleAmount: 150,
    };

    it('should record a sale with percentage commission', async () => {
      const promoter = createPromoter({ commissionRate: 10 });
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      await service.recordSale('promoter-1', saleData);

      // 10% of 150 = 15
      expect(mockSaleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          commissionAmount: 15,
          commissionStatus: 'pending',
        }),
      );
      expect(mockSaleRepo.save).toHaveBeenCalled();
      expect(mockPromoterRepo.save).toHaveBeenCalled();
    });

    it('should record a sale with fixed_per_entry commission', async () => {
      const promoter = createPromoter({
        commissionType: 'fixed_per_entry',
        fixedCommissionAmount: 5,
      });
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      await service.recordSale('promoter-1', saleData);

      // 5 * 3 = 15
      expect(mockSaleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ commissionAmount: 15 }),
      );
    });

    it('should record a sale with fixed_per_table commission', async () => {
      const promoter = createPromoter({
        commissionType: 'fixed_per_table',
        fixedCommissionAmount: 100,
      });
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      await service.recordSale('promoter-1', {
        ...saleData,
        saleType: 'vip_table',
      });

      // fixed per table = 100
      expect(mockSaleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ commissionAmount: 100 }),
      );
    });

    it('should record a sale with tiered commission', async () => {
      const promoter = createPromoter({
        commissionType: 'tiered',
        totalEntriesSold: 60,
        tieredRates: [
          { tier: 1, minEntries: 0, maxEntries: 50, rate: 5 },
          { tier: 2, minEntries: 50, rate: 10 },
        ],
      });
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      await service.recordSale('promoter-1', saleData);

      // totalSales = 60 + 3 = 63, tier 2 applies (minEntries 50), rate 10% of 150 = 15
      expect(mockSaleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ commissionAmount: 15 }),
      );
    });

    it('should throw BadRequestException if promoter is not active', async () => {
      const promoter = createPromoter({ status: 'suspended' });
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      await expect(service.recordSale('promoter-1', saleData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update promoter totalEntriesSold for entry/guest_list sales', async () => {
      const promoter = createPromoter({ totalEntriesSold: 10 });
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      await service.recordSale('promoter-1', saleData);

      expect(mockPromoterRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ totalEntriesSold: 13 }),
      );
    });

    it('should update promoter totalTablesSold for vip_table sales', async () => {
      const promoter = createPromoter({ totalTablesSold: 2 });
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      await service.recordSale('promoter-1', {
        ...saleData,
        saleType: 'vip_table',
        quantity: 1,
      });

      expect(mockPromoterRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ totalTablesSold: 3 }),
      );
    });
  });

  describe('getPromoterSales', () => {
    it('should query sales by promoter', async () => {
      const qb = createMockQueryBuilder([createSale()]);
      mockSaleRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getPromoterSales('promoter-1');

      expect(qb.where).toHaveBeenCalledWith('s.promoterId = :promoterId', {
        promoterId: 'promoter-1',
      });
      expect(qb.orderBy).toHaveBeenCalledWith('s.createdAt', 'DESC');
      expect(result).toHaveLength(1);
    });

    it('should apply date and type filters', async () => {
      const qb = createMockQueryBuilder([]);
      mockSaleRepo.createQueryBuilder.mockReturnValue(qb);
      const start = new Date('2026-03-01');
      const end = new Date('2026-03-31');

      await service.getPromoterSales('promoter-1', {
        startDate: start,
        endDate: end,
        saleType: 'entry',
        commissionStatus: 'pending',
      });

      expect(qb.andWhere).toHaveBeenCalledTimes(4);
    });
  });

  describe('approveCommissions', () => {
    it('should approve pending sales', async () => {
      const sales = [
        createSale({ id: 's1', commissionStatus: 'pending' }),
        createSale({ id: 's2', commissionStatus: 'pending' }),
      ];
      mockSaleRepo.findByIds.mockResolvedValue(sales);

      const result = await service.approveCommissions(['s1', 's2']);

      expect(mockSaleRepo.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ commissionStatus: 'approved' }),
        ]),
      );
      expect(result).toHaveLength(2);
    });

    it('should skip non-pending sales', async () => {
      const sales = [
        createSale({ id: 's1', commissionStatus: 'paid' }),
        createSale({ id: 's2', commissionStatus: 'pending' }),
      ];
      mockSaleRepo.findByIds.mockResolvedValue(sales);

      const result = await service.approveCommissions(['s1', 's2']);

      expect(result).toHaveLength(1);
    });

    it('should return empty array if no pending sales', async () => {
      mockSaleRepo.findByIds.mockResolvedValue([
        createSale({ commissionStatus: 'paid' }),
      ]);

      const result = await service.approveCommissions(['s1']);

      expect(result).toEqual([]);
      expect(mockSaleRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('processPayment', () => {
    it('should process payment for approved sales', async () => {
      const promoter = createPromoter({
        totalCommissionEarned: 100,
        pendingCommission: 50,
      });
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      const sales = [
        createSale({ id: 's1', commissionStatus: 'approved', commissionAmount: 25 }),
        createSale({ id: 's2', commissionStatus: 'approved', commissionAmount: 25 }),
      ];
      mockSaleRepo.findByIds.mockResolvedValue(sales);

      const result = await service.processPayment('promoter-1', {
        saleIds: ['s1', 's2'],
        paymentMethod: 'pix',
        processedBy: 'manager-1',
      });

      expect(mockPaymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50,
          paymentMethod: 'pix',
          status: 'completed',
          processedBy: 'manager-1',
          salesCount: 2,
        }),
      );
      expect(mockPaymentRepo.save).toHaveBeenCalled();
      // Sales updated to paid
      expect(mockSaleRepo.save).toHaveBeenCalled();
      // Promoter stats updated
      expect(mockPromoterRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          totalCommissionEarned: 150,
          pendingCommission: 0,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if no approved sales', async () => {
      const promoter = createPromoter();
      mockPromoterRepo.findOne.mockResolvedValue(promoter);
      mockSaleRepo.findByIds.mockResolvedValue([
        createSale({ commissionStatus: 'pending' }),
      ]);

      await expect(
        service.processPayment('promoter-1', {
          saleIds: ['s1'],
          paymentMethod: 'pix',
          processedBy: 'manager-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should mark sales as paid with payment reference', async () => {
      const promoter = createPromoter();
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      const sale = createSale({ id: 's1', commissionStatus: 'approved', commissionAmount: 10 });
      mockSaleRepo.findByIds.mockResolvedValue([sale]);

      await service.processPayment('promoter-1', {
        saleIds: ['s1'],
        paymentMethod: 'cash',
        processedBy: 'manager-1',
      });

      expect(sale.commissionStatus).toBe('paid');
      expect(sale.paidAt).toBeDefined();
      expect(sale.paymentReference).toBeDefined();
    });
  });

  describe('getPromoterPayments', () => {
    it('should return payments ordered by createdAt DESC', async () => {
      const payments = [{ id: 'p1' }, { id: 'p2' }];
      mockPaymentRepo.find.mockResolvedValue(payments);

      const result = await service.getPromoterPayments('promoter-1');

      expect(mockPaymentRepo.find).toHaveBeenCalledWith({
        where: { promoterId: 'promoter-1' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('getPromoterDashboard', () => {
    it('should return dashboard with aggregated stats', async () => {
      const promoter = createPromoter();
      mockPromoterRepo.findOne.mockResolvedValue(promoter);

      const qb = createMockQueryBuilder({
        totalQuantity: '15',
        totalRevenue: '500.00',
        totalCommission: '50.00',
      });
      mockSaleRepo.createQueryBuilder.mockReturnValue(qb);
      mockSaleRepo.find.mockResolvedValue([createSale()]);
      mockPaymentRepo.find.mockResolvedValue([]);

      const result = await service.getPromoterDashboard('promoter-1');

      expect(result.promoter).toEqual(promoter);
      expect(result.currentMonthSales).toBe(15);
      expect(result.currentMonthRevenue).toBe(500);
      expect(result.currentMonthCommission).toBe(50);
      expect(result.pendingSales).toHaveLength(1);
      expect(result.recentPayments).toHaveLength(0);
    });
  });

  describe('getPromoterLeaderboard', () => {
    it('should return sorted leaderboard for restaurant', async () => {
      const promoters = [
        createPromoter({ id: 'p1', name: 'Alice' }),
        createPromoter({ id: 'p2', name: 'Bob' }),
      ];
      mockPromoterRepo.find.mockResolvedValue(promoters);

      const salesAgg = [
        { promoterId: 'p1', totalQuantity: '10', totalRevenue: '500' },
        { promoterId: 'p2', totalQuantity: '20', totalRevenue: '1000' },
      ];
      const qb = createMockQueryBuilder(salesAgg);
      mockSaleRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getPromoterLeaderboard('restaurant-1', 'month');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Bob'); // Higher sales, comes first
      expect(result[0].periodSales).toBe(20);
      expect(result[1].name).toBe('Alice');
      expect(result[1].periodSales).toBe(10);
    });

    it('should return empty array if no active promoters', async () => {
      mockPromoterRepo.find.mockResolvedValue([]);

      const result = await service.getPromoterLeaderboard('restaurant-1', 'all');

      expect(result).toEqual([]);
    });
  });
});
