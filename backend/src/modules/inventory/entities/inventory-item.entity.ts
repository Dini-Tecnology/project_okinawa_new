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
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum InventoryCategory {
  MEATS = 'meats',
  GRAINS = 'grains',
  VEGETABLES = 'vegetables',
  DAIRY = 'dairy',
  BEVERAGES = 'beverages',
  SPIRITS = 'spirits',
  CONDIMENTS = 'condiments',
  PACKAGING = 'packaging',
  CLEANING = 'cleaning',
  OTHER = 'other',
}

export enum InventoryUnit {
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
  UN = 'un',
  CX = 'cx',
  PCT = 'pct',
  DZ = 'dz',
}

@Entity('inventory_items')
@Index('idx_inventory_restaurant', ['restaurant_id'])
@Index('idx_inventory_category', ['category'])
@Index('idx_inventory_restaurant_category', ['restaurant_id', 'category'])
@Index('idx_inventory_active', ['restaurant_id', 'is_active'])
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: InventoryCategory })
  category: InventoryCategory;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  current_level: number;

  @Column({ type: 'enum', enum: InventoryUnit })
  unit: InventoryUnit;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  min_level: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  max_level: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_cost: number;

  @Column({ nullable: true, length: 200 })
  supplier: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamptz', nullable: true })
  last_restocked_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  /**
   * Virtual computed status (NOT persisted).
   * Based on (current_level / min_level) * 100:
   *   >= 50% = ok
   *   20-49% = low
   *   < 20%  = critical
   */
  get status(): 'ok' | 'low' | 'critical' {
    if (!this.min_level || Number(this.min_level) === 0) return 'ok';
    const pct = (Number(this.current_level) / Number(this.min_level)) * 100;
    if (pct < 20) return 'critical';
    if (pct < 50) return 'low';
    return 'ok';
  }

  /**
   * Virtual computed level percentage for progress bar.
   */
  get level_pct(): number {
    if (!this.min_level || Number(this.min_level) === 0) return 100;
    return Math.round((Number(this.current_level) / Number(this.min_level)) * 100);
  }
}
