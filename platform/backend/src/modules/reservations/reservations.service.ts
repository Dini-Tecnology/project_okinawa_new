import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserRole } from '@/common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, MoreThan, IsNull, Between, Not, In } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateGroupBookingDto } from './dto/create-group-booking.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from '@common/enums';
import { PaginationDto, paginate, toPaginationDto } from '@/common/dto/pagination.dto';
import { ORDERS } from '@common/constants/limits';
import { ReservationsGateway } from './reservations.gateway';
import { TablesService } from '@/modules/tables/tables.service';
import { TableStatus } from '@/modules/tables/entities/restaurant-table.entity';

/** Minimum party size to qualify as a group booking */
const GROUP_BOOKING_MIN_SIZE = ORDERS.GROUP_BOOKING_MIN_SIZE;

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    private dataSource: DataSource,
    private reservationsGateway: ReservationsGateway,
    private tablesService: TablesService,
  ) {}

  async create(userId: string, createReservationDto: CreateReservationDto) {
    // F10: Chef's Table capacity validation
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: createReservationDto.restaurant_id },
      });

      if (restaurant?.service_type === 'chefs-table') {
        const existingCount = await this.reservationRepository.count({
          where: {
            restaurant_id: createReservationDto.restaurant_id,
            reservation_date: createReservationDto.reservation_date as any,
            status: Not(In([ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW])),
          },
        });
        const maxCovers = 12; // Chef's table default capacity
        if (existingCount + createReservationDto.party_size > maxCovers) {
          throw new BadRequestException("Chef's table is fully booked for this date");
        }
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      // Non-blocking: if service type check fails, proceed with reservation
      this.logger.warn(`Chef's table capacity check failed: ${(error as Error).message}`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = this.reservationRepository.create({
        ...createReservationDto,
        user_id: userId,
        status: ReservationStatus.PENDING,
      });

      const savedReservation = await queryRunner.manager.save(reservation);
      await queryRunner.commitTransaction();

      this.logger.log(`Reservation created: ${savedReservation.id}`);

      // If a table was assigned, mark it as reserved
      if (savedReservation.table_id) {
        try {
          await this.tablesService.assignToReservation(savedReservation.table_id, savedReservation.id);
          this.logger.log(`Table ${savedReservation.table_id} marked as reserved for reservation ${savedReservation.id}`);
        } catch (tableErr) {
          const tErr = tableErr as Error;
          this.logger.warn(`Failed to reserve table ${savedReservation.table_id}: ${tErr.message}`);
        }
      }

      // Emit WebSocket event to restaurant staff
      this.reservationsGateway.notifyReservationCreated({
        id: savedReservation.id,
        restaurant_id: savedReservation.restaurant_id,
        user_id: savedReservation.user_id,
        status: savedReservation.status,
        party_size: savedReservation.party_size,
        reservation_time: savedReservation.reservation_time,
      });

      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;
      this.logger.error(`Failed to create reservation: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to create reservation');
    } finally {
      await queryRunner.release();
    }
  }

  async findByRestaurant(restaurantId: string, pagination?: PaginationDto) {
    const dto = toPaginationDto(pagination);

    const [items, total] = await this.reservationRepository.findAndCount({
      where: { restaurant_id: restaurantId },
      relations: ['user'],
      order: { reservation_date: 'ASC', reservation_time: 'ASC' },
      skip: dto.offset,
      take: dto.limit,
    });

    return paginate(items, total, dto);
  }

  async findByUser(userId: string, pagination?: PaginationDto) {
    const dto = toPaginationDto(pagination);

    const [items, total] = await this.reservationRepository.findAndCount({
      where: { user_id: userId },
      relations: ['restaurant'],
      order: { reservation_date: 'DESC' },
      skip: dto.offset,
      take: dto.limit,
    });

    return paginate(items, total, dto);
  }

  async findOne(id: string, userId?: string, roles?: UserRole[]) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['restaurant', 'user'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // SECURITY: Verify access permission
    if (userId && roles) {
      const isStaff = roles.some(role =>
        [UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE, UserRole.WAITER].includes(role)
      );

      // If not staff, must be the owner of the reservation
      if (!isStaff && reservation.user_id !== userId) {
        throw new ForbiddenException('Access denied');
      }
    }

    return reservation;
  }

  async updateStatus(id: string, updateStatusDto: UpdateReservationStatusDto) {
    const reservation = await this.findOne(id);
    reservation.status = updateStatusDto.status;

    if (updateStatusDto.table_id) {
      reservation.table_id = updateStatusDto.table_id;
    }

    if (updateStatusDto.status === ReservationStatus.CONFIRMED) {
      reservation.confirmed_at = new Date();

      // FIX-8: Push notification placeholder — reservation confirmed
      this.logger.debug(
        `[PUSH_PENDING] Notification to user ${reservation.user_id} — requires FCM integration`,
      );
    }

    if (updateStatusDto.status === ReservationStatus.SEATED) {
      reservation.seated_at = new Date();
    }

    if (updateStatusDto.status === ReservationStatus.COMPLETED) {
      reservation.completed_at = new Date();
    }

    if (updateStatusDto.status === ReservationStatus.CANCELLED) {
      reservation.cancelled_at = new Date();

      // Free the table if one was assigned
      if (reservation.table_id) {
        try {
          await this.tablesService.updateStatus(reservation.table_id, { status: TableStatus.AVAILABLE });
          this.logger.log(`Table ${reservation.table_id} freed after reservation ${id} cancelled`);
        } catch (tableErr) {
          const tErr = tableErr as Error;
          this.logger.warn(`Failed to free table ${reservation.table_id}: ${tErr.message}`);
        }
      }
    }

    const updated = await this.reservationRepository.save(reservation);

    // Emit WebSocket event to restaurant staff and user
    this.reservationsGateway.notifyReservationUpdated({
      id: updated.id,
      restaurant_id: updated.restaurant_id,
      user_id: updated.user_id,
      status: updated.status,
      party_size: updated.party_size,
      reservation_time: updated.reservation_time,
    });

    return updated;
  }

  /**
   * Update reservation details
   */
  async update(id: string, updateReservationDto: UpdateReservationDto, userId?: string, roles?: UserRole[]) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // SECURITY: Verify access permission
    if (userId && roles) {
      const isStaff = roles.some(role =>
        [UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE].includes(role)
      );

      // If not staff, must be the owner of the reservation
      if (!isStaff && reservation.user_id !== userId) {
        throw new ForbiddenException('Access denied');
      }
    }

    // Update basic fields
    if (updateReservationDto.reservation_time !== undefined) {
      reservation.reservation_time = updateReservationDto.reservation_time;
    }

    if (updateReservationDto.party_size !== undefined) {
      reservation.party_size = updateReservationDto.party_size;
    }

    if (updateReservationDto.special_requests !== undefined) {
      reservation.special_requests = updateReservationDto.special_requests;
    }

    if (updateReservationDto.table_id !== undefined) {
      reservation.table_id = updateReservationDto.table_id;
    }

    // Update status and related timestamps
    if (updateReservationDto.status) {
      reservation.status = updateReservationDto.status;

      if (updateReservationDto.status === ReservationStatus.CONFIRMED) {
        reservation.confirmed_at = new Date();
      }

      if (updateReservationDto.status === ReservationStatus.SEATED) {
        reservation.seated_at = new Date();
      }

      if (updateReservationDto.status === ReservationStatus.COMPLETED) {
        reservation.completed_at = new Date();
      }

      if (updateReservationDto.status === ReservationStatus.CANCELLED) {
        reservation.cancelled_at = new Date();

        // Free the table if one was assigned
        if (reservation.table_id) {
          try {
            await this.tablesService.updateStatus(reservation.table_id, { status: TableStatus.AVAILABLE });
            this.logger.log(`Table ${reservation.table_id} freed after reservation ${id} cancelled (update)`);
          } catch (tableErr) {
            const tErr = tableErr as Error;
            this.logger.warn(`Failed to free table ${reservation.table_id}: ${tErr.message}`);
          }
        }
      }
    }

    return this.reservationRepository.save(reservation);
  }

  // ========== GROUP BOOKING METHODS (EPIC 17) ==========

  /**
   * Create a group booking reservation
   * Validates group-specific requirements: minimum party size, coordinator info
   */
  async createGroupBooking(userId: string, dto: CreateGroupBookingDto) {
    // Validate minimum group size
    if (dto.party_size < GROUP_BOOKING_MIN_SIZE) {
      throw new BadRequestException(
        `Group bookings require at least ${GROUP_BOOKING_MIN_SIZE} guests. Use standard reservation for smaller parties.`,
      );
    }

    // Validate coordinator info is present
    if (!dto.group_coordinator_name || !dto.group_coordinator_phone) {
      throw new BadRequestException(
        'Group bookings require coordinator name and phone number',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = this.reservationRepository.create({
        restaurant_id: dto.restaurant_id,
        user_id: userId,
        reservation_date: new Date(dto.reservation_date),
        reservation_time: dto.reservation_time,
        party_size: dto.party_size,
        seating_preference: dto.seating_preference,
        occasion: dto.occasion,
        special_requests: dto.special_requests,
        dietary_restrictions: dto.dietary_restrictions,
        contact_phone: dto.contact_phone,
        status: ReservationStatus.PENDING,
        // Group booking specific fields
        is_group_booking: true,
        group_size: dto.party_size,
        group_coordinator_name: dto.group_coordinator_name,
        group_coordinator_phone: dto.group_coordinator_phone,
        pre_fixed_menu: dto.pre_fixed_menu ?? false,
        pre_fixed_menu_id: dto.pre_fixed_menu_id ?? null,
        deposit_required: dto.deposit_required ?? false,
        deposit_amount: dto.deposit_amount ?? null,
      });

      const savedReservation = await queryRunner.manager.save(reservation);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Group booking created: ${savedReservation.id} (${dto.party_size} guests, coordinator: ${dto.group_coordinator_name})`,
      );
      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;
      this.logger.error(`Failed to create group booking: ${err.message}`, err.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create group booking');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find group bookings for a specific restaurant
   * Only returns reservations where is_group_booking = true
   */
  async findGroupByRestaurant(restaurantId: string, pagination?: PaginationDto) {
    const dto = toPaginationDto(pagination);

    const [items, total] = await this.reservationRepository.findAndCount({
      where: {
        restaurant_id: restaurantId,
        is_group_booking: true,
      },
      relations: ['user'],
      order: { reservation_date: 'ASC', reservation_time: 'ASC' },
      skip: dto.offset,
      take: dto.limit,
    });

    return paginate(items, total, dto);
  }

  // ========== CRON JOBS (GAP Sprint 3) ==========

  /**
   * Send reminders for reservations within 2 hours from now.
   * Runs every 30 minutes.
   */
  @Cron('0 */30 * * * *')
  async sendReminders(): Promise<void> {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    try {
      const reservations = await this.reservationRepository.find({
        where: {
          status: ReservationStatus.CONFIRMED,
          reservation_date: Between(now, twoHoursFromNow),
          reminder_sent_at: IsNull(),
        },
        relations: ['user', 'restaurant'],
      });

      if (reservations.length === 0) return;

      this.logger.log(`[Reminder Cron] Found ${reservations.length} reservations needing reminders`);

      for (const reservation of reservations) {
        // Send reminder via WebSocket to user
        this.reservationsGateway.server.to(`user:${reservation.user_id}`).emit('reservation:reminder', {
          reservation_id: reservation.id,
          restaurant_name: reservation.restaurant?.name || '',
          reservation_time: reservation.reservation_time,
          message: `Your reservation at ${reservation.restaurant?.name || 'the restaurant'} is in 2 hours`,
        });

        this.logger.log(
          `[Reminder] Sent to user ${reservation.user_id.slice(0, 8)} — ` +
          `restaurant ${reservation.restaurant_id.slice(0, 8)}, ` +
          `time: ${reservation.reservation_time}`,
        );

        reservation.reminder_sent_at = now;
      }

      await this.reservationRepository.save(reservations);
      this.logger.log(`[Reminder Cron] Sent ${reservations.length} reminders`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`[Reminder Cron] Failed: ${err.message}`, err.stack);
    }
  }

  /**
   * Mark no-shows: reservations past 30 minutes that were never seated.
   * Runs every hour.
   */
  @Cron('0 0 * * * *')
  async markNoShows(): Promise<void> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    try {
      const result = await this.reservationRepository
        .createQueryBuilder()
        .update(Reservation)
        .set({ status: ReservationStatus.NO_SHOW })
        .where('status = :status', { status: ReservationStatus.CONFIRMED })
        .andWhere('reservation_date < :cutoff', { cutoff: thirtyMinutesAgo })
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.log(`[No-Show Cron] Marked ${result.affected} reservations as no-show`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`[No-Show Cron] Failed: ${err.message}`, err.stack);
    }
  }
}
