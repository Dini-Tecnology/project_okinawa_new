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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { UpdateItemLevelDto } from './dto/update-item-level.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/enums/user-role.enum';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({ summary: 'List inventory items for a restaurant' })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'ok | low | critical' })
  findAll(
    @Query('restaurantId') restaurantId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.inventoryService.findAll(restaurantId, category, status);
  }

  @Get('alerts')
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({ summary: 'Get inventory alerts (low + critical items)' })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  getAlerts(@Query('restaurantId') restaurantId: string) {
    return this.inventoryService.getAlerts(restaurantId);
  }

  @Get('stats')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({
    summary: 'Get inventory stats (total, ok, low, critical, estimatedStockValue)',
  })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  getStats(@Query('restaurantId') restaurantId: string) {
    return this.inventoryService.getStats(restaurantId);
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({ summary: 'Get a single inventory item' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'Create inventory item (OWNER, MANAGER only)' })
  create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'Update inventory item config (OWNER, MANAGER only)' })
  update(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, dto);
  }

  @Patch(':id/level')
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({ summary: 'Quick level update (restock / adjustment)' })
  updateLevel(
    @Param('id') id: string,
    @Body() dto: UpdateItemLevelDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.updateLevel(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'Soft delete inventory item (OWNER, MANAGER only)' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
