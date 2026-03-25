import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GuestListService } from './guest-list.service';
import { JoinGuestListDto } from './dto';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('Guest List')
@Controller('guest-list')
@ApiBearerAuth()
export class GuestListController {
  constructor(private readonly guestListService: GuestListService) {}

  @Post()
  @ApiOperation({ summary: 'Join guest list for an event' })
  async joinGuestList(@Req() req: AuthenticatedRequest, @Body() dto: JoinGuestListDto) {
    return this.guestListService.joinGuestList(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my guest list entries' })
  async getMyEntries(@Req() req: AuthenticatedRequest) {
    return this.guestListService.getUserGuestListEntries(req.user.id);
  }

  @Post('validate/:qrCode')
  @ApiOperation({ summary: 'Validate guest list entry (staff)' })
  async validateEntry(@Param('qrCode') qrCode: string) {
    return this.guestListService.validateGuestListEntry(qrCode);
  }

  @Put(':id/use')
  @ApiOperation({ summary: 'Mark guest list entry as used (staff)' })
  async useEntry(@Param('id') id: string) {
    return this.guestListService.useGuestListEntry(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel guest list entry' })
  async cancelEntry(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.guestListService.cancelEntry(id, req.user.id);
  }

  @Get('restaurant/:restaurantId/event/:date')
  @ApiOperation({ summary: 'Get guest list for event (staff)' })
  async getEventGuestList(
    @Param('restaurantId') restaurantId: string,
    @Param('date') date: string,
  ) {
    return this.guestListService.getEventGuestList(restaurantId, new Date(date));
  }

  @Get('promoter/:promoterId/stats')
  @ApiOperation({ summary: 'Get promoter stats' })
  async getPromoterStats(
    @Param('promoterId') promoterId: string,
    @Query('restaurantId') restaurantId?: string,
  ) {
    return this.guestListService.getPromoterStats(promoterId, restaurantId);
  }
}
