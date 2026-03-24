import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';
import { PaymentSplitService } from './payment-split.service';
import { CalculateSplitDto } from './dto/calculate-split.dto';
import { CreatePaymentSplitDto } from './dto/create-payment-split.dto';
import { ProcessSplitPaymentDto } from './dto/process-split-payment.dto';
import { PaymentSplitMode } from './entities/payment-split.entity';

@ApiTags('payment-splits')
@Controller('payment-splits')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentSplitController {
  constructor(private readonly paymentSplitService: PaymentSplitService) {}

  @Post('calculate')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Calculate split amounts for an order' })
  @ApiResponse({ status: 200, description: 'Split calculation returned' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async calculateSplit(@Body() calculateDto: CalculateSplitDto) {
    return this.paymentSplitService.calculateSplit(calculateDto);
  }

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Create a payment split' })
  @ApiResponse({ status: 201, description: 'Payment split created' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createSplit(@Body() createDto: CreatePaymentSplitDto) {
    return this.paymentSplitService.createPaymentSplit(createDto);
  }

  @Post('orders/:orderId/create-all')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Create payment splits for all guests in an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 201, description: 'Payment splits created for all guests' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createAllSplits(
    @Param('orderId') orderId: string,
    @Body('split_mode') splitMode: PaymentSplitMode,
  ) {
    return this.paymentSplitService.createPaymentSplits(orderId, splitMode);
  }

  @Get('orders/:orderId')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Get all payment splits for an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Returns list of payment splits' })
  @ApiResponse({ status: 403, description: 'Access denied - not authorized for this order' })
  async getOrderSplits(
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // SECURITY: Service verifies user is participant or staff
    return this.paymentSplitService.getOrderSplits(orderId, user.id, user.roles as UserRole[]);
  }

  @Get('orders/:orderId/status')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Get payment status for an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Returns payment status' })
  async getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentSplitService.getPaymentStatus(orderId);
  }

  @Get('my-splits')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Get all payment splits for current user' })
  @ApiResponse({ status: 200, description: 'Returns user payment splits' })
  async getMySplits(@Req() req: any) {
    return this.paymentSplitService.getGuestSplits(req.user.sub);
  }

  @Post('process-payment')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Process payment for a split' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async processPayment(@Body() processDto: ProcessSplitPaymentDto) {
    return this.paymentSplitService.processSplitPayment(processDto);
  }
}
