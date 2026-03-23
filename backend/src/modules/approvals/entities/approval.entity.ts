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

export enum ApprovalType {
  CANCEL = 'cancel',
  COURTESY = 'courtesy',
  REFUND = 'refund',
  DISCOUNT = 'discount',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('approvals')
@Index(['restaurant_id'])
@Index(['status'])
@Index(['requester_id'])
@Index(['created_at'])
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'enum', enum: ApprovalType })
  type: ApprovalType;

  @Column()
  item_name: string;

  @Column('uuid', { nullable: true })
  table_id: string;

  @Column('uuid')
  requester_id: string;

  @Column('uuid', { nullable: true })
  resolver_id: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  resolution_note: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status: ApprovalStatus;

  @Column('uuid', { nullable: true })
  order_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  // Relations
  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'requester_id' })
  requester: Profile;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'resolver_id' })
  resolver: Profile;
}
