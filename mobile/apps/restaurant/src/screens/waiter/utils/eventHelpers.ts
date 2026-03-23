/**
 * Event Helpers — Waiter Live Feed Utilities
 *
 * Helper functions for rendering, sorting, and formatting live feed events
 * in the Waiter Command Center. Provides icon mapping, color determination,
 * priority sorting, and time formatting for 6 situational event types.
 *
 * @module waiter/utils/eventHelpers
 */

import type { LiveEventType, UrgencyLevel } from '../types/waiter.types';
import type { ThemeColors } from '@okinawa/shared/theme/colors';

// ============================================
// TYPES
// ============================================

/**
 * Extended event types including all 6 situational feed event types
 * from the EPIC 07 spec. These extend the base LiveEventType.
 */
export type SituationalEventType =
  | 'kitchen_ready'
  | 'bar_ready'
  | 'payment_needed'
  | 'customer_call'
  | 'courtesy_request'
  | 'table_transfer';

export type SituationalUrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export interface SituationalEvent {
  id: string;
  type: SituationalEventType;
  urgency: SituationalUrgencyLevel;
  tableNumber: number;
  detail: string;
  relatedOrderId?: string;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface SituationalFeedResponse {
  events: SituationalEvent[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    resolved: number;
  };
}

// ============================================
// ICON MAPPING
// ============================================

/**
 * Icon configuration per event type.
 * Uses MaterialCommunityIcons names compatible with react-native-vector-icons.
 */
const EVENT_ICON_MAP: Record<SituationalEventType, string> = {
  kitchen_ready: 'silverware-fork-knife',
  bar_ready: 'glass-cocktail',
  payment_needed: 'credit-card-outline',
  customer_call: 'bell-ring-outline',
  courtesy_request: 'star-outline',
  table_transfer: 'swap-horizontal',
};

/**
 * Returns the MaterialCommunityIcons icon name for a given event type.
 *
 * @param type - The situational event type
 * @returns Icon name string for use with MaterialCommunityIcons
 */
export function getEventIcon(type: SituationalEventType | LiveEventType): string {
  return EVENT_ICON_MAP[type as SituationalEventType] || 'alert-circle-outline';
}

// ============================================
// COLOR MAPPING
// ============================================

/**
 * Returns the appropriate color for an event based on its type and urgency level.
 * Uses semantic theme color tokens for consistent theming.
 *
 * @param type - The situational event type
 * @param urgency - The urgency level (critical, high, medium, low)
 * @param colors - Theme colors object from useColors()
 * @returns Color string from the theme
 */
export function getEventColor(
  type: SituationalEventType | LiveEventType,
  urgency: SituationalUrgencyLevel | UrgencyLevel,
  colors: ThemeColors,
): string {
  // Urgency-based color takes priority
  switch (urgency) {
    case 'critical':
      return colors.error;
    case 'high':
      return colors.warning;
    case 'medium':
      return colors.info;
    case 'low':
      return colors.foregroundMuted;
    case 'info':
      return colors.info;
    default:
      return colors.foregroundSecondary;
  }
}

/**
 * Returns the background color for an event card based on urgency.
 *
 * @param urgency - The urgency level
 * @param colors - Theme colors object from useColors()
 * @returns Background color string
 */
export function getEventBackgroundColor(
  urgency: SituationalUrgencyLevel,
  colors: ThemeColors,
): string {
  switch (urgency) {
    case 'critical':
      return colors.errorBackground;
    case 'high':
      return colors.warningBackground;
    case 'medium':
      return colors.infoBackground;
    case 'low':
      return colors.card;
    default:
      return colors.card;
  }
}

/**
 * Returns the border color for an event card based on urgency.
 *
 * @param urgency - The urgency level
 * @param colors - Theme colors object from useColors()
 * @returns Border color string
 */
export function getEventBorderColor(
  urgency: SituationalUrgencyLevel,
  colors: ThemeColors,
): string {
  switch (urgency) {
    case 'critical':
      return colors.error;
    case 'high':
      return colors.warning;
    case 'medium':
      return colors.info;
    case 'low':
      return colors.border;
    default:
      return colors.border;
  }
}

// ============================================
// PRIORITY SORTING
// ============================================

/**
 * Priority ranking for sorting events. Lower number = higher priority.
 * Used to sort the live feed so the most urgent events appear first.
 */
const EVENT_PRIORITY_MAP: Record<SituationalEventType, number> = {
  kitchen_ready: 1,
  bar_ready: 1,
  payment_needed: 2,
  customer_call: 2,
  courtesy_request: 3,
  table_transfer: 4,
};

/**
 * Urgency ranking for secondary sort. Higher number = more urgent.
 */
const URGENCY_RANK: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};

