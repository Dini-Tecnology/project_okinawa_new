import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCustomizationGroupDto } from './dto/create-customization-group.dto';
import { UpdateCustomizationGroupDto } from './dto/update-customization-group.dto';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { MenuItemOwnerGuard } from '@/common/guards/menu-item-owner.guard';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('menu-items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Public()
  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get menu items by restaurant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.menuItemsService.findByRestaurant(restaurantId, pagination);
  }

  @Public()
  @Get('categories/:restaurantId')
  @ApiOperation({ summary: 'Get categories by restaurant' })
  findCategories(@Param('restaurantId') restaurantId: string) {
    return this.menuItemsService.findCategories(restaurantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create menu item (OWNER/MANAGER/CHEF only)' })
  createItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuItemsService.createItem(createMenuItemDto);
  }

  @Post('category')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (OWNER/MANAGER/CHEF only)' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.menuItemsService.createCategory(createCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item (OWNER/MANAGER/CHEF only)' })
  updateItem(@Param('id') id: string, @Body() updateData: Partial<CreateMenuItemDto>) {
    return this.menuItemsService.updateItem(id, updateData);
  }

  @Patch('category/:id')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu category (OWNER/MANAGER/CHEF only)' })
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.menuItemsService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete menu item (OWNER/MANAGER/CHEF only)' })
  deleteItem(@Param('id') id: string) {
    return this.menuItemsService.deleteItem(id);
  }

  @Delete('category/:id')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete menu category (OWNER/MANAGER/CHEF only)' })
  deleteCategory(@Param('id') id: string) {
    return this.menuItemsService.deleteCategory(id);
  }

  // ========== CUSTOMIZATION GROUP ENDPOINTS ==========

  @Public()
  @Get(':id/customizations')
  @ApiOperation({ summary: 'Get customization groups for a menu item' })
  @ApiResponse({ status: 200, description: 'Returns customization groups' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  findCustomizationGroups(@Param('id') id: string) {
    return this.menuItemsService.findCustomizationGroups(id);
  }

  @Post(':id/customizations')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create customization group (OWNER/MANAGER only)' })
  @ApiResponse({ status: 201, description: 'Customization group created' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  createCustomizationGroup(
    @Param('id') menuItemId: string,
    @Body() dto: CreateCustomizationGroupDto,
  ) {
    return this.menuItemsService.createCustomizationGroup(menuItemId, dto);
  }

  @Patch('customizations/:groupId')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customization group (OWNER/MANAGER only)' })
  @ApiResponse({ status: 200, description: 'Customization group updated' })
  @ApiResponse({ status: 404, description: 'Customization group not found' })
  updateCustomizationGroup(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateCustomizationGroupDto,
  ) {
    return this.menuItemsService.updateCustomizationGroup(groupId, dto);
  }

  @Delete('customizations/:groupId')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete customization group (OWNER/MANAGER only)' })
  @ApiResponse({ status: 200, description: 'Customization group deleted' })
  @ApiResponse({ status: 404, description: 'Customization group not found' })
  deleteCustomizationGroup(@Param('groupId') groupId: string) {
    return this.menuItemsService.deleteCustomizationGroup(groupId);
  }
}
