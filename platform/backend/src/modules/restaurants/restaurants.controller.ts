import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { RestaurantConfigService } from './restaurant-config.service';
import { RestaurantSetupService } from './restaurant-setup.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { FilterRestaurantDto } from './dto/filter-restaurant.dto';
import { UpdateServiceConfigDto } from './dto/update-service-config.dto';
import { UpdateSetupProgressDto } from './dto/update-setup-progress.dto';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RestaurantOwnerGuard } from '@/common/guards/restaurant-owner.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly restaurantConfigService: RestaurantConfigService,
    private readonly restaurantSetupService: RestaurantSetupService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all restaurants with filters' })
  @ApiResponse({ status: 200, description: 'Returns list of restaurants' })
  findAll(@Query() filters: FilterRestaurantDto) {
    return this.restaurantsService.findAll(filters);
  }

  @Public()
  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby restaurants using Haversine distance' })
  @ApiResponse({ status: 200, description: 'Returns list of nearby restaurants with distance' })
  @ApiQuery({ name: 'lat', required: true, type: Number, description: 'User latitude' })
  @ApiQuery({ name: 'lng', required: true, type: Number, description: 'User longitude' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Search radius in km (default 5)' })
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.restaurantsService.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 5,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID' })
  @ApiResponse({ status: 200, description: 'Returns restaurant details' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create restaurant' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid restaurant data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createRestaurantDto: CreateRestaurantDto, @CurrentUser() user: AuthenticatedUser) {
    return this.restaurantsService.create(createRestaurantDto, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant (OWNER/MANAGER only)' })
  @ApiResponse({ status: 200, description: 'Restaurant updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  @ApiResponse({ status: 403, description: 'Forbidden - must be owner or manager' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateRestaurantDto>) {
    return this.restaurantsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete restaurant (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Restaurant deactivated successfully' })
  remove(@Param('id') id: string) {
    return this.restaurantsService.softDelete(id);
  }

  // ========== SERVICE CONFIG ENDPOINTS ==========

  @Get(':id/service-config')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get restaurant service configuration (OWNER/MANAGER only)' })
  @ApiResponse({ status: 200, description: 'Returns restaurant service configuration' })
  @ApiResponse({ status: 403, description: 'Forbidden - must be owner or manager' })
  getServiceConfig(@Param('id') id: string) {
    return this.restaurantConfigService.getServiceConfig(id);
  }

  @Patch(':id/service-config')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant service configuration' })
  @ApiResponse({ status: 200, description: 'Service configuration updated successfully' })
  updateServiceConfig(
    @Param('id') id: string,
    @Body() updateConfigDto: UpdateServiceConfigDto,
  ) {
    return this.restaurantConfigService.updateServiceConfig(id, updateConfigDto);
  }

  // ========== SETUP PROGRESS ENDPOINTS ==========

  @Get(':id/setup-progress')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get restaurant setup progress (OWNER/MANAGER only)' })
  @ApiResponse({ status: 200, description: 'Returns setup progress' })
  @ApiResponse({ status: 403, description: 'Forbidden - must be owner or manager' })
  getSetupProgress(@Param('id') id: string) {
    return this.restaurantSetupService.getSetupProgress(id);
  }

  @Patch(':id/setup-progress')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant setup progress' })
  @ApiResponse({ status: 200, description: 'Setup progress updated successfully' })
  updateSetupProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateSetupProgressDto,
  ) {
    return this.restaurantSetupService.updateSetupProgress(id, updateProgressDto);
  }

  // ========== GEOFENCING ENDPOINTS ==========

  @Get(':id/geofence-check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user is inside restaurant geofence' })
  @ApiResponse({ status: 200, description: 'Returns geofence status with distance' })
  @ApiResponse({ status: 404, description: 'Restaurant not found or no geolocation configured' })
  @ApiQuery({ name: 'lat', required: true, type: Number, description: 'User latitude' })
  @ApiQuery({ name: 'lng', required: true, type: Number, description: 'User longitude' })
  getGeofenceStatus(
    @Param('id') id: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    return this.restaurantsService.getGeofenceStatus(id, parseFloat(lat), parseFloat(lng));
  }
}
