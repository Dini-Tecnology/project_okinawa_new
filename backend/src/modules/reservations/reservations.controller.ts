import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateGroupBookingDto } from './dto/create-group-booking.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Create reservation' })
  @ApiResponse({ status: 201, description: 'Reservation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid reservation data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  create(@CurrentUser() user: any, @Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(user.id, createReservationDto);
  }

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE, UserRole.WAITER)
  @ApiOperation({ summary: 'Get reservations by restaurant (Staff only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of reservations' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.reservationsService.findByRestaurant(restaurantId, pagination);
  }

  @Get('user')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get reservations by current user' })
  @ApiResponse({ status: 200, description: 'Returns paginated user reservations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByUser(@CurrentUser() user: any, @Query() pagination: PaginationDto) {
    return this.reservationsService.findByUser(user.id, pagination);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE, UserRole.WAITER)
  @ApiOperation({ summary: 'Get reservation by ID' })
  @ApiResponse({ status: 200, description: 'Returns reservation details' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reservationsService.findOne(id, user.id, user.roles);
  }

  @Patch(':id')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Update reservation' })
  @ApiResponse({ status: 200, description: 'Reservation updated successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @CurrentUser() user: any,
  ) {
    return this.reservationsService.update(id, updateReservationDto, user.id, user.roles);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Update reservation status (Staff only)' })
  @ApiResponse({ status: 200, description: 'Reservation status updated' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateReservationStatusDto) {
    return this.reservationsService.updateStatus(id, updateStatusDto);
  }

  // ========== GROUP BOOKING ENDPOINTS (EPIC 17) ==========

  @Post('group')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Create group booking reservation (8+ guests)' })
  @ApiResponse({ status: 201, description: 'Group booking created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid group booking data or party size too small' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  createGroupBooking(
    @CurrentUser() user: any,
    @Body() createGroupBookingDto: CreateGroupBookingDto,
  ) {
    return this.reservationsService.createGroupBooking(user.id, createGroupBookingDto);
  }

  @Get('group/:restaurantId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Get group bookings by restaurant (Staff only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of group bookings' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findGroupByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.reservationsService.findGroupByRestaurant(restaurantId, pagination);
  }
}
