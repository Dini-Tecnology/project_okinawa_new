import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Linking } from 'react-native';
import { Text, Card, Button, Chip, Divider, List, IconButton } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import ApiService from '@/shared/services/api';
import MapView, { Marker } from 'react-native-maps';
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import logger from '@okinawa/shared/utils/logger';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  logo_url?: string;
  banner_url?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  service_type: string;
  cuisine_types?: string[];
  opening_hours?: any;
  rating?: number;
  total_reviews?: number;
  is_active: boolean;
}

export default function RestaurantScreen() {
  useScreenTracking('Restaurant Details');

  const route = useRoute();
  const navigation = useNavigation();
  const { restaurantId } = route.params as { restaurantId: string };
  const colors = useColors();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);

  const analytics = useAnalytics();

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getRestaurant(restaurantId);
      setRestaurant(data);

      if (data) {
        await analytics.logRestaurantView(data.id, data.name);
      }
    } catch (error) {
      logger.error('Failed to load restaurant:', error);
      await analytics.logError('Failed to load restaurant', 'RESTAURANT_LOAD_ERROR', false);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async () => {
    if (restaurant?.phone) {
      await analytics.logEvent('restaurant_call', {
        restaurant_id: restaurantId,
        restaurant_name: restaurant.name,
      });

      Linking.openURL(`tel:${restaurant.phone}`);
    }
  };

  const handleEmail = async () => {
    if (restaurant?.email) {
      await analytics.logEvent('restaurant_email', {
        restaurant_id: restaurantId,
        restaurant_name: restaurant.name,
      });

      Linking.openURL(`mailto:${restaurant.email}`);
    }
  };

  const handleDirections = async () => {
    if (restaurant?.location) {
      await analytics.logEvent('restaurant_directions', {
        restaurant_id: restaurantId,
        restaurant_name: restaurant.name,
      });

      const [lng, lat] = restaurant.location.coordinates;
      const url = `https://maps.google.com/?q=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  const renderOpeningHours = () => {
    if (!restaurant?.opening_hours) return null;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map((day) => {
      const hours = restaurant.opening_hours[day.toLowerCase()];
      return (
        <View key={day} style={styles.hoursRow}>
          <Text variant="bodyMedium" style={styles.dayText}>
            {day}
          </Text>
          <Text variant="bodyMedium" style={[styles.hoursText, { color: colors.foregroundMuted }]}>
            {hours || 'Closed'}
          </Text>
        </View>
      );
    });
  };

  const styles = createStyles(colors);

  if (!restaurant) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {restaurant.banner_url && (
        <Image source={{ uri: restaurant.banner_url }} style={styles.banner} />
      )}

      <View style={styles.header}>
        {restaurant.logo_url && (
          <Image source={{ uri: restaurant.logo_url }} style={styles.logo} />
        )}
        <View style={styles.headerInfo}>
          <Text variant="headlineMedium" style={{ color: colors.foreground }}>{restaurant.name}</Text>
          {restaurant.rating && (
            <View style={styles.rating}>
              <Text variant="titleMedium" style={styles.ratingText}>
                ⭐ {restaurant.rating.toFixed(1)}
              </Text>
              <Text variant="bodySmall" style={styles.reviewCount}>
                ({restaurant.total_reviews} reviews)
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.chips}>
        <Chip icon="silverware-fork-knife" style={styles.chip}>
          {restaurant.service_type.replace('_', ' ')}
        </Chip>
        {restaurant.cuisine_types?.map((cuisine, index) => (
          <Chip key={index} style={styles.chip}>
            {cuisine}
          </Chip>
        ))}
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            About
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.foreground }}>{restaurant.description}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Contact Information
          </Text>

          <List.Item
            title={restaurant.phone}
            description="Phone"
            titleStyle={{ color: colors.foreground }}
            descriptionStyle={{ color: colors.foregroundMuted }}
            left={(props) => <List.Icon {...props} icon="phone" color={colors.foregroundMuted} />}
            right={(props) => (
              <IconButton {...props} icon="phone-outgoing" onPress={handleCall} />
            )}
          />

          <List.Item
            title={restaurant.email}
            description="Email"
            titleStyle={{ color: colors.foreground }}
            descriptionStyle={{ color: colors.foregroundMuted }}
            left={(props) => <List.Icon {...props} icon="email" color={colors.foregroundMuted} />}
            right={(props) => (
              <IconButton {...props} icon="email-send" onPress={handleEmail} />
            )}
          />

          <Divider />

          <List.Item
            title={`${restaurant.address}, ${restaurant.city}`}
            description={`${restaurant.state} ${restaurant.zip_code}`}
            titleStyle={{ color: colors.foreground }}
            descriptionStyle={{ color: colors.foregroundMuted }}
            left={(props) => <List.Icon {...props} icon="map-marker" color={colors.foregroundMuted} />}
            right={(props) => (
              <IconButton {...props} icon="directions" onPress={handleDirections} />
            )}
          />
        </Card.Content>
      </Card>

      {restaurant.location && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Location
            </Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: restaurant.location.coordinates[1],
                longitude: restaurant.location.coordinates[0],
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: restaurant.location.coordinates[1],
                  longitude: restaurant.location.coordinates[0],
                }}
                title={restaurant.name}
              />
            </MapView>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Opening Hours
          </Text>
          {renderOpeningHours()}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Menu', { restaurantId: restaurant.id })}
          style={styles.menuButton}
          icon="silverware"
        >
          View Menu
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Reservation', { restaurantId: restaurant.id })}
          style={styles.reservationButton}
          icon="calendar"
        >
          Make Reservation
        </Button>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  banner: {
    width: '100%',
    height: 200,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    gap: 15,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  headerInfo: {
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  ratingText: {
    color: colors.primary,
  },
  reviewCount: {
    color: colors.foregroundMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 8,
    backgroundColor: colors.card,
  },
  chip: {
    marginRight: 5,
  },
  card: {
    margin: 15,
    marginTop: 0,
    backgroundColor: colors.card,
  },
  sectionTitle: {
    marginBottom: 15,
    color: colors.foreground,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayText: {
    fontWeight: '500',
    color: colors.foreground,
  },
  hoursText: {
    color: colors.foregroundMuted,
  },
  actions: {
    padding: 15,
    gap: 10,
    paddingBottom: 30,
  },
  menuButton: {
    backgroundColor: colors.primary,
  },
  reservationButton: {
    borderColor: colors.primary,
  },
});
