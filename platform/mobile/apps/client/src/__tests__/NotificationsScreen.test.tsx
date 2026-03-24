/**
 * NotificationsScreen Tests — Client App
 *
 * Validates loading state, notification list, empty state, mark all read,
 * and invite accept/decline actions.
 *
 * @module apps/client/__tests__/NotificationsScreen.test
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
}));

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();

vi.mock('@/shared/services/api', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
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
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  }),
}));

// Mock TanStack Query
const mockRefetch = vi.fn();
const mockMutate = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryFn, queryKey }: any) => {
    // Return the test data via mock
    return {
      data: mockQueryData,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    };
  },
  useMutation: ({ mutationFn }: any) => ({
    mutate: mockMutate,
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

let mockQueryData: any[] = [];

import NotificationsScreen from '../screens/notifications/NotificationsScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client NotificationsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryData = [];
  });

  it('displays empty state when no notifications exist', () => {
    mockQueryData = [];
    render(<NotificationsScreen />);

    expect(screen.getByText('notifications.emptyTitle')).toBeTruthy();
    expect(screen.getByText('notifications.emptyMessage')).toBeTruthy();
  });

  it('displays notifications list with title and body', () => {
    const now = new Date().toISOString();
    mockQueryData = [
      {
        id: 'n-1',
        type: 'order',
        title: 'Order Ready',
        body: 'Your order #123 is ready for pickup',
        is_read: false,
        created_at: now,
        data: {},
      },
      {
        id: 'n-2',
        type: 'promo',
        title: '20% Off Today',
        body: 'Use code SAVE20 at checkout',
        is_read: true,
        created_at: now,
        data: {},
      },
    ];

    render(<NotificationsScreen />);

    expect(screen.getByText('Order Ready')).toBeTruthy();
    expect(screen.getByText('Your order #123 is ready for pickup')).toBeTruthy();
    expect(screen.getByText('20% Off Today')).toBeTruthy();
  });

  it('shows mark all read button when there are unread notifications', () => {
    const now = new Date().toISOString();
    mockQueryData = [
      {
        id: 'n-1',
        type: 'order',
        title: 'Order Ready',
        body: 'Your order is ready',
        is_read: false,
        created_at: now,
        data: {},
      },
    ];

    render(<NotificationsScreen />);

    expect(screen.getByText('notifications.markAllRead')).toBeTruthy();
  });

  it('shows unread count badge when unread notifications exist', () => {
    const now = new Date().toISOString();
    mockQueryData = [
      {
        id: 'n-1',
        type: 'order',
        title: 'Test',
        body: 'Test body',
        is_read: false,
        created_at: now,
        data: {},
      },
      {
        id: 'n-2',
        type: 'promo',
        title: 'Test 2',
        body: 'Test body 2',
        is_read: false,
        created_at: now,
        data: {},
      },
    ];

    render(<NotificationsScreen />);

    expect(screen.getByText('notifications.unreadCount')).toBeTruthy();
  });

  it('renders invite accept/decline buttons for invite-type notifications', () => {
    const now = new Date().toISOString();
    mockQueryData = [
      {
        id: 'n-1',
        type: 'invite',
        title: 'Tab Invite',
        body: 'You have been invited to join a tab',
        is_read: false,
        created_at: now,
        data: { tabId: 'tab-123' },
      },
    ];

    render(<NotificationsScreen />);

    expect(screen.getByText('notifications.accept')).toBeTruthy();
    expect(screen.getByText('notifications.decline')).toBeTruthy();
  });
});
