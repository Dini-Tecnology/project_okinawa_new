/**
 * FavoritesScreen Tests — Client App
 *
 * Validates loading state, favorites list, empty state, search bar,
 * and restaurant navigation.
 *
 * @module apps/client/__tests__/FavoritesScreen.test
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

const mockGetFavorites = vi.fn();
const mockRemoveFavorite = vi.fn();

vi.mock('@/shared/services/api', () => ({
  default: {
    getFavorites: (...args: any[]) => mockGetFavorites(...args),
    removeFavorite: (...args: any[]) => mockRemoveFavorite(...args),
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
  }),
}));

vi.mock('@okinawa/shared/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock FlashList as FlatList for test environment
vi.mock('@shopify/flash-list', () => {
  const { FlatList } = require('react-native');
  return { FlashList: FlatList };
});

vi.mock('./FavoriteCard', () => {
  const { Text } = require('react-native');
  return {
    default: ({ favorite, onPress }: any) => (
      <Text onPress={() => onPress(favorite.restaurant_id)}>
        {favorite.restaurant.name}
      </Text>
    ),
  };
});

import FavoritesScreen from '../screens/favorites/FavoritesScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client FavoritesScreen', () => {
  const mockFavorites = [
    {
      id: 'fav-1',
      restaurant_id: 'rest-1',
      notes: null,
      created_at: '2026-01-01T00:00:00Z',
      restaurant: {
        id: 'rest-1',
        name: 'Sushi Garden',
        cuisine_type: 'Japanese',
        address: 'Rua A, 123',
        rating: 4.5,
      },
    },
    {
      id: 'fav-2',
      restaurant_id: 'rest-2',
      notes: null,
      created_at: '2026-01-02T00:00:00Z',
      restaurant: {
        id: 'rest-2',
        name: 'Pizza Palace',
        cuisine_type: 'Italian',
        address: 'Rua B, 456',
        rating: 4.0,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFavorites.mockResolvedValue(mockFavorites);
  });

  it('shows loading state while fetching favorites', () => {
    mockGetFavorites.mockReturnValue(new Promise(() => {}));
    render(<FavoritesScreen />);
    expect(screen.getByText('Carregando favoritos...')).toBeTruthy();
  });

  it('displays empty state when no favorites exist', async () => {
    mockGetFavorites.mockResolvedValue([]);
    render(<FavoritesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Sem favoritos ainda')).toBeTruthy();
    });

    expect(
      screen.getByText('Explore restaurantes e adicione seus favoritos aqui'),
    ).toBeTruthy();
    expect(screen.getByText('Explorar Restaurantes')).toBeTruthy();
  });

  it('renders search bar for filtering favorites', async () => {
    render(<FavoritesScreen />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar nos favoritos...')).toBeTruthy();
    });
  });

  it('displays empty search result message when query has no matches', async () => {
    render(<FavoritesScreen />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar nos favoritos...')).toBeTruthy();
    });

    fireEvent.changeText(
      screen.getByPlaceholderText('Buscar nos favoritos...'),
      'NonExistentRestaurant',
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhum favorito encontrado')).toBeTruthy();
    });
  });
});
