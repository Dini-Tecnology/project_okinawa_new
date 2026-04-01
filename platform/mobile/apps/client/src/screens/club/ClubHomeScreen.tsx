/**
 * ClubHomeScreen - Club Module Entry Point
 *
 * Shows active club events for the restaurant with event cards
 * displaying name, date, DJ/artist, cover charge, and status.
 * Provides navigation to ticket purchase, queue, and lineup screens.
 *
 * @module client/screens/club
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { t } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { gradients } from '@okinawa/shared/theme/colors';
import { ApiService } from '@okinawa/shared/services/api';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

// ============================================
// TYPES
// ============================================

interface ClubEvent {
  id: string;
  name: string;
  date: string;
  artist: string;
  genre: string;
  coverCharge: number;
  vipCoverCharge: number;
  status: 'available' | 'soldout' | 'cancelled';
  imageUrl?: string;
  venue: string;
  restaurantId: string;
}

interface ClubHomeScreenProps {
  route?: {
    params?: {
      restaurantId: string;
    };
  };
}

// ============================================
// SKELETON
// ============================================

function EventSkeleton({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            gap: 12,
          }}
        >
          <View style={{ width: '70%', height: 20, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ width: '50%', height: 14, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ width: '40%', height: 14, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <View style={{ flex: 1, height: 40, borderRadius: 16, backgroundColor: colors.backgroundTertiary }} />
            <View style={{ flex: 1, height: 40, borderRadius: 16, backgroundColor: colors.backgroundTertiary }} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================
// EVENT CARD
// ============================================

function EventCard({
  event,
  colors,
  onBuyTicket,
  onJoinQueue,
  onViewLineup,
}: {
  event: ClubEvent;
  colors: ReturnType<typeof useColors>;
  onBuyTicket: (event: ClubEvent) => void;
  onJoinQueue: (event: ClubEvent) => void;
  onViewLineup: (event: ClubEvent) => void;
}) {
  const isSoldOut = event.status === 'soldout';
  const isCancelled = event.status === 'cancelled';

  const statusColor = isSoldOut
    ? colors.error
    : isCancelled
    ? colors.foregroundMuted
    : colors.success;

  const statusBgColor = isSoldOut
    ? colors.errorBackground
    : isCancelled
    ? colors.backgroundTertiary
    : colors.successBackground;

  const statusLabel = isSoldOut
    ? t('club.soldOut')
    : isCancelled
    ? t('common.cancel')
    : t('club.available');

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const formattedTime = eventDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      style={{
        borderRadius: 20,
        elevation: 2,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      mode="elevated"
    >
      <Card.Content style={{ gap: 12 }}>
        {/* Header */}
        <View style={eventStyles.eventHeader}>
          <View style={{ flex: 1 }}>
            <Text
              variant="titleLarge"
              style={{ color: colors.foreground, fontWeight: '700' }}
              numberOfLines={1}
            >
              {event.name}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: colors.foregroundSecondary, marginTop: 2 }}
            >
              {formattedDate} - {formattedTime}
            </Text>
          </View>
          {/* Status badge: pill style with bg-color/10 pattern */}
          <View style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
            backgroundColor: statusBgColor,
          }}>
            <Text style={{ color: statusColor, fontSize: 11, fontWeight: '600' }}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Artist Info - icon container instead of emoji */}
        <View style={eventStyles.artistRow}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: `${colors.primary}1A`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}>
            <IconButton icon="music-note" size={20} iconColor={colors.primary} style={{ margin: 0 }} />
          </View>
          <View>
            <Text
              variant="bodyLarge"
              style={{ color: colors.foreground, fontWeight: '600' }}
            >
              {event.artist}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.foregroundMuted }}>
              {event.genre}
            </Text>
          </View>
        </View>

        {/* Cover Charge */}
        <View style={eventStyles.priceRow}>
          <Text variant="bodyMedium" style={{ color: colors.foregroundSecondary }}>
            {t('club.coverCharge')}:
          </Text>
          <Text
            variant="titleMedium"
            style={{ color: colors.primary, fontWeight: '700' }}
          >
            R$ {event.coverCharge.toFixed(2)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={eventStyles.actionRow}>
          {/* Buy Ticket: gradient CTA */}
          <Pressable
            onPress={() => onBuyTicket(event)}
            disabled={isSoldOut || isCancelled}
            accessibilityRole="button"
            accessibilityLabel={`Buy ticket for ${event.name}`}
            accessibilityState={{ disabled: isSoldOut || isCancelled }}
            style={({ pressed }) => [{
              flex: 2,
              opacity: (isSoldOut || isCancelled) ? 0.5 : pressed ? 0.9 : 1,
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
              }}
            >
              <Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 13 }}>
                {t('club.buyTicket')}
              </Text>
            </LinearGradient>
          </Pressable>

          <Button
            mode="outlined"
            onPress={() => onJoinQueue(event)}
            disabled={isCancelled}
            style={{ flex: 1, borderRadius: 16 }}
            labelStyle={{ fontSize: 12 }}
            compact
          >
            {t('club.joinQueue')}
          </Button>
          <Button
            mode="text"
            onPress={() => onViewLineup(event)}
            style={{ flex: 1, borderRadius: 16 }}
            labelStyle={{ fontSize: 12 }}
            compact
          >
            {t('club.viewLineup')}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ClubHomeScreen({ route }: ClubHomeScreenProps) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const restaurantId = route?.params?.restaurantId || '';

  const {
    data: events,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<ClubEvent[]>({
    queryKey: ['club-events', restaurantId],
    queryFn: async () => {
      const response = await ApiService.get(
        `/lineup/restaurant/${restaurantId}/upcoming`,
      );
      return response.data || [];
    },
    enabled: !!restaurantId,
  });

  const handleBuyTicket = useCallback(
    (event: ClubEvent) => {
      navigation.navigate('TicketPurchase', {
        eventId: event.id,
        restaurantId: event.restaurantId,
        eventName: event.name,
        eventDate: event.date,
        coverCharge: event.coverCharge,
        vipCoverCharge: event.vipCoverCharge,
      });
    },
    [navigation],
  );

  const handleJoinQueue = useCallback(
    (event: ClubEvent) => {
      navigation.navigate('ClubQueue', {
        restaurantId: event.restaurantId,
        eventId: event.id,
        eventName: event.name,
      });
    },
    [navigation],
  );

  const handleViewLineup = useCallback(
    (event: ClubEvent) => {
      navigation.navigate('Lineup', {
        restaurantId: event.restaurantId,
        eventDate: event.date,
        eventName: event.name,
      });
    },
    [navigation],
  );

  const renderEvent = useCallback(
    ({ item }: { item: ClubEvent }) => (
      <EventCard
        event={item}
        colors={colors}
        onBuyTicket={handleBuyTicket}
        onJoinQueue={handleJoinQueue}
        onViewLineup={handleViewLineup}
      />
    ),
    [colors, handleBuyTicket, handleJoinQueue, handleViewLineup],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={eventStyles.emptyState}>
        <View style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: `${colors.primary}1A`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}>
          <IconButton icon="music-note" size={32} iconColor={colors.primary} style={{ margin: 0 }} />
        </View>
        <Text
          variant="titleMedium"
          style={{ color: colors.foregroundMuted, textAlign: 'center' }}
        >
          {t('club.noEvents')}
        </Text>
      </View>
    ),
    [colors],
  );

  if (isLoading) {
    return (
      <ScreenContainer>
      <View style={[eventStyles.container, { backgroundColor: colors.background }]}>
        <View style={eventStyles.header}>
          <Text
            variant="headlineMedium"
            style={{ color: colors.foreground, fontWeight: '700' }}
          >
            {t('club.title')}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: colors.foregroundSecondary }}
          >
            {t('club.events')}
          </Text>
        </View>
        <EventSkeleton colors={colors} />
      </View>
    
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
    <View style={[eventStyles.container, { backgroundColor: colors.background }]}>
      <View style={eventStyles.header}>
        <Text
          variant="headlineMedium"
          style={{ color: colors.foreground, fontWeight: '700' }}
        >
          {t('club.title')}
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: colors.foregroundSecondary }}
        >
          {t('club.events')}
        </Text>
      </View>

      <FlatList
        data={events || []}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={eventStyles.list}
        ListEmptyComponent={renderEmpty}
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

const eventStyles = StyleSheet.create({
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
    paddingTop: 8,
    gap: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
});
