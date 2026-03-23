import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('promotions')
@Controller('promotions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({ status: 201, description: 'Promotion created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Duplicate promotion code' })
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get(':restaurantId')
  @ApiOperation({ summary: 'List active promotions for a restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
  @ApiResponse({ status: 200, description: 'Returns active promotions' })
  findActiveByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
  ) {
    return this.promotionsService.findActiveByRestaurant(restaurantId);
  }

  @Get(':restaurantId/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List all promotions for a restaurant (management)' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
  @ApiResponse({ status: 200, description: 'Returns all promotions with status' })
  findAllByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
  ) {
    return this.promotionsService.findAllByRestaurant(restaurantId);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get promotion by code' })
  @ApiParam({ name: 'code', description: 'Promotion code' })
  @ApiResponse({ status: 200, description: 'Returns promotion details' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  findByCode(@Param('code') code: string) {
    return this.promotionsService.findByCode(code);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a promotion' })
  @ApiParam({ name: 'id', description: 'Promotion UUID' })
  @ApiResponse({ status: 200, description: 'Promotion updated successfully' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  @ApiResponse({ status: 409, description: 'Duplicate promotion code' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: Partial<CreatePromotionDto>,
  ) {
    return this.promotionsService.update(id, updateDto);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code at checkout' })
  @ApiResponse({
    status: 200,
    description: 'Validation result with discount details',
  })
  validate(@Body() validateDto: ValidatePromotionDto) {
    return this.promotionsService.validate(validateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Soft delete a promotion (set to inactive)' })
  @ApiParam({ name: 'id', description: 'Promotion UUID' })
  @ApiResponse({ status: 200, description: 'Promotion deactivated' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.promotionsService.softDelete(id);
  }
}
