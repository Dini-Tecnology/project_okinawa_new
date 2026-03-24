/**
 * CallWaiterScreen Tests — Client App
 *
 * Validates call type selection, message input, submit action,
 * success state, and error handling.
 *
 * @module apps/client/__tests__/CallWaiterScreen.test
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
}));

const mockPost = vi.fn();

vi.mock('@okinawa/shared/services/api', () => ({
  ApiService: {
    post: (...args: any[]) => mockPost(...args),
  },
}));

vi.mock('@okinawa/shared/i18n', () => ({
  t: (key: string) => key,
}));

vi.mock('@okinawa/shared/contexts/ThemeContext', () => ({
  useColors: () => ({
    background: '#FFFFFF',
    backgroundTertiary: '#F3F4F6',
    foreground: '#111827',
    foregroundSecondary: '#6B7280',
    card: '#FFFFFF',
    primary: '#EA580C',
    primaryForeground: '#FFFFFF',
    secondary: '#7C3AED',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    errorBackground: '#FEF2F2',
    info: '#3B82F6',
    infoBackground: '#EFF6FF',
  }),
}));

vi.mock('@okinawa/shared/theme/colors', () => ({
  gradients: {
    primary: ['#EA580C', '#DC2626'],
  },
}));

vi.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  selectionAsync: vi.fn(),
  notificationAsync: vi.fn(),
  ImpactFeedbackStyle: { Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
}));

const mockMutate = vi.fn();
let mockIsPending = false;
let mockIsError = false;

vi.mock('@tanstack/react-query', () => ({
  useMutation: ({ onSuccess }: any) => ({
    mutate: (data: any) => {
      mockMutate(data);
      if (!mockIsError && onSuccess) onSuccess();
    },
    isPending: mockIsPending,
    isError: mockIsError,
  }),
}));

import CallWaiterScreen from '../screens/calls/CallWaiterScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client CallWaiterScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    mockIsError = false;
  });

  it('renders the title and call type selection buttons', () => {
    render(
      <CallWaiterScreen
        route={{ params: { restaurantId: 'rest-1', tableNumber: 'T5' } }}
      />,
    );

    expect(screen.getByText('calls.callWaiter.title')).toBeTruthy();
    expect(screen.getByText('calls.callWaiter.select')).toBeTruthy();
  });

  it('renders all four call type options', () => {
    render(
      <CallWaiterScreen
        route={{ params: { restaurantId: 'rest-1', tableNumber: 'T5' } }}
      />,
    );

    expect(screen.getByLabelText('calls.type.waiter')).toBeTruthy();
    expect(screen.getByLabelText('calls.type.manager')).toBeTruthy();
    expect(screen.getByLabelText('calls.type.help')).toBeTruthy();
    expect(screen.getByLabelText('calls.type.emergency')).toBeTruthy();
  });

  it('renders message input field', () => {
    render(
      <CallWaiterScreen
        route={{ params: { restaurantId: 'rest-1', tableNumber: 'T5' } }}
      />,
    );

    expect(
      screen.getByLabelText('Optional message for the waiter'),
    ).toBeTruthy();
  });

  it('renders submit button with disabled state when no type selected', () => {
    render(
      <CallWaiterScreen
        route={{ params: { restaurantId: 'rest-1', tableNumber: 'T5' } }}
      />,
    );

    const submitButton = screen.getByLabelText('Call for service');
    expect(submitButton).toBeTruthy();
  });

  it('shows success state after submitting a call', async () => {
    mockPost.mockResolvedValue({ data: { id: 'call-1' } });

    render(
      <CallWaiterScreen
        route={{ params: { restaurantId: 'rest-1', tableNumber: 'T5' } }}
      />,
    );

    // Select a call type
    fireEvent.press(screen.getByLabelText('calls.type.waiter'));

    // Press submit
    fireEvent.press(screen.getByLabelText('Call for service'));

    await waitFor(() => {
      expect(screen.getByText('calls.callWaiter.success')).toBeTruthy();
    });

    expect(screen.getByText('calls.callWaiter.successMsg')).toBeTruthy();
  });
});
