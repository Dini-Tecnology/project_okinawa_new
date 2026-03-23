/**
 * LiveEventCard — Individual event card for the live feed
 *
 * Displays a single event with urgency-driven styling,
 * icon, table number, time, description and optional action button.
 *
 * @module waiter/components/LiveEventCard
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
import type { LiveFeedEvent, LiveEventType } from '../types/waiter.types';

interface LiveEventCardProps {
  event: LiveFeedEvent;
  onAction?: () => void;
  onDismiss?: () => void;
}

interface EventConfig {
  icon: string;
  colorKey: string;
  actionKey: string | null;
}

const EVENT_CONFIG: Record<LiveEventType, EventConfig> = {
  kitchen_ready: { icon: 'chef-hat', colorKey: 'error', actionKey: 'waiter.live.action_pickup' },
  call: { icon: 'bell-ring', colorKey: 'warning', actionKey: 'waiter.live.action_attend' },
  payment: { icon: 'check-circle', colorKey: 'success', actionKey: null },
  payment_needed: { icon: 'cellphone', colorKey: 'primary', actionKey: 'waiter.live.action_charge' },
  approval: { icon: 'shield-check', colorKey: 'info', actionKey: 'waiter.live.action_request' },
  order: { icon: 'book-open-variant', colorKey: 'foregroundMuted', actionKey: null },
  alert: { icon: 'alert-circle', colorKey: 'error', actionKey: null },
};

function LiveEventCard({ event, onAction, onDismiss }: LiveEventCardProps) {
  const colors = useColors();
  const { t } = useI18n();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const config = EVENT_CONFIG[event.type];

  // Pulse animation for critical events
  useEffect(() => {
    if (event.urgency === 'critical') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [event.urgency, pulseAnim]);

  const eventColor = (colors as any)[config.colorKey] || colors.foregroundMuted;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: 12,
          borderWidth: event.urgency === 'critical' ? 2 : 1,
          borderColor:
            event.urgency === 'critical'
              ? colors.error + '50'
              : event.urgency === 'high'
                ? eventColor + '40'
                : colors.border,
          backgroundColor: colors.card,
          overflow: 'hidden',
        },
        content: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: 12,
          gap: 10,
        },
        iconContainer: {
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: eventColor + '15',
          alignItems: 'center',
          justifyContent: 'center',
        },
        body: {
          flex: 1,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        tableBadge: {
          backgroundColor: colors.primary + '15',
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
        },
        tableBadgeText: {
          fontSize: 9,
          fontWeight: '700',
          color: colors.primary,
        },
        timeText: {
          fontSize: 9,
          color: colors.foregroundMuted,
        },
        nowBadge: {
          backgroundColor: colors.error + '15',
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
        },
        nowBadgeText: {
          fontSize: 7,
          fontWeight: '700',
          color: colors.error,
        },
        eventTitle: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.foreground,
          marginTop: 2,
        },
        eventDetail: {
          fontSize: 10,
          color: colors.foregroundSecondary,
          marginTop: 1,
        },
        actionButton: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingVertical: 10,
          alignItems: 'center',
          backgroundColor:
            event.urgency === 'critical'
              ? colors.error
              : event.urgency === 'high'
                ? eventColor + '10'
                : colors.backgroundSecondary,
        },
        actionText: {
          fontSize: 11,
          fontWeight: '700',
          color:
            event.urgency === 'critical'
              ? '#FFFFFF'
              : eventColor,
        },
      }),
    [colors, event.urgency, eventColor],
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[styles.iconContainer, { opacity: pulseAnim }]}
        >
          <Icon name={config.icon} size={18} color={eventColor} />
        </Animated.View>
        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={styles.tableBadge}>
              <Text style={styles.tableBadgeText}>M{event.table}</Text>
            </View>
            <Text style={styles.timeText}>{event.time}</Text>
            {event.urgency === 'critical' && (
              <View style={styles.nowBadge}>
                <Text style={styles.nowBadgeText}>
                  {t('waiter.live.badge_now')}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.eventTitle}>{event.event}</Text>
          <Text style={styles.eventDetail}>{event.detail}</Text>
        </View>
      </View>
      {config.actionKey && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          accessibilityLabel={t(config.actionKey)}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>
            {t(config.actionKey)} {'\u2192'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default React.memo(LiveEventCard);
