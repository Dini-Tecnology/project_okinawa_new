import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalsController } from '../approvals.controller';
import { ApprovalsService } from '../approvals.service';
import { CreateApprovalDto } from '../dto/create-approval.dto';
import { ResolveApprovalDto } from '../dto/resolve-approval.dto';
import { ApprovalType, ApprovalStatus } from '../entities/approval.entity';

describe('ApprovalsController', () => {
  let controller: ApprovalsController;
  let approvalsService: ApprovalsService;

  const mockApprovalsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findPending: jest.fn(),
    findOne: jest.fn(),
    resolve: jest.fn(),
    getStats: jest.fn(),
  };

  const mockApproval = {
    id: 'approval-1',
    restaurant_id: 'restaurant-1',
    type: ApprovalType.CANCEL,
    item_name: 'Picanha Grelhada',
    table_id: 'table-1',
    requester_id: 'waiter-1',
    resolver_id: null,
    reason: 'Client changed their mind',
    resolution_note: null,
    amount: 89.9,
    status: ApprovalStatus.PENDING,
    order_id: 'order-1',
    created_at: new Date(),
    updated_at: new Date(),
    resolved_at: null,
  };

  const mockUser = { id: 'user-1', roles: ['manager'] };
  const mockWaiterUser = { id: 'waiter-1', roles: ['waiter'] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprovalsController],
      providers: [
        { provide: ApprovalsService, useValue: mockApprovalsService },
      ],
    }).compile();

    controller = module.get<ApprovalsController>(ApprovalsController);
    approvalsService = module.get<ApprovalsService>(ApprovalsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new approval request', async () => {
      const createDto: CreateApprovalDto = {
        restaurant_id: 'restaurant-1',
        type: ApprovalType.CANCEL,
        item_name: 'Picanha Grelhada',
        reason: 'Client changed their mind',
        amount: 89.9,
        order_id: 'order-1',
      };

      mockApprovalsService.create.mockResolvedValue(mockApproval);

      const result = await controller.create(createDto, mockWaiterUser);

      expect(result).toEqual(mockApproval);
      expect(mockApprovalsService.create).toHaveBeenCalledWith(
        createDto,
        'waiter-1',
      );
    });
  });

  describe('findAll', () => {
    it('should return all approvals for a restaurant', async () => {
      const approvals = [mockApproval];
      mockApprovalsService.findAll.mockResolvedValue(approvals);

      const result = await controller.findAll('restaurant-1');

      expect(result).toEqual(approvals);
      expect(mockApprovalsService.findAll).toHaveBeenCalledWith(
        'restaurant-1',
        undefined,
        undefined,
      );
    });

    it('should pass status filter to service', async () => {
      mockApprovalsService.findAll.mockResolvedValue([]);

      await controller.findAll('restaurant-1', ApprovalStatus.PENDING);

      expect(mockApprovalsService.findAll).toHaveBeenCalledWith(
        'restaurant-1',
        ApprovalStatus.PENDING,
        undefined,
      );
    });

    it('should pass date filter to service', async () => {
      mockApprovalsService.findAll.mockResolvedValue([]);

      await controller.findAll('restaurant-1', undefined, '2026-03-23');

      expect(mockApprovalsService.findAll).toHaveBeenCalledWith(
        'restaurant-1',
        undefined,
        '2026-03-23',
      );
    });
  });

  describe('findPending', () => {
    it('should return pending approvals', async () => {
      const pendingApprovals = [mockApproval];
      mockApprovalsService.findPending.mockResolvedValue(pendingApprovals);

      const result = await controller.findPending('restaurant-1');

      expect(result).toEqual(pendingApprovals);
      expect(mockApprovalsService.findPending).toHaveBeenCalledWith(
        'restaurant-1',
      );
    });
  });

  describe('getStats', () => {
    it('should return approval stats', async () => {
      const stats = {
        pending: 3,
        approvedToday: 5,
        rejectedToday: 2,
        totalImpact: 450.0,
      };

      mockApprovalsService.getStats.mockResolvedValue(stats);

      const result = await controller.getStats('restaurant-1');

      expect(result).toEqual(stats);
      expect(mockApprovalsService.getStats).toHaveBeenCalledWith(
        'restaurant-1',
        undefined,
      );
    });

    it('should pass date filter to getStats', async () => {
      mockApprovalsService.getStats.mockResolvedValue({
        pending: 0,
        approvedToday: 0,
        rejectedToday: 0,
        totalImpact: 0,
      });

      await controller.getStats('restaurant-1', '2026-03-22');

      expect(mockApprovalsService.getStats).toHaveBeenCalledWith(
        'restaurant-1',
        '2026-03-22',
      );
    });
  });

  describe('findOne', () => {
    it('should return a single approval by id', async () => {
      mockApprovalsService.findOne.mockResolvedValue(mockApproval);

      const result = await controller.findOne('approval-1');

      expect(result).toEqual(mockApproval);
      expect(mockApprovalsService.findOne).toHaveBeenCalledWith('approval-1');
    });
  });

  describe('resolve', () => {
    it('should approve an approval request', async () => {
      const resolveDto: ResolveApprovalDto = {
        decision: 'approved',
        note: 'Valid reason',
      };

      const resolvedApproval = {
        ...mockApproval,
        status: ApprovalStatus.APPROVED,
        resolver_id: 'user-1',
        resolved_at: new Date(),
      };

      mockApprovalsService.resolve.mockResolvedValue(resolvedApproval);

      const result = await controller.resolve(
        'approval-1',
        resolveDto,
        mockUser,
      );

      expect(result).toEqual(resolvedApproval);
      expect(mockApprovalsService.resolve).toHaveBeenCalledWith(
        'approval-1',
        resolveDto,
        'user-1',
      );
    });

    it('should reject an approval request', async () => {
      const resolveDto: ResolveApprovalDto = {
        decision: 'rejected',
        note: 'Item already prepared',
      };

      const rejectedApproval = {
        ...mockApproval,
        status: ApprovalStatus.REJECTED,
        resolver_id: 'user-1',
        resolved_at: new Date(),
        resolution_note: 'Item already prepared',
      };

      mockApprovalsService.resolve.mockResolvedValue(rejectedApproval);

      const result = await controller.resolve(
        'approval-1',
        resolveDto,
        mockUser,
      );

      expect(result).toEqual(rejectedApproval);
      expect(mockApprovalsService.resolve).toHaveBeenCalledWith(
        'approval-1',
        resolveDto,
        'user-1',
      );
    });
  });
});
