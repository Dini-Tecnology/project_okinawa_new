import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ServiceConfigService } from './service-config.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateServiceTypesDto } from './dto/update-service-types.dto';
import { UpdateExperienceFlagsDto } from './dto/update-experience-flags.dto';
import { UpdateFloorConfigDto } from './dto/update-floor-config.dto';
import { UpdateKitchenConfigDto } from './dto/update-kitchen-config.dto';
import { UpdatePaymentConfigDto } from './dto/update-payment-config.dto';
import { UpdateTeamConfigDto } from './dto/update-team-config.dto';
import { UpdateFeaturesDto } from './dto/update-features.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('service-config')
@Controller('config')
@ApiBearerAuth()
export class ServiceConfigController {
  constructor(private readonly serviceConfigService: ServiceConfigService) {}

  // ========== GET CONFIG ==========

  @Get(':restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get restaurant configuration (OWNER/MANAGER)' })
  @ApiResponse({ status: 200, description: 'Returns the restaurant configuration' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER or MANAGER role' })
  getConfig(@Param('restaurantId') restaurantId: string) {
    return this.serviceConfigService.getConfig(restaurantId);
  }

  // ========== UPDATE PROFILE ==========

  @Patch(':restaurantId/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update restaurant profile (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER role' })
  updateProfile(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.serviceConfigService.updateProfile(restaurantId, dto);
  }

  // ========== UPDATE SERVICE TYPES ==========

  @Patch(':restaurantId/service-types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update service types configuration (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Service types updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER role' })
  updateServiceTypes(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: UpdateServiceTypesDto,
  ) {
    return this.serviceConfigService.updateServiceTypes(restaurantId, dto);
  }

  // ========== UPDATE EXPERIENCE FLAGS ==========

  @Patch(':restaurantId/experience')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update experience flags (OWNER/MANAGER)' })
  @ApiResponse({ status: 200, description: 'Experience flags updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER or MANAGER role' })
  updateExperience(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: UpdateExperienceFlagsDto,
  ) {
    return this.serviceConfigService.updateExperience(restaurantId, dto);
  }

  // ========== UPDATE FLOOR LAYOUT ==========

  @Patch(':restaurantId/floor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update floor layout configuration (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Floor layout updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER role' })
  updateFloor(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: UpdateFloorConfigDto,
  ) {
    return this.serviceConfigService.updateFloor(restaurantId, dto);
  }

  // ========== UPDATE KITCHEN CONFIG ==========

  @Patch(':restaurantId/kitchen')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update kitchen stations and routing (OWNER/MANAGER)' })
  @ApiResponse({ status: 200, description: 'Kitchen config updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER or MANAGER role' })
  updateKitchen(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: UpdateKitchenConfigDto,
  ) {
    return this.serviceConfigService.updateKitchen(restaurantId, dto);
  }

  // ========== UPDATE PAYMENT CONFIG ==========

  @Patch(':restaurantId/payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update payment configuration (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Payment config updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER role' })
  updatePayments(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: UpdatePaymentConfigDto,
  ) {
    return this.serviceConfigService.updatePayments(restaurantId, dto);
  }

  // ========== UPDATE FEATURES ==========

  @Patch(':restaurantId/features')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update enabled features (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Features updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER role' })
  updateFeatures(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: UpdateFeaturesDto,
  ) {
    return this.serviceConfigService.updateFeatures(restaurantId, dto);
  }

  // ========== UPDATE TEAM CONFIG ==========

  @Patch(':restaurantId/team')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update team configuration (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Team config updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER role' })
  updateTeam(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: UpdateTeamConfigDto,
  ) {
    return this.serviceConfigService.updateTeam(restaurantId, dto);
  }

  // ========== INITIAL SETUP WIZARD ==========

  @Post('setup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Initial setup wizard (OWNER only)' })
  @ApiResponse({ status: 201, description: 'Initial setup completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER role' })
  initialSetup(@Body() dto: CreateConfigDto) {
    return this.serviceConfigService.initialSetup(dto);
  }

  // ========== SERVICE FEATURES ==========

  @Get(':restaurantId/service-features')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get derived service type features for restaurant' })
  @ApiResponse({ status: 200, description: 'Returns features enabled for the restaurant primary service type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER or MANAGER role' })
  getServiceFeatures(@Param('restaurantId') restaurantId: string) {
    return this.serviceConfigService.getServiceFeatures(restaurantId);
  }

  // ========== SETUP COMPLETION ==========

  @Get(':restaurantId/completion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get setup completion status (OWNER/MANAGER)' })
  @ApiResponse({ status: 200, description: 'Returns setup completion percentage and details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER or MANAGER role' })
  getSetupCompletion(@Param('restaurantId') restaurantId: string) {
    return this.serviceConfigService.getSetupCompletion(restaurantId);
  }
}
