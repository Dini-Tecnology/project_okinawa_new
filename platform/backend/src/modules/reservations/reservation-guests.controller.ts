import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { ReservationGuestsService } from './reservation-guests.service';
import { InviteGuestDto } from './dto/invite-guest.dto';
import { RespondInviteDto } from './dto/respond-invite.dto';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('reservation-guests')
@Controller('reservation-guests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReservationGuestsController {
  constructor(private readonly reservationGuestsService: ReservationGuestsService) {}

  @Post('reservations/:reservationId/invite')
  @ApiOperation({ summary: 'Invite a guest to a reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  async inviteGuest(
    @Param('reservationId') reservationId: string,
    @Body() inviteDto: InviteGuestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservationGuestsService.inviteGuest(
      reservationId,
      req.user.sub,
      inviteDto,
    );
  }

  @Patch('invites/:guestId/respond')
  @ApiOperation({ summary: 'Respond to a reservation invitation' })
  @ApiParam({ name: 'guestId', description: 'Guest ID' })
  async respondToInvite(
    @Param('guestId') guestId: string,
    @Body() respondDto: RespondInviteDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservationGuestsService.respondToInvite(
      guestId,
      req.user.sub,
      respondDto,
    );
  }

  @Get('reservations/:reservationId/guests')
  @ApiOperation({ summary: 'Get all guests for a reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  async getGuests(@Param('reservationId') reservationId: string) {
    return this.reservationGuestsService.getGuestsByReservation(reservationId);
  }

  @Delete('reservations/:reservationId/guests/:guestId')
  @ApiOperation({ summary: 'Remove a guest from reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiParam({ name: 'guestId', description: 'Guest ID' })
  async removeGuest(
    @Param('reservationId') reservationId: string,
    @Param('guestId') guestId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.reservationGuestsService.removeGuest(
      reservationId,
      guestId,
      req.user.sub,
    );
    return { message: 'Guest removed successfully' };
  }

  @Patch('reservations/:reservationId/guests/:guestId/arrived')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE, UserRole.WAITER)
  @ApiOperation({ summary: 'Mark guest as arrived (Staff only)' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiParam({ name: 'guestId', description: 'Guest ID' })
  async markArrived(
    @Param('reservationId') reservationId: string,
    @Param('guestId') guestId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservationGuestsService.markGuestArrived(reservationId, guestId, req.user.sub);
  }

  @Get('my-invites')
  @ApiOperation({ summary: 'Get all pending invites for current user' })
  async getMyPendingInvites(@Req() req: AuthenticatedRequest) {
    return this.reservationGuestsService.getPendingInvites(req.user.sub);
  }

  @Get('invites/validate/:token')
  @ApiOperation({ summary: 'Validate an invite token (public link)' })
  @ApiParam({ name: 'token', description: 'Invite token' })
  async validateInviteToken(@Param('token') token: string) {
    return this.reservationGuestsService.validateInviteToken(token);
  }
}
