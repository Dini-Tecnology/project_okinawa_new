/**
 * IconContainer - Rounded icon wrapper with theme-aware backgrounds
 * Used across feature cards, list items, stat cards, and menu items.
 *
 * Supports soft (bg-color/10), solid, and outline variants
 * at four size presets (sm, md, lg, xl).
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '../../contexts/ThemeContext';
import { borderRadius } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IconColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
type IconSize = 'sm' | 'md' | 'lg' | 'xl';
type IconVariant = 'soft' | 'solid' | 'outline';

interface IconContainerProps {
  /** Icon React node (e.g. <Ionicons .../>) */
  icon: React.ReactNode;
  /** Semantic color key */
  color?: IconColor;
  /** Size preset */
  size?: IconSize;
  /** Visual variant */
  variant?: IconVariant;
  /** Extra styles for the container */
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Size map
// ---------------------------------------------------------------------------

const SIZE_MAP: Record<IconSize, number> = {
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56,
};

const RADIUS_MAP: Record<IconSize, number> = {
  sm: borderRadius.sm,      // 8
  md: borderRadius.xl,      // 20
  lg: borderRadius.xl,      // 20
  xl: borderRadius['2xl'],  // 24
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const IconContainer: React.FC<IconContainerProps> = ({
  icon,
  color = 'primary',
  size = 'md',
  variant = 'soft',
  style,
}) => {
  const colors = useColors();

  // ---- Resolve semantic colors ----
  const colorMap: Record<IconColor, { solid: string; text: string; bg: string }> = {
    primary: {
      solid: colors.primary,
      text: colors.primary,
      bg: `${colors.primary}1A`, // ~10% opacity
    },
    secondary: {
      solid: colors.secondary,
      text: colors.secondary,
      bg: `${colors.secondary}1A`,
    },
    accent: {
      solid: colors.accent,
      text: colors.accent,
      bg: `${colors.accent}1A`,
    },
    success: {
      solid: colors.success,
      text: colors.success,
      bg: colors.successBackground,
    },
    warning: {
      solid: colors.warning,
      text: colors.warning,
      bg: colors.warningBackground,
    },
    error: {
      solid: colors.error,
      text: colors.error,
      bg: colors.errorBackground,
    },
    info: {
      solid: colors.info,
      text: colors.info,
      bg: colors.infoBackground,
    },
  };

  const palette = colorMap[color];
  const dimension = SIZE_MAP[size];
  const radius = RADIUS_MAP[size];

  // ---- Variant styles ----
  const variantStyle: ViewStyle =
    variant === 'solid'
      ? { backgroundColor: palette.solid }
      : variant === 'outline'
        ? {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: palette.solid,
          }
        : { backgroundColor: palette.bg }; // soft (default)

  return (
    <View
      style={[
        styles.base,
        {
          width: dimension,
          height: dimension,
          borderRadius: radius,
        },
        variantStyle,
        style,
      ]}
    >
      {icon}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default IconContainer;
