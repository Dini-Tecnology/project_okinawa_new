import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TabsService } from './tabs.service';
import { CreateTabDto, AddTabItemDto, JoinTabDto, ProcessTabPaymentDto } from './dto';
import { TabStatus } from '@/common/enums';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('Tabs')
@Controller('tabs')
@ApiBearerAuth()
export class TabsController {
  constructor(private readonly tabsService: TabsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tab' })
  @ApiResponse({ status: 201, description: 'Tab created successfully' })
  async createTab(@Req() req: AuthenticatedRequest, @Body() dto: CreateTabDto) {
    return this.tabsService.createTab(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my open tabs' })
  async getMyTabs(@Req() req: AuthenticatedRequest) {
    return this.tabsService.findUserTabs(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tab details' })
  async getTab(@Param('id') id: string) {
    return this.tabsService.findById(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an existing group tab' })
  async joinTab(@Req() req: AuthenticatedRequest, @Body() dto: JoinTabDto) {
    return this.tabsService.joinTab(req.user.id, dto);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave a tab' })
  async leaveTab(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.tabsService.leaveTab(id, req.user.id);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from tab (host only)' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tabsService.removeMember(id, req.user.id, userId);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to tab' })
  async addItem(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddTabItemDto,
  ) {
    return this.tabsService.addItem(id, req.user.id, dto);
  }

  @Post(':id/repeat-round')
  @ApiOperation({ summary: 'Repeat last round of drinks' })
  async repeatRound(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.tabsService.repeatRound(id, req.user.id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Request to close the tab' })
  async requestClose(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.tabsService.requestClose(id, req.user.id);
  }

  @Get(':id/split-options')
  @ApiOperation({ summary: 'Get payment split options' })
  async getSplitOptions(@Param('id') id: string) {
    return this.tabsService.getSplitOptions(id);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Process a payment for the tab' })
  async processPayment(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: ProcessTabPaymentDto,
  ) {
    return this.tabsService.processPayment(id, req.user.id, dto);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get tabs by restaurant (staff only)' })
  async getRestaurantTabs(
    @Param('restaurantId') restaurantId: string,
    @Query('status') status?: TabStatus,
  ) {
    return this.tabsService.findRestaurantTabs(restaurantId, status);
  }
}
