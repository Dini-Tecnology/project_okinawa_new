/**
 * TabPaymentScreen - Pay the Tab
 *
 * Payment screen for closing out a tab. Shows summary of all rounds,
 * split options (full/equal/custom), payment method selector,
 * tip selector, breakdown, and confirm button.
 *
 * @module client/screens/pub
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Divider,
  TextInput,
  RadioButton,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ApiService } from '@okinawa/shared/services/api';

// ============================================
// TYPES
// ============================================

interface TabPaymentScreenProps {
  route?: {
    params?: {
      tabId: string;
      restaurantId: string;
      total: number;
    };
  };
}

type SplitType = 'full' | 'equal' | 'custom';
type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash';
type TipPercent = 0 | 10 | 15 | 20 | 'custom';

interface PayTabPayload {
  method: PaymentMethod;
  tip: number;
  splitAmount: number;
}

// ============================================
// CONSTANTS
// ============================================

const PAYMENT_METHODS: { type: PaymentMethod; label: string; icon: string }[] = [
  { type: 'credit', label: 'Credit', icon: 'credit-card' },
  { type: 'debit', label: 'Debit', icon: 'card-outline' },
  { type: 'pix', label: 'PIX', icon: 'qrcode' },
  { type: 'cash', label: 'Cash', icon: 'cash' },
];

const TIP_OPTIONS: TipPercent[] = [0, 10, 15, 20, 'custom'];

// ============================================
// SKELETON
// ============================================

function PaymentSkeleton({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, height: 80 }}>
          <View style={{ width: '60%', height: 16, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ width: '40%', height: 16, borderRadius: 4, backgroundColor: colors.backgroundTertiary, marginTop: 8 }} />
        </View>
      ))}
      <View style={{ width: '100%', height: 48, borderRadius: 8, backgroundColor: colors.backgroundTertiary }} />
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TabPaymentScreen({ route }: TabPaymentScreenProps) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const tabId = route?.params?.tabId || '';
  const restaurantId = route?.params?.restaurantId || '';
  const subtotal = route?.params?.total || 0;

  const [splitType, setSplitType] = useState<SplitType>('full');
  const [splitCount, setSplitCount] = useState('2');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const [tipPercent, setTipPercent] = useState<TipPercent>(10);
  const [customTip, setCustomTip] = useState('');
  const [success, setSuccess] = useState(false);

  // Compute tip
  const tipAmount = useMemo(() => {
    if (tipPercent === 'custom') return Number(customTip) || 0;
    return subtotal * (tipPercent / 100);
  }, [subtotal, tipPercent, customTip]);

  // Compute amount to pay
  const amountToPay = useMemo(() => {
    let base = subtotal;
    if (splitType === 'equal') {
      const count = Math.max(1, parseInt(splitCount, 10) || 1);
      base = subtotal / count;
    } else if (splitType === 'custom') {
      base = Number(customAmount) || 0;
    }
    return base + tipAmount;
  }, [subtotal, splitType, splitCount, customAmount, tipAmount]);

  // Payment mutation
  const payMutation = useMutation({
    mutationFn: (payload: PayTabPayload) =>
      ApiService.post(`/tabs/${tabId}/pay`, payload),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.retry'));
    },
  });

  const handleConfirmPayment = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    payMutation.mutate({
      method: paymentMethod,
      tip: tipAmount,
      splitAmount: amountToPay,
    });
  }, [paymentMethod, tipAmount, amountToPay, payMutation]);

  // --- Success state ---
  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <Text style={{ fontSize: 64 }}>✅</Text>
          <Text variant="headlineSmall" style={{ color: colors.foreground, fontWeight: '700', marginTop: 16 }}>
            {t('tab.payment.title')}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary, marginTop: 8, textAlign: 'center' }}>
            R$ {amountToPay.toFixed(2)}
          </Text>
          <Button mode="contained" onPress={() => navigation.popToTop()} style={{ marginTop: 24 }}>
            {t('common.done')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: colors.foreground, fontWeight: '700' }}>
            {t('tab.payment.title')}
          </Text>
        </View>

        {/* Split Options */}
        <Card style={[styles.card, { backgroundColor: colors.card }]} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={{ color: colors.foreground, fontWeight: '700', marginBottom: 12 }}>
              {t('tab.payment.splitBy')}
            </Text>
            <RadioButton.Group value={splitType} onValueChange={(v) => setSplitType(v as SplitType)}>
              <TouchableOpacity style={styles.radioRow} onPress={() => setSplitType('full')}>
                <RadioButton value="full" color={colors.primary} />
                <Text variant="bodyLarge" style={{ color: colors.foreground }}>{t('tab.payment.full')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioRow} onPress={() => setSplitType('equal')}>
                <RadioButton value="equal" color={colors.primary} />
                <Text variant="bodyLarge" style={{ color: colors.foreground }}>{t('tab.payment.split')}</Text>
              </TouchableOpacity>
              {splitType === 'equal' && (
                <TextInput
                  value={splitCount}
                  onChangeText={setSplitCount}
                  keyboardType="number-pad"
                  mode="outlined"
                  label={t('tab.payment.splitBy')}
                  style={[styles.splitInput, { backgroundColor: colors.card }]}
                  dense
                />
              )}
              <TouchableOpacity style={styles.radioRow} onPress={() => setSplitType('custom')}>
                <RadioButton value="custom" color={colors.primary} />
                <Text variant="bodyLarge" style={{ color: colors.foreground }}>{t('tab.payment.custom')}</Text>
              </TouchableOpacity>
              {splitType === 'custom' && (
                <TextInput
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  label="R$"
                  style={[styles.splitInput, { backgroundColor: colors.card }]}
                  dense
                />
              )}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Payment Method */}
        <Card style={[styles.card, { backgroundColor: colors.card }]} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={{ color: colors.foreground, fontWeight: '700', marginBottom: 12 }}>
              {t('tab.payment.method')}
            </Text>
            <View style={styles.methodRow}>
              {PAYMENT_METHODS.map((pm) => (
                <Chip
                  key={pm.type}
                  selected={paymentMethod === pm.type}
                  onPress={() => setPaymentMethod(pm.type)}
                  mode={paymentMethod === pm.type ? 'flat' : 'outlined'}
                  icon={pm.icon}
                  style={styles.methodChip}
                >
                  {pm.label}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Tip Selector */}
        <Card style={[styles.card, { backgroundColor: colors.card }]} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={{ color: colors.foreground, fontWeight: '700', marginBottom: 12 }}>
              {t('tab.payment.tip')}
            </Text>
            <View style={styles.tipRow}>
              {TIP_OPTIONS.map((tp) => (
                <Chip
                  key={String(tp)}
                  selected={tipPercent === tp}
                  onPress={() => setTipPercent(tp)}
                  mode={tipPercent === tp ? 'flat' : 'outlined'}
                  style={styles.tipChip}
                >
                  {tp === 'custom' ? t('tab.payment.custom') : `${tp}%`}
                </Chip>
              ))}
            </View>
            {tipPercent === 'custom' && (
              <TextInput
                value={customTip}
                onChangeText={setCustomTip}
                keyboardType="decimal-pad"
                mode="outlined"
                label="R$"
                style={[styles.splitInput, { backgroundColor: colors.card }]}
                dense
              />
            )}
          </Card.Content>
        </Card>

        {/* Breakdown */}
        <Card style={[styles.card, { backgroundColor: colors.card }]} mode="elevated">
          <Card.Content>
            <View style={styles.breakdownRow}>
              <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>{t('tab.payment.subtotal')}</Text>
              <Text variant="bodyMedium" style={{ color: colors.foreground }}>R$ {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>{t('tab.payment.tip')}</Text>
              <Text variant="bodyMedium" style={{ color: colors.foreground }}>R$ {tipAmount.toFixed(2)}</Text>
            </View>
            <Divider style={{ marginVertical: 8 }} />
            <View style={styles.breakdownRow}>
              <Text variant="titleMedium" style={{ color: colors.foreground, fontWeight: '700' }}>{t('tab.payment.total')}</Text>
              <Text variant="titleLarge" style={{ color: colors.primary, fontWeight: '700' }}>
                R$ {amountToPay.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Confirm Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button
          mode="contained"
          onPress={handleConfirmPayment}
          loading={payMutation.isPending}
          disabled={payMutation.isPending}
          icon="cash-register"
          style={{ paddingVertical: 4 }}
        >
          {t('tab.payment.confirm')}
        </Button>
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  header: { marginBottom: 16 },
  card: { borderRadius: 12, marginBottom: 16, elevation: 2 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  splitInput: { marginLeft: 40, marginTop: 4, marginBottom: 8 },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  methodChip: { marginBottom: 4 },
  tipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipChip: { marginBottom: 4 },
  breakdownRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4,
  },
  successContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 28,
  },
});
