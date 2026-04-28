import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CallsService } from '../calls.service';
import { CallsGateway } from '../calls.realtime';
import {
  ServiceCall,
  CallType,
  ServiceCallStatus,
} from '../entities/service-call.entity';
import { CreateCallDto } from '../dto/create-call.dto';

describe('CallsService', () => {
  let service: CallsService;
  let callRepository: Repository<ServiceCall>;
  let callsGateway: CallsGateway;

  const mockCall: Partial<ServiceCall> = {
    id: 'call-1',
    restaurant_id: 'restaurant-1',
    table_id: 'table-5',
    user_id: 'customer-1',
    call_type: CallType.WAITER,
    status: ServiceCallStatus.PENDING,
    message: 'Extra napkins please',
    called_at: new Date('2026-03-23T14:00:00Z'),
    acknowledged_at: null,
    acknowledged_by: null,
    resolved_at: null,
    resolved_by: null,
    created_at: new Date('2026-03-23T14:00:00Z'),
    updated_at: new Date('2026-03-23T14:00:00Z'),
    caller: { id: 'customer-1', full_name: 'Ana Costa' } as any,
  };

  const mockCallRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const mockCallsGateway = {
    emitNewCall: jest.fn(),
    emitCallUpdated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallsService,
        {
          provide: getRepositoryToken(ServiceCall),
          useValue: mockCallRepository,
        },
        {
          provide: CallsGateway,
          useValue: mockCallsGateway,
        },
      ],
    }).compile();

    service = module.get<CallsService>(CallsService);
    callRepository = module.get(getRepositoryToken(ServiceCall));
    callsGateway = module.get(CallsGateway);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new service call and emit WebSocket event', async () => {
      const createDto: CreateCallDto = {
        restaurant_id: 'restaurant-1',
        table_id: 'table-5',
        call_type: CallType.WAITER,
        message: 'Extra napkins please',
      };

      mockCallRepository.create.mockReturnValue(mockCall);
      mockCallRepository.save.mockResolvedValue(mockCall);

      const result = await service.create(createDto, 'customer-1');

      expect(result).toEqual(mockCall);
      expect(mockCallRepository.create).toHaveBeenCalledWith({
        restaurant_id: 'restaurant-1',
        table_id: 'table-5',
        user_id: 'customer-1',
        call_type: CallType.WAITER,
        message: 'Extra napkins please',
        status: ServiceCallStatus.PENDING,
        called_at: expect.any(Date),
      });
      expect(mockCallRepository.save).toHaveBeenCalled();
      expect(mockCallsGateway.emitNewCall).toHaveBeenCalledWith(
        'restaurant-1',
        mockCall,
      );
    });

    it('should create call with null table_id when not provided', async () => {
      const createDto: CreateCallDto = {
        restaurant_id: 'restaurant-1',
        call_type: CallType.HELP,
      };

      mockCallRepository.create.mockReturnValue({
        ...mockCall,
        table_id: null,
      });
      mockCallRepository.save.mockResolvedValue({
        ...mockCall,
        table_id: null,
      });

      await service.create(createDto, 'customer-1');

      expect(mockCallRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          table_id: null,
          message: null,
        }),
      );
    });

    it('should not throw if WebSocket emit fails', async () => {
      const createDto: CreateCallDto = {
        restaurant_id: 'restaurant-1',
        call_type: CallType.EMERGENCY,
      };

      mockCallRepository.create.mockReturnValue(mockCall);
      mockCallRepository.save.mockResolvedValue(mockCall);
      mockCallsGateway.emitNewCall.mockImplementation(() => {
        throw new Error('WebSocket error');
      });

      const result = await service.create(createDto, 'customer-1');

      expect(result).toEqual(mockCall);
    });
  });

  describe('findByRestaurant', () => {
    it('should return all calls for a restaurant', async () => {
      mockCallRepository.find.mockResolvedValue([mockCall]);

      const result = await service.findByRestaurant('restaurant-1');

      expect(result).toEqual([mockCall]);
      expect(mockCallRepository.find).toHaveBeenCalledWith({
        where: { restaurant_id: 'restaurant-1' },
        relations: ['caller'],
        order: { called_at: 'DESC' },
      });
    });

    it('should filter by status when provided', async () => {
      mockCallRepository.find.mockResolvedValue([mockCall]);

      await service.findByRestaurant(
        'restaurant-1',
        ServiceCallStatus.PENDING,
      );

      expect(mockCallRepository.find).toHaveBeenCalledWith({
        where: {
          restaurant_id: 'restaurant-1',
          status: ServiceCallStatus.PENDING,
        },
        relations: ['caller'],
        order: { called_at: 'DESC' },
      });
    });
  });

  describe('findPending', () => {
    it('should return only pending calls ordered by called_at ASC', async () => {
      mockCallRepository.find.mockResolvedValue([mockCall]);

      const result = await service.findPending('restaurant-1');

      expect(result).toEqual([mockCall]);
      expect(mockCallRepository.find).toHaveBeenCalledWith({
        where: {
          restaurant_id: 'restaurant-1',
          status: ServiceCallStatus.PENDING,
        },
        relations: ['caller'],
        order: { called_at: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a call by id', async () => {
      mockCallRepository.findOne.mockResolvedValue(mockCall);

      const result = await service.findOne('call-1');

      expect(result).toEqual(mockCall);
      expect(mockCallRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'call-1' },
        relations: ['caller'],
      });
    });

    it('should throw NotFoundException if call not found', async () => {
      mockCallRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('acknowledge', () => {
    it('should acknowledge a pending call', async () => {
      mockCallRepository.findOne.mockResolvedValue({ ...mockCall });
      mockCallRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.acknowledge('call-1', 'waiter-1');

      expect(result.status).toBe(ServiceCallStatus.ACKNOWLEDGED);
      expect(result.acknowledged_by).toBe('waiter-1');
      expect(result.acknowledged_at).toBeInstanceOf(Date);
      expect(mockCallsGateway.emitCallUpdated).toHaveBeenCalledWith(
        'restaurant-1',
        expect.objectContaining({
          status: ServiceCallStatus.ACKNOWLEDGED,
        }),
      );
    });

    it('should throw NotFoundException if call not found', async () => {
      mockCallRepository.findOne.mockResolvedValue(null);

      await expect(
        service.acknowledge('nonexistent', 'waiter-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if call is not pending', async () => {
      const acknowledgedCall = {
        ...mockCall,
        status: ServiceCallStatus.ACKNOWLEDGED,
      };
      mockCallRepository.findOne.mockResolvedValue(acknowledgedCall);

      await expect(
        service.acknowledge('call-1', 'waiter-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should not throw if WebSocket emit fails on acknowledge', async () => {
      mockCallRepository.findOne.mockResolvedValue({ ...mockCall });
      mockCallRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );
      mockCallsGateway.emitCallUpdated.mockImplementation(() => {
        throw new Error('WebSocket error');
      });

      const result = await service.acknowledge('call-1', 'waiter-1');

      expect(result.status).toBe(ServiceCallStatus.ACKNOWLEDGED);
    });
  });

  describe('resolve', () => {
    it('should resolve an acknowledged call', async () => {
      const acknowledgedCall = {
        ...mockCall,
        status: ServiceCallStatus.ACKNOWLEDGED,
        acknowledged_at: new Date('2026-03-23T14:01:00Z'),
        acknowledged_by: 'waiter-1',
      };
      mockCallRepository.findOne.mockResolvedValue({ ...acknowledgedCall });
      mockCallRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.resolve('call-1', 'waiter-1');

      expect(result.status).toBe(ServiceCallStatus.RESOLVED);
      expect(result.resolved_by).toBe('waiter-1');
      expect(result.resolved_at).toBeInstanceOf(Date);
      expect(mockCallsGateway.emitCallUpdated).toHaveBeenCalled();
    });

    it('should resolve a pending call and auto-acknowledge', async () => {
      mockCallRepository.findOne.mockResolvedValue({ ...mockCall });
      mockCallRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.resolve('call-1', 'waiter-1');

      expect(result.status).toBe(ServiceCallStatus.RESOLVED);
      expect(result.acknowledged_at).toBeInstanceOf(Date);
      expect(result.acknowledged_by).toBe('waiter-1');
      expect(result.resolved_at).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException if call not found', async () => {
      mockCallRepository.findOne.mockResolvedValue(null);

      await expect(
        service.resolve('nonexistent', 'waiter-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if call is already resolved', async () => {
      const resolvedCall = {
        ...mockCall,
        status: ServiceCallStatus.RESOLVED,
      };
      mockCallRepository.findOne.mockResolvedValue(resolvedCall);

      await expect(
        service.resolve('call-1', 'waiter-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if call is cancelled', async () => {
      const cancelledCall = {
        ...mockCall,
        status: ServiceCallStatus.CANCELLED,
      };
      mockCallRepository.findOne.mockResolvedValue(cancelledCall);

      await expect(
        service.resolve('call-1', 'waiter-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('cancel', () => {
    it('should cancel a pending call by the original caller', async () => {
      mockCallRepository.findOne.mockResolvedValue({ ...mockCall });
      mockCallRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.cancel('call-1', 'customer-1');

      expect(result.status).toBe(ServiceCallStatus.CANCELLED);
      expect(mockCallsGateway.emitCallUpdated).toHaveBeenCalled();
    });

    it('should throw NotFoundException if call not found', async () => {
      mockCallRepository.findOne.mockResolvedValue(null);

      await expect(
        service.cancel('nonexistent', 'customer-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the caller', async () => {
      mockCallRepository.findOne.mockResolvedValue({ ...mockCall });

      await expect(
        service.cancel('call-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if call is not pending', async () => {
      const acknowledgedCall = {
        ...mockCall,
        status: ServiceCallStatus.ACKNOWLEDGED,
      };
      mockCallRepository.findOne.mockResolvedValue(acknowledgedCall);

      await expect(
        service.cancel('call-1', 'customer-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getStats', () => {
    it('should return correct stats for a restaurant', async () => {
      mockCallRepository.count
        .mockResolvedValueOnce(3) // pending
        .mockResolvedValueOnce(1) // acknowledged
        .mockResolvedValueOnce(7); // resolved today

      mockCallRepository.find.mockResolvedValue([
        {
          called_at: new Date('2026-03-23T12:00:00Z'),
          acknowledged_at: new Date('2026-03-23T12:02:00Z'),
        },
        {
          called_at: new Date('2026-03-23T13:00:00Z'),
          acknowledged_at: new Date('2026-03-23T13:01:00Z'),
        },
      ]);

      const result = await service.getStats('restaurant-1');

      expect(result.pendingCount).toBe(3);
      expect(result.acknowledgedCount).toBe(1);
      expect(result.resolvedTodayCount).toBe(7);
      // avg of 2 min + 1 min = 1.5 min = 90000ms
      expect(result.avgResponseTimeMs).toBe(90000);
    });

    it('should return null avgResponseTime when no calls with acknowledgment', async () => {
      mockCallRepository.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      mockCallRepository.find.mockResolvedValue([]);

      const result = await service.getStats('restaurant-1');

      expect(result.pendingCount).toBe(0);
      expect(result.acknowledgedCount).toBe(0);
      expect(result.resolvedTodayCount).toBe(0);
      expect(result.avgResponseTimeMs).toBeNull();
    });

    it('should handle calls without acknowledged_at in avg calculation', async () => {
      mockCallRepository.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(2);

      mockCallRepository.find.mockResolvedValue([
        {
          called_at: new Date('2026-03-23T12:00:00Z'),
          acknowledged_at: new Date('2026-03-23T12:03:00Z'),
        },
        {
          called_at: new Date('2026-03-23T13:00:00Z'),
          acknowledged_at: null, // resolved directly without acknowledge
        },
      ]);

      const result = await service.getStats('restaurant-1');

      // Only 1 call with ack: 3min = 180000ms
      expect(result.avgResponseTimeMs).toBe(180000);
    });
  });
});
