/**
 * TabScreen - Customer Open Tab View
 *
 * Displays the customer's open tab for pub/bar service.
 * Shows table number, status chip, time since opened, total amount,
 * and a FlatList of rounds. Subscribes to Socket.IO for real-time updates.
 *
 * @module client/screens/pub
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Badge,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { gradients } from '@okinawa/shared/theme/colors';
import { ApiService } from '@okinawa/shared/services/api';

// ============================================
// TYPES
// ============================================

interface TabScreenProps {
  route?: {
    params?: {
      restaurantId: string;
      tableNumber: string;
      tabId?: string;
    };
  };
}

interface TabRoundItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface TabRound {
  id: string;
  roundNumber: number;
  time: string;
  items: TabRoundItem[];
  subtotal: number;
}

interface TabData {
  id: string;
  restaurantId: string;
  tableNumber: string;
  status: 'open' | 'pending_payment' | 'closed';
  openedAt: string;
  total: number;
  rounds: TabRound[];
}

// ============================================
// SKELETON
// ============================================

function TabSkeleton({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 16, gap: 8 }}>
        <View style={{ width: 120, height: 20, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
        <View style={{ width: 80, height: 16, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
        <View style={{ width: 160, height: 32, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
      </View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ backgroundColor: colors.card, borderRadius: 20, padding: 16, gap: 8, height: 120 }}>
          <View style={{ width: '50%', height: 16, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ width: '70%', height: 14, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ width: '40%', height: 14, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
        </View>
      ))}
    </View>
  );
}

// ============================================
// ROUND CARD
// ============================================

function RoundCard({ round, colors }: { round: TabRound; colors: ReturnType<typeof useColors> }) {
  return (
    <Card style={{ borderRadius: 20, elevation: 2, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }} mode="elevated">
      <Card.Content>
        <View style={styles.roundHeader}>
          <Text variant="titleSmall" style={{ color: colors.foreground, fontWeight: '700' }}>
            {t('tab.round')} {round.roundNumber} - {round.time}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.primary, fontWeight: '600' }}>
            R$ {round.subtotal.toFixed(2)}
          </Text>
        </View>
        {round.items.map((item) => (
          <View key={item.id} style={[styles.itemRow, { borderTopColor: colors.border }]}>
            <Text variant="bodyMedium" style={{ color: colors.foreground, flex: 1 }}>
              {item.quantity}x {item.name}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.foregroundSecondary, marginRight: 8 }}>
              R$ {item.unitPrice.toFixed(2)}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.foreground, fontWeight: '600' }}>
              R$ {item.subtotal.toFixed(2)}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TabScreen({ route }: TabScreenProps) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const restaurantId = route?.params?.restaurantId || '';
  const tableNumber = route?.params?.tableNumber || '';
  const tabId = route?.params?.tabId || '';

  const endpoint = tabId
    ? `/tabs/${tabId}`
    : `/tabs/active?restaurantId=${restaurantId}&tableNumber=${tableNumber}`;

  const {
    data: tab,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<TabData>({
    queryKey: ['tab', tabId || `${restaurantId}-${tableNumber}`],
    queryFn: async () => {
      const response = await ApiService.get(endpoint);
      return response.data || response;
    },
    enabled: !!(tabId || (restaurantId && tableNumber)),
  });

  // Format opened-at time
  const openedAtFormatted = useMemo(() => {
    if (!tab?.openedAt) return '';
    try {
      return new Date(tab.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, [tab?.openedAt]);

  const statusChipColor = useMemo(() => {
    if (!tab) return colors.foregroundMuted;
    switch (tab.status) {
      case 'open': return colors.success;
      case 'pending_payment': return colors.warning;
      case 'closed': return colors.foregroundMuted;
      default: return colors.foregroundMuted;
    }
  }, [tab, colors]);

  const statusBgColor = useMemo(() => {
    if (!tab) return colors.backgroundTertiary;
    switch (tab.status) {
      case 'open': return colors.successBackground;
      case 'pending_payment': return colors.warningBackground;
      case 'closed': return colors.backgroundTertiary;
      default: return colors.backgroundTertiary;
    }
  }, [tab, colors]);

  const statusLabel = useMemo(() => {
    if (!tab) return '';
    switch (tab.status) {
      case 'open': return t('tab.status.open');
      case 'pending_payment': return t('tab.status.pending');
      case 'closed': return t('tab.status.closed');
      default: return tab.status;
    }
  }, [tab]);

  const handleAddRound = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('RoundBuilder', {
      tabId: tab?.id || tabId,
      restaurantId: tab?.restaurantId || restaurantId,
    });
  }, [navigation, tab, tabId, restaurantId]);

  const handlePayTab = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('TabPayment', {
      tabId: tab?.id || tabId,
      restaurantId: tab?.restaurantId || restaurantId,
      total: tab?.total || 0,
    });
  }, [navigation, tab, tabId, restaurantId]);

  const renderRound = useCallback(
    ({ item }: { item: TabRound }) => <RoundCard round={item} colors={colors} />,
    [colors],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: `${colors.primary}1A`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}>
          <IconButton icon="glass-mug-variant" size={32} iconColor={colors.primary} style={{ margin: 0 }} />
        </View>
        <Text variant="titleMedium" style={{ color: colors.foregroundMuted, textAlign: 'center' }}>
          {t('tab.empty')}
        </Text>
        <Pressable
          onPress={handleAddRound}
          style={({ pressed }) => [{
            marginTop: 16,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }]}
        >
          <LinearGradient
            colors={gradients.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <IconButton icon="plus" size={18} iconColor={colors.primaryForeground} style={{ margin: 0 }} />
            <Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 14 }}>
              {t('tab.addRound')}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    ),
    [colors, handleAddRound],
  );

  // --- Loading ---
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TabSkeleton colors={colors} />
      </View>
    );
  }

  // --- Error ---
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorState}>
          <Text variant="bodyLarge" style={{ color: colors.error, textAlign: 'center' }}>
            {t('common.error')}
          </Text>
          <Button mode="contained" onPress={() => refetch()} style={{ marginTop: 16, borderRadius: 16 }}>
            {t('common.retry')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Table number in rounded icon container */}
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: `${colors.primary}1A`,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontWeight: '700', fontSize: 16, color: colors.primary }}>
                {tab?.tableNumber || tableNumber}
              </Text>
            </View>
            <Text variant="titleLarge" style={{ color: colors.foreground, fontWeight: '700' }}>
              {t('tab.title')}
            </Text>
          </View>
          {/* Status badge: pill style with bg-color/10 pattern */}
          <View style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
            backgroundColor: statusBgColor,
          }}>
            <Text style={{ color: statusChipColor, fontSize: 11, fontWeight: '600' }}>
              {statusLabel}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
            {t('tab.table')}: {tab?.tableNumber || tableNumber}
          </Text>
          {openedAtFormatted ? (
            <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
              {t('tab.opened')} {openedAtFormatted}
            </Text>
          ) : null}
        </View>
        <Text variant="headlineMedium" style={{ color: colors.primary, fontWeight: '700', marginTop: 8 }}>
          R$ {(tab?.total || 0).toFixed(2)}
        </Text>
      </View>

      {/* Rounds List */}
      <FlatList
        data={tab?.rounds || []}
        keyExtractor={(item) => item.id}
        renderItem={renderRound}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.bottomTotal}>
          <Text variant="bodyLarge" style={{ color: colors.foregroundSecondary }}>{t('tab.total')}</Text>
          <Text variant="titleLarge" style={{ color: colors.primary, fontWeight: '700' }}>
            R$ {(tab?.total || 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.bottomButtons}>
          <Button mode="contained" onPress={handleAddRound} style={{ flex: 1, borderRadius: 16 }} icon="plus-circle">
            {t('tab.addRound')}
          </Button>
          {/* Pay Tab: gradient button */}
          <Pressable
            onPress={handlePayTab}
            style={({ pressed }) => [{
              flex: 1,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            }]}
          >
            <LinearGradient
              colors={gradients.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 16,
                flexDirection: 'row',
                gap: 6,
              }}
            >
              <IconButton icon="cash-register" size={18} iconColor={colors.primaryForeground} style={{ margin: 0 }} />
              <Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 14 }}>
                {t('tab.pay')}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row', gap: 16, marginTop: 8,
  },
  list: { padding: 16, paddingBottom: 120, gap: 12 },
  roundHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  emptyState: {
    alignItems: 'center', justifyContent: 'center', paddingTop: 80,
  },
  errorState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 28,
  },
  bottomTotal: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  bottomButtons: { flexDirection: 'row', gap: 12 },
});
