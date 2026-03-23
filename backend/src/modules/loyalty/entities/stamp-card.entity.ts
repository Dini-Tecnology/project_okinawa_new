import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('stamp_cards')
@Unique('uq_stamp_user_restaurant_service', ['user_id', 'restaurant_id', 'service_type'])
@Index('idx_stamp_cards_user', ['user_id'])
@Index('idx_stamp_cards_restaurant', ['restaurant_id'])
export class StampCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  service_type: string;

  @Column({ type: 'int', default: 0 })
  current_stamps: number;

  @Column({ type: 'int', default: 10 })
  required_stamps: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  reward_description: string;

  @Column({ type: 'int', default: 0 })
  completed_cycles: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
