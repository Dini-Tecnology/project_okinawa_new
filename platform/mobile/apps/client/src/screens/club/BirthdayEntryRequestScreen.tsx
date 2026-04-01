/**
 * BirthdayEntryRequestScreen - Birthday Celebration Entry
 *
 * Form for requesting a birthday celebration entry with
 * birthday person details, party size, and celebration type.
 * Shows confirmation with reference number on success.
 *
 * @module client/screens/club
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Card,
  SegmentedButtons,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ApiService } from '@okinawa/shared/services/api';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// TYPES
// ============================================

type CelebrationType = 'standard' | 'vip';

interface BirthdayEntryResult {
  id: string;
  referenceNumber: string;
  status: string;
  birthdayPersonName: string;
  celebrationType: string;
}

interface BirthdayEntryRequestScreenProps {
  route?: {
    params?: {
      restaurantId: string;
      eventDate?: string;
    };
  };
}

// ============================================
// CONFIRMATION SCREEN
// ============================================

function ConfirmationDisplay({
  result,
  colors,
  onDone,
}: {
  result: BirthdayEntryResult;
  colors: ReturnType<typeof useColors>;
  onDone: () => void;
}) {
  return (
    <View style={[confirmStyles.container, { backgroundColor: colors.background }]}>
      <View style={confirmStyles.content}>
        <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>
          🎂
        </Text>
        <Text
          variant="headlineMedium"
          style={{ color: colors.foreground, textAlign: 'center', fontWeight: '700' }}
        >
          {t('club.birthday.confirmation')}
        </Text>
        <Text
          variant="bodyLarge"
          style={{ color: colors.foregroundSecondary, textAlign: 'center', marginTop: 8 }}
        >
          {result.birthdayPersonName}
        </Text>

        <Card
          style={[confirmStyles.refCard, { backgroundColor: colors.card }]}
          mode="elevated"
        >
          <Card.Content style={confirmStyles.refContent}>
            <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
              {t('club.birthday.referenceNumber')}
            </Text>
            <Text
              variant="headlineSmall"
              style={{ color: colors.primary, fontWeight: '800', letterSpacing: 2 }}
            >
              {result.referenceNumber}
            </Text>
          </Card.Content>
        </Card>

        <View style={confirmStyles.detailsRow}>
          <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
            {t('club.birthday.celebrationType')}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.foreground, fontWeight: '600' }}>
            {result.celebrationType === 'vip'
              ? t('club.birthday.vip')
              : t('club.birthday.standard')}
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={onDone}
          style={confirmStyles.doneBtn}
          contentStyle={confirmStyles.doneBtnContent}
        >
          {t('common.done')}
        </Button>
      </View>
    </View>
  );
}

const confirmStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  content: { gap: 12 },
  refCard: { borderRadius: 16, marginVertical: 12 },
  refContent: { alignItems: 'center', padding: 24 },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  doneBtn: { borderRadius: 12, marginTop: 16 },
  doneBtnContent: { height: 48 },
});

// ============================================
// MAIN COMPONENT
// ============================================

export default function BirthdayEntryRequestScreen({ route }: BirthdayEntryRequestScreenProps) {
  const colors = useColors();
  const navigation = useNavigation<any>();

  const restaurantId = route?.params?.restaurantId || '';
  const eventDate = route?.params?.eventDate || '';

  // Form state
  const [birthdayName, setBirthdayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [celebrationType, setCelebrationType] = useState<CelebrationType>('standard');
  const [result, setResult] = useState<BirthdayEntryResult | null>(null);

  const celebrationOptions = useMemo(
    () => [
      { value: 'standard', label: t('club.birthday.standard') },
      { value: 'vip', label: t('club.birthday.vip') },
    ],
    [],
  );

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await ApiService.post('/birthday-entries', {
        restaurantId,
        eventDate: eventDate || new Date().toISOString(),
        birthdayPersonName: birthdayName.trim(),
        dateOfBirth,
        partySize: parseInt(partySize, 10),
        contactPhone: contactPhone.trim(),
        specialRequests: specialRequests.trim(),
        celebrationType,
      });
      return response.data as BirthdayEntryResult;
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: Error) => {
      Alert.alert(t('common.error'), error.message);
    },
  });

  const handleSubmit = useCallback(() => {
    // Validation
    if (!birthdayName.trim()) {
      Alert.alert(t('common.error'), t('common.required'));
      return;
    }
    if (!dateOfBirth.trim()) {
      Alert.alert(t('common.error'), t('common.required'));
      return;
    }
    if (!contactPhone.trim()) {
      Alert.alert(t('common.error'), t('common.required'));
      return;
    }
    const size = parseInt(partySize, 10);
    if (!size || size < 1 || size > 20) {
      Alert.alert(t('common.error'), t('reservations.invalidPartySize'));
      return;
    }
    submitMutation.mutate();
  }, [birthdayName, dateOfBirth, contactPhone, partySize, submitMutation]);

  const handleDone = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Show confirmation on success
  if (result) {
    return (
      <ScreenContainer>
        <ConfirmationDisplay result={result} colors={colors} onDone={handleDone} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer hasKeyboard>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={{ fontSize: 48, textAlign: 'center' }}>🎂</Text>
          <Text
            variant="headlineSmall"
            style={{ color: colors.foreground, fontWeight: '700', textAlign: 'center' }}
          >
            {t('club.birthday.title')}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: colors.foregroundSecondary, textAlign: 'center' }}
          >
            {t('club.birthday.subtitle')}
          </Text>
        </View>

        {/* Form */}
        <TextInput
          label={t('club.birthday.personName')}
          value={birthdayName}
          onChangeText={setBirthdayName}
          mode="outlined"
          style={styles.input}
          accessibilityLabel="Birthday person name"
        />

        <TextInput
          label={t('club.birthday.dateOfBirth')}
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="DD/MM/AAAA"
          mode="outlined"
          style={styles.input}
          keyboardType="number-pad"
          accessibilityLabel="Date of birth"
        />

        <TextInput
          label={t('club.birthday.partySize')}
          value={partySize}
          onChangeText={setPartySize}
          keyboardType="number-pad"
          mode="outlined"
          style={styles.input}
          accessibilityLabel="Party size"
        />

        <TextInput
          label={t('club.birthday.contact')}
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.input}
          accessibilityLabel="Contact phone number"
        />

        {/* Celebration Type */}
        <View style={styles.section}>
          <Text
            variant="titleSmall"
            style={{ color: colors.foreground, fontWeight: '600', marginBottom: 8 }}
          >
            {t('club.birthday.celebrationType')}
          </Text>
          <SegmentedButtons
            value={celebrationType}
            onValueChange={(value) => setCelebrationType(value as CelebrationType)}
            buttons={celebrationOptions}
          />
        </View>

        <TextInput
          label={t('club.birthday.specialRequests')}
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
          numberOfLines={3}
          mode="outlined"
          style={styles.input}
          accessibilityLabel="Special requests"
        />

        {/* Submit */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitMutation.isPending}
          disabled={submitMutation.isPending}
          style={styles.submitBtn}
          contentStyle={styles.submitBtnContent}
          labelStyle={styles.submitBtnLabel}
        >
          {t('club.birthday.submit')}
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  header: {
    gap: 4,
    marginBottom: 8,
  },
  section: {
    marginTop: 4,
  },
  input: {
    // default spacing handled by gap
  },
  submitBtn: {
    borderRadius: 12,
    marginTop: 8,
  },
  submitBtnContent: {
    height: 52,
  },
  submitBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});
