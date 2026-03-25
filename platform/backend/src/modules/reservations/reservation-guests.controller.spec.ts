import { Test, TestingModule } from '@nestjs/testing';
import { ReservationGuestsController } from './reservation-guests.controller';
import { ReservationGuestsService } from './reservation-guests.service';

describe('ReservationGuestsController', () => {
  let controller: ReservationGuestsController;
  const mockService = {
    inviteGuest: jest.fn(),
    respondToInvite: jest.fn(),
    getGuestsByReservation: jest.fn(),
    removeGuest: jest.fn(),
    markGuestArrived: jest.fn(),
    getPendingInvites: jest.fn(),
    validateInviteToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationGuestsController],
      providers: [{ provide: ReservationGuestsService, useValue: mockService }],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReservationGuestsController>(ReservationGuestsController);
    jest.clearAllMocks();
  });

  it('should invite a guest', async () => {
    mockService.inviteGuest.mockResolvedValue({ id: 'guest-1' });
    const result = await controller.inviteGuest('reservation-1', {} as any, { user: { sub: 'user-1' } } as any);
    expect(result).toBeDefined();
  });

  it('should get guests', async () => {
    mockService.getGuestsByReservation.mockResolvedValue([{ id: 'guest-1' }]);
    const result = await controller.getGuests('reservation-1');
    expect(result).toBeDefined();
  });

  it('should get my pending invites', async () => {
    mockService.getPendingInvites.mockResolvedValue([{ id: 'invite-1' }]);
    const result = await controller.getMyPendingInvites({ user: { sub: 'user-1' } } as any);
    expect(result).toBeDefined();
  });
});
