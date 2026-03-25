import { Controller, Get, Post, Put, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClubEntriesService } from './club-entries.service';
import { PurchaseClubEntryDto, ValidateClubEntryDto, CheckInDto, CheckOutDto } from './dto';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('Club Entries')
@Controller('club-entries')
@ApiBearerAuth()
export class ClubEntriesController {
  constructor(private readonly entriesService: ClubEntriesService) {}

  @Post()
  @ApiOperation({ summary: 'Purchase entry ticket(s)' })
  async purchaseEntry(@Req() req: AuthenticatedRequest, @Body() dto: PurchaseClubEntryDto) {
    return this.entriesService.purchaseEntry(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my entries' })
  async getMyEntries(
    @Req() req: AuthenticatedRequest,
    @Query('includeUsed') includeUsed?: boolean,
  ) {
    return this.entriesService.getUserEntries(req.user.id, includeUsed);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate entry at door (staff)' })
  async validateEntry(@Body() dto: ValidateClubEntryDto) {
    return this.entriesService.validateEntry(dto);
  }

  @Put(':id/use')
  @ApiOperation({ summary: 'Mark entry as used (staff)' })
  async useEntry(@Param('id') id: string) {
    return this.entriesService.useEntry(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel an entry' })
  async cancelEntry(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.entriesService.cancelEntry(id, req.user.id);
  }

  @Post('check-in')
  @ApiOperation({ summary: 'Check in to venue' })
  async checkIn(@Req() req: AuthenticatedRequest, @Body() dto: CheckInDto) {
    return this.entriesService.checkIn(req.user.id, dto);
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Check out from venue' })
  async checkOut(@Body() dto: CheckOutDto) {
    return this.entriesService.checkOut(dto);
  }

  @Get('restaurant/:restaurantId/event/:date')
  @ApiOperation({ summary: 'Get entries for event date (staff)' })
  async getEventEntries(
    @Param('restaurantId') restaurantId: string,
    @Param('date') date: string,
  ) {
    return this.entriesService.getEventEntries(restaurantId, new Date(date));
  }
}
