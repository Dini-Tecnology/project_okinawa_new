import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VipTableReservationsService } from './vip-table-reservations.service';
import { CreateVipTableReservationDto, InviteVipTableGuestDto, RespondToVipInviteDto } from './dto';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('VIP Table Reservations')
@Controller('table-reservations')
@ApiBearerAuth()
export class VipTableReservationsController {
  constructor(private readonly reservationsService: VipTableReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a VIP table reservation' })
  async createReservation(@Req() req: AuthenticatedRequest, @Body() dto: CreateVipTableReservationDto) {
    return this.reservationsService.createReservation(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my VIP table reservations' })
  async getMyReservations(@Req() req: AuthenticatedRequest) {
    return this.reservationsService.getUserReservations(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation details' })
  async getReservation(@Param('id') id: string) {
    return this.reservationsService.findById(id);
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm a pending reservation' })
  async confirmReservation(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.reservationsService.confirmReservation(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a reservation' })
  async cancelReservation(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body('reason') reason?: string,
  ) {
    return this.reservationsService.cancelReservation(id, req.user.id, reason);
  }

  @Post(':id/guests')
  @ApiOperation({ summary: 'Invite a guest to VIP table' })
  async inviteGuest(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: InviteVipTableGuestDto,
  ) {
    return this.reservationsService.inviteGuest(id, req.user.id, dto);
  }

  @Post('invites/respond')
  @ApiOperation({ summary: 'Respond to a VIP table invite' })
  async respondToInvite(@Req() req: AuthenticatedRequest, @Body() dto: RespondToVipInviteDto) {
    return this.reservationsService.respondToInvite(req.user.id, dto);
  }

  @Put('guests/:guestId/check-in')
  @ApiOperation({ summary: 'Check in a guest (staff)' })
  async checkInGuest(@Param('guestId') guestId: string) {
    return this.reservationsService.checkInGuest(guestId);
  }

  @Delete(':id/guests/:guestId')
  @ApiOperation({ summary: 'Remove a guest from reservation' })
  async removeGuest(
    @Param('id') id: string,
    @Param('guestId') guestId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservationsService.removeGuest(id, req.user.id, guestId);
  }

  @Get('restaurant/:restaurantId/event/:date')
  @ApiOperation({ summary: 'Get reservations for event (staff)' })
  async getEventReservations(
    @Param('restaurantId') restaurantId: string,
    @Param('date') date: string,
  ) {
    return this.reservationsService.getEventReservations(restaurantId, new Date(date));
  }
}
