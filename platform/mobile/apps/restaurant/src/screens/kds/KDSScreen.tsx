import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Chip, IconButton, Button } from 'react-native-paper';
import { format } from 'date-fns';
import { ptBR as dateFnsPtBR } from 'date-fns/locale';
import socketService from '../../services/socket';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors, useOkinawaTheme } from '@okinawa/shared/contexts/ThemeContext';
import type { Order, OrderStatus } from '../../types';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

export default function KDSScreen() {
  const { t } = useI18n();
  const { theme, isDark } = useOkinawaTheme();
  const colors = useColors();
  
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'preparing'>('all');

  const statusColors: Record<OrderStatus, string> = useMemo(() => ({
    pending: colors.warning,
    confirmed: colors.info,
    preparing: colors.secondary,
    ready: colors.success,
    delivering: colors.info,
    completed: colors.success,
    cancelled: colors.error,
  }), [colors]);

  useEffect(() => {
    loadActiveOrders();

    socketService.connect();

    socketService.on('order:new', ((order: unknown) => {
      setActiveOrders(prev => [order as Order, ...prev]);
    }) as (data: unknown) => void);

    socketService.on('order:updated', ((order: unknown) => {
      setActiveOrders(prev =>
        prev.map(o => (o.id === (order as Order).id ? order as Order : o))
      );
    }) as (data: unknown) => void);

    return () => {
      socketService.off('order:new');
      socketService.off('order:updated');
    };
  }, []);

  const loadActiveOrders = async () => {
    try {
      const orders = await ApiService.getKitchenOrders();
      setActiveOrders(orders);
    } catch (error) {
      console.error(error);
      setActiveOrders([]);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await ApiService.updateOrderStatus(orderId, status);
      setActiveOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.generic'));
    }
  };

  const getFilteredOrders = useCallback(() => {
    if (selectedStatus === 'all') {
      return activeOrders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
    }
    return activeOrders.filter(o => o.status === (selectedStatus === 'pending' ? 'confirmed' : 'preparing'));
  }, [activeOrders, selectedStatus]);

  const getTimeElapsed = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes;
  };

  /** Platform brand colors for delivery source badges */
  const platformColors: Record<string, string> = useMemo(() => ({
    ifood: '#EA1D2C',
    rappi: '#FF441F',
    ubereats: '#06C167',
  }), []);

  const styles = useMemo(() => StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.backgroundSecondary,
    },
    header: { 
      padding: 16, 
      backgroundColor: colors.card, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.border,
    },
    headerTitle: {
      color: colors.foreground,
    },
    filterButtons: { 
      flexDirection: 'row', 
      gap: 8, 
      marginTop: 12,
    },
    listContent: { 
      padding: 8,
    },
    row: { 
      gap: 8,
    },
    orderCard: { 
      flex: 1, 
      margin: 8, 
      elevation: 2,
      backgroundColor: colors.card,
    },
    urgentCard: { 
      borderLeftWidth: 4, 
      borderLeftColor: colors.error,
    },
    orderHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: 16,
    },
    orderTitle: {
      color: colors.foreground,
    },
    orderTime: { 
      color: colors.foregroundSecondary, 
      marginTop: 4,
    },
    statusChip: { 
      height: 28,
    },
    chipText: { 
      color: colors.primaryForeground, 
      fontSize: 12,
    },
    orderItems: { 
      marginBottom: 16,
    },
    itemRow: { 
      flexDirection: 'row', 
      marginBottom: 12, 
      alignItems: 'flex-start',
    },
    itemQuantity: { 
      fontWeight: 'bold', 
      minWidth: 40, 
      color: colors.primary,
    },
    itemDetails: { 
      flex: 1,
    },
    itemName: {
      color: colors.foreground,
    },
    instructions: { 
      color: colors.warning, 
      marginTop: 4, 
      fontStyle: 'italic',
    },
    orderFooter: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingTop: 12, 
      borderTopWidth: 1, 
      borderTopColor: colors.border,
    },
    orderInfo: { 
      flexDirection: 'row', 
      alignItems: 'center',
    },
    orderTypeText: {
      color: colors.foregroundSecondary,
    },
    orderActions: { 
      flexDirection: 'row', 
      gap: 8,
    },
    readyButton: { 
      backgroundColor: colors.success,
    },
    emptyContainer: { 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: 64,
    },
    emptyText: {
      color: colors.foregroundSecondary,
    },
    sourceBadge: {
      height: 22,
      borderRadius: 4,
      paddingHorizontal: 6,
      alignSelf: 'flex-start' as const,
      marginTop: 4,
    },
    sourceBadgeText: {
      fontSize: 10,
      fontWeight: '700' as const,
      color: '#FFFFFF',
    },
    riderEta: {
      fontSize: 11,
      color: colors.info,
      marginTop: 4,
    },
  }), [colors]);

  const renderOrderCard = ({ item }: { item: Order }) => {
    const minutesElapsed = getTimeElapsed(item.created_at);
    const isUrgent = minutesElapsed > 20;

    return (
      <Card style={[styles.orderCard, isUrgent && styles.urgentCard]}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View>
              <Text variant="titleLarge" style={styles.orderTitle}>
                {t('orders.title')} #{item.order_number || item.id.slice(0, 8)}
              </Text>
              <Text variant="bodySmall" style={styles.orderTime}>
                {format(new Date(item.created_at), 'HH:mm', { locale: dateFnsPtBR })} - {minutesElapsed} min
              </Text>
              {(item as any).source && (item as any).source !== 'noowe' && (
                <View style={[styles.sourceBadge, { backgroundColor: platformColors[(item as any).source] || colors.foregroundMuted }]}>
                  <Text style={styles.sourceBadgeText}>
                    {t(`kds.order_source.${(item as any).source}`)}
                  </Text>
                </View>
              )}
              {(item as any).delivery_rider_eta != null && (
                <Text style={styles.riderEta}>
                  {t('kds.delivery.rider_eta', { minutes: String((item as any).delivery_rider_eta) })}
                </Text>
              )}
            </View>
            <Chip 
              style={[styles.statusChip, { backgroundColor: statusColors[item.status] }]} 
              textStyle={styles.chipText}
            >
              {t(`orders.status.${item.status}`)}
            </Chip>
          </View>

          <View style={styles.orderItems}>
            {item.items.map((orderItem, index) => (
              <View key={index} style={styles.itemRow}>
                <Text variant="titleMedium" style={styles.itemQuantity}>
                  {orderItem.quantity}x
                </Text>
                <View style={styles.itemDetails}>
                  <Text variant="bodyLarge" style={styles.itemName}>{orderItem.menu_item?.name}</Text>
                  {orderItem.special_instructions && (
                    <Text variant="bodySmall" style={styles.instructions}>
                      ⚠️ {orderItem.special_instructions}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.orderFooter}>
            <View style={styles.orderInfo}>
              <IconButton
                icon={item.order_type === 'delivery' ? 'truck-delivery' : item.order_type === 'pickup' ? 'package-variant' : 'silverware-fork-knife'}
                size={20}
                iconColor={colors.foregroundSecondary}
                accessibilityLabel={`Order type: ${item.order_type === 'delivery' ? 'delivery' : item.order_type === 'pickup' ? 'pickup' : 'dine-in'}`}
              />
              <Text variant="bodySmall" style={styles.orderTypeText}>
                {item.order_type === 'delivery' ? t('orders.orderType.delivery') : item.order_type === 'pickup' ? t('orders.orderType.pickup') : t('tables.table')}
              </Text>
            </View>

            <View style={styles.orderActions}>
              {item.status === 'confirmed' && (
                <Button
                  mode="contained"
                  onPress={() => updateOrderStatus(item.id, 'preparing')}
                  compact
                  buttonColor={colors.primary}
                  textColor={colors.primaryForeground}
                  accessibilityRole="button"
                  accessibilityLabel={`Start preparing order ${item.order_number || item.id.slice(0, 8)}`}
                >
                  {t('kds.startPreparing')}
                </Button>
              )}
              {item.status === 'preparing' && (
                <Button
                  mode="contained"
                  onPress={() => updateOrderStatus(item.id, 'ready')}
                  compact
                  style={styles.readyButton}
                  textColor={colors.primaryForeground}
                  accessibilityRole="button"
                  accessibilityLabel={`Mark order ${item.order_number || item.id.slice(0, 8)} as ready`}
                >
                  {t('kds.ready')}
                </Button>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const filteredOrders = getFilteredOrders();

  return (
    <ScreenContainer>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.headerTitle}>{t('kds.title')}</Text>
        <View style={styles.filterButtons}>
          <Chip
            selected={selectedStatus === 'all'}
            onPress={() => setSelectedStatus('all')}
            selectedColor={colors.primary}
            accessibilityRole="button"
            accessibilityLabel={`View all orders, ${activeOrders.length} total`}
            accessibilityState={{ selected: selectedStatus === 'all' }}
          >
            {t('common.viewAll')} ({activeOrders.length})
          </Chip>
          <Chip
            selected={selectedStatus === 'pending'}
            onPress={() => setSelectedStatus('pending')}
            selectedColor={colors.primary}
            accessibilityRole="button"
            accessibilityLabel="Filter new orders"
            accessibilityState={{ selected: selectedStatus === 'pending' }}
          >
            {t('kds.newOrders')}
          </Chip>
          <Chip
            selected={selectedStatus === 'preparing'}
            onPress={() => setSelectedStatus('preparing')}
            selectedColor={colors.primary}
            accessibilityRole="button"
            accessibilityLabel="Filter orders in preparation"
            accessibilityState={{ selected: selectedStatus === 'preparing' }}
          >
            {t('kds.preparing')}
          </Chip>
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="chef-hat" size={48} iconColor={colors.foregroundMuted} accessibilityLabel="No active orders" />
            <Text variant="headlineSmall" style={styles.emptyText}>{t('orders.noActiveOrders')}</Text>
          </View>
        }
      />
    </View>
    </ScreenContainer>
  );
}
