import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { ClubEntry, ClubCheckInOut } from './entities';
import { ClubEntryStatus, ClubEntryPurchaseType } from '@/common/enums';
import { PurchaseClubEntryDto, ValidateClubEntryDto, CheckInDto, CheckOutDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ClubEntriesService {
  constructor(
    @InjectRepository(ClubEntry)
    private entryRepository: Repository<ClubEntry>,
    @InjectRepository(ClubCheckInOut)
    private checkInOutRepository: Repository<ClubCheckInOut>,
  ) {}

  /**
   * Purchase entry ticket(s) for an event
   */
  async purchaseEntry(userId: string, dto: PurchaseClubEntryDto): Promise<ClubEntry> {
    const quantity = dto.quantity || 1;
    const totalPrice = dto.unit_price * quantity;
    const creditAmount = dto.credit_amount || 0;

    const entry = this.entryRepository.create({
      restaurant_id: dto.restaurant_id,
      user_id: userId,
      event_date: dto.event_date,
      variation_id: dto.variation_id,
      variation_name: dto.variation_name,
      quantity,
      unit_price: dto.unit_price,
      total_price: totalPrice,
      credit_amount: creditAmount * quantity,
      purchase_type: dto.purchase_type || ClubEntryPurchaseType.ADVANCE,
      qr_code: this.generateQRCode(),
      status: ClubEntryStatus.ACTIVE,
      transaction_id: dto.transaction_id,
    });

    return this.entryRepository.save(entry);
  }

  /**
   * Validate entry at the door
   */
  async validateEntry(dto: ValidateClubEntryDto): Promise<{ valid: boolean; entry?: ClubEntry; message?: string }> {
    const entry = await this.entryRepository.findOne({
      where: { qr_code: dto.qr_code },
      relations: ['user'],
    });

    if (!entry) {
      return { valid: false, message: 'Entry not found' };
    }

    if (entry.status === ClubEntryStatus.USED) {
      return { valid: false, message: 'Entry already used', entry };
    }

    if (entry.status === ClubEntryStatus.CANCELLED) {
      return { valid: false, message: 'Entry was cancelled', entry };
    }

    if (entry.status === ClubEntryStatus.EXPIRED) {
      return { valid: false, message: 'Entry has expired', entry };
    }

    // Check if event date matches today (allowing for after-midnight)
    const today = new Date();
    const eventDate = new Date(entry.event_date);
    const isValidDate = 
      eventDate.toDateString() === today.toDateString() ||
      (today.getHours() < 6 && this.isYesterday(eventDate, today));

    if (!isValidDate) {
      return { valid: false, message: 'Entry not valid for today', entry };
    }

    return { valid: true, entry };
  }

  /**
   * Mark entry as used
   */
  async useEntry(entryId: string): Promise<ClubEntry> {
    const entry = await this.entryRepository.findOne({ where: { id: entryId } });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (entry.status !== ClubEntryStatus.ACTIVE) {
      throw new BadRequestException(`Entry cannot be used: status is ${entry.status}`);
    }

    entry.status = ClubEntryStatus.USED;
    entry.used_at = new Date();

    return this.entryRepository.save(entry);
  }

  /**
   * Cancel an entry (before use)
   */
  async cancelEntry(entryId: string, userId: string): Promise<ClubEntry> {
    const entry = await this.entryRepository.findOne({ where: { id: entryId } });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (entry.user_id !== userId) {
      throw new BadRequestException('You can only cancel your own entries');
    }

    if (entry.status !== ClubEntryStatus.ACTIVE) {
      throw new BadRequestException('Entry cannot be cancelled');
    }

    entry.status = ClubEntryStatus.CANCELLED;
    return this.entryRepository.save(entry);
  }

  /**
   * Get user's entries
   */
  async getUserEntries(userId: string, includeUsed = false): Promise<ClubEntry[]> {
    const statuses = includeUsed
      ? [ClubEntryStatus.ACTIVE, ClubEntryStatus.USED]
      : [ClubEntryStatus.ACTIVE];

    return this.entryRepository.find({
      where: { user_id: userId, status: In(statuses) },
      relations: ['restaurant'],
      order: { event_date: 'ASC' },
    });
  }

  /**
   * Check in user
   */
  async checkIn(userId: string, dto: CheckInDto): Promise<ClubCheckInOut> {
    // Check if already checked in
    const existingCheckIn = await this.checkInOutRepository.findOne({
      where: {
        restaurant_id: dto.restaurant_id,
        user_id: userId,
        check_out_at: IsNull(),
      },
    });

    if (existingCheckIn) {
      throw new ConflictException('User already checked in');
    }

    // If entry provided, validate and mark as used
    if (dto.entry_id) {
      await this.useEntry(dto.entry_id);
    }

    const checkIn = this.checkInOutRepository.create({
      restaurant_id: dto.restaurant_id,
      user_id: userId,
      entry_id: dto.entry_id,
      check_in_at: new Date(),
    });

    return this.checkInOutRepository.save(checkIn);
  }

  /**
   * Check out user
   */
  async checkOut(dto: CheckOutDto): Promise<ClubCheckInOut> {
    const checkIn = await this.checkInOutRepository.findOne({
      where: { id: dto.check_in_id },
    });

    if (!checkIn) {
      throw new NotFoundException('Check-in record not found');
    }

    if (checkIn.check_out_at) {
      throw new BadRequestException('User already checked out');
    }

    checkIn.check_out_at = new Date();
    return this.checkInOutRepository.save(checkIn);
  }

  /**
   * Get entries for a specific event/date
   */
  async getEventEntries(restaurantId: string, eventDate: Date): Promise<ClubEntry[]> {
    return this.entryRepository.find({
      where: {
        restaurant_id: restaurantId,
        event_date: eventDate,
      },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  private generateQRCode(): string {
    return `ENTRY-${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
  }

  private isYesterday(date: Date, today: Date): boolean {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }
}
