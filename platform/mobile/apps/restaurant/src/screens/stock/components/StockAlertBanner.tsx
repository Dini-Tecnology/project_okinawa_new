import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { spacing, borderRadius } from '@okinawa/shared/theme/spacing';
import type { InventoryStats } from '../../../types/inventory';

interface StockAlertBannerProps {
  restaurantId: string;
  onPress?: () => void;
}

/**
 * Reusable alert banner showing count of critical + low inventory items.
 * Used in: Chef screen, Barman Station, Manager Ops Panel.
 * Tappable -- navigates to StockScreen filtered to critical/low.
 */
export default function StockAlertBanner({ restaurantId, onPress }: StockAlertBannerProps) {
  const { t } = useI18n();
  const colors = useColors();
  const [stats, setStats] = useState<InventoryStats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await ApiService.get(`/inventory/stats?restaurantId=${restaurantId}`);
      setStats(res?.data || res || null);
    } catch (error) {
      console.error('Failed to load inventory stats:', error);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Don't render if no alerts
  if (!stats || (stats.critical === 0 && stats.low === 0)) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: stats.critical > 0 ? colors.errorBackground : colors.warningBackground,
          borderColor: stats.critical > 0 ? colors.error : colors.warning,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={t('stock.alertBannerTitle')}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {t('stock.alertBannerTitle')}
        </Text>
        <View style={styles.badges}>
          {stats.critical > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>
                {t('stock.alertCritical', { count: String(stats.critical) })}
              </Text>
            </View>
          )}
          {stats.low > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.warning }]}>
              <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>
                {t('stock.alertLow', { count: String(stats.low) })}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.viewLink, { color: colors.primary }]}>
          {t('stock.viewStock')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.card,
    borderWidth: 1,
    marginVertical: spacing[2],
    overflow: 'hidden',
  },
  content: {
    padding: spacing[3],
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  badges: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.badge,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
