import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ReservationStatus } from '../../../common/enums';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Profile } from '../../users/entities/profile.entity';
import { ReservationGuest } from './reservation-guest.entity';

@Entity('reservations')
@Index('idx_reservation_restaurant', ['restaurant_id'])
@Index('idx_reservation_user', ['user_id'])
@Index('idx_reservation_status', ['status'])
@Index('idx_reservation_date', ['reservation_date'])
@Index('idx_reservation_restaurant_date', ['restaurant_id', 'reservation_date'])
@Index('idx_reservation_restaurant_status', ['restaurant_id', 'status'])
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  table_id: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ type: 'timestamp' })
  reservation_date: Date;

  @Column({ type: 'time' })
  reservation_time: string;

  @Column({ type: 'int' })
  party_size: number;

  @Column({ nullable: true })
  seating_preference: string;

  @Column({ nullable: true })
  occasion: string;

  @Column({ type: 'text', nullable: true })
  special_requests: string;

  @Column({ type: 'simple-array', nullable: true })
  dietary_restrictions: string[];

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ nullable: true })
  contact_email: string;

  @Column({ type: 'timestamp', nullable: true })
  confirmed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  seated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string;

  // ========== GROUP BOOKING FIELDS (EPIC 17) ==========

  @Column({ type: 'boolean', default: false })
  is_group_booking: boolean;

  @Column({ type: 'int', nullable: true })
  group_size: number | null;

  @Column({ type: 'boolean', default: false })
  pre_fixed_menu: boolean;

  @Column({ type: 'varchar', nullable: true })
  pre_fixed_menu_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  group_coordinator_name: string | null;

  @Column({ type: 'varchar', nullable: true })
  group_coordinator_phone: string | null;

  @Column({ type: 'boolean', default: false })
  deposit_required: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deposit_amount: number | null;

  // ========== END GROUP BOOKING FIELDS ==========

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.reservations)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @OneToMany(() => ReservationGuest, (guest) => guest.reservation, { cascade: true })
  guests: ReservationGuest[];
}
