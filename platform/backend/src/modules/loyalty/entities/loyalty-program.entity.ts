import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

@Entity('loyalty_programs')
@Unique('uq_loyalty_user_restaurant', ['user_id', 'restaurant_id'])
@Index('idx_loyalty_user', ['user_id'])
@Index('idx_loyalty_restaurant', ['restaurant_id'])
@Index('idx_loyalty_tier', ['tier'])
@Index('idx_loyalty_points', ['points'])
export class LoyaltyProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  total_visits: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_spent: number;

  @Column({ type: 'enum', enum: LoyaltyTier, default: LoyaltyTier.BRONZE })
  tier: LoyaltyTier;

  @Column({ type: 'date', nullable: true })
  last_visit: Date;

  @Column({ type: 'jsonb', nullable: true })
  rewards_claimed: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  available_rewards: Record<string, any>[];

  /** Order IDs that have already been awarded points — used for idempotency */
  @Column({ type: 'text', array: true, default: '{}' })
  awarded_order_ids: string[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
