import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WaiterStatsService } from './waiter-stats.service';
import { Order } from './entities/order.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { ReservationsService } from '@/modules/reservations/reservations.service';
import { TablesService } from '@/modules/tables/tables.service';
import { WaiterStatsHelper, MaitreFormatterHelper } from './helpers';
import { OrderStatus } from '@common/enums';

describe('WaiterStatsService', () => {
  let service: WaiterStatsService;

  const mockOrderRepository = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTableRepository = {
    count: jest.fn(),
  };

  const mockProfileRepository = {
    find: jest.fn(),
  };

  const mockReservationsService = {
    findByRestaurant: jest.fn(),
  };

  const mockTablesService = {
    findAll: jest.fn(),
  };

  const mockWaiterStatsHelper = {
    getActiveStatuses: jest.fn().mockReturnValue([
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
    ]),
    groupOrdersByTable: jest.fn(),
    parseDateRange: jest.fn(),
    calculateStatistics: jest.fn(),
  };

  const mockMaitreFormatter = {
    buildOverview: jest.fn(),
  };

  const mockOrder = {
    id: 'order-001',
    waiter_id: 'waiter-1',
    status: OrderStatus.PENDING,
    table: { id: 'table-1', table_number: 'T1', section: 'Main' },
    items: [{ id: 'item-1', quantity: 2 }],
    guests: [],
    created_at: new Date('2024-01-15T12:00:00Z'),
    total_amount: 120.5,
  };

  const mockWaiterTable = {
    table_id: 'table-1',
    table_number: 'T1',
    section: 'Main',
    guest_count: 2,
    orders: [mockOrder],
    total: 120.5,
  };

  const mockWaiterStats = {
    total_orders: 8,
    total_sales: 960.0,
    total_tips: 96.0,
    average_order_value: 120.0,
    tables_assigned: 3,
  };

  const mockMaitreOverview = {
    pending_reservations: 2,
    active_tables: 5,
    available_tables: 3,
    total_covers: 12,
    waiters: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaiterStatsService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: getRepositoryToken(RestaurantTable), useValue: mockTableRepository },
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepository },
        { provide: ReservationsService, useValue: mockReservationsService },
        { provide: TablesService, useValue: mockTablesService },
        { provide: WaiterStatsHelper, useValue: mockWaiterStatsHelper },
        { provide: MaitreFormatterHelper, useValue: mockMaitreFormatter },
      ],
    }).compile();

    service = module.get<WaiterStatsService>(WaiterStatsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── getWaiterTables ──────────────────────────────────────────────────────

  describe('getWaiterTables', () => {
    it('should return grouped tables for a waiter', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);
      mockWaiterStatsHelper.groupOrdersByTable.mockReturnValue([mockWaiterTable]);

      const result = await service.getWaiterTables('waiter-1');

      expect(mockOrderRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ waiter_id: 'waiter-1' }),
          relations: expect.arrayContaining(['table', 'items']),
        }),
      );
      expect(result).toEqual([mockWaiterTable]);
    });

    it('should return empty array when waiter has no active orders', async () => {
      mockOrderRepository.find.mockResolvedValue([]);
      mockWaiterStatsHelper.groupOrdersByTable.mockReturnValue([]);

      const result = await service.getWaiterTables('waiter-no-orders');

      expect(result).toEqual([]);
    });

    it('should filter by active statuses from helper', async () => {
      mockOrderRepository.find.mockResolvedValue([]);
      mockWaiterStatsHelper.groupOrdersByTable.mockReturnValue([]);

      await service.getWaiterTables('waiter-1');

      expect(mockWaiterStatsHelper.getActiveStatuses).toHaveBeenCalled();
      expect(mockOrderRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: expect.anything(),
          }),
        }),
      );
    });
  });

  // ── getWaiterStats ───────────────────────────────────────────────────────

  describe('getWaiterStats', () => {
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-01-31T23:59:59Z');

    const mockQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockOrder]),
    };

    beforeEach(() => {
      mockWaiterStatsHelper.parseDateRange.mockReturnValue({ startDate: start, endDate: end });
      mockOrderRepository.createQueryBuilder.mockReturnValue(mockQb);
      mockTableRepository.count.mockResolvedValue(3);
      mockWaiterStatsHelper.calculateStatistics.mockReturnValue(mockWaiterStats);
    });

    it('should return calculated statistics for a waiter', async () => {
      const result = await service.getWaiterStats('waiter-1', {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });

      expect(mockWaiterStatsHelper.parseDateRange).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(mockWaiterStatsHelper.calculateStatistics).toHaveBeenCalledWith(
        expect.any(Array),
        3,
      );
      expect(result).toEqual(mockWaiterStats);
    });

    it('should filter orders by waiter_id in query', async () => {
      await service.getWaiterStats('waiter-1', {});

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'order.waiter_id = :waiterId',
        { waiterId: 'waiter-1' },
      );
    });

    it('should count tables assigned to the waiter', async () => {
      await service.getWaiterStats('waiter-1', {});

      expect(mockTableRepository.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ assigned_waiter_id: 'waiter-1' }),
        }),
      );
    });

    it('should work with no date params (uses helper defaults)', async () => {
      mockWaiterStatsHelper.parseDateRange.mockReturnValue({ startDate: start, endDate: end });

      const result = await service.getWaiterStats('waiter-1', {});

      expect(mockWaiterStatsHelper.parseDateRange).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toBeDefined();
    });
  });

  // ── getMaitreOverview ────────────────────────────────────────────────────

  describe('getMaitreOverview', () => {
    const mockReservations = [{ id: 'res-1', status: 'pending' }];
    const mockTables = [
      { id: 'table-1', assigned_waiter_id: 'waiter-1', status: 'occupied' },
      { id: 'table-2', assigned_waiter_id: null, status: 'available' },
    ];
    const mockWaiterProfiles = [{ id: 'waiter-1', full_name: 'Carlos Mendes' }];

    beforeEach(() => {
      mockReservationsService.findByRestaurant.mockResolvedValue({
        items: mockReservations,
        total: 1,
      });
      mockTablesService.findAll.mockResolvedValue({
        items: mockTables,
        total: 2,
      });
      mockProfileRepository.find.mockResolvedValue(mockWaiterProfiles);
      mockMaitreFormatter.buildOverview.mockReturnValue(mockMaitreOverview);
    });

    it('should build a complete maitre overview', async () => {
      const result = await service.getMaitreOverview('restaurant-1');

      expect(mockReservationsService.findByRestaurant).toHaveBeenCalledWith(
        'restaurant-1',
        expect.anything(),
      );
      expect(mockTablesService.findAll).toHaveBeenCalledWith(
        'restaurant-1',
        expect.anything(),
      );
      expect(result).toEqual(mockMaitreOverview);
    });

    it('should resolve waiter profiles for tables with assigned_waiter_id', async () => {
      await service.getMaitreOverview('restaurant-1');

      expect(mockProfileRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: expect.anything() }),
          select: ['id', 'full_name'],
        }),
      );
    });

    it('should skip profile lookup when no tables have assigned waiters', async () => {
      mockTablesService.findAll.mockResolvedValue({
        items: [{ id: 'table-1', assigned_waiter_id: null, status: 'available' }],
        total: 1,
      });

      await service.getMaitreOverview('restaurant-1');

      expect(mockProfileRepository.find).not.toHaveBeenCalled();
    });

    it('should pass waiter map to formatter', async () => {
      await service.getMaitreOverview('restaurant-1');

      expect(mockMaitreFormatter.buildOverview).toHaveBeenCalledWith(
        mockReservations,
        mockTables,
        expect.any(Map),
      );
    });
  });
});
