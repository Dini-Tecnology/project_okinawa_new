import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('recipes')
@Controller('recipes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @Roles(UserRole.BARMAN, UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List all recipes for restaurant (includes global defaults)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of recipes' })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('restaurantId') restaurantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.recipesService.findByRestaurant(restaurantId, pagination);
  }

  @Get('defaults')
  @Roles(UserRole.BARMAN, UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List global/default recipes' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of default recipes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findDefaults(@Query() pagination: PaginationDto) {
    return this.recipesService.findDefaults(pagination);
  }

  @Get(':id')
  @Roles(UserRole.BARMAN, UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get single recipe by ID' })
  @ApiResponse({ status: 200, description: 'Returns recipe details' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create custom recipe (OWNER/MANAGER only)' })
  @ApiResponse({ status: 201, description: 'Recipe created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid recipe data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  create(
    @Query('restaurantId') restaurantId: string,
    @Body() createRecipeDto: CreateRecipeDto,
  ) {
    return this.recipesService.create(restaurantId, createRecipeDto);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update recipe (OWNER/MANAGER only)' })
  @ApiResponse({ status: 200, description: 'Recipe updated successfully' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Soft delete recipe (OWNER/MANAGER only)' })
  @ApiResponse({ status: 200, description: 'Recipe deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  remove(@Param('id') id: string) {
    return this.recipesService.softDelete(id);
  }
}
