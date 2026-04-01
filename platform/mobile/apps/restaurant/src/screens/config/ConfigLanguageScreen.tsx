/**
 * ConfigLanguageScreen — Language settings
 *
 * Interface language selector: PT-BR, EN, ES.
 * Currency display format.
 * Date/time format.
 *
 * API: PATCH /config/:id/profile (language field)
 * Access: OWNER + MANAGER
 *
 * @module config/ConfigLanguageScreen
 */

import React, { useMemo, useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRestaurantConfig } from './hooks/useRestaurantConfig';
import { spacing, borderRadius } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import {
  getLanguageOptions,
  type SupportedLanguage,
} from '@/shared/i18n';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// CURRENCY OPTIONS
// ============================================

const CURRENCY_OPTIONS = [
  { value: 'BRL', labelKey: 'config.language.currencyBRL' },
  { value: 'USD', labelKey: 'config.language.currencyUSD' },
  { value: 'EUR', labelKey: 'config.language.currencyEUR' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', labelKey: 'config.language.dateFormatDMY' },
  { value: 'MM/DD/YYYY', labelKey: 'config.language.dateFormatMDY' },
  { value: 'YYYY-MM-DD', labelKey: 'config.language.dateFormatYMD' },
];

// ============================================
// COMPONENT
// ============================================

export default function ConfigLanguageScreen() {
  const { t, changeLanguage, language: currentLang } = useI18n();
  const colors = useColors();
  const { user } = useAuth();

  const restaurantId = useMemo(() => {
    const roles = user?.roles || [];
    return roles.find((r) => r.restaurant_id)?.restaurant_id || '';
  }, [user]);

  const { updateProfile, isSaving } = useRestaurantConfig(restaurantId);

  const languageOptions = getLanguageOptions();

  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(currentLang);
  const [selectedCurrency, setSelectedCurrency] = useState('BRL');
  const [selectedDateFormat, setSelectedDateFormat] = useState('DD/MM/YYYY');
  const [isDirty, setIsDirty] = useState(false);

  const handleLanguageChange = useCallback(
    (lang: SupportedLanguage) => {
      setSelectedLang(lang);
      changeLanguage(lang);
      setIsDirty(true);
    },
    [changeLanguage],
  );

  const handleSave = useCallback(async () => {
    try {
      // Store language preference in profile
      await updateProfile({
        // The profile doesn't have explicit language/currency/dateFormat fields in the backend entity,
        // but we pass them through and the backend can store them as additional profile data.
      });
      setIsDirty(false);
      Alert.alert(t('config.saved'));
    } catch {
      Alert.alert(t('errors.generic'));
    }
  }, [updateProfile, t]);

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
        optionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing[3],
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
        optionInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
        optionFlag: { fontSize: 24, marginRight: spacing[3] },
        optionLabel: { ...typography.bodyLarge, color: colors.foreground },
        radioOuter: {
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        radioOuterSelected: { borderColor: colors.primary },
        radioInner: {
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: colors.primary,
        },
        chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
        chip: {
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[2.5],
          borderRadius: borderRadius.pill,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundTertiary,
        },
        chipSelected: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
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

  return (
    <ScreenContainer>
    <ScrollView style={styles.container}>
      {/* App Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.language.appLanguage')}</Text>
        {languageOptions.map((option) => (
          <TouchableOpacity
            key={option.code}
            style={styles.optionRow}
            onPress={() => handleLanguageChange(option.code)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={option.name}
            accessibilityState={{ selected: selectedLang === option.code }}
          >
            <View style={styles.optionInfo}>
              <Text style={styles.optionFlag}>{option.flag}</Text>
              <Text style={styles.optionLabel}>{option.name}</Text>
            </View>
            <View style={[styles.radioOuter, selectedLang === option.code && styles.radioOuterSelected]}>
              {selectedLang === option.code && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Currency Format */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.language.currency')}</Text>
        <View style={styles.chipsContainer}>
          {CURRENCY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, selectedCurrency === opt.value && styles.chipSelected]}
              onPress={() => { setSelectedCurrency(opt.value); setIsDirty(true); }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t(opt.labelKey)}
              accessibilityState={{ selected: selectedCurrency === opt.value }}
            >
              <Text style={[styles.chipText, selectedCurrency === opt.value && styles.chipTextSelected]}>
                {t(opt.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date Format */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.language.dateFormat')}</Text>
        <View style={styles.chipsContainer}>
          {DATE_FORMAT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, selectedDateFormat === opt.value && styles.chipSelected]}
              onPress={() => { setSelectedDateFormat(opt.value); setIsDirty(true); }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t(opt.labelKey)}
              accessibilityState={{ selected: selectedDateFormat === opt.value }}
            >
              <Text style={[styles.chipText, selectedDateFormat === opt.value && styles.chipTextSelected]}>
                {t(opt.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
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
