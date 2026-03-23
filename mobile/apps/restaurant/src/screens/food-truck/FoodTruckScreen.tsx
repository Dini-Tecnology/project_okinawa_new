import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Vibration,
  Switch,
  Platform,
} from 'react-native';
import { Text, Card, Button, Badge, IconButton } from 'react-native-paper';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors, useOkinawaTheme } from '@okinawa/shared/contexts/ThemeContext';
import { spacing, borderRadius } from '@okinawa/shared/theme/spacing';
import { typography } from '@okinawa/shared/theme/typography';
import ApiService from '@/shared/services/api';
import socketService from '../../services/socket';

interface FoodTruckOrder {
  id: string;
  orderNumber: number;
  status: 'queued' | 'preparing' | 'ready' | 'picked_up';
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  customerName?: string;
  createdAt: string;
}

/**
 * FoodTruckScreen
 *
 * Restaurant-side screen for food truck order management.
 * Compact single-column queue view with swipe-able items,
 * big visual number badges for ready orders, and PA system button.
 */
export default function FoodTruckScreen() {
  const { t } = useI18n();
  const { isDark } = useOkinawaTheme();
  const colors = useColors();

  const [orders, setOrders] = useState<FoodTruckOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.get('/orders?serviceType=food-truck&status=queued,preparing,ready');
      setOrders(data);
    } catch (error) {
      console.error('Failed to load food truck orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    socketService.connect();
    socketService.on('order:new', (order: FoodTruckOrder) => {
      setOrders((prev) => [...prev, order]);
    });
    socketService.on('order:updated', (order: FoodTruckOrder) => {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    });

    return () => {
      socketService.off('order:new');
      socketService.off('order:updated');
    };
  }, [loadOrders]);

  const handleMarkReady = useCallback(
    async (orderId: string) => {
      try {
        await ApiService.patch(`/orders/${orderId}/status`, { status: 'ready' });
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'ready' as const } : o)),
        );
      } catch (error) {
        Alert.alert(t('common.error'), t('errors.generic'));
      }
    },
    [t],
  );

  const handleConfirmPickup = useCallback(
    async (orderId: string) => {
      try {
        await ApiService.patch(`/orders/${orderId}/status`, { status: 'picked_up' });
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'picked_up' as const } : o)),
        );
      } catch (error) {
        Alert.alert(t('common.error'), t('errors.generic'));
      }
    },
    [t],
  );

  const handleAnnounce = useCallback(
    (orderNumber: number) => {
      // Vibrate device as PA system alert
      Vibration.vibrate(Platform.OS === 'ios' ? 500 : [0, 300, 100, 300]);
      Alert.alert(
        t('foodTruck.announce'),
        `#${orderNumber} - ${t('foodTruck.orderReady')}`,
      );
    },
    [t],
  );

  const handleToggleLocation = useCallback((value: boolean) => {
    setLocationEnabled(value);
    // In production, this would toggle GPS sharing via the location service
  }, []);

  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === 'ready'),
    [orders],
  );
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status === 'queued' || o.status === 'preparing'),
    [orders],
  );

  const renderReadyBadge = useCallback(
    ({ item }: { item: FoodTruckOrder }) => (
      <TouchableOpacity
        style={[styles.readyBadge, { backgroundColor: colors.success }]}
        onPress={() => handleAnnounce(item.orderNumber)}
        onLongPress={() => handleConfirmPickup(item.id)}
      >
        <Text style={[typography.displayMedium, { color: colors.foregroundInverse }]}>
          {item.orderNumber}
        </Text>
        <Text style={[typography.labelSmall, { color: colors.foregroundInverse, opacity: 0.8 }]}>
          {t('foodTruck.orderReady')}
        </Text>
      </TouchableOpacity>
    ),
    [colors, t, handleAnnounce, handleConfirmPickup],
  );

  const renderOrderItem = useCallback(
    ({ item }: { item: FoodTruckOrder }) => (
      <Card
        style={[
          styles.orderCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <Card.Content>
          <View style={styles.orderHeader}>
            <View style={styles.orderBadgeSmall}>
              <Text style={[typography.h3, { color: colors.primary }]}>
                #{item.orderNumber}
              </Text>
              {item.customerName ? (
                <Text style={[typography.bodySmall, { color: colors.foregroundSecondary }]}>
                  {item.customerName}
                </Text>
              ) : null}
            </View>
            <Badge
              style={{
                backgroundColor:
                  item.status === 'queued' ? colors.warning : colors.info,
              }}
            >
              {item.status === 'queued'
                ? t('common.loading')
                : t('common.loading')}
            </Badge>
          </View>

          <View style={styles.itemsList}>
            {item.items.map((orderItem, idx) => (
              <View key={`${item.id}-item-${idx}`} style={styles.itemRow}>
                <Text style={[typography.bodyMedium, { color: colors.foreground }]}>
                  {orderItem.quantity}x {orderItem.name}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.orderFooter}>
            <Text style={[typography.priceMedium, { color: colors.foreground }]}>
              R$ {item.total.toFixed(2)}
            </Text>
            {item.status === 'preparing' && (
              <Button
                mode="contained"
                onPress={() => handleMarkReady(item.id)}
                compact
                style={{ backgroundColor: colors.success }}
                labelStyle={{ color: colors.foregroundInverse }}
              >
                {t('foodTruck.orderReady')}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    ),
    [colors, t, handleMarkReady],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[typography.h1, { color: colors.foreground }]}>
            {t('foodTruck.title')}
          </Text>
          <View style={styles.locationToggle}>
            <Text style={[typography.labelMedium, { color: colors.foregroundSecondary }]}>
              GPS
            </Text>
            <Switch
              value={locationEnabled}
              onValueChange={handleToggleLocation}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.foregroundInverse}
            />
          </View>
        </View>
      </View>

      {/* Ready numbers display */}
      {readyOrders.length > 0 && (
        <View style={styles.readySection}>
          <Text style={[typography.h3, { color: colors.foreground, paddingHorizontal: spacing.screenHorizontal }]}>
            {t('foodTruck.orderReady')}
          </Text>
          <FlatList
            data={readyOrders}
            horizontal
            keyExtractor={(item) => `ready-${item.id}`}
            renderItem={renderReadyBadge}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.readyBadgesContainer}
          />
        </View>
      )}

      {/* PA announce button */}
      {readyOrders.length > 0 && (
        <TouchableOpacity
          style={[styles.announceButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            readyOrders.forEach((o) => handleAnnounce(o.orderNumber));
          }}
        >
          <Text style={[typography.buttonLarge, { color: colors.primaryForeground }]}>
            {t('foodTruck.announce')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Queue list */}
      <FlatList
        data={activeOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={loadOrders}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[typography.bodyLarge, { color: colors.foregroundMuted }]}>
              {t('empty.orders')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  readySection: {
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
  readyBadgesContainer: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing[3],
  },
  readyBadge: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announceButton: {
    marginHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.button,
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  listContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing[2],
    gap: spacing[3],
  },
  orderCard: {
    borderRadius: borderRadius.card,
    borderWidth: 1,
    marginBottom: spacing[1],
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  orderBadgeSmall: {
    gap: spacing[0.5],
  },
  itemsList: {
    gap: spacing[1],
    marginBottom: spacing[3],
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[20],
  },
});
