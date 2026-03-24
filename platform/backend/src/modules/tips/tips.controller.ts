import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
  Param,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { TipsService } from './tips.service';
import { CreateTipDto } from './dto/create-tip.dto';
import { DistributeTipsDto } from './dto/distribute-tips.dto';
import { UpdateTipDto } from './dto/update-tip.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';

@ApiTags('tips')
@Controller('tips')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TipsController {
  constructor(private readonly tipsService: TipsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tip' })
  @ApiResponse({ status: 201, description: 'Tip created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid tip data' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() createTipDto: CreateTipDto) {
    return this.tipsService.create(user.id, createTipDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update tip' })
  @ApiResponse({ status: 200, description: 'Tip updated successfully' })
  @ApiResponse({ status: 404, description: 'Tip not found' })
  update(@Param('id') id: string, @Body() updateTipDto: UpdateTipDto) {
    return this.tipsService.update(id, updateTipDto);
  }

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get tips summary' })
  @ApiQuery({ name: 'restaurant_id', required: true })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiResponse({ status: 200, description: 'Returns tips summary' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  getSummary(
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    return this.tipsService.getSummary(restaurantId, start, end);
  }

  @Get('transactions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get tip transactions' })
  @ApiQuery({ name: 'restaurant_id', required: true })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiResponse({ status: 200, description: 'Returns paginated tip transactions' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  getTransactions(
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    return this.tipsService.getTransactions(restaurantId, start, end, page, limit);
  }

  @Post('distribute')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Distribute pending tips' })
  @ApiResponse({ status: 200, description: 'Tips distributed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid distribution data' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  distributePending(@Body() distributeTipsDto: DistributeTipsDto) {
    return this.tipsService.distributePending(
      distributeTipsDto.restaurant_id,
      distributeTipsDto,
    );
  }

  @Get('staff/:staffId')
  @ApiOperation({ summary: 'Get tips for a staff member' })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiResponse({ status: 200, description: 'Returns staff tips' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own tips or admin required' })
  getStaffTips(
    @CurrentUser() user: AuthenticatedUser,
    @Param('staffId') staffId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    // SECURITY: Users can only see their own tips, unless they are OWNER/MANAGER
    const isAdmin = (user.roles || []).some((role: string) =>
      [UserRole.OWNER as string, UserRole.MANAGER as string].includes(role)
    );

    if (!isAdmin && user.id !== staffId) {
      throw new ForbiddenException('Access denied - can only view your own tips');
    }

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    return this.tipsService.findByStaff(staffId, start, end);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get tip for an order' })
  @ApiResponse({ status: 200, description: 'Returns tip for order' })
  @ApiResponse({ status: 404, description: 'Tip not found for order' })
  getTipByOrder(@Param('orderId') orderId: string) {
    return this.tipsService.findByOrder(orderId);
  }
}
