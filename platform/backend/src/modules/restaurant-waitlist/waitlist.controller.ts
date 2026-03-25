import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WaitlistService } from './waitlist.service';
import { WaitlistGateway } from './waitlist.gateway';
import {
  JoinWaitlistDto,
  CallGuestDto,
  AddBarOrderDto,
  UpdateWaitlistEntryDto,
} from './dto';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('Restaurant Waitlist')
@Controller('restaurant/waitlist')
@ApiBearerAuth()
export class WaitlistController {
  constructor(
    private readonly waitlistService: WaitlistService,
    private readonly waitlistGateway: WaitlistGateway,
  ) {}

  /**
   * CLIENT — Join the waitlist
   */
  @Post()
  @ApiOperation({ summary: 'Join the restaurant waitlist' })
  async joinWaitlist(@Req() req: AuthenticatedRequest, @Body() dto: JoinWaitlistDto) {
    const userId = req.user?.id || null;
    const result = await this.waitlistService.joinWaitlist(dto, userId);

    // Notify waitlist room about new entry
    const stats = await this.waitlistService.getStats(dto.restaurant_id);
    this.waitlistGateway.notifyWaitlistUpdate(dto.restaurant_id, {
      type: 'new_entry',
      entryId: result.id,
      newPosition: result.position,
      estimatedWaitMinutes: result.estimatedWaitMinutes,
      queueStats: {
        totalWaiting: stats.totalWaiting,
        tablesAvailable: stats.tablesAvailable,
        avgWaitMinutes: stats.avgWaitMinutes,
      },
    });

    return result;
  }

  /**
   * CLIENT — Get my position in the waitlist
   */
  @Get('my')
  @ApiOperation({ summary: 'Get my current waitlist position' })
  @ApiQuery({ name: 'restaurant_id', required: true })
  async getMyPosition(
    @Req() req: AuthenticatedRequest,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.waitlistService.getMyPosition(req.user.id, restaurantId);
  }

  /**
   * CLIENT / ANONYMOUS — Get position by entry ID
   */
  @Get('position/:id')
  @ApiOperation({ summary: 'Get waitlist position by entry ID' })
  @ApiParam({ name: 'id', description: 'Waitlist entry ID' })
  async getPositionById(@Param('id') id: string) {
    return this.waitlistService.getPositionById(id);
  }

