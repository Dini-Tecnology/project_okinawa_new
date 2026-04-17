/**
 * Okinawa Design System - Color Tokens
 * Modern Chic Aesthetic with Warm Orange Primary
 * 
 * All colors use semantic naming for consistent theming
 * across both Client and Restaurant apps
 */

export const colorPalette = {
  // Primary - Website brand orange
  primary: {
    50: '#FFF4F0',
    100: '#FFE0D6',
    200: '#FFC1AD',
    300: '#FFA184',
    400: '#FF764D',
    500: '#FF5724', // Main brand color (site --primary)
    600: '#E63600',
    700: '#B82C00',
    800: '#8A2100',
    900: '#5C1600',
  },
  
  // Secondary - Website brand teal
  secondary: {
    50: '#EDF7F6',
    100: '#D0E9E6',
    200: '#A1D3CD',
    300: '#72BDB4',
    400: '#288A81',
    500: '#186860',
    600: '#0E4E48',
    700: '#0B3F3A',
    800: '#08302C',
    900: '#05201D',
  },
  
  // Accent - Website warning/accent amber
  accent: {
    50: '#FFF8E8',
    100: '#FFEEC2',
    200: '#FFDE85',
    300: '#FFCD47',
    400: '#F7B22A',
    500: '#F59F0A',
    600: '#D98609',
    700: '#AD6B07',
    800: '#825005',
    900: '#563503',
  },
  
  // Neutral - aligned with site tokens
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFA',
    100: '#F4F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#A2A9B6',
    500: '#757C8A',
    600: '#5A6170',
    700: '#424956',
    800: '#2D323D',
    900: '#1F2229',
    950: '#0F1114',
  },
  
  // Status colors
  success: {
    light: '#49C485',
    main: '#20AC6B',
    dark: '#17824F',
  },
  warning: {
    light: '#F7B22A',
    main: '#F59F0A',
    dark: '#D98609',
  },
  error: {
    light: '#F36C6C',
    main: '#EF4343',
    dark: '#CF2F2F',
  },
  info: {
    light: '#41B8EC',
    main: '#0DA2E7',
    dark: '#0A82B9',
  },
};

