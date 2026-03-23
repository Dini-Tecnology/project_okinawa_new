import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomizationGroup } from './entities/customization-group.entity';
import { MenuCustomizationService } from './menu-customization.service';
import { MenuCustomizationController } from './menu-customization.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomizationGroup])],
  controllers: [MenuCustomizationController],
  providers: [MenuCustomizationService],
  exports: [MenuCustomizationService],
})
export class MenuCustomizationModule {}
