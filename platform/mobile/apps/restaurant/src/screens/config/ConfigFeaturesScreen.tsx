/**
 * ConfigFeaturesScreen — Platform feature toggles
 *
 * Toggle list of features: loyalty, reservations, driveThru, multiLanguage,
 * analytics, pushNotifications, webhooks.
 * Warning banner for features that affect billing.
 *
 * API: PATCH /config/:id/features
 * Access: OWNER only
 *
 * @module config/ConfigFeaturesScreen
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
import type { EnabledFeatures } from './types/config.types';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// FEATURE OPTIONS
// ============================================

interface FeatureOption {
  key: keyof EnabledFeatures;
  labelKey: string;
  descKey: string;
  affectsBilling: boolean;
}

const FEATURES: FeatureOption[] = [
  { key: 'loyalty', labelKey: 'config.features.loyalty', descKey: 'config.features.loyaltyDesc', affectsBilling: true },
  { key: 'reservations', labelKey: 'config.features.reservations', descKey: 'config.features.reservationsDesc', affectsBilling: false },
  { key: 'driveThru', labelKey: 'config.features.driveThru', descKey: 'config.features.driveThruDesc', affectsBilling: false },
  { key: 'multiLanguage', labelKey: 'config.features.multiLanguage', descKey: 'config.features.multiLanguageDesc', affectsBilling: false },
  { key: 'analytics', labelKey: 'config.features.analytics', descKey: 'config.features.analyticsDesc', affectsBilling: true },
  { key: 'pushNotifications', labelKey: 'config.features.notifications', descKey: 'config.features.notificationsDesc', affectsBilling: true },
  { key: 'webhooks', labelKey: 'config.features.webhooks', descKey: 'config.features.webhooksDesc', affectsBilling: true },
];

// ============================================
// COMPONENT
// ============================================

export default function ConfigFeaturesScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const restaurantId = useMemo(() => {
    const roles = user?.roles || [];
    return roles.find((r) => r.restaurant_id)?.restaurant_id || '';
  }, [user]);

  const { config, isLoading, updateFeatures, isSaving } = useRestaurantConfig(restaurantId);

  const [features, setFeatures] = useState<EnabledFeatures>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (config?.enabled_features) {
      setFeatures(config.enabled_features);
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

  const toggleFeature = useCallback(
    (feature: FeatureOption) => {
      const currentValue = !!features[feature.key];
      const newValue = !currentValue;

      // Billing warning for enabling features that affect billing
      if (newValue && feature.affectsBilling) {
        Alert.alert(t('config.cascadeWarning'), t('config.features.billingWarning'), [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('config.confirmChange'),
            onPress: () => {
              setFeatures((prev) => ({ ...prev, [feature.key]: newValue }));
              setIsDirty(true);
            },
          },
        ]);
      } else {
        setFeatures((prev) => ({ ...prev, [feature.key]: newValue }));
        setIsDirty(true);
      }
    },
    [features, t],
  );

  const handleSave = useCallback(async () => {
    try {
      await updateFeatures(features);
      setIsDirty(false);
      Alert.alert(t('config.saved'));
    } catch {
      Alert.alert(t('errors.generic'));
    }
  }, [features, updateFeatures, t]);

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
        featureRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing[3],
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
        featureInfo: { flex: 1, marginRight: spacing[3] },
        featureLabel: { ...typography.bodyLarge, color: colors.foreground },
        featureDesc: { ...typography.bodySmall, color: colors.foregroundSecondary, marginTop: 2 },
        billingBadge: {
          backgroundColor: colors.warningBackground,
          paddingHorizontal: spacing[2],
          paddingVertical: 2,
          borderRadius: borderRadius.badge,
          marginTop: spacing[1],
          alignSelf: 'flex-start',
        },
        billingBadgeText: { ...typography.caption, color: colors.warning },
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
    <ScrollView style={styles.container} accessibilityLabel="Feature toggles">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.features.title')}</Text>
        {FEATURES.map((feature) => (
          <View key={feature.key} style={styles.featureRow}>
            <View style={styles.featureInfo}>
              <Text style={styles.featureLabel}>{t(feature.labelKey)}</Text>
              <Text style={styles.featureDesc}>{t(feature.descKey)}</Text>
              {feature.affectsBilling && (
                <View style={styles.billingBadge}>
                  <Text style={styles.billingBadgeText}>{t('config.features.billingWarning')}</Text>
                </View>
              )}
            </View>
            <Switch
              value={!!features[feature.key]}
              onValueChange={() => toggleFeature(feature)}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primaryLight }}
              thumbColor={features[feature.key] ? colors.primary : colors.foregroundMuted}
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
