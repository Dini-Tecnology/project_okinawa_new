import { Controller, Get, Post, Put, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WaiterCallsService } from './waiter-calls.service';
import { CreateWaiterCallDto } from './dto';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('Waiter Calls')
@Controller('waiter-calls')
@ApiBearerAuth()
export class WaiterCallsController {
  constructor(private readonly waiterCallsService: WaiterCallsService) {}

  @Post()
  @ApiOperation({ summary: 'Call a waiter' })
  async createCall(@Req() req: AuthenticatedRequest, @Body() dto: CreateWaiterCallDto) {
    return this.waiterCallsService.createCall(req.user.id, dto);
  }

  @Put(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a waiter call (staff)' })
  async acknowledgeCall(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.waiterCallsService.acknowledgeCall(id, req.user.id);
  }

  @Put(':id/resolve')
  @ApiOperation({ summary: 'Resolve a waiter call' })
  async resolveCall(@Param('id') id: string) {
    return this.waiterCallsService.resolveCall(id);
  }

  @Get('restaurant/:restaurantId/pending')
  @ApiOperation({ summary: 'Get pending waiter calls for restaurant' })
  async getPendingCalls(@Param('restaurantId') restaurantId: string) {
    return this.waiterCallsService.getPendingCalls(restaurantId);
  }
}
