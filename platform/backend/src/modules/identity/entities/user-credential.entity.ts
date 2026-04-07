/**
 * UserCredential entity - Stores user authentication credentials separately from profile
 * This follows security best practices by keeping sensitive auth data isolated
 *
 * Part of Identity Module (AUDIT-010)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Profile } from '@/modules/users/entities/profile.entity';
import { encryptedTransformer, encryptedArrayTransformer } from '@/common/utils/field-encryption';

@Entity('user_credentials')
export class UserCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  @Index('idx_user_credentials_user_id')
  user_id: string;

  @OneToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'int', default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date | null;

  @Column({ type: 'varchar', nullable: true })
  last_login_ip: string | null;

  @Column({ type: 'timestamp', nullable: true })
  password_changed_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  password_history: string[]; // Store last N password hashes to prevent reuse

  @Column({ type: 'boolean', default: false })
  mfa_enabled: boolean;

  @Column({ type: 'varchar', nullable: true, transformer: encryptedTransformer })
  mfa_secret: string | null;

  @Column({ type: 'text', nullable: true, transformer: encryptedArrayTransformer })
  mfa_backup_codes: string[] | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