// Semantic Light Theme Tokens
export const lightTheme = {
  // Backgrounds
  background: colorPalette.neutral[0],
  backgroundSecondary: colorPalette.neutral[50],
  backgroundTertiary: colorPalette.neutral[100],
  
  // Foregrounds / Text
  foreground: colorPalette.neutral[900],
  foregroundSecondary: colorPalette.neutral[600],
  foregroundMuted: colorPalette.neutral[400],
  foregroundInverse: colorPalette.neutral[0],
  
  // Cards
  card: colorPalette.neutral[0],
  cardHover: colorPalette.neutral[50],
  cardBorder: colorPalette.neutral[200],
  
  // Primary Actions
  primary: colorPalette.primary[500],
  primaryLight: colorPalette.primary[400],
  primaryDark: colorPalette.primary[600],
  primaryForeground: colorPalette.neutral[0],
  primaryGlow: 'rgba(255, 87, 36, 0.25)',
  
  // Secondary Actions
  secondary: colorPalette.secondary[500],
  secondaryLight: colorPalette.secondary[400],
  secondaryDark: colorPalette.secondary[600],
  secondaryForeground: colorPalette.neutral[0],
  
  // Accent
  accent: colorPalette.accent[500],
  accentLight: colorPalette.accent[300],
  accentForeground: colorPalette.neutral[900],
  
  // Borders
  border: colorPalette.neutral[200],
  borderLight: colorPalette.neutral[100],
  borderFocus: colorPalette.primary[500],
  
  // Input
  input: colorPalette.neutral[50],
  inputBorder: colorPalette.neutral[200],
  inputFocus: colorPalette.primary[500],
  inputPlaceholder: colorPalette.neutral[400],
  
  // Status
  success: colorPalette.success.main,
  successLight: colorPalette.success.light,
  successBackground: '#ECFDF5',
  warning: colorPalette.warning.main,
  warningLight: colorPalette.warning.light,
  warningBackground: '#FFFBEB',
  error: colorPalette.error.main,
  errorLight: colorPalette.error.light,
  errorBackground: '#FEF2F2',
  info: colorPalette.info.main,
  infoLight: colorPalette.info.light,
  infoBackground: '#EFF6FF',
  
  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.6)',
  glassStrong: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.8)',
  
  // Shadows
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowColorStrong: 'rgba(0, 0, 0, 0.2)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Rating
  ratingGold: '#FFD700',
  ratingEmpty: colorPalette.neutral[200],
  
  // KDS Specific (Restaurant App)
  kdsUrgent: colorPalette.error.main,
  kdsHigh: colorPalette.warning.main,
  kdsNormal: colorPalette.success.main,
  kdsNew: colorPalette.info.main,
  
  // Table Status (Restaurant App)
  tableAvailable: colorPalette.success.main,
  tableOccupied: colorPalette.error.main,
  tableReserved: colorPalette.info.main,
  tableCleaning: colorPalette.warning.main,

  // Muted tokens (legacy compatibility)
  muted: colorPalette.neutral[200],
  mutedForeground: colorPalette.neutral[500],
  cardForeground: colorPalette.neutral[900],
  successMuted: 'rgba(16, 185, 129, 0.15)',
  destructive: colorPalette.error.main,

  // Loyalty Tier Colors
  tierBronze: '#CD7F32',
  tierBronzeBackground: 'rgba(205, 127, 50, 0.12)',
  tierSilver: '#C0C0C0',
  tierSilverBackground: 'rgba(192, 192, 192, 0.12)',
  tierGold: '#FFD700',
  tierGoldBackground: 'rgba(255, 215, 0, 0.12)',
  tierPlatinum: '#E5E4E2',
  tierPlatinumBackground: 'rgba(229, 228, 226, 0.12)',

  // Order/Reservation Status Colors
  statusPending: colorPalette.warning.main,
  statusPendingBackground: 'rgba(245, 158, 11, 0.12)',
  statusConfirmed: colorPalette.info.main,
  statusConfirmedBackground: 'rgba(59, 130, 246, 0.12)',
  statusPreparing: colorPalette.primary[500],
  statusPreparingBackground: 'rgba(249, 115, 22, 0.12)',
  statusReady: colorPalette.success.main,
  statusReadyBackground: 'rgba(16, 185, 129, 0.12)',
  statusCompleted: colorPalette.success.dark,
  statusCompletedBackground: 'rgba(5, 150, 105, 0.12)',
  statusCancelled: colorPalette.error.main,
  statusCancelledBackground: 'rgba(239, 68, 68, 0.12)',
  statusDelivering: '#8B5CF6',
  statusDeliveringBackground: 'rgba(139, 92, 246, 0.12)',

  // Onboarding slide accents (brand-aligned)
  onboardingSlide1: colorPalette.primary[500],
  onboardingSlide2: colorPalette.secondary[500],
  onboardingSlide3: colorPalette.accent[500],
  onboardingSlide4: '#8B5CF6',

  // Premium Dark Card (always dark, for elevated feature headers)
  premiumCard: colorPalette.neutral[800],
  premiumCardForeground: colorPalette.neutral[0],
  premiumCardMuted: 'rgba(255, 255, 255, 0.6)',
  premiumCardBorder: 'rgba(255, 255, 255, 0.2)',
  premiumCardGlass: 'rgba(255, 255, 255, 0.15)',
  premiumCardGlassLight: 'rgba(255, 255, 255, 0.1)',
};

