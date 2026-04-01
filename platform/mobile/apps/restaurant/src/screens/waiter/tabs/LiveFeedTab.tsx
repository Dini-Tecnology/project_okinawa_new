/**
 * LiveFeedTab — "Ao Vivo" tab
 *
 * Real-time event feed powered by WebSocket.
 * Shows urgency banner when dishes are ready,
 * chronological event cards with dismiss actions,
 * and empty state when all clear.
 *
 * @module waiter/tabs/LiveFeedTab
 */

import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@/shared/hooks/useI18n';
import LiveEventCard from '../components/LiveEventCard';
import type { LiveFeedEvent, WaiterTab } from '../types/waiter.types';

interface LiveFeedTabProps {
  activeFeed: LiveFeedEvent[];
  readyDishCount: number;
  reconnecting: boolean;
  onDismissEvent: (eventId: string) => void;
  onNavigateTab: (tab: WaiterTab) => void;
  onEventAction: (event: LiveFeedEvent) => void;
}

export default function LiveFeedTab({
  activeFeed,
  readyDishCount,
  reconnecting,
  onDismissEvent,
  onNavigateTab,
  onEventAction,
}: LiveFeedTabProps) {
  const colors = useColors();
  const { t } = useI18n();
  const bannerAnim = useRef(new Animated.Value(readyDishCount > 0 ? 0 : -80)).current;

  // Animate banner slide
  useEffect(() => {
    Animated.timing(bannerAnim, {
      toValue: readyDishCount > 0 ? 0 : -80,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [readyDishCount, bannerAnim]);

  const handleEventAction = (event: LiveFeedEvent) => {
    onDismissEvent(event.id);
    onEventAction(event);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        urgencyBanner: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: colors.error + '12',
          borderWidth: 1,
          borderColor: colors.error + '30',
          marginHorizontal: 12,
          marginTop: 12,
        },
        urgencyIconContainer: {
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: colors.error + '20',
          alignItems: 'center',
          justifyContent: 'center',
        },
        urgencyTextContainer: {
          flex: 1,
        },
        urgencyTitle: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.error,
        },
        urgencySubtitle: {
          fontSize: 10,
          color: colors.error + 'AA',
          marginTop: 1,
        },
        urgencyButton: {
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 8,
          backgroundColor: colors.error,
        },
        urgencyButtonText: {
          fontSize: 10,
          fontWeight: '700',
          color: colors.primaryForeground,
        },
        reconnectBanner: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: colors.warning + '15',
          marginHorizontal: 12,
          marginTop: 8,
          borderRadius: 8,
        },
        reconnectText: {
          fontSize: 10,
          color: colors.warning,
          fontWeight: '500',
        },
        listContent: {
          padding: 12,
          gap: 8,
        },
        emptyContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 80,
        },
        emptyIcon: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.success + '15',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        },
        emptyTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.success,
        },
        emptySubtitle: {
          fontSize: 12,
          color: colors.foregroundMuted,
          marginTop: 4,
        },
        // Skeleton
        skeletonCard: {
          borderRadius: 12,
          backgroundColor: colors.backgroundTertiary,
          height: 80,
          marginBottom: 8,
        },
      }),
    [colors],
  );

  const renderItem = ({ item }: { item: LiveFeedEvent }) => (
    <LiveEventCard
      event={item}
      onAction={() => handleEventAction(item)}
      onDismiss={() => onDismissEvent(item.id)}
    />
  );

  const keyExtractor = (item: LiveFeedEvent) => item.id;

  const ListHeader = () => (
    <View>
      {/* Urgency banner */}
      {readyDishCount > 0 && (
        <Animated.View
          style={[styles.urgencyBanner, { transform: [{ translateY: bannerAnim }] }]}
        >
          <View style={styles.urgencyIconContainer}>
            <Icon name="chef-hat" size={18} color={colors.error} />
          </View>
          <View style={styles.urgencyTextContainer}>
            <Text style={styles.urgencyTitle}>
              {t('waiter.live.urgent_banner_title', { count: readyDishCount })}
            </Text>
            <Text style={styles.urgencySubtitle}>
              {t('waiter.live.urgent_banner_subtitle')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.urgencyButton}
            onPress={() => onNavigateTab('kitchen')}
            accessibilityLabel={t('waiter.live.urgent_banner_cta')}
            accessibilityRole="button"
          >
            <Text style={styles.urgencyButtonText}>
              {t('waiter.live.urgent_banner_cta')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Reconnection banner */}
      {reconnecting && (
        <View style={styles.reconnectBanner}>
          <Icon name="wifi-off" size={14} color={colors.warning} />
          <Text style={styles.reconnectText}>
            {t('waiter.live.reconnecting')}
          </Text>
        </View>
      )}
    </View>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Icon name="check-circle" size={24} color={colors.success} />
      </View>
      <Text style={styles.emptyTitle}>{t('waiter.live.empty_title')}</Text>
      <Text style={styles.emptySubtitle}>
        {t('waiter.live.empty_subtitle')}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={activeFeed}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={EmptyComponent}
      showsVerticalScrollIndicator={false}
    />
  );
}
