import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton } from 'react-native-paper';
import { formatCurrency } from '@okinawa/shared/utils/formatters';
import { t, getLanguage } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import type { Restaurant } from '../../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
}

export default function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        {restaurant.cover_image_url && (
          <Card.Cover source={{ uri: restaurant.cover_image_url }} />
        )}
        <Card.Content style={styles.content}>
          <Text variant="titleLarge" numberOfLines={1}>{restaurant.name}</Text>

          <View style={styles.meta}>
            {restaurant.rating && (
              <View style={styles.metaItem}>
                <IconButton icon="star" size={16} iconColor={colors.warning} style={styles.icon} />
                <Text variant="bodySmall">{restaurant.rating.toFixed(1)}</Text>
              </View>
            )}
            {restaurant.distance && (
              <View style={styles.metaItem}>
                <IconButton icon="map-marker" size={16} style={styles.icon} />
                <Text variant="bodySmall">{restaurant.distance.toFixed(1)} km</Text>
              </View>
            )}
            {restaurant.estimated_delivery_time && (
              <View style={styles.metaItem}>
                <IconButton icon="clock-outline" size={16} style={styles.icon} />
                <Text variant="bodySmall">{restaurant.estimated_delivery_time} min</Text>
              </View>
            )}
          </View>

          {restaurant.description && (
            <Text variant="bodyMedium" numberOfLines={2} style={[styles.description, { color: colors.foregroundSecondary }]}>
              {restaurant.description}
            </Text>
          )}

          <View style={styles.cuisines}>
            {restaurant.cuisine_type?.slice(0, 3).map((cuisine, index) => (
              <Chip key={index} compact style={styles.chip}>{cuisine}</Chip>
            ))}
          </View>

          {restaurant.min_order_amount && (
            <Text variant="bodySmall" style={[styles.minOrder, { color: colors.foregroundSecondary }]}>
              {t('restaurants.minOrder')}: {formatCurrency(restaurant.min_order_amount, getLanguage())}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16, elevation: 2 },
  content: { paddingTop: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  icon: { margin: 0, padding: 0 },
  description: { marginBottom: 8 },
  cuisines: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: { marginRight: 8, marginBottom: 8 },
  minOrder: { marginTop: 8 },
});
