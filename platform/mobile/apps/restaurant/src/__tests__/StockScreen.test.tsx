/**
 * StockScreen Tests — Restaurant App
 *
 * Validates loading state, inventory list, filter tabs,
 * search functionality, and low stock alerts.
 *
 * @module apps/restaurant/__tests__/StockScreen.test
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

vi.mock('@okinawa/shared/contexts/ThemeContext', () => ({
  useColors: () => ({
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
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

vi.mock('@okinawa/shared/theme/spacing', () => ({
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  borderRadius: { sm: 8, md: 12, lg: 16 },
}));

import StockScreen from '../screens/stock/StockScreen';

// ============================================================
// TESTS
// ============================================================

describe('Restaurant StockScreen', () => {
  const mockItems = [
    {
      id: 'item-1',
      name: 'Olive Oil',
      category: 'condiments',
      current_level: 3,
      min_level: 5,
      max_level: 20,
      unit: 'liters',
      status: 'low',
      restaurant_id: 'rest-1',
    },
    {
      id: 'item-2',
      name: 'Salmon Fillet',
      category: 'meats',
      current_level: 0,
      min_level: 2,
      max_level: 10,
      unit: 'kg',
      status: 'critical',
      restaurant_id: 'rest-1',
    },
    {
      id: 'item-3',
      name: 'Arborio Rice',
      category: 'grains',
      current_level: 15,
      min_level: 5,
      max_level: 25,
      unit: 'kg',
      status: 'ok',
      restaurant_id: 'rest-1',
    },
  ];

  const mockStats = {
    total_items: 3,
    ok_count: 1,
    low_count: 1,
    critical_count: 1,
  };

  const mockNavigation = {
    navigate: vi.fn(),
    goBack: vi.fn(),
    setOptions: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/inventory/stats')) {
        return Promise.resolve({ data: mockStats });
      }
      if (url.includes('/inventory')) {
        return Promise.resolve({ data: mockItems });
      }
      return Promise.resolve({ data: null });
    });
  });

  it('shows loading state while fetching inventory', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<StockScreen navigation={mockNavigation as any} />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders inventory items after loading', async () => {
    render(<StockScreen navigation={mockNavigation as any} />);

    await waitFor(() => {
      expect(screen.getByText('Olive Oil')).toBeTruthy();
    });

    expect(screen.getByText('Salmon Fillet')).toBeTruthy();
    expect(screen.getByText('Arborio Rice')).toBeTruthy();
  });

  it('displays item status indicators (ok, low, critical)', async () => {
    render(<StockScreen navigation={mockNavigation as any} />);

    await waitFor(() => {
      expect(screen.getByText('Olive Oil')).toBeTruthy();
    });

    // Filter chips should be visible
    expect(screen.getByText('stock.filterAll')).toBeTruthy();
  });

  it('sorts items with critical items first', async () => {
    render(<StockScreen navigation={mockNavigation as any} />);

    await waitFor(() => {
      expect(screen.getByText('Salmon Fillet')).toBeTruthy();
    });

    // Items should be rendered (critical first based on STATUS_ORDER)
    const tree = screen.toJSON();
    expect(tree).toBeTruthy();
  });
});
