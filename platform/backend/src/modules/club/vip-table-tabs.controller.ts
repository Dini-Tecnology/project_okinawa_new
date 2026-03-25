import { Controller, Get, Post, Put, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VipTableTabsService } from './vip-table-tabs.service';
import { AddVipTabItemDto } from './dto';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('VIP Table Tabs')
@Controller('table-tabs')
@ApiBearerAuth()
export class VipTableTabsController {
  constructor(private readonly tabsService: VipTableTabsService) {}

  @Post('reservation/:reservationId/open')
  @ApiOperation({ summary: 'Open tab for VIP table reservation' })
  async openTab(@Param('reservationId') reservationId: string) {
    return this.tabsService.openTab(reservationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tab details' })
  async getTab(@Param('id') id: string) {
    return this.tabsService.findById(id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get tab summary with minimum spend tracker' })
  async getTabSummary(@Param('id') id: string) {
    return this.tabsService.getTabSummary(id);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get tab items' })
  async getTabItems(@Param('id') id: string) {
    return this.tabsService.getTabItems(id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to tab' })
  async addItem(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddVipTabItemDto,
  ) {
    return this.tabsService.addItem(id, req.user.id, dto);
  }

  @Put(':id/close')
  @ApiOperation({ summary: 'Close the tab' })
  async closeTab(@Param('id') id: string) {
    return this.tabsService.closeTab(id);
  }
}
