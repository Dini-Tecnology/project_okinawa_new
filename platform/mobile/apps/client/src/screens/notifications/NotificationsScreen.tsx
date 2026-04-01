/**
 * NotificationsScreen - User Notifications List
 *
 * Displays all notifications grouped by time (today, this week, earlier).
 * Each notification shows icon, title, body, time ago, and unread dot.
 * Supports swipe-to-dismiss, mark all as read, and invite accept/decline.
 *
 * @module client/screens/notifications
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  IconButton,
  Button,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import ApiService from '@/shared/services/api';

// ============================================
// TYPES
// ============================================

type NotificationType = 'promo' | 'reservation' | 'invite' | 'queue' | 'loyalty' | 'order';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  data?: {
    tabId?: string;
    orderId?: string;
    reservationId?: string;
  };
}

type GroupKey = 'today' | 'thisWeek' | 'earlier';

interface GroupedSection {
  key: GroupKey;
  title: string;
  data: Notification[];
}

// ============================================
// HELPERS
// ============================================

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  promo: 'gift',
  reservation: 'clock-outline',
  invite: 'account-plus',
  queue: 'account-group',
  loyalty: 'star',
  order: 'check-circle',
};

const NOTIFICATION_COLORS = (colors: any): Record<NotificationType, string> => ({
  promo: colors.primary,
  reservation: colors.success,
  invite: colors.info,
  queue: colors.warning,
  loyalty: colors.warning,
  order: colors.success,
});

function getTimeAgo(dateStr: string, t: (key: string, params?: Record<string, string | number>) => string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return t('notifications.justNow');
  if (diffMin < 60) return t('notifications.minutesAgo', { count: diffMin });
  if (diffHr < 24) return t('notifications.hoursAgo', { count: diffHr });
  return t('notifications.daysAgo', { count: diffDay });
}

function groupNotifications(
  notifications: Notification[],
  t: (key: string) => string,
): GroupedSection[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const today: Notification[] = [];
  const thisWeek: Notification[] = [];
  const earlier: Notification[] = [];

  for (const n of notifications) {
    const date = new Date(n.created_at);
    if (date >= todayStart) {
      today.push(n);
    } else if (date >= weekStart) {
      thisWeek.push(n);
    } else {
      earlier.push(n);
    }
  }

  const sections: GroupedSection[] = [];
  if (today.length > 0) sections.push({ key: 'today', title: t('notifications.today'), data: today });
  if (thisWeek.length > 0) sections.push({ key: 'thisWeek', title: t('notifications.thisWeek'), data: thisWeek });
  if (earlier.length > 0) sections.push({ key: 'earlier', title: t('notifications.earlier'), data: earlier });
  return sections;
}

// ============================================
// SKELETON
// ============================================

function NotificationSkeleton({ colors }: { colors: any }) {
  return (
    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.backgroundTertiary }} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ width: '60%', height: 14, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
        <View style={{ width: '90%', height: 12, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
      </View>
    </View>
  );
}

// ============================================
// COMPONENT
// ============================================

export default function NotificationsScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await ApiService.get<Notification[]>('/notifications?limit=50&offset=0');
      return res.data;
    },
    refetchInterval: 30000,
  });

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => ApiService.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => ApiService.post('/notifications/mark-all-read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Accept invite
  const acceptInviteMutation = useMutation({
    mutationFn: (tabId: string) => ApiService.post(`/tabs/${tabId}/invite/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Decline invite
  const declineInviteMutation = useMutation({
    mutationFn: (tabId: string) => ApiService.post(`/tabs/${tabId}/invite/decline`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const iconColors = useMemo(() => NOTIFICATION_COLORS(colors), [colors]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  const sections = useMemo(
    () => groupNotifications(notifications, t),
    [notifications, t],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      if (!notification.is_read) {
        markReadMutation.mutate(notification.id);
      }
    },
    [markReadMutation],
  );

  const handleMarkAllRead = useCallback(() => {
    markAllReadMutation.mutate();
  }, [markAllReadMutation]);

  const handleAcceptInvite = useCallback(
    (notification: Notification) => {
      if (notification.data?.tabId) {
        acceptInviteMutation.mutate(notification.data.tabId);
      }
    },
    [acceptInviteMutation],
  );

  const handleDeclineInvite = useCallback(
    (notification: Notification) => {
      if (notification.data?.tabId) {
        declineInviteMutation.mutate(notification.data.tabId);
      }
    },
    [declineInviteMutation],
  );

  const styles = useMemo(() => createStyles(colors), [colors]);

  // ============================================
  // RENDER STATES
  // ============================================

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {t('notifications.title')}
          </Text>
        </View>
        {[1, 2, 3].map((i) => (
          <NotificationSkeleton key={i} colors={colors} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <IconButton icon="alert-circle-outline" size={64} iconColor={colors.foregroundMuted} />
        <Text variant="bodyLarge" style={styles.errorText}>
          {t('notifications.errorLoading')}
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <IconButton icon="bell-outline" size={80} iconColor={colors.foregroundMuted} />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          {t('notifications.emptyTitle')}
        </Text>
        <Text variant="bodyMedium" style={styles.emptyMessage}>
          {t('notifications.emptyMessage')}
        </Text>
      </View>
    );
  }

  // ============================================
  // FLAT DATA
  // ============================================

  type ListItem =
    | { kind: 'header'; key: string; title: string }
    | { kind: 'notification'; key: string; notification: Notification };

  const flatData: ListItem[] = [];
  for (const section of sections) {
    flatData.push({ kind: 'header', key: `header-${section.key}`, title: section.title });
    for (const n of section.data) {
      flatData.push({ kind: 'notification', key: n.id, notification: n });
    }
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.kind === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text variant="titleSmall" style={styles.sectionHeaderText}>
            {item.title}
          </Text>
        </View>
      );
    }

    const { notification } = item;
    const icon = NOTIFICATION_ICONS[notification.type] || 'bell';
    const iconColor = iconColors[notification.type] || colors.primary;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !notification.is_read && styles.notificationUnread,
        ]}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${notification.title}: ${notification.body}`}
        accessibilityState={{ selected: !notification.is_read }}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <IconButton
            icon={icon}
            size={24}
            iconColor={iconColor}
            style={styles.notificationIcon}
          />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationTopRow}>
            <Text
              variant="titleSmall"
              style={[styles.notificationTitle, !notification.is_read && styles.notificationTitleUnread]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text variant="bodySmall" style={styles.notificationTime}>
              {getTimeAgo(notification.created_at, t)}
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.notificationBody} numberOfLines={2}>
            {notification.body}
          </Text>

          {notification.type === 'invite' && !notification.is_read && (
            <View style={styles.inviteActions}>
              <Button
                mode="contained"
                compact
                onPress={() => handleAcceptInvite(notification)}
                loading={acceptInviteMutation.isPending}
                disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                style={styles.acceptButton}
                buttonColor={colors.success}
              >
                {t('notifications.accept')}
              </Button>
              <Button
                mode="outlined"
                compact
                onPress={() => handleDeclineInvite(notification)}
                loading={declineInviteMutation.isPending}
                disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                style={styles.declineButton}
                textColor={colors.error}
              >
                {t('notifications.decline')}
              </Button>
            </View>
          )}
        </View>

        {!notification.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {t('notifications.title')}
          </Text>
          {unreadCount > 0 && (
            <Text variant="bodySmall" style={styles.unreadBadge}>
              {t('notifications.unreadCount', { count: unreadCount })}
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <Button
            mode="text"
            compact
            onPress={handleMarkAllRead}
            loading={markAllReadMutation.isPending}
            textColor={colors.primary}
          >
            {t('notifications.markAllRead')}
          </Button>
        )}
      </View>

      <FlatList
        data={flatData}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="bell-outline" size={80} iconColor={colors.foregroundMuted} />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              {t('notifications.emptyTitle')}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyMessage}>
              {t('notifications.emptyMessage')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      color: colors.foreground,
      fontWeight: 'bold',
    },
    unreadBadge: {
      color: colors.primary,
      fontWeight: '600',
    },
    listContent: {
      paddingBottom: 24,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.backgroundSecondary,
    },
    sectionHeaderText: {
      color: colors.foregroundSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontSize: 12,
    },
    notificationCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.card,
    },
    notificationUnread: {
      backgroundColor: `${colors.primary}08`,
      borderLeftWidth: 3,
      borderLeftColor: `${colors.primary}40`,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    notificationIcon: {
      margin: 0,
    },
    notificationContent: {
      flex: 1,
    },
    notificationTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    notificationTitle: {
      color: colors.foreground,
      flex: 1,
      marginRight: 8,
    },
    notificationTitleUnread: {
      fontWeight: 'bold',
    },
    notificationTime: {
      color: colors.foregroundMuted,
      fontSize: 11,
    },
    notificationBody: {
      color: colors.foregroundSecondary,
      lineHeight: 18,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 6,
      marginLeft: 4,
    },
    inviteActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
    },
    acceptButton: {
      borderRadius: 8,
    },
    declineButton: {
      borderRadius: 8,
      borderColor: colors.error,
    },
    divider: {
      backgroundColor: colors.border,
    },
    // States
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: colors.background,
    },
    errorText: {
      color: colors.foregroundSecondary,
      marginTop: 12,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: 16,
      borderRadius: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: colors.background,
    },
    emptyTitle: {
      marginTop: 16,
      color: colors.foreground,
      textAlign: 'center',
    },
    emptyMessage: {
      marginTop: 8,
      color: colors.foregroundMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
  });
