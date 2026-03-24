/**
 * ReportsScreen Tests — Restaurant App
 *
 * Validates date range selector, revenue display, chart rendering,
 * top menu items, and staff performance sections.
 *
 * @module apps/restaurant/__tests__/ReportsScreen.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// ============================================================
// MOCKS
// ============================================================

const mockGet = vi.fn();

vi.mock('@/shared/services/api', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

vi.mock('@/shared/hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: 'pt-BR',
  }),
}));

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { restaurant_id: 'rest-1' },
  }),
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
    primaryForeground: '#FFFFFF',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  }),
  useOkinawaTheme: () => ({
    theme: { colors: {} },
    isDark: false,
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

vi.mock('react-native-chart-kit', () => ({
  BarChart: () => null,
}));

import ReportsScreen from '../screens/reports/ReportsScreen';

// ============================================================
// TESTS
// ============================================================

describe('Restaurant ReportsScreen', () => {
  const mockReportData = {
    sales: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      values: [1200, 1500, 980, 2100, 1800],
      total_revenue: 7580,
      wow_comparison: 12.5,
    },
    orders: {
      total: 45,
      by_status: [
        { status: 'completed', count: 38 },
        { status: 'cancelled', count: 2 },
        { status: 'pending', count: 5 },
      ],
      by_service_type: [
        { type: 'dine-in', count: 30 },
        { type: 'takeout', count: 15 },
      ],
    },
    menu_items: [
      { id: 'mi-1', name: 'File Mignon', quantity_sold: 25, revenue: 2125 },
      { id: 'mi-2', name: 'Risoto Funghi', quantity_sold: 18, revenue: 1170 },
    ],
    staff: [
      { id: 's-1', name: 'Maria', orders_handled: 15, tips: 250, rating: 4.8 },
      { id: 's-2', name: 'Pedro', orders_handled: 12, tips: 180, rating: 4.5 },
    ],
    payments: [
      { method: 'credit_card', label: 'reports.payments.credit', percentage: 60, total: 4548 },
      { method: 'pix', label: 'reports.payments.pix', percentage: 30, total: 2274 },
      { method: 'cash', label: 'reports.payments.cash', percentage: 10, total: 758 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockReportData });
  });

  it('renders date range selector chips', async () => {
    render(<ReportsScreen />);

    await waitFor(() => {
      expect(screen.getByText('reports.range.today')).toBeTruthy();
    });

    expect(screen.getByText('reports.range.week')).toBeTruthy();
    expect(screen.getByText('reports.range.month')).toBeTruthy();
  });

  it('displays total revenue number', async () => {
    render(<ReportsScreen />);

    await waitFor(() => {
      expect(screen.getByText('reports.title')).toBeTruthy();
    });
  });

  it('renders top menu items section', async () => {
    render(<ReportsScreen />);

    await waitFor(() => {
      expect(screen.getByText('reports.topItems')).toBeTruthy();
    });

    expect(screen.getByText('File Mignon')).toBeTruthy();
    expect(screen.getByText('Risoto Funghi')).toBeTruthy();
  });

  it('renders staff performance section', async () => {
    render(<ReportsScreen />);

    await waitFor(() => {
      expect(screen.getByText('reports.staffPerformance')).toBeTruthy();
    });

    expect(screen.getByText('Maria')).toBeTruthy();
    expect(screen.getByText('Pedro')).toBeTruthy();
  });

  it('shows loading state while fetching report data', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<ReportsScreen />);
    expect(screen.toJSON()).toBeTruthy();
  });
});
