/**
 * KitchenTab — "Cozinha" tab
 *
 * Kitchen pipeline view with 3 sections:
 *   1. PRONTO - RETIRAR (urgent, pulsing)
 *   2. PREPARANDO (with SLA progress bars)
 *   3. SERVIDO (faded)
 *
 * @module waiter/tabs/KitchenTab
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@/shared/hooks/useI18n';
import KitchenTicketCard from '../components/KitchenTicketCard';
import type { KitchenDish } from '../types/waiter.types';
import { KITCHEN_PIPELINE } from '../types/waiter.types';

interface KitchenTabProps {
  pickedUpIds: string[];
  onPickup: (dishId: string) => void;
}

export default function KitchenTab({ pickedUpIds, onPickup }: KitchenTabProps) {
  const colors = useColors();
  const { t } = useI18n();

  const readyDishes = KITCHEN_PIPELINE.filter(
    (d) => d.status === 'ready' && !pickedUpIds.includes(d.id),
  );
  const preparingDishes = KITCHEN_PIPELINE.filter((d) => d.status === 'preparing');
  const servedDishes = KITCHEN_PIPELINE.filter((d) => pickedUpIds.includes(d.id));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        content: {
          padding: 12,
          gap: 12,
        },
        urgencyBanner: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          padding: 10,
          borderRadius: 12,
          backgroundColor: colors.error + '12',
          borderWidth: 1,
          borderColor: colors.error + '30',
        },
        urgencyText: {
          flex: 1,
        },
        urgencyTitle: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.error,
        },
        urgencySubtitle: {
          fontSize: 10,
          color: colors.error + 'AA',
          marginTop: 1,
        },
        sectionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 4,
        },
        sectionDot: {
          width: 6,
          height: 6,
          borderRadius: 3,
        },
        sectionLabel: {
          fontSize: 10,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        emptyContainer: {
          alignItems: 'center',
          paddingVertical: 48,
        },
        emptyIcon: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.success + '15',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        },
        emptyTitle: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.foreground,
        },
        emptySubtitle: {
          fontSize: 12,
          color: colors.foregroundMuted,
          marginTop: 4,
        },
      }),
    [colors],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      accessibilityLabel="Kitchen pipeline"
    >
      {/* Urgency banner */}
      {readyDishes.length > 0 && (
        <View style={styles.urgencyBanner}>
          <Icon name="chef-hat" size={20} color={colors.error} />
          <View style={styles.urgencyText}>
            <Text style={styles.urgencyTitle}>
              {t('waiter.kitchen.urgency_banner_title', { count: readyDishes.length })}
            </Text>
            <Text style={styles.urgencySubtitle}>
              {t('waiter.kitchen.urgency_banner_subtitle')}
            </Text>
          </View>
        </View>
      )}

      {/* PRONTO section */}
      {readyDishes.length > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: colors.error }]} />
            <Text style={[styles.sectionLabel, { color: colors.error }]}>
              {t('waiter.kitchen.section_ready')}
            </Text>
          </View>
          {readyDishes.map((dish) => (
            <KitchenTicketCard
              key={dish.id}
              dish={dish}
              isPickedUp={false}
              onPickup={() => onPickup(dish.id)}
            />
          ))}
        </View>
      )}

      {/* PREPARANDO section */}
      {preparingDishes.length > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.sectionLabel, { color: colors.warning }]}>
              {t('waiter.kitchen.section_preparing')}
            </Text>
          </View>
          {preparingDishes.map((dish) => (
            <KitchenTicketCard
              key={dish.id}
              dish={dish}
              isPickedUp={false}
            />
          ))}
        </View>
      )}

      {/* SERVIDO section */}
      {servedDishes.length > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.sectionLabel, { color: colors.success }]}>
              {'\u2713'} {t('waiter.kitchen.section_served')}
            </Text>
          </View>
          {servedDishes.map((dish) => (
            <KitchenTicketCard
              key={dish.id}
              dish={dish}
              isPickedUp={true}
            />
          ))}
        </View>
      )}

      {/* Empty state (no ready dishes) */}
      {readyDishes.length === 0 && preparingDishes.length === 0 && servedDishes.length === 0 && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Icon name="chef-hat" size={24} color={colors.success} />
          </View>
          <Text style={styles.emptyTitle}>{t('waiter.kitchen.empty_title')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('waiter.kitchen.empty_subtitle')}
          </Text>
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}
