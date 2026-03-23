/**
 * Service Type Registry
 *
 * Central registry that defines which features are enabled per service type.
 * Used by the service-config module to derive features from a restaurant's
 * configured primary service type.
 *
 * Each service type has a unique combination of feature flags, constraints,
 * and defaults. The registry is the single source of truth for determining
 * what a restaurant can do based on its type.
 */

export interface ServiceTypeFeatures {
  hasReservations: boolean;
  hasWaitlist: boolean;
  hasTableOrdering: boolean;
  hasQrMenu: boolean;
  hasKitchenDisplay: boolean;
  hasBarDisplay: boolean;
  hasAntifraudQr: boolean;
  hasDriveThru: boolean;
  hasFoodTruck: boolean;
  hasChefTable: boolean;
  hasHappyHour: boolean;
  hasTasting: boolean;
  maxCoversPerTable: number;
  defaultServiceFee: number;
  defaultTipOptions: number[];
  allowsCarryout: boolean;
  allowsDelivery: boolean;
}

export const SERVICE_TYPE_REGISTRY: Record<string, ServiceTypeFeatures> = {
  'fine-dining': {
    hasReservations: true,
    hasWaitlist: false,
    hasTableOrdering: true,
    hasQrMenu: false,
    hasKitchenDisplay: true,
    hasBarDisplay: true,
    hasAntifraudQr: false,
    hasDriveThru: false,
    hasFoodTruck: false,
    hasChefTable: false,
    hasHappyHour: false,
    hasTasting: true,
    maxCoversPerTable: 8,
    defaultServiceFee: 15,
    defaultTipOptions: [10, 12, 15, 20],
    allowsCarryout: false,
    allowsDelivery: false,
  },
  'quick-service': {
    hasReservations: false,
    hasWaitlist: true,
    hasTableOrdering: false,
    hasQrMenu: true,
    hasKitchenDisplay: true,
    hasBarDisplay: false,
    hasAntifraudQr: false,
    hasDriveThru: false,
    hasFoodTruck: false,
    hasChefTable: false,
    hasHappyHour: false,
    hasTasting: false,
    maxCoversPerTable: 4,
    defaultServiceFee: 0,
    defaultTipOptions: [0, 5, 10],
    allowsCarryout: true,
    allowsDelivery: true,
  },
  'fast-casual': {
    hasReservations: false,
    hasWaitlist: true,
    hasTableOrdering: true,
    hasQrMenu: true,
    hasKitchenDisplay: true,
    hasBarDisplay: false,
    hasAntifraudQr: false,
    hasDriveThru: false,
    hasFoodTruck: false,
    hasChefTable: false,
    hasHappyHour: false,
    hasTasting: false,
    maxCoversPerTable: 6,
    defaultServiceFee: 0,
    defaultTipOptions: [0, 5, 10],
    allowsCarryout: true,
    allowsDelivery: true,
  },
  'cafe-bakery': {
    hasReservations: false,
    hasWaitlist: false,
    hasTableOrdering: true,
    hasQrMenu: true,
    hasKitchenDisplay: true,
    hasBarDisplay: true,
    hasAntifraudQr: false,
    hasDriveThru: false,
    hasFoodTruck: false,
    hasChefTable: false,
    hasHappyHour: true,
    hasTasting: false,
    maxCoversPerTable: 4,
    defaultServiceFee: 0,
    defaultTipOptions: [0, 5, 10],
    allowsCarryout: true,
    allowsDelivery: true,
  },
  'buffet': {
    hasReservations: true,
    hasWaitlist: true,
    hasTableOrdering: false,
    hasQrMenu: true,
    hasKitchenDisplay: false,
    hasBarDisplay: true,
    hasAntifraudQr: false,
    hasDriveThru: false,
    hasFoodTruck: false,
    hasChefTable: false,
    hasHappyHour: false,
    hasTasting: false,
    maxCoversPerTable: 12,
    defaultServiceFee: 10,
    defaultTipOptions: [10, 12, 15],
    allowsCarryout: false,
    allowsDelivery: false,
  },
  'drive-thru': {
    hasReservations: false,
    hasWaitlist: false,
    hasTableOrdering: false,
    hasQrMenu: true,
    hasKitchenDisplay: true,
    hasBarDisplay: false,
    hasAntifraudQr: false,
    hasDriveThru: true,
    hasFoodTruck: false,
    hasChefTable: false,
    hasHappyHour: false,
    hasTasting: false,
    maxCoversPerTable: 1,
    defaultServiceFee: 0,
    defaultTipOptions: [0],
    allowsCarryout: true,
    allowsDelivery: false,
  },
  'food-truck': {
    hasReservations: false,
    hasWaitlist: true,
    hasTableOrdering: false,
    hasQrMenu: true,
    hasKitchenDisplay: false,
    hasBarDisplay: false,
    hasAntifraudQr: false,
    hasDriveThru: false,
    hasFoodTruck: true,
    hasChefTable: false,
    hasHappyHour: false,
    hasTasting: false,
    maxCoversPerTable: 2,
    defaultServiceFee: 0,
    defaultTipOptions: [0, 5, 10],
    allowsCarryout: true,
    allowsDelivery: false,
  },
  'chefs-table': {
    hasReservations: true,
    hasWaitlist: false,
    hasTableOrdering: true,
    hasQrMenu: false,
    hasKitchenDisplay: true,
    hasBarDisplay: true,
    hasAntifraudQr: false,
    hasDriveThru: false,
    hasFoodTruck: false,
    hasChefTable: true,
    hasHappyHour: false,
    hasTasting: true,
    maxCoversPerTable: 12,
    defaultServiceFee: 20,
    defaultTipOptions: [15, 20, 25],
    allowsCarryout: false,
    allowsDelivery: false,
  },
  'pub-bar': {
    hasReservations: false,
    hasWaitlist: false,
    hasTableOrdering: true,
    hasQrMenu: true,
    hasKitchenDisplay: false,
    hasBarDisplay: true,
    hasAntifraudQr: false,
    hasDriveThru: false,
    hasFoodTruck: false,
    hasChefTable: false,
    hasHappyHour: true,
    hasTasting: false,
    maxCoversPerTable: 6,
    defaultServiceFee: 0,
    defaultTipOptions: [0, 10, 15],
    allowsCarryout: false,
    allowsDelivery: false,
  },
  'casual-dining': {
    hasReservations: true,
    hasWaitlist: true,
    hasTableOrdering: true,
    hasQrMenu: true,
    hasKitchenDisplay: true,
    hasBarDisplay: true,
    hasAntifraudQr: false,
    hasDriveThru: false,
    hasFoodTruck: false,
    hasChefTable: false,
    hasHappyHour: true,
    hasTasting: false,
    maxCoversPerTable: 8,
    defaultServiceFee: 10,
    defaultTipOptions: [10, 12, 15],
    allowsCarryout: true,
    allowsDelivery: true,
  },
  'club': {
    hasReservations: true,
    hasWaitlist: true,
    hasTableOrdering: true,
    hasQrMenu: false,
    hasKitchenDisplay: false,
    hasBarDisplay: true,
    hasAntifraudQr: true,
    hasDriveThru: false,
    hasFoodTruck: false,
    hasChefTable: false,
    hasHappyHour: true,
    hasTasting: false,
    maxCoversPerTable: 20,
    defaultServiceFee: 0,
    defaultTipOptions: [10, 15, 20],
    allowsCarryout: false,
    allowsDelivery: false,
  },
};

/**
 * Get features for a service type.
 * Falls back to casual-dining if the service type is not found.
 */
export function getServiceTypeFeatures(serviceType: string): ServiceTypeFeatures {
  return SERVICE_TYPE_REGISTRY[serviceType] ?? SERVICE_TYPE_REGISTRY['casual-dining'];
}

/**
 * Get all registered service type keys.
 */
export function getRegisteredServiceTypes(): string[] {
  return Object.keys(SERVICE_TYPE_REGISTRY);
}
