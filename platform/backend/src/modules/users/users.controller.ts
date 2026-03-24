import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ========== STATIC ROUTES FIRST (before :id param routes) ==========

  // ========== CURRENT USER ENDPOINTS ==========

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findOne(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.update(user.sub, updateProfileDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.deleteAccount(user.sub);
  }

  // ========== STAFF MANAGEMENT ENDPOINTS ==========

  @Get('staff')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get staff members for restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getStaff(@Query('restaurant_id') restaurantId: string) {
    return this.usersService.getStaff(restaurantId);
  }

  @Post('staff')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Add staff member to restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  addStaff(
    @Query('restaurant_id') restaurantId: string,
    @Body() data: { user_id?: string; email?: string; role: UserRole; full_name?: string },
  ) {
    return this.usersService.addStaff(restaurantId, data);
  }

  @Patch('staff/:userId/role')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update staff member role' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  updateStaffRole(
    @Query('restaurant_id') restaurantId: string,
    @Param('userId') userId: string,
    @Body('role') role: UserRole,
  ) {
    return this.usersService.updateStaffRole(restaurantId, userId, role);
  }

  @Delete('staff/:userId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Remove staff member from restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  removeStaff(
    @Query('restaurant_id') restaurantId: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.removeStaff(restaurantId, userId);
  }

  // ========== ADMIN/MANAGER ENDPOINTS (param routes last) ==========

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll({ page, limit, search, role });
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  updateUser(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.update(id, updateProfileDto);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Deactivate user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  deactivateUser(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}
