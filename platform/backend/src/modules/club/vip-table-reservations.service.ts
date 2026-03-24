import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VipTableReservation, VipTableGuest, ClubEntry } from './entities';
import { VipTableReservationStatus, VipTableGuestStatus, ClubEntryPurchaseType, ClubEntryStatus } from '@/common/enums';
import { CreateVipTableReservationDto, InviteVipTableGuestDto, RespondToVipInviteDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VipTableReservationsService {
  constructor(
    @InjectRepository(VipTableReservation)
    private reservationRepository: Repository<VipTableReservation>,
    @InjectRepository(VipTableGuest)
    private guestRepository: Repository<VipTableGuest>,
    @InjectRepository(ClubEntry)
    private entryRepository: Repository<ClubEntry>,
  ) {}

  /**
   * Create a VIP table reservation
   */
  async createReservation(hostUserId: string, dto: CreateVipTableReservationDto): Promise<VipTableReservation> {
    const reservation = this.reservationRepository.create({
      restaurant_id: dto.restaurant_id,
      table_type_id: dto.table_type_id,
      table_id: dto.table_id,
      host_user_id: hostUserId,
      event_date: dto.event_date,
      party_size: dto.party_size,
      minimum_spend: dto.minimum_spend,
      deposit_amount: dto.deposit_amount || 0,
      deposit_credit: dto.deposit_amount || 0, // Deposit becomes credit
      status: dto.deposit_amount 
        ? VipTableReservationStatus.CONFIRMED 
        : VipTableReservationStatus.PENDING_CONFIRMATION,
      invite_token: uuidv4(),
      special_requests: dto.special_requests,
    });

    const savedReservation = await this.reservationRepository.save(reservation);

    // Generate entry for host
    await this.generateEntryForGuest(savedReservation, hostUserId, true);

    return this.findById(savedReservation.id);
  }

  /**
   * Find reservation by ID with relations
   */
  async findById(id: string): Promise<VipTableReservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['guests', 'guests.user', 'guests.entry', 'tabs', 'host'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  /**
   * Confirm a pending reservation
   */
  async confirmReservation(reservationId: string, hostUserId: string): Promise<VipTableReservation> {
    const reservation = await this.findById(reservationId);

    if (reservation.host_user_id !== hostUserId) {
      throw new ForbiddenException('Only the host can confirm the reservation');
    }

    if (reservation.status !== VipTableReservationStatus.PENDING_CONFIRMATION) {
      throw new BadRequestException('Reservation is not pending confirmation');
    }

    reservation.status = VipTableReservationStatus.CONFIRMED;
    reservation.confirmed_at = new Date();

    return this.reservationRepository.save(reservation);
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId: string, hostUserId: string, reason?: string): Promise<VipTableReservation> {
    const reservation = await this.findById(reservationId);

    if (reservation.host_user_id !== hostUserId) {
      throw new ForbiddenException('Only the host can cancel the reservation');
    }

    if (reservation.status === VipTableReservationStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed reservation');
    }

    reservation.status = VipTableReservationStatus.CANCELLED;
    reservation.cancelled_at = new Date();
    reservation.cancellation_reason = reason ?? '';

    // Cancel all guest entries
    for (const guest of reservation.guests) {
      if (guest.entry_id) {
        await this.entryRepository.update(guest.entry_id, { status: ClubEntryStatus.CANCELLED });
      }
    }

    return this.reservationRepository.save(reservation);
  }

  /**
   * Invite a guest to the VIP table
   */
  async inviteGuest(reservationId: string, hostUserId: string, dto: InviteVipTableGuestDto): Promise<VipTableGuest> {
    const reservation = await this.findById(reservationId);

    if (reservation.host_user_id !== hostUserId) {
      throw new ForbiddenException('Only the host can invite guests');
    }

    // Check party size limit
    const activeGuests = reservation.guests.filter(
      g => g.status !== VipTableGuestStatus.DECLINED
    );
    if (activeGuests.length >= reservation.party_size) {
      throw new BadRequestException('Party size limit reached');
    }

    const guest = this.guestRepository.create({
      reservation_id: reservationId,
      user_id: dto.user_id,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      invite_token: uuidv4(),
      status: VipTableGuestStatus.PENDING,
    });

    return this.guestRepository.save(guest);
  }

  /**
   * Respond to a VIP table invite
   */
  async respondToInvite(userId: string, dto: RespondToVipInviteDto): Promise<VipTableGuest> {
    const guest = await this.guestRepository.findOne({
      where: { invite_token: dto.invite_token },
      relations: ['reservation'],
    });

    if (!guest) {
      throw new NotFoundException('Invitation not found');
    }

    if (guest.status !== VipTableGuestStatus.PENDING) {
      throw new BadRequestException('Invitation already responded');
    }

    guest.user_id = userId;
    guest.status = dto.response === 'confirmed' 
      ? VipTableGuestStatus.CONFIRMED 
      : VipTableGuestStatus.DECLINED;
    guest.responded_at = new Date();

    const savedGuest = await this.guestRepository.save(guest);

    // Generate entry if confirmed
    if (dto.response === 'confirmed') {
      await this.generateEntryForGuest(guest.reservation, userId, false);
    }

    return savedGuest;
  }

  /**
   * Check in a guest
   */
  async checkInGuest(guestId: string): Promise<VipTableGuest> {
    const guest = await this.guestRepository.findOne({ where: { id: guestId } });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    if (guest.status !== VipTableGuestStatus.CONFIRMED) {
      throw new BadRequestException('Guest must be confirmed to check in');
    }

    guest.status = VipTableGuestStatus.CHECKED_IN;
    guest.checked_in_at = new Date();

    return this.guestRepository.save(guest);
  }

  /**
   * Remove a guest from the reservation
   */
  async removeGuest(reservationId: string, hostUserId: string, guestId: string): Promise<void> {
    const reservation = await this.findById(reservationId);

    if (reservation.host_user_id !== hostUserId) {
      throw new ForbiddenException('Only the host can remove guests');
    }

    const guest = reservation.guests.find(g => g.id === guestId);
    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    // Cancel guest's entry if exists
    if (guest.entry_id) {
      await this.entryRepository.update(guest.entry_id, { status: ClubEntryStatus.CANCELLED });
    }

    await this.guestRepository.delete(guestId);
  }

  /**
   * Get user's VIP table reservations
   */
  async getUserReservations(userId: string): Promise<VipTableReservation[]> {
    return this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.guests', 'guests')
      .leftJoinAndSelect('reservation.restaurant', 'restaurant')
      .where('reservation.host_user_id = :userId', { userId })
      .orWhere('guests.user_id = :userId', { userId })
      .orderBy('reservation.event_date', 'DESC')
      .getMany();
  }

  /**
   * Get reservations for a restaurant/event
   */
  async getEventReservations(restaurantId: string, eventDate: Date): Promise<VipTableReservation[]> {
    return this.reservationRepository.find({
      where: {
        restaurant_id: restaurantId,
        event_date: eventDate,
      },
      relations: ['guests', 'host', 'tabs'],
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Generate entry ticket for a guest
   */
  private async generateEntryForGuest(
    reservation: VipTableReservation,
    userId: string,
    isHost: boolean,
  ): Promise<ClubEntry> {
    const entry = this.entryRepository.create({
      restaurant_id: reservation.restaurant_id,
      user_id: userId,
      event_date: reservation.event_date,
      variation_id: 'vip_table',
      variation_name: 'VIP Table Entry',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      credit_amount: isHost ? reservation.deposit_credit : 0,
      purchase_type: ClubEntryPurchaseType.TABLE_INCLUDED,
      qr_code: `VIP-${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`,
      status: ClubEntryStatus.ACTIVE,
    });

    const savedEntry = await this.entryRepository.save(entry);

    // Link to guest record if not host
    if (!isHost) {
      await this.guestRepository.update(
        { reservation_id: reservation.id, user_id: userId },
        { entry_id: savedEntry.id },
      );
    }

    return savedEntry;
  }
}
