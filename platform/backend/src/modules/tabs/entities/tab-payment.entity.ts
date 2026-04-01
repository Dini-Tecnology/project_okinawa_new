import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PaymentSplitStatus } from '@/modules/payments/entities/payment-split.entity';
import { Tab } from './tab.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

/**
 * TabPayment Entity - Individual payments within a tab
 * Reuses patterns from PaymentSplit
 */
@Entity('tab_payments')
@Index('idx_tab_payment_tab', ['tab_id'])
@Index('idx_tab_payment_user', ['user_id'])
@Index('idx_tab_payment_status', ['status'])
export class TabPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tab_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip_amount: number;

  @Column({ type: 'varchar', length: 50 })
  payment_method: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transaction_id: string;

  @Column({
    type: 'enum',
    enum: PaymentSplitStatus,
    default: PaymentSplitStatus.PENDING,
  })
  status: PaymentSplitStatus;

  @Column({ type: 'jsonb', nullable: true })
  payment_details: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  idempotency_key: string | null;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Tab, (tab) => tab.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tab_id' })
  tab: Tab;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;
}
