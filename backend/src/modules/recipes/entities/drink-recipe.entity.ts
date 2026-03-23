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

export enum RecipeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('drink_recipes')
@Index('idx_drink_recipe_restaurant_active', ['restaurant_id', 'is_active'])
@Index('idx_drink_recipe_restaurant_name', ['restaurant_id', 'name'])
@Index('idx_drink_recipe_category', ['category'])
export class DrinkRecipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  restaurant_id: string | null;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 80 })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: RecipeDifficulty,
    default: RecipeDifficulty.EASY,
  })
  difficulty: RecipeDifficulty;

  @Column({ type: 'int' })
  preparation_time_minutes: number;

  @Column({ length: 80 })
  glass_type: string;

  @Column({ length: 200, nullable: true })
  garnish: string | null;

  @Column({ length: 80, nullable: true })
  base_spirit: string | null;

  @Column({ length: 60, default: 'gelado' })
  serving_temp: string;

  @Column({ type: 'jsonb' })
  ingredients: { name: string; amount: string; unit: string }[];

  @Column({ type: 'jsonb' })
  steps: string[];

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
