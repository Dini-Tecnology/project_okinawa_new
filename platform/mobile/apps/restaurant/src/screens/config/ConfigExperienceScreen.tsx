/**
 * ConfigExperienceScreen — Customer experience flags
 *
 * Toggle list of experience options: reservationsEnabled, virtualQueueEnabled,
 * familyModeEnabled, qrTableOrdering, sharedComanda, aiHarmonization,
 * happyHourEnabled.
 *
 * API: PATCH /config/:id/experience
 * Access: OWNER + MANAGER
 *
 * @module config/ConfigExperienceScreen
 */

import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRestaurantConfig } from './hooks/useRestaurantConfig';
import { spacing, borderRadius } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { ExperienceFlags } from './types/config.types';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// EXPERIENCE FLAG OPTIONS
// ============================================

const EXPERIENCE_FLAGS: { key: keyof ExperienceFlags; labelKey: string }[] = [
  { key: 'reservationsEnabled', labelKey: 'config.experience.reservationsEnabled' },
  { key: 'virtualQueueEnabled', labelKey: 'config.experience.virtualQueueEnabled' },
  { key: 'familyModeEnabled', labelKey: 'config.experience.familyModeEnabled' },
  { key: 'qrTableOrdering', labelKey: 'config.experience.qrTableOrdering' },
  { key: 'sharedComanda', labelKey: 'config.experience.sharedComanda' },
  { key: 'aiHarmonization', labelKey: 'config.experience.aiHarmonization' },
  { key: 'happyHourEnabled', labelKey: 'config.experience.happyHourEnabled' },
];

// ============================================
// COMPONENT
// ============================================

export default function ConfigExperienceScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const restaurantId = useMemo(() => {
    const roles = user?.roles || [];
    return roles.find((r) => r.restaurant_id)?.restaurant_id || '';
  }, [user]);

  const { config, isLoading, updateExperience, isSaving } = useRestaurantConfig(restaurantId);

  const [flags, setFlags] = useState<ExperienceFlags>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (config?.experience_flags) {
      setFlags(config.experience_flags);
    }
  }, [config]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!isDirty) return;
      e.preventDefault();
      Alert.alert(t('config.unsavedChanges'), t('config.unsavedChangesMsg'), [
        { text: t('config.keepEditing'), style: 'cancel' },
        { text: t('config.discard'), style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
    return unsubscribe;
  }, [navigation, isDirty, t]);

  const toggleFlag = useCallback((key: keyof ExperienceFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await updateExperience(flags);
      setIsDirty(false);
      Alert.alert(t('config.saved'));
    } catch {
      Alert.alert(t('errors.generic'));
    }
  }, [flags, updateExperience, t]);

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
        toggleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing[3],
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
        toggleLabel: { ...typography.bodyLarge, color: colors.foreground, flex: 1 },
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
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.experience.title')}</Text>
        {EXPERIENCE_FLAGS.map((flag) => (
          <View key={flag.key} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t(flag.labelKey)}</Text>
            <Switch
              value={!!flags[flag.key]}
              onValueChange={() => toggleFlag(flag.key)}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primaryLight }}
              thumbColor={flags[flag.key] ? colors.primary : colors.foregroundMuted}
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
