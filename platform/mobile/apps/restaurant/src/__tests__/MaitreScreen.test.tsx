/**
 * MaitreScreen (FloorFlowScreen) Tests — Restaurant App
 *
 * Validates floor plan rendering, table status grid, legend,
 * and table detail modal.
 *
 * @module apps/restaurant/__tests__/MaitreScreen.test
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
}));

vi.mock('@/shared/services/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock TanStack Query
let mockQueryData: any[] = [];
let mockIsLoading = false;
const mockRefetch = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: mockQueryData,
    isLoading: mockIsLoading,
    isError: false,
    refetch: mockRefetch,
    isRefetching: false,
  }),
}));

import FloorFlowScreen from '../screens/maitre/FloorFlowScreen';

// ============================================================
// TESTS
// ============================================================

describe('Restaurant MaitreScreen (FloorFlowScreen)', () => {
  const mockTables = [
    {
      id: 'table-1',
      number: 1,
      status: 'free',
      capacity: 4,
      section: 'main',
      current_occupants: 0,
    },
    {
      id: 'table-2',
      number: 2,
      status: 'occupied',
      capacity: 6,
      section: 'main',
      current_occupants: 4,
      seated_at: '2026-03-23T19:00:00Z',
      guest_name: 'Maria',
      order_total: 120.0,
    },
    {
      id: 'table-3',
      number: 3,
      status: 'reserved',
      capacity: 2,
      section: 'terrace',
      current_occupants: 0,
    },
    {
      id: 'table-4',
      number: 4,
      status: 'billing',
      capacity: 4,
      section: 'main',
      current_occupants: 3,
      order_total: 250.0,
    },
    {
      id: 'table-5',
      number: 5,
      status: 'dirty',
      capacity: 4,
      section: 'terrace',
      current_occupants: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryData = mockTables;
    mockIsLoading = false;
  });

  it('renders the floor plan title', () => {
    render(<FloorFlowScreen />);
    expect(screen.getByText('maitre.floorPlan.title')).toBeTruthy();
  });

  it('renders table grid with table numbers', () => {
    render(<FloorFlowScreen />);

    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('renders the status legend at the bottom', () => {
    render(<FloorFlowScreen />);

    expect(screen.getByText('maitre.floorPlan.legend.free')).toBeTruthy();
    expect(screen.getByText('maitre.floorPlan.legend.occupied')).toBeTruthy();
    expect(screen.getByText('maitre.floorPlan.legend.reserved')).toBeTruthy();
    expect(screen.getByText('maitre.floorPlan.legend.billing')).toBeTruthy();
    expect(screen.getByText('maitre.floorPlan.legend.dirty')).toBeTruthy();
  });

  it('displays table count summary', () => {
    render(<FloorFlowScreen />);

    expect(screen.getByText(/maitre.floorPlan.summary/)).toBeTruthy();
  });
});
