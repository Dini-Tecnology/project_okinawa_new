/**
 * Okinawa Restaurant App Theme
 * Uses the shared design system to stay aligned with web and client apps.
 */

// Re-export shared tokens/types for compatibility
export * from '@okinawa/shared/theme';
export { useOkinawaTheme, useTheme, useColors, ThemeProvider } from '@okinawa/shared/contexts/ThemeContext';

import { lightTheme, darkTheme as sharedDarkTheme, colorPalette } from '@okinawa/shared/theme/colors';
import { MD3LightTheme as DefaultTheme, MD3DarkTheme } from 'react-native-paper';

/**
 * Legacy color mapping for backward compatibility
 * @deprecated Prefer useColors() from ThemeContext
 */
export const colors = {
  // Brand
  primary: colorPalette.primary[500],
  primaryLight: colorPalette.primary[400],
  primaryDark: colorPalette.primary[600],
  secondary: colorPalette.secondary[500],
  secondaryLight: colorPalette.secondary[400],
  secondaryDark: colorPalette.secondary[600],
  accent: colorPalette.accent[500],

  // Status
  success: colorPalette.success.main,
  successLight: colorPalette.success.light,
  warning: colorPalette.warning.main,
  warningLight: colorPalette.warning.light,
  error: colorPalette.error.main,
  errorLight: colorPalette.error.light,
  info: colorPalette.info.main,
  infoLight: colorPalette.info.light,

  // Neutral
  white: colorPalette.neutral[0],
  black: colorPalette.neutral[950],
  gray50: colorPalette.neutral[50],
  gray100: colorPalette.neutral[100],
  gray200: colorPalette.neutral[200],
  gray300: colorPalette.neutral[300],
  gray400: colorPalette.neutral[400],
  gray500: colorPalette.neutral[500],
  gray600: colorPalette.neutral[600],
  gray700: colorPalette.neutral[700],
  gray800: colorPalette.neutral[800],
  gray900: colorPalette.neutral[900],

  // Semantic aliases
  text: lightTheme.foreground,
  textSecondary: lightTheme.foregroundSecondary,
  textMuted: lightTheme.foregroundMuted,
  border: lightTheme.border,
  divider: lightTheme.borderLight,
  backdrop: lightTheme.overlay,
  cardBackground: lightTheme.card,
  inputBackground: lightTheme.input,

  // Restaurant-specific aliases (kept for compatibility)
  kdsUrgent: lightTheme.kdsUrgent,
  kdsHigh: lightTheme.kdsHigh,
  kdsNormal: lightTheme.kdsNormal,
  kdsNew: lightTheme.kdsNew,
  tableAvailable: lightTheme.tableAvailable,
  tableOccupied: lightTheme.tableOccupied,
  tableReserved: lightTheme.tableReserved,
  tableCleaning: lightTheme.tableCleaning,
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTheme.primary,
    secondary: lightTheme.secondary,
    tertiary: lightTheme.accent,
    background: lightTheme.background,
    surface: lightTheme.backgroundSecondary,
    surfaceVariant: lightTheme.backgroundTertiary,
    error: lightTheme.error,
    onPrimary: lightTheme.primaryForeground,
    onSecondary: lightTheme.secondaryForeground,
    onBackground: lightTheme.foreground,
    onSurface: lightTheme.foreground,
    onSurfaceVariant: lightTheme.foregroundSecondary,
    outline: lightTheme.border,
    elevation: {
      level0: 'transparent',
      level1: lightTheme.card,
      level2: lightTheme.backgroundSecondary,
      level3: lightTheme.backgroundTertiary,
      level4: lightTheme.backgroundTertiary,
      level5: colorPalette.neutral[200],
    },
  },
  custom: {
    success: lightTheme.success,
    successLight: lightTheme.successLight,
    successBackground: lightTheme.successBackground,
    warning: lightTheme.warning,
    warningLight: lightTheme.warningLight,
    warningBackground: lightTheme.warningBackground,
    error: lightTheme.error,
    errorLight: lightTheme.errorLight,
    errorBackground: lightTheme.errorBackground,
    info: lightTheme.info,
    infoLight: lightTheme.infoLight,
    infoBackground: lightTheme.infoBackground,
    textMuted: lightTheme.foregroundMuted,
    divider: lightTheme.borderLight,
    cardBackground: lightTheme.card,
    inputBackground: lightTheme.input,
    backdrop: lightTheme.overlay,
    kdsUrgent: lightTheme.kdsUrgent,
    kdsHigh: lightTheme.kdsHigh,
    kdsNormal: lightTheme.kdsNormal,
    kdsNew: lightTheme.kdsNew,
    tableAvailable: lightTheme.tableAvailable,
    tableOccupied: lightTheme.tableOccupied,
    tableReserved: lightTheme.tableReserved,
    tableCleaning: lightTheme.tableCleaning,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: sharedDarkTheme.primary,
    secondary: sharedDarkTheme.secondary,
    tertiary: sharedDarkTheme.accent,
    background: sharedDarkTheme.background,
    surface: sharedDarkTheme.backgroundSecondary,
    surfaceVariant: sharedDarkTheme.backgroundTertiary,
    error: sharedDarkTheme.error,
    onPrimary: sharedDarkTheme.primaryForeground,
    onSecondary: sharedDarkTheme.secondaryForeground,
    onBackground: sharedDarkTheme.foreground,
    onSurface: sharedDarkTheme.foreground,
    onSurfaceVariant: sharedDarkTheme.foregroundSecondary,
    outline: sharedDarkTheme.border,
    elevation: {
      level0: 'transparent',
      level1: sharedDarkTheme.card,
      level2: sharedDarkTheme.backgroundSecondary,
      level3: sharedDarkTheme.backgroundTertiary,
      level4: colorPalette.neutral[700],
      level5: colorPalette.neutral[600],
    },
  },
  custom: {
    success: sharedDarkTheme.success,
    successLight: sharedDarkTheme.successLight,
    successBackground: sharedDarkTheme.successBackground,
    warning: sharedDarkTheme.warning,
    warningLight: sharedDarkTheme.warningLight,
    warningBackground: sharedDarkTheme.warningBackground,
    error: sharedDarkTheme.error,
    errorLight: sharedDarkTheme.errorLight,
    errorBackground: sharedDarkTheme.errorBackground,
    info: sharedDarkTheme.info,
    infoLight: sharedDarkTheme.infoLight,
    infoBackground: sharedDarkTheme.infoBackground,
    textMuted: sharedDarkTheme.foregroundMuted,
    divider: sharedDarkTheme.borderLight,
    cardBackground: sharedDarkTheme.card,
    inputBackground: sharedDarkTheme.input,
    backdrop: sharedDarkTheme.overlay,
    kdsUrgent: sharedDarkTheme.kdsUrgent,
    kdsHigh: sharedDarkTheme.kdsHigh,
    kdsNormal: sharedDarkTheme.kdsNormal,
    kdsNew: sharedDarkTheme.kdsNew,
    tableAvailable: sharedDarkTheme.tableAvailable,
    tableOccupied: sharedDarkTheme.tableOccupied,
    tableReserved: sharedDarkTheme.tableReserved,
    tableCleaning: sharedDarkTheme.tableCleaning,
  },
};

export type AppTheme = typeof theme;
export type CustomColors = typeof theme.custom;
