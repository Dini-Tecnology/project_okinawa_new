/**
 * StatusBadge - Premium status chip / pill
 * Matches the demo pattern: px-2.5 py-1 rounded-full text-xs font-semibold
 * bg-color/10 text-color.
 *
 * Provides built-in status-to-color mappings for orders, tables,
 * approvals, and service calls, plus a fully customisable mode.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '../../contexts/ThemeContext';
import { borderRadius } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BadgeColorKey = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
type BadgeSize = 'sm' | 'md';
type BadgeType = 'order' | 'table' | 'approval' | 'call' | 'custom';

interface StatusBadgeProps {
  /** Raw status string used for built-in mapping */
  status: string;
  /** Domain type for auto-mapping (or 'custom' to use `color` directly) */
  type?: BadgeType;
  /** Override the auto-mapped color */
  color?: BadgeColorKey;
  /** Override the displayed label (defaults to status with first-letter capitalised) */
  label?: string;
  /** Size variant */
  size?: BadgeSize;
  /** Extra styles */
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Built-in status → color maps
// ---------------------------------------------------------------------------

const ORDER_MAP: Record<string, BadgeColorKey> = {
  pending: 'warning',
  preparing: 'primary',
  ready: 'success',
  delivered: 'info',
  cancelled: 'error',
  completed: 'success',
};

const TABLE_MAP: Record<string, BadgeColorKey> = {
  available: 'success',
  occupied: 'error',
  reserved: 'info',
  cleaning: 'warning',
};

const APPROVAL_MAP: Record<string, BadgeColorKey> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const CALL_MAP: Record<string, BadgeColorKey> = {
  pending: 'warning',
  acknowledged: 'info',
  resolved: 'success',
};

const TYPE_MAP: Record<Exclude<BadgeType, 'custom'>, Record<string, BadgeColorKey>> = {
  order: ORDER_MAP,
  table: TABLE_MAP,
  approval: APPROVAL_MAP,
  call: CALL_MAP,
};

// ---------------------------------------------------------------------------
// Size config
// ---------------------------------------------------------------------------

const SIZE_CONFIG: Record<BadgeSize, { paddingH: number; paddingV: number; fontSize: number }> = {
  sm: { paddingH: 8, paddingV: 3, fontSize: 10 },
  md: { paddingH: 10, paddingV: 4, fontSize: 12 },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'custom',
  color: colorOverride,
  label,
  size = 'md',
  style,
}) => {
  const colors = useColors();

  // ---- Resolve color key ----
  const resolvedKey: BadgeColorKey = (() => {
    if (colorOverride) return colorOverride;
    if (type !== 'custom') {
      const map = TYPE_MAP[type];
      const mapped = map[status.toLowerCase()];
      if (mapped) return mapped;
    }
    return 'primary'; // fallback
  })();

  // ---- Map to theme tokens ----
  const colorPairs: Record<BadgeColorKey, { bg: string; fg: string }> = {
    success: { bg: colors.successBackground, fg: colors.success },
    warning: { bg: colors.warningBackground, fg: colors.warning },
    error: { bg: colors.errorBackground, fg: colors.error },
    info: { bg: colors.infoBackground, fg: colors.info },
    primary: { bg: `${colors.primary}1A`, fg: colors.primary },
    secondary: { bg: `${colors.secondary}1A`, fg: colors.secondary },
  };

  const pair = colorPairs[resolvedKey];
  const sizeConf = SIZE_CONFIG[size];

  // ---- Display label ----
  const displayLabel =
    label ??
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: pair.bg,
          paddingHorizontal: sizeConf.paddingH,
          paddingVertical: sizeConf.paddingV,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: pair.fg,
            fontSize: sizeConf.fontSize,
          },
        ]}
        numberOfLines={1}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  pill: {
    borderRadius: borderRadius.full, // pill shape
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});

export default StatusBadge;
