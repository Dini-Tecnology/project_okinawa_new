/**
 * GroupBookingScreen -- Multi-step form for group reservations (8+ guests)
 *
 * 3 steps:
 *   1. Group details: party size (slider 8-50), date, time, occasion
 *   2. Contact info: coordinator name, phone, email
 *   3. Menu preferences: pre-fixed menu toggle, dietary restrictions, notes
 *
 * POST /reservations/group
 * Confirmation screen with reference number
 *
 * @module reservations/GroupBookingScreen
 * @epic EPIC 17 — Extended Features
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Switch,
  Card,
  Chip,
  ActivityIndicator,
  ProgressBar,
  IconButton,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@/shared/contexts/ThemeContext';
import { spacing, borderRadius } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

// ============================================
// TYPES
// ============================================

type Step = 1 | 2 | 3;

interface GroupBookingForm {
  // Step 1: Group details
  partySize: number;
  date: Date;
  time: Date;
  occasion: string;
  // Step 2: Contact
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  // Step 3: Menu
  preFixedMenu: boolean;
  dietaryRestrictions: string[];
  additionalNotes: string;
}

interface ConfirmationData {
  id: string;
  referenceNumber: string;
}

const OCCASION_OPTIONS = [
  { key: 'birthday', labelKey: 'groupBooking.occasionBirthday' },
  { key: 'corporate', labelKey: 'groupBooking.occasionCorporate' },
  { key: 'wedding', labelKey: 'groupBooking.occasionWedding' },
  { key: 'other', labelKey: 'groupBooking.occasionOther' },
];

const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'lactose-free',
  'nut-free',
  'kosher',
  'halal',
];

const MIN_GROUP_SIZE = 8;
const MAX_GROUP_SIZE = 50;

// ============================================
// COMPONENT
// ============================================

export default function GroupBookingScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { restaurantId } = route.params as { restaurantId: string };

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [form, setForm] = useState<GroupBookingForm>({
    partySize: MIN_GROUP_SIZE,
    date: new Date(),
    time: new Date(),
    occasion: '',
    coordinatorName: '',
    coordinatorPhone: '',
    coordinatorEmail: '',
    preFixedMenu: false,
    dietaryRestrictions: [],
    additionalNotes: '',
  });

  // ---- Form helpers ----
  const updateForm = useCallback(
    <K extends keyof GroupBookingForm>(key: K, value: GroupBookingForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleDietary = useCallback((item: string) => {
    setForm((prev) => {
      const exists = prev.dietaryRestrictions.includes(item);
      return {
        ...prev,
        dietaryRestrictions: exists
          ? prev.dietaryRestrictions.filter((d) => d !== item)
          : [...prev.dietaryRestrictions, item],
      };
    });
  }, []);

  // ---- Validation per step ----
  const isStep1Valid = form.partySize >= MIN_GROUP_SIZE && form.occasion !== '';
  const isStep2Valid =
    form.coordinatorName.trim().length > 0 &&
    form.coordinatorPhone.trim().length > 0;
  const isStep3Valid = true; // Step 3 is optional fields

  const canProceed = step === 1 ? isStep1Valid : step === 2 ? isStep2Valid : isStep3Valid;

  // ---- Navigation ----
  const goNext = useCallback(() => {
    if (step < 3) setStep((s) => (s + 1) as Step);
  }, [step]);

  const goBack = useCallback(() => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }, [step]);

  // ---- Estimated deposit ----
  const estimatedDeposit = useMemo(() => {
    if (form.partySize >= 15) {
      return form.partySize * 50; // R$50 per person for large groups
    }
    if (form.partySize >= 10) {
      return form.partySize * 30; // R$30 per person for medium groups
    }
    return 0;
  }, [form.partySize]);

  // ---- Submit ----
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const payload = {
        restaurant_id: restaurantId,
        reservation_date: format(form.date, 'yyyy-MM-dd'),
        reservation_time: format(form.time, 'HH:mm'),
        party_size: form.partySize,
        occasion: form.occasion,
        group_coordinator_name: form.coordinatorName.trim(),
        group_coordinator_phone: form.coordinatorPhone.trim(),
        contact_phone: form.coordinatorPhone.trim(),
        pre_fixed_menu: form.preFixedMenu,
        dietary_restrictions:
          form.dietaryRestrictions.length > 0 ? form.dietaryRestrictions : undefined,
        special_requests: form.additionalNotes.trim() || undefined,
        deposit_required: estimatedDeposit > 0,
        deposit_amount: estimatedDeposit > 0 ? estimatedDeposit : undefined,
      };

      const response = await ApiService.post('/reservations/group', payload);

      setConfirmation({
        id: response.data.id,
        referenceNumber: response.data.id.slice(0, 8).toUpperCase(),
      });
    } catch (error) {
      const err = error as Error;
      Alert.alert(t('common.error'), err.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  }, [form, restaurantId, estimatedDeposit, t]);

  // ---- Styles ----
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.backgroundSecondary,
        },
        scrollContent: {
          padding: spacing.screenHorizontal,
          paddingBottom: spacing[10],
        },
        header: {
          paddingTop: spacing[4],
          paddingBottom: spacing[3],
        },
        title: {
          ...typography.h2,
          color: colors.foreground,
          marginBottom: spacing[1],
        },
        stepIndicator: {
          ...typography.labelMedium,
          color: colors.foregroundSecondary,
          marginBottom: spacing[3],
        },
        progressBar: {
          marginBottom: spacing[5],
          borderRadius: borderRadius.full,
        },
        section: {
          backgroundColor: colors.card,
          borderRadius: borderRadius.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: spacing[4],
          marginBottom: spacing[4],
        },
        sectionTitle: {
          ...typography.h3,
          color: colors.foreground,
          marginBottom: spacing[3],
        },
        label: {
          ...typography.labelLarge,
          color: colors.foreground,
          marginBottom: spacing[1],
        },
        sublabel: {
          ...typography.bodySmall,
          color: colors.foregroundSecondary,
          marginBottom: spacing[2],
        },
        sliderContainer: {
          marginBottom: spacing[4],
        },
        sliderValue: {
          ...typography.h2,
          color: colors.primary,
          textAlign: 'center',
          marginBottom: spacing[2],
        },
        row: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing[2],
          marginBottom: spacing[3],
        },
        input: {
          marginBottom: spacing[3],
          backgroundColor: colors.card,
        },
        toggleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing[3],
        },
        toggleLabel: {
          ...typography.bodyLarge,
          color: colors.foreground,
          flex: 1,
        },
        depositCard: {
          backgroundColor: colors.backgroundTertiary,
          borderRadius: borderRadius.card,
          padding: spacing[4],
          marginTop: spacing[3],
        },
        depositLabel: {
          ...typography.labelMedium,
          color: colors.foregroundSecondary,
        },
        depositAmount: {
          ...typography.h2,
          color: colors.primary,
          marginTop: spacing[1],
        },
        actions: {
          flexDirection: 'row',
          gap: spacing[3],
          marginTop: spacing[4],
        },
        backButton: {
          flex: 1,
        },
        nextButton: {
          flex: 2,
        },
        // Confirmation
        confirmationContainer: {
          flex: 1,
          backgroundColor: colors.backgroundSecondary,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.screenHorizontal,
        },
        confirmationCard: {
          backgroundColor: colors.card,
          borderRadius: borderRadius.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: spacing[6],
          alignItems: 'center',
          width: '100%',
        },
        confirmationIcon: {
          marginBottom: spacing[3],
        },
        confirmationTitle: {
          ...typography.h2,
          color: colors.foreground,
          textAlign: 'center',
          marginBottom: spacing[2],
        },
        confirmationRef: {
          ...typography.h3,
          color: colors.primary,
          marginBottom: spacing[2],
        },
        confirmationMessage: {
          ...typography.bodyLarge,
          color: colors.foregroundSecondary,
          textAlign: 'center',
          marginBottom: spacing[5],
        },
        dateButton: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.backgroundTertiary,
          borderRadius: borderRadius.sm,
          padding: spacing[3],
          marginBottom: spacing[3],
        },
        dateButtonText: {
          ...typography.bodyLarge,
          color: colors.foreground,
          marginLeft: spacing[2],
        },
        infoNotice: {
          ...typography.bodySmall,
          color: colors.foregroundSecondary,
          fontStyle: 'italic',
          marginBottom: spacing[3],
        },
      }),
    [colors],
  );

  // ---- Confirmation Screen ----
  if (confirmation) {
    return (
      <View style={styles.confirmationContainer}>
        <View style={styles.confirmationCard}>
          <IconButton
            icon="check-circle"
            size={64}
            iconColor={colors.success}
            style={styles.confirmationIcon}
          />
          <Text style={styles.confirmationTitle}>
            {t('groupBooking.submitted')}
          </Text>
          <Text style={styles.confirmationRef}>
            #{confirmation.referenceNumber}
          </Text>
          <Text style={styles.confirmationMessage}>
            {t('groupBooking.awaitingConfirmation')}
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            buttonColor={colors.primary}
            textColor={colors.primaryForeground}
          >
            {t('common.done')}
          </Button>
        </View>
      </View>
    );
  }

  // ---- Step 1: Group Details ----
  const renderStep1 = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('groupBooking.stepGroupDetails')}
        </Text>

        {/* Party Size Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>{t('groupBooking.partySize')}</Text>
          <Text style={styles.sliderValue}>{form.partySize}</Text>
          <Slider
            minimumValue={MIN_GROUP_SIZE}
            maximumValue={MAX_GROUP_SIZE}
            step={1}
            value={form.partySize}
            onValueChange={(val) => updateForm('partySize', Math.round(val))}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.backgroundTertiary}
            thumbTintColor={colors.primary}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.sublabel}>{MIN_GROUP_SIZE}</Text>
            <Text style={styles.sublabel}>{MAX_GROUP_SIZE}</Text>
          </View>
        </View>

        {/* Date */}
        <Text style={styles.label}>{t('reservations.date')}</Text>
        <View
          style={styles.dateButton}
          onTouchEnd={() => setShowDatePicker(true)}
        >
          <IconButton icon="calendar" size={20} iconColor={colors.primary} style={{ margin: 0 }} />
          <Text style={styles.dateButtonText}>
            {format(form.date, 'dd/MM/yyyy')}
          </Text>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={form.date}
            mode="date"
            minimumDate={new Date()}
            onChange={(_, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) updateForm('date', selectedDate);
            }}
          />
        )}

        {/* Time */}
        <Text style={styles.label}>{t('reservations.time')}</Text>
        <View
          style={styles.dateButton}
          onTouchEnd={() => setShowTimePicker(true)}
        >
          <IconButton icon="clock-outline" size={20} iconColor={colors.primary} style={{ margin: 0 }} />
          <Text style={styles.dateButtonText}>
            {format(form.time, 'HH:mm')}
          </Text>
        </View>
        {showTimePicker && (
          <DateTimePicker
            value={form.time}
            mode="time"
            is24Hour={true}
            onChange={(_, selectedTime) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) updateForm('time', selectedTime);
            }}
          />
        )}

        {/* Occasion */}
        <Text style={styles.label}>{t('groupBooking.occasion')}</Text>
        <View style={styles.row}>
          {OCCASION_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              selected={form.occasion === option.key}
              onPress={() => updateForm('occasion', option.key)}
              selectedColor={colors.primary}
              style={{ backgroundColor: form.occasion === option.key ? colors.primaryLight : colors.backgroundTertiary }}
            >
              {t(option.labelKey)}
            </Chip>
          ))}
        </View>
      </View>

      {/* Deposit estimate */}
      {estimatedDeposit > 0 && (
        <View style={styles.depositCard}>
          <Text style={styles.depositLabel}>{t('groupBooking.priceEstimate')}</Text>
          <Text style={styles.depositAmount}>
            R$ {estimatedDeposit.toFixed(2)}
          </Text>
          <Text style={styles.sublabel}>{t('groupBooking.deposit')}</Text>
        </View>
      )}
    </>
  );

  // ---- Step 2: Contact Info ----
  const renderStep2 = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t('groupBooking.stepContactInfo')}
      </Text>
      <Text style={styles.infoNotice}>
        {t('groupBooking.coordinatorRequired')}
      </Text>

      <TextInput
        label={t('groupBooking.coordinatorName')}
        value={form.coordinatorName}
        onChangeText={(val) => updateForm('coordinatorName', val)}
        mode="outlined"
        style={styles.input}
        outlineColor={colors.cardBorder}
        activeOutlineColor={colors.primary}
      />

      <TextInput
        label={t('groupBooking.coordinatorPhone')}
        value={form.coordinatorPhone}
        onChangeText={(val) => updateForm('coordinatorPhone', val)}
        mode="outlined"
        keyboardType="phone-pad"
        style={styles.input}
        outlineColor={colors.cardBorder}
        activeOutlineColor={colors.primary}
      />

      <TextInput
        label={t('auth.email')}
        value={form.coordinatorEmail}
        onChangeText={(val) => updateForm('coordinatorEmail', val)}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        outlineColor={colors.cardBorder}
        activeOutlineColor={colors.primary}
      />
    </View>
  );

  // ---- Step 3: Menu Preferences ----
  const renderStep3 = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t('groupBooking.stepMenuPreferences')}
      </Text>

      {/* Pre-fixed menu toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>{t('groupBooking.preFixedMenu')}</Text>
        <Switch
          value={form.preFixedMenu}
          onValueChange={(val) => updateForm('preFixedMenu', val)}
          trackColor={{ false: colors.backgroundTertiary, true: colors.primaryLight }}
          thumbColor={form.preFixedMenu ? colors.primary : colors.foregroundMuted}
        />
      </View>

      {/* Dietary restrictions */}
      <Text style={styles.label}>{t('groupBooking.dietaryRestrictions')}</Text>
      <View style={styles.row}>
        {DIETARY_OPTIONS.map((item) => (
          <Chip
            key={item}
            selected={form.dietaryRestrictions.includes(item)}
            onPress={() => toggleDietary(item)}
            selectedColor={colors.primary}
            style={{
              backgroundColor: form.dietaryRestrictions.includes(item)
                ? colors.primaryLight
                : colors.backgroundTertiary,
            }}
          >
            {item}
          </Chip>
        ))}
      </View>

      {/* Additional notes */}
      <TextInput
        label={t('groupBooking.additionalNotes')}
        value={form.additionalNotes}
        onChangeText={(val) => updateForm('additionalNotes', val)}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
        outlineColor={colors.cardBorder}
        activeOutlineColor={colors.primary}
      />

      {/* Deposit summary */}
      {estimatedDeposit > 0 && (
        <View style={styles.depositCard}>
          <Text style={styles.depositLabel}>{t('groupBooking.deposit')}</Text>
          <Text style={styles.depositAmount}>
            R$ {estimatedDeposit.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );

  // ---- Main Render ----
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('groupBooking.title')}</Text>
          <Text style={styles.stepIndicator}>
            {t('groupBooking.stepGroupDetails').split(' ')[0]} {step}/3
          </Text>
          <ProgressBar
            progress={step / 3}
            color={colors.primary}
            style={styles.progressBar}
          />
        </View>

        {/* Step content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Actions */}
        <View style={styles.actions}>
          {step > 1 && (
            <Button
              mode="outlined"
              onPress={goBack}
              style={styles.backButton}
              textColor={colors.foreground}
            >
              {t('common.previous')}
            </Button>
          )}
          {step < 3 ? (
            <Button
              mode="contained"
              onPress={goNext}
              disabled={!canProceed}
              style={styles.nextButton}
              buttonColor={colors.primary}
              textColor={colors.primaryForeground}
            >
              {t('common.next')}
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={submitting}
              loading={submitting}
              style={styles.nextButton}
              buttonColor={colors.primary}
              textColor={colors.primaryForeground}
            >
              {t('common.confirm')}
            </Button>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
