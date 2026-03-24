import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { RechargeWalletDto } from './dto/recharge-wallet.dto';
import { WithdrawWalletDto } from './dto/withdraw-wallet.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';
import { Idempotent } from '@/common/idempotency';

/** Rate limit time-to-live in milliseconds (1 minute) */
const RATE_LIMIT_TTL_MS = 60000;
/** Default rate limit for payment endpoints */
const RATE_LIMIT_DEFAULT = 30;
/** Rate limit for payment processing */
const RATE_LIMIT_PROCESS = 10;
/** Rate limit for sensitive operations (recharge/withdraw) */
const RATE_LIMIT_SENSITIVE = 5;

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Throttle({ payment: { ttl: RATE_LIMIT_TTL_MS, limit: RATE_LIMIT_DEFAULT } })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER)
  @Idempotent('x-idempotency-key')
  @Throttle({ payment: { ttl: RATE_LIMIT_TTL_MS, limit: RATE_LIMIT_PROCESS } })
  @ApiOperation({ summary: 'Process payment for order' })
  @ApiHeader({
    name: 'X-Idempotency-Key',
    description: 'Unique key to ensure idempotent payment processing',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Request already being processed' })
  processPayment(@CurrentUser() user: AuthenticatedUser, @Body() processDto: ProcessPaymentDto) {
    return this.paymentsService.processPayment(user.id, processDto);
  }

  @Get('wallet')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Returns wallet information' })
  getWallet(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.getWallet(user.id);
  }

  @Post('wallet/recharge')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER)
  @Throttle({ payment: { ttl: RATE_LIMIT_TTL_MS, limit: RATE_LIMIT_SENSITIVE } })
  @ApiOperation({ summary: 'Recharge wallet' })
  @ApiResponse({ status: 201, description: 'Wallet recharged successfully' })
  @ApiResponse({ status: 400, description: 'Invalid recharge data' })
  rechargeWallet(@CurrentUser() user: AuthenticatedUser, @Body() rechargeDto: RechargeWalletDto) {
    return this.paymentsService.rechargeWallet(user.id, rechargeDto);
  }

  @Post('wallet/withdraw')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Throttle({ payment: { ttl: RATE_LIMIT_TTL_MS, limit: RATE_LIMIT_SENSITIVE } })
  @ApiOperation({ summary: 'Withdraw from wallet (Owner/Manager only)' })
  @ApiResponse({ status: 201, description: 'Withdrawal processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid withdrawal data' })
  @ApiResponse({ status: 403, description: 'Forbidden - only owners and managers can withdraw' })
  withdrawWallet(@CurrentUser() user: AuthenticatedUser, @Body() withdrawDto: WithdrawWalletDto) {
    return this.paymentsService.withdrawWallet(user.id, withdrawDto);
  }

  @Get('transactions')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({ summary: 'Get wallet transactions' })
  @ApiResponse({ status: 200, description: 'Returns list of transactions' })
  getTransactions(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.getTransactions(user.id);
  }

  @Get('payment-methods')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get payment methods' })
  @ApiResponse({ status: 200, description: 'Returns list of payment methods' })
  getPaymentMethods(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.getPaymentMethods(user.id);
  }

  @Post('payment-methods')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create payment method' })
  @ApiResponse({ status: 201, description: 'Payment method created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment method data' })
  createPaymentMethod(@CurrentUser() user: AuthenticatedUser, @Body() createDto: CreatePaymentMethodDto) {
    return this.paymentsService.createPaymentMethod(user.id, createDto);
  }

  @Patch('methods/:id')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update payment method' })
  @ApiResponse({ status: 200, description: 'Payment method updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  updatePaymentMethod(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentsService.updatePaymentMethod(user.id, id, updateDto);
  }

  @Delete('payment-methods/:id')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({ status: 200, description: 'Payment method deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  deletePaymentMethod(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.paymentsService.deletePaymentMethod(user.id, id);
  }
}
