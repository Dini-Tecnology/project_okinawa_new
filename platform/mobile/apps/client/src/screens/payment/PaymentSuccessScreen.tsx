import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Share,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { useI18n } from '@/shared/hooks/useI18n';
import { useScreenTracking } from '@/shared/hooks/useAnalytics';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import type { RootStackParamList, PaymentSuccessParams } from '../../types';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AUTO_NAVIGATE_SECONDS = 8;

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: 'PIX',
  credit: 'Credit Card',
  apple: 'Apple Pay',
  google: 'Google Pay',
  tap: 'TAP to Pay',
  wallet: 'Wallet',
  saved_card: 'Credit Card',
  credit_card: 'Credit Card',
};

export default function PaymentSuccessScreen() {
  useScreenTracking('PaymentSuccess');

  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();
  const { t } = useI18n();

  const params = route.params as PaymentSuccessParams;
  const {
    orderId,
    amountPaid,
    paymentMethod,
    pointsEarned,
    badge,
    receiptId,
  } = params;

  const [countdown, setCountdown] = useState(AUTO_NAVIGATE_SECONDS);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Haptic success feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animated entrance for checkmark
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 10,
      stiffness: 100,
      useNativeDriver: true,
    }).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Badge animation with delay
    if (badge) {
      Animated.timing(badgeAnim, {
        toValue: 1,
        duration: 500,
        delay: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [scaleAnim, fadeAnim, badgeAnim, badge]);

  // Auto-navigate countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGoHome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGoHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' as never }],
    });
  }, [navigation]);

  const handleViewReceipt = useCallback(() => {
    navigation.navigate('DigitalReceipt', {
      orderId,
      transactionId: receiptId,
    });
  }, [navigation, orderId, receiptId]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${t('paymentSuccess.title')}\n${t('paymentSuccess.subtitle', { amount: amountPaid.toFixed(2) })}\n\nNOOWE`,
        title: t('paymentSuccess.title'),
      });
    } catch {
      // User cancelled
    }
  }, [t, amountPaid]);

  const formatCurrency = useCallback((value: number) => `R$ ${value.toFixed(2)}`, []);

  const formattedDateTime = useMemo(() => {
    const now = new Date();
    return `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, []);

  const methodDisplayName = useMemo(
    () => PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod,
    [paymentMethod],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.backgroundSecondary,
        },
        scrollContent: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        },
        checkContainer: {
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.success + '15',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
        },
        title: {
          color: colors.foreground,
          textAlign: 'center',
          marginBottom: 8,
        },
        subtitle: {
          color: colors.foregroundSecondary,
          textAlign: 'center',
          marginBottom: 24,
        },
        summaryCard: {
          width: '100%',
          backgroundColor: colors.card,
          borderRadius: 12,
          marginBottom: 16,
        },
        summaryRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
        },
        summaryLabel: {
          color: colors.foregroundSecondary,
        },
        summaryValue: {
          color: colors.foreground,
          fontWeight: '600',
        },
        loyaltyCard: {
          width: '100%',
          backgroundColor: colors.card,
          borderRadius: 12,
          marginBottom: 16,
        },
        loyaltyContent: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        loyaltyIconBg: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.primary + '15',
          justifyContent: 'center',
          alignItems: 'center',
        },
        loyaltyTextContainer: {
          flex: 1,
        },
        loyaltyTitle: {
          color: colors.primary,
          fontWeight: 'bold',
        },
        loyaltyDesc: {
          color: colors.foregroundSecondary,
        },
        badgeCard: {
          width: '100%',
          backgroundColor: colors.accent + '10',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.accent + '30',
          marginBottom: 16,
        },
        badgeContent: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        badgeIconBg: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.accent + '20',
          justifyContent: 'center',
          alignItems: 'center',
        },
        badgeLabel: {
          color: colors.foregroundSecondary,
          fontSize: 11,
        },
        badgeText: {
          color: colors.accent,
          fontWeight: 'bold',
        },
        actionsContainer: {
          width: '100%',
          gap: 10,
          marginTop: 8,
        },
        primaryButton: {
          backgroundColor: colors.primary,
          borderRadius: 24,
        },
        primaryButtonLabel: {
          paddingVertical: 2,
        },
        secondaryButton: {
          borderRadius: 24,
        },
        outlineButton: {
          borderRadius: 24,
          borderColor: colors.border,
        },
        countdownText: {
          textAlign: 'center',
          color: colors.foregroundMuted,
          marginTop: 16,
          fontSize: 12,
        },
      }),
    [colors],
  );

  return (
    <ScreenContainer>
    <View style={styles.container}>
      <View style={styles.scrollContent}>
        {/* Animated Checkmark */}
        <Animated.View
          style={[
            styles.checkContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <IconButton
            icon="check-circle"
            size={60}
            iconColor={colors.success}
            style={{ margin: 0 }}
          />
        </Animated.View>

        {/* Title & Subtitle */}
        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
          <Text variant="headlineMedium" style={styles.title}>
            {t('paymentSuccess.title')}
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {t('paymentSuccess.subtitle', { amount: amountPaid.toFixed(2) })}
          </Text>

          {/* Payment Summary Card */}
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  {t('paymentSuccess.summaryMethod')}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryValue}>
                  {methodDisplayName}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  {t('paymentSuccess.summaryAmount')}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryValue}>
                  {formatCurrency(amountPaid)}
                </Text>
              </View>
              <View style={[styles.summaryRow, { marginBottom: 0 }]}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  {t('paymentSuccess.summaryDatetime')}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryValue}>
                  {formattedDateTime}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Loyalty Points Card */}
          {pointsEarned > 0 && (
            <Card style={styles.loyaltyCard}>
              <Card.Content style={styles.loyaltyContent}>
                <View style={styles.loyaltyIconBg}>
                  <IconButton
                    icon="star"
                    size={24}
                    iconColor={colors.primary}
                    style={{ margin: 0 }}
                  />
                </View>
                <View style={styles.loyaltyTextContainer}>
                  <Text variant="titleSmall" style={styles.loyaltyTitle}>
                    {t('paymentSuccess.loyaltyTitle', { points: String(pointsEarned) })}
                  </Text>
                  <Text variant="bodySmall" style={styles.loyaltyDesc}>
                    {t('paymentSuccess.loyaltyDesc')}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Badge Achievement Card */}
          {badge && (
            <Animated.View style={{ opacity: badgeAnim, width: '100%' }}>
              <Card style={styles.badgeCard}>
                <Card.Content style={styles.badgeContent}>
                  <View style={styles.badgeIconBg}>
                    <IconButton
                      icon="trophy"
                      size={24}
                      iconColor={colors.accent}
                      style={{ margin: 0 }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.badgeLabel}>
                      {t('paymentSuccess.badgePrefix')}
                    </Text>
                    <Text variant="titleSmall" style={styles.badgeText}>
                      {badge.text}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={handleViewReceipt}
              style={styles.primaryButton}
              labelStyle={styles.primaryButtonLabel}
              icon="receipt"
            >
              {t('paymentSuccess.actionReceipt')}
            </Button>

            <Button
              mode="text"
              onPress={handleGoHome}
              style={styles.secondaryButton}
              icon="home"
            >
              {t('paymentSuccess.actionHome')}
            </Button>

            <Button
              mode="outlined"
              onPress={handleShare}
              style={styles.outlineButton}
              icon="share-variant"
            >
              {t('paymentSuccess.actionShare')}
            </Button>
          </View>

          {/* Countdown */}
          <Text style={styles.countdownText}>
            {t('paymentSuccess.countdown', { seconds: String(countdown) })}
          </Text>
        </Animated.View>
      </View>
    </View>
  
    </ScreenContainer>
  );
}
