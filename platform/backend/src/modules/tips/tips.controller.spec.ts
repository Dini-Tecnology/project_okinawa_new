import { Test, TestingModule } from '@nestjs/testing';
import { TipsController } from './tips.controller';
import { TipsService } from './tips.service';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('TipsController', () => {
  let controller: TipsController;
  const mockService = {
    create: jest.fn(),
    update: jest.fn(),
    getSummary: jest.fn(),
    getTransactions: jest.fn(),
    distributePending: jest.fn(),
    findByStaff: jest.fn(),
    findByOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipsController],
      providers: [{ provide: TipsService, useValue: mockService }],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TipsController>(TipsController);
    jest.clearAllMocks();
  });

  it('should create a tip', async () => {
    mockService.create.mockResolvedValue({ id: 'tip-1' });
    const result = await controller.create(mockAuthenticatedUser({ id: 'user-1' }), { amount: 10 } as any);
    expect(result).toBeDefined();
  });

  it('should get summary', async () => {
    mockService.getSummary.mockResolvedValue({ total: 500 });
    const result = await controller.getSummary('restaurant-1');
    expect(result).toBeDefined();
  });

  it('should get staff tips', async () => {
    mockService.findByStaff.mockResolvedValue([{ id: 'tip-1' }]);
    const mockUser = mockAuthenticatedUser({ id: 'staff-1', roles: ['waiter'] });
    const result = await controller.getStaffTips(mockUser, 'staff-1');
    expect(result).toBeDefined();
  });
});
