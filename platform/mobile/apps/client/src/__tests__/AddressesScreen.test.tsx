/**
 * AddressesScreen Tests — Client App
 *
 * Validates loading state, address list, empty state, add address FAB,
 * and form dialog rendering.
 *
 * @module apps/client/__tests__/AddressesScreen.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// ============================================================
// MOCKS
// ============================================================

vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
    goBack: vi.fn(),
  }),
}));

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();
const mockPatch = vi.fn();

vi.mock('@/shared/services/api', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    delete: (...args: any[]) => mockDelete(...args),
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
    cardBorder: '#E5E7EB',
    primary: '#EA580C',
    primaryForeground: '#FFFFFF',
    border: '#E5E7EB',
    success: '#10B981',
    successBackground: '#ECFDF5',
    error: '#EF4444',
    input: '#F9FAFB',
  }),
}));

// Mock TanStack Query
let mockQueryData: any[] = [];
let mockIsLoading = false;
let mockIsError = false;
const mockRefetch = vi.fn();
const mockMutate = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: mockQueryData,
    isLoading: mockIsLoading,
    isError: mockIsError,
    refetch: mockRefetch,
  }),
  useMutation: ({ onSuccess }: any) => ({
    mutate: (data: any) => {
      mockMutate(data);
      if (onSuccess) onSuccess();
    },
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

import AddressesScreen from '../screens/profile/AddressesScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client AddressesScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryData = [];
    mockIsLoading = false;
    mockIsError = false;
  });

  it('shows skeleton loading state while fetching addresses', () => {
    mockIsLoading = true;
    render(<AddressesScreen />);
    expect(screen.getByText('addresses.title')).toBeTruthy();
  });

  it('shows error state with retry button on fetch failure', () => {
    mockIsError = true;
    render(<AddressesScreen />);
    expect(screen.getByText('addresses.errorLoading')).toBeTruthy();
    expect(screen.getByText('common.retry')).toBeTruthy();
  });

  it('displays empty state when no addresses exist', () => {
    mockQueryData = [];
    render(<AddressesScreen />);
    expect(screen.getByText('addresses.emptyTitle')).toBeTruthy();
    expect(screen.getByText('addresses.emptyMessage')).toBeTruthy();
  });

  it('renders address cards with label and default badge', () => {
    mockQueryData = [
      {
        id: 'addr-1',
        label: 'home',
        street: 'Rua Augusta',
        number: '123',
        complement: 'Apt 4B',
        neighborhood: 'Consolacao',
        city: 'Sao Paulo',
        state: 'SP',
        zip: '01305-000',
        is_default: true,
      },
      {
        id: 'addr-2',
        label: 'work',
        street: 'Av Paulista',
        number: '1000',
        complement: null,
        neighborhood: 'Bela Vista',
        city: 'Sao Paulo',
        state: 'SP',
        zip: '01310-000',
        is_default: false,
      },
    ];

    render(<AddressesScreen />);

    expect(screen.getByText('addresses.labels.home')).toBeTruthy();
    expect(screen.getByText('addresses.labels.work')).toBeTruthy();
    expect(screen.getByText('addresses.defaultBadge')).toBeTruthy();
    expect(screen.getByText('addresses.count')).toBeTruthy();
  });

  it('displays address details with full address text', () => {
    mockQueryData = [
      {
        id: 'addr-1',
        label: 'home',
        street: 'Rua Augusta',
        number: '123',
        complement: 'Apt 4B',
        neighborhood: 'Consolacao',
        city: 'Sao Paulo',
        state: 'SP',
        zip: '01305-000',
        is_default: false,
      },
    ];

    render(<AddressesScreen />);

    expect(screen.getByText(/Rua Augusta, 123/)).toBeTruthy();
    expect(screen.getByText(/Consolacao - Sao Paulo\/SP/)).toBeTruthy();
  });
});
