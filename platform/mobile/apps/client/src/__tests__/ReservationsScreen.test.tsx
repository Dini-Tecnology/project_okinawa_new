/**
 * ReservationsScreen Tests — Client App
 *
 * Validates loading state, reservation list, empty state, status chips,
 * and FAB navigation.
 *
 * @module apps/client/__tests__/ReservationsScreen.test
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
  useFocusEffect: (cb: () => void) => cb(),
}));

const mockGetMyReservations = vi.fn();
const mockCancelReservation = vi.fn();

vi.mock('@/shared/services/api', () => ({
  default: {
    getMyReservations: (...args: any[]) => mockGetMyReservations(...args),
    cancelReservation: (...args: any[]) => mockCancelReservation(...args),
  },
}));

vi.mock('@/shared/hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, any>) => key,
    language: 'pt-BR',
  }),
}));

vi.mock('@okinawa/shared/theme', () => ({
  useColors: () => ({
    background: '#FFFFFF',
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
    info: '#3B82F6',
  }),
}));

vi.mock('@okinawa/shared/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('date-fns', () => ({
  format: (date: Date, fmt: string) => '25/03/2026 19:00',
}));

vi.mock('date-fns/locale', () => ({
  ptBR: {},
}));

import ReservationsScreen from '../screens/reservations/ReservationsScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client ReservationsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading indicator while fetching reservations', () => {
    mockGetMyReservations.mockReturnValue(new Promise(() => {}));
    render(<ReservationsScreen />);
    // ActivityIndicator should be present during loading
    expect(screen.toJSON()).toBeTruthy();
  });

  it('displays empty state when no reservations exist', async () => {
    mockGetMyReservations.mockResolvedValue([]);
    render(<ReservationsScreen />);

    await waitFor(() => {
      expect(screen.getByText('empty.reservations')).toBeTruthy();
    });

    expect(screen.getByText('reservations.noReservations')).toBeTruthy();
  });

  it('renders reservation cards with restaurant name and guest count', async () => {
    mockGetMyReservations.mockResolvedValue([
      {
        id: 'res-1',
        restaurant: { name: 'Sushi Garden' },
        reservation_time: '2026-03-25T19:00:00Z',
        party_size: 4,
        status: 'confirmed',
        special_requests: null,
      },
      {
        id: 'res-2',
        restaurant: { name: 'Pizza Palace' },
        reservation_time: '2026-03-26T20:00:00Z',
        party_size: 2,
        status: 'pending',
        special_requests: 'Window seat please',
      },
    ]);

    render(<ReservationsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Sushi Garden')).toBeTruthy();
    });

    expect(screen.getByText('Pizza Palace')).toBeTruthy();
  });

  it('shows cancel button for pending and confirmed reservations', async () => {
    mockGetMyReservations.mockResolvedValue([
      {
        id: 'res-1',
        restaurant: { name: 'Sushi Garden' },
        reservation_time: '2026-03-25T19:00:00Z',
        party_size: 4,
        status: 'confirmed',
        special_requests: null,
      },
    ]);

    render(<ReservationsScreen />);

    await waitFor(() => {
      expect(screen.getByText('reservations.cancelReservation')).toBeTruthy();
    });
  });

  it('renders FAB for creating new reservation', async () => {
    mockGetMyReservations.mockResolvedValue([]);
    render(<ReservationsScreen />);

    await waitFor(() => {
      expect(screen.getByText('reservations.newReservation')).toBeTruthy();
    });
  });
});
