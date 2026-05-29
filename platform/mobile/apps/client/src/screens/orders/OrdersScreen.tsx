import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';
import {
  MOCK_COMANDA_ITEMS,
  MOCK_ORDERS,
  type MockOrderListItem,
} from '../../constants/ordersTabMocks';

function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

const STATUS_COLORS: Record<MockOrderListItem['status'], string> = {
  received: '#EA580C',
  preparing: '#D97706',
  ready: '#16A34A',
  delivered: '#6B7280',
};

/** Aba Pedidos — pedidos ativos (mock) + comanda da mesa */
export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const orders = MOCK_ORDERS;
  const comandaItems = MOCK_COMANDA_ITEMS;
  const hasOrders = orders.length > 0;
  const comandaTotal = useMemo(
    () => comandaItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [comandaItems],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        headerBtn: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.backgroundTertiary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        headerSpacer: {
          width: 40,
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.foreground,
        },
        scroll: { flex: 1 },
        content: {
          paddingHorizontal: 16,
          paddingBottom: 24,
          gap: 20,
        },
        sectionLabel: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 1,
          color: colors.foregroundSecondary,
          marginBottom: 10,
        },
        orderCard: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          borderRadius: 18,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          marginBottom: 10,
        },
        orderIcon: {
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: 'rgba(234, 88, 12, 0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        orderRestaurant: {
          fontSize: 15,
          fontWeight: '700',
          color: colors.foreground,
          marginBottom: 4,
        },
        orderMeta: {
          fontSize: 13,
          color: colors.foregroundSecondary,
        },
        statusPill: {
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 10,
        },
        statusText: {
          fontSize: 12,
          fontWeight: '700',
        },
        chevron: {
          marginLeft: 4,
        },
        emptyWrap: {
          alignItems: 'center',
          paddingVertical: 32,
          paddingHorizontal: 24,
        },
        receiptIconWrap: {
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.backgroundTertiary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        },
        emptyMessage: {
          fontSize: 15,
          color: colors.foregroundSecondary,
          textAlign: 'center',
          marginBottom: 20,
        },
        primaryBtn: {
          backgroundColor: colors.primary,
          paddingHorizontal: 28,
          paddingVertical: 12,
          borderRadius: 14,
        },
        primaryBtnText: {
          color: colors.primaryForeground,
          fontSize: 15,
          fontWeight: '700',
        },
        comandaItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          borderRadius: 16,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          marginBottom: 10,
        },
        itemImage: {
          width: 56,
          height: 56,
          borderRadius: 12,
          backgroundColor: colors.backgroundTertiary,
        },
        itemInfo: { flex: 1 },
        itemName: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: 4,
        },
        itemMeta: {
          fontSize: 13,
          color: colors.foregroundSecondary,
        },
        itemPrice: {
          fontSize: 15,
          fontWeight: '700',
          color: colors.foreground,
        },
        comandaFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 8,
        },
        totalLabel: {
          fontSize: 15,
          color: colors.foregroundSecondary,
        },
        totalValue: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.foreground,
        },
      }),
    [colors],
  );

  const openTracking = useCallback(
    (orderId: string) => {
      navigation.navigate('OrderTracking', { orderId });
    },
    [navigation],
  );

  const openMenu = useCallback(() => {
    navigation.navigate('MenuTab');
  }, [navigation]);

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Pedidos</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View>
              <Text style={styles.sectionLabel}>PEDIDOS ATIVOS</Text>
              {hasOrders ? (
                orders.map((order) => {
                  const statusColor = STATUS_COLORS[order.status];
                  return (
                    <TouchableOpacity
                      key={order.id}
                      style={styles.orderCard}
                      onPress={() => openTracking(order.id)}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel={`Pedido ${order.orderNumber}, ${order.statusLabel}`}
                    >
                      <View style={styles.orderIcon}>
                        <Ionicons name="receipt-outline" size={24} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderRestaurant}>{order.restaurantName}</Text>
                        <Text style={styles.orderMeta}>
                          #{order.orderNumber} · Mesa {order.tableNumber} · {order.placedAt}
                        </Text>
                        <Text style={styles.orderMeta}>
                          {order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'} ·{' '}
                          {formatPrice(order.totalAmount)}
                        </Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {order.statusLabel}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.foregroundMuted}
                        style={styles.chevron}
                      />
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyWrap}>
                  <View style={styles.receiptIconWrap}>
                    <Ionicons name="receipt-outline" size={40} color={colors.foregroundMuted} />
                  </View>
                  <Text style={styles.emptyMessage}>Nenhum pedido ativo no momento</Text>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={openMenu}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryBtnText}>Ver Cardápio</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {comandaItems.length > 0 ? (
              <View>
                <Text style={styles.sectionLabel}>MINHA COMANDA</Text>
                {comandaItems.map((item) => (
                  <View key={item.id} style={styles.comandaItem}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemMeta}>
                        {item.quantity}x · {formatPrice(item.unitPrice)}
                      </Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      {formatPrice(item.unitPrice * item.quantity)}
                    </Text>
                  </View>
                ))}
                <View style={styles.comandaFooter}>
                  <Text style={styles.totalLabel}>Total na comanda</Text>
                  <Text style={styles.totalValue}>{formatPrice(comandaTotal)}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
