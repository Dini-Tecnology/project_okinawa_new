/**
 * PromoterDashboardScreen - Promoter Performance Dashboard
 *
 * Displays promoter stats (tickets sold, revenue, capacity, avg ticket price),
 * guest list with search/filter, and FAB to add guests.
 *
 * @module restaurant/screens/club
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Card, Chip, FAB, Modal, Portal, TextInput, Button, Searchbar } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import ApiService from '@/shared/services/api';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// TYPES
// ============================================

interface PromoterStats {
  ticketsSoldTonight: number;
  revenue: number;
  capacityPercent: number;
  avgTicketPrice: number;
}

interface GuestEntry {
  id: string;
  name: string;
  ticketType: 'standard' | 'vip' | 'guestlist';
  status: 'checked_in' | 'waiting';
}

interface PromoterDashboardScreenProps {
  route?: { params?: { restaurantId: string; promoterId?: string } };
}

// ============================================
// SKELETON
// ============================================

function DashboardSkeleton({ colors }: { colors: ReturnType<typeof useColors> }) {
  const skel = (w: string, h: number) => ({ width: w as any, height: h, borderRadius: 4, backgroundColor: colors.backgroundTertiary });
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ flex: 1, minWidth: '45%' as any, backgroundColor: colors.card, borderRadius: 12, padding: 16, gap: 8 }}>
            <View style={skel('60%', 14)} /><View style={skel('40%', 24)} />
          </View>
        ))}
      </View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, gap: 8 }}>
          <View style={skel('50%', 16)} /><View style={skel('30%', 12)} />
        </View>
      ))}
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PromoterDashboardScreen({ route }: PromoterDashboardScreenProps) {
  const colors = useColors();
  const queryClient = useQueryClient();
  const restaurantId = route?.params?.restaurantId || '';
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<PromoterStats>({
    queryKey: ['promoterStats', restaurantId],
    queryFn: async () => { const res = await ApiService.get(`/clubs/promoter/stats/${restaurantId}`); return res.data; },
    enabled: !!restaurantId,
  });

  const { data: guests = [], isLoading: guestsLoading, refetch: refetchGuests } = useQuery<GuestEntry[]>({
    queryKey: ['promoterGuestList', restaurantId],
    queryFn: async () => { const res = await ApiService.get(`/clubs/promoter/guestlist/${restaurantId}`); return res.data || []; },
    enabled: !!restaurantId,
  });

  const addGuestMutation = useMutation({
    mutationFn: async (name: string) =>
      ApiService.post('/clubs/promoter/guestlist', { restaurantId, name, ticketType: 'standard' }),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['promoterGuestList', restaurantId] });
      setModalVisible(false);
      setNewGuestName('');
    },
    onError: (error: any) => Alert.alert(t('common.error'), error?.message || t('common.error')),
  });

  const isLoading = statsLoading || guestsLoading;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStats(), refetchGuests()]);
    setIsRefreshing(false);
  }, [refetchStats, refetchGuests]);

  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guests;
    const q = searchQuery.toLowerCase();
    return guests.filter((g) => g.name.toLowerCase().includes(q));
  }, [guests, searchQuery]);

  const handleAddGuest = useCallback(() => {
    const trimmed = newGuestName.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addGuestMutation.mutate(trimmed);
  }, [newGuestName, addGuestMutation]);

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  const renderGuest = useCallback(({ item }: { item: GuestEntry }) => {
    const checked = item.status === 'checked_in';
    return (
      <Card style={[styles.guestCard, { backgroundColor: colors.card }]} mode="elevated">
        <Card.Content style={styles.guestContent}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ color: colors.foreground, fontWeight: '600' }} numberOfLines={1}>
              {item.name}
            </Text>
            <Chip mode="flat" compact textStyle={{ color: colors.primaryForeground, fontSize: 10, fontWeight: '600' }} style={{ backgroundColor: colors.primary, alignSelf: 'flex-start', marginTop: 4 }}>
              {item.ticketType.toUpperCase()}
            </Chip>
          </View>
          <Chip mode="flat" compact textStyle={{ color: colors.primaryForeground, fontSize: 12 }} style={{ backgroundColor: checked ? colors.success : colors.foregroundMuted }}>
            {checked ? t('club.promoter.checkedIn') : t('club.promoter.waiting')}
          </Chip>
        </Card.Content>
      </Card>
    );
  }, [colors]);

  const renderHeader = useCallback(() => {
    if (!stats) return null;
    return (
      <View style={{ gap: 12, marginBottom: 8 }}>
        <View style={styles.statsGrid}>
          {[
            { label: t('club.promoter.ticketsSold'), value: String(stats.ticketsSoldTonight) },
            { label: t('club.promoter.revenue'), value: fmt(stats.revenue) },
            { label: t('club.promoter.capacity'), value: `${stats.capacityPercent}%` },
            { label: t('club.promoter.avgTicket'), value: fmt(stats.avgTicketPrice) },
          ].map((s) => (
            <Card key={s.label} style={[styles.statCard, { backgroundColor: colors.card }]} mode="elevated">
              <Card.Content style={{ gap: 4, paddingVertical: 12 }}>
                <Text variant="bodySmall" style={{ color: colors.foregroundMuted }}>{s.label}</Text>
                <Text variant="headlineSmall" style={{ color: colors.foreground, fontWeight: '700' }}>{s.value}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
        <Text variant="titleLarge" style={{ color: colors.foreground, fontWeight: '700', marginTop: 8 }}>
          {t('club.promoter.guestList')}
        </Text>
        <Searchbar
          placeholder={t('club.promoter.search')} value={searchQuery} onChangeText={setSearchQuery}
          style={[styles.searchBar, { backgroundColor: colors.card }]}
          inputStyle={{ color: colors.foreground }} iconColor={colors.foregroundMuted}
          placeholderTextColor={colors.foregroundMuted}
          accessibilityLabel="Search guest list"
        />
      </View>
    );
  }, [stats, colors, searchQuery]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyState}>
      <Text variant="titleMedium" style={{ color: colors.foregroundMuted, textAlign: 'center' }}>
        {t('common.noResults')}
      </Text>
    </View>
  ), [colors]);

  if (isLoading) {
    return (
      <ScreenContainer>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: colors.foreground, fontWeight: '700' }}>
            {t('club.promoter.title')}
          </Text>
        </View>
        <DashboardSkeleton colors={colors} />
      </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: colors.foreground, fontWeight: '700' }}>
          {t('club.promoter.title')}
        </Text>
      </View>
      <FlatList
        data={filteredGuests} keyExtractor={(item) => item.id} renderItem={renderGuest}
        ListHeaderComponent={renderHeader} ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        getItemLayout={(_, index) => ({
          length: 82,
          offset: 82 * index,
          index,
        })}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      />
      <FAB
        icon="plus" label={t('club.promoter.addGuest')}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setModalVisible(true); }}
        style={[styles.fab, { backgroundColor: colors.primary }]} color={colors.primaryForeground}
        accessibilityRole="button"
        accessibilityLabel="Add new guest to list"
      />
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.card }]}>
          <Text variant="titleLarge" style={{ color: colors.foreground, fontWeight: '700', marginBottom: 16 }}>
            {t('club.promoter.addGuest')}
          </Text>
          <TextInput mode="outlined" label={t('club.promoter.search')} value={newGuestName} onChangeText={setNewGuestName} autoFocus style={{ marginBottom: 16 }} accessibilityLabel="Guest name" />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.modalBtn} accessibilityRole="button" accessibilityLabel="Cancel adding guest">{t('common.cancel')}</Button>
            <Button mode="contained" onPress={handleAddGuest} loading={addGuestMutation.isPending}
              disabled={!newGuestName.trim() || addGuestMutation.isPending}
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Confirm add guest">{t('common.confirm')}</Button>
          </View>
        </Modal>
      </Portal>
    </View>
    </ScreenContainer>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: '45%', borderRadius: 12, elevation: 2 },
  searchBar: { borderRadius: 12, elevation: 0 },
  list: { padding: 16, paddingTop: 8, paddingBottom: 80, gap: 10 },
  guestCard: { borderRadius: 12, elevation: 2 },
  guestContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fab: { position: 'absolute', right: 16, bottom: 24, borderRadius: 16 },
  modal: { margin: 20, padding: 24, borderRadius: 16 },
  modalActions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  modalBtn: { borderRadius: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
});
