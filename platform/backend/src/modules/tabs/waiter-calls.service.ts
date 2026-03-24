import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { WaiterCall } from './entities/waiter-call.entity';
import { CreateWaiterCallDto } from './dto';

@Injectable()
export class WaiterCallsService {
  constructor(
    @InjectRepository(WaiterCall)
    private waiterCallRepository: Repository<WaiterCall>,
  ) {}

  async createCall(userId: string, dto: CreateWaiterCallDto): Promise<WaiterCall> {
    const call = this.waiterCallRepository.create({
      restaurant_id: dto.restaurant_id,
      table_id: dto.table_id,
      user_id: userId,
      tab_id: dto.tab_id,
      reason: dto.reason,
      notes: dto.notes,
      status: 'pending',
    });

    return this.waiterCallRepository.save(call);
  }

  async acknowledgeCall(callId: string, staffUserId: string): Promise<WaiterCall> {
    const call = await this.waiterCallRepository.findOne({ where: { id: callId } });

    if (!call) {
      throw new NotFoundException('Waiter call not found');
    }

    call.status = 'acknowledged';
    call.acknowledged_by = staffUserId;
    call.acknowledged_at = new Date();

    return this.waiterCallRepository.save(call);
  }

  async resolveCall(callId: string): Promise<WaiterCall> {
    const call = await this.waiterCallRepository.findOne({ where: { id: callId } });

    if (!call) {
      throw new NotFoundException('Waiter call not found');
    }

    call.status = 'resolved';
    call.resolved_at = new Date();

    return this.waiterCallRepository.save(call);
  }

  async getPendingCalls(restaurantId: string): Promise<WaiterCall[]> {
    return this.waiterCallRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: 'pending',
      },
      relations: ['user', 'table'],
      order: { created_at: 'ASC' },
    });
  }

  async getCallsByTable(tableId: string): Promise<WaiterCall[]> {
    return this.waiterCallRepository.find({
      where: { table_id: tableId },
      order: { created_at: 'DESC' },
      take: 10,
    });
  }
}
