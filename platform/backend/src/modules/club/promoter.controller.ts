import { Controller, Get, Post, Put, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromoterService } from './promoter.service';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

// DTOs
class RegisterPromoterDto {
  name: string;
  nickname?: string;
  phone?: string;
  email?: string;
  commissionType?: 'percentage' | 'fixed_per_entry' | 'fixed_per_table' | 'tiered';
  commissionRate?: number;
  pixKey?: string;
}

class UpdateCommissionDto {
  commissionType?: 'percentage' | 'fixed_per_entry' | 'fixed_per_table' | 'tiered';
  commissionRate?: number;
  fixedCommissionAmount?: number;
  tieredRates?: { tier: number; minEntries: number; maxEntries?: number; rate: number }[];
}

class RecordSaleDto {
  eventDate: string;
  saleType: 'entry' | 'vip_table' | 'guest_list';
  referenceId: string;
  customerName?: string;
  customerPhone?: string;
  quantity: number;
  saleAmount: number;
}

class ApproveCommissionsDto {
  saleIds: string[];
}

class ProcessPaymentDto {
  saleIds: string[];
  paymentMethod: 'pix' | 'bank_transfer' | 'cash';
}

@ApiTags('Promoters')
@Controller('promoters')
@ApiBearerAuth()
export class PromoterController {
  constructor(private readonly promoterService: PromoterService) {}

  @Post('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Register a new promoter' })
  async registerPromoter(
    @Param('restaurantId') restaurantId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RegisterPromoterDto
  ) {
    return this.promoterService.registerPromoter(restaurantId, {
      ...dto,
      userId: req.user.id,
    });
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all promoters for a restaurant' })
  async getRestaurantPromoters(
    @Param('restaurantId') restaurantId: string,
    @Query('status') status?: string,
    @Query('search') search?: string
  ) {
    return this.promoterService.getRestaurantPromoters(restaurantId, { status, search });
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get promoter by code' })
  async getPromoterByCode(@Param('code') code: string) {
    return this.promoterService.getPromoterByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promoter by ID' })
  async getPromoterById(@Param('id') id: string) {
    return this.promoterService.getPromoterById(id);
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get promoter dashboard stats' })
  async getPromoterDashboard(@Param('id') id: string) {
    return this.promoterService.getPromoterDashboard(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update promoter status' })
  async updatePromoterStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'inactive' | 'suspended' | 'pending_approval'
  ) {
    return this.promoterService.updatePromoterStatus(id, status);
  }

  @Put(':id/commission')
  @ApiOperation({ summary: 'Update promoter commission settings' })
  async updateCommissionSettings(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionDto
  ) {
    return this.promoterService.updateCommissionSettings(id, dto);
  }

  @Post(':id/sales')
  @ApiOperation({ summary: 'Record a sale for a promoter' })
  async recordSale(
    @Param('id') id: string,
    @Body() dto: RecordSaleDto
  ) {
    return this.promoterService.recordSale(id, {
      ...dto,
      eventDate: new Date(dto.eventDate),
    });
  }

  @Get(':id/sales')
  @ApiOperation({ summary: 'Get promoter sales' })
  async getPromoterSales(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('saleType') saleType?: string,
    @Query('commissionStatus') commissionStatus?: string
  ) {
    return this.promoterService.getPromoterSales(id, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      saleType,
      commissionStatus,
    });
  }

  @Post('commissions/approve')
  @ApiOperation({ summary: 'Approve pending commissions' })
  async approveCommissions(@Body() dto: ApproveCommissionsDto) {
    return this.promoterService.approveCommissions(dto.saleIds);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Process payment to promoter' })
  async processPayment(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: ProcessPaymentDto
  ) {
    return this.promoterService.processPayment(id, {
      ...dto,
      processedBy: req.user.id,
    });
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get promoter payment history' })
  async getPromoterPayments(@Param('id') id: string) {
    return this.promoterService.getPromoterPayments(id);
  }

  @Get('restaurant/:restaurantId/leaderboard')
  @ApiOperation({ summary: 'Get promoter leaderboard' })
  async getPromoterLeaderboard(
    @Param('restaurantId') restaurantId: string,
    @Query('period') period: 'day' | 'week' | 'month' | 'all' = 'month'
  ) {
    return this.promoterService.getPromoterLeaderboard(restaurantId, period);
  }
}
