import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FinancialReportQueryDto } from './dto/financial-report-query.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';

@ApiTags('financial')
@Controller('financial')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER)
@ApiBearerAuth()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // SECURITY: Helper to verify user has access to restaurant
  private verifyRestaurantAccess(user: AuthenticatedUser, restaurantId: string): void {
    const userRestaurants = user.restaurants || [];
    const hasAccess = userRestaurants.some(
      (r: { id: string; role: string }) => r.id === restaurantId &&
        [UserRole.OWNER as string, UserRole.MANAGER as string].includes(r.role)
    );

    if (!hasAccess) {
      throw new ForbiddenException('Access denied - not affiliated with this restaurant');
    }
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Create a financial transaction manually' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - not affiliated with restaurant' })
  createTransaction(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    this.verifyRestaurantAccess(user, createTransactionDto.restaurant_id);
    return this.financialService.createTransaction(createTransactionDto);
  }

  @Patch('transactions/:id')
  @ApiOperation({ summary: 'Update financial transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  updateTransaction(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionDto,
  ) {
    return this.financialService.updateTransaction(id, updateDto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary for date range' })
  @ApiResponse({ status: 403, description: 'Access denied - not affiliated with restaurant' })
  getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
    @Query() queryDto: FinancialReportQueryDto,
  ) {
    this.verifyRestaurantAccess(user, restaurantId);
    return this.financialService.getSummary(restaurantId, queryDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get detailed transactions list' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 403, description: 'Access denied - not affiliated with restaurant' })
  getTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
    @Query() queryDto: FinancialReportQueryDto,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    this.verifyRestaurantAccess(user, restaurantId);
    return this.financialService.getTransactions(
      restaurantId,
      queryDto,
      limit,
      offset,
    );
  }

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get daily financial summary' })
  @ApiQuery({ name: 'start_date', required: true, type: String })
  @ApiQuery({ name: 'end_date', required: true, type: String })
  @ApiResponse({ status: 403, description: 'Access denied - not affiliated with restaurant' })
  getDailySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    this.verifyRestaurantAccess(user, restaurantId);
    return this.financialService.getDailySummary(
      restaurantId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('revenue-by-category')
  @ApiOperation({ summary: 'Get revenue breakdown by category' })
  @ApiQuery({ name: 'start_date', required: true, type: String })
  @ApiQuery({ name: 'end_date', required: true, type: String })
  @ApiResponse({ status: 403, description: 'Access denied - not affiliated with restaurant' })
  getRevenueByCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    this.verifyRestaurantAccess(user, restaurantId);
    return this.financialService.getRevenueByCategory(
      restaurantId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('expenses-by-category')
  @ApiOperation({ summary: 'Get expenses breakdown by category' })
  @ApiQuery({ name: 'start_date', required: true, type: String })
  @ApiQuery({ name: 'end_date', required: true, type: String })
  @ApiResponse({ status: 403, description: 'Access denied - not affiliated with restaurant' })
  getExpensesByCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    this.verifyRestaurantAccess(user, restaurantId);
    return this.financialService.getExpensesByCategory(
      restaurantId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('profit-loss')
  @ApiOperation({ summary: 'Get profit and loss statement' })
  @ApiQuery({ name: 'start_date', required: true, type: String })
  @ApiQuery({ name: 'end_date', required: true, type: String })
  @ApiResponse({ status: 403, description: 'Access denied - not affiliated with restaurant' })
  getProfitLoss(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    this.verifyRestaurantAccess(user, restaurantId);
    return this.financialService.getProfitLossStatement(
      restaurantId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get cash flow report' })
  @ApiQuery({ name: 'start_date', required: true, type: String })
  @ApiQuery({ name: 'end_date', required: true, type: String })
  @ApiResponse({ status: 403, description: 'Access denied - not affiliated with restaurant' })
  getCashFlow(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    this.verifyRestaurantAccess(user, restaurantId);
    return this.financialService.getCashFlow(
      restaurantId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Export financial report in various formats (PDF, CSV, Excel).
   * Generates downloadable report data for the specified date range.
   */
  @Get('export')
  @ApiOperation({ summary: 'Export financial report' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'start_date', required: true, type: String })
  @ApiQuery({ name: 'end_date', required: true, type: String })
  @ApiQuery({ name: 'format', required: true, enum: ['pdf', 'csv', 'excel'] })
  @ApiQuery({ name: 'report_type', required: true, enum: ['summary', 'detailed', 'transactions'] })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - not affiliated with restaurant' })
  exportReport(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('format') format: 'pdf' | 'csv' | 'excel',
    @Query('report_type') reportType: 'summary' | 'detailed' | 'transactions',
  ) {
    this.verifyRestaurantAccess(user, restaurantId);
    return this.financialService.exportReport(
      restaurantId,
      new Date(startDate),
      new Date(endDate),
      format,
      reportType,
    );
  }
}
