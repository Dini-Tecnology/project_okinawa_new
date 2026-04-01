import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, Alert } from 'react-native';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import {
  Text,
  Button,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '@/shared/services/api';
import FavoriteCard from './FavoriteCard';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import logger from '@okinawa/shared/utils/logger';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  address: string;
  rating: number;
  image_url?: string;
}

interface Favorite {
  id: string;
  restaurant_id: string;
  notes?: string;
  created_at: string;
  restaurant: Restaurant;
}

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const filteredFavorites = useMemo(() => {
    if (searchQuery) {
      return favorites.filter((fav) =>
        fav.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fav.restaurant.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return favorites;
  }, [searchQuery, favorites]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getFavorites();
      setFavorites(data);
    } catch (error) {
      logger.error('Failed to load favorites:', error);
      Alert.alert('Erro', 'Não foi possível carregar os favoritos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, []);

  const handleRemoveFavorite = useCallback(async (restaurantId: string, restaurantName: string) => {
    Alert.alert(
      'Remover Favorito',
      `Deseja remover "${restaurantName}" dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.removeFavorite(restaurantId);
              setFavorites(favorites.filter((f) => f.restaurant_id !== restaurantId));
              Alert.alert('Sucesso', 'Restaurante removido dos favoritos');
            } catch (error) {
              logger.error('Failed to remove favorite:', error);
              Alert.alert('Erro', 'Não foi possível remover dos favoritos');
            }
          },
        },
      ]
    );
  }, [favorites]);

  const handleRestaurantPress = useCallback((restaurantId: string) => {
    (navigation as any).navigate('Restaurant', { restaurantId });
  }, [navigation]);

  const handleViewMenu = useCallback((restaurantId: string) => {
    (navigation as any).navigate('Menu', { restaurantId });
  }, [navigation]);

  if (loading) {
    return (
      <ScreenContainer>
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.foregroundSecondary }]}>Carregando favoritos...</Text>
      </View>
    
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Searchbar
        placeholder="Buscar nos favoritos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: colors.card }]}
        accessibilityLabel="Search favorites"
      />

      <FlashList
        data={filteredFavorites as Favorite[]}
        renderItem={({ item }: ListRenderItemInfo<Favorite>) => (
          <FavoriteCard
            favorite={item}
            onPress={handleRestaurantPress}
            onViewMenu={handleViewMenu}
            onRemove={handleRemoveFavorite}
          />
        )}
        keyExtractor={(item) => item.id}
        estimatedItemSize={140}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="heart-outline" size={80} color={colors.foregroundMuted} />
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: colors.foreground }]}>
              {searchQuery ? 'Nenhum favorito encontrado' : 'Sem favoritos ainda'}
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyText, { color: colors.foregroundSecondary }]}>
              {searchQuery
                ? 'Tente buscar por outro termo'
                : 'Explore restaurantes e adicione seus favoritos aqui'}
            </Text>
            {!searchQuery && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Explore' as never)}
                style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                accessibilityLabel="Explore restaurants"
              >
                Explorar Restaurantes
              </Button>
            )}
          </View>
        }
      />
    </View>
  
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  searchBar: {
    margin: 16,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
  },
  exploreButton: {
    marginTop: 24,
    borderRadius: 12,
  },
});
