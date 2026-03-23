import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { RestaurantServiceConfig } from './restaurant-service-config.entity';
import { UserRole } from '../../user-roles/entities/user-role.entity';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Profile } from '../../users/entities/profile.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id' })
  @Index('idx_restaurants_owner_id')
  owner_id: string;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'owner_id' })
  owner: Profile;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip_code: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  banner_url: string;

  @Column({ type: 'jsonb', nullable: true })
  location: Record<string, any>;

  @Column()
  service_type: string;

  @Column({ type: 'jsonb', nullable: true })
  cuisine_types: string[];

  @Column({ type: 'jsonb', nullable: true })
  opening_hours: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  average_ticket: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, name: 'rating' })
  rating: number;

  @Column({ type: 'int', default: 0 })
  total_reviews: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  service_config: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  setup_progress: string[];

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng: number;

  @Column({ type: 'int', nullable: true, default: 500 })
  geofence_radius: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => RestaurantServiceConfig, (config) => config.restaurant)
  service_configs: RestaurantServiceConfig[];

  @OneToMany(() => UserRole, (userRole) => userRole.restaurant)
  user_roles: UserRole[];

  @OneToMany(() => MenuItem, (menuItem) => menuItem.restaurant)
  menu_items: MenuItem[];

  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];

  @OneToMany(() => Reservation, (reservation) => reservation.restaurant)
  reservations: Reservation[];
}
