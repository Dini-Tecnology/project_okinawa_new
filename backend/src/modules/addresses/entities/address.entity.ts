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
import { Profile } from '../../users/entities/profile.entity';

@Entity('addresses')
@Index('idx_addresses_user', ['user_id'])
@Index('idx_addresses_user_default', ['user_id', 'is_default'])
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  restaurant_id: string | null;

  @Column({ length: 50 })
  label: string;

  @Column({ length: 255 })
  street: string;

  @Column({ length: 20 })
  number: string;

  @Column({ length: 255, nullable: true })
  complement: string | null;

  @Column({ length: 100 })
  neighborhood: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 2 })
  state: string;

  @Column({ length: 10 })
  postal_code: string;

  @Column({ default: 'BR' })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column({ default: false })
  is_default: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Profile;
}
