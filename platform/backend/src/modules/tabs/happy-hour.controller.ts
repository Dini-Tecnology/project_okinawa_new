import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HappyHourService } from './happy-hour.service';
import { CreateHappyHourScheduleDto } from './dto';

@ApiTags('Happy Hour')
@Controller('happy-hour')
@ApiBearerAuth()
export class HappyHourController {
  constructor(private readonly happyHourService: HappyHourService) {}

  @Post()
  @ApiOperation({ summary: 'Create a happy hour schedule' })
  async createSchedule(@Body() dto: CreateHappyHourScheduleDto) {
    return this.happyHourService.createSchedule(dto);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all happy hour schedules for a restaurant' })
  async getSchedules(@Param('restaurantId') restaurantId: string) {
    return this.happyHourService.getRestaurantSchedules(restaurantId);
  }

  @Get('restaurant/:restaurantId/active')
  @ApiOperation({ summary: 'Get currently active happy hour promotions' })
  async getActivePromotions(@Param('restaurantId') restaurantId: string) {
    return this.happyHourService.getActivePromotions(restaurantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a happy hour schedule' })
  async updateSchedule(
    @Param('id') id: string,
    @Body() dto: Partial<CreateHappyHourScheduleDto>,
  ) {
    return this.happyHourService.updateSchedule(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a happy hour schedule' })
  async deleteSchedule(@Param('id') id: string) {
    return this.happyHourService.deleteSchedule(id);
  }
}
