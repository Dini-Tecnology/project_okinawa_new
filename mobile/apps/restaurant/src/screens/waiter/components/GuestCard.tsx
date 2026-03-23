/**
 * GuestCard — Guest card for the Pessoas sub-tab
 *
 * Shows guest name, app status badge, order count, total,
 * and action buttons (order / charge).
 *
 * @module waiter/components/GuestCard
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@/shared/hooks/useI18n';
import type { TableGuest, GuestOrder } from '../types/waiter.types';

interface GuestCardProps {
  guest: TableGuest;
  allOrders: GuestOrder[];
  onOrder?: () => void;
  onCharge?: () => void;
}

function GuestCard({ guest, allOrders, onOrder, onCharge }: GuestCardProps) {
  const colors = useColors();
  const { t } = useI18n();

  const guestTotal = allOrders.reduce((a, o) => a + o.price * o.qty, 0);
  const activeOrderCount = allOrders.filter(
    (o) => o.status !== 'served' && o.status !== 'cancelled',
  ).length;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: 12,
          borderWidth: 1,
          borderColor: guest.paid
            ? colors.success + '30'
            : !guest.hasApp
              ? colors.warning + '30'
              : colors.border,
          backgroundColor: guest.paid
            ? colors.success + '08'
            : !guest.hasApp
              ? colors.warning + '08'
              : colors.card,
          padding: 10,
          opacity: guest.paid ? 0.7 : 1,
          marginBottom: 6,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        avatar: {
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarText: {
          fontSize: 10,
          fontWeight: '700',
        },
        body: {
          flex: 1,
        },
        nameRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        name: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.foreground,
        },
        badge: {
          paddingHorizontal: 4,
          paddingVertical: 1,
          borderRadius: 4,
        },
        badgeText: {
          fontSize: 8,
          fontWeight: '700',
        },
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: 2,
        },
        metaText: {
          fontSize: 9,
          color: colors.foregroundMuted,
        },
        activeText: {
          fontSize: 9,
          color: colors.warning,
          fontWeight: '500',
        },
        paidText: {
          fontSize: 9,
          color: colors.success,
        },
        rightSide: {
          alignItems: 'flex-end',
        },
        totalText: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.foreground,
        },
        actionRow: {
          flexDirection: 'row',
          gap: 4,
          marginTop: 4,
        },
        actionBtn: {
          paddingHorizontal: 6,
          paddingVertical: 3,
          borderRadius: 4,
        },
        actionText: {
          fontSize: 8,
          fontWeight: '700',
          color: '#FFFFFF',
        },
      }),
    [colors, guest.paid, guest.hasApp],
  );

  const avatarColor = guest.paid
    ? colors.success
    : guest.hasApp
      ? colors.info
      : colors.warning;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: avatarColor + '20' }]}>
          <Text style={[styles.avatarText, { color: avatarColor }]}>
            {guest.paid ? '\u2713' : guest.hasApp ? '\u{1F4F1}' : '!'}
          </Text>
        </View>
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {guest.name}
            </Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: guest.hasApp
                    ? colors.success + '15'
                    : colors.warning + '15',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: guest.hasApp ? colors.success : colors.warning },
                ]}
              >
                {guest.hasApp
                  ? t('waiter.guests.badge_app')
                  : t('waiter.guests.badge_no_app')}
              </Text>
            </View>
            {guest.paid && (
              <View
                style={[styles.badge, { backgroundColor: colors.success + '15' }]}
              >
                <Text style={[styles.badgeText, { color: colors.success }]}>
                  {t('waiter.guests.badge_paid')}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {allOrders.length} {t('waiter.guests.items_count')}
            </Text>
            {activeOrderCount > 0 && (
              <Text style={styles.activeText}>
                {activeOrderCount} {t('waiter.guests.in_progress')}
              </Text>
            )}
            {guest.paid && guest.method && (
              <Text style={styles.paidText}>
                {t('waiter.guests.paid_via', { method: guest.method })}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.rightSide}>
          <Text style={styles.totalText}>R$ {guestTotal}</Text>
          <View style={styles.actionRow}>
            {!guest.paid && onOrder && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={onOrder}
                accessibilityLabel={t('waiter.guests.action_order')}
                accessibilityRole="button"
              >
                <Text style={styles.actionText}>
                  {t('waiter.guests.action_order')}
                </Text>
              </TouchableOpacity>
            )}
            {!guest.paid && !guest.hasApp && onCharge && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
                onPress={onCharge}
                accessibilityLabel={t('waiter.guests.action_charge')}
                accessibilityRole="button"
              >
                <Text style={styles.actionText}>
                  {t('waiter.guests.action_charge')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default React.memo(GuestCard);
