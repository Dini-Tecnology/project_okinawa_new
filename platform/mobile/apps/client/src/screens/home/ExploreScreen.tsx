/**
 * ExploreScreen
 * 
 * Restaurant discovery with list/map views, search, and filters.
 * 
 * @module screens/home
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Text,
  Searchbar,
  FAB,
  Chip,
  Card,
  ActivityIndicator,
  IconButton,
  SegmentedButtons,
  Badge,
} from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@/shared/theme';
import logger from '@okinawa/shared/utils/logger';
import type { Restaurant, Location as LocationType, RootStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ExploreScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useI18n();
  const colors = useColors();

  const CUISINE_FILTERS = [
    t('common.all'),
    t('cuisine.japanese'),
    t('cuisine.brazilian'),
    t('cuisine.italian'),
    t('cuisine.mexican'),
    t('cuisine.chinese'),
    t('cuisine.sushi'),
    t('cuisine.vegan'),
    t('cuisine.fastFood'),
  ];

  // State
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('Todos');
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Map ref
  const mapRef = React.useRef<MapView>(null);

  // Dynamic styles with semantic tokens
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      padding: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchbar: {
      elevation: 2,
      backgroundColor: colors.input,
    },
    viewModeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    segmentedButtons: {
      flex: 1,
    },
    resultsBadge: {
      marginLeft: 12,
    },
    filtersContainer: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filtersContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    filterChip: {
      marginRight: 8,
    },
    listContent: {
      padding: 16,
    },
    restaurantCard: {
      marginBottom: 16,
      elevation: 2,
      backgroundColor: colors.card,
    },
    cardContent: {
      paddingTop: 12,
    },
    restaurantHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    restaurantInfo: {
      flex: 1,
    },
    restaurantMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
    },
    distance: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
    },
    deliveryTime: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    starIcon: {
      margin: 0,
      padding: 0,
    },
    markerIcon: {
      margin: 0,
      padding: 0,
    },
    clockIcon: {
      margin: 0,
      padding: 0,
    },
    description: {
      marginBottom: 8,
      color: colors.mutedForeground,
    },
    cuisineChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    chip: {
      marginRight: 8,
      marginBottom: 8,
    },
    minOrder: {
      marginTop: 8,
      color: colors.mutedForeground,
    },
    mapContainer: {
      flex: 1,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    markerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    marker: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.card,
    },
    centerButton: {
      position: 'absolute',
      right: 16,
      top: 16,
      backgroundColor: colors.card,
    },
    selectedRestaurantCard: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
      backgroundColor: colors.card,
    },
    selectedCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectedRestaurantInfo: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
    },
    emptyText: {
      marginTop: 16,
      textAlign: 'center',
      color: colors.mutedForeground,
    },
  }), [colors]);

  // Load user location
  useEffect(() => {
    loadUserLocation();
  }, []);

  // Load restaurants when location changes
  useEffect(() => {
    if (userLocation) {
      loadRestaurants();
    }
  }, [userLocation]);

  // Filter restaurants
  useEffect(() => {
    filterRestaurants();
  }, [restaurants, searchQuery, selectedCuisine]);

  const loadUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          t('common.permissionRequired'),
          t('location.permissionMessage'),
        );
        // Use default location (Sao Paulo)
        setUserLocation({ latitude: -23.5505, longitude: -46.6333 });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      logger.error('Error getting location:', error);
      setUserLocation({ latitude: -23.5505, longitude: -46.6333 });
    }
  };

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getNearbyRestaurants({
        latitude: userLocation!.latitude,
        longitude: userLocation!.longitude,
        radius: 10,
      });
      setRestaurants(data);
    } catch (error) {
      logger.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = [...restaurants];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCuisine !== t('common.all')) {
      filtered = filtered.filter((r) =>
        r.cuisines?.some((c) => c.toLowerCase() === selectedCuisine.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id });
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  };

  const renderRestaurantCard = ({ item }: { item: Restaurant }) => (
    <Card style={styles.restaurantCard} onPress={() => handleRestaurantPress(item)}>
      {item.cover_image_url && (
        <Card.Cover source={{ uri: item.cover_image_url }} />
      )}
      <Card.Content style={styles.cardContent}>
        <View style={styles.restaurantHeader}>
          <View style={styles.restaurantInfo}>
            <Text variant="titleMedium">{item.name}</Text>
            <View style={styles.restaurantMeta}>
              <View style={styles.rating}>
                <IconButton
                  icon="star"
                  iconColor={colors.warning}
                  size={16}
                  style={styles.starIcon}
                />
                <Text variant="bodySmall">{item.rating?.toFixed(1) || '4.5'}</Text>
              </View>
              <View style={styles.distance}>
                <IconButton
                  icon="map-marker"
                  iconColor={colors.mutedForeground}
                  size={16}
                  style={styles.markerIcon}
                />
                <Text variant="bodySmall">{item.distance?.toFixed(1) || '1.5'} km</Text>
              </View>
              <View style={styles.deliveryTime}>
                <IconButton
                  icon="clock-outline"
                  iconColor={colors.mutedForeground}
                  size={16}
                  style={styles.clockIcon}
                />
                <Text variant="bodySmall">{item.estimated_delivery_time || '30-45'} min</Text>
              </View>
            </View>
          </View>
          <IconButton icon="heart-outline" iconColor={colors.mutedForeground} size={24} />
        </View>

        {item.description && (
          <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {item.cuisines && item.cuisines.length > 0 && (
          <View style={styles.cuisineChips}>
            {item.cuisines.slice(0, 3).map((cuisine, index) => (
              <Chip key={index} style={styles.chip} textStyle={{ fontSize: 11 }}>
                {cuisine}
              </Chip>
            ))}
          </View>
        )}

        {item.minimum_order && (
          <Text variant="bodySmall" style={styles.minOrder}>
            {t('restaurant.minOrder')}: R$ {item.minimum_order.toFixed(2)}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderListView = () => (
    <FlatList
      data={filteredRestaurants}
      renderItem={renderRestaurantCard}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <IconButton icon="food-off" size={64} iconColor={colors.mutedForeground} />
          <Text variant="bodyLarge" style={styles.emptyText}>
            {t('explore.noRestaurants')}
          </Text>
        </View>
      }
    />
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={
          userLocation
            ? {
                ...userLocation,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }
            : undefined
        }
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filteredRestaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.latitude || userLocation?.latitude || 0,
              longitude: restaurant.longitude || userLocation?.longitude || 0,
            }}
            onPress={() => setSelectedRestaurant(restaurant)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker}>
                <IconButton icon="silverware-fork-knife" size={16} iconColor="#fff" />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      <IconButton
        icon="crosshairs-gps"
        mode="contained"
        style={styles.centerButton}
        onPress={centerOnUser}
      />

      {selectedRestaurant && (
        <Card
          style={styles.selectedRestaurantCard}
          onPress={() => handleRestaurantPress(selectedRestaurant)}
        >
          <Card.Content style={styles.selectedCardContent}>
            <View style={styles.selectedRestaurantInfo}>
              <Text variant="titleMedium">{selectedRestaurant.name}</Text>
              <Text variant="bodySmall" style={{ color: colors.mutedForeground }}>
                {selectedRestaurant.cuisines?.join(', ')}
              </Text>
            </View>
            <IconButton icon="chevron-right" iconColor={colors.primary} />
          </Card.Content>
        </Card>
      )}
    </View>
  );

  if (loading && restaurants.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('explore.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'list' | 'map')}
          buttons={[
            { value: 'list', label: t('explore.list'), icon: 'view-list' },
            { value: 'map', label: t('explore.map'), icon: 'map' },
          ]}
          style={styles.segmentedButtons}
        />
        <Badge style={styles.resultsBadge}>{filteredRestaurants.length}</Badge>
      </View>

      {/* Cuisine Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={CUISINE_FILTERS}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCuisine === item}
              onPress={() => setSelectedCuisine(item)}
              style={styles.filterChip}
            >
              {item}
            </Chip>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Content */}
      {viewMode === 'list' ? renderListView() : renderMapView()}
    </View>
  );
}
