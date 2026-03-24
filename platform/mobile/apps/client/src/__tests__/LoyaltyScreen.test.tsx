/**
 * LoyaltyScreen Tests — Client App
 *
 * Validates loading state, points display, tier info, rewards list,
 * statistics section, and empty state.
 *
 * @module apps/client/__tests__/LoyaltyScreen.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// ============================================================
// MOCKS
// ============================================================

const mockGetMyLoyaltyPoints = vi.fn();

vi.mock('@/shared/services/api', () => ({
  default: {
    getMyLoyaltyPoints: (...args: any[]) => mockGetMyLoyaltyPoints(...args),
  },
}));

vi.mock('@okinawa/shared/i18n', () => ({
  t: (key: string, params?: Record<string, any>) => {
    if (params) {
      return `${key} ${JSON.stringify(params)}`;
    }
    return key;
  },
}));

vi.mock('@okinawa/shared/contexts/ThemeContext', () => ({
  useColors: () => ({
    background: '#FFFFFF',
    foreground: '#111827',
    foregroundSecondary: '#6B7280',
    foregroundMuted: '#9CA3AF',
    card: '#FFFFFF',
    primary: '#EA580C',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  }),
}));

vi.mock('@okinawa/shared/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('date-fns', () => ({
  format: () => 'Mar 23, 2026',
}));

import LoyaltyScreen from '../screens/loyalty/LoyaltyScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client LoyaltyScreen', () => {
  const mockProgram = {
    id: 'prog-1',
    restaurant_id: 'rest-1',
    points_balance: 350,
    total_points_earned: 800,
    total_points_redeemed: 450,
    tier: 'silver',
    restaurant: {
      id: 'rest-1',
      name: 'Sushi Garden',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while fetching loyalty programs', () => {
    mockGetMyLoyaltyPoints.mockReturnValue(new Promise(() => {}));
    render(<LoyaltyScreen />);
    expect(screen.getByText('loyaltyScreen.loadingPrograms')).toBeTruthy();
  });

  it('displays empty state when user has no loyalty programs', async () => {
    mockGetMyLoyaltyPoints.mockResolvedValue([]);
    render(<LoyaltyScreen />);

    await waitFor(() => {
      expect(screen.getByText('loyaltyScreen.emptyTitle')).toBeTruthy();
    });

    expect(screen.getByText('loyaltyScreen.emptyMessage')).toBeTruthy();
  });

  it('displays points balance and restaurant name', async () => {
    mockGetMyLoyaltyPoints.mockResolvedValue([mockProgram]);
    render(<LoyaltyScreen />);

    await waitFor(() => {
      expect(screen.getByText('350')).toBeTruthy();
    });

    expect(screen.getByText('Sushi Garden')).toBeTruthy();
    expect(screen.getByText('loyaltyScreen.pointsAvailable')).toBeTruthy();
  });

  it('displays tier chip with correct tier name', async () => {
    mockGetMyLoyaltyPoints.mockResolvedValue([mockProgram]);
    render(<LoyaltyScreen />);

    await waitFor(() => {
      expect(screen.getByText(/loyaltyScreen.tierLabel/)).toBeTruthy();
    });
  });

  it('renders available rewards section with redeem buttons', async () => {
    mockGetMyLoyaltyPoints.mockResolvedValue([mockProgram]);
    render(<LoyaltyScreen />);

    await waitFor(() => {
      expect(screen.getByText('loyaltyScreen.availableRewards')).toBeTruthy();
    });

    expect(screen.getByText('Free Appetizer')).toBeTruthy();
    expect(screen.getByText('10% Off Next Order')).toBeTruthy();
  });

  it('renders statistics section with total earned and redeemed', async () => {
    mockGetMyLoyaltyPoints.mockResolvedValue([mockProgram]);
    render(<LoyaltyScreen />);

    await waitFor(() => {
      expect(screen.getByText('loyaltyScreen.statistics')).toBeTruthy();
    });

    expect(screen.getByText('800')).toBeTruthy();
    expect(screen.getByText('450')).toBeTruthy();
    expect(screen.getByText('loyaltyScreen.totalEarned')).toBeTruthy();
    expect(screen.getByText('loyaltyScreen.totalRedeemed')).toBeTruthy();
  });
});
