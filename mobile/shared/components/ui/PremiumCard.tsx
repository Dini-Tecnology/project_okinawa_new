/**
 * PremiumCard - Themed card wrapper with premium styling
 * Supports default, highlighted, success, warning, and info variants.
 * Automatically renders as Pressable with scale feedback when onPress is provided.
 */

import React, { useCallback, useRef } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useColors } from '../../contexts/ThemeContext';
import { borderRadius } from '../../theme/spacing';
import { componentShadows } from '../../theme/shadows';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CardVariant = 'default' | 'highlighted' | 'success' | 'warning' | 'info';

interface PremiumCardProps {
  children: React.ReactNode;
  /** Visual variant */
  variant?: CardVariant;
  /** Makes the card tappable with animated scale feedback */
  onPress?: () => void;
  /** Extra styles merged with the card container */
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
}) => {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ---- Variant backgrounds & borders ----
  const variantStyle: ViewStyle = (() => {
    switch (variant) {
      case 'highlighted':
        return {
          backgroundColor: `${colors.primary}1A`, // ~10%
          borderColor: `${colors.primary}4D`,      // ~30%
        };
      case 'success':
        return {
          backgroundColor: colors.successBackground,
          borderColor: `${colors.success}4D`,
        };
      case 'warning':
        return {
          backgroundColor: colors.warningBackground,
          borderColor: `${colors.warning}4D`,
        };
      case 'info':
        return {
          backgroundColor: colors.infoBackground,
          borderColor: `${colors.info}4D`,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        };
    }
  })();

  // ---- Press animation ----
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  // ---- Shared styles ----
  const cardStyle: ViewStyle[] = [
    styles.card,
    variantStyle,
    componentShadows.card,
  ];

  // ---- Interactive vs static ----
  if (onPress) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={cardStyle}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.card, // 20
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
});

export default PremiumCard;
