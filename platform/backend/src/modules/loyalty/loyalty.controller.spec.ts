import { Test, TestingModule } from '@nestjs/testing';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { CashbackService } from './cashback.service';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('LoyaltyController', () => {
  let controller: LoyaltyController;
  let service: LoyaltyService;

  const mockService = {
    getAllUserPrograms: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    addPoints: jest.fn(),
    getHistory: jest.fn(),
    getAvailableRewards: jest.fn(),
    redeemReward: jest.fn(),
    getTiers: jest.fn(),
    getLeaderboard: jest.fn(),
    getStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoyaltyController],
      providers: [
        { provide: LoyaltyService, useValue: mockService },
        { provide: CashbackService, useValue: { calculateCashback: jest.fn(), recordCashback: jest.fn() } },
      ],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LoyaltyController>(LoyaltyController);
    service = module.get<LoyaltyService>(LoyaltyService);
    jest.clearAllMocks();
  });

  it('should get my programs', async () => {
    const user = mockAuthenticatedUser({ id: 'user-1' });
    mockService.getAllUserPrograms.mockResolvedValue([{ id: 'prog-1', points: 500 }]);

    const result = await controller.getMyPrograms(user);

    expect(result).toBeDefined();
    expect(mockService.getAllUserPrograms).toHaveBeenCalledWith('user-1');
  });

  it('should get profile', async () => {
    const user = mockAuthenticatedUser({ id: 'user-1' });
    mockService.getProfile.mockResolvedValue({ points: 1000, tier: 'Gold' });

    const result = await controller.getProfile(user, 'restaurant-1');

    expect(result).toBeDefined();
    expect(mockService.getProfile).toHaveBeenCalledWith('user-1', 'restaurant-1');
  });

  it('should add points', async () => {
    const dto = { points: 100, reason: 'Purchase' };
    mockService.addPoints.mockResolvedValue({ new_balance: 1100 });

    const result = await controller.addPoints('user-1', 'restaurant-1', dto as any);

    expect(result).toBeDefined();
    expect(mockService.addPoints).toHaveBeenCalledWith('user-1', 'restaurant-1', dto);
  });

  it('should redeem reward', async () => {
    const user = mockAuthenticatedUser({ id: 'user-1' });
    const dto = { reward_id: 'reward-1' };
    mockService.redeemReward.mockResolvedValue({ success: true });

    const result = await controller.redeemReward(user, 'restaurant-1', dto as any);

    expect(result).toBeDefined();
    expect(mockService.redeemReward).toHaveBeenCalledWith('user-1', 'restaurant-1', dto);
  });

  it('should get leaderboard with pagination', async () => {
    mockService.getLeaderboard.mockResolvedValue({
      data: [{ rank: 1, user_name: 'User 1', points: 5000 }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    const result = await controller.getLeaderboard('restaurant-1', 1, 10);

    expect(result).toBeDefined();
    expect(mockService.getLeaderboard).toHaveBeenCalledWith('restaurant-1', 10, 1);
  });
});
