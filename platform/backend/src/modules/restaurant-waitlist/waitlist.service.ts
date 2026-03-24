import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WaitlistEntry, WaitlistStatus, SeatingPreference, WaitlistBarOrder } from './entities';
import { JoinWaitlistDto, CallGuestDto, AddBarOrderDto, UpdateWaitlistEntryDto } from './dto';
import { ORDERS } from '@common/constants/limits';

export interface WaitlistStats {
  totalWaiting: number;
  tablesAvailable: number;
  avgWaitMinutes: number;
  groupsWithKids: number;
}

@Injectable()
export class WaitlistService {
  private readonly BASE_WAIT_PER_GROUP = ORDERS.WAITLIST_WAIT_PER_GROUP_MINUTES; // minutes per group ahead

  constructor(
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepository: Repository<WaitlistEntry>,
  ) {}

  /**
   * Join the waitlist
   */
  async joinWaitlist(
    dto: JoinWaitlistDto,
    userId?: string,
  ): Promise<{ id: string; position: number; estimatedWaitMinutes: number }> {
    // Check if user already in active waitlist for this restaurant
    if (userId) {
      const existing = await this.waitlistRepository.findOne({
        where: {
          restaurant_id: dto.restaurant_id,
          customer_id: userId,
          status: In([WaitlistStatus.WAITING, WaitlistStatus.CALLED]),
        },
      });

      if (existing) {
        throw new ConflictException('You are already in the waitlist for this restaurant');
      }
    }

    // Calculate next position
    const position = await this.getNextPosition(dto.restaurant_id);

    // Estimate wait time
    const estimatedWaitMinutes = position * this.BASE_WAIT_PER_GROUP;

    const entry = this.waitlistRepository.create({
      restaurant_id: dto.restaurant_id,
      customer_id: userId || null,
      customer_name: dto.guest_name,
      customer_phone: dto.customer_phone || null,
      party_size: dto.party_size,
      preference: dto.preference || SeatingPreference.QUALQUER,
      has_kids: dto.has_kids || false,
      kids_ages: dto.kids_ages || null,
      kids_allergies: dto.kids_allergies || null,
      notes: dto.notes || null,
      position,
      estimated_wait_minutes: estimatedWaitMinutes,
      status: WaitlistStatus.WAITING,
      waitlist_bar_orders: [],
    });

    const savedEntry = await this.waitlistRepository.save(entry);

    return {
      id: savedEntry.id,
      position: savedEntry.position,
      estimatedWaitMinutes: savedEntry.estimated_wait_minutes ?? 0,
    };
  }

  /**
   * Get my position in the waitlist
   */
  async getMyPosition(
    userId: string,
    restaurantId: string,
  ): Promise<WaitlistEntry | null> {
    return this.waitlistRepository.findOne({
      where: {
        restaurant_id: restaurantId,
        customer_id: userId,
        status: In([WaitlistStatus.WAITING, WaitlistStatus.CALLED]),
      },
    });
  }

