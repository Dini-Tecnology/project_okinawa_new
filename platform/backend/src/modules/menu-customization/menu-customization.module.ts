import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemCustomizationGroup } from '../menu-items/entities/menu-item-customization-group.entity';
import { MenuCustomizationService } from './menu-customization.service';
import { MenuCustomizationController } from './menu-customization.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItemCustomizationGroup])],
  controllers: [MenuCustomizationController],
  providers: [MenuCustomizationService],
  exports: [MenuCustomizationService],
})
export class MenuCustomizationModule {}
