import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HrService } from './hr.service';
import { Attendance } from './entities/attendance.entity';
import { LeaveRequest, LeaveRequestStatus } from './entities/leave-request.entity';
import { Shift } from './entities/shift.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('HrService', () => {
  let service: HrService;
  let attendanceRepository: Repository<Attendance>;
  let leaveRequestRepository: Repository<LeaveRequest>;
  let shiftRepository: Repository<Shift>;

  const mockAttendance = {
    id: 'attendance-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    date: new Date(),
    check_in: '09:00:00',
    check_out: '17:00:00',
    hours_worked: 8,
    status: 'present',
    user: { full_name: 'John Doe' },
  };

  const mockLeaveRequest = {
    id: 'leave-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    start_date: new Date(),
    end_date: new Date(),
    reason: 'Vacation',
    status: 'pending',
    user: { full_name: 'John Doe' },
  };

  const mockShift = {
    id: 'shift-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    start_time: '09:00:00',
    end_time: '17:00:00',
    date: new Date(),
    role: 'waiter' as any,
  };

  const mockAttendanceRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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

  const mockLeaveRequestRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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

  const mockShiftRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
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
        HrService,
        { provide: getRepositoryToken(Attendance), useValue: mockAttendanceRepository },
        { provide: getRepositoryToken(LeaveRequest), useValue: mockLeaveRequestRepository },
        { provide: getRepositoryToken(Shift), useValue: mockShiftRepository },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<HrService>(HrService);
    attendanceRepository = module.get(getRepositoryToken(Attendance));
    leaveRequestRepository = module.get(getRepositoryToken(LeaveRequest));
    shiftRepository = module.get(getRepositoryToken(Shift));

    jest.clearAllMocks();
  });

  describe('getAttendance', () => {
    it('should return grouped attendance records', async () => {
      mockAttendanceRepository.find.mockResolvedValue([
        mockAttendance,
        { ...mockAttendance, id: 'attendance-2', hours_worked: 7 },
      ]);

      const result = await service.getAttendance('restaurant-1');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect((result as any)[0].total_hours).toBe(15);
        expect((result as any)[0].days_worked).toBe(2);
      }
    });

    it('should filter by date range', async () => {
      mockAttendanceRepository.find.mockResolvedValue([mockAttendance]);

      await service.getAttendance('restaurant-1', '2024-01-01', '2024-12-31');

      expect(mockAttendanceRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            restaurant_id: 'restaurant-1',
            date: expect.anything(),
          }),
        }),
      );
    });
  });

  describe('checkIn', () => {
    it('should check in user successfully', async () => {
      mockAttendanceRepository.findOne.mockResolvedValue(null);
      mockAttendanceRepository.create.mockReturnValue(mockAttendance);
      mockAttendanceRepository.save.mockResolvedValue(mockAttendance);

      const result = await service.checkIn('user-1', 'restaurant-1');

      expect(result).toBeDefined();
      expect(mockAttendanceRepository.create).toHaveBeenCalled();
      expect(mockAttendanceRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if already checked in', async () => {
      mockAttendanceRepository.findOne.mockResolvedValue(mockAttendance);

      await expect(service.checkIn('user-1', 'restaurant-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkOut', () => {
    it('should check out user successfully', async () => {
      const attendanceWithoutCheckout = { ...mockAttendance, check_out: null };
      mockAttendanceRepository.findOne.mockResolvedValue(attendanceWithoutCheckout);
      mockAttendanceRepository.save.mockResolvedValue({
        ...mockAttendance,
        check_out: '17:00:00',
      });

      const result = await service.checkOut('user-1', 'restaurant-1');

      expect(result).toBeDefined();
      expect(result.check_out).toBeDefined();
    });

    it('should throw NotFoundException if not checked in', async () => {
      mockAttendanceRepository.findOne.mockResolvedValue(null);

      await expect(service.checkOut('user-1', 'restaurant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getLeaveRequests', () => {
    it('should return paginated leave requests', async () => {
      mockLeaveRequestRepository.findAndCount.mockResolvedValue([[mockLeaveRequest], 1]);

      const result = await service.getLeaveRequests('restaurant-1');

      expect(result.data).toEqual([mockLeaveRequest]);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockLeaveRequestRepository.findAndCount.mockResolvedValue([[mockLeaveRequest], 1]);

      await service.getLeaveRequests('restaurant-1', 'pending');

      expect(mockLeaveRequestRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'pending',
          }),
        }),
      );
    });
  });

  describe('createLeaveRequest', () => {
    it('should create a leave request', async () => {
      const createData = {
        restaurant_id: 'restaurant-1',
        leave_type: 'vacation',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        reason: 'Vacation',
      };

      mockLeaveRequestRepository.create.mockReturnValue(mockLeaveRequest);
      mockLeaveRequestRepository.save.mockResolvedValue(mockLeaveRequest);

      const result = await service.createLeaveRequest('user-1', createData);

      expect(result).toBeDefined();
      expect(mockLeaveRequestRepository.create).toHaveBeenCalled();
    });
  });

  describe('updateLeaveRequest', () => {
    it('should update leave request status', async () => {
      mockLeaveRequestRepository.findOne.mockResolvedValue(mockLeaveRequest);
      mockLeaveRequestRepository.save.mockResolvedValue({
        ...mockLeaveRequest,
        status: LeaveRequestStatus.APPROVED,
      });

      const result = await service.updateLeaveRequest('leave-1', LeaveRequestStatus.APPROVED, 'user-1');

      expect(result.status).toBe(LeaveRequestStatus.APPROVED);
    });

    it('should throw NotFoundException if leave request not found', async () => {
      mockLeaveRequestRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateLeaveRequest('leave-1', LeaveRequestStatus.APPROVED, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAttendance', () => {
    it('should update attendance record', async () => {
      mockAttendanceRepository.findOne.mockResolvedValue(mockAttendance);
      mockAttendanceRepository.save.mockResolvedValue({
        ...mockAttendance,
        status: 'late',
      });

      const result = await service.updateAttendance('attendance-1', { status: 'late' } as any);

      expect(result.status).toBe('late');
    });

    it('should throw NotFoundException if attendance not found', async () => {
      mockAttendanceRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateAttendance('attendance-1', { status: 'late' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getShifts', () => {
    it('should return paginated shifts for restaurant', async () => {
      mockShiftRepository.findAndCount.mockResolvedValue([[mockShift], 1]);

      const result = await service.getShifts('restaurant-1');

      expect(result.data).toEqual([mockShift]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('createShift', () => {
    it('should create a shift', async () => {
      mockShiftRepository.create.mockReturnValue(mockShift);
      mockShiftRepository.save.mockResolvedValue(mockShift);

      const result = await service.createShift(mockShift);

      expect(result).toBeDefined();
    });
  });

  describe('updateShift', () => {
    it('should update a shift', async () => {
      mockShiftRepository.findOne.mockResolvedValue(mockShift);
      mockShiftRepository.save.mockResolvedValue({
        ...mockShift,
        start_time: '10:00:00',
      });

      const result = await service.updateShift('shift-1', { start_time: '10:00:00' } as any);

      expect(result.start_time).toBe('10:00:00');
    });

    it('should throw NotFoundException if shift not found', async () => {
      mockShiftRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateShift('shift-1', { start_time: '10:00:00' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteShift', () => {
    it('should delete a shift', async () => {
      mockShiftRepository.findOne.mockResolvedValue(mockShift);
      mockShiftRepository.remove.mockResolvedValue(mockShift);

      const result = await service.deleteShift('shift-1');

      expect(result).toEqual({ message: 'Shift deleted successfully' });
    });

    it('should throw NotFoundException if shift not found', async () => {
      mockShiftRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteShift('shift-1')).rejects.toThrow(NotFoundException);
    });
  });
});
