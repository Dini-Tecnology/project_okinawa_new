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
import { Profile } from '../../users/entities/profile.entity';

export enum CallType {
  WAITER = 'waiter',
  MANAGER = 'manager',
  HELP = 'help',
  EMERGENCY = 'emergency',
}

export enum ServiceCallStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

@Entity('service_calls')
@Index(['restaurant_id'])
@Index(['status'])
@Index(['user_id'])
@Index(['called_at'])
export class ServiceCall {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid', { nullable: true })
  table_id: string | null;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'enum', enum: CallType })
  call_type: CallType;

  @Column({
    type: 'enum',
    enum: ServiceCallStatus,
    default: ServiceCallStatus.PENDING,
  })
  status: ServiceCallStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  message: string | null;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  called_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  acknowledged_at: Date | null;

  @Column('uuid', { nullable: true })
  acknowledged_by: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date | null;

  @Column('uuid', { nullable: true })
  resolved_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  caller: Profile;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'acknowledged_by' })
  acknowledger: Profile;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'resolved_by' })
  resolver: Profile;
}
