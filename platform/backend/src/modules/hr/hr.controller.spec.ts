import { Test, TestingModule } from '@nestjs/testing';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('HrController', () => {
  let controller: HrController;
  const mockService = {
    checkIn: jest.fn(),
    checkOut: jest.fn(),
    getAttendance: jest.fn(),
    createLeaveRequest: jest.fn(),
    updateLeaveRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrController],
      providers: [{ provide: HrService, useValue: mockService }],
    }).overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard).useValue({ canActivate: () => true }).overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<HrController>(HrController);
    jest.clearAllMocks();
  });

  it('should check in', async () => {
    mockService.checkIn.mockResolvedValue({ id: 'attendance-1' });
    const result = await controller.checkIn(mockAuthenticatedUser({ id: 'user-1' }), {} as any);
    expect(result).toBeDefined();
  });
});
