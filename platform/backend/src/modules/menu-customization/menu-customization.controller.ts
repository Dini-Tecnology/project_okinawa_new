import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MenuCustomizationService } from './menu-customization.service';
import { CreateCustomizationGroupDto } from './dto/create-customization-group.dto';
import { UpdateCustomizationGroupDto } from './dto/update-customization-group.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CustomizationOption } from './entities/customization-group.entity';

@Controller('menu-customization')
@UseGuards(JwtAuthGuard)
export class MenuCustomizationController {
  constructor(private readonly service: MenuCustomizationService) {}

  @Get(':menuItemId')
  findByMenuItem(@Param('menuItemId') menuItemId: string) {
    return this.service.findByMenuItem(menuItemId);
  }

  @Post()
  create(@Body() dto: CreateCustomizationGroupDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomizationGroupDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/options')
  updateOptions(@Param('id') id: string, @Body() options: CustomizationOption[]) {
    return this.service.updateOptions(id, options);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
