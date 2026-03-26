import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../../user-roles/entities/user-role.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  full_name: string | null;

  @Column({ nullable: true })
  avatar_url: string | null;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ type: 'boolean', default: false })
  phone_verified: boolean;

  @Column({ nullable: true })
  default_address: string | null;

  @Column({ type: 'simple-array', nullable: true })
  dietary_restrictions: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  favorite_cuisines: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any> | null;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;

  @Column({ type: 'boolean', default: false })
  marketing_consent: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletion_requested_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deletion_scheduled_for: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles: UserRole[];
}
