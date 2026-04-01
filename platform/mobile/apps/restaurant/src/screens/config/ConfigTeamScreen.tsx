/**
 * ConfigTeamScreen — Team & role configuration
 *
 * Tip distribution policy: equal / by_role / by_hours.
 * Role configuration: toggle active/inactive per role.
 *
 * API: PATCH /config/:id/team
 * Access: OWNER only
 *
 * @module config/ConfigTeamScreen
 */

import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Switch } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRestaurantConfig } from './hooks/useRestaurantConfig';
import { spacing, borderRadius } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { TeamConfig, TipDistributionPolicy } from './types/config.types';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// OPTIONS
// ============================================

const TIP_POLICIES: { value: TipDistributionPolicy; labelKey: string }[] = [
  { value: 'equal', labelKey: 'config.team.tipPolicyEqual' },
  { value: 'by_role', labelKey: 'config.team.tipPolicyByRole' },
  { value: 'by_hours', labelKey: 'config.team.tipPolicyByHours' },
];

const TEAM_ROLES: { key: string; labelKey: string }[] = [
  { key: 'WAITER', labelKey: 'config.team.waiter' },
  { key: 'COOK', labelKey: 'config.team.cook' },
  { key: 'BARMAN', labelKey: 'config.team.barman' },
  { key: 'MAITRE', labelKey: 'config.team.maitre' },
  { key: 'CASHIER', labelKey: 'config.team.cashier' },
  { key: 'HOST', labelKey: 'config.team.host' },
];

// ============================================
// COMPONENT
// ============================================

export default function ConfigTeamScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const { user } = useAuth();

  const restaurantId = useMemo(() => {
    const roles = user?.roles || [];
    return roles.find((r) => r.restaurant_id)?.restaurant_id || '';
  }, [user]);

  const { config, isLoading, updateTeam, isSaving } = useRestaurantConfig(restaurantId);

  const [tipPolicy, setTipPolicy] = useState<string>('equal');
  const [activeRoles, setActiveRoles] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (config?.team_config) {
      setTipPolicy(config.team_config.tipDistributionPolicy || 'equal');
      // Derive active roles from config
      const roles: Record<string, boolean> = {};
      TEAM_ROLES.forEach((role) => {
        roles[role.key] = config.team_config.roles?.[role.key] !== undefined;
      });
      setActiveRoles(roles);
    }
  }, [config]);

  const handlePolicyChange = useCallback((policy: string) => {
    setTipPolicy(policy);
    setIsDirty(true);
  }, []);

  const toggleRole = useCallback((roleKey: string) => {
    setActiveRoles((prev) => ({ ...prev, [roleKey]: !prev[roleKey] }));
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const roles: Record<string, { maxCount?: number; permissions?: string[] }> = {};
      TEAM_ROLES.forEach((role) => {
        if (activeRoles[role.key]) {
          roles[role.key] = config?.team_config?.roles?.[role.key] || { permissions: [] };
        }
      });
      await updateTeam({
        tipDistributionPolicy: tipPolicy,
        roles,
      });
      setIsDirty(false);
      Alert.alert(t('config.saved'));
    } catch {
      Alert.alert(t('errors.generic'));
    }
  }, [tipPolicy, activeRoles, config, updateTeam, t]);

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
        policyRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing[2],
        },
        policyChip: {
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[2.5],
          borderRadius: borderRadius.pill,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundTertiary,
        },
        policyChipSelected: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        policyChipText: { ...typography.labelLarge, color: colors.foreground },
        policyChipTextSelected: { color: colors.primaryForeground },
        roleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing[3],
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
        roleInfo: { flex: 1 },
        roleLabel: { ...typography.bodyLarge, color: colors.foreground },
        roleStatus: { ...typography.bodySmall, color: colors.foregroundSecondary },
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
      {/* Tip Distribution Policy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.team.tipPolicy')}</Text>
        <View style={styles.policyRow}>
          {TIP_POLICIES.map((policy) => (
            <TouchableOpacity
              key={policy.value}
              style={[styles.policyChip, tipPolicy === policy.value && styles.policyChipSelected]}
              onPress={() => handlePolicyChange(policy.value)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t(policy.labelKey)}
              accessibilityState={{ selected: tipPolicy === policy.value }}
            >
              <Text
                style={[
                  styles.policyChipText,
                  tipPolicy === policy.value && styles.policyChipTextSelected,
                ]}
              >
                {t(policy.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Roles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.team.roles')}</Text>
        {TEAM_ROLES.map((role) => (
          <View key={role.key} style={styles.roleRow}>
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>{t(role.labelKey)}</Text>
              <Text style={styles.roleStatus}>
                {activeRoles[role.key] ? t('config.team.roleActive') : t('config.team.roleInactive')}
              </Text>
            </View>
            <Switch
              value={!!activeRoles[role.key]}
              onValueChange={() => toggleRole(role.key)}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primaryLight }}
              thumbColor={activeRoles[role.key] ? colors.primary : colors.foregroundMuted}
            />
          </View>
        ))}
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
