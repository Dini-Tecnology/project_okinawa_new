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
  full_name: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'boolean', default: false })
  phone_verified: boolean;

  @Column({ nullable: true })
  default_address: string;

  @Column({ type: 'simple-array', nullable: true })
  dietary_restrictions: string[];

  @Column({ type: 'simple-array', nullable: true })
  favorite_cuisines: string[];

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles: UserRole[];
}
