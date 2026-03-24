/**
 * WaitlistScreen Tests — Client App
 *
 * Validates join form rendering, party size input, queue position display,
 * and leave queue action.
 *
 * @module apps/client/__tests__/WaitlistScreen.test
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

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();

vi.mock('@okinawa/shared/services/api', () => ({
  ApiService: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    patch: (...args: any[]) => mockPatch(...args),
  },
}));

vi.mock('@okinawa/shared/i18n', () => ({
  t: (key: string, params?: Record<string, any>) => {
    if (params) {
      let result = key;
      Object.entries(params).forEach(([k, v]) => {
        result += ` ${v}`;
      });
      return result;
    }
    return key;
  },
}));

vi.mock('@okinawa/shared/contexts/ThemeContext', () => ({
  useColors: () => ({
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    foreground: '#111827',
    foregroundSecondary: '#6B7280',
    foregroundMuted: '#9CA3AF',
    card: '#FFFFFF',
    primary: '#EA580C',
    secondary: '#7C3AED',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  }),
}));

vi.mock('@okinawa/shared/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
  }),
}));

import WaitlistScreen from '../screens/waitlist/WaitlistScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client WaitlistScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: not in queue (404)
    mockGet.mockRejectedValue({ response: { status: 404 } });
  });

  it('renders the join form with guest name and party size inputs', async () => {
    render(<WaitlistScreen route={{ params: { restaurantId: 'rest-1' } }} />);

    await waitFor(() => {
      expect(screen.getByText('waitlist.joinTitle')).toBeTruthy();
    });

    expect(screen.getByLabelText('waitlist.guestName')).toBeTruthy();
    expect(screen.getByLabelText('waitlist.partySize')).toBeTruthy();
  });

  it('renders preference selector and kids toggle', async () => {
    render(<WaitlistScreen route={{ params: { restaurantId: 'rest-1' } }} />);

    await waitFor(() => {
      expect(screen.getByText('waitlist.preference')).toBeTruthy();
    });

    expect(screen.getByText('waitlist.prefSalao')).toBeTruthy();
    expect(screen.getByText('waitlist.prefTerraco')).toBeTruthy();
    expect(screen.getByText('waitlist.prefAny')).toBeTruthy();
    expect(screen.getByLabelText('waitlist.hasKids')).toBeTruthy();
  });

  it('renders the join button', async () => {
    render(<WaitlistScreen route={{ params: { restaurantId: 'rest-1' } }} />);

    await waitFor(() => {
      expect(screen.getByLabelText('waitlist.joinButton')).toBeTruthy();
    });
  });

  it('displays position view when already in queue', async () => {
    mockGet.mockResolvedValue({
      data: {
        id: 'entry-1',
        position: 3,
        estimated_wait_minutes: 15,
        status: 'waiting',
        customer_name: 'Test User',
        party_size: 2,
        has_kids: false,
        table_number: null,
        waitlist_bar_orders: [],
      },
    });

    render(<WaitlistScreen route={{ params: { restaurantId: 'rest-1' } }} />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeTruthy();
    });

    expect(screen.getByText(/waitlist.position/)).toBeTruthy();
    expect(screen.getByText(/waitlist.estimate/)).toBeTruthy();
  });

  it('shows while-waiting actions when in queue and not called', async () => {
    mockGet.mockResolvedValue({
      data: {
        id: 'entry-1',
        position: 2,
        estimated_wait_minutes: 10,
        status: 'waiting',
        customer_name: 'Test User',
        party_size: 2,
        has_kids: false,
        table_number: null,
        waitlist_bar_orders: [],
      },
    });

    render(<WaitlistScreen route={{ params: { restaurantId: 'rest-1' } }} />);

    await waitFor(() => {
      expect(screen.getByText('waitlist.whileWaiting')).toBeTruthy();
    });

    expect(screen.getByLabelText('waitlist.orderDrinks')).toBeTruthy();
    expect(screen.getByLabelText('waitlist.viewMenu')).toBeTruthy();
    expect(screen.getByLabelText('waitlist.leave')).toBeTruthy();
  });
});
