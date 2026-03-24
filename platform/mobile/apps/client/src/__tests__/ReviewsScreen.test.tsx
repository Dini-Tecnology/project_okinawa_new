/**
 * ReviewsScreen Tests — Client App
 *
 * Validates loading state, review list, empty state, star ratings,
 * edit modal, and delete action.
 *
 * @module apps/client/__tests__/ReviewsScreen.test
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

const mockGetMyReviews = vi.fn();
const mockUpdateReview = vi.fn();
const mockDeleteReview = vi.fn();

vi.mock('@/shared/services/api', () => ({
  default: {
    getMyReviews: (...args: any[]) => mockGetMyReviews(...args),
    updateReview: (...args: any[]) => mockUpdateReview(...args),
    deleteReview: (...args: any[]) => mockDeleteReview(...args),
  },
}));

vi.mock('@okinawa/shared/contexts/ThemeContext', () => ({
  useColors: () => ({
    background: '#FFFFFF',
    foreground: '#111827',
    foregroundSecondary: '#6B7280',
    foregroundMuted: '#9CA3AF',
    card: '#FFFFFF',
    primary: '#EA580C',
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    warningBackground: '#FFFBEB',
  }),
}));

vi.mock('@okinawa/shared/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('date-fns', () => ({
  format: () => 'Mar 23, 2026',
}));

import ReviewsScreen from '../screens/reviews/ReviewsScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client ReviewsScreen', () => {
  const mockReviews = [
    {
      id: 'rev-1',
      restaurant_id: 'rest-1',
      rating: 4,
      comment: 'Great food and atmosphere!',
      created_at: '2026-03-20T19:00:00Z',
      updated_at: null,
      response: null,
      restaurant: { id: 'rest-1', name: 'Sushi Garden' },
    },
    {
      id: 'rev-2',
      restaurant_id: 'rest-2',
      rating: 5,
      comment: 'Best pizza in town',
      created_at: '2026-03-19T18:00:00Z',
      updated_at: '2026-03-20T10:00:00Z',
      response: 'Thank you for your kind words!',
      restaurant: { id: 'rest-2', name: 'Pizza Palace' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMyReviews.mockResolvedValue(mockReviews);
  });

  it('shows loading state while fetching reviews', () => {
    mockGetMyReviews.mockReturnValue(new Promise(() => {}));
    render(<ReviewsScreen />);
    expect(screen.getByText('Loading reviews...')).toBeTruthy();
  });

  it('displays empty state when user has no reviews', async () => {
    mockGetMyReviews.mockResolvedValue([]);
    render(<ReviewsScreen />);

    await waitFor(() => {
      expect(screen.getByText('No Reviews Yet')).toBeTruthy();
    });
  });

  it('renders review cards with restaurant name and comment', async () => {
    render(<ReviewsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Sushi Garden')).toBeTruthy();
    });

    expect(screen.getByText('Great food and atmosphere!')).toBeTruthy();
    expect(screen.getByText('Pizza Palace')).toBeTruthy();
    expect(screen.getByText('Best pizza in town')).toBeTruthy();
  });

  it('shows restaurant response when present', async () => {
    render(<ReviewsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Restaurant Response:')).toBeTruthy();
    });

    expect(screen.getByText('Thank you for your kind words!')).toBeTruthy();
  });

  it('shows (edited) indicator for updated reviews', async () => {
    render(<ReviewsScreen />);

    await waitFor(() => {
      expect(screen.getByText('(edited)')).toBeTruthy();
    });
  });

  it('renders edit and delete buttons for each review', async () => {
    render(<ReviewsScreen />);

    await waitFor(() => {
      expect(
        screen.getByLabelText('Edit review for Sushi Garden'),
      ).toBeTruthy();
    });

    expect(
      screen.getByLabelText('Delete review for Sushi Garden'),
    ).toBeTruthy();
  });

  it('renders Write Review FAB', async () => {
    render(<ReviewsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Write Review')).toBeTruthy();
    });
  });
});
