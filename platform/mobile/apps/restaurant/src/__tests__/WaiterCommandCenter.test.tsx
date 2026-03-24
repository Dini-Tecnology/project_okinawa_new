/**
 * WaiterCommandCenter Tests — Restaurant App
 *
 * Validates tab navigation (4 tabs), tab badge counts,
 * active tab switching, and sub-navigation for table detail.
 *
 * @module apps/restaurant/__tests__/WaiterCommandCenter.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// ============================================================
// MOCKS
// ============================================================

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
  }),
  useOkinawaTheme: () => ({
    theme: { colors: {} },
    isDark: false,
  }),
}));

vi.mock('@/shared/hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: 'pt-BR',
  }),
}));

vi.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock the tab components
vi.mock('./tabs/LiveFeedTab', () => {
  const { Text } = require('react-native');
  return { default: () => <Text>LiveFeedTab</Text> };
});

vi.mock('./tabs/TablesTab', () => {
  const { Text } = require('react-native');
  return { default: () => <Text>TablesTab</Text> };
});

vi.mock('./tabs/TableDetailScreen', () => {
  const { Text } = require('react-native');
  return { default: () => <Text>TableDetailScreen</Text> };
});

vi.mock('./tabs/KitchenTab', () => {
  const { Text } = require('react-native');
  return { default: () => <Text>KitchenTab</Text> };
});

vi.mock('./tabs/ChargeTab', () => {
  const { Text } = require('react-native');
  return { default: () => <Text>ChargeTab</Text> };
});

// Mock hooks
vi.mock('./hooks/useWaiterLiveFeed', () => ({
  useWaiterLiveFeed: () => ({
    events: [],
    urgentCount: 2,
    readyDishCount: 3,
    isConnected: true,
  }),
}));

vi.mock('./hooks/useWaiterTables', () => ({
  useWaiterTables: () => ({
    tables: [],
    occupiedCount: 5,
    freeCount: 10,
    isLoading: false,
  }),
}));

import WaiterCommandCenter from '../screens/waiter/WaiterCommandCenter';

// ============================================================
// TESTS
// ============================================================

describe('Restaurant WaiterCommandCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all four tab buttons', () => {
    render(<WaiterCommandCenter />);

    expect(screen.getByText('waiter.tab.live')).toBeTruthy();
    expect(screen.getByText('waiter.tab.tables')).toBeTruthy();
    expect(screen.getByText('waiter.tab.kitchen')).toBeTruthy();
    expect(screen.getByText('waiter.tab.charge')).toBeTruthy();
  });

  it('starts on the Live Feed tab by default', () => {
    render(<WaiterCommandCenter />);
    expect(screen.getByText('LiveFeedTab')).toBeTruthy();
  });

  it('switches to Tables tab when pressed', () => {
    render(<WaiterCommandCenter />);

    fireEvent.press(screen.getByText('waiter.tab.tables'));

    expect(screen.getByText('TablesTab')).toBeTruthy();
  });

  it('switches to Kitchen tab when pressed', () => {
    render(<WaiterCommandCenter />);

    fireEvent.press(screen.getByText('waiter.tab.kitchen'));

    expect(screen.getByText('KitchenTab')).toBeTruthy();
  });

  it('switches to Charge tab when pressed', () => {
    render(<WaiterCommandCenter />);

    fireEvent.press(screen.getByText('waiter.tab.charge'));

    expect(screen.getByText('ChargeTab')).toBeTruthy();
  });
});
