import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ApprovalsService } from '../approvals.service';
import { ApprovalsGateway } from '../approvals.gateway';
import { Approval, ApprovalType, ApprovalStatus } from '../entities/approval.entity';
import { CreateApprovalDto } from '../dto/create-approval.dto';
import { ResolveApprovalDto } from '../dto/resolve-approval.dto';

describe('ApprovalsService', () => {
  let service: ApprovalsService;
  let approvalRepository: Repository<Approval>;
  let approvalsGateway: ApprovalsGateway;

  const mockApproval: Partial<Approval> = {
    id: 'approval-1',
    restaurant_id: 'restaurant-1',
    type: ApprovalType.CANCEL,
    item_name: 'Picanha Grelhada',
    table_id: 'table-1',
    requester_id: 'waiter-1',
    resolver_id: null,
    reason: 'Client changed their mind about this dish',
    resolution_note: null,
    amount: 89.9,
    status: ApprovalStatus.PENDING,
    order_id: 'order-1',
    created_at: new Date('2026-03-23T14:00:00Z'),
    updated_at: new Date('2026-03-23T14:00:00Z'),
    resolved_at: null,
    requester: { id: 'waiter-1', full_name: 'Carlos Silva' } as any,
  };

  const mockResolvedApproval: Partial<Approval> = {
    ...mockApproval,
    status: ApprovalStatus.APPROVED,
    resolver_id: 'manager-1',
    resolved_at: new Date('2026-03-23T14:05:00Z'),
  };

  const mockApprovalRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const mockApprovalsGateway = {
    emitNewApproval: jest.fn(),
    emitResolved: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalsService,
        {
          provide: getRepositoryToken(Approval),
          useValue: mockApprovalRepository,
        },
        {
          provide: ApprovalsGateway,
          useValue: mockApprovalsGateway,
        },
      ],
    }).compile();

    service = module.get<ApprovalsService>(ApprovalsService);
    approvalRepository = module.get(getRepositoryToken(Approval));
    approvalsGateway = module.get(ApprovalsGateway);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new approval and emit WebSocket event', async () => {
      const createDto: CreateApprovalDto = {
        restaurant_id: 'restaurant-1',
        type: ApprovalType.CANCEL,
        item_name: 'Picanha Grelhada',
        table_id: 'table-1',
        reason: 'Client changed their mind about this dish',
        amount: 89.9,
        order_id: 'order-1',
      };

      mockApprovalRepository.create.mockReturnValue(mockApproval);
      mockApprovalRepository.save.mockResolvedValue(mockApproval);

      const result = await service.create(createDto, 'waiter-1');

      expect(result).toEqual(mockApproval);
      expect(mockApprovalRepository.create).toHaveBeenCalledWith({
        restaurant_id: 'restaurant-1',
        type: ApprovalType.CANCEL,
        item_name: 'Picanha Grelhada',
        table_id: 'table-1',
        requester_id: 'waiter-1',
        reason: 'Client changed their mind about this dish',
        amount: 89.9,
        order_id: 'order-1',
        status: ApprovalStatus.PENDING,
      });
      expect(mockApprovalRepository.save).toHaveBeenCalled();
      expect(mockApprovalsGateway.emitNewApproval).toHaveBeenCalledWith(
        'restaurant-1',
        mockApproval,
      );
    });

    it('should create approval with default amount when not provided', async () => {
      const createDto: CreateApprovalDto = {
        restaurant_id: 'restaurant-1',
        type: ApprovalType.COURTESY,
        item_name: 'Sobremesa da Casa',
        reason: 'Courtesy for loyal customer',
      };

      const approvalWithDefaults = { ...mockApproval, amount: 0, table_id: null, order_id: null };
      mockApprovalRepository.create.mockReturnValue(approvalWithDefaults);
      mockApprovalRepository.save.mockResolvedValue(approvalWithDefaults);

      await service.create(createDto, 'waiter-1');

      expect(mockApprovalRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 0,
          table_id: null,
          order_id: null,
        }),
      );
    });

    it('should not throw if WebSocket emit fails', async () => {
      const createDto: CreateApprovalDto = {
        restaurant_id: 'restaurant-1',
        type: ApprovalType.DISCOUNT,
        item_name: 'Total Order',
        reason: 'Birthday discount for customer',
        amount: 25.0,
      };

      mockApprovalRepository.create.mockReturnValue(mockApproval);
      mockApprovalRepository.save.mockResolvedValue(mockApproval);
      mockApprovalsGateway.emitNewApproval.mockImplementation(() => {
        throw new Error('WebSocket error');
      });

      const result = await service.create(createDto, 'waiter-1');

      expect(result).toEqual(mockApproval);
    });
  });

  describe('findAll', () => {
    it('should return all approvals for a restaurant', async () => {
      mockApprovalRepository.find.mockResolvedValue([mockApproval]);

      const result = await service.findAll('restaurant-1');

      expect(result).toEqual([mockApproval]);
      expect(mockApprovalRepository.find).toHaveBeenCalledWith({
        where: { restaurant_id: 'restaurant-1' },
        relations: ['requester', 'resolver'],
        order: { created_at: 'DESC' },
      });
    });

    it('should filter by status when provided', async () => {
      mockApprovalRepository.find.mockResolvedValue([mockApproval]);

      await service.findAll('restaurant-1', ApprovalStatus.PENDING);

      expect(mockApprovalRepository.find).toHaveBeenCalledWith({
        where: {
          restaurant_id: 'restaurant-1',
          status: ApprovalStatus.PENDING,
        },
        relations: ['requester', 'resolver'],
        order: { created_at: 'DESC' },
      });
    });

    it('should filter by date when provided', async () => {
      mockApprovalRepository.find.mockResolvedValue([mockApproval]);

      await service.findAll('restaurant-1', undefined, '2026-03-23');

      expect(mockApprovalRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          restaurant_id: 'restaurant-1',
          created_at: expect.any(Object),
        }),
        relations: ['requester', 'resolver'],
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('findPending', () => {
    it('should return only pending approvals ordered by created_at ASC', async () => {
      mockApprovalRepository.find.mockResolvedValue([mockApproval]);

      const result = await service.findPending('restaurant-1');

      expect(result).toEqual([mockApproval]);
      expect(mockApprovalRepository.find).toHaveBeenCalledWith({
        where: {
          restaurant_id: 'restaurant-1',
          status: ApprovalStatus.PENDING,
        },
        relations: ['requester'],
        order: { created_at: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an approval by id', async () => {
      mockApprovalRepository.findOne.mockResolvedValue(mockApproval);

      const result = await service.findOne('approval-1');

      expect(result).toEqual(mockApproval);
      expect(mockApprovalRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'approval-1' },
        relations: ['requester', 'resolver'],
      });
    });

    it('should throw NotFoundException if approval not found', async () => {
      mockApprovalRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resolve', () => {
    it('should approve a pending approval', async () => {
      const resolveDto: ResolveApprovalDto = {
        decision: 'approved',
        note: 'Approved, valid reason',
      };

      mockApprovalRepository.findOne.mockResolvedValue({ ...mockApproval });
      mockApprovalRepository.save.mockResolvedValue({
        ...mockApproval,
        status: ApprovalStatus.APPROVED,
        resolver_id: 'manager-1',
        resolved_at: expect.any(Date),
        resolution_note: 'Approved, valid reason',
      });

      const result = await service.resolve('approval-1', resolveDto, 'manager-1');

      expect(result).toBeDefined();
      expect(mockApprovalRepository.save).toHaveBeenCalled();
      expect(mockApprovalsGateway.emitResolved).toHaveBeenCalledWith(
        'waiter-1',
        expect.objectContaining({
          id: expect.any(String),
          decision: 'approved',
          note: 'Approved, valid reason',
          resolvedBy: 'manager-1',
        }),
      );
    });

    it('should reject a pending approval', async () => {
      const resolveDto: ResolveApprovalDto = {
        decision: 'rejected',
        note: 'Not a valid reason for cancellation',
      };

      mockApprovalRepository.findOne.mockResolvedValue({ ...mockApproval });
      mockApprovalRepository.save.mockResolvedValue({
        ...mockApproval,
        status: ApprovalStatus.REJECTED,
        resolver_id: 'manager-1',
        resolved_at: new Date(),
        resolution_note: 'Not a valid reason for cancellation',
      });

      const result = await service.resolve('approval-1', resolveDto, 'manager-1');

      expect(result).toBeDefined();
      expect(mockApprovalRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if approval not found', async () => {
      mockApprovalRepository.findOne.mockResolvedValue(null);

      const resolveDto: ResolveApprovalDto = { decision: 'approved' };

      await expect(
        service.resolve('nonexistent', resolveDto, 'manager-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if approval already resolved', async () => {
      const alreadyResolved = {
        ...mockApproval,
        status: ApprovalStatus.APPROVED,
        resolver_id: 'manager-1',
        resolved_at: new Date(),
      };

      mockApprovalRepository.findOne.mockResolvedValue(alreadyResolved);

      const resolveDto: ResolveApprovalDto = { decision: 'rejected' };

      await expect(
        service.resolve('approval-1', resolveDto, 'manager-2'),
      ).rejects.toThrow(ConflictException);
    });

    it('should set resolution_note to null when no note provided', async () => {
      const resolveDto: ResolveApprovalDto = { decision: 'approved' };

      mockApprovalRepository.findOne.mockResolvedValue({ ...mockApproval });
      mockApprovalRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      await service.resolve('approval-1', resolveDto, 'manager-1');

      const savedEntity = mockApprovalRepository.save.mock.calls[0][0];
      expect(savedEntity.resolution_note).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return correct stats for a restaurant', async () => {
      mockApprovalRepository.count
        .mockResolvedValueOnce(3) // pending
        .mockResolvedValueOnce(5) // approved today
        .mockResolvedValueOnce(2); // rejected today

      mockApprovalRepository.find.mockResolvedValue([
        { amount: 50.0 },
        { amount: 30.0 },
        { amount: 20.0 },
      ]);

      const result = await service.getStats('restaurant-1');

      expect(result).toEqual({
        pending: 3,
        approvedToday: 5,
        rejectedToday: 2,
        totalImpact: 100,
      });
    });

    it('should return zeros when no approvals exist', async () => {
      mockApprovalRepository.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      mockApprovalRepository.find.mockResolvedValue([]);

      const result = await service.getStats('restaurant-1');

      expect(result).toEqual({
        pending: 0,
        approvedToday: 0,
        rejectedToday: 0,
        totalImpact: 0,
      });
    });

    it('should filter by date when provided', async () => {
      mockApprovalRepository.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);

      mockApprovalRepository.find.mockResolvedValue([{ amount: 75.0 }]);

      const result = await service.getStats('restaurant-1', '2026-03-22');

      expect(result.totalImpact).toBe(75);
      expect(mockApprovalRepository.count).toHaveBeenCalledTimes(3);
    });
  });
});
