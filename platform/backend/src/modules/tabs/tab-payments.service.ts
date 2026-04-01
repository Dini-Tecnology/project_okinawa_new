import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tab, TabMember, TabPayment } from './entities';
import { TabStatus, TabMemberStatus } from '@/common/enums';
import { PaymentSplitStatus } from '@/modules/payments/entities/payment-split.entity';
import { ProcessTabPaymentDto } from './dto';

@Injectable()
export class TabPaymentsService {
  constructor(
    @InjectRepository(Tab)
    private tabRepository: Repository<Tab>,
    @InjectRepository(TabMember)
    private tabMemberRepository: Repository<TabMember>,
    @InjectRepository(TabPayment)
    private tabPaymentRepository: Repository<TabPayment>,
    private dataSource: DataSource,
  ) {}

  /**
   * Process payment for tab
   */
  async processPayment(tab: Tab, userId: string, dto: ProcessTabPaymentDto): Promise<TabPayment> {
    if (tab.status === TabStatus.CLOSED) {
      throw new BadRequestException('Tab is already closed');
    }

    // Idempotency check: if an idempotency_key is provided, return the
    // existing payment instead of creating a duplicate.
    if (dto.idempotency_key) {
      const existing = await this.tabPaymentRepository.findOne({
        where: { idempotency_key: dto.idempotency_key },
      });

      if (existing) {
        return existing;
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the tab row to prevent concurrent payment processing
      const lockedTab = await queryRunner.manager.findOne(Tab, {
        where: { id: tab.id },
        relations: ['members'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedTab) {
        throw new BadRequestException('Tab not found');
      }

      if (lockedTab.status === TabStatus.CLOSED) {
        throw new BadRequestException('Tab is already closed');
      }

      const payment = queryRunner.manager.create(TabPayment, {
        tab_id: lockedTab.id,
        user_id: userId,
        amount: dto.amount,
        tip_amount: dto.tip_amount || 0,
        payment_method: dto.payment_method,
        transaction_id: dto.transaction_id,
        status: PaymentSplitStatus.PAID,
        payment_details: dto.payment_details,
        idempotency_key: dto.idempotency_key || null,
      });

      const savedPayment = await queryRunner.manager.save(TabPayment, payment);

      // Lock and update member payment tracking
      const member = lockedTab.members.find(m => m.user_id === userId);
      if (member) {
        const lockedMember = await queryRunner.manager.findOne(TabMember, {
          where: { id: member.id },
          lock: { mode: 'pessimistic_write' },
        });
        if (lockedMember) {
          lockedMember.amount_paid = Number(lockedMember.amount_paid) + dto.amount + (dto.tip_amount || 0);
          await queryRunner.manager.save(TabMember, lockedMember);
        }
      }

      // Update tab totals
      lockedTab.amount_paid = Number(lockedTab.amount_paid) + dto.amount + (dto.tip_amount || 0);
      lockedTab.tip_amount = Number(lockedTab.tip_amount) + (dto.tip_amount || 0);

      // Check if fully paid
      const totalAfterCredits = lockedTab.total_amount - lockedTab.cover_charge_credit - lockedTab.deposit_credit;
      if (lockedTab.amount_paid >= totalAfterCredits) {
        lockedTab.status = TabStatus.CLOSED;
        lockedTab.closed_at = new Date();
      }

      await queryRunner.manager.save(Tab, lockedTab);

      await queryRunner.commitTransaction();

      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get split options for the tab
   */
  async getSplitOptions(tab: Tab): Promise<any> {
    const activeMembers = tab.members.filter(m => m.status === TabMemberStatus.ACTIVE);
    const memberCount = activeMembers.length;

    const totalAfterCredits = Number(tab.total_amount) - Number(tab.cover_charge_credit) - Number(tab.deposit_credit);

    return {
      total_amount: tab.total_amount,
      credits: {
        cover_charge: tab.cover_charge_credit,
        deposit: tab.deposit_credit,
        total: Number(tab.cover_charge_credit) + Number(tab.deposit_credit),
      },
      amount_after_credits: totalAfterCredits,
      amount_paid: tab.amount_paid,
      amount_remaining: totalAfterCredits - Number(tab.amount_paid),
      split_options: {
        equal: {
          per_person: totalAfterCredits / memberCount,
          members: memberCount,
        },
        by_consumption: activeMembers.map(m => ({
          user_id: m.user_id,
          amount_consumed: m.amount_consumed,
          amount_paid: m.amount_paid,
          amount_due: Math.max(0, Number(m.amount_consumed) - Number(m.amount_paid)),
        })),
      },
    };
  }
}