/**
 * Returns the sorting priority for an event type.
 * 1 = highest priority (kitchen_ready, bar_ready), 4 = lowest (table_transfer).
 *
 * @param type - The situational event type
 * @returns Priority number (1 = highest)
 */
export function getEventPriority(type: SituationalEventType | LiveEventType): number {
  return EVENT_PRIORITY_MAP[type as SituationalEventType] ?? 5;
}

/**
 * Sorts events by urgency (descending) then by creation time (oldest first
 * within the same urgency level).
 *
 * @param events - Array of situational events to sort
 * @returns New sorted array (does not mutate original)
 */
export function sortEventsByPriority(events: SituationalEvent[]): SituationalEvent[] {
  return [...events].sort((a, b) => {
    // Primary sort: urgency rank descending (critical first)
    const urgencyDiff = (URGENCY_RANK[b.urgency] ?? 0) - (URGENCY_RANK[a.urgency] ?? 0);
    if (urgencyDiff !== 0) return urgencyDiff;

    // Secondary sort: event type priority ascending (lower number first)
    const typeDiff = getEventPriority(a.type) - getEventPriority(b.type);
    if (typeDiff !== 0) return typeDiff;

    // Tertiary sort: oldest first within the same level
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

// ============================================
// TIME FORMATTING
// ============================================

/**
 * Formats a timestamp into a human-readable relative time string.
 *
 * Returns:
 * - "agora" for < 1 minute
 * - "Xmin" for < 60 minutes
 * - "Xh" for >= 60 minutes
 *
 * @param timestamp - Unix timestamp in milliseconds, or ISO date string
 * @returns Formatted time string
 */
export function formatEventTime(timestamp: number | string): string {
  const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return 'agora';
  }

  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

// ============================================
// URGENCY BADGE HELPERS
// ============================================

/**
 * Returns the i18n key for the urgency badge text.
 *
 * @param urgency - The urgency level
 * @returns i18n key path for the badge label
 */
export function getUrgencyBadgeKey(urgency: SituationalUrgencyLevel): string | null {
  switch (urgency) {
    case 'critical':
      return 'events.badge.immediate';
    case 'high':
      return 'events.badge.urgent';
    default:
      return null;
  }
}

/**
 * Returns the default urgency for a given event type.
 *
 * @param type - The situational event type
 * @returns Default urgency level
 */
export function getDefaultUrgency(type: SituationalEventType): SituationalUrgencyLevel {
  switch (type) {
    case 'kitchen_ready':
    case 'bar_ready':
      return 'critical';
    case 'payment_needed':
    case 'customer_call':
      return 'high';
    case 'courtesy_request':
      return 'medium';
    case 'table_transfer':
      return 'low';
    default:
      return 'low';
  }
}

// ============================================
// I18N EVENT KEY MAPPING
// ============================================

/**
 * Returns the i18n key for the event type display label.
 *
 * @param type - The situational event type
 * @returns i18n key path for the event label
 */
export function getEventLabelKey(type: SituationalEventType): string {
  const EVENT_LABEL_KEYS: Record<SituationalEventType, string> = {
    kitchen_ready: 'events.kitchen_ready',
    bar_ready: 'events.bar_ready',
    payment_needed: 'events.payment_needed',
    customer_call: 'events.customer_call',
    courtesy_request: 'events.courtesy_request',
    table_transfer: 'events.table_transfer',
  };

  return EVENT_LABEL_KEYS[type] || type;
}
