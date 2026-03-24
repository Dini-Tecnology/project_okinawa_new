import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { RestaurantTable } from './restaurant-table.entity';
import { Profile } from '../../users/entities/profile.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

@Entity('table_sessions')
@Index('idx_sessions_restaurant', ['restaurant_id'])
@Index('idx_sessions_table', ['table_id'])
@Index('idx_sessions_customer', ['customer_id'])
@Index('idx_sessions_active', ['status'], { where: "status = 'active'" })
export class TableSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid')
  table_id: string;

  @Column('uuid', { nullable: true })
  qr_code_id: string;

  @Column('uuid', { nullable: true })
  customer_id: string;

  @Column('uuid', { nullable: true })
  primary_user_id: string;

  @Column({ type: 'uuid', array: true, default: '{}' })
  guest_user_ids: string[];

  @Column({ length: 100, nullable: true })
  guest_name: string;

  @Column({ type: 'int', default: 1 })
  guest_count: number;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  started_at: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  last_activity: Date;

  @Column({ type: 'timestamptz', nullable: true })
  ended_at: Date;

  @Column({ type: 'int', default: 0 })
  total_orders: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_spent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => RestaurantTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: RestaurantTable;

  @ManyToOne(() => Profile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer: Profile;

  @ManyToOne(() => Profile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'primary_user_id' })
  primary_user: Profile;
}
