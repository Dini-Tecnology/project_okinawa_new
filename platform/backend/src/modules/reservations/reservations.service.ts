import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { UserRole } from '@/common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateGroupBookingDto } from './dto/create-group-booking.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from '@common/enums';
import { PaginationDto, paginate, toPaginationDto } from '@/common/dto/pagination.dto';
import { ORDERS } from '@common/constants/limits';

/** Minimum party size to qualify as a group booking */
const GROUP_BOOKING_MIN_SIZE = ORDERS.GROUP_BOOKING_MIN_SIZE;

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createReservationDto: CreateReservationDto) {
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
    }

    if (updateStatusDto.status === ReservationStatus.SEATED) {
      reservation.seated_at = new Date();
    }

    if (updateStatusDto.status === ReservationStatus.COMPLETED) {
      reservation.completed_at = new Date();
    }

    if (updateStatusDto.status === ReservationStatus.CANCELLED) {
      reservation.cancelled_at = new Date();
    }

    return this.reservationRepository.save(reservation);
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
}
