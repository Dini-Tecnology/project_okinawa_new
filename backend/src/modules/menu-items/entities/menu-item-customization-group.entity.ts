import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { MenuItem } from './menu-item.entity';

export interface CustomizationOption {
  id: string;
  name: string;
  price_delta: number; // cents
  calories: number | null;
}

@Entity('menu_item_customization_groups')
@Index('idx_customization_menu_item', ['menu_item_id'])
@Index('idx_customization_sort', ['menu_item_id', 'sort_order'])
export class MenuItemCustomizationGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  menu_item_id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'int', default: 0 })
  min_select: number;

  @Column({ type: 'int', default: 1 })
  max_select: number;

  @Column({ default: false })
  is_required: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'jsonb', default: '[]' })
  options: CustomizationOption[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menu_item: MenuItem;
}
