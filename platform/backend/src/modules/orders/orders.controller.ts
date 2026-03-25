import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { KdsService } from './kds.service';
import { WaiterStatsService } from './waiter-stats.service';
import { OrderAdditionsService } from './order-additions.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddItemsToOrderDto } from './dto/add-items-to-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetKdsOrdersDto } from './dto/get-kds-orders.dto';
import { GetWaiterStatsDto } from './dto/get-waiter-stats.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly kdsService: KdsService,
    private readonly waiterStatsService: WaiterStatsService,
    private readonly orderAdditionsService: OrderAdditionsService,
  ) {}

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Create order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user.id, createOrderDto);
  }

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF, UserRole.BARMAN, UserRole.MAITRE)
  @ApiOperation({ summary: 'Get orders by restaurant (Staff only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of orders' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.ordersService.findByRestaurant(restaurantId, pagination);
  }

  @Get('user')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get orders by current user' })
  @ApiResponse({ status: 200, description: 'Returns paginated user orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByUser(@CurrentUser() user: AuthenticatedUser, @Query() pagination: PaginationDto) {
    return this.ordersService.findByUser(user.id, pagination);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF, UserRole.BARMAN, UserRole.MAITRE)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Returns order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.findOne(id, user.id, user.roles as UserRole[]);
  }

  @Patch(':id')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.update(id, updateOrderDto, user.id, user.roles as UserRole[]);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF, UserRole.BARMAN, UserRole.MAITRE)
  @ApiOperation({ summary: 'Update order status (Staff only)' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  // ========== PARTIAL ORDER ENDPOINTS (EPIC 17) ==========

  @Post(':id/items')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Add items to an existing open order (partial order / comanda aberta)' })
  @ApiResponse({ status: 200, description: 'Items added and totals recalculated' })
  @ApiResponse({ status: 400, description: 'Order not in addable status or invalid items' })
  @ApiResponse({ status: 404, description: 'Order or menu items not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  addItemsToOrder(
    @Param('id') id: string,
    @Body() addItemsDto: AddItemsToOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderAdditionsService.addItemsToExistingOrder(id, addItemsDto, user.id, user.roles as UserRole[]);
  }

  @Patch(':id/open')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Mark order as open for additions (WAITER/MANAGER only)' })
  @ApiResponse({ status: 200, description: 'Order marked as open_for_additions' })
  @ApiResponse({ status: 400, description: 'Order cannot be opened for additions' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - staff only' })
  openOrderForAdditions(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderAdditionsService.openOrderForAdditions(id, user.id, user.roles as UserRole[]);
  }

  // ========== KDS ENDPOINTS ==========

  @Get('kds/kitchen')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF)
  @ApiOperation({ summary: 'Get kitchen KDS orders (OWNER/MANAGER/CHEF only)' })
  @ApiResponse({ status: 200, description: 'Returns kitchen orders for KDS display' })
  @ApiResponse({ status: 403, description: 'Forbidden - kitchen staff only' })
  getKitchenOrders(@Query() query: GetKdsOrdersDto) {
    return this.kdsService.getKdsOrders({ ...query, type: 'kitchen' });
  }

  @Get('kds/bar')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.BARMAN)
  @ApiOperation({ summary: 'Get bar/barman KDS orders (OWNER/MANAGER/BARMAN only)' })
  @ApiResponse({ status: 200, description: 'Returns bar orders for KDS display' })
  @ApiResponse({ status: 403, description: 'Forbidden - bar staff only' })
  getBarOrders(@Query() query: GetKdsOrdersDto) {
    return this.kdsService.getKdsOrders({ ...query, type: 'bar' });
  }

  // ========== WAITER ENDPOINTS ==========

  @Get('waiter/my-tables')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Get waiter assigned tables with orders (WAITER/MAITRE only)' })
  @ApiResponse({ status: 200, description: 'Returns tables assigned to current waiter' })
  @ApiResponse({ status: 403, description: 'Forbidden - waiter/maitre only' })
  getWaiterTables(@CurrentUser() user: AuthenticatedUser) {
    return this.waiterStatsService.getWaiterTables(user.id);
  }

  @Get('waiter/stats')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Get waiter statistics (WAITER/MAITRE only)' })
  @ApiResponse({ status: 200, description: 'Returns waiter stats (sales, tips, tables)' })
  @ApiResponse({ status: 403, description: 'Forbidden - waiter/maitre only' })
  getWaiterStats(@CurrentUser() user: AuthenticatedUser, @Query() query: GetWaiterStatsDto) {
    return this.waiterStatsService.getWaiterStats(user.id, query);
  }

  // ========== MAITRE ENDPOINTS ==========

  @Get('maitre/overview')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Get maitre dashboard overview (MAITRE only)' })
  @ApiResponse({ status: 200, description: 'Returns overview for maitre dashboard' })
  @ApiResponse({ status: 403, description: 'Forbidden - maitre only' })
  getMaitreOverview(@Query('restaurant_id') restaurantId: string) {
    return this.waiterStatsService.getMaitreOverview(restaurantId);
  }
}
