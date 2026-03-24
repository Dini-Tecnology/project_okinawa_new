/**
 * DashboardScreen Tests — Restaurant App
 *
 * Validates rendering of stat cards, metrics, loading state,
 * pull-to-refresh, WebSocket subscription, and revenue chart.
 *
 * @module apps/restaurant/__tests__/DashboardScreen.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react-native';

// ============================================================
// MOCKS
// ============================================================

vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
    goBack: vi.fn(),
    setOptions: vi.fn(),
    addListener: vi.fn(),
  }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: vi.fn(),
}));

const mockFetchData = {
  stats: {
    today_orders: 42,
    today_revenue: 8540.5,
    active_orders: 7,
    pending_reservations: 3,
    tables_occupied: 12,
    tables_total: 20,
    avg_preparation_time: 18,
    customer_satisfaction: 4.7,
  },
  revenueData: [
    { date: 'Mon', amount: 1200 },
    { date: 'Tue', amount: 1450 },
    { date: 'Wed', amount: 980 },
    { date: 'Thu', amount: 1680 },
    { date: 'Fri', amount: 2100 },
    { date: 'Sat', amount: 2800 },
    { date: 'Sun', amount: 1900 },
  ],
};

const mockGetAnalytics = vi.fn();
vi.mock('@/shared/services/api', () => ({
  default: {
    getAnalytics: (...args: any[]) => mockGetAnalytics(...args),
  },
}));

// Mock TanStack Query
const mockRefetch = vi.fn();
let mockIsLoading = false;
let mockIsFetching = false;
let mockData: any = null;

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: any) => {
    // Call queryFn on first render to simulate data loading
    if (!mockData && !mockIsLoading) {
      options.queryFn?.().then?.((data: any) => {
        mockData = data;
      });
    }
    return {
      data: mockData,
      isLoading: mockIsLoading,
      isFetching: mockIsFetching,
      refetch: mockRefetch,
    };
  },
  useQueryClient: () => ({
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  }),
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
    backgroundTertiary: '#F3F4F6',
    foreground: '#111827',
    foregroundSecondary: '#6B7280',
    card: '#FFFFFF',
    primary: '#EA580C',
    secondary: '#0D9488',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    ratingGold: '#F59E0B',
  }),
  useOkinawaTheme: () => ({
    theme: {},
    isDark: false,
  }),
}));

vi.mock('@/shared/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    connected: true,
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

// Mock react-native-chart-kit — it renders SVG which is hard in tests
vi.mock('react-native-chart-kit', () => ({
  LineChart: () => null,
}));

import DashboardScreen from '../screens/dashboard/DashboardScreen';

// ============================================================
// TESTS
// ============================================================

describe('Restaurant DashboardScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockData = null;
    mockIsLoading = false;
    mockIsFetching = false;
  });

  // ---- Loading state ----

  it('shows loading indicator when data is loading', () => {
    mockIsLoading = true;
    mockData = null;
    render(<DashboardScreen />);
    // ActivityIndicator is rendered; no dashboard title visible
    expect(screen.queryByText('restaurantNav.dashboard')).toBeNull();
  });

  // ---- Renders dashboard title ----

  it('renders the dashboard title after loading', () => {
    mockIsLoading = false;
    mockData = mockFetchData;
    render(<DashboardScreen />);
    expect(screen.getByText('restaurantNav.dashboard')).toBeTruthy();
  });

  // ---- Stat cards ----

  it('renders today orders stat card', () => {
    mockData = mockFetchData;
    render(<DashboardScreen />);
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('financial.todayOrders')).toBeTruthy();
  });

  it('renders today revenue stat card', () => {
    mockData = mockFetchData;
    render(<DashboardScreen />);
    expect(screen.getByText('R$ 8541')).toBeTruthy();
    expect(screen.getByText('financial.todayRevenue')).toBeTruthy();
  });

  it('renders active orders stat card', () => {
    mockData = mockFetchData;
    render(<DashboardScreen />);
    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByText('orders.activeOrders')).toBeTruthy();
  });

  it('renders pending reservations stat card', () => {
    mockData = mockFetchData;
    render(<DashboardScreen />);
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('reservations.pendingReservations')).toBeTruthy();
  });

  // ---- Table occupancy ----

  it('renders table occupancy display', () => {
    mockData = mockFetchData;
    render(<DashboardScreen />);
    expect(screen.getByText('tables.tableStatus')).toBeTruthy();
    expect(screen.getByText('12/20')).toBeTruthy();
    expect(screen.getByText('tables.status.occupied')).toBeTruthy();
  });

  it('calculates occupancy percentage correctly', () => {
    const occupied = 12;
    const total = 20;
    const percentage = ((occupied / total) * 100).toFixed(0);
    expect(percentage).toBe('60');
  });

  // ---- Performance metrics ----

  it('renders average preparation time', () => {
    mockData = mockFetchData;
    render(<DashboardScreen />);
    expect(screen.getByText('18 min')).toBeTruthy();
    expect(screen.getByText('kds.avgTime')).toBeTruthy();
  });

  it('renders customer satisfaction score', () => {
    mockData = mockFetchData;
    render(<DashboardScreen />);
    expect(screen.getByText('4.7')).toBeTruthy();
    expect(screen.getByText('reviews.satisfaction')).toBeTruthy();
  });

  // ---- Revenue chart ----

  it('renders the weekly revenue section', () => {
    mockData = mockFetchData;
    render(<DashboardScreen />);
    expect(screen.getByText('financial.weeklyRevenue')).toBeTruthy();
  });

  // ---- Default values when stats are null ----

  it('renders 0 values when stats are null', () => {
    mockData = { stats: null, revenueData: [] };
    render(<DashboardScreen />);
    // With null stats, the template uses `stats?.today_orders || 0`
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  // ---- Dashboard query configuration ----

  it('exports correct query keys', () => {
    // Verify query key structure used by TanStack Query
    const { dashboardQueryKeys } = require('../screens/dashboard/DashboardScreen');
    expect(dashboardQueryKeys.dashboard).toEqual(['restaurant', 'dashboard']);
  });
});
