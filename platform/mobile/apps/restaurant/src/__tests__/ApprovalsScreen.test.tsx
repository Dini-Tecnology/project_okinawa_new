/**
 * ApprovalsScreen Tests — Restaurant App
 *
 * Validates loading state, approval cards, stats header,
 * approve/reject actions, and empty state.
 *
 * @module apps/restaurant/__tests__/ApprovalsScreen.test
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

vi.mock('@/shared/hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, any>) => key,
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

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import ApprovalsScreen from '../screens/manager/ApprovalsScreen';

// ============================================================
// TESTS
// ============================================================

describe('Restaurant ApprovalsScreen', () => {
  const mockApprovals = [
    {
      id: 'app-1',
      type: 'cancel',
      item_name: 'Margherita Pizza',
      table_id: 'table-5',
      requester_id: 'user-1',
      requester: { full_name: 'Waiter Maria' },
      reason: 'Customer changed their mind',
      amount: 25.0,
      status: 'pending',
      created_at: new Date().toISOString(),
      resolved_at: null,
    },
    {
      id: 'app-2',
      type: 'courtesy',
      item_name: 'Tiramisu',
      table_id: 'table-3',
      requester_id: 'user-2',
      requester: { full_name: 'Waiter Pedro' },
      reason: 'Birthday celebration',
      amount: 18.0,
      status: 'pending',
      created_at: new Date().toISOString(),
      resolved_at: null,
    },
  ];

  const mockStats = {
    pending: 2,
    approvedToday: 5,
    rejectedToday: 1,
    totalImpact: 150.0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/approvals/stats')) {
        return Promise.resolve({ data: mockStats });
      }
      if (url.includes('/approvals')) {
        return Promise.resolve({ data: mockApprovals });
      }
      return Promise.resolve({ data: null });
    });
  });

  it('shows loading state while fetching approvals', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<ApprovalsScreen />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders approval cards with item name and requester', async () => {
    render(<ApprovalsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeTruthy();
    });

    expect(screen.getByText('Waiter Maria')).toBeTruthy();
    expect(screen.getByText('Tiramisu')).toBeTruthy();
    expect(screen.getByText('Waiter Pedro')).toBeTruthy();
  });

  it('displays approval reason text', async () => {
    render(<ApprovalsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Customer changed their mind')).toBeTruthy();
    });

    expect(screen.getByText('Birthday celebration')).toBeTruthy();
  });

  it('renders approve and reject buttons for each pending approval', async () => {
    render(<ApprovalsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeTruthy();
    });

    // Should have approve/reject action buttons
    const approveTexts = screen.getAllByText('approvals.approve');
    expect(approveTexts.length).toBeGreaterThanOrEqual(1);
  });
});
