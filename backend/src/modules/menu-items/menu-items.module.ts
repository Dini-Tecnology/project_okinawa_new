import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { MenuItem } from './entities/menu-item.entity';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItemCustomizationGroup } from './entities/menu-item-customization-group.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem, MenuCategory, MenuItemCustomizationGroup, UserRole])],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
