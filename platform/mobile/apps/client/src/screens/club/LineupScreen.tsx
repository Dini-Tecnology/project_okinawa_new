/**
 * LineupScreen - Event Lineup / Artist Schedule
 *
 * Displays a timeline of artists performing at the event
 * with name, genre, time slot, stage, and a "now playing" indicator.
 *
 * @module client/screens/club
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ApiService } from '@okinawa/shared/services/api';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// TYPES
// ============================================

interface LineupSlot {
  id: string;
  artistName: string;
  genre: string;
  startTime: string;
  endTime: string;
  stage: string;
  avatarUrl?: string;
  isNowPlaying?: boolean;
}

interface LineupData {
  id: string;
  eventName: string;
  eventDate: string;
  slots: LineupSlot[];
}

interface LineupScreenProps {
  route?: {
    params?: {
      restaurantId: string;
      eventDate: string;
      eventName: string;
    };
  };
}

// ============================================
// SKELETON
// ============================================

function LineupSkeleton({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            gap: 12,
            padding: 16,
            backgroundColor: colors.card,
            borderRadius: 12,
          }}
        >
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ width: '60%', height: 16, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
            <View style={{ width: '40%', height: 12, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
            <View style={{ width: '30%', height: 12, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================
// SLOT CARD COMPONENT
// ============================================

function SlotCard({
  slot,
  colors,
  isFirst,
}: {
  slot: LineupSlot;
  colors: ReturnType<typeof useColors>;
  isFirst: boolean;
}) {
  const startTime = new Date(slot.startTime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(slot.endTime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.slotWrapper}>
      {/* Timeline connector */}
      <View style={styles.timelineColumn}>
        <View
          style={[
            styles.timelineDot,
            {
              backgroundColor: slot.isNowPlaying ? colors.primary : colors.foregroundMuted,
              width: slot.isNowPlaying ? 14 : 10,
              height: slot.isNowPlaying ? 14 : 10,
              borderRadius: slot.isNowPlaying ? 7 : 5,
            },
          ]}
        />
        <View
          style={[
            styles.timelineLine,
            { backgroundColor: colors.border },
          ]}
        />
      </View>

      {/* Card */}
      <Card
        style={[
          styles.slotCard,
          {
            backgroundColor: slot.isNowPlaying ? colors.primary + '15' : colors.card,
            borderColor: slot.isNowPlaying ? colors.primary : 'transparent',
            borderWidth: slot.isNowPlaying ? 1 : 0,
          },
        ]}
        mode="elevated"
      >
        <Card.Content style={styles.slotContent}>
          <View style={styles.slotHeader}>
            {/* Avatar Placeholder */}
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.backgroundTertiary },
              ]}
            >
              <Text style={{ fontSize: 24 }}>🎧</Text>
            </View>

            <View style={{ flex: 1 }}>
              {/* Now Playing Badge */}
              {slot.isNowPlaying && (
                <Chip
                  mode="flat"
                  textStyle={{ color: '#fff', fontSize: 10, fontWeight: '700' }}
                  style={[styles.nowPlayingChip, { backgroundColor: colors.primary }]}
                  compact
                >
                  {t('club.lineupSection.nowPlaying')}
                </Chip>
              )}

              <Text
                variant="titleMedium"
                style={{ color: colors.foreground, fontWeight: '700' }}
                numberOfLines={1}
              >
                {slot.artistName}
              </Text>

              <View style={styles.slotMeta}>
                <Chip
                  mode="outlined"
                  compact
                  textStyle={{ fontSize: 11 }}
                  style={styles.genreChip}
                >
                  {slot.genre}
                </Chip>
                <Text
                  variant="bodySmall"
                  style={{ color: colors.foregroundMuted }}
                >
                  {t('club.lineupSection.stage')}: {slot.stage}
                </Text>
              </View>
            </View>
          </View>

          {/* Time Slot */}
          <View style={styles.timeSlotRow}>
            <Text
              variant="bodyMedium"
              style={{ color: colors.foregroundSecondary, fontWeight: '600' }}
            >
              {startTime} - {endTime}
            </Text>
            <Button
              mode="text"
              compact
              labelStyle={{ fontSize: 11 }}
              onPress={() => {
                // Calendar integration placeholder
              }}
            >
              {t('club.lineupSection.addToCalendar')}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function LineupScreen({ route }: LineupScreenProps) {
  const colors = useColors();
  const navigation = useNavigation<any>();

  const restaurantId = route?.params?.restaurantId || '';
  const eventDate = route?.params?.eventDate || '';
  const eventName = route?.params?.eventName || '';

  const {
    data: lineup,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<LineupData>({
    queryKey: ['club-lineup', restaurantId, eventDate],
    queryFn: async () => {
      const dateStr = new Date(eventDate).toISOString().split('T')[0];
      const response = await ApiService.get(
        `/lineup/restaurant/${restaurantId}/date/${dateStr}`,
      );
      return response.data;
    },
    enabled: !!restaurantId && !!eventDate,
  });

  // Check what's currently playing
  const slots = useMemo(() => {
    if (!lineup?.slots) return [];
    const now = new Date();
    return lineup.slots.map((slot) => ({
      ...slot,
      isNowPlaying:
        new Date(slot.startTime) <= now && new Date(slot.endTime) > now,
    }));
  }, [lineup?.slots]);

  const renderSlot = useCallback(
    ({ item, index }: { item: LineupSlot; index: number }) => (
      <SlotCard
        slot={item}
        colors={colors}
        isFirst={index === 0}
      />
    ),
    [colors],
  );

  if (isLoading) {
    return (
      <ScreenContainer>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text
            variant="headlineMedium"
            style={{ color: colors.foreground, fontWeight: '700' }}
          >
            {t('club.lineup')}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
            {eventName}
          </Text>
        </View>
        <LineupSkeleton colors={colors} />
      </View>
    
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text
          variant="headlineMedium"
          style={{ color: colors.foreground, fontWeight: '700' }}
        >
          {t('club.lineup')}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
          {eventName}
        </Text>
      </View>

      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={renderSlot}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🎵</Text>
            <Text
              variant="bodyLarge"
              style={{ color: colors.foregroundMuted, textAlign: 'center' }}
            >
              {t('club.lineupSection.noLineup')}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: {
    padding: 16,
    paddingLeft: 8,
    gap: 4,
    paddingBottom: 40,
  },
  slotWrapper: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineColumn: {
    width: 20,
    alignItems: 'center',
    paddingTop: 20,
  },
  timelineDot: {
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: -2,
  },
  slotCard: {
    flex: 1,
    borderRadius: 16,
    marginBottom: 8,
  },
  slotContent: {
    gap: 10,
  },
  slotHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowPlayingChip: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    height: 22,
  },
  slotMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  genreChip: {
    height: 24,
  },
  timeSlotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
});
