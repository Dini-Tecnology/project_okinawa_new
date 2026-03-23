import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReceiptsService } from './receipts.service';
import { GenerateReceiptDto } from './dto/generate-receipt.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('receipts')
@Controller('receipts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get receipt for a specific order' })
  @ApiResponse({ status: 200, description: 'Returns the receipt for the order' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.receiptsService.findByOrder(orderId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user receipts (paginated)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of receipts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findMyReceipts(@CurrentUser() user: any, @Query() pagination: PaginationDto) {
    return this.receiptsService.findByUser(user.sub, pagination);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a receipt for a completed order' })
  @ApiResponse({ status: 201, description: 'Receipt generated successfully' })
  @ApiResponse({ status: 409, description: 'Receipt already exists for this order' })
  generate(@CurrentUser() user: any, @Body() dto: GenerateReceiptDto) {
    // In production this would fetch order/payment data from their respective services.
    // For now, the controller delegates to the service with the order/payment IDs,
    // and the service handles the creation with minimal data.
    // The full implementation would inject OrdersService and PaymentsService here.
    return this.receiptsService.generate(
      dto.orderId,
      dto.paymentId || null,
      user.sub,
      // These will be populated from the Order entity in full implementation
      '', // restaurant_id - to be resolved from order
      [], // items_snapshot - to be resolved from order
      0,  // subtotal
      0,  // service_fee
      0,  // tip
      0,  // total
      '', // payment_method
    );
  }
}
