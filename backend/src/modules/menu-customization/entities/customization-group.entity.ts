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
import { MenuItem } from '../../menu-items/entities/menu-item.entity';

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

@Entity('menu_item_customization_groups')
@Index(['menu_item_id'])
@Index(['menu_item_id', 'sort_order'])
export class CustomizationGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  menu_item_id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ default: 0 })
  min_select: number;

  @Column({ default: 1 })
  max_select: number;

  @Column({ default: false })
  is_required: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ type: 'jsonb', default: [] })
  options: CustomizationOption[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menu_item: MenuItem;
}
