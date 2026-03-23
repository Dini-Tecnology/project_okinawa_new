import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PromotionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_ITEM = 'free_item',
  BOGO = 'bogo',
  HAPPY_HOUR = 'happy_hour',
}

export enum PromotionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  SCHEDULED = 'scheduled',
}

@Entity('promotions')
@Index('idx_promotions_restaurant', ['restaurant_id'])
@Index('idx_promotions_status', ['status'])
@Index('idx_promotions_code_restaurant', ['code', 'restaurant_id'], { unique: true })
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'varchar', length: 30 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: PromotionType })
  type: PromotionType;

  @Column({ type: 'enum', enum: PromotionStatus, default: PromotionStatus.ACTIVE })
  status: PromotionStatus;

  @Column({ type: 'int', nullable: true })
  discount_value: number | null;

  @Column({ type: 'uuid', nullable: true })
  free_item_id: string | null;

  @Column({ type: 'int', nullable: true })
  min_order_value: number | null;

  @Column({ type: 'int', nullable: true })
  max_uses: number | null;

  @Column({ type: 'int', default: 0 })
  current_uses: number;

  @Column({ type: 'int', default: 1 })
  max_uses_per_user: number;

  @Column({ type: 'timestamp' })
  valid_from: Date;

  @Column({ type: 'timestamp' })
  valid_until: Date;

  @Column({ type: 'int', array: true, nullable: true })
  days_of_week: number[] | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  hours_from: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  hours_until: string | null;

  @Column({ type: 'varchar', array: true, nullable: true })
  applicable_categories: string[] | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
