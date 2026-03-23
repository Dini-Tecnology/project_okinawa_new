/**
 * CookStationScreen — Filtered KDS View for Kitchen Stations
 *
 * A NON-DESTRUCTIVE adaptation of the existing KDSScreen that shows
 * only orders routed to the cook's selected station. Filters out bar
 * items (beverages, cocktails) and shows only food categories.
 *
 * Station types: Grelhados (grilled), Frios (cold), Massas (pasta)
 *
 * Features:
 * - Station selector header with tabs
 * - Stats header: pending / preparing / ready counts
 * - Order cards with touch-friendly "Pronto!" button
 * - Late order highlighting (>= 15 min)
 * - WebSocket real-time updates
 * - Full i18n support
 *
 * @module cook/CookStationScreen
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Text, Card, Chip, IconButton, Button, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { ptBR as dateFnsPtBR } from 'date-fns/locale';
import socketService from '../../services/socket';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors, useOkinawaTheme } from '@okinawa/shared/contexts/ThemeContext';
import type { Order, OrderStatus } from '../../types';

// ============================================
// TYPES
// ============================================

type Station = 'grelhados' | 'frios' | 'massas';

interface StationConfig {
  labelKey: string;
  emoji: string;
  keywords: string[];
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Station configuration with keyword-based item filtering.
 * Keywords are matched against menu_item.name to determine station routing.
 */
const STATION_CONFIG: Record<Station, StationConfig> = {
  grelhados: {
    labelKey: 'cook.station.grelhados',
    emoji: '\uD83D\uDD25',
    keywords: ['Fil\u00e9', 'Salm\u00e3o', 'Polvo', 'Picanha', 'Costela', 'Salmao'],
  },
  frios: {
    labelKey: 'cook.station.frios',
    emoji: '\u2744\uFE0F',
    keywords: ['Tartare', 'Ceviche', 'Burrata', 'Carpaccio', 'Salada'],
  },
  massas: {
    labelKey: 'cook.station.massas',
    emoji: '\uD83C\uDF5D',
    keywords: ['Risoto', 'Risotto', 'Ravioli', 'Fettuccine', 'Penne', 'Gnocchi'],
  },
};

/** Delay threshold in minutes for late order highlighting */
const KITCHEN_LATE_MINUTES = 15;

/** All station keys for iteration */
const ALL_STATIONS: Station[] = ['grelhados', 'frios', 'massas'];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Returns items from an order that belong to the selected station.
 */
const getRelevantItems = (order: Order, station: Station) => {
  const keywords = STATION_CONFIG[station].keywords;
  return order.items.filter((item) =>
    keywords.some((kw) => item.menu_item?.name?.includes(kw)),
  );
};

/**
 * Checks if an order has items relevant to the given station.
 */
const hasStationItems = (order: Order, station: Station): boolean => {
  return getRelevantItems(order, station).length > 0;
};

/**
 * Calculates elapsed minutes since order creation.
 */
const getTimeElapsed = (createdAt: string): number => {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
};

/**
 * Checks if an order is considered late (>= 15 minutes).
 */
const isLate = (createdAt: string): boolean => {
  return getTimeElapsed(createdAt) >= KITCHEN_LATE_MINUTES;
};

/**
 * Counts orders for a station by status.
 */
const getStationCount = (station: Station, orders: Order[], statuses: string[]): number => {
  return orders.filter(
    (o) => statuses.includes(o.status) && hasStationItems(o, station),
  ).length;
};

// ============================================
// COMPONENT
// ============================================

