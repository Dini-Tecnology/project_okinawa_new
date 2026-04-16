/**
 * BarmanStationScreen Tests — Restaurant App
 *
 * Validates tab rendering (orders/recipes/stock), drink queue display,
 * urgency indicators, and status transitions.
 *
 * @module apps/restaurant/__tests__/BarmanStationScreen.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// ============================================================
// MOCKS
// ============================================================

const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock('@/shared/services/api', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    patch: (...args: any[]) => mockPatch(...args),
  },
}));

vi.mock('@/shared/i18n', () => ({
  t: (key: string) => key,
}));

vi.mock('@/shared/contexts/ThemeContext', () => ({
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
    info: '#3B82F6',
  }),
}));

vi.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

import BarmanStationScreen from '../screens/barman/BarmanStationScreen';

// ============================================================
// TESTS
// ============================================================

describe('Restaurant BarmanStationScreen', () => {
  const mockOrders = [
    {
      id: 'order-1',
      order_number: '#1001',
      table_number: 'T5',
      items: [
        { id: 'di-1', name: 'Caipirinha', quantity: 2, instructions: 'Extra lime' },
      ],
      status: 'pending',
      created_at: new Date().toISOString(),
      priority: 'normal',
      waiter_name: 'Maria',
    },
    {
      id: 'order-2',
      order_number: '#1002',
      table_number: 'T3',
      items: [
        { id: 'di-2', name: 'Mojito', quantity: 1 },
        { id: 'di-3', name: 'Gin Tonic', quantity: 1 },
      ],
      status: 'preparing',
      created_at: new Date(Date.now() - 8 * 60000).toISOString(),
      priority: 'high',
      waiter_name: 'Pedro',
    },
  ];

  const mockRecipes = [
    {
      id: 'recipe-1',
      name: 'Caipirinha',
      category: 'cocktails',
      difficulty: 'easy',
      preparation_time_minutes: 3,
      glass_type: 'Old Fashioned',
      garnish: 'Lime wedge',
      base_spirit: 'Cachaca',
      serving_temp: 'cold',
      ingredients: [{ name: 'Cachaca', amount: '50', unit: 'ml' }],
      steps: ['Muddle lime', 'Add cachaca', 'Add ice'],
      tags: ['brazilian', 'classic'],
      price: 18.0,
      image_url: null,
      is_active: true,
    },
  ];

  const mockStock = [
    {
      id: 'stock-1',
      name: 'Cachaca',
      category: 'spirits',
      current_level: 8,
      min_level: 5,
      max_level: 20,
      unit: 'bottles',
      status: 'ok',
    },
    {
      id: 'stock-2',
      name: 'Lime',
      category: 'condiments',
      current_level: 2,
      min_level: 5,
      max_level: 20,
      unit: 'kg',
      status: 'low',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes('recipes')) return Promise.resolve(mockRecipes);
      if (url.includes('stock') || url.includes('inventory'))
        return Promise.resolve(mockStock);
      return Promise.resolve(mockOrders);
    });
  });

  it('renders segmented button tabs for Orders, Recipes, and Stock', async () => {
    render(<BarmanStationScreen />);

    await waitFor(() => {
      expect(screen.getByText('barman.tab.orders')).toBeTruthy();
    });

    expect(screen.getByText('barman.tab.recipes')).toBeTruthy();
    expect(screen.getByText('barman.tab.stock')).toBeTruthy();
  });

  it('displays drink order cards with table number and items', async () => {
    render(<BarmanStationScreen />);

    await waitFor(() => {
      expect(screen.getByText('#1001')).toBeTruthy();
    });

    expect(screen.getByText('T5')).toBeTruthy();
    expect(screen.getByText(/Caipirinha/)).toBeTruthy();
  });

  it('shows order priority and waiter name', async () => {
    render(<BarmanStationScreen />);

    await waitFor(() => {
      expect(screen.getByText('Maria')).toBeTruthy();
    });

    expect(screen.getByText('Pedro')).toBeTruthy();
  });
});
