import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItemCustomizationGroup } from './entities/menu-item-customization-group.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCustomizationGroupDto } from './dto/create-customization-group.dto';
import { UpdateCustomizationGroupDto } from './dto/update-customization-group.dto';
import { PaginationDto, paginate, toPaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(MenuCategory)
    private categoryRepository: Repository<MenuCategory>,
    @InjectRepository(MenuItemCustomizationGroup)
    private customizationGroupRepository: Repository<MenuItemCustomizationGroup>,
  ) {}

  async findByRestaurant(restaurantId: string, pagination?: PaginationDto) {
    const dto = toPaginationDto(pagination);

    const [items, total] = await this.menuItemRepository.findAndCount({
      where: { restaurant_id: restaurantId, is_available: true },
      order: { category: 'ASC', name: 'ASC' },
      skip: dto.offset,
      take: dto.limit,
    });

    return paginate(items, total, dto);
  }

  async findCategories(restaurantId: string) {
    return this.categoryRepository.find({
      where: { restaurant_id: restaurantId, is_active: true },
      order: { display_order: 'ASC' },
    });
  }

  async createItem(createMenuItemDto: CreateMenuItemDto) {
    const item = this.menuItemRepository.create(createMenuItemDto);
    return this.menuItemRepository.save(item);
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async updateItem(id: string, updateData: Partial<CreateMenuItemDto>) {
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    Object.assign(item, updateData);
    return this.menuItemRepository.save(item);
  }

  async deleteItem(id: string) {
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    item.is_available = false;
    return this.menuItemRepository.save(item);
  }

  async updateCategory(id: string, updateData: Partial<CreateCategoryDto>) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, updateData);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    category.is_active = false;
    return this.categoryRepository.save(category);
  }

  // ========== CUSTOMIZATION GROUP METHODS ==========

  /**
   * Get all customization groups for a menu item, sorted by sort_order.
   */
  async findCustomizationGroups(menuItemId: string): Promise<MenuItemCustomizationGroup[]> {
    // Verify the menu item exists
    const menuItem = await this.menuItemRepository.findOne({ where: { id: menuItemId } });
    if (!menuItem) throw new NotFoundException('Menu item not found');

    return this.customizationGroupRepository.find({
      where: { menu_item_id: menuItemId },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Create a customization group for a menu item.
   */
  async createCustomizationGroup(
    menuItemId: string,
    dto: CreateCustomizationGroupDto,
  ): Promise<MenuItemCustomizationGroup> {
    const menuItem = await this.menuItemRepository.findOne({ where: { id: menuItemId } });
    if (!menuItem) throw new NotFoundException('Menu item not found');

    const group = this.customizationGroupRepository.create({
      ...dto,
      menu_item_id: menuItemId,
    });

    return this.customizationGroupRepository.save(group);
  }

  /**
   * Update a customization group.
   */
  async updateCustomizationGroup(
    groupId: string,
    dto: UpdateCustomizationGroupDto,
  ): Promise<MenuItemCustomizationGroup> {
    const group = await this.customizationGroupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Customization group not found');

    Object.assign(group, dto);
    return this.customizationGroupRepository.save(group);
  }

  /**
   * Delete a customization group.
   */
  async deleteCustomizationGroup(groupId: string): Promise<{ message: string }> {
    const group = await this.customizationGroupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Customization group not found');

    await this.customizationGroupRepository.remove(group);
    return { message: 'Customization group deleted successfully' };
  }
}
