import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text, Card, Chip, IconButton, ActivityIndicator, SegmentedButtons, Searchbar, FAB, Menu, Divider } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR as dateFnsPtBR } from 'date-fns/locale';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import type { Order, OrderStatus } from '../../types';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

type FilterType = 'all' | 'active' | 'completed' | 'cancelled';

export default function OrdersScreen() {
  const navigation = useNavigation();
  const { t } = useI18n();
  const colors = useColors();

  const STATUS_COLORS: Record<OrderStatus, string> = useMemo(() => ({
    pending: colors.warning, 
    confirmed: colors.info, 
    preparing: colors.secondary, 
    ready: colors.success,
    delivering: colors.info, 
    completed: colors.success, 
    cancelled: colors.error,
  }), [colors]);

  const getStatusLabel = (status: OrderStatus): string => {
    return t(`orders.status.${status}`);
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  useEffect(() => {
    filterOrders();
  }, [orders, filter, searchQuery]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getRestaurantOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
      setOrders([]);
      Alert.alert(t('common.error'), t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filterOrders = () => {
    let filtered = orders;

    if (filter === 'active') {
      filtered = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
    } else if (filter === 'completed') {
      filtered = orders.filter(o => o.status === 'completed');
    } else if (filter === 'cancelled') {
      filtered = orders.filter(o => o.status === 'cancelled');
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.order_number?.toLowerCase().includes(query) ||
        o.customer?.full_name?.toLowerCase().includes(query) ||
        o.id.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ApiService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      Alert.alert(t('common.success'), t('success.updated'));
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.message || t('errors.generic'));
    }
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setMenuVisible(true);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'confirmed', confirmed: 'preparing', preparing: 'ready',
      ready: 'delivering', delivering: 'completed',
      completed: null, cancelled: null,
    };
    return statusFlow[currentStatus];
  };

  const handleAdvanceStatus = () => {
    if (!selectedOrder) return;
    const nextStatus = getNextStatus(selectedOrder.status);
    if (nextStatus) {
      updateOrderStatus(selectedOrder.id, nextStatus);
    }
    setMenuVisible(false);
  };

  const handleCancelOrder = () => {
    if (!selectedOrder) return;
    Alert.alert(t('orders.cancelOrder'), t('orders.cancelOrderConfirm'), [
      { text: t('common.no'), style: 'cancel' },
      {
        text: t('common.yes'),
        style: 'destructive',
        onPress: () => {
          updateOrderStatus(selectedOrder.id, 'cancelled');
          setMenuVisible(false);
        },
      },
    ]);
  };

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
    searchbar: { 
      marginBottom: 12,
      backgroundColor: colors.backgroundSecondary,
    },
    filterButtons: { 
      marginTop: 4,
    },
    loadingContainer: { 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center',
    },
    listContent: { 
      padding: 16,
    },
    orderCard: { 
      marginBottom: 16, 
      elevation: 2,
      backgroundColor: colors.card,
    },
    orderHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
    },
    orderHeaderLeft: { 
      flex: 1, 
      marginRight: 8,
    },
    orderTitle: {
      color: colors.foreground,
    },
    customerName: { 
      color: colors.foregroundSecondary, 
      marginTop: 4,
    },
    orderTime: { 
      color: colors.foregroundMuted, 
      marginTop: 2, 
      fontSize: 12,
    },
    statusChip: { 
      height: 28,
    },
    chipText: { 
      color: colors.premiumCardForeground, 
      fontSize: 12,
    },
    divider: { 
      marginVertical: 12,
      backgroundColor: colors.border,
    },
    itemsSection: { 
      marginBottom: 8,
    },
    sectionLabel: { 
      marginBottom: 8, 
      color: colors.foregroundSecondary,
    },
    itemRow: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 4,
    },
    itemQuantity: { 
      minWidth: 30, 
      fontWeight: '600', 
      color: colors.foregroundSecondary,
    },
    itemName: { 
      flex: 1, 
      color: colors.foreground,
    },
    itemPrice: { 
      minWidth: 70, 
      textAlign: 'right', 
      color: colors.foregroundSecondary,
    },
    moreItems: { 
      marginTop: 4, 
      color: colors.foregroundSecondary, 
      fontStyle: 'italic', 
      fontSize: 12,
    },
    orderFooter: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
    },
    totalSection: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 8,
    },
    totalLabel: {
      color: colors.foreground,
    },
    totalAmount: { 
      fontWeight: 'bold', 
      color: colors.success,
    },
    paymentSection: { 
      flexDirection: 'row', 
      alignItems: 'center',
    },
    paymentIcon: { 
      margin: 0, 
      padding: 0,
    },
    paymentText: {
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

  const renderOrderCard = ({ item }: { item: Order }) => (
    <TouchableOpacity
      onPress={() => handleOrderPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`Order ${item.order_number || item.id.slice(0, 8)}, ${item.customer?.full_name || 'Customer'}, status ${item.status}`}
      accessibilityHint="Opens order actions menu"
    >
      <Card style={styles.orderCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Text variant="titleLarge" style={styles.orderTitle}>{t('orders.title')} #{item.order_number || item.id.slice(0, 8)}</Text>
              <Text variant="bodySmall" style={styles.customerName}>
                {item.customer?.full_name || t('common.user')}
              </Text>
              <Text variant="bodySmall" style={styles.orderTime}>
                {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: dateFnsPtBR })}
              </Text>
            </View>
            <Chip
              icon={item.order_type === 'delivery' ? 'truck-delivery' : item.order_type === 'pickup' ? 'package-variant' : 'silverware-fork-knife'}
              style={[styles.statusChip, { backgroundColor: STATUS_COLORS[item.status] }]}
              textStyle={styles.chipText}
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.itemsSection}>
            <Text variant="labelMedium" style={styles.sectionLabel}>{t('menu.items')} ({item.items.length})</Text>
            {item.items.slice(0, 3).map((orderItem, index) => (
              <View key={index} style={styles.itemRow}>
                <Text variant="bodySmall" style={styles.itemQuantity}>{orderItem.quantity}x</Text>
                <Text variant="bodySmall" numberOfLines={1} style={styles.itemName}>
                  {orderItem.menu_item?.name || t('menu.items')}
                </Text>
                <Text variant="bodySmall" style={styles.itemPrice}>
                  R$ {(orderItem.unit_price || 0).toFixed(2)}
                </Text>
              </View>
            ))}
            {item.items.length > 3 && (
              <Text variant="bodySmall" style={styles.moreItems}>+{item.items.length - 3} {t('menu.items')}</Text>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.orderFooter}>
            <View style={styles.totalSection}>
              <Text variant="labelMedium" style={styles.totalLabel}>{t('orders.total')}:</Text>
              <Text variant="titleMedium" style={styles.totalAmount}>R$ {item.total_amount.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentSection}>
              <IconButton icon="cash" size={16} style={styles.paymentIcon} iconColor={colors.foregroundSecondary} />
              <Text variant="bodySmall" style={styles.paymentText}>{item.payment_method || t('common.notProvided')}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder={t('common.search')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as FilterType)}
          buttons={[
            { value: 'all', label: t('common.viewAll'), icon: 'format-list-bulleted' },
            { value: 'active', label: t('orders.active'), icon: 'clock-outline' },
            { value: 'completed', label: t('orders.status.completed'), icon: 'check-circle' },
            { value: 'cancelled', label: t('orders.status.cancelled'), icon: 'close-circle' },
          ]}
          style={styles.filterButtons}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlashList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconButton icon="receipt" size={48} iconColor={colors.foregroundMuted} />
              <Text variant="headlineSmall" style={{ color: colors.foreground }}>{t('empty.orders')}</Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                {filter === 'active' ? t('orders.noActiveOrders') :
                 filter === 'completed' ? t('orders.noCompletedOrders') :
                 filter === 'cancelled' ? t('orders.order_cancelled') :
                 t('empty.orders')}
              </Text>
            </View>
          }
        />
      )}

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
      >
        {selectedOrder && getNextStatus(selectedOrder.status) && (
          <Menu.Item
            leadingIcon="arrow-right-circle"
            onPress={handleAdvanceStatus}
            title={`${t('common.next')}: ${getStatusLabel(getNextStatus(selectedOrder.status)!)}`}
          />
        )}
        <Menu.Item leadingIcon="eye" onPress={() => { setMenuVisible(false); }} title={t('common.view')} />
        <Menu.Item leadingIcon="printer" onPress={() => { setMenuVisible(false); }} title={t('common.view')} />
        <Divider />
        {selectedOrder && !['cancelled', 'completed'].includes(selectedOrder.status) && (
          <Menu.Item
            leadingIcon="close-circle"
            onPress={handleCancelOrder}
            title={t('orders.cancelOrder')}
            titleStyle={{ color: colors.error }}
          />
        )}
      </Menu>
    </View>
    </ScreenContainer>
  );
}