export default function CookStationScreen() {
  const { t } = useI18n();
  const { isDark } = useOkinawaTheme();
  const colors = useColors();
  const { width: screenWidth } = useWindowDimensions();

  // State
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station>('grelhados');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine column count based on screen width (tablet vs phone)
  const isTablet = screenWidth >= 768;
  const numColumns = isTablet ? 2 : 1;

  // ============================================
  // STATUS COLORS
  // ============================================

  const statusColors: Record<OrderStatus, string> = useMemo(
    () => ({
      pending: colors.warning,
      confirmed: colors.info,
      preparing: colors.secondary,
      ready: colors.success,
      delivering: colors.info,
      completed: colors.success,
      cancelled: colors.error,
    }),
    [colors],
  );

  // ============================================
  // DATA LOADING
  // ============================================

  const loadActiveOrders = useCallback(async (station?: Station) => {
    try {
      const stationParam = station || selectedStation;
      const orders = await ApiService.getKitchenOrders({ station: stationParam });
      setActiveOrders(orders);
    } catch (error) {
      console.error('Failed to load kitchen orders:', error);
      setActiveOrders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStation]);

  useEffect(() => {
    loadActiveOrders();

    socketService.connect();

    const handleNewOrder = (order: Order) => {
      setActiveOrders((prev) => [order, ...prev]);
    };

    const handleUpdatedOrder = (order: Order) => {
      setActiveOrders((prev) =>
        prev.map((o) => (o.id === order.id ? order : o)),
      );
    };

    socketService.on('order:new', handleNewOrder);
    socketService.on('order:updated', handleUpdatedOrder);

    return () => {
      socketService.off('order:new');
      socketService.off('order:updated');
    };
  }, []);

  // Reload when station changes
  useEffect(() => {
    loadActiveOrders(selectedStation);
  }, [selectedStation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadActiveOrders();
    setRefreshing(false);
  }, [loadActiveOrders]);

  // ============================================
  // ORDER ACTIONS
  // ============================================

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      try {
        await ApiService.updateOrderStatus(orderId, status);
        setActiveOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
        );
      } catch (error) {
        Alert.alert(t('common.error'), t('errors.generic'));
      }
    },
    [t],
  );

  // ============================================
  // FILTERED & COMPUTED DATA
  // ============================================

  /** Orders filtered by current station that have relevant items */
  const filteredOrders = useMemo(() => {
    return activeOrders
      .filter(
        (o) =>
          ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status) &&
          hasStationItems(o, selectedStation),
      )
      .sort((a, b) => {
        // Sort: ready first, then preparing, then confirmed/pending
        const statusOrder: Record<string, number> = {
          ready: 0,
          preparing: 1,
          confirmed: 2,
          pending: 3,
        };
        const statusDiff = (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
        if (statusDiff !== 0) return statusDiff;
        // Within same status, oldest first
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  }, [activeOrders, selectedStation]);

  /** Stats counts per status */
  const stats = useMemo(
    () => ({
      pending: getStationCount(selectedStation, activeOrders, ['pending', 'confirmed']),
      preparing: getStationCount(selectedStation, activeOrders, ['preparing']),
      ready: getStationCount(selectedStation, activeOrders, ['ready']),
    }),
    [activeOrders, selectedStation],
  );

  /** Station item counts for tabs */
  const stationCounts = useMemo(() => {
    const counts: Record<Station, number> = { grelhados: 0, frios: 0, massas: 0 };
    ALL_STATIONS.forEach((station) => {
      counts[station] = getStationCount(station, activeOrders, [
        'pending',
        'confirmed',
        'preparing',
      ]);
    });
    return counts;
  }, [activeOrders]);

  // ============================================
  // STYLES
  // ============================================

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.backgroundSecondary,
        },
        header: {
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        titleRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
        },
        headerTitle: {
          color: colors.foreground,
          fontWeight: 'bold',
          fontSize: 24,
        },
        // Station Selector Tabs
        stationTabs: {
          flexDirection: 'row',
          paddingHorizontal: 12,
          paddingBottom: 12,
          gap: 8,
        },
        stationTab: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: colors.backgroundTertiary,
          gap: 6,
        },
        stationTabActive: {
          backgroundColor: colors.primary,
        },
        stationTabText: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.foregroundSecondary,
        },
        stationTabTextActive: {
          color: colors.primaryForeground,
        },
        stationTabCount: {
          fontSize: 12,
          fontWeight: 'bold',
          color: colors.foregroundMuted,
        },
        stationTabCountActive: {
          color: colors.primaryForeground,
        },
        // Stats Header
        statsRow: {
          flexDirection: 'row',
          padding: 12,
          gap: 8,
        },
        statCard: {
          flex: 1,
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 12,
          alignItems: 'center',
          elevation: 1,
        },
        statNumber: {
          fontWeight: 'bold',
          marginTop: 6,
          color: colors.foreground,
          fontSize: 22,
        },
        statLabel: {
          color: colors.foregroundMuted,
          marginTop: 4,
          fontSize: 12,
        },
        // Order Cards
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
          borderRadius: 16,
        },
        lateCard: {
          borderWidth: 2,
          borderColor: colors.error,
          backgroundColor: colors.errorBackground,
        },
        orderHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 16,
        },
        tableNumber: {
          fontSize: 28,
          fontWeight: 'bold',
          color: colors.foreground,
        },
        orderTime: {
          color: colors.foregroundSecondary,
          marginTop: 4,
          fontSize: 12,
        },
        lateTimeText: {
          color: colors.error,
          fontWeight: 'bold',
        },
        statusChip: {
          height: 28,
        },
        chipText: {
          color: colors.primaryForeground,
          fontSize: 12,
        },
        // Items
        orderItems: {
          marginBottom: 16,
        },
        itemRow: {
          flexDirection: 'row',
          marginBottom: 12,
          alignItems: 'center',
        },
        quantityBadge: {
          width: 48,
          height: 48,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.backgroundTertiary,
          marginRight: 12,
        },
        quantityText: {
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.primary,
        },
        itemDetails: {
          flex: 1,
        },
        itemName: {
          color: colors.foreground,
          fontSize: 16,
          fontWeight: '500',
        },
        instructions: {
          color: colors.warning,
          marginTop: 4,
          fontStyle: 'italic',
          fontSize: 13,
        },
        // Action Buttons
        actionButton: {
          width: '100%',
          height: 56,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        startButton: {
          backgroundColor: colors.warning,
        },
        readyButton: {
          backgroundColor: colors.success,
        },
        actionButtonText: {
          color: colors.primaryForeground,
          fontWeight: 'bold',
          fontSize: 16,
          letterSpacing: 0.5,
        },
        // Footer
        orderFooter: {
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        // Empty state
        emptyContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 64,
        },
        emptyTitle: {
          color: colors.foreground,
          marginTop: 16,
          fontWeight: '600',
        },
        emptySubtitle: {
          color: colors.foregroundMuted,
          marginTop: 8,
          textAlign: 'center',
          paddingHorizontal: 32,
        },
        // Late alert
        lateAlertRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginBottom: 8,
        },
        lateAlertText: {
          color: colors.error,
          fontWeight: 'bold',
          fontSize: 12,
        },
      }),
    [colors],
  );

  // ============================================
  // RENDERERS
  // ============================================

  const renderStationTab = useCallback(
    (station: Station) => {
      const config = STATION_CONFIG[station];
      const isActive = selectedStation === station;
      const count = stationCounts[station];

      return (
        <TouchableOpacity
          key={station}
          style={[styles.stationTab, isActive && styles.stationTabActive]}
          onPress={() => setSelectedStation(station)}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          testID={`station-tab-${station}`}
        >
          <Text style={{ fontSize: 16 }}>{config.emoji}</Text>
          <Text
            style={[
              styles.stationTabText,
              isActive && styles.stationTabTextActive,
            ]}
          >
            {t(config.labelKey)}
          </Text>
          <Text
            style={[
              styles.stationTabCount,
              isActive && styles.stationTabCountActive,
            ]}
          >
            ({count})
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedStation, stationCounts, styles, t],
  );

  const renderOrderCard = useCallback(
    ({ item }: { item: Order }) => {
      const minutesElapsed = getTimeElapsed(item.created_at);
      const orderIsLate = isLate(item.created_at);
      const relevantItems = getRelevantItems(item, selectedStation);

      return (
        <Card
          style={[styles.orderCard, orderIsLate && styles.lateCard]}
          testID="order-card"
        >
          <Card.Content>
            {/* Late Alert */}
            {orderIsLate && (
              <View style={styles.lateAlertRow}>
                <Icon name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.lateAlertText}>
                  {t('cook.ticket.lateAlert')}
                </Text>
              </View>
            )}

            {/* Header: Table number + Status + Timer */}
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.tableNumber}>
                  {t('tables.table')} #{item.order_number || item.id.slice(0, 8)}
                </Text>
                <Text
                  style={[
                    styles.orderTime,
                    orderIsLate && styles.lateTimeText,
                  ]}
                >
                  {format(new Date(item.created_at), 'HH:mm', {
                    locale: dateFnsPtBR,
                  })}{' '}
                  - {t('cook.ticket.elapsed', { min: String(minutesElapsed) })}
                </Text>
              </View>
              <Chip
                style={[
                  styles.statusChip,
                  { backgroundColor: statusColors[item.status] },
                ]}
                textStyle={styles.chipText}
              >
                {t(`orders.status.${item.status}`)}
              </Chip>
            </View>

            {/* Relevant Items for this station */}
            <View style={styles.orderItems}>
              {relevantItems.map((orderItem, index) => (
                <View key={orderItem.id || index} style={styles.itemRow}>
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>
                      {orderItem.quantity}x
                    </Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>
                      {orderItem.menu_item?.name}
                    </Text>
                    {orderItem.special_instructions && (
                      <Text style={styles.instructions}>
                        {orderItem.special_instructions}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.orderFooter}>
              {item.status === 'confirmed' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.startButton]}
                  onPress={() => updateOrderStatus(item.id, 'preparing')}
                  activeOpacity={0.8}
                  testID="start-preparing-button"
                >
                  <Text style={styles.actionButtonText}>
                    {t('cook.action.startPreparing')}
                  </Text>
                </TouchableOpacity>
              )}
              {item.status === 'preparing' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.readyButton]}
                  onPress={() => updateOrderStatus(item.id, 'ready')}
                  activeOpacity={0.8}
                  testID="mark-ready-button"
                >
                  <Text style={styles.actionButtonText}>
                    {t('cook.action.ready')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card.Content>
        </Card>
      );
    },
    [selectedStation, statusColors, styles, colors, t, updateOrderStatus],
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>{t('cook.title')}</Text>
          <Text style={{ color: colors.foregroundMuted, fontSize: 14 }}>
            {t('cook.myStation')}
          </Text>
        </View>

        {/* Station Selector Tabs */}
        <View style={styles.stationTabs} testID="station-tabs">
          {ALL_STATIONS.map(renderStationTab)}
        </View>
      </View>

      {/* Stats Header */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Icon name="clock-outline" size={24} color={colors.warning} />
          <Text variant="headlineSmall" style={styles.statNumber}>
            {stats.pending}
          </Text>
          <Text style={styles.statLabel}>{t('cook.pending')}</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="fire" size={24} color={colors.secondary} />
          <Text variant="headlineSmall" style={styles.statNumber}>
            {stats.preparing}
          </Text>
          <Text style={styles.statLabel}>{t('cook.preparing')}</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="check-circle" size={24} color={colors.success} />
          <Text variant="headlineSmall" style={styles.statNumber}>
            {stats.ready}
          </Text>
          <Text style={styles.statLabel}>{t('cook.ready')}</Text>
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        numColumns={numColumns}
        key={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chef-hat" size={64} color={colors.foregroundMuted} />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              {t('cook.station.noTickets')}
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              {t('cook.station.noTicketsSub', {
                station: t(STATION_CONFIG[selectedStation].labelKey),
              })}
            </Text>
          </View>
        }
      />
    </View>
  );
}
