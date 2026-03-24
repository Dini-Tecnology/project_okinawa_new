import {
  Controller,
  Get,
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
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('sentiment/:reviewId')
  @ApiOperation({ summary: 'Analyze sentiment of a specific review' })
  analyzeSentiment(@Param('reviewId') reviewId: string) {
    return this.aiService.analyzeSentiment(reviewId);
  }

  @Get('sentiment/restaurant/:restaurantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Batch analyze sentiments for restaurant' })
  batchAnalyzeSentiments(@Param('restaurantId') restaurantId: string) {
    return this.aiService.batchAnalyzeSentiments(restaurantId);
  }

  @Get('recommendations/menu')
  @ApiOperation({ summary: 'Get personalized menu recommendations for user' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getMenuRecommendations(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.aiService.getMenuRecommendations(user.id, restaurantId);
  }

  @Get('churn/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Predict customer churn risk' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  predictChurnRisk(
    @Param('userId') userId: string,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.aiService.predictChurnRisk(userId, restaurantId);
  }

  @Get('forecast/demand')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Forecast demand for next N days' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'days', required: false, type: Number })
  forecastDemand(
    @Query('restaurant_id') restaurantId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.aiService.forecastDemand(restaurantId, days);
  }

  @Get('menu-analysis/:restaurantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Analyze menu performance and get suggestions' })
  analyzeMenuPerformance(@Param('restaurantId') restaurantId: string) {
    return this.aiService.analyzeMenuPerformance(restaurantId);
  }

  @Get('insights/:restaurantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get business insights and recommendations for restaurant',
  })
  getBusinessInsights(@Param('restaurantId') restaurantId: string) {
    return this.aiService.getBusinessInsights(restaurantId);
  }
}
