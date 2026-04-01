/**
 * KitchenTicketCard — Kitchen pipeline dish card
 *
 * Displays a kitchen dish with table number, dish name,
 * chef, SLA progress bar, and pickup action button.
 *
 * @module waiter/components/KitchenTicketCard
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@/shared/hooks/useI18n';
import type { KitchenDish } from '../types/waiter.types';

interface KitchenTicketCardProps {
  dish: KitchenDish;
  isPickedUp: boolean;
  onPickup?: () => void;
}

function KitchenTicketCard({ dish, isPickedUp, onPickup }: KitchenTicketCardProps) {
  const colors = useColors();
  const { t } = useI18n();

  const slaPercent = Math.min((dish.elapsed / dish.sla) * 100, 100);
  const isOverdue = dish.elapsed > dish.sla;

  const slaColor = useMemo(() => {
    if (isOverdue) return colors.error;
    if (slaPercent > 70) return colors.warning;
    return colors.success;
  }, [isOverdue, slaPercent, colors]);

  const isReady = dish.status === 'ready' && !isPickedUp;
  const isServed = isPickedUp || dish.status === 'served';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: 12,
          borderWidth: isReady ? 2 : 1,
          borderColor: isReady
            ? colors.error + '50'
            : isServed
              ? colors.success + '30'
              : colors.border,
          backgroundColor: isReady
            ? colors.error + '08'
            : isServed
              ? colors.success + '08'
              : colors.card,
          padding: 12,
          marginBottom: 6,
          opacity: isServed ? 0.6 : 1,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        tableNumber: {
          width: 40,
          height: 40,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isReady
            ? colors.error + '15'
            : isServed
              ? colors.success + '15'
              : colors.warning + '15',
        },
        tableNumberText: {
          fontWeight: '700',
          fontSize: 14,
          color: isReady ? colors.error : isServed ? colors.success : colors.warning,
        },
        body: {
          flex: 1,
        },
        dishName: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.foreground,
        },
        chefInfo: {
          fontSize: 10,
          color: colors.foregroundMuted,
          marginTop: 2,
        },
        slaContainer: {
          width: 56,
          alignItems: 'flex-end',
        },
        slaBar: {
          width: '100%',
          height: 6,
          backgroundColor: colors.backgroundTertiary,
          borderRadius: 3,
          overflow: 'hidden',
        },
        slaProgress: {
          height: '100%',
          borderRadius: 3,
        },
        slaText: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        pickupBtn: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: colors.error,
        },
        pickupText: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.primaryForeground,
        },
        servedRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginLeft: 'auto',
        },
      }),
    [colors, isReady, isServed],
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.tableNumber}>
          <Text style={styles.tableNumberText}>{dish.table}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.dishName}>
            {dish.qty}x {dish.dish}
          </Text>
          <Text style={styles.chefInfo}>
            {dish.chef}
            {isReady && dish.readyAgo > 0
              ? ` ${'\u00B7'} ${t('waiter.kitchen.ready_ago', { min: dish.readyAgo })}`
              : ''}
          </Text>
        </View>

        {isReady && onPickup ? (
          <TouchableOpacity
            style={styles.pickupBtn}
            onPress={onPickup}
            accessibilityLabel={t('waiter.kitchen.action_pickup')}
            accessibilityRole="button"
          >
            <Text style={styles.pickupText}>
              {t('waiter.kitchen.action_pickup')} {'\u2713'}
            </Text>
          </TouchableOpacity>
        ) : isServed ? (
          <View style={styles.servedRow}>
            <Icon name="check-circle" size={16} color={colors.success} />
          </View>
        ) : (
          <View style={styles.slaContainer}>
            <View style={styles.slaBar}>
              <View
                style={[
                  styles.slaProgress,
                  {
                    width: `${slaPercent}%`,
                    backgroundColor: slaColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.slaText, { color: slaColor }]}>
              {isOverdue
                ? t('waiter.kitchen.sla_overdue', { min: dish.elapsed - dish.sla })
                : t('waiter.kitchen.sla_remaining', { min: dish.sla - dish.elapsed })}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default React.memo(KitchenTicketCard);
