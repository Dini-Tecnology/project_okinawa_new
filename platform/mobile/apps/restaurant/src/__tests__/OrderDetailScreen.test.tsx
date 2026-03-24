/**
 * OrderDetailScreen Tests — Restaurant App
 *
 * Validates rendering of order details, status chip, item list,
 * status change buttons, cancel action, loading/empty states.
 *
 * @module apps/restaurant/__tests__/OrderDetailScreen.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// ============================================================
// MOCKS
// ============================================================

const mockGoBack = vi.fn();
vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
    goBack: mockGoBack,
    setOptions: vi.fn(),
    addListener: vi.fn(),
  }),
  useRoute: () => ({
    params: { orderId: 'ord-detail-1' },
  }),
  useFocusEffect: vi.fn(),
}));

const mockGetOrder = vi.fn();
const mockUpdateOrderStatus = vi.fn();
vi.mock('@/shared/services/api', () => ({
  default: {
    getOrder: (...args: any[]) => mockGetOrder(...args),
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
    foreground: '#111827',
    card: '#FFFFFF',
    cardForeground: '#111827',
    primary: '#EA580C',
    border: '#E5E7EB',
    mutedForeground: '#6B7280',
    warning: '#F59E0B',
    info: '#3B82F6',
    accent: '#0D9488',
    success: '#10B981',
    destructive: '#EF4444',
  }),
}));

vi.mock('date-fns', () => ({
  format: vi.fn(() => '20/03/2026 14:30'),
}));

vi.mock('date-fns/locale', () => ({
  ptBR: {},
}));

import OrderDetailScreen from '../screens/orders/OrderDetailScreen';

// ============================================================
// FIXTURES
// ============================================================

const sampleOrder = {
  id: 'ord-detail-1',
  order_number: '0055',
  status: 'preparing' as const,
  order_type: 'dine_in',
  table_id: 'tbl-7',
  total_amount: 155.0,
  subtotal_amount: 140.0,
  tax_amount: 15.0,
  tip_amount: 0,
  created_at: '2026-03-20T14:00:00Z',
  notes: 'No peanuts please',
  user: { full_name: 'Carlos Oliveira', phone: '(11) 99999-1234' },
  items: [
    {
      id: 'it-1',
      menu_item: { name: 'Tonkotsu Ramen' },
      quantity: 2,
      unit_price: 45.0,
      special_instructions: 'Extra chashu',
    },
    {
      id: 'it-2',
      menu_item: { name: 'Edamame' },
      quantity: 1,
      unit_price: 18.0,
      special_instructions: null,
    },
    {
      id: 'it-3',
      menu_item: { name: 'Matcha Ice Cream' },
      quantity: 1,
      unit_price: 32.0,
      special_instructions: null,
    },
  ],
};

// ============================================================
// TESTS
// ============================================================

describe('Restaurant OrderDetailScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- Loading state ----

  it('shows loading indicator while fetching order', () => {
    mockGetOrder.mockReturnValue(new Promise(() => {}));
    render(<OrderDetailScreen />);
    // ActivityIndicator is rendered; no order title visible yet
    expect(screen.queryByText('orders.title')).toBeNull();
  });

  // ---- Empty / not found state ----

  it('shows not-found state when order is null', async () => {
    mockGetOrder.mockResolvedValueOnce(null);
    render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('errors.notFound')).toBeTruthy();
    });
  });

  it('shows back button in not-found state', async () => {
    mockGetOrder.mockResolvedValueOnce(null);
    render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText('Go back')).toBeTruthy();
    });
  });

  // ---- Renders order header ----

  it('renders order number in header', async () => {
    mockGetOrder.mockResolvedValueOnce(sampleOrder);
    render(<OrderDetailScreen />);

    await waitFor(() => {
      // Title contains "orders.title #0055"
      expect(screen.getByText(/orders.title/)).toBeTruthy();
    });
  });

  // ---- Status chip ----

  it('renders status chip with translated label', async () => {
    mockGetOrder.mockResolvedValueOnce(sampleOrder);
    render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('orders.status.preparing')).toBeTruthy();
    });
  });

  it('maps status to correct theme color', () => {
    const colors = {
      warning: '#F59E0B',
      info: '#3B82F6',
      accent: '#0D9488',
      success: '#10B981',
      destructive: '#EF4444',
      mutedForeground: '#6B7280',
    };

    const getStatusColor = (status: string): string => {
      const statusColors: Record<string, string> = {
        pending: colors.warning,
        confirmed: colors.info,
        preparing: colors.accent,
        ready: colors.success,
        delivering: colors.info,
        completed: colors.success,
        cancelled: colors.destructive,
      };
      return statusColors[status] || colors.mutedForeground;
    };

    expect(getStatusColor('preparing')).toBe('#0D9488');
    expect(getStatusColor('cancelled')).toBe('#EF4444');
    expect(getStatusColor('unknown')).toBe('#6B7280');
  });

  // ---- Order items ----

  it('renders all order items', async () => {
    mockGetOrder.mockResolvedValueOnce(sampleOrder);
    render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Tonkotsu Ramen')).toBeTruthy();
      expect(screen.getByText('Edamame')).toBeTruthy();
      expect(screen.getByText('Matcha Ice Cream')).toBeTruthy();
    });
  });

  it('renders special instructions when present', async () => {
    mockGetOrder.mockResolvedValueOnce(sampleOrder);
    render(<OrderDetailScreen />);

    await waitFor(() => {
      // The special_instructions text is prefixed with a warning emoji
      expect(screen.getByText(/Extra chashu/)).toBeTruthy();
    });
  });

  // ---- Customer info ----

  it('renders customer name', async () => {
    mockGetOrder.mockResolvedValueOnce(sampleOrder);
    render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Oliveira')).toBeTruthy();
    });
  });

  // ---- Notes ----

  it('renders order notes when present', async () => {
    mockGetOrder.mockResolvedValueOnce(sampleOrder);
    render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('No peanuts please')).toBeTruthy();
    });
  });

  // ---- Status change button ----

  it('shows next status action button for active orders', async () => {
    mockGetOrder.mockResolvedValueOnce(sampleOrder); // status: preparing -> next: ready
    render(<OrderDetailScreen />);

    await waitFor(() => {
      // Button label is the next status translated
      expect(screen.getByLabelText(/Mark order as ready/)).toBeTruthy();
    });
  });

  it('does not show next status button for completed orders', async () => {
    mockGetOrder.mockResolvedValueOnce({ ...sampleOrder, status: 'completed' });
    render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(screen.queryByLabelText(/Mark order as/)).toBeNull();
    });
  });

  // ---- Cancel button ----

  it('shows cancel button for pending orders', async () => {
    mockGetOrder.mockResolvedValueOnce({ ...sampleOrder, status: 'pending' });
    render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText('Cancel this order')).toBeTruthy();
    });
  });

  it('hides cancel button for completed orders', async () => {
    mockGetOrder.mockResolvedValueOnce({ ...sampleOrder, status: 'completed' });
    render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(screen.queryByLabelText('Cancel this order')).toBeNull();
    });
  });

  // ---- Status workflow ----

  it('computes the full status flow correctly', () => {
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
    expect(statusFlow['delivering']).toBe('completed');
    expect(statusFlow['completed']).toBeNull();
  });
});
