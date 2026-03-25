import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { OrderGuestsService } from './order-guests.service';
import { AddOrderGuestDto } from './dto/add-order-guest.dto';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('order-guests')
@Controller('order-guests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrderGuestsController {
  constructor(private readonly orderGuestsService: OrderGuestsService) {}

  @Post('orders/:orderId/add')
  @ApiOperation({ summary: 'Add a guest to an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  async addGuest(
    @Param('orderId') orderId: string,
    @Body() addGuestDto: AddOrderGuestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.orderGuestsService.addGuest(orderId, req.user.sub, addGuestDto);
  }

  @Get('orders/:orderId/guests')
  @ApiOperation({ summary: 'Get all guests for an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  async getGuests(@Param('orderId') orderId: string) {
    return this.orderGuestsService.getOrderGuests(orderId);
  }

  @Delete('orders/:orderId/guests/:guestId')
  @ApiOperation({ summary: 'Remove a guest from an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiParam({ name: 'guestId', description: 'Guest ID' })
  async removeGuest(
    @Param('orderId') orderId: string,
    @Param('guestId') guestId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.orderGuestsService.removeGuest(orderId, guestId, req.user.sub);
    return { message: 'Guest removed successfully' };
  }

  @Post('orders/:orderId/leave')
  @ApiOperation({ summary: 'Leave an order (as guest)' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  async leaveOrder(@Param('orderId') orderId: string, @Req() req: AuthenticatedRequest) {
    await this.orderGuestsService.leaveOrder(orderId, req.user.sub);
    return { message: 'Left order successfully' };
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get all orders where current user is a guest' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 50)' })
  async getOrdersAsGuest(
    @Req() req: AuthenticatedRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.orderGuestsService.getOrdersAsGuest(req.user.sub, page, limit);
  }

  @Patch('orders/:orderId/guests/:guestId/payment')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Update guest payment amount' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiParam({ name: 'guestId', description: 'Guest ID' })
  async updatePayment(
    @Param('orderId') orderId: string,
    @Param('guestId') guestId: string,
    @Body('amount_paid') amountPaid: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.orderGuestsService.updateGuestPayment(orderId, guestId, amountPaid, req.user.sub);
  }
}
