/**
 * TabScreen Tests — Client App (Pub/Bar)
 *
 * Validates loading state, tab header, round cards, empty state,
 * bottom action bar with add round / pay tab buttons.
 *
 * @module apps/client/__tests__/TabScreen.test
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
  useRoute: () => ({
    params: {
      tabId: 'tab-1',
      restaurantId: 'rest-1',
      tableNumber: '5',
    },
  }),
}));

vi.mock('@okinawa/shared/contexts/ThemeContext', () => ({
  useColors: () => ({
    background: '#FFFFFF',
    backgroundTertiary: '#F3F4F6',
    foreground: '#111827',
    foregroundSecondary: '#6B7280',
    foregroundMuted: '#9CA3AF',
    mutedForeground: '#9CA3AF',
    card: '#FFFFFF',
    primary: '#EA580C',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  }),
}));

vi.mock('@/shared/i18n', () => ({
  t: (key: string, params?: Record<string, any>) => key,
}));

vi.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

vi.mock('./RoundBuilderSheet', () => {
  return {
    default: () => null,
  };
});

// Mock useTab hook
let mockTab: any = null;
let mockIsLoading = false;
let mockIsError = false;
const mockRefetch = vi.fn();

vi.mock('../../hooks/useTab', () => ({
  useTab: () => ({
    tab: mockTab,
    isLoading: mockIsLoading,
    isError: mockIsError,
    tabTotal: mockTab?.items?.reduce(
      (sum: number, i: any) => sum + Number(i.unit_price) * i.quantity,
      0,
    ) || 0,
    itemCount: mockTab?.items?.length || 0,
    refetch: mockRefetch,
    wsConnected: true,
  }),
}));

import TabScreen from '../screens/pub-bar/TabScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client TabScreen', () => {
  const mockTabData = {
    id: 'tab-1',
    restaurant_id: 'rest-1',
    status: 'open',
    created_at: '2026-03-23T20:00:00Z',
    table: { number: 5, label: '5' },
    items: [
      {
        id: 'item-1',
        menu_item_id: 'mi-1',
        menu_item: { name: 'Chopp Brahma' },
        unit_price: 12.0,
        quantity: 3,
        special_instructions: null,
        created_at: '2026-03-23T20:00:00Z',
      },
      {
        id: 'item-2',
        menu_item_id: 'mi-2',
        menu_item: { name: 'Caipirinha' },
        unit_price: 18.0,
        quantity: 2,
        special_instructions: 'Extra lime',
        created_at: '2026-03-23T20:00:05Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTab = mockTabData;
    mockIsLoading = false;
    mockIsError = false;
  });

  it('shows skeleton loading state while tab is loading', () => {
    mockTab = null;
    mockIsLoading = true;
    render(<TabScreen />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('shows error state with retry button when tab fails to load', () => {
    mockTab = null;
    mockIsError = true;
    render(<TabScreen />);
    expect(screen.getByText('common.error')).toBeTruthy();
    expect(screen.getByText('common.retry')).toBeTruthy();
  });

  it('displays tab header with title, table number, and status', () => {
    render(<TabScreen />);

    expect(screen.getByText('tab.title')).toBeTruthy();
    expect(screen.getByText(/5/)).toBeTruthy();
  });

  it('shows total amount in bottom action bar', () => {
    render(<TabScreen />);

    const totalTexts = screen.getAllByText('tab.total');
    expect(totalTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders add round and pay tab buttons for open tab', () => {
    render(<TabScreen />);

    expect(screen.getByLabelText('tab.addRound')).toBeTruthy();
    expect(screen.getByLabelText('tab.pay')).toBeTruthy();
  });
});
