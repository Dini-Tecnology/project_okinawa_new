import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { AddPointsDto } from './dto/add-points.dto';
import { RedeemRewardDto } from './dto/redeem-reward.dto';
import { UpdateLoyaltyProgramDto } from './dto/update-loyalty-program.dto';
import { AddStampDto } from './dto/add-stamp.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('loyalty')
@Controller('loyalty')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('my-programs')
  @ApiOperation({ summary: 'Get all loyalty programs for current user' })
  @ApiResponse({ status: 200, description: 'Returns user loyalty programs' })
  getMyPrograms(@CurrentUser() user: any) {
    return this.loyaltyService.getAllUserPrograms(user.id);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user loyalty profile for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns loyalty profile' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  getProfile(
    @CurrentUser() user: any,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.loyaltyService.getProfile(user.id, restaurantId);
  }

  @Patch('profile')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update user loyalty profile (Admin only)' })
  @ApiQuery({ name: 'user_id', required: true, type: String })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Loyalty profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Loyalty profile not found' })
  updateProfile(
    @Query('user_id') userId: string,
    @Query('restaurant_id') restaurantId: string,
    @Body() updateDto: UpdateLoyaltyProgramDto,
  ) {
    return this.loyaltyService.updateProfile(userId, restaurantId, updateDto);
  }

  @Post('points')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Manually add points to user (admin only)' })
  @ApiQuery({ name: 'user_id', required: true, type: String })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Points added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid points data' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  addPoints(
    @Query('user_id') userId: string,
    @Query('restaurant_id') restaurantId: string,
    @Body() addPointsDto: AddPointsDto,
  ) {
    return this.loyaltyService.addPoints(userId, restaurantId, addPointsDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get loyalty points history for user' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns points history' })
  getHistory(
    @CurrentUser() user: any,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.loyaltyService.getHistory(user.id, restaurantId);
  }

  @Get('rewards')
  @ApiOperation({ summary: 'Get available rewards for user' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns available rewards' })
  getRewards(
    @CurrentUser() user: any,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.loyaltyService.getAvailableRewards(user.id, restaurantId);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem a reward with points' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Reward redeemed successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient points or invalid reward' })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  redeemReward(
    @CurrentUser() user: any,
    @Query('restaurant_id') restaurantId: string,
    @Body() redeemDto: RedeemRewardDto,
  ) {
    return this.loyaltyService.redeemReward(user.id, restaurantId, redeemDto);
  }

  @Get('tiers')
  @ApiOperation({ summary: 'Get all loyalty tiers and their benefits' })
  @ApiResponse({ status: 200, description: 'Returns loyalty tiers' })
  getTiers() {
    return this.loyaltyService.getTiers();
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get loyalty leaderboard for restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiResponse({ status: 200, description: 'Returns paginated leaderboard' })
  getLeaderboard(
    @Query('restaurant_id') restaurantId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.loyaltyService.getLeaderboard(restaurantId, limit, page);
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get loyalty program statistics (admin only)' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns loyalty statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  getStatistics(@Query('restaurant_id') restaurantId: string) {
    return this.loyaltyService.getStatistics(restaurantId);
  }

  @Get('stamp-cards/:restaurantId')
  @ApiOperation({ summary: 'Get user stamp cards for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns user stamp cards' })
  getStampCards(
    @CurrentUser() user: any,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.loyaltyService.getStampCards(user.id, restaurantId);
  }

  @Post('stamp-card/stamp')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.BARMAN)
  @ApiOperation({ summary: 'Add a stamp to a user stamp card' })
  @ApiResponse({ status: 200, description: 'Stamp added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid stamp data' })
  addStamp(@Body() addStampDto: AddStampDto) {
    return this.loyaltyService.addStamp(addStampDto);
  }
}
