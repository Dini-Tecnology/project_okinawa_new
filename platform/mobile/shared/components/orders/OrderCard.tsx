import React, { memo, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton, Divider } from 'react-native-paper';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface OrderCardItem {
  quantity: number;
  unit_price?: number;
  menu_item?: { name?: string };
  special_instructions?: string;
}

export interface OrderCardOrder {
  id: string;
  order_number?: string;
  status: OrderStatus;
  items: OrderCardItem[];
  total_amount: number;
  created_at: string;
  table_number?: string | number;
  table_id?: string;
  customer_name?: string;
  customer?: { full_name?: string };
  restaurant?: { name?: string };
  order_type?: 'dine_in' | 'pickup' | 'delivery';
  delivery_address?: any;
  payment_method?: string;
}

export interface OrderCardProps {
  /** The order object to display */
  order: OrderCardOrder;
  /** Callback when the card is pressed */
  onPress?: ((order: OrderCardOrder) => void) | (() => void);
  /** Callback when tracking is requested (client-side) */
  onTrack?: ((order: OrderCardOrder) => void) | (() => void);
  /** Callback when cancellation is requested (client-side) */
  onCancel?: ((order: OrderCardOrder) => void) | (() => void);
  /** Callback when status change is requested (restaurant-side) */
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  /** Whether the card can show a track action */
  canTrack?: boolean;
  /** Whether the card can show a cancel action */
  canCancel?: boolean;
  /** Whether restaurant-specific actions should be shown */
  showActions?: boolean;
  /** Compact mode: hides item list & delivery info */
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_ICONS: Record<string, string> = {
  pending: 'clock-outline',
  confirmed: 'check-circle-outline',
  preparing: 'chef-hat',
  ready: 'food',
  delivering: 'truck-delivery',
  delivered: 'check-all',
  completed: 'check-circle',
  cancelled: 'close-circle-outline',
  refunded: 'cash-refund',
};

const getStatusLabel = (status: string): string => {
  return t(`orders.status.${status}`) || status;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const OrderCard = memo<OrderCardProps>(
  ({
    order,
    onPress,
    onTrack,
    onCancel,
    onStatusChange,
    canTrack: canTrackProp,
    canCancel: canCancelProp,
    showActions = false,
    compact = false,
  }) => {
    const colors = useColors();

    // Derive canTrack / canCancel from props or defaults
    const canTrack =
      canTrackProp ??
      ['confirmed', 'preparing', 'ready', 'delivering'].includes(order.status);
    const canCancel =
      canCancelProp ?? ['pending', 'confirmed'].includes(order.status);

    // ------------------------------------------------------------------
    // Status color using theme tokens
    // ------------------------------------------------------------------
    const getStatusColor = useCallback(
      (status: string): string => {
        const map: Record<string, string> = {
          pending: colors.warning,
          confirmed: colors.info,
          preparing: colors.secondary,
          ready: colors.success,
          delivering: colors.info,
          delivered: colors.success,
          completed: colors.success,
          cancelled: colors.error,
          refunded: colors.error,
        };
        return map[status] || colors.foregroundMuted;
      },
      [colors],
    );

    // ------------------------------------------------------------------
    // Time elapsed
    // ------------------------------------------------------------------
    const minutesElapsed = useMemo(() => {
      const diff = Date.now() - new Date(order.created_at).getTime();
      return Math.floor(diff / 60000);
    }, [order.created_at]);

    // ------------------------------------------------------------------
    // Next status (restaurant workflow)
    // ------------------------------------------------------------------
    const getNextStatus = useCallback(
      (current: OrderStatus): OrderStatus | null => {
        const flow: Record<string, OrderStatus | null> = {
          pending: 'confirmed',
          confirmed: 'preparing',
          preparing: 'ready',
          ready: 'delivering',
          delivering: 'completed',
          completed: null,
          cancelled: null,
          delivered: null,
          refunded: null,
        };
        return flow[current] ?? null;
      },
      [],
    );

    const nextStatus = getNextStatus(order.status);

    // ------------------------------------------------------------------
    // Handlers
    // ------------------------------------------------------------------
    const handlePress = useCallback(() => {
      if (onPress) {
        // Support both callback signatures: (order) => void and () => void
        (onPress as (order: OrderCardOrder) => void)(order);
      }
    }, [onPress, order]);

    const handleTrack = useCallback(() => {
      if (onTrack) {
        (onTrack as (order: OrderCardOrder) => void)(order);
      }
    }, [onTrack, order]);

    const handleCancel = useCallback(() => {
      if (onCancel) {
        (onCancel as (order: OrderCardOrder) => void)(order);
      }
    }, [onCancel, order]);

    const handleStatusChange = useCallback(() => {
      if (nextStatus && onStatusChange) {
        onStatusChange(order.id, nextStatus);
      }
    }, [nextStatus, onStatusChange, order.id]);

    // ------------------------------------------------------------------
    // Derived values
    // ------------------------------------------------------------------
    const statusColor = getStatusColor(order.status);
    const statusLabel = getStatusLabel(order.status);
    const statusIcon = STATUS_ICONS[order.status] || 'help-circle-outline';
    const isUrgent = minutesElapsed > 20;
    const displayName =
      order.customer_name ||
      order.customer?.full_name ||
      order.restaurant?.name ||
      '';

    // ------------------------------------------------------------------
    // Styles (memoized on colors)
    // ------------------------------------------------------------------
    const styles = useMemo(
      () =>
        StyleSheet.create({
          card: {
            marginBottom: 16,
            elevation: 2,
            backgroundColor: colors.card,
          },
          urgentCard: {
            borderLeftWidth: 4,
            borderLeftColor: colors.error,
          },
          header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          },
          headerLeft: {
            flex: 1,
            marginRight: 8,
          },
          subtitle: {
            color: colors.foregroundMuted,
            marginTop: 4,
          },
          statusChip: {
            height: 28,
          },
          chipText: {
            color: '#fff',
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
            alignItems: 'flex-start',
            marginBottom: 6,
          },
          itemQuantity: {
            fontWeight: '600',
            minWidth: 36,
            color: colors.primary,
          },
          itemDetails: {
            flex: 1,
          },
          itemName: {
            color: colors.foreground,
          },
          instructions: {
            color: '#FF6F00',
            marginTop: 2,
            fontStyle: 'italic',
          },
          moreItems: {
            marginTop: 4,
            color: colors.foregroundMuted,
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
          infoText: {
            color: colors.foreground,
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
          restaurantActionButton: {
            marginLeft: 8,
          },
          readyButton: {
            backgroundColor: '#00C853',
          },
          footer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
          deliveryInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
          address: {
            flex: 1,
            color: colors.foregroundMuted,
          },
        }),
      [colors],
    );

    // ------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------
    const renderItemsList = () => {
      if (compact) return null;
      return (
        <>
          <View style={styles.itemsSection}>
            <Text variant="bodyMedium" style={styles.sectionTitle}>
              {t('orders.card.items')} ({order.items.length})
            </Text>
            {order.items.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text variant="titleMedium" style={styles.itemQuantity}>
                  {item.quantity}x
                </Text>
                <View style={styles.itemDetails}>
                  <Text
                    variant="bodyMedium"
                    numberOfLines={1}
                    style={styles.itemName}
                  >
                    {item.menu_item?.name || 'Item'}
                  </Text>
                  {item.special_instructions ? (
                    <Text variant="bodySmall" style={styles.instructions}>
                      {item.special_instructions}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
            {order.items.length > 3 && (
              <Text variant="bodySmall" style={styles.moreItems}>
                +{order.items.length - 3} {t('orders.card.items').toLowerCase()}
              </Text>
            )}
          </View>
          <Divider style={styles.divider} />
        </>
      );
    };

    const renderInfo = () => (
      <View style={styles.infoSection}>
        {/* Time */}
        <View style={styles.infoRow}>
          <IconButton
            icon="clock-outline"
            size={16}
            style={styles.infoIcon}
            iconColor={colors.foregroundMuted}
          />
          <Text variant="bodySmall" style={styles.infoText}>
            {t('orders.card.timeAgo', { minutes: String(minutesElapsed) })}
          </Text>
        </View>

        {/* Total */}
        <View style={styles.infoRow}>
          <IconButton
            icon="cash"
            size={16}
            style={styles.infoIcon}
            iconColor={colors.foregroundMuted}
          />
          <Text variant="bodySmall" style={styles.infoText}>
            {t('orders.card.total')}: R$ {order.total_amount.toFixed(2)}
          </Text>
        </View>

        {/* Table number */}
        {(order.table_number || order.table_id) && (
          <View style={styles.infoRow}>
            <IconButton
              icon="silverware-fork-knife"
              size={16}
              style={styles.infoIcon}
              iconColor={colors.foregroundMuted}
            />
            <Text variant="bodySmall" style={styles.infoText}>
              {t('orders.card.table')} {order.table_number || order.table_id}
            </Text>
          </View>
        )}
      </View>
    );

    const renderClientActions = () => {
      if (!(canTrack || canCancel)) return null;
      if (!onTrack && !onCancel) return null;
      return (
        <>
          <Divider style={styles.divider} />
          <View style={styles.actionsSection}>
            {canTrack && onTrack && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleTrack}
                accessibilityRole="button"
                accessibilityLabel={t('orders.trackOrder')}
              >
                <IconButton
                  icon="map-marker-path"
                  size={20}
                  iconColor={colors.primary}
                />
                <Text variant="bodySmall" style={{ color: colors.foreground }}>
                  {t('orders.trackOrder')}
                </Text>
              </TouchableOpacity>
            )}
            {canCancel && onCancel && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                accessibilityRole="button"
                accessibilityLabel={t('orders.cancelOrder')}
              >
                <IconButton
                  icon="close-circle-outline"
                  size={20}
                  iconColor={colors.error}
                />
                <Text variant="bodySmall" style={{ color: colors.foreground }}>
                  {t('orders.cancelOrder')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      );
    };

    const renderDeliveryInfo = () => {
      if (
        compact ||
        !order.delivery_address ||
        order.order_type !== 'delivery'
      ) {
        return null;
      }
      return (
        <View style={styles.deliveryInfo}>
          <IconButton
            icon="map-marker"
            size={16}
            style={styles.infoIcon}
            iconColor={colors.foregroundMuted}
          />
          <Text
            variant="bodySmall"
            numberOfLines={2}
            style={styles.address}
          >
            {order.delivery_address.street}
            {order.delivery_address.number
              ? `, ${order.delivery_address.number}`
              : ''}
            {order.delivery_address.neighborhood
              ? ` - ${order.delivery_address.neighborhood}`
              : ''}
          </Text>
        </View>
      );
    };

    // ------------------------------------------------------------------
    // Main render
    // ------------------------------------------------------------------
    const cardContent = (
      <Card style={[styles.card, isUrgent && styles.urgentCard]}>
        <Card.Content>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text
                variant={compact ? 'titleMedium' : 'titleLarge'}
                style={{ color: colors.foreground }}
              >
                {t('orders.orderNumber', {
                  number: order.order_number || order.id.slice(0, 8),
                })}
              </Text>
              {displayName ? (
                <Text variant="bodySmall" style={styles.subtitle}>
                  {displayName}
                </Text>
              ) : null}
            </View>
            <Chip
              icon={statusIcon}
              style={[styles.statusChip, { backgroundColor: statusColor }]}
              textStyle={styles.chipText}
            >
              {statusLabel}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          {/* Items */}
          {renderItemsList()}

          {/* Info row */}
          {renderInfo()}

          {/* Client actions: Track / Cancel */}
          {renderClientActions()}

          {/* Delivery address */}
          {renderDeliveryInfo()}
        </Card.Content>
      </Card>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${t('orders.orderDetails')}, ${statusLabel}`}
        >
          {cardContent}
        </TouchableOpacity>
      );
    }

    return cardContent;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.order.id === nextProps.order.id &&
      prevProps.order.status === nextProps.order.status &&
      prevProps.canTrack === nextProps.canTrack &&
      prevProps.canCancel === nextProps.canCancel &&
      prevProps.compact === nextProps.compact &&
      prevProps.showActions === nextProps.showActions
    );
  },
);

OrderCard.displayName = 'OrderCard';

export { OrderCard };
export default OrderCard;
