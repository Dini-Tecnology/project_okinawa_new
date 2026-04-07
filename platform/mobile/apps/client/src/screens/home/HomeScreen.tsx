import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Text, Card, Button, Searchbar, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { t, useTranslations } from '@okinawa/shared/i18n';
import { useColors, useOkinawaTheme } from '@okinawa/shared/contexts/ThemeContext';
import { useAuth } from '@okinawa/shared/hooks/useAuth';
import { ApiService } from '@okinawa/shared/services/api';
import logger from '@okinawa/shared/utils/logger';
import type { Restaurant, Order } from '../../types';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;

// Skeleton component for loading states
const SkeletonCard = () => {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.card, { width: CARD_WIDTH, backgroundColor: colors.card }]}>
      <View style={[skeletonStyles.image, { backgroundColor: colors.backgroundTertiary }]} />
      <View style={skeletonStyles.content}>
        <View style={[skeletonStyles.title, { backgroundColor: colors.backgroundTertiary }]} />
        <View style={[skeletonStyles.subtitle, { backgroundColor: colors.backgroundTertiary }]} />
      </View>
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  card: {
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 12,
  },
  title: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  subtitle: {
    height: 12,
    borderRadius: 4,
    width: '60%',
  },
});

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const translations = useTranslations();
  const { theme, isDark } = useOkinawaTheme();
  const colors = useColors();

  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [popularRestaurants, setPopularRestaurants] = useState<Restaurant[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const userLocation = useRef<{ lat: number; lng: number } | null>(null);

  const cuisineTypes = [
    { id: 'japanese', label: t('cuisine.japanese'), icon: '🍣' },
    { id: 'italian', label: t('cuisine.italian'), icon: '🍕' },
    { id: 'brazilian', label: t('cuisine.brazilian'), icon: '🍖' },
    { id: 'mexican', label: t('cuisine.mexican'), icon: '🌮' },
    { id: 'chinese', label: t('cuisine.chinese'), icon: '🥡' },
    { id: 'indian', label: t('cuisine.indian'), icon: '🍛' },
  ];

  const fetchData = useCallback(async () => {
    try {
      // F6: Get real device location for nearby restaurants
      if (!userLocation.current) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            userLocation.current = {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            };
          } else {
            logger.warn('Location permission denied, using fallback');
          }
        } catch (locError) {
          logger.warn('Could not get device location, using fallback:', locError);
        }
      }

      const locationParams = userLocation.current || undefined;

      const [nearbyRes, popularRes, ordersRes] = await Promise.all([
        ApiService.getRestaurants(locationParams).then((data: any) => ({ data: Array.isArray(data) ? data.slice(0, 5) : [] })).catch(() => ({ data: [] })),
        ApiService.getRestaurants().then((data: any) => ({ data: Array.isArray(data) ? data.slice(0, 5) : [] })).catch(() => ({ data: [] })),
        user ? ApiService.getMyOrders().then((data: any) => ({ data: Array.isArray(data) ? data.slice(0, 3) : [] })).catch(() => ({ data: [] })) : { data: [] },
      ]);

      setNearbyRestaurants(nearbyRes.data || []);
      setPopularRestaurants(popularRes.data || []);
      setRecentOrders(ordersRes.data || []);
    } catch (error) {
      logger.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    navigation.navigate('Explore' as never, { search: searchQuery } as never);
  };

  const handleCuisinePress = (cuisineId: string) => {
    navigation.navigate('Explore' as never, { cuisine: cuisineId } as never);
  };

  const handleRestaurantPress = (restaurantId: string) => {
    navigation.navigate('Restaurant' as never, { restaurantId } as never);
  };

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderStatus' as never, { orderId } as never);
  };

  const getStatusColor = useCallback((status: string): string => {
    const statusColors: Record<string, string> = {
      pending: colors.warning,
      confirmed: colors.info,
      preparing: colors.primary,
      ready: colors.success,
      delivering: colors.secondary,
      completed: colors.success,
      cancelled: colors.error,
    };
    return statusColors[status] || colors.foregroundMuted;
  }, [colors]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 12,
      color: colors.foregroundSecondary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    greeting: {
      color: colors.foregroundSecondary,
      marginBottom: 4,
    },
    headerTitle: {
      color: colors.foreground,
      fontWeight: '600',
    },
    searchContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    searchBar: {
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 12,
      elevation: 0,
    },
    searchInput: {
      fontSize: 14,
    },
    cuisineContainer: {
      paddingHorizontal: 12,
      marginBottom: 24,
    },
    cuisineChip: {
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 4,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      minWidth: 70,
    },
    cuisineIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    cuisineLabel: {
      color: colors.foreground,
      fontSize: 12,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.foreground,
      fontWeight: '600',
    },
    seeAllText: {
      color: colors.primary,
      fontWeight: '500',
      fontSize: 14,
    },
    restaurantCard: {
      marginRight: 8,
      borderRadius: 12,
      backgroundColor: colors.card,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: colors.foreground,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    restaurantImage: {
      width: '100%',
      height: 120,
      backgroundColor: colors.backgroundTertiary,
    },
    restaurantInfo: {
      padding: 12,
    },
    restaurantName: {
      color: colors.foreground,
      fontWeight: '600',
    },
    restaurantCuisine: {
      color: colors.foregroundSecondary,
      marginTop: 2,
    },
    restaurantMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: 12,
      color: colors.foreground,
    },
    distanceText: {
      color: colors.foregroundSecondary,
      marginLeft: 12,
    },
    deliveryTime: {
      color: colors.foregroundSecondary,
      marginLeft: 12,
    },
    ordersContainer: {
      paddingHorizontal: 16,
    },
    orderCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    orderNumber: {
      color: colors.foreground,
      fontWeight: '600',
    },
    statusChip: {
      height: 24,
    },
    statusChipText: {
      fontSize: 10,
      color: colors.primaryForeground,
    },
    orderRestaurant: {
      color: colors.foregroundSecondary,
      marginBottom: 8,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    orderDate: {
      color: colors.foregroundMuted,
    },
    orderTotal: {
      color: colors.primary,
      fontWeight: '600',
    },
    emptySection: {
      paddingHorizontal: 16,
      paddingVertical: 32,
      alignItems: 'center',
    },
    emptyText: {
      color: colors.foregroundSecondary,
      fontSize: 14,
    },
    bottomSpacing: {
      height: 32,
    },
  }), [colors]);

  const renderRating = (rating: number = 0) => (
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingText}>⭐ {rating.toFixed(1)}</Text>
    </View>
  );

  const renderRestaurantCard = (restaurant: Restaurant, index: number) => (
    <TouchableOpacity
      key={restaurant.id}
      style={[styles.restaurantCard, { width: CARD_WIDTH, marginLeft: index === 0 ? 16 : 8 }]}
      onPress={() => handleRestaurantPress(restaurant.id)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`View ${restaurant.name} restaurant`}
    >
      <Image
        source={restaurant.cover_image_url ? { uri: restaurant.cover_image_url } : undefined}
        style={styles.restaurantImage}
        resizeMode="cover"
        accessibilityLabel={`${restaurant.name} cover photo`}
      />
      <View style={styles.restaurantInfo}>
        <Text variant="titleMedium" numberOfLines={1} style={styles.restaurantName}>
          {restaurant.name}
        </Text>
        <Text variant="bodySmall" numberOfLines={1} style={styles.restaurantCuisine}>
          {restaurant.cuisine_type?.join(' • ') || t('restaurant.cuisineType')}
        </Text>
        <View style={styles.restaurantMeta}>
          {renderRating(restaurant.rating)}
          {restaurant.distance && (
            <Text variant="bodySmall" style={styles.distanceText}>
              {t('restaurant.distance', { distance: restaurant.distance.toFixed(1) })}
            </Text>
          )}
          {restaurant.estimated_delivery_time && (
            <Text variant="bodySmall" style={styles.deliveryTime}>
              {t('restaurant.deliveryTime', { time: restaurant.estimated_delivery_time })}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOrderCard = (order: Order) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderCard}
      onPress={() => handleOrderPress(order.id)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`View order from ${order.restaurant?.name}`}
    >
      <View style={styles.orderHeader}>
        <Text variant="titleSmall" style={styles.orderNumber}>
          {t('orders.orderNumber', { number: order.order_number || order.id.slice(0, 8) })}
        </Text>
        <Chip
          mode="flat"
          textStyle={styles.statusChipText}
          style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
        >
          {t(`orders.status.${order.status}`)}
        </Chip>
      </View>
      <Text variant="bodySmall" style={styles.orderRestaurant}>
        {order.restaurant?.name}
      </Text>
      <View style={styles.orderFooter}>
        <Text variant="bodySmall" style={styles.orderDate}>
          {new Date(order.created_at).toLocaleDateString('pt-BR')}
        </Text>
        <Text variant="titleSmall" style={styles.orderTotal}>
          R$ {Number(order.total_amount).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenContainer edges={['top']}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']}>
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="bodyMedium" style={styles.greeting}>
            {user ? `${t('common.greeting')}, ${user.full_name?.split(' ')[0] || ''}!` : t('navigation.home')}
          </Text>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {t('restaurant.searchRestaurants')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications' as never)}
          accessibilityRole="button"
          accessibilityLabel="View notifications"
        >
          <IconButton icon="bell-outline" size={24} iconColor={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('restaurant.searchRestaurants')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={colors.primary}
          accessibilityLabel="Search restaurants"
          accessibilityHint="Type to search for restaurants by name or cuisine"
        />
      </View>

      {/* Cuisine Types */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cuisineContainer}
      >
        {cuisineTypes.map((cuisine) => (
          <TouchableOpacity
            key={cuisine.id}
            style={styles.cuisineChip}
            onPress={() => handleCuisinePress(cuisine.id)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${cuisine.label} cuisine`}
          >
            <Text style={styles.cuisineIcon}>{cuisine.icon}</Text>
            <Text variant="bodySmall" style={styles.cuisineLabel}>
              {cuisine.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              {t('orders.myOrders')}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Orders' as never)}
              accessibilityRole="link"
              accessibilityLabel="View all orders"
            >
              <Text style={styles.seeAllText}>{t('common.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ordersContainer}>
            {recentOrders.map(renderOrderCard)}
          </View>
        </View>
      )}

      {/* Nearby Restaurants */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {t('restaurant.nearbyRestaurants')}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Explore' as never, { filter: 'nearby' } as never)}
            accessibilityRole="link"
            accessibilityLabel="View all nearby restaurants"
          >
            <Text style={styles.seeAllText}>{t('common.viewAll')}</Text>
          </TouchableOpacity>
        </View>
        {nearbyRestaurants.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nearbyRestaurants.map((restaurant, index) => renderRestaurantCard(restaurant, index))}
          </ScrollView>
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>{t('empty.restaurants')}</Text>
          </View>
        )}
      </View>

      {/* Popular Restaurants */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {t('menu.popular')}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Explore' as never, { filter: 'popular' } as never)}
            accessibilityRole="link"
            accessibilityLabel="View all popular restaurants"
          >
            <Text style={styles.seeAllText}>{t('common.viewAll')}</Text>
          </TouchableOpacity>
        </View>
        {popularRestaurants.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularRestaurants.map((restaurant, index) => renderRestaurantCard(restaurant, index))}
          </ScrollView>
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>{t('empty.restaurants')}</Text>
          </View>
        )}
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  
    </ScreenContainer>
  );
}
