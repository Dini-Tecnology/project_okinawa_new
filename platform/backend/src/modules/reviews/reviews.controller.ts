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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { OwnerResponseDto } from './dto/owner-response.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(user.id, createReviewDto);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all reviews for a restaurant with filters' })
  @ApiQuery({ name: 'min_rating', required: false, type: Number })
  @ApiQuery({ name: 'max_rating', required: false, type: Number })
  @ApiQuery({ name: 'verified_only', required: false, type: Boolean })
  @ApiQuery({ name: 'with_images_only', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Query('min_rating', new ParseIntPipe({ optional: true }))
    minRating?: number,
    @Query('max_rating', new ParseIntPipe({ optional: true }))
    maxRating?: number,
    @Query('verified_only') verifiedOnly?: string | boolean,
    @Query('with_images_only') withImagesOnly?: string | boolean,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.reviewsService.findByRestaurant(restaurantId, {
      min_rating: minRating,
      max_rating: maxRating,
      verified_only: verifiedOnly === true || verifiedOnly === 'true',
      with_images_only: withImagesOnly === true || withImagesOnly === 'true',
      limit,
      offset,
    });
  }

  @Get('restaurant/:restaurantId/stats')
  @ApiOperation({ summary: 'Get review statistics for a restaurant' })
  getRestaurantStats(@Param('restaurantId') restaurantId: string) {
    return this.reviewsService.getRestaurantReviewStats(restaurantId);
  }

  @Get('restaurant/:restaurantId/top')
  @ApiOperation({ summary: 'Get top rated reviews for a restaurant' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopReviews(
    @Param('restaurantId') restaurantId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.reviewsService.getTopReviews(restaurantId, limit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent reviews across all restaurants' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecentReviews(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.reviewsService.getRecentReviews(limit);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get reviews created by current user' })
  findByUser(@CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.findByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single review by ID' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review (only by owner)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, user.id, updateReviewDto);
  }

  @Post(':id/owner-response')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Add owner response to a review' })
  addOwnerResponse(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() ownerResponseDto: OwnerResponseDto,
  ) {
    return this.reviewsService.addOwnerResponse(
      id,
      user.id,
      ownerResponseDto,
    );
  }

  @Post(':id/helpful')
  @ApiOperation({ summary: 'Mark a review as helpful' })
  markAsHelpful(@Param('id') id: string) {
    return this.reviewsService.markAsHelpful(id);
  }

  @Patch(':id/visibility')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Toggle review visibility (moderation)' })
  toggleVisibility(
    @Param('id') id: string,
    @Body('visible') visible: boolean,
  ) {
    return this.reviewsService.toggleVisibility(id, visible);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.remove(id, user.id);
  }
}
