/**
 * GradientButton - Premium gradient CTA button
 * Matches the NOOWE demo aesthetic with orange→gold gradient,
 * colored shadow, animated press feedback, and multiple variants.
 */

import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../contexts/ThemeContext';
import { gradients } from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';
import { componentShadows } from '../../theme/shadows';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface GradientButtonProps {
  /** Button label (string) or custom React node */
  children: React.ReactNode;
  /** Press handler */
  onPress?: () => void;
  /** Show a spinner and reduce opacity */
  loading?: boolean;
  /** Disable interactions */
  disabled?: boolean;
  /** Visual size preset */
  size?: ButtonSize;
  /** Color / style variant */
  variant?: ButtonVariant;
  /** When true the button shrinks to content width instead of stretching */
  compact?: boolean;
  /** Extra styles applied to the outer wrapper */
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Size map
// ---------------------------------------------------------------------------

const SIZE_CONFIG: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 40, paddingHorizontal: 16, fontSize: 13 },
  md: { height: 52, paddingHorizontal: 24, fontSize: 15 },
  lg: { height: 56, paddingHorizontal: 28, fontSize: 16 },
};

// ---------------------------------------------------------------------------
// Danger gradient palette (red variants)
// ---------------------------------------------------------------------------

const DANGER_GRADIENT: [string, string] = ['#DC2626', '#EF4444'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onPress,
  loading = false,
  disabled = false,
  size = 'md',
  variant = 'primary',
  compact = false,
  style,
}) => {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ---- Press animation ----
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  // ---- Variant-specific styles ----
  const isGradient = variant === 'primary' || variant === 'danger';
  const gradientColors: [string, string] =
    variant === 'danger'
      ? DANGER_GRADIENT
      : (gradients.primary as [string, string]);

  const sizeConfig = SIZE_CONFIG[size];
  const radius = size === 'lg' ? borderRadius.buttonLarge : borderRadius.button;

  // ---- Shadow (primary gets a colored glow) ----
  const shadowStyle: ViewStyle =
    variant === 'primary' && !disabled
      ? componentShadows.buttonPrimaryGlow
      : variant === 'danger' && !disabled
        ? { shadowColor: '#DC2626', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 6 }
        : componentShadows.button;

  // ---- Text color ----
  const textColor: string =
    variant === 'secondary' ? colors.foreground : colors.primaryForeground;

  // ---- Render ----
  const content = (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={styles.spinner}
        />
      )}
      {typeof children === 'string' ? (
        <Animated.Text
          style={[
            styles.label,
            {
              fontSize: sizeConfig.fontSize,
              color: textColor,
              opacity: loading ? 0 : 1,
            },
          ]}
        >
          {children}
        </Animated.Text>
      ) : (
        children
      )}
    </>
  );

  const containerStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    borderRadius: radius,
    alignSelf: compact ? 'flex-start' : 'stretch',
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        !disabled && shadowStyle,
        compact ? styles.compactWrapper : styles.fullWrapper,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.pressable,
          containerStyle,
          { opacity: disabled ? 0.45 : loading ? 0.8 : pressed ? 0.9 : 1 },
        ]}
      >
        {isGradient ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          />
        ) : (
          // Secondary: solid muted background
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: radius,
                backgroundColor: colors.backgroundTertiary,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          />
        )}
        {content}
      </Pressable>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  fullWrapper: {
    width: '100%',
  },
  compactWrapper: {
    alignSelf: 'flex-start',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  spinner: {
    position: 'absolute',
  },
});

export default GradientButton;
