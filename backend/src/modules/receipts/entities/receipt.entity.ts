import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export interface ReceiptItemSnapshot {
  name: string;
  qty: number;
  unit_price: number;
  total: number;
}

@Entity('receipts')
@Index('idx_receipts_user', ['user_id'])
@Index('idx_receipts_restaurant', ['restaurant_id'])
@Index('uq_receipts_order', ['order_id'], { unique: true })
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  order_id: string;

  @Column({ nullable: true })
  payment_id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'jsonb' })
  items_snapshot: ReceiptItemSnapshot[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  service_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ length: 100 })
  payment_method: string;

  @Column({ type: 'timestamptz' })
  generated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
