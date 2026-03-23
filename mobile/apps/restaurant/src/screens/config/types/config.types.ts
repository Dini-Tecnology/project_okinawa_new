/**
 * Config Hub TypeScript Types
 *
 * Mirror of the backend RestaurantConfig entity structure.
 * Source: /backend/src/modules/service-config/entities/restaurant-config.entity.ts
 *
 * @module config/types
 */

// ============================================
// PROFILE
// ============================================

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

// ============================================
// SERVICE TYPES
// ============================================

export type ServiceTypeOption =
  | 'fine-dining'
  | 'quick-service'
  | 'fast-casual'
  | 'cafe-bakery'
  | 'buffet'
  | 'drive-thru'
  | 'food-truck'
  | 'chefs-table'
  | 'casual-dining'
  | 'pub-bar'
  | 'club';

export interface ServiceTypeConfig {
  primary: string;
  supported: string[];
}

// ============================================
// EXPERIENCE FLAGS
// ============================================

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

// ============================================
// FLOOR LAYOUT
// ============================================

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

// ============================================
// KITCHEN
// ============================================

export interface KitchenStation {
  id: string;
  name: string;
  keywords: string[];
  displayName: string;
}

export interface KitchenStationsConfig {
  stations: KitchenStation[];
  routing: {
    kitchen: string[];
    bar: string[];
  };
}

// ============================================
// PAYMENTS
// ============================================

export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'pix'
  | 'apple_pay'
  | 'google_pay'
  | 'voucher';

export type SplitMode = 'equal' | 'custom' | 'by_item' | 'by_person';

export interface PaymentConfig {
  enabledMethods: string[];
  serviceFeePct: number;
  tipOptions: number[];
  splitModes: string[];
}

// ============================================
// FEATURES
// ============================================

export interface EnabledFeatures {
  loyalty?: boolean;
  reservations?: boolean;
  driveThru?: boolean;
  multiLanguage?: boolean;
  analytics?: boolean;
  pushNotifications?: boolean;
  webhooks?: boolean;
}

// ============================================
// TEAM
// ============================================

export type TipDistributionPolicy = 'equal' | 'by_role' | 'by_hours';

export interface TeamConfig {
  tipDistributionPolicy?: string;
  roles?: Record<
    string,
    {
      maxCount?: number;
      permissions?: string[];
    }
  >;
}

// ============================================
// FULL RESTAURANT CONFIG
// ============================================

export interface RestaurantConfig {
  id: string;
  restaurant_id: string;
  profile: ConfigProfile;
  service_types: ServiceTypeConfig;
  experience_flags: ExperienceFlags;
  floor_layout: FloorLayout;
  kitchen_stations: KitchenStationsConfig;
  payment_config: PaymentConfig;
  enabled_features: EnabledFeatures;
  team_config: TeamConfig;
  setup_complete: boolean;
  setup_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// COMPLETION STATUS
// ============================================

export interface SetupCompletion {
  percentage: number;
  sections: Record<
    string,
    {
      complete: boolean;
      percentage: number;
    }
  >;
}

// ============================================
// CONFIG DOMAIN KEYS (for partial updates)
// ============================================

export type ConfigDomain =
  | 'profile'
  | 'service-types'
  | 'experience'
  | 'floor'
  | 'kitchen'
  | 'payments'
  | 'features'
  | 'team';

// ============================================
// USER ROLE (for RBAC)
// ============================================

export type UserRole = 'OWNER' | 'MANAGER';

// ============================================
// CONFIG HUB SECTION CARD
// ============================================

export interface ConfigSectionCard {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  screen: string;
  accessRoles: UserRole[];
  domain: ConfigDomain | null;
}
