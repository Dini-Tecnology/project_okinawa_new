import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Approval, ApprovalStatus } from './entities/approval.entity';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ResolveApprovalDto } from './dto/resolve-approval.dto';
import { ApprovalsGateway } from './approvals.gateway';

@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
    private readonly approvalsGateway: ApprovalsGateway,
  ) {}

  /**
   * Create a new approval request and emit WebSocket event to managers
   */
  async create(dto: CreateApprovalDto, requesterId: string): Promise<Approval> {
    const approval = this.approvalRepository.create({
      restaurant_id: dto.restaurant_id,
      type: dto.type,
      item_name: dto.item_name,
      table_id: dto.table_id || null,
      requester_id: requesterId,
      reason: dto.reason,
      amount: dto.amount || 0,
      order_id: dto.order_id || null,
      status: ApprovalStatus.PENDING,
    });

    const savedApproval = await this.approvalRepository.save(approval);

    try {
      this.approvalsGateway.emitNewApproval(dto.restaurant_id, savedApproval);
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Failed to emit approval:new event: ${err.message}`);
    }

    return savedApproval;
  }

  /**
   * Find all approvals for a restaurant with optional status and date filters
   */
  async findAll(
    restaurantId: string,
    status?: ApprovalStatus,
    date?: string,
  ): Promise<Approval[]> {
    const where: any = { restaurant_id: restaurantId };

    if (status) {
      where.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.created_at = Between(startOfDay, endOfDay);
    }

    return this.approvalRepository.find({
      where,
      relations: ['requester', 'resolver'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Find only pending approvals for a restaurant, ordered by creation time ASC
   */
  async findPending(restaurantId: string): Promise<Approval[]> {
    return this.approvalRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: ApprovalStatus.PENDING,
      },
      relations: ['requester'],
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Find a single approval by ID
   */
  async findOne(id: string): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({
      where: { id },
      relations: ['requester', 'resolver'],
    });

    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    return approval;
  }

  /**
   * Resolve (approve or reject) a pending approval
   */
  async resolve(
    id: string,
    dto: ResolveApprovalDto,
    resolverId: string,
  ): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({
      where: { id },
      relations: ['requester'],
    });

    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new ConflictException('Approval has already been resolved');
    }

    approval.status = dto.decision as ApprovalStatus;
    approval.resolver_id = resolverId;
    approval.resolved_at = new Date();
    approval.resolution_note = dto.note || null;

    const savedApproval = await this.approvalRepository.save(approval);

    try {
      this.approvalsGateway.emitResolved(approval.requester_id, {
        id: savedApproval.id,
        decision: dto.decision,
        note: dto.note,
        resolvedBy: resolverId,
        resolvedAt: savedApproval.resolved_at,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Failed to emit approval:resolved event: ${err.message}`);
    }

    return savedApproval;
  }

  /**
   * Get stats for approvals (pending count, approved today, rejected today, total impact)
   */
  async getStats(
    restaurantId: string,
    date?: string,
  ): Promise<{
    pending: number;
    approvedToday: number;
    rejectedToday: number;
    totalImpact: number;
  }> {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const pending = await this.approvalRepository.count({
      where: {
        restaurant_id: restaurantId,
        status: ApprovalStatus.PENDING,
      },
    });

    const approvedToday = await this.approvalRepository.count({
      where: {
        restaurant_id: restaurantId,
        status: ApprovalStatus.APPROVED,
        resolved_at: Between(startOfDay, endOfDay),
      },
    });

    const rejectedToday = await this.approvalRepository.count({
      where: {
        restaurant_id: restaurantId,
        status: ApprovalStatus.REJECTED,
        resolved_at: Between(startOfDay, endOfDay),
      },
    });

    // Calculate total financial impact of approved items today
    const approvedItems = await this.approvalRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: ApprovalStatus.APPROVED,
        resolved_at: Between(startOfDay, endOfDay),
      },
      select: ['amount'],
    });

    const totalImpact = approvedItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    return { pending, approvedToday, rejectedToday, totalImpact };
  }
}
