/**
 * Centralized constants for magic numbers used throughout the backend.
 * Import and use these instead of inline numeric literals.
 */

// ─── Pagination ──────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  NOTIFICATIONS_DEFAULT: 50,
  NOTIFICATIONS_MAX: 100,
  NOTIFICATIONS_MAX_OFFSET: 10000,
  REVIEWS_DEFAULT: 20,
  RECENT_REVIEWS: 10,
  TOP_REVIEWS: 5,
  LEADERBOARD_DEFAULT: 10,
  LEADERBOARD_MAX: 100,
  AI_RECORDS_MAX: 100,
  AI_FETCH_LIMIT: 10,
  AI_RECOMMENDATION_LIMIT: 20,
  WAITER_CALLS_LIMIT: 10,
  GUEST_ORDERS_DEFAULT: 10,
  GUEST_ORDERS_MAX: 50,
  WAITER_STATS_BATCH: 100,
  PROMOTER_RECENT_PAYMENTS: 5,
} as const;

// ─── Export ──────────────────────────────────────────────────────────
export const EXPORT = {
  MAX_TRANSACTIONS: 1000,
  WEBHOOK_BATCH_SIZE: 100,
  MAX_RESPONSE_BODY_LENGTH: 5000,
} as const;

// ─── Geofencing ─────────────────────────────────────────────────────
export const GEOFENCING = {
  EARTH_RADIUS_METERS: 6371000,
  DEFAULT_SEARCH_RADIUS_KM: 5,
  DEFAULT_GEOFENCE_RADIUS_METERS: 500,
  KM_TO_METERS: 1000,
} as const;

// ─── Orders & Business Logic ────────────────────────────────────────
export const ORDERS = {
  GROUP_BOOKING_MIN_SIZE: 8,
  MAX_TAB_MEMBERS: 10,
  SERVICE_CHARGE_RATE: 0.10,
  QUEUE_CALL_TIMEOUT_MINUTES: 5,
  QUEUE_BASE_WAIT_MINUTES: 15,
  WAITLIST_WAIT_PER_GROUP_MINUTES: 5,
  BIRTHDAY_WINDOW_DAYS: 7,
  ORDER_URGENT_MINUTES: 20,
} as const;

// ─── Analytics ──────────────────────────────────────────────────────
export const ANALYTICS = {
  DEFAULT_DAYS_LOOKBACK: 30,
  REALTIME_HOURS_LOOKBACK: 1,
  MAX_RANGE_DAYS: 365,
  DAYS_IN_WEEK: 7,
} as const;