  /**
   * Get position by entry ID (for anonymous users)
   */
  async getPositionById(entryId: string): Promise<WaitlistEntry> {
    const entry = await this.waitlistRepository.findOne({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }

    return entry;
  }

  /**
   * Get active waitlist for a restaurant (for maitre/staff)
   */
  async getWaitlist(restaurantId: string): Promise<WaitlistEntry[]> {
    return this.waitlistRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: In([WaitlistStatus.WAITING, WaitlistStatus.CALLED]),
      },
      order: { position: 'ASC' },
    });
  }

  /**
   * Call a guest — change status to CALLED
   */
  async callGuest(entryId: string, dto: CallGuestDto): Promise<WaitlistEntry> {
    const entry = await this.waitlistRepository.findOne({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }

    if (entry.status !== WaitlistStatus.WAITING) {
      throw new BadRequestException('Entry must be in waiting status to be called');
    }

    entry.status = WaitlistStatus.CALLED;
    entry.called_at = new Date();
    entry.table_number = dto.table_number || null;

    return this.waitlistRepository.save(entry);
  }

  /**
   * Seat a guest — change status to SEATED, reposition queue
   */
  async seatGuest(entryId: string): Promise<WaitlistEntry> {
    const entry = await this.waitlistRepository.findOne({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }

    if (entry.status !== WaitlistStatus.CALLED) {
      throw new BadRequestException('Entry must be in called status to be seated');
    }

    entry.status = WaitlistStatus.SEATED;
    entry.seated_at = new Date();

    const savedEntry = await this.waitlistRepository.save(entry);

    // Recalculate positions for remaining WAITING entries
    await this.recalculatePositions(entry.restaurant_id);

    return savedEntry;
  }

  /**
   * Mark no-show — reposition queue
   */
  async markNoShow(entryId: string): Promise<WaitlistEntry> {
    const entry = await this.waitlistRepository.findOne({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }

    if (!([WaitlistStatus.WAITING, WaitlistStatus.CALLED] as string[]).includes(entry.status)) {
      throw new BadRequestException('Entry must be in waiting or called status');
    }

    entry.status = WaitlistStatus.NO_SHOW;
    entry.no_show_at = new Date();

    const savedEntry = await this.waitlistRepository.save(entry);

    // Recalculate positions
    await this.recalculatePositions(entry.restaurant_id);

    return savedEntry;
  }

  /**
   * Cancel own spot (customer)
   */
  async cancelEntry(entryId: string, userId?: string): Promise<WaitlistEntry> {
    const entry = await this.waitlistRepository.findOne({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }

    // If userId provided, ensure ownership
    if (userId && entry.customer_id !== userId) {
      throw new ForbiddenException('You can only cancel your own waitlist entry');
    }

    if (!([WaitlistStatus.WAITING, WaitlistStatus.CALLED] as string[]).includes(entry.status)) {
      throw new BadRequestException('Entry cannot be cancelled in current status');
    }

    entry.status = WaitlistStatus.CANCELLED;

    const savedEntry = await this.waitlistRepository.save(entry);

    // Recalculate positions
    await this.recalculatePositions(entry.restaurant_id);

    return savedEntry;
  }

  /**
   * Add bar order while waiting
   */
  async addBarOrder(entryId: string, dto: AddBarOrderDto): Promise<WaitlistEntry> {
    const entry = await this.waitlistRepository.findOne({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }

    if (!([WaitlistStatus.WAITING, WaitlistStatus.CALLED] as string[]).includes(entry.status)) {
      throw new BadRequestException('Cannot add bar orders in current status');
    }

    const newOrders: WaitlistBarOrder[] = dto.items.map((item) => ({
      itemName: item.item_name,
      itemPrice: item.item_price,
      quantity: item.quantity,
      addedAt: new Date().toISOString(),
    }));

    entry.waitlist_bar_orders = [
      ...(entry.waitlist_bar_orders || []),
      ...newOrders,
    ];

    return this.waitlistRepository.save(entry);
  }

  /**
   * Update family info (kids ages, allergies)
   */
  async updateFamilyInfo(
    entryId: string,
    dto: UpdateWaitlistEntryDto,
  ): Promise<WaitlistEntry> {
    const entry = await this.waitlistRepository.findOne({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }

    if (dto.has_kids !== undefined) {
      entry.has_kids = dto.has_kids;
    }
    if (dto.kids_ages !== undefined) {
      entry.kids_ages = dto.kids_ages;
    }
    if (dto.kids_allergies !== undefined) {
      entry.kids_allergies = dto.kids_allergies;
    }

    return this.waitlistRepository.save(entry);
  }

  /**
   * Get waitlist stats for a restaurant
   */
  async getStats(restaurantId: string): Promise<WaitlistStats> {
    const waitingEntries = await this.waitlistRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: In([WaitlistStatus.WAITING, WaitlistStatus.CALLED]),
      },
    });

    const totalWaiting = waitingEntries.filter(
      (e) => e.status === WaitlistStatus.WAITING,
    ).length;

    const groupsWithKids = waitingEntries.filter((e) => e.has_kids).length;

    // Calculate average wait time
    const waitingOnly = waitingEntries.filter(
      (e) => e.status === WaitlistStatus.WAITING,
    );
    const avgWaitMinutes =
      waitingOnly.length > 0
        ? Math.round(
            waitingOnly.reduce(
              (sum, e) => sum + (e.estimated_wait_minutes || 0),
              0,
            ) / waitingOnly.length,
          )
        : 0;

    return {
      totalWaiting,
      tablesAvailable: 0, // To be integrated with tables module
      avgWaitMinutes,
      groupsWithKids,
    };
  }

  /**
   * Get next position number for a restaurant
   */
  private async getNextPosition(restaurantId: string): Promise<number> {
    const lastEntry = await this.waitlistRepository.findOne({
      where: {
        restaurant_id: restaurantId,
        status: In([WaitlistStatus.WAITING, WaitlistStatus.CALLED]),
      },
      order: { position: 'DESC' },
    });

    return (lastEntry?.position || 0) + 1;
  }

  /**
   * Recalculate positions after entry removal (seated, no-show, cancelled)
   */
  private async recalculatePositions(restaurantId: string): Promise<void> {
    const entries = await this.waitlistRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: WaitlistStatus.WAITING,
      },
      order: { created_at: 'ASC' },
    });

    for (let i = 0; i < entries.length; i++) {
      entries[i].position = i + 1;
      entries[i].estimated_wait_minutes = (i + 1) * this.BASE_WAIT_PER_GROUP;
    }

    if (entries.length > 0) {
      await this.waitlistRepository.save(entries);
    }
  }
}
