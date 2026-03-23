/**
 * Skeleton loading primitives
 * Exports: SkeletonBlock, SkeletonText, SkeletonCard, SkeletonAvatar
 *
 * Uses a looping pulse animation (opacity 0.3 → 0.7 → 0.3, 1200 ms)
 * and theme-aware background colours.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '../../contexts/ThemeContext';
import { useOkinawaTheme } from '../../contexts/ThemeContext';
import { borderRadius } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Pulse hook (shared animation driver)
// ---------------------------------------------------------------------------

const usePulse = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return opacity;
};

// ---------------------------------------------------------------------------
// SkeletonBlock
// ---------------------------------------------------------------------------

interface SkeletonBlockProps {
  /** Width of the block (number or string like '100%') */
  width: number | string;
  /** Height of the block */
  height: number | string;
  /** Border radius override */
  borderRadius?: number;
  /** Extra styles */
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width,
  height,
  borderRadius: radiusOverride,
  style,
}) => {
  const { isDark } = useOkinawaTheme();
  const colors = useColors();
  const opacity = usePulse();

  const bgColor = isDark ? colors.backgroundSecondary : colors.backgroundTertiary;

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radiusOverride ?? borderRadius.sm,
          backgroundColor: bgColor,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ---------------------------------------------------------------------------
// SkeletonText
// ---------------------------------------------------------------------------

interface SkeletonTextProps {
  /** Width as fraction of container (0-1) or absolute number */
  width?: number | string;
  /** Line height (defaults to 14) */
  height?: number;
  /** Extra styles */
  style?: StyleProp<ViewStyle>;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  width = '60%',
  height = 14,
  style,
}) => (
  <SkeletonBlock
    width={width}
    height={height}
    borderRadius={borderRadius.xs} // 4
    style={style}
  />
);

// ---------------------------------------------------------------------------
// SkeletonCard
// ---------------------------------------------------------------------------

interface SkeletonCardProps {
  /** Extra styles */
  style?: StyleProp<ViewStyle>;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  const { isDark } = useOkinawaTheme();
  const colors = useColors();
  const opacity = usePulse();

  const bgColor = isDark ? colors.backgroundSecondary : colors.backgroundTertiary;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ---------------------------------------------------------------------------
// SkeletonAvatar
// ---------------------------------------------------------------------------

interface SkeletonAvatarProps {
  /** Diameter (defaults to 44) */
  size?: number;
  /** Extra styles */
  style?: StyleProp<ViewStyle>;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 44,
  style,
}) => (
  <SkeletonBlock
    width={size}
    height={size}
    borderRadius={borderRadius.full} // circle
    style={style}
  />
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.card, // 20
  },
});

export default SkeletonBlock;
