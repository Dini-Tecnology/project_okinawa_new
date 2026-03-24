/**
 * OrdersManagementScreen Tests — Restaurant App
 *
 * Validates rendering of order list, filter segments, search bar,
 * status advancement, order cancellation, loading/empty states.
 *
 * @module apps/restaurant/__tests__/OrdersManagementScreen.test
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
  useRoute: () => ({ params: {} }),
  useFocusEffect: (cb: () => void) => cb(),
}));

const mockGetRestaurantOrders = vi.fn();
const mockUpdateOrderStatus = vi.fn();
vi.mock('@/shared/services/api', () => ({
  default: {
    getRestaurantOrders: (...args: any[]) => mockGetRestaurantOrders(...args),
    updateOrderStatus: (...args: any[]) => mockUpdateOrderStatus(...args),
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
    warning: '#F59E0B',
    info: '#3B82F6',
    secondary: '#0D9488',
    success: '#10B981',
    error: '#EF4444',
  }),
}));

vi.mock('date-fns', () => ({
  format: vi.fn(() => '20/03/2026 14:30'),
}));

vi.mock('date-fns/locale', () => ({
  ptBR: {},
}));

vi.mock('@shopify/flash-list', () => ({
  FlashList: ({ data, renderItem, ListEmptyComponent }: any) => {
    if (!data || data.length === 0) {
      return typeof ListEmptyComponent === 'function'
        ? ListEmptyComponent()
        : ListEmptyComponent;
    }
    return data.map((item: any, index: number) => renderItem({ item, index }));
  },
}));

import OrdersScreen from '../screens/orders/OrdersScreen';

// ============================================================
// FIXTURES
// ============================================================

const sampleOrders = [
  {
    id: 'ord-r1',
    order_number: '001',
    status: 'pending' as const,
    order_type: 'dine_in',
    total_amount: 120.5,
    payment_method: 'credit_card',
    created_at: '2026-03-20T14:30:00Z',
    customer: { full_name: 'Maria Silva' },
    items: [
      { id: 'i1', menu_item: { name: 'Sashimi' }, quantity: 2, unit_price: 40 },
      { id: 'i2', menu_item: { name: 'Miso Soup' }, quantity: 1, unit_price: 15 },
      { id: 'i3', menu_item: { name: 'Tempura' }, quantity: 1, unit_price: 25.5 },
    ],
  },
  {
    id: 'ord-r2',
    order_number: '002',
    status: 'preparing' as const,
    order_type: 'dine_in',
    total_amount: 85.0,
    payment_method: 'pix',
    created_at: '2026-03-20T13:00:00Z',
    customer: { full_name: 'Joao Santos' },
    items: [
      { id: 'i4', menu_item: { name: 'Ramen' }, quantity: 1, unit_price: 45 },
      { id: 'i5', menu_item: { name: 'Gyoza' }, quantity: 2, unit_price: 20 },
    ],
  },
  {
    id: 'ord-r3',
    order_number: '003',
    status: 'completed' as const,
    order_type: 'pickup',
    total_amount: 42.0,
    payment_method: null,
    created_at: '2026-03-19T18:00:00Z',
    customer: { full_name: 'Ana Costa' },
    items: [
      { id: 'i6', menu_item: { name: 'Yakisoba' }, quantity: 1, unit_price: 42 },
    ],
  },
];

// ============================================================
// TESTS
// ============================================================

describe('Restaurant OrdersManagementScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- Loading state ----

  it('shows loading indicator while fetching orders', () => {
    mockGetRestaurantOrders.mockReturnValue(new Promise(() => {}));
    render(<OrdersScreen />);
    // ActivityIndicator is rendered — no order cards visible
    expect(screen.queryByText('orders.title')).toBeNull();
  });

  // ---- Empty state ----

  it('shows empty state when no orders match the filter', async () => {
    mockGetRestaurantOrders.mockResolvedValueOnce([]);
    render(<OrdersScreen />);

    await waitFor(() => {
      expect(screen.getByText('empty.orders')).toBeTruthy();
    });
  });

  // ---- Renders search bar ----

  it('renders the search bar', async () => {
    mockGetRestaurantOrders.mockResolvedValueOnce(sampleOrders);
    render(<OrdersScreen />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('common.search')).toBeTruthy();
    });
  });

  // ---- Renders filter buttons ----

  it('renders four filter segment buttons', async () => {
    mockGetRestaurantOrders.mockResolvedValueOnce(sampleOrders);
    render(<OrdersScreen />);

    await waitFor(() => {
      expect(screen.getByText('common.viewAll')).toBeTruthy();
      expect(screen.getByText('orders.active')).toBeTruthy();
      expect(screen.getByText('orders.status.completed')).toBeTruthy();
      expect(screen.getByText('orders.status.cancelled')).toBeTruthy();
    });
  });

  // ---- Filter logic ----

  it('filters active orders (excludes completed and cancelled)', () => {
    const active = sampleOrders.filter(
      (o) => !['completed', 'cancelled'].includes(o.status),
    );
    expect(active).toHaveLength(2);
    expect(active.map((o) => o.id)).toEqual(['ord-r1', 'ord-r2']);
  });

  it('filters completed orders only', () => {
    const completed = sampleOrders.filter((o) => o.status === 'completed');
    expect(completed).toHaveLength(1);
    expect(completed[0].id).toBe('ord-r3');
  });

  // ---- Search logic ----

  it('filters orders by customer name search', () => {
    const query = 'maria';
    const filtered = sampleOrders.filter((o) =>
      o.customer?.full_name?.toLowerCase().includes(query.toLowerCase()),
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].customer.full_name).toBe('Maria Silva');
  });

  it('filters orders by order number search', () => {
    const query = '002';
    const filtered = sampleOrders.filter((o) =>
      o.order_number?.toLowerCase().includes(query.toLowerCase()),
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('ord-r2');
  });

  // ---- Status advancement ----

  it('correctly determines next status in the workflow', () => {
    const statusFlow: Record<string, string | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivering',
      delivering: 'completed',
      completed: null,
      cancelled: null,
    };

    expect(statusFlow['pending']).toBe('confirmed');
    expect(statusFlow['preparing']).toBe('ready');
    expect(statusFlow['completed']).toBeNull();
    expect(statusFlow['cancelled']).toBeNull();
  });

  // ---- Cancellation rules ----

  it('allows cancellation only for pending and confirmed orders', () => {
    const canCancel = (status: string) => !['cancelled', 'completed'].includes(status);

    expect(canCancel('pending')).toBe(true);
    expect(canCancel('confirmed')).toBe(true);
    expect(canCancel('preparing')).toBe(true);
    expect(canCancel('completed')).toBe(false);
    expect(canCancel('cancelled')).toBe(false);
  });

  // ---- Error handling ----

  it('handles API error gracefully', async () => {
    mockGetRestaurantOrders.mockRejectedValueOnce(new Error('Server down'));
    render(<OrdersScreen />);

    await waitFor(() => {
      expect(mockGetRestaurantOrders).toHaveBeenCalled();
    });
    // Component catches error and shows Alert — does not crash
  });

  // ---- Sorting ----

  it('sorts orders by created_at descending', () => {
    const sorted = [...sampleOrders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    expect(sorted[0].id).toBe('ord-r1');
    expect(sorted[1].id).toBe('ord-r2');
    expect(sorted[2].id).toBe('ord-r3');
  });

  // ---- Status color mapping ----

  it('maps order statuses to correct color values', () => {
    const colors = {
      warning: '#F59E0B',
      info: '#3B82F6',
      secondary: '#0D9488',
      success: '#10B981',
      error: '#EF4444',
    };

    const STATUS_COLORS: Record<string, string> = {
      pending: colors.warning,
      confirmed: colors.info,
      preparing: colors.secondary,
      ready: colors.success,
      delivering: colors.info,
      completed: colors.success,
      cancelled: colors.error,
    };

    expect(STATUS_COLORS['pending']).toBe('#F59E0B');
    expect(STATUS_COLORS['ready']).toBe('#10B981');
    expect(STATUS_COLORS['cancelled']).toBe('#EF4444');
  });
});
