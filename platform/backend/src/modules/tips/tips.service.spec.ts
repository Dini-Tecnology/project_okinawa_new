import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TipsService } from './tips.service';
import { Tip } from './entities/tip.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { EventsGateway } from '@/modules/events/events.gateway';
import { NotFoundException } from '@nestjs/common';

describe('TipsService', () => {
  let service: TipsService;
  let tipRepository: Repository<Tip>;
  let profileRepository: Repository<Profile>;
  let eventsGateway: EventsGateway;

  const mockTip = {
    id: 'tip-1',
    customer_id: 'customer-1',
    restaurant_id: 'restaurant-1',
    staff_id: 'staff-1',
    order_id: 'order-1',
    amount: 50,
    status: 'pending',
    distributed_at: null,
    distribution_details: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockProfile = {
    id: 'customer-1',
    full_name: 'John Doe',
    email: 'john@example.com',
  };

  const mockTipRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getRawOne: jest.fn().mockResolvedValue({}),
      getRawMany: jest.fn().mockResolvedValue([]),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    }),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getRawOne: jest.fn().mockResolvedValue({}),
      getRawMany: jest.fn().mockResolvedValue([]),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    }),
  };

  const mockEventsGateway = {
    notifyUser: jest.fn(),
    notifyRestaurant: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb({
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      }),
    })),
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipsService,
        {
          provide: getRepositoryToken(Tip),
          useValue: mockTipRepository,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TipsService>(TipsService);
    tipRepository = module.get(getRepositoryToken(Tip));
    profileRepository = module.get(getRepositoryToken(Profile));
    eventsGateway = module.get(EventsGateway);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a tip and notify restaurant', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        staff_id: 'staff-1',
        order_id: 'order-1',
        amount: 50,
      };

      mockTipRepository.create.mockReturnValue(mockTip);
      mockTipRepository.save.mockResolvedValue(mockTip);
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.create('customer-1', createDto as any);

      expect(result).toBeDefined();
      expect(mockTipRepository.create).toHaveBeenCalledWith({
        ...createDto,
        customer_id: 'customer-1',
        status: 'pending',
      });
      expect(mockEventsGateway.notifyRestaurant).toHaveBeenCalledWith(
        'restaurant-1',
        expect.objectContaining({
          type: 'tip:created',
          customer_name: 'John Doe',
        }),
      );
    });

    it('should notify staff if direct tip', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        staff_id: 'staff-1',
        order_id: 'order-1',
        amount: 50,
      };

      mockTipRepository.create.mockReturnValue(mockTip);
      mockTipRepository.save.mockResolvedValue(mockTip);
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      await service.create('customer-1', createDto as any);

      expect(mockEventsGateway.notifyUser).toHaveBeenCalledWith(
        'staff-1',
        expect.objectContaining({
          type: 'tip:received',
        }),
      );
    });

    it('should use default customer name if profile not found', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        order_id: 'order-1',
        amount: 50,
      };

      mockTipRepository.create.mockReturnValue(mockTip);
      mockTipRepository.save.mockResolvedValue(mockTip);
      mockProfileRepository.findOne.mockResolvedValue(null);

      await service.create('customer-1', createDto as any);

      expect(mockEventsGateway.notifyRestaurant).toHaveBeenCalledWith(
        'restaurant-1',
        expect.objectContaining({
          customer_name: 'Customer',
        }),
      );
    });
  });

  describe('getSummary', () => {
    it('should return tip summary for restaurant', async () => {
      const tips = [
        { ...mockTip, amount: 50, status: 'pending', staff_id: 'staff-1', staff: mockProfile },
        { ...mockTip, amount: 30, status: 'distributed', staff_id: 'staff-1', staff: mockProfile },
        { ...mockTip, amount: 20, status: 'pending', staff_id: 'staff-2', staff: { ...mockProfile, id: 'staff-2' } },
      ];

      mockTipRepository.find.mockResolvedValue(tips);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await service.getSummary('restaurant-1', startDate, endDate);

      expect(result.total_tips).toBe(100);
      expect(result.tips_count).toBe(3);
      expect(result.average_tip).toBe(100 / 3);
      expect(result.pending_distribution).toBe(70);
      expect(result.staff_tips).toHaveLength(2);
    });
  });

  describe('getTransactions', () => {
    it('should return tip transactions for restaurant', async () => {
      mockTipRepository.findAndCount.mockResolvedValue([[mockTip], 1]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await service.getTransactions('restaurant-1', startDate, endDate);

      expect(result.data).toEqual([mockTip]);
      expect(result.meta.total).toBe(1);
      expect(mockTipRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          restaurant_id: 'restaurant-1',
          created_at: expect.anything(),
        },
        relations: ['customer', 'staff'],
        order: { created_at: 'DESC' },
        take: 20,
        skip: 0,
      });
    });
  });

  describe('distributePending', () => {
    it('should distribute pending tips to staff', async () => {
      const pendingTips = [
        { ...mockTip, amount: 100 },
        { ...mockTip, id: 'tip-2', amount: 50 },
      ];

      const distributeDto = {
        staff_ids: ['staff-1', 'staff-2'],
        distribution_method: { method: 'equal_split', staff_count: 2 },
      };

      mockTipRepository.find.mockResolvedValue(pendingTips);
      mockTipRepository.save.mockResolvedValue({ ...mockTip, status: 'distributed' });

      const result = await service.distributePending('restaurant-1', distributeDto as any);

      expect(result.distributed_count).toBe(2);
      expect(result.total_amount).toBe(150);
      expect(mockTipRepository.save).toHaveBeenCalledTimes(2);
      expect(mockEventsGateway.notifyUser).toHaveBeenCalledTimes(4); // 2 tips x 2 staff
      expect(mockEventsGateway.notifyRestaurant).toHaveBeenCalled();
    });
  });

  describe('findByStaff', () => {
    it('should return tips for staff member', async () => {
      mockTipRepository.find.mockResolvedValue([mockTip]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await service.findByStaff('staff-1', startDate, endDate);

      expect(result).toEqual([mockTip]);
      expect(mockTipRepository.find).toHaveBeenCalledWith({
        where: {
          staff_id: 'staff-1',
          created_at: expect.anything(),
        },
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('findByOrder', () => {
    it('should return tip for order', async () => {
      mockTipRepository.findOne.mockResolvedValue(mockTip);

      const result = await service.findByOrder('order-1');

      expect(result).toEqual(mockTip);
      expect(mockTipRepository.findOne).toHaveBeenCalledWith({
        where: { order_id: 'order-1' },
        relations: ['customer', 'staff'],
      });
    });
  });

  describe('update', () => {
    it('should update tip status', async () => {
      mockTipRepository.findOne.mockResolvedValue(mockTip);
      mockTipRepository.save.mockResolvedValue({
        ...mockTip,
        status: 'distributed',
      });

      const result = await service.update('tip-1', { status: 'distributed' } as any);

      expect(result.status).toBe('distributed');
      expect(mockTipRepository.save).toHaveBeenCalled();
    });

    it('should update distributed_at', async () => {
      const now = new Date();
      mockTipRepository.findOne.mockResolvedValue(mockTip);
      mockTipRepository.save.mockResolvedValue({
        ...mockTip,
        distributed_at: now,
      });

      const result = await service.update('tip-1', { distributed_at: now.toISOString() } as any);

      expect(result.distributed_at).toBeDefined();
    });

    it('should update distribution_details', async () => {
      const details = { method: 'equal_split', staff_count: 3 };
      mockTipRepository.findOne.mockResolvedValue(mockTip);
      mockTipRepository.save.mockResolvedValue({
        ...mockTip,
        distribution_details: details,
      });

      const result = await service.update('tip-1', {
        distribution_details: JSON.stringify(details),
      } as any);

      expect(result.distribution_details).toBeDefined();
    });

    it('should add notes to distribution_details', async () => {
      mockTipRepository.findOne.mockResolvedValue(mockTip);
      mockTipRepository.save.mockResolvedValue({
        ...mockTip,
        distribution_details: { notes: 'Test note' },
      });

      const result = await service.update('tip-1', { notes: 'Test note' } as any);

      expect(result.distribution_details).toEqual({ notes: 'Test note' });
    });

    it('should throw NotFoundException if tip not found', async () => {
      mockTipRepository.findOne.mockResolvedValue(null);

      await expect(service.update('tip-1', { status: 'distributed' } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
