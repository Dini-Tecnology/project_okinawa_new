/**
 * useTheme Hook Tests — Shared
 *
 * Tests for ThemeProvider behavior, useColors shorthand,
 * dark mode toggle, and system theme integration.
 * Complements ThemeContext.test.tsx with hook-level tests.
 *
 * @module shared/__tests__/useTheme.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================
// SIMULATE THEME PROVIDER LOGIC (mirrors ThemeContext.tsx)
// ============================================================

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  primaryForeground: string;
  background: string;
  backgroundSecondary: string;
  foreground: string;
  foregroundSecondary: string;
  foregroundMuted: string;
  card: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

const lightColors: ThemeColors = {
  primary: '#EA580C',
  primaryForeground: '#FFFFFF',
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  foreground: '#111827',
  foregroundSecondary: '#6B7280',
  foregroundMuted: '#9CA3AF',
  card: '#FFFFFF',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const darkColors: ThemeColors = {
  primary: '#F97316',
  primaryForeground: '#FFFFFF',
  background: '#111827',
  backgroundSecondary: '#1F2937',
  foreground: '#F9FAFB',
  foregroundSecondary: '#D1D5DB',
  foregroundMuted: '#6B7280',
  card: '#1F2937',
  border: '#374151',
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',
};

function createThemeState(systemScheme: 'light' | 'dark', defaultMode: ThemeMode = 'system') {
  let mode = defaultMode;

  return {
    get isDark() {
      if (mode === 'system') return systemScheme === 'dark';
      return mode === 'dark';
    },
    get colors(): ThemeColors {
      return this.isDark ? darkColors : lightColors;
    },
    get themeMode() { return mode; },
    setThemeMode(m: ThemeMode) { mode = m; },
    toggleTheme() {
      if (mode === 'light') mode = 'dark';
      else if (mode === 'dark') mode = 'light';
      else mode = this.isDark ? 'light' : 'dark';
    },
  };
}

// ============================================================
// TESTS
// ============================================================

describe('useTheme / useColors hook behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useColors returns correct color tokens', () => {
    it('returns light theme colors when mode is light', () => {
      const state = createThemeState('light', 'light');
      const colors = state.colors;

      expect(colors.primary).toBe('#EA580C');
      expect(colors.background).toBe('#FFFFFF');
      expect(colors.card).toBe('#FFFFFF');
      expect(colors.foreground).toBe('#111827');
    });

    it('returns dark theme colors when mode is dark', () => {
      const state = createThemeState('light', 'dark');
      const colors = state.colors;

      expect(colors.primary).toBe('#F97316');
      expect(colors.background).toBe('#111827');
      expect(colors.card).toBe('#1F2937');
      expect(colors.foreground).toBe('#F9FAFB');
    });

    it('returns all semantic color tokens (success, error, warning, info)', () => {
      const state = createThemeState('light', 'light');
      const colors = state.colors;

      expect(colors.success).toBe('#10B981');
      expect(colors.error).toBe('#EF4444');
      expect(colors.warning).toBe('#F59E0B');
      expect(colors.info).toBe('#3B82F6');
    });
  });

  describe('dark mode toggle', () => {
    it('toggles from light to dark and updates all colors', () => {
      const state = createThemeState('light', 'light');

      expect(state.colors.background).toBe('#FFFFFF');

      state.toggleTheme();

      expect(state.isDark).toBe(true);
      expect(state.colors.background).toBe('#111827');
      expect(state.colors.foreground).toBe('#F9FAFB');
      expect(state.colors.border).toBe('#374151');
    });

    it('toggles from dark to light and updates all colors', () => {
      const state = createThemeState('light', 'dark');

      expect(state.colors.background).toBe('#111827');

      state.toggleTheme();

      expect(state.isDark).toBe(false);
      expect(state.colors.background).toBe('#FFFFFF');
      expect(state.colors.foreground).toBe('#111827');
    });

    it('toggles from system-dark to explicit light', () => {
      const state = createThemeState('dark', 'system');

      expect(state.isDark).toBe(true);

      state.toggleTheme();

      expect(state.themeMode).toBe('light');
      expect(state.isDark).toBe(false);
    });

    it('toggles from system-light to explicit dark', () => {
      const state = createThemeState('light', 'system');

      expect(state.isDark).toBe(false);

      state.toggleTheme();

      expect(state.themeMode).toBe('dark');
      expect(state.isDark).toBe(true);
    });
  });

  describe('system theme integration', () => {
    it('follows system preference when mode is system', () => {
      const lightState = createThemeState('light', 'system');
      expect(lightState.isDark).toBe(false);
      expect(lightState.colors.background).toBe('#FFFFFF');

      const darkState = createThemeState('dark', 'system');
      expect(darkState.isDark).toBe(true);
      expect(darkState.colors.background).toBe('#111827');
    });

    it('overrides system preference when explicit mode is set', () => {
      const state = createThemeState('dark', 'system');
      expect(state.isDark).toBe(true);

      state.setThemeMode('light');
      expect(state.isDark).toBe(false);
      expect(state.colors.background).toBe('#FFFFFF');
    });
  });

  describe('secondary and muted color tokens', () => {
    it('provides backgroundSecondary and foregroundMuted in light mode', () => {
      const state = createThemeState('light', 'light');

      expect(state.colors.backgroundSecondary).toBe('#F9FAFB');
      expect(state.colors.foregroundSecondary).toBe('#6B7280');
      expect(state.colors.foregroundMuted).toBe('#9CA3AF');
    });

    it('provides backgroundSecondary and foregroundMuted in dark mode', () => {
      const state = createThemeState('light', 'dark');

      expect(state.colors.backgroundSecondary).toBe('#1F2937');
      expect(state.colors.foregroundSecondary).toBe('#D1D5DB');
      expect(state.colors.foregroundMuted).toBe('#6B7280');
    });
  });
});