// Semantic Dark Theme Tokens
export const darkTheme = {
  // Backgrounds
  background: colorPalette.neutral[950],
  backgroundSecondary: colorPalette.neutral[900],
  backgroundTertiary: colorPalette.neutral[800],
  
  // Foregrounds / Text
  foreground: colorPalette.neutral[50],
  foregroundSecondary: colorPalette.neutral[300],
  foregroundMuted: colorPalette.neutral[500],
  foregroundInverse: colorPalette.neutral[900],
  
  // Cards
  card: colorPalette.neutral[900],
  cardHover: colorPalette.neutral[800],
  cardBorder: colorPalette.neutral[700],
  
  // Primary Actions
  primary: colorPalette.primary[500],
  primaryLight: colorPalette.primary[400],
  primaryDark: colorPalette.primary[600],
  primaryForeground: colorPalette.neutral[0],
  primaryGlow: 'rgba(249, 115, 22, 0.35)',
  
  // Secondary Actions
  secondary: colorPalette.secondary[500],
  secondaryLight: colorPalette.secondary[400],
  secondaryDark: colorPalette.secondary[600],
  secondaryForeground: colorPalette.neutral[0],
  
  // Accent
  accent: colorPalette.accent[400],
  accentLight: colorPalette.accent[300],
  accentForeground: colorPalette.neutral[900],
  
  // Borders
  border: colorPalette.neutral[700],
  borderLight: colorPalette.neutral[800],
  borderFocus: colorPalette.primary[500],
  
  // Input
  input: colorPalette.neutral[800],
  inputBorder: colorPalette.neutral[700],
  inputFocus: colorPalette.primary[500],
  inputPlaceholder: colorPalette.neutral[500],
  
  // Status
  success: colorPalette.success.main,
  successLight: colorPalette.success.light,
  successBackground: 'rgba(16, 185, 129, 0.1)',
  warning: colorPalette.warning.main,
  warningLight: colorPalette.warning.light,
  warningBackground: 'rgba(245, 158, 11, 0.1)',
  error: colorPalette.error.main,
  errorLight: colorPalette.error.light,
  errorBackground: 'rgba(239, 68, 68, 0.1)',
  info: colorPalette.info.main,
  infoLight: colorPalette.info.light,
  infoBackground: 'rgba(59, 130, 246, 0.1)',
  
  // Glassmorphism
  glass: 'rgba(17, 24, 39, 0.6)',
  glassStrong: 'rgba(17, 24, 39, 0.8)',
  glassBorder: 'rgba(55, 65, 81, 0.5)',
  
  // Shadows
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  shadowColorStrong: 'rgba(0, 0, 0, 0.5)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Rating
  ratingGold: '#FFD700',
  ratingEmpty: colorPalette.neutral[600],
  
  // KDS Specific (Restaurant App)
  kdsUrgent: colorPalette.error.main,
  kdsHigh: colorPalette.warning.main,
  kdsNormal: colorPalette.success.main,
  kdsNew: colorPalette.info.main,
  
  // Table Status (Restaurant App)
  tableAvailable: colorPalette.success.main,
  tableOccupied: colorPalette.error.main,
  tableReserved: colorPalette.info.main,
  tableCleaning: colorPalette.warning.main,

  // Muted tokens (legacy compatibility)
  muted: colorPalette.neutral[700],
  mutedForeground: colorPalette.neutral[400],
  cardForeground: colorPalette.neutral[50],
  successMuted: 'rgba(16, 185, 129, 0.2)',
  destructive: colorPalette.error.main,

  // Loyalty Tier Colors
  tierBronze: '#CD7F32',
  tierBronzeBackground: 'rgba(205, 127, 50, 0.2)',
  tierSilver: '#D4D4D4',
  tierSilverBackground: 'rgba(212, 212, 212, 0.15)',
  tierGold: '#FFD700',
  tierGoldBackground: 'rgba(255, 215, 0, 0.15)',
  tierPlatinum: '#E5E4E2',
  tierPlatinumBackground: 'rgba(229, 228, 226, 0.15)',

  // Order/Reservation Status Colors
  statusPending: colorPalette.warning.main,
  statusPendingBackground: 'rgba(245, 158, 11, 0.2)',
  statusConfirmed: colorPalette.info.main,
  statusConfirmedBackground: 'rgba(59, 130, 246, 0.2)',
  statusPreparing: colorPalette.primary[500],
  statusPreparingBackground: 'rgba(249, 115, 22, 0.2)',
  statusReady: colorPalette.success.main,
  statusReadyBackground: 'rgba(16, 185, 129, 0.2)',
  statusCompleted: colorPalette.success.dark,
  statusCompletedBackground: 'rgba(5, 150, 105, 0.2)',
  statusCancelled: colorPalette.error.main,
  statusCancelledBackground: 'rgba(239, 68, 68, 0.2)',
  statusDelivering: '#A78BFA',
  statusDeliveringBackground: 'rgba(167, 139, 250, 0.2)',

  // Onboarding slide accents (brand-aligned)
  onboardingSlide1: colorPalette.primary[400],
  onboardingSlide2: colorPalette.secondary[400],
  onboardingSlide3: colorPalette.accent[400],
  onboardingSlide4: '#A78BFA',

  // Premium Dark Card (always dark, for elevated feature headers)
  premiumCard: colorPalette.neutral[800],
  premiumCardForeground: colorPalette.neutral[0],
  premiumCardMuted: 'rgba(255, 255, 255, 0.6)',
  premiumCardBorder: 'rgba(255, 255, 255, 0.2)',
  premiumCardGlass: 'rgba(255, 255, 255, 0.15)',
  premiumCardGlassLight: 'rgba(255, 255, 255, 0.1)',
};

// Gradients
export const gradients = {
  primary: ['#FF5724', '#F59F0A'],
  primarySubtle: ['rgba(255, 87, 36, 0.8)', 'rgba(245, 159, 10, 0.8)'],
  secondary: ['#186860', '#288A81'],
  accent: ['#D98609', '#F7B22A'],
  hero: ['#FF5724', '#186860'],
  glass: ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0)'],
  glassDark: ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0)'],
  cardShine: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0)'],
};

export type ThemeColors = typeof lightTheme;
export type ColorPalette = typeof colorPalette;
