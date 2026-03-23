/**
 * TableSummaryCard — Card showing table overview in the tables list
 *
 * Displays table number, customer name, guest count, order total,
 * guest avatars with status indicators, payment progress bar,
 * and urgency badges (ready dish, no-app guests).
 *
 * @module waiter/components/TableSummaryCard
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@/shared/hooks/useI18n';
import type { WaiterTable, KitchenDish } from '../types/waiter.types';
import { KITCHEN_PIPELINE } from '../types/waiter.types';

interface TableSummaryCardProps {
  table: WaiterTable;
  pickedUpIds: string[];
  onPress: () => void;
}

function TableSummaryCard({ table, pickedUpIds, onPress }: TableSummaryCardProps) {
  const colors = useColors();
  const { t } = useI18n();

  const guests = table.guests;
  const paidCount = guests.filter((g) => g.paid).length;
  const paidPct = guests.length > 0 ? Math.round((paidCount / guests.length) * 100) : 0;
  const noAppCount = guests.filter((g) => !g.hasApp && !g.paid).length;
  const totalOrders = guests.reduce((acc, g) => acc + g.orders.length, 0);
  const hasReady = KITCHEN_PIPELINE.some(
    (d: KitchenDish) => d.table === table.number && d.status === 'ready' && !pickedUpIds.includes(d.id),
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: 12,
          borderWidth: 2,
          borderColor: hasReady
            ? colors.error + '50'
            : noAppCount > 0
              ? colors.warning + '35'
              : table.status === 'billing'
                ? colors.info + '50'
                : colors.border,
          backgroundColor: hasReady
            ? colors.error + '08'
            : noAppCount > 0
              ? colors.warning + '08'
              : table.status === 'billing'
                ? colors.info + '08'
                : colors.card,
          padding: 12,
          marginBottom: 10,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        },
        headerLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          flex: 1,
        },
        tableNumber: {
          width: 40,
          height: 40,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: hasReady ? colors.error + '15' : colors.primary + '15',
        },
        tableNumberText: {
          fontWeight: '700',
          fontSize: 14,
          color: hasReady ? colors.error : colors.primary,
        },
        tableInfo: {
          flex: 1,
        },
        customerName: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.foreground,
        },
        tableMeta: {
          fontSize: 10,
          color: colors.foregroundMuted,
          marginTop: 2,
        },
        headerRight: {
          alignItems: 'flex-end',
        },
        totalText: {
          fontWeight: '700',
          fontSize: 13,
          color: colors.primary,
        },
        badgeRow: {
          flexDirection: 'row',
          gap: 4,
          marginTop: 4,
        },
        badge: {
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 4,
        },
        badgeText: {
          fontSize: 8,
          fontWeight: '700',
        },
        avatarRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginTop: 4,
        },
        avatar: {
          width: 22,
          height: 22,
          borderRadius: 11,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarText: {
          fontSize: 8,
          fontWeight: '700',
        },
        overflowText: {
          fontSize: 9,
          color: colors.foregroundMuted,
        },
        progressBarContainer: {
          flex: 1,
          height: 6,
          backgroundColor: colors.backgroundTertiary,
          borderRadius: 3,
          marginLeft: 8,
          overflow: 'hidden',
        },
        progressBar: {
          height: '100%',
          backgroundColor: colors.success,
          borderRadius: 3,
        },
        progressText: {
          fontSize: 9,
          fontWeight: '700',
          color: colors.foregroundMuted,
          marginLeft: 4,
        },
      }),
    [colors, hasReady, noAppCount, table.status],
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={t('waiter.tables.table_card_label', {
        number: table.number,
        customer: table.customerName,
      })}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.tableNumber}>
            <Text style={styles.tableNumberText}>{table.number}</Text>
          </View>
          <View style={styles.tableInfo}>
            <Text style={styles.customerName}>{table.customerName}</Text>
            <Text style={styles.tableMeta}>
              {guests.length} {t('waiter.tables.people_count')} {'\u00B7'} {totalOrders} {t('waiter.tables.orders_count')}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.totalText}>R$ {table.orderTotal}</Text>
          <View style={styles.badgeRow}>
            {hasReady && (
              <View style={[styles.badge, { backgroundColor: colors.error + '15' }]}>
                <Text style={[styles.badgeText, { color: colors.error }]}>
                  {t('waiter.tables.badge_dish_ready')}
                </Text>
              </View>
            )}
            {noAppCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.warning + '15' }]}>
                <Text style={[styles.badgeText, { color: colors.warning }]}>
                  {noAppCount} {t('waiter.tables.badge_no_app')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Guest avatars + progress bar */}
      <View style={styles.avatarRow}>
        {guests.slice(0, 5).map((g) => (
          <View
            key={g.id}
            style={[
              styles.avatar,
              {
                backgroundColor: g.paid
                  ? colors.success + '20'
                  : g.hasApp
                    ? colors.info + '20'
                    : colors.warning + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                {
                  color: g.paid
                    ? colors.success
                    : g.hasApp
                      ? colors.info
                      : colors.warning,
                },
              ]}
            >
              {g.paid ? '\u2713' : g.hasApp ? '\u{1F4F1}' : '!'}
            </Text>
          </View>
        ))}
        {guests.length > 5 && (
          <Text style={styles.overflowText}>+{guests.length - 5}</Text>
        )}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${paidPct}%` }]} />
        </View>
        <Text style={styles.progressText}>{paidPct}%</Text>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(TableSummaryCard);
