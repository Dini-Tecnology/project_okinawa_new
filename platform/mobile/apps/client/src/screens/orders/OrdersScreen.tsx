import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import {
  Text,
  IconButton,
  ActivityIndicator,
  SegmentedButtons,
  Badge,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import logger from '@okinawa/shared/utils/logger';
import type { Order, RootStackParamList } from '../../types';
import OrderCard from './OrderCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'all' | 'active' | 'completed';

export default function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useI18n();
  const colors = useColors();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    filterContainer: {
      padding: 16,
      borderBottomWidth: 1,
      position: 'relative',
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
    },
    badge: {
      position: 'absolute',
      top: 20,
      right: 20,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 16,
      color: colors.foreground,
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
      color: colors.foregroundSecondary,
    },
  }), [colors]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getMyOrders();
      setOrders(data);
    } catch (error: any) {
      logger.error('Error loading orders:', error);
      Alert.alert(t('common.error'), t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, []);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (filter === 'active') {
      filtered = orders.filter(
        (o) => !['completed', 'cancelled'].includes(o.status)
      );
    } else if (filter === 'completed') {
      filtered = orders.filter((o) =>
        ['completed', 'cancelled'].includes(o.status)
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [orders, filter]);

  const handleOrderPress = useCallback((order: Order) => {
    navigation.navigate('OrderDetail', { orderId: order.id });
  }, [navigation]);

  const handleTrackOrder = useCallback((order: Order) => {
    navigation.navigate('OrderTracking', { orderId: order.id });
  }, [navigation]);

  const handleCancelOrder = useCallback(async (order: Order) => {
    Alert.alert(
      t('orders.cancelOrder'),
      t('orders.cancelOrderConfirm') || 'Tem certeza que deseja cancelar este pedido?',
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.cancelOrder(order.id);
              Alert.alert(t('common.success'), t('orders.order_cancelled'));
              loadOrders();
            } catch (error: any) {
              Alert.alert(
                t('common.error'),
                error.response?.data?.message || t('errors.generic')
              );
            }
          },
        },
      ]
    );
  }, [t]);

  const canCancelOrder = useCallback((order: Order): boolean => {
    return ['pending', 'confirmed'].includes(order.status);
  }, []);

  const canTrackOrder = useCallback((order: Order): boolean => {
    return ['confirmed', 'preparing', 'ready', 'delivering'].includes(order.status);
  }, []);

  const renderOrderCard = useCallback(({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onPress={handleOrderPress}
      onTrack={handleTrackOrder}
      onCancel={handleCancelOrder}
      canTrack={canTrackOrder(item)}
      canCancel={canCancelOrder(item)}
    />
  ), [handleOrderPress, handleTrackOrder, handleCancelOrder, canTrackOrder, canCancelOrder]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter(
      (o) => !['completed', 'cancelled'].includes(o.status)
    ).length;
  }, [orders]);

  return (
    <View style={styles.container}>
      <View style={[styles.filterContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as FilterType)}
          buttons={[
            { value: 'all', label: t('common.viewAll') || 'Todos', icon: 'format-list-bulleted' },
            { value: 'active', label: t('orders.active') || 'Ativos', icon: 'clock-outline', showSelectedCheck: true },
            { value: 'completed', label: t('orders.status.completed'), icon: 'check-circle-outline' },
          ]}
        />
        {filter === 'active' && activeOrdersCount > 0 && (
          <Badge style={styles.badge}>{activeOrdersCount}</Badge>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="bodyLarge" style={[styles.loadingText, { color: colors.foreground }]}>
            {t('common.loading')}
          </Text>
        </View>
      ) : (
        <FlashList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          estimatedItemSize={180}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconButton icon="receipt-text-outline" size={48} iconColor={colors.foregroundMuted} />
              <Text variant="headlineSmall" style={{ color: colors.foreground }}>{t('empty.orders')}</Text>
              <Text variant="bodyMedium" style={[styles.emptyText, { color: colors.foregroundSecondary }]}>
                {filter === 'active'
                  ? t('orders.noActiveOrders') || 'Você não tem pedidos ativos no momento'
                  : filter === 'completed'
                  ? t('orders.noCompletedOrders') || 'Você ainda não concluiu nenhum pedido'
                  : t('orders.noOrders')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
