import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, Chip } from 'react-native-paper';
import { formatCurrency } from '@okinawa/shared/utils/formatters';
import { getLanguage } from '@okinawa/shared/i18n';
import type { MenuItem } from '../../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <Card style={styles.card}>
      {item.image_url && (
        <Card.Cover source={{ uri: item.image_url }} style={styles.image} />
      )}
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" numberOfLines={2}>{item.name}</Text>
            {!item.is_available && (
              <Chip compact style={styles.unavailableChip} textStyle={styles.unavailableText}>
                Indisponível
              </Chip>
            )}
          </View>
          <Text variant="titleLarge" style={styles.price}>
            {formatCurrency(item.price, getLanguage())}
          </Text>
        </View>

        {item.description && (
          <Text variant="bodySmall" numberOfLines={3} style={styles.description}>
            {item.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.badges}>
            {item.preparation_time && (
              <Chip compact icon="clock-outline" style={styles.badge}>
                {item.preparation_time} min
              </Chip>
            )}
            {item.calories && (
              <Chip compact icon="fire" style={styles.badge}>
                {item.calories} kcal
              </Chip>
            )}
          </View>

          {item.is_available && onAddToCart && (
            <IconButton
              icon="plus-circle"
              size={32}
              iconColor="#6200ee"
              onPress={() => onAddToCart(item)}
              style={styles.addButton}
            />
          )}
        </View>

        {item.allergens && item.allergens.length > 0 && (
          <View style={styles.allergens}>
            <IconButton icon="alert-circle" size={16} iconColor="#FF6F00" style={styles.allergenIcon} />
            <Text variant="bodySmall" style={styles.allergenText}>
              Alérgenos: {item.allergens.join(', ')}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, elevation: 2 },
  image: { height: 150 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  headerLeft: { flex: 1, marginRight: 8 },
  price: { fontWeight: 'bold', color: '#00C853' },
  description: { color: '#666', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  badges: { flexDirection: 'row', gap: 8, flex: 1 },
  badge: { height: 24 },
  addButton: { margin: 0 },
  allergens: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#FFF3E0', padding: 8, borderRadius: 4 },
  allergenIcon: { margin: 0, padding: 0 },
  allergenText: { flex: 1, color: '#E65100', fontSize: 11 },
  unavailableChip: { backgroundColor: '#EF5350', marginTop: 4 },
  unavailableText: { color: '#fff', fontSize: 10 },
});
