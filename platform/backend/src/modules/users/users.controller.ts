import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { DataExportService } from './data-export.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';
import { ConsentService } from '@/modules/identity/services/consent.service';
import { ConsentType } from '@/modules/identity/entities/user-consent.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly dataExportService: DataExportService,
    private readonly consentService: ConsentService,
  ) {}

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
  @ApiOperation({ summary: 'Schedule current user account for deletion (30-day grace period)' })
  @ApiResponse({ status: 200, description: 'Account deletion scheduled' })
  deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.deleteAccount(user.sub);
  }

  @Post('me/cancel-deletion')
  @ApiOperation({ summary: 'Cancel pending account deletion and reactivate account' })
  @ApiResponse({ status: 200, description: 'Account deletion cancelled' })
  @ApiResponse({ status: 400, description: 'No pending deletion request' })
  cancelDeletion(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.cancelDeletion(user.sub);
  }

  // ========== LGPD CONSENT ENDPOINTS ==========

  @Post('me/consent')
  @ApiOperation({ summary: 'Accept terms/privacy policy version (LGPD re-consent)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['consent_type', 'version'],
      properties: {
        consent_type: {
          type: 'string',
          enum: Object.values(ConsentType),
          description: 'Type of consent being accepted',
        },
        version: {
          type: 'string',
          description: 'Version string of the document being accepted',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Consent recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid consent_type' })
  async acceptConsent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { consent_type: string; version: string },
    @Req() req: Request,
  ) {
    const { consent_type, version } = body;

    // Validate consent_type against the enum
    if (!Object.values(ConsentType).includes(consent_type as ConsentType)) {
      throw new BadRequestException(
        `Invalid consent_type. Must be one of: ${Object.values(ConsentType).join(', ')}`,
      );
    }

    const consent = await this.consentService.recordConsent({
      userId: user.sub,
      consentType: consent_type as ConsentType,
      version,
      ipAddress: req.ip || req.socket?.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || undefined,
    });

    return {
      id: consent.id,
      consent_type: consent.consent_type,
      version: consent.version,
      accepted_at: consent.accepted_at,
    };
  }

  @Get('me/consent')
  @ApiOperation({ summary: 'Get current user active consents' })
  @ApiResponse({ status: 200, description: 'Returns active consent records' })
  async getMyConsents(@CurrentUser() user: AuthenticatedUser) {
    const consents = await this.consentService.getActiveConsents(user.sub);
    return consents.map((c) => ({
      id: c.id,
      consent_type: c.consent_type,
      version: c.version,
      accepted_at: c.accepted_at,
    }));
  }

  @Delete('me/consent/:type')
  @ApiOperation({ summary: 'Revoke a specific consent type (LGPD right to withdraw)' })
  @ApiResponse({ status: 200, description: 'Consent revoked successfully' })
  @ApiResponse({ status: 400, description: 'Cannot revoke required consents (terms/privacy)' })
  async revokeConsent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('type') consentType: string,
  ) {
    // Terms and privacy cannot be revoked (they require account deletion)
    const nonRevocableTypes = ['terms_of_service', 'privacy_policy'];
    if (nonRevocableTypes.includes(consentType)) {
      throw new BadRequestException(
        'Terms of Service and Privacy Policy consent cannot be revoked. To withdraw, please delete your account.',
      );
    }
    await this.consentService.revokeConsent(user.sub, consentType as any);
    return { message: `Consent "${consentType}" revoked successfully.` };
  }

  // ========== LGPD DATA PORTABILITY ENDPOINTS ==========

  @Get('me/export')
  @ApiOperation({ summary: 'Export all user data (LGPD portability)' })
  @ApiResponse({ status: 200, description: 'Returns all user data as JSON' })
  exportUserData(@CurrentUser() user: AuthenticatedUser) {
    return this.dataExportService.exportUserData(user.sub);
  }

  @Get('me/export/download')
  @ApiOperation({ summary: 'Generate a secure download link for data export' })
  @ApiResponse({
    status: 200,
    description: 'Returns a secure download link valid for 72 hours',
  })
  generateExportDownloadLink(@CurrentUser() user: AuthenticatedUser) {
    const { token, expires_at } = this.dataExportService.generateDownloadToken(user.sub);
    return {
      download_url: `/users/me/export/download/${token}`,
      expires_at,
    };
  }

  @Get('me/export/download/:token')
  @ApiOperation({ summary: 'Download user data export via secure token' })
  @ApiResponse({ status: 200, description: 'Returns the user data export' })
  @ApiResponse({ status: 400, description: 'Invalid or expired download token' })
  async downloadExportData(@Param('token') token: string) {
    const userId = this.dataExportService.validateDownloadToken(token);
    if (!userId) {
      throw new BadRequestException('Invalid or expired download token');
    }
    return this.dataExportService.exportUserData(userId);
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
