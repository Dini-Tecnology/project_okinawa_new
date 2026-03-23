import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-call.dto';
import { ServiceCallStatus } from './entities/service-call.entity';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('calls')
@Controller('calls')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a service call (any authenticated user)' })
  @ApiResponse({ status: 201, description: 'Service call created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid call data' })
  create(@Body() dto: CreateCallDto, @CurrentUser() user: { id: string }) {
    return this.callsService.create(dto, user.id);
  }

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'List calls for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns list of service calls' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  @ApiQuery({ name: 'status', required: false, enum: ServiceCallStatus })
  findByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Query('status') status?: ServiceCallStatus,
  ) {
    return this.callsService.findByRestaurant(restaurantId, status);
  }

  @Get('restaurant/:restaurantId/pending')
  @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'List pending calls for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns list of pending service calls' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  findPending(@Param('restaurantId') restaurantId: string) {
    return this.callsService.findPending(restaurantId);
  }

  @Get('restaurant/:restaurantId/active')
  @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'List active (pending + acknowledged) calls for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns list of active service calls' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  getActiveCalls(@Param('restaurantId') restaurantId: string) {
    return this.callsService.getActiveCalls(restaurantId);
  }

  @Get('restaurant/:restaurantId/stats')
  @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'Get call statistics for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns call stats' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  getStats(@Param('restaurantId') restaurantId: string) {
    return this.callsService.getStats(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single service call by ID' })
  @ApiResponse({ status: 200, description: 'Returns service call details' })
  @ApiResponse({ status: 404, description: 'Service call not found' })
  findOne(@Param('id') id: string) {
    return this.callsService.findOne(id);
  }

  @Patch(':id/acknowledge')
  @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'Acknowledge a pending service call' })
  @ApiResponse({ status: 200, description: 'Service call acknowledged' })
  @ApiResponse({ status: 404, description: 'Service call not found' })
  @ApiResponse({ status: 409, description: 'Call is not in pending status' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  acknowledge(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.callsService.acknowledge(id, user.id);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.WAITER, UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'Resolve a service call' })
  @ApiResponse({ status: 200, description: 'Service call resolved' })
  @ApiResponse({ status: 404, description: 'Service call not found' })
  @ApiResponse({ status: 409, description: 'Call cannot be resolved in current status' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  resolve(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.callsService.resolve(id, user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel own pending service call' })
  @ApiResponse({ status: 200, description: 'Service call cancelled' })
  @ApiResponse({ status: 404, description: 'Service call not found' })
  @ApiResponse({ status: 403, description: 'Only the caller can cancel' })
  @ApiResponse({ status: 409, description: 'Call is not in pending status' })
  cancel(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.callsService.cancel(id, user.id);
  }
}
