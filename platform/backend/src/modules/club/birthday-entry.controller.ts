import { Controller, Get, Post, Put, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BirthdayEntryService } from './birthday-entry.service';
import { RequestBirthdayEntryDto, ApproveBirthdayEntryDto, RejectBirthdayEntryDto } from './dto';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('Birthday Entries')
@Controller('birthday-entries')
@ApiBearerAuth()
export class BirthdayEntryController {
  constructor(private readonly birthdayService: BirthdayEntryService) {}

  @Post()
  @ApiOperation({ summary: 'Request a birthday entry' })
  async requestEntry(@Req() req: AuthenticatedRequest, @Body() dto: RequestBirthdayEntryDto) {
    return this.birthdayService.requestBirthdayEntry(req.user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my birthday entries' })
  async getMyEntries(@Req() req: AuthenticatedRequest) {
    return this.birthdayService.getUserBirthdayEntries(req.user.id);
  }

  @Get('restaurant/:restaurantId/pending')
  @ApiOperation({ summary: 'Get pending birthday entries for restaurant (staff)' })
  async getPendingEntries(
    @Param('restaurantId') restaurantId: string,
    @Query('eventDate') eventDate?: string,
  ) {
    return this.birthdayService.getPendingEntries(
      restaurantId,
      eventDate ? new Date(eventDate) : undefined,
    );
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate birthday entry QR code at door' })
  async validateEntry(@Param('id') qrCode: string) {
    return this.birthdayService.validateBirthdayEntry(qrCode);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve a birthday entry (staff)' })
  async approveEntry(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: ApproveBirthdayEntryDto,
  ) {
    return this.birthdayService.approveBirthdayEntry(id, req.user.id, dto);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject a birthday entry (staff)' })
  async rejectEntry(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RejectBirthdayEntryDto,
  ) {
    return this.birthdayService.rejectBirthdayEntry(id, req.user.id, dto);
  }

  @Put(':id/use')
  @ApiOperation({ summary: 'Mark birthday entry as used (check-in)' })
  async useEntry(
    @Param('id') id: string,
    @Query('companionsCheckedIn') companionsCheckedIn?: number,
  ) {
    return this.birthdayService.useBirthdayEntry(id, companionsCheckedIn);
  }
}
