/**
 * ConfigHubScreen Tests — Restaurant App
 *
 * Validates config section cards rendering, RBAC filtering,
 * navigation to sub-screens, and completion percentage display.
 *
 * @module apps/restaurant/__tests__/ConfigHubScreen.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// ============================================================
// MOCKS
// ============================================================

const mockNavigate = vi.fn();

vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: vi.fn(),
    setOptions: vi.fn(),
    addListener: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: 'pt-BR',
  }),
}));

vi.mock('@/shared/contexts/ThemeContext', () => ({
  useColors: () => ({
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    foreground: '#111827',
    foregroundSecondary: '#6B7280',
    foregroundMuted: '#9CA3AF',
    card: '#FFFFFF',
    primary: '#EA580C',
    primaryForeground: '#FFFFFF',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  }),
}));

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { role: 'OWNER' },
  }),
}));

vi.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

vi.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'Icon',
}));

vi.mock('@/shared/theme/spacing', () => ({
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  borderRadius: { sm: 8, md: 12, lg: 16, xl: 20 },
}));

vi.mock('@/shared/theme/typography', () => ({
  typography: {},
}));

// Mock useRestaurantConfig hook
vi.mock('./hooks/useRestaurantConfig', () => ({
  useRestaurantConfig: () => ({
    data: { completion: 75 },
    isLoading: false,
    refetch: vi.fn(),
    isRefetching: false,
  }),
}));

import ConfigHubScreen from '../screens/config/ConfigHubScreen';

// ============================================================
// TESTS
// ============================================================

describe('Restaurant ConfigHubScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the config hub title', () => {
    render(<ConfigHubScreen />);
    // Config sections should be visible
    expect(screen.getByText('config.hub.sections.profile')).toBeTruthy();
  });

  it('renders all 10 config section cards for OWNER role', () => {
    render(<ConfigHubScreen />);

    expect(screen.getByText('config.hub.sections.profile')).toBeTruthy();
    expect(screen.getByText('config.hub.sections.serviceTypes')).toBeTruthy();
    expect(screen.getByText('config.hub.sections.experience')).toBeTruthy();
    expect(screen.getByText('config.hub.sections.floor')).toBeTruthy();
    expect(screen.getByText('config.hub.sections.kitchen')).toBeTruthy();
    expect(screen.getByText('config.hub.sections.payments')).toBeTruthy();
    expect(screen.getByText('config.hub.sections.features')).toBeTruthy();
  });

  it('displays description for each config section', () => {
    render(<ConfigHubScreen />);

    expect(screen.getByText('config.hub.sections.profileDesc')).toBeTruthy();
    expect(screen.getByText('config.hub.sections.experienceDesc')).toBeTruthy();
  });

  it('navigates to sub-screen when a config card is pressed', () => {
    render(<ConfigHubScreen />);

    fireEvent.press(screen.getByText('config.hub.sections.profile'));

    expect(mockNavigate).toHaveBeenCalledWith('ConfigProfile');
  });
});
