import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { ServiceCall, ServiceCallStatus } from './entities/service-call.entity';
import { CreateCallDto } from './dto/create-call.dto';
import { CallsGateway } from './calls.gateway';

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(
    @InjectRepository(ServiceCall)
    private readonly callRepository: Repository<ServiceCall>,
    private readonly callsGateway: CallsGateway,
  ) {}

  /**
   * Create a new service call and emit WebSocket event to restaurant staff
   */
  async create(dto: CreateCallDto, userId: string): Promise<ServiceCall> {
    const call = this.callRepository.create({
      restaurant_id: dto.restaurant_id,
      table_id: dto.table_id || null,
      user_id: userId,
      call_type: dto.call_type,
      message: dto.message || null,
      status: ServiceCallStatus.PENDING,
      called_at: new Date(),
    });

    const savedCall = await this.callRepository.save(call);

    try {
      this.callsGateway.emitNewCall(dto.restaurant_id, savedCall);
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Failed to emit call:new event: ${err.message}`);
    }

    return savedCall;
  }

  /**
   * Find all calls for a restaurant with optional status filter
   */
  async findByRestaurant(
    restaurantId: string,
    status?: ServiceCallStatus,
  ): Promise<ServiceCall[]> {
    const where: Record<string, unknown> = { restaurant_id: restaurantId };

    if (status) {
      where.status = status;
    }

    return this.callRepository.find({
      where,
      relations: ['caller'],
      order: { called_at: 'DESC' },
    });
  }

  /**
   * Find only pending calls for a restaurant, ordered by called_at ASC (oldest first)
   */
  async findPending(restaurantId: string): Promise<ServiceCall[]> {
    return this.callRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: ServiceCallStatus.PENDING,
      },
      relations: ['caller'],
      order: { called_at: 'ASC' },
    });
  }

  /**
   * Find active calls (PENDING or ACKNOWLEDGED) for a restaurant, ordered oldest first.
   */
  async getActiveCalls(restaurantId: string): Promise<ServiceCall[]> {
    return this.callRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: In([ServiceCallStatus.PENDING, ServiceCallStatus.ACKNOWLEDGED]),
      },
      relations: ['caller'],
      order: { called_at: 'ASC' },
    });
  }

  /**
   * Find a single call by ID
   */
  async findOne(id: string): Promise<ServiceCall> {
    const call = await this.callRepository.findOne({
      where: { id },
      relations: ['caller'],
    });

    if (!call) {
      throw new NotFoundException('Service call not found');
    }

    return call;
  }

  /**
   * Acknowledge a pending call (staff is on the way)
   */
  async acknowledge(id: string, staffId: string): Promise<ServiceCall> {
    const call = await this.callRepository.findOne({
      where: { id },
      relations: ['caller'],
    });

    if (!call) {
      throw new NotFoundException('Service call not found');
    }

    if (call.status !== ServiceCallStatus.PENDING) {
      throw new ConflictException('Only pending calls can be acknowledged');
    }

    call.status = ServiceCallStatus.ACKNOWLEDGED;
    call.acknowledged_at = new Date();
    call.acknowledged_by = staffId;

    const savedCall = await this.callRepository.save(call);

    try {
      this.callsGateway.emitCallUpdated(call.restaurant_id, savedCall);
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Failed to emit call:updated event: ${err.message}`);
    }

    return savedCall;
  }

  /**
   * Resolve a call (staff has attended to it)
   */
  async resolve(id: string, staffId: string): Promise<ServiceCall> {
    const call = await this.callRepository.findOne({
      where: { id },
      relations: ['caller'],
    });

    if (!call) {
      throw new NotFoundException('Service call not found');
    }

    if (
      call.status !== ServiceCallStatus.PENDING &&
      call.status !== ServiceCallStatus.ACKNOWLEDGED
    ) {
      throw new ConflictException(
        'Only pending or acknowledged calls can be resolved',
      );
    }

    call.status = ServiceCallStatus.RESOLVED;
    call.resolved_at = new Date();
    call.resolved_by = staffId;

    // If not previously acknowledged, set acknowledged info as well
    if (!call.acknowledged_at) {
      call.acknowledged_at = new Date();
      call.acknowledged_by = staffId;
    }

    const savedCall = await this.callRepository.save(call);

    try {
      this.callsGateway.emitCallUpdated(call.restaurant_id, savedCall);
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Failed to emit call:updated event: ${err.message}`);
    }

    return savedCall;
  }

  /**
   * Cancel a call (only the original caller can cancel, and only if pending)
   */
  async cancel(id: string, userId: string): Promise<ServiceCall> {
    const call = await this.callRepository.findOne({
      where: { id },
      relations: ['caller'],
    });

    if (!call) {
      throw new NotFoundException('Service call not found');
    }

    if (call.user_id !== userId) {
      throw new ForbiddenException('Only the caller can cancel this call');
    }

    if (call.status !== ServiceCallStatus.PENDING) {
      throw new ConflictException('Only pending calls can be cancelled');
    }

    call.status = ServiceCallStatus.CANCELLED;

    const savedCall = await this.callRepository.save(call);

    try {
      this.callsGateway.emitCallUpdated(call.restaurant_id, savedCall);
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Failed to emit call:updated event: ${err.message}`);
    }

    return savedCall;
  }

  /**
   * Get stats for calls in a restaurant (pending count, average response time)
   */
  async getStats(restaurantId: string): Promise<{
    pendingCount: number;
    acknowledgedCount: number;
    resolvedTodayCount: number;
    avgResponseTimeMs: number | null;
  }> {
    const pendingCount = await this.callRepository.count({
      where: {
        restaurant_id: restaurantId,
        status: ServiceCallStatus.PENDING,
      },
    });

    const acknowledgedCount = await this.callRepository.count({
      where: {
        restaurant_id: restaurantId,
        status: ServiceCallStatus.ACKNOWLEDGED,
      },
    });

    // Resolved today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const resolvedTodayCount = await this.callRepository.count({
      where: {
        restaurant_id: restaurantId,
        status: ServiceCallStatus.RESOLVED,
        resolved_at: Between(startOfDay, endOfDay),
      },
    });

    // Average response time (time between called_at and acknowledged_at for today's resolved calls)
    const resolvedToday = await this.callRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: ServiceCallStatus.RESOLVED,
        resolved_at: Between(startOfDay, endOfDay),
      },
      select: ['called_at', 'acknowledged_at'],
    });

    let avgResponseTimeMs: number | null = null;
    const callsWithAck = resolvedToday.filter((c) => c.acknowledged_at);
    if (callsWithAck.length > 0) {
      const totalMs = callsWithAck.reduce((sum, c) => {
        return (
          sum +
          (new Date(c.acknowledged_at!).getTime() -
            new Date(c.called_at).getTime())
        );
      }, 0);
      avgResponseTimeMs = Math.round(totalMs / callsWithAck.length);
    }

    return {
      pendingCount,
      acknowledgedCount,
      resolvedTodayCount,
      avgResponseTimeMs,
    };
  }
}
