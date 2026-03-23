/**
 * PaymentMethodSelector — Payment method selection + processing + confirmation
 *
 * Implements the 4-step payment flow:
 *   method -> processing -> done
 * with NFC pulse animation and method options.
 *
 * @module waiter/components/PaymentMethodSelector
 */

import React, { useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@/shared/hooks/useI18n';
import type { PaymentMethod, PaymentStep } from '../types/waiter.types';

interface PaymentMethodSelectorProps {
  step: PaymentStep;
  tableNumber: number;
  guestName: string | null;
  amount: number;
  isProcessing: boolean;
  onSelectMethod: (method: PaymentMethod) => void;
  onConfirm: () => void;
  onBack: () => void;
  onNext: () => void;
}

const METHODS: Array<{
  id: PaymentMethod;
  icon: string;
  labelKey: string;
  descKey: string;
  highlight: boolean;
}> = [
  { id: 'tap', icon: 'cellphone-nfc', labelKey: 'waiter.payment.method_tap', descKey: 'waiter.payment.method_tap_desc', highlight: true },
  { id: 'pix', icon: 'flash', labelKey: 'waiter.payment.method_pix', descKey: 'waiter.payment.method_pix_desc', highlight: false },
  { id: 'card', icon: 'credit-card', labelKey: 'waiter.payment.method_card', descKey: 'waiter.payment.method_card_desc', highlight: false },
  { id: 'cash', icon: 'cash', labelKey: 'waiter.payment.method_cash', descKey: 'waiter.payment.method_cash_desc', highlight: false },
];

export default function PaymentMethodSelector({
  step,
  tableNumber,
  guestName,
  amount,
  isProcessing,
  onSelectMethod,
  onConfirm,
  onBack,
  onNext,
}: PaymentMethodSelectorProps) {
  const colors = useColors();
  const { t } = useI18n();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for processing step
  useEffect(() => {
    if (step === 'processing') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ]),
      );
      const ring = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      ring.start();
      return () => {
        pulse.stop();
        ring.stop();
      };
    }
  }, [step, pulseAnim, ringAnim]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // Method step
        backBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginBottom: 12,
        },
        backText: {
          fontSize: 11,
          fontWeight: '600',
          color: colors.primary,
        },
        amountCard: {
          borderRadius: 16,
          backgroundColor: colors.primary + '10',
          padding: 20,
          alignItems: 'center',
          marginBottom: 16,
        },
        amountLabel: {
          fontSize: 10,
          color: colors.foregroundMuted,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        amountValue: {
          fontSize: 32,
          fontWeight: '700',
          color: colors.primary,
          marginTop: 4,
        },
        methodCard: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
          borderRadius: 12,
          borderWidth: 2,
          marginBottom: 8,
          gap: 12,
        },
        methodBody: {
          flex: 1,
        },
        methodLabel: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.foreground,
        },
        methodDesc: {
          fontSize: 10,
          color: colors.foregroundMuted,
          marginTop: 2,
        },
        recommendedBadge: {
          backgroundColor: colors.success + '15',
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
        },
        recommendedText: {
          fontSize: 8,
          fontWeight: '700',
          color: colors.success,
        },
        // Processing step
        processingContainer: {
          alignItems: 'center',
          paddingVertical: 32,
        },
        nfcContainer: {
          width: 112,
          height: 112,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        },
        nfcRingOuter: {
          position: 'absolute',
          width: 112,
          height: 112,
          borderRadius: 56,
          borderWidth: 4,
          borderColor: colors.primary + '30',
        },
        nfcRingMiddle: {
          position: 'absolute',
          width: 88,
          height: 88,
          borderRadius: 44,
          borderWidth: 4,
          borderColor: colors.primary + '40',
        },
        nfcCenter: {
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.primary + '15',
          alignItems: 'center',
          justifyContent: 'center',
        },
        processingTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.foreground,
        },
        processingSubtitle: {
          fontSize: 11,
          color: colors.foregroundMuted,
          marginTop: 4,
          textAlign: 'center',
        },
        waitingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 16,
        },
        waitingDot: {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.primary,
        },
        waitingText: {
          fontSize: 10,
          color: colors.primary,
        },
        confirmBtn: {
          width: '100%',
          paddingVertical: 14,
          borderRadius: 12,
          backgroundColor: colors.success,
          alignItems: 'center',
          marginTop: 24,
        },
        confirmBtnText: {
          fontSize: 14,
          fontWeight: '600',
          color: '#FFFFFF',
        },
        changeMethodBtn: {
          width: '100%',
          paddingVertical: 10,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          marginTop: 8,
        },
        changeMethodText: {
          fontSize: 12,
          color: colors.foregroundMuted,
        },
        // Done step
        doneContainer: {
          alignItems: 'center',
          paddingVertical: 40,
        },
        doneIcon: {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.success + '15',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        },
        doneTitle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.success,
        },
        doneMeta: {
          fontSize: 10,
          color: colors.foregroundMuted,
          marginTop: 4,
        },
        doneActions: {
          flexDirection: 'row',
          gap: 8,
          marginTop: 20,
        },
        printBtn: {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
        },
        printText: {
          fontSize: 11,
          fontWeight: '600',
          color: colors.foreground,
        },
        nextBtn: {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: colors.primary,
        },
        nextText: {
          fontSize: 11,
          fontWeight: '600',
          color: '#FFFFFF',
        },
      }),
    [colors],
  );

  // === METHOD SELECTION ===
  if (step === 'method') {
    return (
      <View>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          accessibilityLabel={t('waiter.payment.back')}
          accessibilityRole="button"
        >
          <Icon name="chevron-left" size={14} color={colors.primary} />
          <Text style={styles.backText}>{t('waiter.payment.back')}</Text>
        </TouchableOpacity>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>
            {t('waiter.payment.step_method_title', {
              table: tableNumber,
              guest: guestName || '',
            })}
          </Text>
          <Text style={styles.amountValue}>R$ {amount}</Text>
        </View>

        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.methodCard,
              {
                borderColor: m.highlight ? colors.primary : colors.border,
                backgroundColor: m.highlight ? colors.primary + '05' : colors.card,
              },
            ]}
            onPress={() => onSelectMethod(m.id)}
            accessibilityLabel={t(m.labelKey)}
            accessibilityRole="button"
          >
            <Icon
              name={m.icon}
              size={22}
              color={m.highlight ? colors.primary : colors.foregroundSecondary}
            />
            <View style={styles.methodBody}>
              <Text style={styles.methodLabel}>{t(m.labelKey)}</Text>
              <Text style={styles.methodDesc}>{t(m.descKey)}</Text>
            </View>
            {m.highlight && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>
                  {t('waiter.payment.method_tap_badge')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // === PROCESSING ===
  if (step === 'processing') {
    return (
      <View style={styles.processingContainer}>
        <View style={styles.nfcContainer}>
          <Animated.View
            style={[
              styles.nfcRingOuter,
              { opacity: ringAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.nfcRingMiddle,
              { opacity: pulseAnim },
            ]}
          />
          <View style={styles.nfcCenter}>
            <Icon name="cellphone-nfc" size={32} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.processingTitle}>
          {t('waiter.payment.processing_title')}
        </Text>
        <Text style={styles.processingSubtitle}>
          {t('waiter.payment.processing_subtitle')}
        </Text>

        <View style={styles.waitingRow}>
          <Animated.View style={[styles.waitingDot, { opacity: pulseAnim }]} />
          <Text style={styles.waitingText}>
            {t('waiter.payment.processing_waiting')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={onConfirm}
          disabled={isProcessing}
          accessibilityLabel={t('waiter.payment.processing_confirm')}
          accessibilityRole="button"
        >
          <Text style={styles.confirmBtnText}>
            {isProcessing ? t('waiter.charge.processing') : t('waiter.payment.processing_confirm')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changeMethodBtn}
          onPress={onBack}
          accessibilityLabel={t('waiter.payment.processing_change_method')}
          accessibilityRole="button"
        >
          <Text style={styles.changeMethodText}>
            {t('waiter.payment.processing_change_method')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // === DONE ===
  if (step === 'done') {
    return (
      <View style={styles.doneContainer}>
        <View style={styles.doneIcon}>
          <Icon name="check" size={28} color={colors.success} />
        </View>
        <Text style={styles.doneTitle}>
          {t('waiter.payment.done_title')}
        </Text>
        <Text style={styles.doneMeta}>
          Mesa {tableNumber} {'\u00B7'} {guestName || ''}
        </Text>
        <Text style={styles.doneMeta}>
          {t('waiter.payment.done_receipt_auto')}
        </Text>

        <View style={styles.doneActions}>
          <TouchableOpacity
            style={styles.printBtn}
            accessibilityLabel={t('waiter.payment.done_print')}
            accessibilityRole="button"
          >
            <Text style={styles.printText}>{t('waiter.payment.done_print')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={onNext}
            accessibilityLabel={t('waiter.payment.done_next')}
            accessibilityRole="button"
          >
            <Text style={styles.nextText}>
              {t('waiter.payment.done_next')} {'\u2192'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}
