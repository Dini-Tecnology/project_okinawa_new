import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyProgram } from './entities/loyalty-program.entity';
import { StampCard } from './entities/stamp-card.entity';
import { EventsGateway } from '@/modules/events/events.realtime';
import { BadRequestException } from '@nestjs/common';

describe('LoyaltyService', () => {
  let service: LoyaltyService;
  let loyaltyRepository: Repository<LoyaltyProgram>;
  let eventsGateway: EventsGateway;

  const mockLoyalty = {
    id: 'loyalty-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    points: 500,
    tier: 'silver',
    total_visits: 10,
    total_spent: 1000,
    lifetime_points: 1000,
    rewards_claimed: [],
    available_rewards: [],
    last_visit: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockLoyaltyRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[mockLoyalty], 1]),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(mockLoyalty),
      getMany: jest.fn().mockResolvedValue([mockLoyalty]),
      getRawOne: jest.fn().mockResolvedValue({
        totalMembers: '10',
        totalPoints: '5000',
        avgPoints: '500',
        total_spent: '10000',
        total_members: '10',
      }),
      getRawMany: jest.fn().mockResolvedValue([
        { tier: 'bronze', count: '5' },
        { tier: 'silver', count: '3' },
        { tier: 'gold', count: '2' },
      ]),
    }),
  };

  const mockEventsGateway = {
    notifyUser: jest.fn(),
    notifyRestaurant: jest.fn(),
  };

  const mockStampCardRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb({
      findOne: jest.fn().mockResolvedValue(mockLoyalty),
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
        findOne: jest.fn().mockResolvedValue(mockLoyalty),
        save: jest.fn().mockResolvedValue(mockLoyalty),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyService,
        {
          provide: getRepositoryToken(LoyaltyProgram),
          useValue: mockLoyaltyRepository,
        },
        {
          provide: getRepositoryToken(StampCard),
          useValue: mockStampCardRepository,
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

    service = module.get<LoyaltyService>(LoyaltyService);
    loyaltyRepository = module.get(getRepositoryToken(LoyaltyProgram));
    eventsGateway = module.get(EventsGateway);

    jest.clearAllMocks();
  });

  describe('getAllUserPrograms', () => {
    it('should return all loyalty programs for user', async () => {
      mockLoyaltyRepository.find.mockResolvedValue([mockLoyalty]);

      const result = await service.getAllUserPrograms('user-1');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(mockLoyaltyRepository.find).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        relations: ['restaurant'],
        order: { points: 'DESC' },
      });
    });
  });

  describe('getProfile', () => {
    it('should return existing loyalty profile', async () => {
      mockLoyaltyRepository.findOne.mockResolvedValue(mockLoyalty);

      const result = await service.getProfile('user-1', 'restaurant-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('loyalty-1');
    });

    it('should create new loyalty profile if not exists', async () => {
      mockLoyaltyRepository.findOne.mockResolvedValue(null);
      mockLoyaltyRepository.create.mockReturnValue(mockLoyalty);
      mockLoyaltyRepository.save.mockResolvedValue(mockLoyalty);

      const result = await service.getProfile('user-1', 'restaurant-1');

      expect(result).toBeDefined();
      expect(mockLoyaltyRepository.create).toHaveBeenCalled();
      expect(mockLoyaltyRepository.save).toHaveBeenCalled();
    });
  });

  describe('addPoints', () => {
    it('should add points successfully', async () => {
      const addDto = {
        points: 100,
        reason: 'Order payment',
      };

      mockLoyaltyRepository.findOne.mockResolvedValue(mockLoyalty);
      mockLoyaltyRepository.save.mockResolvedValue({
        ...mockLoyalty,
        points: 600,
        lifetime_points: 1100,
      });
      mockEventsGateway.notifyUser.mockResolvedValue(undefined);

      const result = await service.addPoints('user-1', 'restaurant-1', addDto as any);

      expect(result.points).toBe(600);
      expect(mockLoyaltyRepository.save).toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return loyalty history', async () => {
      mockLoyaltyRepository.findOne.mockResolvedValue(mockLoyalty);

      const result = await service.getHistory('user-1', 'restaurant-1');

      expect(result).toBeDefined();
    });
  });

  describe('redeemReward', () => {
    it('should redeem reward successfully', async () => {
      const redeemDto = {
        reward_id: 'reward_1',
      };

      mockLoyaltyRepository.findOne.mockResolvedValue(mockLoyalty);
      mockLoyaltyRepository.save.mockResolvedValue({
        ...mockLoyalty,
        points: 400,
      });

      const result = await service.redeemReward('user-1', 'restaurant-1', redeemDto as any);

      expect(result).toBeDefined();
      expect(mockLoyaltyRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if insufficient points', async () => {
      const redeemDto = {
        reward_id: 'reward_7', // Costs 1000 points
      };

      const lowPointsLoyalty = { ...mockLoyalty, points: 50 };
      mockLoyaltyRepository.findOne.mockResolvedValue(lowPointsLoyalty);

      await expect(
        service.redeemReward('user-1', 'restaurant-1', redeemDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAvailableRewards', () => {
    it('should return available rewards', async () => {
      mockLoyaltyRepository.findOne.mockResolvedValue(mockLoyalty);

      const result = await service.getAvailableRewards('user-1', 'restaurant-1');

      expect(result).toBeDefined();
      expect(result.user_points).toBeDefined();
      expect(Array.isArray(result.affordable_rewards)).toBe(true);
      expect(Array.isArray(result.upcoming_rewards)).toBe(true);
    });
  });

  describe('getHistory', () => {
    it('should return loyalty history', async () => {
      mockLoyaltyRepository.findOne.mockResolvedValue(mockLoyalty);

      const result = await service.getHistory('user-1', 'restaurant-1');

      expect(result).toBeDefined();
    });
  });

  describe('getLeaderboard', () => {
    it('should return top loyalty members', async () => {
      mockLoyaltyRepository.findAndCount.mockResolvedValue([[mockLoyalty], 1]);

      const result = await service.getLeaderboard('restaurant-1', 10);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(mockLoyaltyRepository.findAndCount).toHaveBeenCalled();
    });

    it('should default to 10 results if limit not provided', async () => {
      mockLoyaltyRepository.findAndCount.mockResolvedValue([[mockLoyalty], 1]);

      await service.getLeaderboard('restaurant-1');

      expect(mockLoyaltyRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        }),
      );
    });
  });

  describe('awardPointsFromOrder', () => {
    it('should award points based on order amount', async () => {
      mockLoyaltyRepository.findOne.mockResolvedValue(mockLoyalty);
      mockLoyaltyRepository.save.mockResolvedValue({
        ...mockLoyalty,
        points: 510, // 500 + 10 (100/10)
        total_visits: 11,
        total_spent: 1100,
      });
      mockEventsGateway.notifyUser.mockResolvedValue(undefined);

      const result = await service.awardPointsFromOrder('user-1', 'restaurant-1', 100, 'order-1');

      expect(result).toBeDefined();
      expect(result.points_earned).toBe(10);
      expect(mockEventsGateway.notifyUser).toHaveBeenCalled();
    });

    it('should return 0 points for small order amount', async () => {
      const result = await service.awardPointsFromOrder('user-1', 'restaurant-1', 5, 'order-1');

      expect(result.points_earned).toBe(0);
    });

    it('should notify tier upgrade when tier changes', async () => {
      const bronzeLoyalty = { ...mockLoyalty, points: 490, tier: 'bronze' };

      // Override the transaction mock to return bronzeLoyalty
      mockDataSource.transaction.mockImplementationOnce((cb) => cb({
        findOne: jest.fn().mockResolvedValue(bronzeLoyalty),
        create: jest.fn().mockReturnValue(bronzeLoyalty),
        save: jest.fn().mockResolvedValue(bronzeLoyalty),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        createQueryBuilder: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 1 }),
        }),
      }));
      mockEventsGateway.notifyUser.mockResolvedValue(undefined);

      const result = await service.awardPointsFromOrder('user-1', 'restaurant-1', 200, 'order-1');

      expect(result.tier_upgraded).toBe(true);
      // Should be called twice - once for points, once for tier upgrade
      expect(mockEventsGateway.notifyUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('getTiers', () => {
    it('should return all loyalty tiers', () => {
      const result = service.getTiers();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(4);
      expect(result.map(t => t.name)).toEqual(['bronze', 'silver', 'gold', 'platinum']);
    });
  });

  describe('getStatistics', () => {
    it('should return loyalty statistics for restaurant', async () => {
      // createQueryBuilder is already mocked with proper data in mockLoyaltyRepository
      const result = await service.getStatistics('restaurant-1');

      expect(result).toBeDefined();
      expect(result.total_members).toBe(10); // From mock: total_members: '10'
      expect(result.tier_distribution).toBeDefined();
      expect(result.averages).toBeDefined();
    });

    it('should handle empty restaurant', async () => {
      // Override createQueryBuilder mock for this test to return empty data
      mockLoyaltyRepository.createQueryBuilder.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total_members: '0',
          total_points_issued: '0',
          total_visits: '0',
          total_spent: '0',
        }),
        getRawMany: jest.fn().mockResolvedValue([]),
      }).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
        getRawMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getStatistics('restaurant-1');

      expect(result.total_members).toBe(0);
      expect(result.averages.points_per_member).toBe(0);
    });
  });

  describe('update', () => {
    it('should update loyalty program', async () => {
      const updateDto = {
        points: 750,
      };

      mockLoyaltyRepository.findOne.mockResolvedValue(mockLoyalty);
      mockLoyaltyRepository.save.mockResolvedValue({
        ...mockLoyalty,
        points: 750,
        tier: 'silver',
      });

      const result = await service.update('loyalty-1', updateDto as any);

      expect(result).toBeDefined();
      expect(result.points).toBe(750);
      expect(mockLoyaltyRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if loyalty program not found', async () => {
      mockLoyaltyRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow('Loyalty program not found');
    });

    it('should recalculate tier when points change', async () => {
      const updateDto = {
        points: 2500, // Gold tier
      };

      mockLoyaltyRepository.findOne.mockResolvedValue({ ...mockLoyalty, tier: 'bronze' });
      mockLoyaltyRepository.save.mockResolvedValue({
        ...mockLoyalty,
        points: 2500,
        tier: 'gold',
      });

      const result = await service.update('loyalty-1', updateDto as any);

      expect(result.tier).toBe('gold');
    });
  });

  describe('updateProfile', () => {
    it('should update loyalty profile by userId and restaurantId', async () => {
      const updateDto = {
        points: 600,
      };

      mockLoyaltyRepository.findOne.mockResolvedValue(mockLoyalty);
      mockLoyaltyRepository.save.mockResolvedValue({
        ...mockLoyalty,
        points: 600,
      });

      const result = await service.updateProfile('user-1', 'restaurant-1', updateDto as any);

      expect(result).toBeDefined();
      expect(mockLoyaltyRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockLoyaltyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile('user-1', 'restaurant-1', {}),
      ).rejects.toThrow('Loyalty profile not found');
    });
  });

  describe('redeemReward - additional cases', () => {
    it('should throw NotFoundException if reward not found', async () => {
      const redeemDto = {
        reward_id: 'nonexistent_reward',
      };

      mockLoyaltyRepository.findOne.mockResolvedValue(mockLoyalty);

      await expect(
        service.redeemReward('user-1', 'restaurant-1', redeemDto as any),
      ).rejects.toThrow('Reward not found');
    });
  });
});
