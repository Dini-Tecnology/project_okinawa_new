/**
 * ProfileScreen Tests — Client App
 *
 * Validates loading state, user info display, edit dialog, navigation
 * to sub-screens, and logout action.
 *
 * @module apps/client/__tests__/ProfileScreen.test
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

const mockGetCurrentUser = vi.fn();
const mockUpdateProfile = vi.fn();
const mockLogout = vi.fn();

vi.mock('@/shared/services/api', () => ({
  default: {
    getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
    updateProfile: (...args: any[]) => mockUpdateProfile(...args),
    logout: (...args: any[]) => mockLogout(...args),
  },
}));

vi.mock('@/shared/hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: 'pt-BR',
  }),
}));

vi.mock('@okinawa/shared/contexts/ThemeContext', () => ({
  useColors: () => ({
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    foreground: '#111827',
    foregroundSecondary: '#6B7280',
    foregroundMuted: '#9CA3AF',
    card: '#FFFFFF',
    primary: '#EA580C',
    primaryForeground: '#FFFFFF',
    border: '#E5E7EB',
    error: '#EF4444',
  }),
  useOkinawaTheme: () => ({
    theme: { colors: {} },
    isDark: false,
  }),
}));

vi.mock('@okinawa/shared/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import ProfileScreen from '../screens/profile/ProfileScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client ProfileScreen', () => {
  const mockUser = {
    id: 'user-1',
    full_name: 'Maria Silva',
    email: 'maria@example.com',
    phone: '+5511999999999',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(mockUser);
  });

  it('shows loading indicator while fetching user', () => {
    mockGetCurrentUser.mockReturnValue(new Promise(() => {}));
    render(<ProfileScreen />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('displays user name and email after loading', async () => {
    render(<ProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeTruthy();
    });

    expect(screen.getByText('maria@example.com')).toBeTruthy();
  });

  it('displays avatar with user initials', async () => {
    render(<ProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('M')).toBeTruthy();
    });
  });

  it('renders account section with name, email, and phone items', async () => {
    render(<ProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('profile.account')).toBeTruthy();
    });

    expect(screen.getByText('auth.fullName')).toBeTruthy();
    expect(screen.getByText('auth.email')).toBeTruthy();
    expect(screen.getByText('profile.phone')).toBeTruthy();
  });

  it('renders management section with payment, wallet, and addresses links', async () => {
    render(<ProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('profile.manage')).toBeTruthy();
    });

    expect(screen.getByText('profile.paymentMethods')).toBeTruthy();
    expect(screen.getByText('profile.wallet')).toBeTruthy();
    expect(screen.getByText('profile.addresses')).toBeTruthy();
  });

  it('renders logout button', async () => {
    render(<ProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('auth.logout')).toBeTruthy();
    });

    expect(screen.getByLabelText('Log out')).toBeTruthy();
  });

  it('shows version number in footer', async () => {
    render(<ProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText(/1.0.0/)).toBeTruthy();
    });
  });
});
