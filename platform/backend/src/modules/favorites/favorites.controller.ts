import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add restaurant to favorites' })
  @ApiResponse({ status: 201, description: 'Restaurant added to favorites' })
  @ApiResponse({ status: 400, description: 'Invalid restaurant ID' })
  @ApiResponse({ status: 409, description: 'Restaurant already in favorites' })
  addFavorite(@CurrentUser() user: AuthenticatedUser, @Body() addFavoriteDto: AddFavoriteDto) {
    return this.favoritesService.addFavorite(user.id, addFavoriteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user favorites' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of favorites' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getFavorites(@CurrentUser() user: AuthenticatedUser, @Query() pagination: PaginationDto) {
    return this.favoritesService.getFavorites(user.id, pagination);
  }

  @Get(':restaurantId/check')
  @ApiOperation({ summary: 'Check if restaurant is favorited' })
  @ApiResponse({ status: 200, description: 'Returns favorite status' })
  async isFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
  ) {
    const isFavorite = await this.favoritesService.isFavorite(user.id, restaurantId);
    return { is_favorite: isFavorite };
  }

  @Patch(':restaurantId/notes')
  @ApiOperation({ summary: 'Update favorite notes' })
  @ApiResponse({ status: 200, description: 'Notes updated successfully' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  updateNotes(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Body('notes') notes: string,
  ) {
    return this.favoritesService.updateNotes(user.id, restaurantId, notes);
  }

  @Patch(':restaurantId')
  @ApiOperation({ summary: 'Update favorite' })
  @ApiResponse({ status: 200, description: 'Favorite updated successfully' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  updateFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    return this.favoritesService.updateNotes(user.id, restaurantId, updateFavoriteDto.notes || '');
  }

  @Delete(':restaurantId')
  @ApiOperation({ summary: 'Remove restaurant from favorites' })
  @ApiResponse({ status: 200, description: 'Restaurant removed from favorites' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  removeFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.favoritesService.removeFavorite(user.id, restaurantId);
  }
}
