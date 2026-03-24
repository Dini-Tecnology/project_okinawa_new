import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let reservationsService: ReservationsService;

  const mockReservationsService = {
    create: jest.fn(),
    findByRestaurant: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockReservation = {
    id: 'reservation-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    reservation_date: new Date(),
    party_size: 4,
    status: 'pending',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [{ provide: ReservationsService, useValue: mockReservationsService }],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    reservationsService = module.get<ReservationsService>(ReservationsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new reservation', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const createDto: CreateReservationDto = {
        restaurant_id: 'restaurant-1',
        reservation_date: new Date(),
        party_size: 4,
      } as any;

      mockReservationsService.create.mockResolvedValue(mockReservation);

      const result = await controller.create(user, createDto);

      expect(result).toEqual(mockReservation);
      expect(mockReservationsService.create).toHaveBeenCalledWith('user-1', createDto);
    });
  });

  describe('findByRestaurant', () => {
    it('should get reservations by restaurant', async () => {
      const restaurantId = 'restaurant-1';
      const reservations = [mockReservation];
      const pagination = { page: 1, limit: 10 };

      mockReservationsService.findByRestaurant.mockResolvedValue(reservations);

      const result = await controller.findByRestaurant(restaurantId, pagination as any);

      expect(result).toEqual(reservations);
      expect(mockReservationsService.findByRestaurant).toHaveBeenCalledWith(restaurantId, pagination);
    });
  });

  describe('findByUser', () => {
    it('should get reservations by current user', async () => {
      const user = mockAuthenticatedUser({ id: 'user-1' });
      const reservations = [mockReservation];
      const pagination = { page: 1, limit: 10 };

      mockReservationsService.findByUser.mockResolvedValue(reservations);

      const result = await controller.findByUser(user, pagination as any);

      expect(result).toEqual(reservations);
      expect(mockReservationsService.findByUser).toHaveBeenCalledWith('user-1', pagination);
    });
  });

  describe('findOne', () => {
    it('should get reservation by id', async () => {
      mockReservationsService.findOne.mockResolvedValue(mockReservation);
      const mockUser = mockAuthenticatedUser({ id: 'user-1', roles: ['customer'] });

      const result = await controller.findOne('reservation-1', mockUser);

      expect(result).toEqual(mockReservation);
      expect(mockReservationsService.findOne).toHaveBeenCalledWith('reservation-1', 'user-1', ['customer']);
    });
  });

  describe('update', () => {
    it('should update reservation', async () => {
      const updateDto: UpdateReservationDto = {
        party_size: 6,
      } as any;
      const mockUser = mockAuthenticatedUser({ id: 'user-1', roles: ['customer'] });

      const updatedReservation = { ...mockReservation, party_size: 6 };
      mockReservationsService.update.mockResolvedValue(updatedReservation);

      const result = await controller.update('reservation-1', updateDto, mockUser);

      expect(result).toEqual(updatedReservation);
      expect(mockReservationsService.update).toHaveBeenCalledWith('reservation-1', updateDto, 'user-1', ['customer']);
    });
  });

  describe('updateStatus', () => {
    it('should update reservation status', async () => {
      const statusDto: UpdateReservationStatusDto = {
        status: 'confirmed',
      } as any;

      const updatedReservation = { ...mockReservation, status: 'confirmed' };
      mockReservationsService.updateStatus.mockResolvedValue(updatedReservation);

      const result = await controller.updateStatus('reservation-1', statusDto);

      expect(result).toEqual(updatedReservation);
      expect(mockReservationsService.updateStatus).toHaveBeenCalledWith('reservation-1', statusDto);
    });
  });
});
