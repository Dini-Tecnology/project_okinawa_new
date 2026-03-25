import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseEnumPipe,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UserRolesService } from './user-roles.service';
import {
  CreateUserRoleDto,
  UpdateUserRoleDto,
  BulkAssignRolesDto,
  TransferOwnershipDto,
  AddAdditionalRoleDto,
  RemoveSpecificRoleDto,
  UserRestaurantRoleResponseDto,
} from './dto/user-role.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('user-roles')
@Controller('user-roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  // ============================================================
  // AUTHENTICATED USER ENDPOINTS (No role restriction)
  // ============================================================

  @Get('me/restaurants')
  @ApiOperation({
    summary: 'Get all restaurants for the authenticated user',
    description: 'Returns all restaurants where the current user has active roles, with their assigned roles per restaurant. Used for restaurant selection screen after login.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of restaurants with user roles',
    type: [UserRestaurantRoleResponseDto],
  })
  getMyRestaurants(@Req() req: AuthenticatedRequest) {
    return this.userRolesService.getMyRestaurants(req.user.sub);
  }

  @Get('me/restaurant/:restaurantId/roles')
  @ApiOperation({
    summary: 'Get all roles for the authenticated user in a specific restaurant',
    description: 'Returns all roles the current user has in the specified restaurant. Supports multiple roles per restaurant.',
  })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  getMyRolesInRestaurant(
    @Req() req: AuthenticatedRequest,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.userRolesService.getUserRolesInRestaurant(req.user.sub, restaurantId);
  }

  // ============================================================
  // ROLE MANAGEMENT ENDPOINTS (Owner/Manager only)
  // ============================================================

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Assign a role to a user in a restaurant' })
  assignRole(@Body() createUserRoleDto: CreateUserRoleDto) {
    return this.userRolesService.assignRole(createUserRoleDto);
  }

  @Post('additional-role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Add an additional role to a user',
    description: 'Allows assigning multiple roles to the same user in a restaurant (e.g., Chef + Barman)',
  })
  addAdditionalRole(@Body() dto: AddAdditionalRoleDto) {
    return this.userRolesService.addAdditionalRole(dto);
  }

  @Delete('specific-role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Remove a specific role from a user',
    description: 'Removes only the specified role, keeping other roles intact',
  })
  removeSpecificRole(@Body() dto: RemoveSpecificRoleDto) {
    return this.userRolesService.removeSpecificRole(
      dto.user_id,
      dto.restaurant_id,
      dto.role,
    );
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Bulk assign roles (for restaurant setup)' })
  bulkAssignRoles(@Body() bulkAssignRolesDto: BulkAssignRolesDto) {
    return this.userRolesService.bulkAssignRoles(bulkAssignRolesDto.roles);
  }

  @Post('transfer-ownership')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Transfer ownership to another user' })
  transferOwnership(@Body() transferOwnershipDto: TransferOwnershipDto) {
    return this.userRolesService.transferOwnership(
      transferOwnershipDto.current_owner_id,
      transferOwnershipDto.new_owner_id,
      transferOwnershipDto.restaurant_id,
    );
  }

  @Get('restaurant/:restaurantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all roles for a specific restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  getRolesByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.userRolesService.getRolesByRestaurant(restaurantId);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all roles for a specific user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  getRolesByUser(@Param('userId') userId: string) {
    return this.userRolesService.getRolesByUser(userId);
  }

  @Get('restaurant/:restaurantId/user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: "Get a specific user's role in a restaurant (Admin only)" })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  getUserRoleInRestaurant(
    @Param('userId') userId: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.userRolesService.getUserRoleInRestaurant(userId, restaurantId);
  }

  @Get('restaurant/:restaurantId/user/:userId/roles')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get all roles for a user in a restaurant',
    description: 'Returns array of roles (supports multiple roles per user)',
  })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  getUserRolesInRestaurant(
    @Param('userId') userId: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.userRolesService.getUserRolesInRestaurant(userId, restaurantId);
  }

  @Get('restaurant/:restaurantId/role/:role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all users with a specific role in a restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiParam({ name: 'role', description: 'Role name', enum: UserRole })
  getUsersByRoleInRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('role', new ParseEnumPipe(UserRole)) role: UserRole,
  ) {
    return this.userRolesService.getUsersByRoleInRestaurant(restaurantId, role);
  }

  @Get('restaurant/:restaurantId/statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get role statistics for a restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  getRoleStatistics(@Param('restaurantId') restaurantId: string) {
    return this.userRolesService.getRoleStatistics(restaurantId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: "Update a user's role" })
  @ApiParam({ name: 'id', description: 'User Role ID' })
  updateRole(@Param('id') id: string, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    return this.userRolesService.updateRole(id, updateUserRoleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: "Remove a user's role from a restaurant" })
  @ApiParam({ name: 'id', description: 'User Role ID' })
  removeRole(@Param('id') id: string) {
    return this.userRolesService.removeRole(id);
  }
}
