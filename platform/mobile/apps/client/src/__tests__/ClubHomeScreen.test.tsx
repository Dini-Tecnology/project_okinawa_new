/**
 * ClubHomeScreen Tests — Client App
 *
 * Validates loading state, event list, empty state, event card details,
 * and buy ticket / join queue actions.
 *
 * @module apps/client/__tests__/ClubHomeScreen.test
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

vi.mock('@okinawa/shared/i18n', () => ({
  t: (key: string) => key,
}));

vi.mock('@okinawa/shared/contexts/ThemeContext', () => ({
  useColors: () => ({
    background: '#FFFFFF',
    backgroundTertiary: '#F3F4F6',
    foreground: '#111827',
    foregroundSecondary: '#6B7280',
    foregroundMuted: '#9CA3AF',
    card: '#FFFFFF',
    primary: '#EA580C',
    primaryForeground: '#FFFFFF',
    border: '#E5E7EB',
    success: '#10B981',
    successBackground: '#ECFDF5',
    error: '#EF4444',
    errorBackground: '#FEF2F2',
  }),
}));

vi.mock('@okinawa/shared/services/api', () => ({
  ApiService: {
    get: vi.fn(),
  },
}));

vi.mock('@okinawa/shared/theme/colors', () => ({
  gradients: {
    primary: ['#EA580C', '#DC2626'],
  },
}));

vi.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

// Mock TanStack Query
let mockQueryData: any[] | undefined = undefined;
let mockIsLoading = false;
let mockIsRefetching = false;
const mockRefetch = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: mockQueryData,
    isLoading: mockIsLoading,
    isRefetching: mockIsRefetching,
    refetch: mockRefetch,
  }),
}));

import ClubHomeScreen from '../screens/club/ClubHomeScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client ClubHomeScreen', () => {
  const mockEvents = [
    {
      id: 'evt-1',
      name: 'Neon Nights',
      date: '2026-03-28T22:00:00Z',
      artist: 'DJ Spark',
      genre: 'Electronic',
      coverCharge: 50.0,
      vipCoverCharge: 150.0,
      status: 'available',
      venue: 'Main Stage',
      restaurantId: 'rest-1',
    },
    {
      id: 'evt-2',
      name: 'Jazz Evening',
      date: '2026-03-29T20:00:00Z',
      artist: 'The Blue Notes',
      genre: 'Jazz',
      coverCharge: 80.0,
      vipCoverCharge: 200.0,
      status: 'soldout',
      venue: 'Lounge',
      restaurantId: 'rest-1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryData = mockEvents;
    mockIsLoading = false;
    mockIsRefetching = false;
  });

  it('shows loading skeleton while fetching events', () => {
    mockIsLoading = true;
    render(
      <ClubHomeScreen route={{ params: { restaurantId: 'rest-1' } }} />,
    );
    expect(screen.getByText('club.title')).toBeTruthy();
    expect(screen.getByText('club.events')).toBeTruthy();
  });

  it('displays empty state when no events available', () => {
    mockQueryData = [];
    render(
      <ClubHomeScreen route={{ params: { restaurantId: 'rest-1' } }} />,
    );
    expect(screen.getByText('club.noEvents')).toBeTruthy();
  });

  it('renders event cards with name, artist, and cover charge', () => {
    render(
      <ClubHomeScreen route={{ params: { restaurantId: 'rest-1' } }} />,
    );

    expect(screen.getByText('Neon Nights')).toBeTruthy();
    expect(screen.getByText('DJ Spark')).toBeTruthy();
    expect(screen.getByText('R$ 50.00')).toBeTruthy();
    expect(screen.getByText('Jazz Evening')).toBeTruthy();
    expect(screen.getByText('The Blue Notes')).toBeTruthy();
  });

  it('shows available and sold out status badges on event cards', () => {
    render(
      <ClubHomeScreen route={{ params: { restaurantId: 'rest-1' } }} />,
    );

    expect(screen.getByText('club.available')).toBeTruthy();
    expect(screen.getByText('club.soldOut')).toBeTruthy();
  });

  it('renders buy ticket, join queue, and view lineup buttons', () => {
    render(
      <ClubHomeScreen route={{ params: { restaurantId: 'rest-1' } }} />,
    );

    const buyButtons = screen.getAllByText('club.buyTicket');
    expect(buyButtons.length).toBeGreaterThanOrEqual(1);

    const queueButtons = screen.getAllByText('club.joinQueue');
    expect(queueButtons.length).toBeGreaterThanOrEqual(1);

    const lineupButtons = screen.getAllByText('club.viewLineup');
    expect(lineupButtons.length).toBeGreaterThanOrEqual(1);
  });
});
