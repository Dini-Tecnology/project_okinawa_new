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
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

/**
 * Waitlist bar order item — stored as JSONB in WaitlistEntry
 */
export interface WaitlistBarOrder {
  itemName: string;
  itemPrice: number;
  quantity: number;
  addedAt: string; // ISO timestamp
}

/**
 * Waitlist entry status enum
 */
export enum WaitlistStatus {
  WAITING = 'waiting',
  CALLED = 'called',
  SEATED = 'seated',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled',
}

/**
 * Seating preference enum
 */
export enum SeatingPreference {
  SALAO = 'salao',
  TERRACO = 'terraco',
  QUALQUER = 'qualquer',
}

/**
 * WaitlistEntry Entity — Smart Waitlist for Casual Dining (EPIC 10)
 */
@Entity('waitlist_entries')
@Index('idx_waitlist_restaurant', ['restaurant_id'])
@Index('idx_waitlist_customer', ['customer_id'])
@Index('idx_waitlist_status', ['status'])
@Index('idx_waitlist_position', ['restaurant_id', 'position'])
export class WaitlistEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid', { nullable: true })
  customer_id: string | null;

  @Column({ type: 'varchar', length: 150 })
  customer_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  customer_phone: string | null;

  @Column({ type: 'int' })
  party_size: number;

  @Column({
    type: 'enum',
    enum: SeatingPreference,
    default: SeatingPreference.QUALQUER,
  })
  preference: SeatingPreference;

  @Column({ type: 'boolean', default: false })
  has_kids: boolean;

  @Column({ type: 'jsonb', nullable: true })
  kids_ages: number[] | null;

  @Column({ type: 'jsonb', nullable: true })
  kids_allergies: string[] | null;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  waitlist_bar_orders: WaitlistBarOrder[];

  @Column({
    type: 'enum',
    enum: WaitlistStatus,
    default: WaitlistStatus.WAITING,
  })
  status: WaitlistStatus;

  @Column({ type: 'int', nullable: true })
  estimated_wait_minutes: number | null;

  @Column({ type: 'int' })
  position: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  table_number: string | null;

  @Column({ type: 'timestamp', nullable: true })
  called_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  seated_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  no_show_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Profile;
}
