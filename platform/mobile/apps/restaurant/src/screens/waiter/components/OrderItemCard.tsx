/**
 * OrderItemCard — Order item card for the Pedidos sub-tab
 *
 * Shows item name, quantity, guest name, sent time, price,
 * and status-driven styling and actions.
 *
 * @module waiter/components/OrderItemCard
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import type { GuestOrderStatus } from '../types/waiter.types';

interface OrderItemCardProps {
  id: string;
  item: string;
  qty: number;
  price: number;
  status: GuestOrderStatus;
  guestName: string;
  hasApp: boolean;
  sentAt: string;
  onServe?: () => void;
}

function OrderItemCard({
  item,
  qty,
  price,
  status,
  guestName,
  hasApp,
  sentAt,
  onServe,
}: OrderItemCardProps) {
  const colors = useColors();

  const statusBorder = useMemo(() => {
    switch (status) {
      case 'ready':
        return colors.error + '50';
      case 'preparing':
        return colors.info + '30';
      case 'served':
        return colors.success + '30';
      default:
        return colors.border;
    }
  }, [colors, status]);

  const statusBg = useMemo(() => {
    switch (status) {
      case 'ready':
        return colors.error + '08';
      case 'preparing':
        return colors.info + '08';
      case 'served':
        return colors.success + '08';
      default:
        return colors.card;
    }
  }, [colors, status]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: 12,
          borderWidth: 1,
          borderColor: statusBorder,
          backgroundColor: statusBg,
          padding: 10,
          marginBottom: 4,
          opacity: status === 'served' ? 0.6 : 1,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        body: {
          flex: 1,
        },
        itemName: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.foreground,
        },
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: 2,
        },
        guestText: {
          fontSize: 10,
          color: hasApp ? colors.info : colors.warning,
        },
        timeText: {
          fontSize: 10,
          color: colors.foregroundMuted,
        },
        priceText: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.foreground,
        },
        serveBtn: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: colors.error,
          marginLeft: 4,
        },
        serveText: {
          fontSize: 10,
          fontWeight: '700',
          color: colors.primaryForeground,
        },
      }),
    [colors, statusBorder, statusBg, status, hasApp],
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.body}>
          <Text style={styles.itemName}>
            {qty}x {item}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.guestText}>
              {hasApp ? '\u{1F4F1}' : '\u{1F464}'} {guestName}
            </Text>
            <Text style={styles.timeText}>{'\u00B7'} {sentAt}</Text>
          </View>
        </View>
        <Text style={styles.priceText}>R$ {price * qty}</Text>
        {status === 'ready' && onServe && (
          <TouchableOpacity
            style={styles.serveBtn}
            onPress={onServe}
            accessibilityLabel="Servir prato"
            accessibilityRole="button"
          >
            <Text style={styles.serveText}>Servir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default React.memo(OrderItemCard);
