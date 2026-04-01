/**
 * ScreenContainer — Universal wrapper for all screens.
 *
 * Provides:
 * - Safe area insets (top/bottom) for notch/Dynamic Island/home indicator
 * - KeyboardAvoidingView when `hasKeyboard` is true
 * - Consistent background color from theme
 * - Optional edge configuration (e.g., tabs screens don't need bottom inset)
 *
 * Usage:
 *   <ScreenContainer>
 *     <YourContent />
 *   </ScreenContainer>
 *
 *   <ScreenContainer hasKeyboard>
 *     <TextInput ... />
 *   </ScreenContainer>
 *
 *   <ScreenContainer edges={['top']}>
 *     {/* Tab screen — bottom handled by tab bar *\/}
 *   </ScreenContainer>
 */
import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { useColors } from '../contexts/ThemeContext';

export interface ScreenContainerProps {
  children: React.ReactNode;
  /** Enable KeyboardAvoidingView for screens with text inputs */
  hasKeyboard?: boolean;
  /** Which edges to apply safe area insets to. Default: ['top', 'bottom'] */
  edges?: Edge[];
  /** Override background color (defaults to theme background) */
  backgroundColor?: string;
  /** Additional styles for the container */
  style?: ViewStyle;
  /** If true, don't apply any padding (for full-bleed screens like maps) */
  noPadding?: boolean;
}

export function ScreenContainer({
  children,
  hasKeyboard = false,
  edges = ['top', 'bottom'],
  backgroundColor,
  style,
  noPadding = false,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const bgColor = backgroundColor || colors.background;

  const safeAreaStyle: ViewStyle = noPadding
    ? {}
    : {
        paddingTop: edges.includes('top') ? insets.top : 0,
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: edges.includes('left') ? insets.left : 0,
        paddingRight: edges.includes('right') ? insets.right : 0,
      };

  const content = (
    <View style={[styles.container, { backgroundColor: bgColor }, safeAreaStyle, style]}>
      <StatusBar
        barStyle={bgColor === colors.background ? 'dark-content' : 'light-content'}
        backgroundColor={bgColor}
      />
      {children}
    </View>
  );

  if (hasKeyboard) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: bgColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.container, safeAreaStyle, style]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenContainer;
