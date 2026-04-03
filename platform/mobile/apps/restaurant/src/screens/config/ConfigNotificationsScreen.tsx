/**
 * ConfigNotificationsScreen — Notification preferences
 *
 * Push notification toggles: new orders, low stock alerts,
 * reservation reminders, approval requests.
 *
 * Uses PATCH /config/:id/experience (subset of experience flags)
 * Access: OWNER + MANAGER
 *
 * @module config/ConfigNotificationsScreen
 */

import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRestaurantConfig } from './hooks/useRestaurantConfig';
import { spacing, borderRadius } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// NOTIFICATION OPTIONS
// ============================================

interface NotificationOption {
  key: string;
  labelKey: string;
  descKey: string;
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  { key: 'notifyNewOrders', labelKey: 'config.notifications.newOrders', descKey: 'config.notifications.newOrdersDesc' },
  { key: 'notifyLowStock', labelKey: 'config.notifications.lowStock', descKey: 'config.notifications.lowStockDesc' },
  { key: 'notifyReservationReminders', labelKey: 'config.notifications.reservationReminders', descKey: 'config.notifications.reservationRemindersDesc' },
  { key: 'notifyApprovalRequests', labelKey: 'config.notifications.approvalRequests', descKey: 'config.notifications.approvalRequestsDesc' },
];

// ============================================
// COMPONENT
// ============================================

export default function ConfigNotificationsScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const { user } = useAuth();

  const restaurantId = useMemo(() => {
    const roles = user?.roles || [];
    return roles.find((r) => r.restaurant_id)?.restaurant_id || '';
  }, [user]);

  const { config, isLoading, updateExperience, isSaving } = useRestaurantConfig(restaurantId);

  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (config?.experience_flags) {
      // Notification prefs are stored as part of experience_flags
      const flags = config.experience_flags as Record<string, any>;
      const initial: Record<string, boolean> = {};
      NOTIFICATION_OPTIONS.forEach((opt) => {
        initial[opt.key] = flags[opt.key] ?? true; // default to true
      });
      setPrefs(initial);
    }
  }, [config]);

  const togglePref = useCallback((key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      // Merge notification prefs into experience flags
      await updateExperience(prefs as any);
      setIsDirty(false);
      Alert.alert(t('config.saved'));
    } catch {
      Alert.alert(t('errors.generic'));
    }
  }, [prefs, updateExperience, t]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.backgroundSecondary },
        section: {
          backgroundColor: colors.card,
          marginHorizontal: spacing.screenHorizontal,
          marginTop: spacing[4],
          padding: spacing[4],
          borderRadius: borderRadius.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        },
        sectionTitle: { ...typography.h3, color: colors.foreground, marginBottom: spacing[3] },
        notifRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing[3],
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
        notifInfo: { flex: 1, marginRight: spacing[3] },
        notifLabel: { ...typography.bodyLarge, color: colors.foreground },
        notifDesc: { ...typography.bodySmall, color: colors.foregroundSecondary, marginTop: 2 },
        saveButton: {
          backgroundColor: colors.primary,
          marginHorizontal: spacing.screenHorizontal,
          marginTop: spacing[5],
          marginBottom: spacing[10],
          paddingVertical: spacing[3],
          borderRadius: borderRadius.button,
          alignItems: 'center',
        },
        saveButtonDisabled: { opacity: 0.5 },
        saveButtonText: { ...typography.buttonLarge, color: colors.primaryForeground },
      }),
    [colors],
  );

  if (isLoading) {
    return (
      <ScreenContainer>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
    <ScrollView style={styles.container} accessibilityLabel="Notification preferences">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.notifications.title')}</Text>
        {NOTIFICATION_OPTIONS.map((opt) => (
          <View key={opt.key} style={styles.notifRow}>
            <View style={styles.notifInfo}>
              <Text style={styles.notifLabel}>{t(opt.labelKey)}</Text>
              <Text style={styles.notifDesc}>{t(opt.descKey)}</Text>
            </View>
            <Switch
              value={!!prefs[opt.key]}
              onValueChange={() => togglePref(opt.key)}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primaryLight }}
              thumbColor={prefs[opt.key] ? colors.primary : colors.foregroundMuted}
            />
          </View>
        ))}
      </View>

      <View
        style={[styles.saveButton, (!isDirty || isSaving) && styles.saveButtonDisabled]}
        pointerEvents={!isDirty || isSaving ? 'none' : 'auto'}
      >
        <Text style={styles.saveButtonText} onPress={handleSave}>
          {isSaving ? t('config.saving') : t('config.save')}
        </Text>
      </View>
    </ScrollView>
    </ScreenContainer>
  );
}
