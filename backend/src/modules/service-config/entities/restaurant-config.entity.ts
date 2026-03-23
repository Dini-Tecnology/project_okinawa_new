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

/**
 * Interfaces for JSONB column types
 */
export interface ConfigProfile {
  name?: string;
  description?: string;
  photo?: string;
  contact?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  hours?: Record<string, { open: string; close: string; closed?: boolean }>;
  website?: string;
  cuisineType?: string[];
  priceRange?: string;
  capacity?: number;
}

export interface ServiceTypes {
  primary: string;
  supported: string[];
}

export interface ExperienceFlags {
  reservationsEnabled?: boolean;
  virtualQueueEnabled?: boolean;
  familyModeEnabled?: boolean;
  qrTableOrdering?: boolean;
  sharedComanda?: boolean;
  aiHarmonization?: boolean;
  workMode?: string;
  happyHourEnabled?: boolean;
}

export interface FloorSection {
  id: string;
  name: string;
  color?: string;
  capacity?: number;
}

export interface FloorTable {
  id: string;
  tableNumber: string;
  sectionId: string;
  seats: number;
  positionX?: number;
  positionY?: number;
  shape?: string;
}

export interface FloorLayout {
  sections: FloorSection[];
  tables: FloorTable[];
}

export interface KitchenStation {
  id: string;
  name: string;
  keywords: string[];
  displayName: string;
}

export interface KitchenConfig {
  stations: KitchenStation[];
  routing: {
    kitchen: string[];
    bar: string[];
  };
}

export interface PaymentConfig {
  enabledMethods: string[];
  serviceFeePct: number;
  tipOptions: number[];
  splitModes: string[];
}

export interface EnabledFeatures {
  loyalty?: boolean;
  reservations?: boolean;
  driveThru?: boolean;
  multiLanguage?: boolean;
  analytics?: boolean;
  pushNotifications?: boolean;
  webhooks?: boolean;
}

export interface TeamConfig {
  tipDistributionPolicy?: string;
  roles?: Record<string, {
    maxCount?: number;
    permissions?: string[];
  }>;
}

@Entity('restaurant_configs')
@Index('idx_restaurant_configs_restaurant_id', ['restaurant_id'], { unique: true })
export class RestaurantConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  profile: ConfigProfile;

  @Column({ type: 'jsonb', nullable: true, default: '{"primary":"casual_dining","supported":["casual_dining"]}' })
  service_types: ServiceTypes;

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  experience_flags: ExperienceFlags;

  @Column({ type: 'jsonb', nullable: true, default: '{"sections":[],"tables":[]}' })
  floor_layout: FloorLayout;

  @Column({ type: 'jsonb', nullable: true, default: '{"stations":[],"routing":{"kitchen":[],"bar":[]}}' })
  kitchen_stations: KitchenConfig;

  @Column({ type: 'jsonb', nullable: true, default: '{"enabledMethods":["cash","credit_card","debit_card","pix"],"serviceFeePct":10,"tipOptions":[10,12,15],"splitModes":["equal","custom"]}' })
  payment_config: PaymentConfig;

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  enabled_features: EnabledFeatures;

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  team_config: TeamConfig;

  @Column({ type: 'boolean', default: false })
  setup_complete: boolean;

  @Column({ type: 'timestamp', nullable: true })
  setup_completed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
