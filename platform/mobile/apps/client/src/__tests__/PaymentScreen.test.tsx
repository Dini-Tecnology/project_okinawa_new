/**
 * PaymentScreen Tests — Client App
 *
 * Validates loading state, order summary display, payment method selection,
 * new card form, and pay button behavior.
 *
 * @module apps/client/__tests__/PaymentScreen.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// ============================================================
// MOCKS
// ============================================================

const mockNavigate = vi.fn();
const mockGoBack = vi.fn();
const mockReset = vi.fn();

vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    reset: mockReset,
    setOptions: vi.fn(),
    addListener: vi.fn(),
  }),
  useRoute: () => ({
    params: { orderId: 'order-123' },
  }),
  useFocusEffect: vi.fn(),
}));

const mockGetOrder = vi.fn();
const mockGetWallet = vi.fn();
const mockGetPaymentMethods = vi.fn();
const mockProcessPayment = vi.fn();
const mockAddPaymentMethod = vi.fn();

vi.mock('@/shared/services/api', () => ({
  default: {
    getOrder: (...args: any[]) => mockGetOrder(...args),
    getWallet: (...args: any[]) => mockGetWallet(...args),
    getPaymentMethods: (...args: any[]) => mockGetPaymentMethods(...args),
    processPayment: (...args: any[]) => mockProcessPayment(...args),
    addPaymentMethod: (...args: any[]) => mockAddPaymentMethod(...args),
  },
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
    primaryForeground: '#FFFFFF',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  }),
}));

vi.mock('@/shared/hooks/useAnalytics', () => ({
  useScreenTracking: vi.fn(),
  useAnalytics: () => ({
    logPurchase: vi.fn(),
    logAddPaymentMethod: vi.fn(),
    logError: vi.fn(),
  }),
}));

vi.mock('@okinawa/shared/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import PaymentScreen from '../screens/payment/PaymentScreen';

// ============================================================
// TEST DATA
// ============================================================

const mockOrder = {
  id: 'order-123',
  restaurant_id: 'rest-1',
  subtotal_amount: 45.0,
  tax_amount: 4.5,
  tip_amount: 5.0,
  total_amount: 54.5,
  status: 'pending',
  items: [
    {
      id: 'item-1',
      menu_item: { name: 'Margherita Pizza', price: 25.0 },
      quantity: 1,
    },
    {
      id: 'item-2',
      menu_item: { name: 'Caesar Salad', price: 20.0 },
      quantity: 1,
    },
  ],
};

const mockWallet = { id: 'wallet-1', balance: 100.0 };

const mockPaymentMethodsList = [
  {
    id: 'pm-1',
    method_type: 'credit_card',
    card_last4: '4242',
    card_holder_name: 'John Doe',
    card_exp_month: '12',
    card_exp_year: '2027',
    is_default: true,
  },
];

// ============================================================
// TESTS
// ============================================================

describe('Client PaymentScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOrder.mockResolvedValue(mockOrder);
    mockGetWallet.mockResolvedValue(mockWallet);
    mockGetPaymentMethods.mockResolvedValue(mockPaymentMethodsList);
  });

  it('shows loading indicator while fetching data', () => {
    mockGetOrder.mockReturnValue(new Promise(() => {})); // never resolves
    render(<PaymentScreen />);
    expect(screen.getByText('Loading payment information...')).toBeTruthy();
  });

  it('displays order summary with item names and total after loading', async () => {
    render(<PaymentScreen />);

    await waitFor(() => {
      expect(screen.getByText('Order Summary')).toBeTruthy();
    });

    expect(screen.getByText(/Margherita Pizza/)).toBeTruthy();
    expect(screen.getByText(/Caesar Salad/)).toBeTruthy();
    expect(screen.getByText('$54.50')).toBeTruthy();
  });

  it('renders payment method radio options after loading', async () => {
    render(<PaymentScreen />);

    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeTruthy();
    });

    expect(screen.getByText('Saved Card')).toBeTruthy();
    expect(screen.getByText('New Card')).toBeTruthy();
    expect(screen.getByText('PIX')).toBeTruthy();
    expect(screen.getByText(/Cash/)).toBeTruthy();
  });

  it('displays saved card details with last 4 digits', async () => {
    render(<PaymentScreen />);

    await waitFor(() => {
      expect(screen.getByText('Select Card')).toBeTruthy();
    });

    expect(screen.getByText(/4242/)).toBeTruthy();
    expect(screen.getByText(/John Doe/)).toBeTruthy();
  });

  it('shows pay button with the correct total amount', async () => {
    render(<PaymentScreen />);

    await waitFor(() => {
      expect(screen.getByText('Pay $54.50')).toBeTruthy();
    });
  });
});
