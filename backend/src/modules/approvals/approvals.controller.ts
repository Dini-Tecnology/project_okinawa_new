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
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ResolveApprovalDto } from './dto/resolve-approval.dto';
import { ApprovalStatus } from './entities/approval.entity';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('approvals')
@Controller('approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  @Roles(UserRole.WAITER, UserRole.CHEF, UserRole.BARMAN, UserRole.MAITRE)
  @ApiOperation({ summary: 'Create approval request' })
  @ApiResponse({ status: 201, description: 'Approval request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid approval data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  create(@Body() dto: CreateApprovalDto, @CurrentUser() user: any) {
    return this.approvalsService.create(dto, user.id);
  }

  @Get()
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'List approvals for restaurant' })
  @ApiResponse({ status: 200, description: 'Returns list of approvals' })
  @ApiResponse({ status: 403, description: 'Forbidden - managers/owners only' })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ApprovalStatus })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'ISO date filter' })
  findAll(
    @Query('restaurantId') restaurantId: string,
    @Query('status') status?: ApprovalStatus,
    @Query('date') date?: string,
  ) {
    return this.approvalsService.findAll(restaurantId, status, date);
  }

  @Get('pending')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'List pending approvals for restaurant' })
  @ApiResponse({ status: 200, description: 'Returns list of pending approvals' })
  @ApiResponse({ status: 403, description: 'Forbidden - managers/owners only' })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  findPending(@Query('restaurantId') restaurantId: string) {
    return this.approvalsService.findPending(restaurantId);
  }

  @Get('stats')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'Get approval statistics' })
  @ApiResponse({ status: 200, description: 'Returns approval stats' })
  @ApiResponse({ status: 403, description: 'Forbidden - managers/owners only' })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'ISO date filter' })
  getStats(
    @Query('restaurantId') restaurantId: string,
    @Query('date') date?: string,
  ) {
    return this.approvalsService.getStats(restaurantId, date);
  }

  @Get(':id')
  @Roles(
    UserRole.MANAGER,
    UserRole.OWNER,
    UserRole.WAITER,
    UserRole.CHEF,
    UserRole.BARMAN,
    UserRole.MAITRE,
  )
  @ApiOperation({ summary: 'Get single approval by ID' })
  @ApiResponse({ status: 200, description: 'Returns approval details' })
  @ApiResponse({ status: 404, description: 'Approval not found' })
  findOne(@Param('id') id: string) {
    return this.approvalsService.findOne(id);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'Approve or reject an approval request' })
  @ApiResponse({ status: 200, description: 'Approval resolved successfully' })
  @ApiResponse({ status: 404, description: 'Approval not found' })
  @ApiResponse({ status: 409, description: 'Approval already resolved' })
  @ApiResponse({ status: 403, description: 'Forbidden - managers/owners only' })
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveApprovalDto,
    @CurrentUser() user: any,
  ) {
    return this.approvalsService.resolve(id, dto, user.id);
  }
}
