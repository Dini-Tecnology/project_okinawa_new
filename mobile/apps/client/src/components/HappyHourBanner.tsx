import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors, useOkinawaTheme } from '@okinawa/shared/contexts/ThemeContext';
import { spacing, borderRadius } from '@okinawa/shared/theme/spacing';
import { typography } from '@okinawa/shared/theme/typography';
import { colorPalette, gradients } from '@okinawa/shared/theme/colors';

interface HappyHourConfig {
  hoursFrom: string; // e.g. "17:00"
  hoursUntil: string; // e.g. "19:00"
  discount: number; // percentage, e.g. 20
}

interface HappyHourBannerProps {
  config: HappyHourConfig;
  onDismiss?: () => void;
}

/**
 * HappyHourBanner
 *
 * Reusable banner component that shows "HAPPY HOUR" promotion when the
 * current time is within the happy hour window. Displays a countdown
 * timer, the discount percentage, and a dismiss button.
 * Used by cafe-bakery and pub-bar service types.
 */
export default function HappyHourBanner({ config, onDismiss }: HappyHourBannerProps) {
  const { t } = useI18n();
  const colors = useColors();

  const [isDismissed, setIsDismissed] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [isActive, setIsActive] = useState(false);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  const parseTime = useCallback((timeStr: string): { hours: number; minutes: number } => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  }, []);

  const checkIsWithinWindow = useCallback((): boolean => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const from = parseTime(config.hoursFrom);
    const until = parseTime(config.hoursUntil);
    const fromMinutes = from.hours * 60 + from.minutes;
    const untilMinutes = until.hours * 60 + until.minutes;

    return currentMinutes >= fromMinutes && currentMinutes < untilMinutes;
  }, [config.hoursFrom, config.hoursUntil, parseTime]);

  const getCountdown = useCallback((): string => {
    const now = new Date();
    const until = parseTime(config.hoursUntil);

    const endTime = new Date();
    endTime.setHours(until.hours, until.minutes, 0, 0);

    const diff = endTime.getTime() - now.getTime();
    if (diff <= 0) return '00:00';

    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, '0')}min`;
    }
    return `${minutes}min`;
  }, [config.hoursUntil, parseTime]);

  // Check active status and update countdown every 30 seconds
  useEffect(() => {
    const update = () => {
      const active = checkIsWithinWindow();
      setIsActive(active);
      if (active) {
        setCountdown(getCountdown());
      }
    };

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [checkIsWithinWindow, getCountdown]);

  // Pulse animation for the countdown
  useEffect(() => {
    if (!isActive) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [isActive, pulseAnim]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  // Do not render if not active or dismissed
  if (!isActive || isDismissed) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colorPalette.accent[600] }]}>
      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={[typography.labelLarge, styles.title, { color: colorPalette.neutral[0] }]}>
            {t('happyHour.title')}
          </Text>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={[typography.bodyMedium, { color: colorPalette.neutral[0], opacity: 0.9 }]}>
              {t('happyHour.until', { time: config.hoursUntil })} {' '}
              {t('happyHour.discount', { value: String(config.discount) })}
            </Text>
          </Animated.View>
          <Text style={[typography.labelSmall, { color: colorPalette.neutral[0], opacity: 0.7 }]}>
            {countdown}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[typography.labelMedium, { color: colorPalette.neutral[0], opacity: 0.8 }]}>
            X
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.screenHorizontal,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  textContent: {
    flex: 1,
    gap: spacing[0.5],
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[2],
  },
});
