/**
 * ConfigServiceTypesScreen — Service type configuration
 *
 * Primary service type selector (11 options as chips).
 * Additional supported types (multi-select chips).
 * Cascade warning for changing primary type.
 *
 * API: PATCH /config/:id/service-types
 * Access: OWNER only
 *
 * @module config/ConfigServiceTypesScreen
 */

import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRestaurantConfig } from './hooks/useRestaurantConfig';
import { spacing, borderRadius } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { ServiceTypeOption } from './types/config.types';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// SERVICE TYPE OPTIONS
// ============================================

const SERVICE_TYPE_OPTIONS: { value: ServiceTypeOption; labelKey: string }[] = [
  { value: 'fine-dining', labelKey: 'config.serviceTypes.fineDining' },
  { value: 'quick-service', labelKey: 'config.serviceTypes.quickService' },
  { value: 'fast-casual', labelKey: 'config.serviceTypes.fastCasual' },
  { value: 'cafe-bakery', labelKey: 'config.serviceTypes.cafeBakery' },
  { value: 'buffet', labelKey: 'config.serviceTypes.buffet' },
  { value: 'drive-thru', labelKey: 'config.serviceTypes.driveThru' },
  { value: 'food-truck', labelKey: 'config.serviceTypes.foodTruck' },
  { value: 'chefs-table', labelKey: 'config.serviceTypes.chefsTable' },
  { value: 'casual-dining', labelKey: 'config.serviceTypes.casualDining' },
  { value: 'pub-bar', labelKey: 'config.serviceTypes.pubBar' },
  { value: 'club', labelKey: 'config.serviceTypes.club' },
];

// ============================================
// COMPONENT
// ============================================

export default function ConfigServiceTypesScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const restaurantId = useMemo(() => {
    const roles = user?.roles || [];
    return roles.find((r) => r.restaurant_id)?.restaurant_id || '';
  }, [user]);

  const { config, isLoading, updateServiceTypes, isSaving } = useRestaurantConfig(restaurantId);

  const [primary, setPrimary] = useState<string>('casual-dining');
  const [supported, setSupported] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (config?.service_types) {
      setPrimary(config.service_types.primary || 'casual-dining');
      setSupported(config.service_types.supported || []);
    }
  }, [config]);

  // Unsaved changes warning
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

  const handlePrimaryChange = useCallback(
    (value: string) => {
      // Cascade warning for primary type change
      if (primary !== value) {
        Alert.alert(t('config.cascadeWarning'), t('config.confirmChange'), [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.confirm'),
            onPress: () => {
              setPrimary(value);
              // Ensure primary is also in supported
              setSupported((prev) => {
                const updated = prev.filter((s) => s !== primary);
                return updated.includes(value) ? updated : [...updated, value];
              });
              setIsDirty(true);
            },
          },
        ]);
      }
    },
    [primary, t],
  );

  const toggleSupported = useCallback(
    (value: string) => {
      // Cannot deselect primary
      if (value === primary) return;
      setSupported((prev) =>
        prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
      );
      setIsDirty(true);
    },
    [primary],
  );

  const handleSave = useCallback(async () => {
    try {
      const finalSupported = supported.includes(primary) ? supported : [primary, ...supported];
      await updateServiceTypes({ primary, supported: finalSupported });
      setIsDirty(false);
      Alert.alert(t('config.saved'));
    } catch {
      Alert.alert(t('errors.generic'));
    }
  }, [primary, supported, updateServiceTypes, t]);

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
        chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
        chip: {
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[2],
          borderRadius: borderRadius.pill,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundTertiary,
        },
        chipSelected: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        chipPrimary: {
          backgroundColor: colors.primary,
          borderColor: colors.primaryDark,
        },
        chipText: { ...typography.labelMedium, color: colors.foreground },
        chipTextSelected: { color: colors.primaryForeground },
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
      {/* Primary Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.serviceTypes.primary')}</Text>
        <View style={styles.chipsContainer}>
          {SERVICE_TYPE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, primary === opt.value && styles.chipPrimary]}
              onPress={() => handlePrimaryChange(opt.value)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t(opt.labelKey)}
              accessibilityState={{ selected: primary === opt.value }}
            >
              <Text style={[styles.chipText, primary === opt.value && styles.chipTextSelected]}>
                {t(opt.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Supported Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.serviceTypes.supported')}</Text>
        <View style={styles.chipsContainer}>
          {SERVICE_TYPE_OPTIONS.map((opt) => {
            const isSelected = supported.includes(opt.value);
            const isPrimaryType = opt.value === primary;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, (isSelected || isPrimaryType) && styles.chipSelected]}
                onPress={() => toggleSupported(opt.value)}
                activeOpacity={0.7}
                disabled={isPrimaryType}
                accessibilityRole="button"
                accessibilityLabel={t(opt.labelKey)}
                accessibilityState={{ selected: isSelected || isPrimaryType }}
              >
                <Text
                  style={[
                    styles.chipText,
                    (isSelected || isPrimaryType) && styles.chipTextSelected,
                  ]}
                >
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveButton, (!isDirty || isSaving) && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!isDirty || isSaving}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('config.save')}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? t('config.saving') : t('config.save')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </ScreenContainer>
  );
}
