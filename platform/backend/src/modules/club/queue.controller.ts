import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { JoinQueueDto } from './dto';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('Virtual Queue')
@Controller('queue')
@ApiBearerAuth()
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  @ApiOperation({ summary: 'Join the virtual queue' })
  async joinQueue(@Req() req: AuthenticatedRequest, @Body() dto: JoinQueueDto) {
    return this.queueService.joinQueue(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my queue position' })
  async getMyPosition(
    @Req() req: AuthenticatedRequest,
    @Query('restaurantId') restaurantId: string,
  ) {
    return this.queueService.getMyQueueEntry(req.user.id, restaurantId);
  }

  @Delete('my')
  @ApiOperation({ summary: 'Leave the queue' })
  async leaveQueue(
    @Req() req: AuthenticatedRequest,
    @Query('restaurantId') restaurantId: string,
  ) {
    return this.queueService.leaveQueue(req.user.id, restaurantId);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get queue for restaurant (staff)' })
  async getQueue(@Param('restaurantId') restaurantId: string) {
    return this.queueService.getQueue(restaurantId);
  }

  @Get('restaurant/:restaurantId/stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  async getQueueStats(@Param('restaurantId') restaurantId: string) {
    return this.queueService.getQueueStats(restaurantId);
  }

  @Post('restaurant/:restaurantId/call-next')
  @ApiOperation({ summary: 'Call next person in queue (staff)' })
  async callNext(
    @Param('restaurantId') restaurantId: string,
    @Query('priorityLevelId') priorityLevelId?: string,
  ) {
    return this.queueService.callNext(restaurantId, priorityLevelId);
  }

  @Put(':id/confirm-entry')
  @ApiOperation({ summary: 'Confirm entry (person showed up)' })
  async confirmEntry(@Param('id') id: string) {
    return this.queueService.confirmEntry(id);
  }

  @Put(':id/no-show')
  @ApiOperation({ summary: 'Mark as no-show' })
  async markNoShow(@Param('id') id: string) {
    return this.queueService.markNoShow(id);
  }
}
