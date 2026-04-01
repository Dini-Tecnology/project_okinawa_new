/**
 * CasualDiningConfigScreen - Casual-Dining Service Configuration
 *
 * Configure tables & turnover, menu, service, reservations, and happy hour.
 * Each field auto-saves via PATCH with debounce (500ms) or immediate for toggles.
 *
 * @module config/CasualDiningConfigScreen
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Text, TextInput, ActivityIndicator, SegmentedButtons, Snackbar } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import ApiService from '@/shared/services/api';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// TYPES
// ============================================

type ReservationPolicy = 'walk_in_only' | 'reservations_accepted' | 'both';

interface CasualDiningConfig {
  turnoverTarget: number; familyArea: boolean; kidsMenu: boolean; allergens: boolean;
  combos: boolean; condiments: boolean; highChairs: number;
  reservationPolicy: ReservationPolicy; groupMin: number;
  happyHourStart: string; happyHourEnd: string; happyHourDiscount: number;
}

interface CasualDiningConfigScreenProps {
  route?: { params?: { restaurantId: string } };
}

const DEFAULTS: CasualDiningConfig = {
  turnoverTarget: 90, familyArea: false, kidsMenu: false, allergens: false,
  combos: false, condiments: false, highChairs: 0,
  reservationPolicy: 'both', groupMin: 8,
  happyHourStart: '17:00', happyHourEnd: '20:00', happyHourDiscount: 0,
};

// ============================================
// HELPERS
// ============================================

function SectionHeader({ title, colors }: { title: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="titleMedium" style={{ color: colors.foreground, fontWeight: '700' }}>{title}</Text>
      <View style={[styles.divider, { backgroundColor: colors.backgroundTertiary }]} />
    </View>
  );
}

function SwitchRow({ label, value, onValueChange, colors }: { label: string; value: boolean; onValueChange: (v: boolean) => void; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.row}>
      <Text variant="bodyLarge" style={{ color: colors.foreground, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.backgroundTertiary, true: colors.primary }} accessibilityLabel={label} />
    </View>
  );
}

function NumberRow({ label, value, onChange, colors, width = 80 }: { label: string; value: string; onChange: (v: string) => void; colors: ReturnType<typeof useColors>; width?: number }) {
  return (
    <View style={styles.row}>
      <Text variant="bodyLarge" style={{ color: colors.foreground, flex: 1 }}>{label}</Text>
      <TextInput mode="outlined" value={value} onChangeText={onChange} keyboardType="numeric" style={{ width, textAlign: 'center' }} dense accessibilityLabel={label} />
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CasualDiningConfigScreen({ route }: CasualDiningConfigScreenProps) {
  const colors = useColors();
  const queryClient = useQueryClient();
  const restaurantId = route?.params?.restaurantId || '';
  const [config, setConfig] = useState<CasualDiningConfig>(DEFAULTS);
  const [toastVisible, setToastVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isLoading, data: queryData } = useQuery<CasualDiningConfig>({
    queryKey: ['casualDiningConfig', restaurantId],
    queryFn: async () => { const res = await ApiService.get(`/service-config/${restaurantId}`); return res.data; },
    enabled: !!restaurantId,
  });

  useEffect(() => {
    if (queryData) { setConfig({ ...DEFAULTS, ...queryData }); }
  }, [queryData]);

  const saveMutation = useMutation({
    mutationFn: async (patch: Partial<CasualDiningConfig>) => ApiService.patch(`/service-config/${restaurantId}`, patch),
    onSuccess: () => { setIsSaving(false); setToastVisible(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); queryClient.invalidateQueries({ queryKey: ['casualDiningConfig', restaurantId] }); },
    onError: (error: any) => { setIsSaving(false); Alert.alert(t('common.error'), error?.message || t('common.error')); },
  });

  const debouncedSave = useCallback((field: keyof CasualDiningConfig, value: any) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setIsSaving(true); saveMutation.mutate({ [field]: value }); }, 500);
  }, [saveMutation]);

  const immediateSave = useCallback((field: keyof CasualDiningConfig, value: any) => {
    setIsSaving(true); saveMutation.mutate({ [field]: value });
  }, [saveMutation]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const updateField = useCallback((field: keyof CasualDiningConfig, value: any, immediate = false) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    immediate ? immediateSave(field, value) : debouncedSave(field, value);
  }, [debouncedSave, immediateSave]);

  const handleToggle = useCallback((field: keyof CasualDiningConfig) => (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateField(field, value, true);
  }, [updateField]);

  const parseNum = (v: string, field: keyof CasualDiningConfig) => updateField(field, parseInt(v, 10) || 0);

  const policyOptions = [
    { value: 'walk_in_only', label: t('casualDining.config.walkInOnly') },
    { value: 'reservations_accepted', label: t('casualDining.config.reservationsAccepted') },
    { value: 'both', label: t('casualDining.config.both') },
  ];

  if (isLoading) {
    return (
      <ScreenContainer hasKeyboard>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: colors.foreground, fontWeight: '700' }}>{t('casualDining.config.title')}</Text>
        </View>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
      </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer hasKeyboard>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text variant="headlineMedium" style={{ color: colors.foreground, fontWeight: '700', flex: 1 }}>{t('casualDining.config.title')}</Text>
          {isSaving && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tables & Turnover */}
        <SectionHeader title={t('casualDining.config.tables')} colors={colors} />
        <NumberRow label={t('casualDining.config.turnoverTarget')} value={String(config.turnoverTarget)} onChange={(v) => parseNum(v, 'turnoverTarget')} colors={colors} />
        <SwitchRow label={t('casualDining.config.familyArea')} value={config.familyArea} onValueChange={handleToggle('familyArea')} colors={colors} />

        {/* Menu */}
        <SectionHeader title={t('casualDining.config.menu')} colors={colors} />
        <SwitchRow label={t('casualDining.config.kidsMenu')} value={config.kidsMenu} onValueChange={handleToggle('kidsMenu')} colors={colors} />
        <SwitchRow label={t('casualDining.config.allergens')} value={config.allergens} onValueChange={handleToggle('allergens')} colors={colors} />
        <SwitchRow label={t('casualDining.config.combos')} value={config.combos} onValueChange={handleToggle('combos')} colors={colors} />

        {/* Service */}
        <SectionHeader title={t('casualDining.config.service')} colors={colors} />
        <SwitchRow label={t('casualDining.config.condiments')} value={config.condiments} onValueChange={handleToggle('condiments')} colors={colors} />
        <NumberRow label={t('casualDining.config.highChairs')} value={String(config.highChairs)} onChange={(v) => parseNum(v, 'highChairs')} colors={colors} />

        {/* Reservations */}
        <SectionHeader title={t('casualDining.config.reservations')} colors={colors} />
        <View style={styles.fieldBlock}>
          <Text variant="bodyLarge" style={{ color: colors.foreground, marginBottom: 8 }}>{t('casualDining.config.policy')}</Text>
          <SegmentedButtons value={config.reservationPolicy} onValueChange={(v) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            updateField('reservationPolicy', v as ReservationPolicy, true);
          }} buttons={policyOptions} density="small" />
        </View>
        <NumberRow label={t('casualDining.config.groupMin')} value={String(config.groupMin)} onChange={(v) => parseNum(v, 'groupMin')} colors={colors} />

        {/* Happy Hour */}
        <SectionHeader title={t('casualDining.config.happyHour')} colors={colors} />
        <View style={styles.row}>
          <Text variant="bodyLarge" style={{ color: colors.foreground, flex: 1 }}>{t('casualDining.config.start')}</Text>
          <TextInput mode="outlined" value={config.happyHourStart} onChangeText={(v) => updateField('happyHourStart', v)} placeholder="HH:MM" style={styles.timeInput} dense accessibilityLabel="Happy hour start time" />
        </View>
        <View style={styles.row}>
          <Text variant="bodyLarge" style={{ color: colors.foreground, flex: 1 }}>{t('casualDining.config.end')}</Text>
          <TextInput mode="outlined" value={config.happyHourEnd} onChangeText={(v) => updateField('happyHourEnd', v)} placeholder="HH:MM" style={styles.timeInput} dense accessibilityLabel="Happy hour end time" />
        </View>
        <NumberRow label={t('casualDining.config.discount')} value={String(config.happyHourDiscount)} onChange={(v) => parseNum(v, 'happyHourDiscount')} colors={colors} />

        <View style={{ height: 40 }} />
      </ScrollView>

      <Snackbar visible={toastVisible} onDismiss={() => setToastVisible(false)} duration={2000} style={{ backgroundColor: colors.success }}>
        {t('casualDining.config.saved')}
      </Snackbar>
    </View>
    </ScreenContainer>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  sectionHeader: { marginTop: 20, marginBottom: 12, gap: 6 },
  divider: { height: 1, borderRadius: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, minHeight: 48 },
  fieldBlock: { paddingVertical: 10 },
  timeInput: { width: 100, textAlign: 'center' },
});
