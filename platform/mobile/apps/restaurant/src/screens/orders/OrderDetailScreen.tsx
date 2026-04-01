/**
 * OrderDetailScreen - Restaurant Order Details
 * 
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Chip, Button, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR as dateFnsPtBR } from 'date-fns/locale';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import type { Order, OrderStatus } from '../../types';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

type RouteParams = {
  OrderDetail: {
    orderId: string;
  };
};

export default function OrderDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'OrderDetail'>>();
  const navigation = useNavigation();
  const { t } = useI18n();
  const colors = useColors();
  const { orderId } = route.params;

  /**
   * Dynamic status colors based on current theme
   */
  const getStatusColor = useCallback((status: OrderStatus): string => {
    const statusColors: Record<OrderStatus, string> = {
      pending: colors.warning,
      confirmed: colors.info,
      preparing: colors.accent,
      ready: colors.success,
      delivering: colors.info,
      completed: colors.success,
      cancelled: colors.destructive,
    };
    return statusColors[status] || colors.mutedForeground;
  }, [colors]);

  const getStatusLabel = (status: OrderStatus): string => {
    return t(`orders.status.${status}`);
  };

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      backgroundColor: colors.background,
    },
    backButton: {
      marginTop: 16,
    },
    card: {
      margin: 16,
      marginBottom: 8,
      elevation: 2,
      backgroundColor: colors.card,
    },
    header: {
      marginBottom: 16,
    },
    headerTitle: {
      color: colors.foreground,
    },
    statusChip: {
      marginTop: 8,
      alignSelf: 'flex-start',
    },
    chipText: {
      color: colors.cardForeground,
      fontSize: 12,
    },
    info: {
      gap: 8,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoText: {
      color: colors.foreground,
    },
    icon: {
      margin: 0,
      padding: 0,
      marginRight: 8,
    },
    sectionTitle: {
      marginBottom: 16,
      color: colors.foreground,
    },
    subsectionTitle: {
      marginBottom: 8,
      color: colors.foreground,
    },
    divider: {
      marginVertical: 16,
      backgroundColor: colors.border,
    },
    complement: {
      color: colors.mutedForeground,
      marginTop: 4,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    quantity: {
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
    itemPrice: {
      color: colors.mutedForeground,
      marginTop: 2,
    },
    instructions: {
      color: colors.warning,
      marginTop: 4,
      fontStyle: 'italic',
    },
    itemTotal: {
      fontWeight: '600',
      marginLeft: 8,
      color: colors.foreground,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      color: colors.foreground,
    },
    totalAmount: {
      color: colors.success,
      fontWeight: 'bold',
    },
    actions: {
      padding: 16,
    },
    actionButton: {
      marginBottom: 8,
    },
    cancelButton: {
      borderColor: colors.destructive,
    },
  }), [colors]);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await ApiService.getOrder(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error(error);
      Alert.alert(t('common.error'), t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await ApiService.updateOrderStatus(orderId, newStatus);
      if (order) {
        setOrder({ ...order, status: newStatus });
      }
      Alert.alert(t('common.success'), t('success.updated'));
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.generic'));
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(t('orders.cancelOrder'), t('orders.cancelOrderConfirm'), [
      { text: t('common.no'), style: 'cancel' },
      {
        text: t('common.yes'),
        style: 'destructive',
        onPress: () => handleStatusChange('cancelled'),
      },
    ]);
  };

  const [confirmingCash, setConfirmingCash] = useState(false);

  const handleConfirmCashPayment = () => {
    Alert.alert(
      'Confirmar Pagamento em Dinheiro',
      `Confirmar recebimento de R$ ${order?.total_amount?.toFixed(2)} em dinheiro?`,
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          onPress: async () => {
            try {
              setConfirmingCash(true);
              await ApiService.confirmCashPayment(orderId);
              if (order) {
                setOrder({ ...order, status: 'completed' as OrderStatus });
              }
              Alert.alert(t('common.success'), 'Pagamento em dinheiro confirmado.');
            } catch (error) {
              Alert.alert(t('common.error'), t('errors.generic'));
            } finally {
              setConfirmingCash(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      </ScreenContainer>
    );
  }

  if (!order) {
    return (
      <ScreenContainer>
      <View style={styles.emptyContainer}>
        <IconButton icon="alert-circle" size={48} iconColor={colors.mutedForeground} />
        <Text variant="headlineSmall" style={{ color: colors.foreground }}>{t('errors.notFound')}</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          {t('common.back')}
        </Button>
      </View>
      </ScreenContainer>
    );
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivering',
      delivering: 'completed',
      completed: null,
      cancelled: null,
    };
    return statusFlow[currentStatus];
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <ScreenContainer>
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              {t('orders.title')} #{order.order_number || order.id.slice(0, 8)}
            </Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
              textStyle={styles.chipText}
            >
              {getStatusLabel(order.status)}
            </Chip>
          </View>

          <View style={styles.info}>
            <View style={styles.infoRow}>
              <IconButton icon="calendar" size={20} style={styles.icon} iconColor={colors.mutedForeground} />
              <Text variant="bodyMedium" style={styles.infoText}>
                {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: dateFnsPtBR })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <IconButton
                icon={
                  order.order_type === 'delivery'
                    ? 'truck-delivery'
                    : order.order_type === 'pickup'
                    ? 'package-variant'
                    : 'silverware-fork-knife'
                }
                size={20}
                style={styles.icon}
                iconColor={colors.mutedForeground}
              />
              <Text variant="bodyMedium" style={styles.infoText}>
                {order.order_type === 'delivery'
                  ? t('orders.orderType.delivery')
                  : order.order_type === 'pickup'
                  ? t('orders.orderType.pickup')
                  : `${t('tables.table')} ${order.table_id?.slice(0, 8)}`}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {t('common.user')}
          </Text>
          <Text variant="bodyLarge" style={{ color: colors.foreground }}>
            {order.customer?.full_name || t('common.user')}
          </Text>
          {order.customer?.phone && (
            <View style={styles.infoRow}>
              <IconButton icon="phone" size={20} style={styles.icon} iconColor={colors.mutedForeground} />
              <Text variant="bodyMedium" style={styles.infoText}>{order.customer.phone}</Text>
            </View>
          )}
          {order.delivery_address && order.order_type === 'delivery' && (
            <>
              <Divider style={styles.divider} />
              <Text variant="titleMedium" style={styles.subsectionTitle}>
                {t('profile.addresses')}
              </Text>
              <Text variant="bodyMedium" style={{ color: colors.foreground }}>
                {order.delivery_address.street}, {order.delivery_address.number}
              </Text>
              <Text variant="bodyMedium" style={{ color: colors.foreground }}>
                {order.delivery_address.neighborhood} - {order.delivery_address.city}
              </Text>
              {order.delivery_address.complement && (
                <Text variant="bodySmall" style={styles.complement}>
                  {order.delivery_address.complement}
                </Text>
              )}
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {t('orders.orderItems')}
          </Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text variant="titleMedium" style={styles.quantity}>
                {item.quantity}x
              </Text>
              <View style={styles.itemDetails}>
                <Text variant="bodyLarge" style={styles.itemName}>{item.menu_item?.name}</Text>
                <Text variant="bodyMedium" style={styles.itemPrice}>
                  R$ {(item.unit_price ?? 0).toFixed(2)}
                </Text>
                {item.special_instructions && (
                  <Text variant="bodySmall" style={styles.instructions}>
                    ⚠️ {item.special_instructions}
                  </Text>
                )}
              </View>
              <Text variant="bodyLarge" style={styles.itemTotal}>
                R$ {(item.quantity * (item.unit_price ?? 0)).toFixed(2)}
              </Text>
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.totalRow}>
            <Text variant="titleLarge" style={styles.totalLabel}>{t('orders.total')}</Text>
            <Text variant="titleLarge" style={styles.totalAmount}>
              R$ {order.total_amount.toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {order.special_instructions && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('orders.specialInstructions')}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.foreground }}>{order.special_instructions}</Text>
          </Card.Content>
        </Card>
      )}

      {nextStatus && (
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => handleStatusChange(nextStatus)}
            style={styles.actionButton}
            icon={
              nextStatus === 'confirmed'
                ? 'check'
                : nextStatus === 'preparing'
                ? 'chef-hat'
                : nextStatus === 'ready'
                ? 'bell'
                : 'truck-delivery'
            }
            accessibilityRole="button"
            accessibilityLabel={`Mark order as ${nextStatus}`}
          >
            {getStatusLabel(nextStatus)}
          </Button>
        </View>
      )}

      {/* Cash Payment Confirmation — visible when order is not completed/cancelled */}
      {order.status !== 'completed' && order.status !== 'cancelled' && (
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleConfirmCashPayment}
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            icon="cash"
            loading={confirmingCash}
            disabled={confirmingCash}
            accessibilityRole="button"
            accessibilityLabel="Confirm cash payment"
          >
            Confirmar Pagamento em Dinheiro
          </Button>
        </View>
      )}

      {['pending', 'confirmed'].includes(order.status) && (
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleCancelOrder}
            style={styles.cancelButton}
            textColor={colors.destructive}
            icon="close-circle"
            accessibilityRole="button"
            accessibilityLabel="Cancel this order"
          >
            {t('orders.cancelOrder')}
          </Button>
        </View>
      )}
    </ScrollView>
    </ScreenContainer>
  );
}
