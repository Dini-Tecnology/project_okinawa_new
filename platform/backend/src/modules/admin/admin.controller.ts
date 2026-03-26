/**
 * AdminController - Operational support endpoints for the Admin Panel
 *
 * All endpoints are protected by @Roles(UserRole.OWNER) — only restaurant
 * owners can access admin operations. This is a foundation module; a future
 * admin frontend will consume these APIs.
 *
 * Routes:
 *   GET    /admin/users                   — List users with pagination & search
 *   GET    /admin/users/:id               — User details + roles + consent history
 *   PATCH  /admin/users/:id/deactivate    — Deactivate a user account
 *   GET    /admin/system/health           — Aggregated system health
 *   GET    /admin/lgpd/requests           — List LGPD data requests
 *   POST   /admin/lgpd/requests/:id/process — Mark LGPD request as processed
 *   GET    /admin/analytics/overview      — Basic stats overview
 */

import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========== USER MANAGEMENT ==========

  @Get('users')
  @ApiOperation({ summary: 'List all users with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (max: 100, default: 20)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by email or name' })
  @ApiResponse({ status: 200, description: 'Paginated list of users' })
  listUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers({ page, limit, search });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details with roles and consent history' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Full user details including roles and consent history' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiParam({ name: 'id', description: 'User UUID to deactivate' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deactivateUser(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }

  // ========== SYSTEM HEALTH ==========

  @Get('system/health')
  @ApiOperation({ summary: 'Aggregated system health (DB, memory, uptime)' })
  @ApiResponse({ status: 200, description: 'System health status' })
  getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  // ========== LGPD REQUESTS ==========

  @Get('lgpd/requests')
  @ApiOperation({ summary: 'List LGPD data requests' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status: pending, processing, completed' })
  @ApiResponse({ status: 200, description: 'List of LGPD data requests' })
  listLgpdRequests(@Query('status') status?: string) {
    return this.adminService.listLgpdRequests(status);
  }

  @Post('lgpd/requests/:id/process')
  @ApiOperation({ summary: 'Mark an LGPD request as processed' })
  @ApiParam({ name: 'id', description: 'LGPD request ID' })
  @ApiResponse({ status: 200, description: 'LGPD request marked as processed' })
  @ApiResponse({ status: 404, description: 'LGPD request not found' })
  processLgpdRequest(@Param('id') id: string) {
    return this.adminService.processLgpdRequest(id);
  }

  // ========== ANALYTICS ==========

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Basic analytics overview (users, orders, revenue)' })
  @ApiResponse({ status: 200, description: 'Analytics overview data' })
  getAnalyticsOverview() {
    return this.adminService.getAnalyticsOverview();
  }
}