  /**
   * RESTAURANT (MAITRE, MANAGER, OWNER) — Get full waitlist
   */
  @Get(':restaurantId')
  @ApiOperation({ summary: 'Get active waitlist for restaurant (staff)' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  async getWaitlist(@Param('restaurantId') restaurantId: string) {
    return this.waitlistService.getWaitlist(restaurantId);
  }

  /**
   * RESTAURANT — Get waitlist stats
   */
  @Get(':restaurantId/stats')
  @ApiOperation({ summary: 'Get waitlist statistics' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  async getStats(@Param('restaurantId') restaurantId: string) {
    return this.waitlistService.getStats(restaurantId);
  }

  /**
   * MAITRE — Call a guest
   */
  @Patch(':id/call')
  @ApiOperation({ summary: 'Call a guest from the waitlist (staff)' })
  @ApiParam({ name: 'id', description: 'Waitlist entry ID' })
  async callGuest(@Param('id') id: string, @Body() dto: CallGuestDto) {
    const entry = await this.waitlistService.callGuest(id, dto);

    // Notify the specific customer they are being called
    if (entry.customer_id) {
      this.waitlistGateway.notifyUserCalled(entry.restaurant_id, entry.customer_id, {
        entryId: entry.id,
        tableNumber: dto.table_number,
        message: dto.message,
      });
    }

    // Notify waitlist room
    const stats = await this.waitlistService.getStats(entry.restaurant_id);
    this.waitlistGateway.notifyWaitlistUpdate(entry.restaurant_id, {
      type: 'called',
      entryId: entry.id,
      tableNumber: dto.table_number,
      queueStats: {
        totalWaiting: stats.totalWaiting,
        tablesAvailable: stats.tablesAvailable,
        avgWaitMinutes: stats.avgWaitMinutes,
      },
    });

    return entry;
  }

  /**
   * MAITRE — Mark guest as seated
   */
  @Patch(':id/seat')
  @ApiOperation({ summary: 'Mark guest as seated (staff)' })
  @ApiParam({ name: 'id', description: 'Waitlist entry ID' })
  async seatGuest(@Param('id') id: string) {
    const entry = await this.waitlistService.seatGuest(id);

    // Notify waitlist room with updated stats
    const stats = await this.waitlistService.getStats(entry.restaurant_id);
    this.waitlistGateway.notifyWaitlistUpdate(entry.restaurant_id, {
      type: 'seated',
      entryId: entry.id,
      queueStats: {
        totalWaiting: stats.totalWaiting,
        tablesAvailable: stats.tablesAvailable,
        avgWaitMinutes: stats.avgWaitMinutes,
      },
    });

    // Refresh the whole queue for staff
    const queue = await this.waitlistService.getWaitlist(entry.restaurant_id);
    this.waitlistGateway.notifyQueueRefresh(entry.restaurant_id, queue);

    return entry;
  }

  /**
   * MAITRE — Mark guest as no-show
   */
  @Patch(':id/no-show')
  @ApiOperation({ summary: 'Mark guest as no-show (staff)' })
  @ApiParam({ name: 'id', description: 'Waitlist entry ID' })
  async markNoShow(@Param('id') id: string) {
    const entry = await this.waitlistService.markNoShow(id);

    // Notify waitlist room
    const stats = await this.waitlistService.getStats(entry.restaurant_id);
    this.waitlistGateway.notifyWaitlistUpdate(entry.restaurant_id, {
      type: 'no_show',
      entryId: entry.id,
      queueStats: {
        totalWaiting: stats.totalWaiting,
        tablesAvailable: stats.tablesAvailable,
        avgWaitMinutes: stats.avgWaitMinutes,
      },
    });

    // Refresh queue for staff
    const queue = await this.waitlistService.getWaitlist(entry.restaurant_id);
    this.waitlistGateway.notifyQueueRefresh(entry.restaurant_id, queue);

    return entry;
  }

  /**
   * CLIENT — Cancel own spot
   */
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel own waitlist spot' })
  @ApiParam({ name: 'id', description: 'Waitlist entry ID' })
  async cancelEntry(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user?.id || null;
    const entry = await this.waitlistService.cancelEntry(id, userId);

    // Notify waitlist room
    const stats = await this.waitlistService.getStats(entry.restaurant_id);
    this.waitlistGateway.notifyWaitlistUpdate(entry.restaurant_id, {
      type: 'cancelled',
      entryId: entry.id,
      queueStats: {
        totalWaiting: stats.totalWaiting,
        tablesAvailable: stats.tablesAvailable,
        avgWaitMinutes: stats.avgWaitMinutes,
      },
    });

    return entry;
  }

  /**
   * CLIENT — Add bar order while waiting
   */
  @Post(':id/bar-order')
  @ApiOperation({ summary: 'Add bar order while waiting' })
  @ApiParam({ name: 'id', description: 'Waitlist entry ID' })
  async addBarOrder(@Param('id') id: string, @Body() dto: AddBarOrderDto) {
    const entry = await this.waitlistService.addBarOrder(id, dto);

    // Notify waitlist room about bar order
    const stats = await this.waitlistService.getStats(entry.restaurant_id);
    this.waitlistGateway.notifyWaitlistUpdate(entry.restaurant_id, {
      type: 'bar_order',
      entryId: entry.id,
      queueStats: {
        totalWaiting: stats.totalWaiting,
        tablesAvailable: stats.tablesAvailable,
        avgWaitMinutes: stats.avgWaitMinutes,
      },
    });

    return entry;
  }

  /**
   * CLIENT — Update family info (kids ages, allergies)
   */
  @Patch(':id/family')
  @ApiOperation({ summary: 'Update family mode info' })
  @ApiParam({ name: 'id', description: 'Waitlist entry ID' })
  async updateFamilyInfo(
    @Param('id') id: string,
    @Body() dto: UpdateWaitlistEntryDto,
  ) {
    return this.waitlistService.updateFamilyInfo(id, dto);
  }
}
