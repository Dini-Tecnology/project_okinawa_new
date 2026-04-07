import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('reviews')
@Index('idx_review_restaurant', ['restaurant_id'])
@Index('idx_review_user', ['user_id'])
@Index('idx_review_order', ['order_id'])
@Index('idx_review_rating', ['rating'])
@Index('idx_review_restaurant_visible', ['restaurant_id', 'is_visible'])
@Index('idx_review_created', ['created_at'])
@Check('CHK_review_rating', 'rating >= 1 AND rating <= 5')
@Check('CHK_review_food_rating', 'food_rating IS NULL OR (food_rating >= 1 AND food_rating <= 5)')
@Check('CHK_review_service_rating', 'service_rating IS NULL OR (service_rating >= 1 AND service_rating <= 5)')
@Check('CHK_review_ambiance_rating', 'ambiance_rating IS NULL OR (ambiance_rating >= 1 AND ambiance_rating <= 5)')
@Check('CHK_review_value_rating', 'value_rating IS NULL OR (value_rating >= 1 AND value_rating <= 5)')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid', { nullable: true })
  order_id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'int', nullable: true })
  food_rating: number;

  @Column({ type: 'int', nullable: true })
  service_rating: number;

  @Column({ type: 'int', nullable: true })
  ambiance_rating: number;

  @Column({ type: 'int', nullable: true })
  value_rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ nullable: true })
  sentiment: string;

  @Column({ type: 'jsonb', nullable: true })
  sentiment_analysis: Record<string, any>;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: true })
  is_visible: boolean;

  @Column({ type: 'int', default: 0 })
  helpful_count: number;

  @Column({ nullable: true })
  owner_response: string;

  @Column({ type: 'timestamp', nullable: true })
  owner_responded_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
