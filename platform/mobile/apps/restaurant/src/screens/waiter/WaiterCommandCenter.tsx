/**
 * WaiterCommandCenter — Main waiter screen with 4 tabs
 *
 * Replaces WaiterDashboardScreen with a full command center:
 *   - Ao Vivo (Live Feed via WebSocket)
 *   - Mesas (Table Management with detail view)
 *   - Cozinha (Kitchen Pipeline)
 *   - Cobrar (Global Payment)
 *
 * Uses internal state-driven navigation (not React Navigation nesting).
 *
 * @module waiter/WaiterCommandCenter
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors, useOkinawaTheme } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@/shared/hooks/useI18n';

import LiveFeedTab from './tabs/LiveFeedTab';
import TablesTab from './tabs/TablesTab';
import TableDetailScreen from './tabs/TableDetailScreen';
import KitchenTab from './tabs/KitchenTab';
import ChargeTab from './tabs/ChargeTab';

import { useWaiterLiveFeed } from './hooks/useWaiterLiveFeed';
import { useWaiterTables } from './hooks/useWaiterTables';

import type { WaiterTab, LiveFeedEvent } from './types/waiter.types';

export default function WaiterCommandCenter() {
  const colors = useColors();
  const { isDark } = useOkinawaTheme();
  const { t } = useI18n();

  // Tab state
  const [activeTab, setActiveTab] = useState<WaiterTab>('live');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [pickedUpIds, setPickedUpIds] = useState<string[]>([]);

  // Hooks
  const liveFeed = useWaiterLiveFeed();
  const waiterTables = useWaiterTables();

  // readyDishCount comes from the live feed (kitchen_ready events not yet dismissed)
  // adjusted for dishes the waiter already picked up in this session
  const readyDishCount = Math.max(
    0,
    liveFeed.readyDishCount - pickedUpIds.length,
  );

  // Tab change handler — resets sub-navigation
  const handleTabChange = useCallback((tab: WaiterTab) => {
    setActiveTab(tab);
    setSelectedTable(null);
  }, []);

  // Handle live feed event action (navigate to appropriate tab)
  const handleEventAction = useCallback(
    (event: LiveFeedEvent) => {
      switch (event.type) {
        case 'kitchen_ready':
          setActiveTab('kitchen');
          break;
        case 'call':
          setActiveTab('tables');
          setSelectedTable(event.table);
          break;
        case 'payment_needed':
          setActiveTab('charge');
          break;
        default:
          break;
      }
    },
    [],
  );

  // Kitchen pickup handler
  const handlePickup = useCallback((dishId: string) => {
    setPickedUpIds((prev) => [...prev, dishId]);
    // In production: call PATCH /orders/:id/status { status: 'served' }
  }, []);

  // Tab definitions
  const TABS: Array<{ id: WaiterTab; labelKey: string; badge: number; icon: string }> = [
    { id: 'live', labelKey: 'waiter.tab.live', badge: liveFeed.urgentCount, icon: 'broadcast' },
    { id: 'tables', labelKey: 'waiter.tab.tables', badge: 0, icon: 'table-furniture' },
    { id: 'kitchen', labelKey: 'waiter.tab.kitchen', badge: readyDishCount, icon: 'chef-hat' },
    { id: 'charge', labelKey: 'waiter.tab.charge', badge: 0, icon: 'credit-card' },
  ];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.backgroundSecondary,
        },
        // Header
        header: {
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          backgroundColor: colors.primary,
        },
        headerTop: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        },
        headerShiftLabel: {
          fontSize: 10,
          fontWeight: '500',
          color: colors.primaryForeground + '99',
        },
        headerName: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.primaryForeground,
        },
        headerIcons: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        headerIconWrapper: {
          position: 'relative',
        },
        headerBadge: {
          position: 'absolute',
          top: -4,
          right: -4,
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: colors.error,
          alignItems: 'center',
          justifyContent: 'center',
        },
        headerBadgeText: {
          fontSize: 8,
          fontWeight: '700',
          color: colors.primaryForeground,
        },
        statsRow: {
          flexDirection: 'row',
          gap: 6,
        },
        statCard: {
          flex: 1,
          borderRadius: 8,
          paddingVertical: 6,
          alignItems: 'center',
        },
        statValue: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.primaryForeground,
        },
        statLabel: {
          fontSize: 8,
          color: colors.primaryForeground + '80',
          marginTop: 1,
        },
        // Tab bar
        tabBar: {
          flexDirection: 'row',
          backgroundColor: colors.card + 'CC',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        tabBtn: {
          flex: 1,
          paddingVertical: 10,
          alignItems: 'center',
          borderBottomWidth: 2,
          position: 'relative',
        },
        tabText: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBadge: {
          position: 'absolute',
          top: 4,
          right: '20%',
          minWidth: 16,
          height: 16,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        },
        tabBadgeText: {
          fontSize: 8,
          fontWeight: '700',
          color: colors.primaryForeground,
        },
        // Content
        content: {
          flex: 1,
        },
        // Loading / error full-screen states
        centered: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: colors.backgroundSecondary,
        },
        errorText: {
          fontSize: 14,
          color: colors.error,
          textAlign: 'center',
          marginBottom: 16,
        },
        retryBtn: {
          paddingHorizontal: 24,
          paddingVertical: 10,
          borderRadius: 8,
          backgroundColor: colors.primary,
        },
        retryBtnText: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.primaryForeground,
        },
      }),
    [colors],
  );

  // Get the table object for detail view
  const selectedTableData = selectedTable
    ? waiterTables.tables.find((tbl) => tbl.number === selectedTable)
    : null;

  // ---- Loading state (first fetch only) ----
  if (waiterTables.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.statLabel, { marginTop: 12, fontSize: 14 }]}>
          {t('waiter.loading')}
        </Text>
      </View>
    );
  }

  // ---- Error state ----
  if (waiterTables.isError) {
    return (
      <View style={styles.centered}>
        <Icon name="wifi-off" size={40} color={colors.error} />
        <Text style={[styles.errorText, { marginTop: 12 }]}>
          {t('waiter.error.load_tables')}
        </Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => waiterTables.refetch()}
          accessibilityRole="button"
        >
          <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ====== HEADER ====== */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerShiftLabel}>
              {t('waiter.header.shift_label')}
            </Text>
            <Text style={styles.headerName}>
              {t('waiter.header.waiter_name')}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            {readyDishCount > 0 && (
              <View style={styles.headerIconWrapper}>
                <Icon name="chef-hat" size={20} color={colors.primaryForeground} />
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{readyDishCount}</Text>
                </View>
              </View>
            )}
            <View style={styles.headerIconWrapper}>
              <Icon name="bell" size={20} color={colors.primaryForeground} />
              {liveFeed.urgentCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {liveFeed.urgentCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            {
              label: t('waiter.header.stat_tables'),
              value: waiterTables.tables.length.toString(),
              urgent: false,
            },
            {
              label: t('waiter.header.stat_pickup'),
              value: readyDishCount.toString(),
              urgent: readyDishCount > 0,
            },
            {
              label: t('waiter.header.stat_calls'),
              value: liveFeed.activeFeed
                .filter((f) => f.type === 'call')
                .length.toString(),
              urgent:
                liveFeed.activeFeed.filter((f) => f.type === 'call').length > 0,
            },
            {
              label: t('waiter.header.stat_tips'),
              value: 'R$410',
              urgent: false,
            },
          ].map((stat, i) => (
            <View
              key={i}
              style={[
                styles.statCard,
                {
                  backgroundColor: stat.urgent
                    ? colors.error + '40'
                    : colors.primaryForeground + '1F',
                },
              ]}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ====== TAB BAR ====== */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabBtn,
              {
                borderBottomColor:
                  activeTab === tab.id ? colors.primary : 'transparent',
              },
            ]}
            onPress={() => handleTabChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
            accessibilityLabel={t(tab.labelKey)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab.id
                      ? colors.primary
                      : colors.foregroundMuted,
                },
              ]}
            >
              {t(tab.labelKey)}
            </Text>
            {tab.badge > 0 && (
              <View
                style={[
                  styles.tabBadge,
                  {
                    backgroundColor:
                      tab.id === 'kitchen' ? colors.error : colors.primary,
                  },
                ]}
              >
                <Text style={styles.tabBadgeText}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ====== CONTENT ====== */}
      <View style={styles.content}>
        {/* Live Feed */}
        {activeTab === 'live' && (
          <LiveFeedTab
            activeFeed={liveFeed.activeFeed}
            readyDishCount={readyDishCount}
            reconnecting={liveFeed.reconnecting}
            onDismissEvent={liveFeed.dismissEvent}
            onNavigateTab={handleTabChange}
            onEventAction={handleEventAction}
          />
        )}

        {/* Tables — list or detail */}
        {activeTab === 'tables' && !selectedTableData && (
          <TablesTab
            tables={waiterTables.tables}
            isLoading={waiterTables.isLoading}
            isRefetching={waiterTables.isRefetching}
            pickedUpIds={pickedUpIds}
            onRefresh={waiterTables.refetch}
            onSelectTable={(tableNum) => setSelectedTable(tableNum)}
          />
        )}
        {activeTab === 'tables' && selectedTableData && (
          <TableDetailScreen
            table={selectedTableData}
            onBack={() => setSelectedTable(null)}
            onAddGuest={waiterTables.addGuestToTable}
          />
        )}

        {/* Kitchen */}
        {activeTab === 'kitchen' && (
          <KitchenTab
            pickedUpIds={pickedUpIds}
            onPickup={handlePickup}
          />
        )}

        {/* Charge */}
        {activeTab === 'charge' && (
          <ChargeTab tables={waiterTables.tables} />
        )}
      </View>
    </View>
  );
}
