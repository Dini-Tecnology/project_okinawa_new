/**
 * GradientHeader & GradientHeaderDark
 * Premium screen header with gradient background matching the NOOWE demo.
 * Supports back button, right action, restaurant name, and subtitle.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../contexts/ThemeContext';
import { gradients } from '../../theme/colors';
import { borderRadius, layout, spacing } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeaderAction {
  /** Icon React node (e.g. Ionicons component) */
  icon?: React.ReactNode;
  /** Text label shown next to or instead of icon */
  label?: string;
  /** Press handler */
  onPress?: () => void;
}

interface GradientHeaderProps {
  /** Main title */
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Left action (typically a back button) */
  leftAction?: HeaderAction;
  /** Right action (e.g. settings icon, label) */
  rightAction?: HeaderAction;
  /** Restaurant name displayed above the title in small caps */
  restaurantName?: string;
  /** Extra styles for the root container */
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Safe area top inset (simple heuristic; use SafeAreaView in production)
// ---------------------------------------------------------------------------

const STATUS_BAR_HEIGHT =
  Platform.OS === 'ios'
    ? layout.safeAreaTop
    : StatusBar.currentHeight ?? 24;

// ---------------------------------------------------------------------------
// GradientHeader (bright primary gradient)
// ---------------------------------------------------------------------------

export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  restaurantName,
  style,
}) => {
  const colors = useColors();

  return (
    <LinearGradient
      colors={gradients.primary as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: STATUS_BAR_HEIGHT + 8 }, style]}
    >
      {/* Top row: back / right action */}
      <View style={styles.topRow}>
        {leftAction ? (
          <Pressable
            onPress={leftAction.onPress}
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            {leftAction.icon ?? (
              <Text style={styles.actionLabel}>{leftAction.label ?? 'Back'}</Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}

        {rightAction ? (
          <Pressable
            onPress={rightAction.onPress}
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            {rightAction.icon ?? (
              <Text style={styles.actionLabel}>{rightAction.label}</Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}
      </View>

      {/* Title block */}
      <View style={styles.titleBlock}>
        {restaurantName ? (
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurantName}
          </Text>
        ) : null}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </LinearGradient>
  );
};

// ---------------------------------------------------------------------------
// GradientHeaderDark (dark foreground variant for loyalty-style screens)
// ---------------------------------------------------------------------------

export const GradientHeaderDark: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  restaurantName,
  style,
}) => {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: STATUS_BAR_HEIGHT + 8,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        {leftAction ? (
          <Pressable
            onPress={leftAction.onPress}
            style={({ pressed }) => [
              styles.actionButtonDark,
              {
                backgroundColor: colors.backgroundTertiary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {leftAction.icon ?? (
              <Text style={[styles.actionLabelDark, { color: colors.foreground }]}>
                {leftAction.label ?? 'Back'}
              </Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}

        {rightAction ? (
          <Pressable
            onPress={rightAction.onPress}
            style={({ pressed }) => [
              styles.actionButtonDark,
              {
                backgroundColor: colors.backgroundTertiary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {rightAction.icon ?? (
              <Text style={[styles.actionLabelDark, { color: colors.foreground }]}>
                {rightAction.label}
              </Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}
      </View>

      {/* Title block */}
      <View style={styles.titleBlock}>
        {restaurantName ? (
          <Text
            style={[styles.restaurantName, { color: colors.primary }]}
            numberOfLines={1}
          >
            {restaurantName}
          </Text>
        ) : null}

        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: colors.foregroundSecondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing[4], // 16px
    paddingHorizontal: spacing.screenHorizontal,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3], // 12px
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl, // 20 — rounded-xl frosted glass
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDark: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPlaceholder: {
    width: 40,
    height: 40,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionLabelDark: {
    fontSize: 14,
    fontWeight: '600',
  },
  titleBlock: {
    paddingTop: spacing[1], // 4px
  },
  restaurantName: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
});

export default GradientHeader;
