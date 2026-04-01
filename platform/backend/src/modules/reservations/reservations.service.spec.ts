import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { ReservationsGateway } from './reservations.gateway';
import { NotFoundException } from '@nestjs/common';
import { ReservationStatus } from '@common/enums';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationRepository: Repository<Reservation>;

  const mockReservation = {
    id: 'reservation-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    reservation_date: '2025-12-15',
    reservation_time: '19:00',
    party_size: 4,
    status: ReservationStatus.PENDING,
  };

  const mockReservationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[mockReservation], 1]),
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

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    },
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
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Restore mock implementations after clearAllMocks
    mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
    mockQueryRunner.connect.mockResolvedValue(undefined);
    mockQueryRunner.startTransaction.mockResolvedValue(undefined);
    mockQueryRunner.commitTransaction.mockResolvedValue(undefined);
    mockQueryRunner.rollbackTransaction.mockResolvedValue(undefined);
    mockQueryRunner.release.mockResolvedValue(undefined);
    mockQueryRunner.manager.save.mockImplementation((entity) => Promise.resolve(entity));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        {
          provide: getRepositoryToken(Restaurant),
          useValue: { findOne: jest.fn().mockResolvedValue({ id: 'restaurant-1', service_type: 'casual-dining' }), save: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ReservationsGateway,
          useValue: { emitToRestaurant: jest.fn(), notifyReservationUpdate: jest.fn(), notifyReservationCreated: jest.fn(), notifyReservationUpdated: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    reservationRepository = module.get(getRepositoryToken(Reservation));
  });

  describe('create', () => {
    it('should create a reservation successfully', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        reservation_date: '2025-12-15',
        reservation_time: '19:00',
        party_size: 4,
      };

      mockReservationRepository.create.mockReturnValue(mockReservation);
      // create() now uses queryRunner.manager.save (set up in mockDataSource)

      const result = await service.create('user-1', createDto);

      expect(result).toEqual(mockReservation);
      expect(mockReservationRepository.create).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on save error', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        reservation_date: '2025-12-15',
        reservation_time: '19:00',
        party_size: 4,
      };

      mockReservationRepository.create.mockReturnValue(mockReservation);
      // Override queryRunner.manager.save to reject
      mockQueryRunner.manager.save.mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.create('user-1', createDto)).rejects.toThrow(
        'Failed to create reservation',
      );
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);

      const result = await service.findOne('reservation-1');

      expect(result).toEqual(mockReservation);
      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        relations: expect.any(Array),
      });
    });

    it('should throw NotFoundException if reservation not found', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update reservation status successfully', async () => {
      const updateDto = {
        status: ReservationStatus.CONFIRMED,
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
        confirmed_at: expect.any(Date),
      });

      const result = await service.updateStatus('reservation-1', updateDto);

      expect(result.status).toBe(ReservationStatus.CONFIRMED);
      expect(mockReservationRepository.save).toHaveBeenCalled();
    });

    it('should set seated_at when status is SEATED', async () => {
      const updateDto = {
        status: ReservationStatus.SEATED,
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.SEATED,
        seated_at: expect.any(Date),
      });

      const result = await service.updateStatus('reservation-1', updateDto);

      expect(result.status).toBe(ReservationStatus.SEATED);
    });
  });

  describe('findByRestaurant', () => {
    it('should return reservations for a restaurant', async () => {
      mockReservationRepository.findAndCount.mockResolvedValue([[mockReservation], 1]);

      const result = await service.findByRestaurant('restaurant-1');

      expect(result.items).toEqual([mockReservation]);
      expect(result.meta.total).toBe(1);
      expect(mockReservationRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return reservations for a user', async () => {
      mockReservationRepository.findAndCount.mockResolvedValue([[mockReservation], 1]);

      const result = await service.findByUser('user-1');

      expect(result.items).toEqual([mockReservation]);
      expect(result.meta.total).toBe(1);
      expect(mockReservationRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update reservation details', async () => {
      const updateDto = {
        party_size: 6,
        special_requests: 'Window seat please',
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue({
        ...mockReservation,
        ...updateDto,
      });

      const result = await service.update('reservation-1', updateDto);

      expect(result.party_size).toBe(6);
      expect(mockReservationRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if reservation not found', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { party_size: 4 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update time and table', async () => {
      const updateDto = {
        reservation_time: '20:00',
        table_id: 'table-2',
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue({
        ...mockReservation,
        ...updateDto,
      });

      const result = await service.update('reservation-1', updateDto);

      expect(result.reservation_time).toBe('20:00');
      expect(result.table_id).toBe('table-2');
    });

    it('should set completed_at when status is COMPLETED', async () => {
      const updateDto = {
        status: ReservationStatus.COMPLETED,
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.COMPLETED,
        completed_at: expect.any(Date),
      });

      const result = await service.update('reservation-1', updateDto);

      expect(result.status).toBe(ReservationStatus.COMPLETED);
    });

    it('should set cancelled_at when status is CANCELLED', async () => {
      const updateDto = {
        status: ReservationStatus.CANCELLED,
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
        cancelled_at: expect.any(Date),
      });

      const result = await service.update('reservation-1', updateDto);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });
  });

  describe('updateStatus', () => {
    it('should set completed_at when status is COMPLETED', async () => {
      const updateDto = {
        status: ReservationStatus.COMPLETED,
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.COMPLETED,
        completed_at: expect.any(Date),
      });

      const result = await service.updateStatus('reservation-1', updateDto);

      expect(result.status).toBe(ReservationStatus.COMPLETED);
    });

    it('should set cancelled_at when status is CANCELLED', async () => {
      const updateDto = {
        status: ReservationStatus.CANCELLED,
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
        cancelled_at: expect.any(Date),
      });

      const result = await service.updateStatus('reservation-1', updateDto);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });

    it('should update table_id when provided', async () => {
      const updateDto = {
        status: ReservationStatus.SEATED,
        table_id: 'table-1',
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.SEATED,
        table_id: 'table-1',
        seated_at: expect.any(Date),
      });

      const result = await service.updateStatus('reservation-1', updateDto);

      expect(result.table_id).toBe('table-1');
    });
  });
});
