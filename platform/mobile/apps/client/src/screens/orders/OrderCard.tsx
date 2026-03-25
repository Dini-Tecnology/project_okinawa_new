import React, { memo, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@okinawa/shared/hooks/useI18n';
import { formatCurrency, formatDateTime } from '@okinawa/shared/utils/formatters';
import { getLanguage } from '@okinawa/shared/i18n';

import type { Order, OrderStatus } from '../../types';

interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
  onTrack: (order: Order) => void;
  onCancel: (order: Order) => void;
  canTrack: boolean;
  canCancel: boolean;
}

const STATUS_KEYS: Record<OrderStatus, string> = {
  pending: 'orders.status.pending',
  confirmed: 'orders.status.confirmed',
  preparing: 'orders.status.preparing',
  ready: 'orders.status.ready',
  delivering: 'orders.status.delivering',
  completed: 'orders.status.completed',
  cancelled: 'orders.status.cancelled',
};

const STATUS_ICONS: Record<OrderStatus, string> = {
  pending: 'clock-outline',
  confirmed: 'check-circle-outline',
  preparing: 'chef-hat',
  ready: 'food',
  delivering: 'truck-delivery',
  completed: 'check-circle',
  cancelled: 'close-circle-outline',
};

const OrderCard = memo<OrderCardProps>(({
  order,
  onPress,
  onTrack,
  onCancel,
  canTrack,
  canCancel,
}) => {
  const colors = useColors();
  const { t } = useI18n();
  const locale = getLanguage();

  const getStatusColor = useCallback((status: OrderStatus): string => {
    const statusColors: Record<OrderStatus, string> = {
      pending: colors.warning,
      confirmed: colors.info,
      preparing: colors.secondary,
      ready: colors.success,
      delivering: colors.info,
      completed: colors.success,
      cancelled: colors.destructive,
    };
    return statusColors[status] || colors.mutedForeground;
  }, [colors]);

  const statusColor = getStatusColor(order.status);
  const statusLabel = t(STATUS_KEYS[order.status]);
  const statusIcon = STATUS_ICONS[order.status];

  const styles = useMemo(() => StyleSheet.create({
    orderCard: {
      marginBottom: 16,
      elevation: 2,
      backgroundColor: colors.card,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    orderHeaderLeft: {
      flex: 1,
      marginRight: 8,
    },
    orderNumber: {
      color: colors.mutedForeground,
      marginTop: 4,
    },
    statusChip: {
      height: 28,
    },
    statusChipText: {
      color: colors.primaryForeground,
      fontSize: 12,
    },
    divider: {
      marginVertical: 12,
      backgroundColor: colors.border,
    },
    itemsSection: {
      marginBottom: 8,
    },
    sectionTitle: {
      fontWeight: '600',
      marginBottom: 8,
      color: colors.foreground,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    itemQuantity: {
      minWidth: 30,
      fontWeight: '600',
      color: colors.mutedForeground,
    },
    itemName: {
      flex: 1,
      color: colors.foreground,
    },
    moreItems: {
      marginTop: 4,
      color: colors.mutedForeground,
      fontStyle: 'italic',
    },
    infoSection: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoIcon: {
      margin: 0,
      padding: 0,
      marginRight: 4,
    },
    actionsSection: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 8,
    },
    actionButton: {
      alignItems: 'center',
      padding: 8,
    },
    cancelButton: {
      opacity: 0.8,
    },
  }), [colors]);

  return (
    <TouchableOpacity onPress={() => onPress(order)}>
      <Card style={styles.orderCard}>
        <Card.Content>
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Text variant="titleMedium" style={{ color: colors.foreground }}>
                {order.restaurant?.name || t('orders.restaurant')}
              </Text>
              <Text variant="bodySmall" style={styles.orderNumber}>
                {t('orders.orderNumber', { number: order.order_number || order.id.slice(0, 8) })}
              </Text>
            </View>
            <Chip
              icon={statusIcon}
              style={[styles.statusChip, { backgroundColor: statusColor }]}
              textStyle={styles.statusChipText}
            >
              {statusLabel}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          {/* Items Summary */}
          <View style={styles.itemsSection}>
            <Text variant="bodyMedium" style={styles.sectionTitle}>
              {t('orders.itemsCount', { count: order.items.length })}
            </Text>
            {order.items.slice(0, 3).map((orderItem, index) => (
              <View key={index} style={styles.itemRow}>
                <Text variant="bodySmall" style={styles.itemQuantity}>
                  {orderItem.quantity}x
                </Text>
                <Text
                  variant="bodySmall"
                  numberOfLines={1}
                  style={styles.itemName}
                >
                  {orderItem.menu_item?.name || 'Item'}
                </Text>
              </View>
            ))}
            {order.items.length > 3 && (
              <Text variant="bodySmall" style={styles.moreItems}>
                {t('orders.moreItems', { count: order.items.length - 3 })}
              </Text>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Order Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <IconButton icon="calendar" size={16} style={styles.infoIcon} iconColor={colors.mutedForeground} />
              <Text variant="bodySmall" style={{ color: colors.foreground }}>
                {formatDateTime(order.created_at, locale)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <IconButton icon="cash" size={16} style={styles.infoIcon} iconColor={colors.mutedForeground} />
              <Text variant="bodySmall" style={{ color: colors.foreground }}>
                {formatCurrency(order.total_amount, locale)}
              </Text>
            </View>

            {order.order_type && (
              <View style={styles.infoRow}>
                <IconButton
                  icon={
                    order.order_type === 'delivery'
                      ? 'truck-delivery'
                      : order.order_type === 'pickup'
                      ? 'package-variant'
                      : 'silverware-fork-knife'
                  }
                  size={16}
                  style={styles.infoIcon}
                  iconColor={colors.mutedForeground}
                />
                <Text variant="bodySmall" style={{ color: colors.foreground }}>
                  {t(`orders.orderType.${order.order_type === 'delivery' ? 'delivery' : order.order_type === 'pickup' ? 'pickup' : 'dine_in'}`)}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          {(canTrack || canCancel) && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.actionsSection}>
                {canTrack && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onTrack(order)}
                  >
                    <IconButton icon="map-marker-path" size={20} iconColor={colors.primary} />
                    <Text variant="bodySmall" style={{ color: colors.foreground }}>{t('orders.track')}</Text>
                  </TouchableOpacity>
                )}
                {canCancel && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => onCancel(order)}
                  >
                    <IconButton icon="close-circle-outline" size={20} iconColor={colors.destructive} />
                    <Text variant="bodySmall" style={{ color: colors.foreground }}>{t('orders.cancel')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.order.id === nextProps.order.id &&
    prevProps.order.status === nextProps.order.status &&
    prevProps.canTrack === nextProps.canTrack &&
    prevProps.canCancel === nextProps.canCancel
  );
});

OrderCard.displayName = 'OrderCard';

export default OrderCard;