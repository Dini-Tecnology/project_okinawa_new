/**
 * Okinawa Design System - Spacing System
 * Consistent spacing scale for layouts and components
 */

// Base spacing unit (4px)
const BASE_UNIT = 4;

// Spacing scale
export const spacing = {
  // Micro spacing (0-8px)
  0: 0,
  px: 1,
  0.5: BASE_UNIT * 0.5,  // 2px
  1: BASE_UNIT,          // 4px
  1.5: BASE_UNIT * 1.5,  // 6px
  2: BASE_UNIT * 2,      // 8px
  
  // Small spacing (12-20px)
  2.5: BASE_UNIT * 2.5,  // 10px
  3: BASE_UNIT * 3,      // 12px
  3.5: BASE_UNIT * 3.5,  // 14px
  4: BASE_UNIT * 4,      // 16px
  5: BASE_UNIT * 5,      // 20px
  
  // Medium spacing (24-40px)
  6: BASE_UNIT * 6,      // 24px
  7: BASE_UNIT * 7,      // 28px
  8: BASE_UNIT * 8,      // 32px
  9: BASE_UNIT * 9,      // 36px
  10: BASE_UNIT * 10,    // 40px
  
  // Large spacing (48-80px)
  11: BASE_UNIT * 11,    // 44px
  12: BASE_UNIT * 12,    // 48px
  14: BASE_UNIT * 14,    // 56px
  16: BASE_UNIT * 16,    // 64px
  20: BASE_UNIT * 20,    // 80px
  
  // Extra large spacing (96-128px)
  24: BASE_UNIT * 24,    // 96px
  28: BASE_UNIT * 28,    // 112px
  32: BASE_UNIT * 32,    // 128px
  
  // Screen margins
  screenHorizontal: 16,
  screenVertical: 24,
};

// Border radius scale
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
  
  // Component specific — aligned with Demo/mobile-v2 (rounded-2xl=16px RN, rounded-3xl=24px)
  button: 16,
  buttonLarge: 20,
  card: 20,
  cardLarge: 24,
  input: 14,
  avatar: 9999,
  badge: 8,
  pill: 9999,
  bottomSheet: 28,
  nav: 28,
  
  // Liquid Glass specific
  liquidGlass: 28,
  liquidGlassItem: 16,
};

// Common layout values
export const layout = {
  // Safe area padding
  safeAreaTop: 44,
  safeAreaBottom: 34,
  
  // Navigation heights
  headerHeight: 56,
  tabBarHeight: 80,
  liquidGlassNavHeight: 90,
  
  // Content widths
  maxContentWidth: 428, // iPhone 14 Pro Max width
  
  // Common sizes
  iconSmall: 16,
  iconMedium: 20,
  iconLarge: 24,
  iconXLarge: 32,
  
  avatarSmall: 32,
  avatarMedium: 40,
  avatarLarge: 56,
  avatarXLarge: 80,
  
  buttonHeightSmall: 36,
  buttonHeightMedium: 44,
  buttonHeightLarge: 52,
  
  inputHeight: 48,
  inputHeightLarge: 56,
  
  cardImageHeight: 180,
  cardImageHeightSmall: 120,
  
  // Bottom sheet
  bottomSheetHandle: { width: 36, height: 5 },
};

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
  max: 100,
};

export type Spacing = keyof typeof spacing;
export type BorderRadius = keyof typeof borderRadius;
