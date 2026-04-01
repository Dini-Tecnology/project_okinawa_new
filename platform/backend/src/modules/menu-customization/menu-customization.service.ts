import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemCustomizationGroup } from '../menu-items/entities/menu-item-customization-group.entity';
import { CreateCustomizationGroupDto } from './dto/create-customization-group.dto';
import { UpdateCustomizationGroupDto } from './dto/update-customization-group.dto';

@Injectable()
export class MenuCustomizationService {
  constructor(
    @InjectRepository(MenuItemCustomizationGroup)
    private readonly repo: Repository<MenuItemCustomizationGroup>,
  ) {}

  async findByMenuItem(menuItemId: string): Promise<MenuItemCustomizationGroup[]> {
    return this.repo.find({
      where: { menu_item_id: menuItemId },
      order: { sort_order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<MenuItemCustomizationGroup> {
    const group = await this.repo.findOne({ where: { id } });
    if (!group) throw new NotFoundException(`Customization group ${id} not found`);
    return group;
  }

  async create(dto: CreateCustomizationGroupDto): Promise<MenuItemCustomizationGroup> {
    const group = this.repo.create(dto);
    return this.repo.save(group);
  }

  async update(id: string, dto: UpdateCustomizationGroupDto): Promise<MenuItemCustomizationGroup> {
    const group = await this.findOne(id);
    Object.assign(group, dto);
    return this.repo.save(group);
  }

  async updateOptions(id: string, options: MenuItemCustomizationGroup['options']): Promise<MenuItemCustomizationGroup> {
    const group = await this.findOne(id);
    group.options = options;
    return this.repo.save(group);
  }

  async remove(id: string): Promise<void> {
    const group = await this.findOne(id);
    await this.repo.remove(group);
  }
}
