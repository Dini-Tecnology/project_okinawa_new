/**
 * LoyaltyDetailScreen - Loyalty Program Detail View
 *
 * Drill-down from LoyaltyScreen showing detailed loyalty info:
 * points balance, tier badge, progress bar, points history,
 * stamp cards, and how-to-earn section.
 *
 * @module client/screens/loyalty
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import {
  Text,
  Card,
  ProgressBar,
  IconButton,
  ActivityIndicator,
  Chip,
  Button,
  Divider,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import ApiService from '@/shared/services/api';
import { format } from 'date-fns';

// ============================================
// TYPES
// ============================================

interface LoyaltyDetail {
  id: string;
  points_balance: number;
  total_points_earned: number;
  total_points_redeemed: number;
  tier: string;
  next_tier: string | null;
  points_to_next_tier: number;
  tier_progress: number;
  restaurant?: {
    id: string;
    name: string;
  };
}

interface PointsHistoryEntry {
  id: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  created_at: string;
}

interface StampCard {
  id: string;
  name: string;
  stamps_collected: number;
  stamps_required: number;
  reward: string;
}

// Note: TIER_CONFIG uses brand/material colors that are intentionally static
// as they represent real-world medal colors, not theme-dependent UI elements
const TIER_CONFIG: Record<string, { color: string; icon: string }> = {
  bronze: { color: '#CD7F32', icon: 'shield-star' },
  silver: { color: '#C0C0C0', icon: 'shield-star' },
  gold: { color: '#FFD700', icon: 'shield-star' },
  platinum: { color: '#E5E4E2', icon: 'shield-crown' },
};

// ============================================
// SKELETON
// ============================================

function LoyaltyDetailSkeleton({ colors }: { colors: any }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        {/* Points card skeleton */}
        <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 24, alignItems: 'center', gap: 12 }}>
          <View style={{ width: 100, height: 40, borderRadius: 8, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ width: 60, height: 14, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ width: 80, height: 28, borderRadius: 14, backgroundColor: colors.backgroundTertiary }} />
          <View style={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
        </View>
        {/* History skeleton */}
        <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, gap: 12 }}>
          <View style={{ width: '40%', height: 16, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ width: '60%', height: 12, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
              <View style={{ width: '20%', height: 12, borderRadius: 4, backgroundColor: colors.backgroundTertiary }} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================
// COMPONENT
// ============================================

export default function LoyaltyDetailScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const route = useRoute<any>();
  const navigation = useNavigation();

  const programId = route.params?.programId;
  const [refreshing, setRefreshing] = useState(false);

  // Fetch loyalty detail
  const {
    data: loyalty,
    isLoading,
    isError,
    refetch,
  } = useQuery<LoyaltyDetail>({
    queryKey: ['loyalty', 'detail', programId],
    queryFn: () => ApiService.get(`/loyalty/${programId || 'me'}`),
  });

  // Fetch points history
  const { data: history = [] } = useQuery<PointsHistoryEntry[]>({
    queryKey: ['loyalty', 'history', programId],
    queryFn: () => ApiService.get(`/loyalty/${programId || 'me'}/history`),
    enabled: !!loyalty,
  });

  // Fetch stamp cards
  const { data: stampCards = [] } = useQuery<StampCard[]>({
    queryKey: ['loyalty', 'stamps', programId],
    queryFn: () => ApiService.get(`/loyalty/${programId || 'me'}/stamps`),
    enabled: !!loyalty,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  // ============================================
  // RENDER STATES
  // ============================================

  if (isLoading) {
    return <LoyaltyDetailSkeleton colors={colors} />;
  }

  if (isError || !loyalty) {
    return (
      <View style={styles.errorContainer}>
        <IconButton icon="alert-circle-outline" size={64} iconColor={colors.foregroundMuted} />
        <Text variant="bodyLarge" style={styles.errorText}>
          {t('loyalty.detail.emptyTitle')}
        </Text>
        <Text variant="bodyMedium" style={styles.emptyMessage}>
          {t('loyalty.detail.emptyMessage')}
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  const tierKey = loyalty.tier?.toLowerCase() || 'bronze';
  const tierConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.bronze;
  const tierName = t(`loyalty.tiers.${tierKey}`);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Points Balance Card */}
      <Card style={styles.pointsCard}>
        <Card.Content style={styles.pointsCardContent}>
          <Text variant="displaySmall" style={styles.pointsNumber}>
            {loyalty.points_balance.toLocaleString()}
          </Text>
          <Text variant="bodyLarge" style={styles.pointsLabel}>
            {t('loyalty.detail.pointsAvailable')}
          </Text>

          {/* Tier Badge */}
          <Chip
            icon={tierConfig.icon}
            style={[styles.tierChip, { backgroundColor: tierConfig.color }]}
            textStyle={styles.tierChipText}
          >
            {t('loyalty.detail.tierBadge', { tier: tierName })}
          </Chip>

          {/* Progress to Next Tier */}
          {loyalty.next_tier && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text variant="bodyMedium" style={styles.progressLabel}>
                  {t('loyalty.detail.progressToNext', {
                    tier: t(`loyalty.tiers.${loyalty.next_tier.toLowerCase()}`),
                  })}
                </Text>
                <Text variant="bodySmall" style={styles.progressValue}>
                  {loyalty.total_points_earned} / {loyalty.points_to_next_tier + loyalty.total_points_earned}
                </Text>
              </View>
              <ProgressBar
                progress={loyalty.tier_progress || 0}
                color={colors.primary}
                style={styles.progressBar}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Points History */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('loyalty.detail.history')}
          </Text>

          {history.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptySection}>
              {t('loyalty.detail.noHistory')}
            </Text>
          ) : (
            history.slice(0, 10).map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <View style={styles.historyInfo}>
                  <View style={styles.historyRow}>
                    <IconButton
                      icon={entry.type === 'earned' ? 'arrow-up-circle' : 'arrow-down-circle'}
                      size={20}
                      iconColor={entry.type === 'earned' ? colors.success : colors.error}
                      style={{ margin: 0 }}
                    />
                    <Text variant="bodyMedium" style={styles.historyDesc}>
                      {entry.description}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.historyDate}>
                    {format(new Date(entry.created_at), 'dd/MM/yyyy')}
                  </Text>
                </View>
                <Text
                  variant="titleSmall"
                  style={[
                    styles.historyPoints,
                    entry.type === 'earned' ? styles.pointsEarned : styles.pointsRedeemed,
                  ]}
                >
                  {entry.type === 'earned' ? '+' : ''}{entry.points}
                </Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Stamp Cards */}
      {stampCards.length > 0 && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('loyalty.detail.stampCards')}
            </Text>
            {stampCards.map((card) => (
              <View key={card.id} style={styles.stampCard}>
                <View style={styles.stampInfo}>
                  <Text variant="titleSmall" style={styles.stampName}>
                    {card.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.stampReward}>
                    {card.reward}
                  </Text>
                </View>
                <View style={styles.stampsRow}>
                  {Array.from({ length: card.stamps_required }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.stampDot,
                        {
                          backgroundColor: i < card.stamps_collected ? colors.primary : colors.backgroundTertiary,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text variant="bodySmall" style={styles.stampCount}>
                  {card.stamps_collected}/{card.stamps_required}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* How to Earn Points */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('loyalty.detail.howToEarn')}
          </Text>
          <View style={styles.rulesList}>
            {[
              { icon: 'cart', rule: t('loyalty.earnPoints') },
              { icon: 'star', rule: t('loyalty.rewards') },
              { icon: 'account-plus', rule: t('loyalty.referFriend') },
            ].map((item, index) => (
              <View key={index} style={styles.ruleItem}>
                <IconButton
                  icon={item.icon}
                  size={20}
                  iconColor={colors.primary}
                  style={{ margin: 0 }}
                />
                <Text variant="bodyMedium" style={styles.ruleText}>
                  {item.rule}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Statistics */}
      <Card style={[styles.sectionCard, styles.lastCard]}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {loyalty.total_points_earned.toLocaleString()}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {t('loyalty.detail.earned')}
              </Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {loyalty.total_points_redeemed.toLocaleString()}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {t('loyalty.detail.redeemed')}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
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
    pointsCard: {
      margin: 16,
      backgroundColor: colors.card,
      borderRadius: 20,
    },
    pointsCardContent: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    pointsNumber: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 48,
      lineHeight: 56,
    },
    pointsLabel: {
      color: colors.foregroundMuted,
      marginTop: 4,
    },
    tierChip: {
      marginTop: 16,
    },
    tierChipText: {
      color: '#000',
      fontWeight: 'bold',
    },
    progressSection: {
      width: '100%',
      marginTop: 20,
      paddingHorizontal: 8,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    progressLabel: {
      color: colors.foreground,
    },
    progressValue: {
      color: colors.foregroundMuted,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },
    sectionCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
    },
    lastCard: {
      marginBottom: 32,
    },
    sectionTitle: {
      color: colors.foreground,
      fontWeight: '600',
      marginBottom: 16,
    },
    emptySection: {
      color: colors.foregroundMuted,
      textAlign: 'center',
      paddingVertical: 16,
    },
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyInfo: {
      flex: 1,
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    historyDesc: {
      color: colors.foreground,
      flex: 1,
    },
    historyDate: {
      color: colors.foregroundMuted,
      marginTop: 2,
      marginLeft: 26,
    },
    historyPoints: {
      fontWeight: 'bold',
      marginLeft: 8,
    },
    pointsEarned: {
      color: colors.success,
    },
    pointsRedeemed: {
      color: colors.error,
    },
    stampCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    stampInfo: {
      marginBottom: 8,
    },
    stampName: {
      color: colors.foreground,
      fontWeight: '600',
    },
    stampReward: {
      color: colors.foregroundMuted,
      marginTop: 2,
    },
    stampsRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 4,
    },
    stampDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    stampCount: {
      color: colors.foregroundMuted,
      textAlign: 'right',
    },
    rulesList: {
      gap: 8,
    },
    ruleItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    ruleText: {
      color: colors.foreground,
      flex: 1,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statNumber: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    statLabel: {
      color: colors.foregroundMuted,
      marginTop: 4,
    },
    statDivider: {
      width: 1,
      height: 40,
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
      color: colors.foreground,
      marginTop: 12,
      textAlign: 'center',
    },
    emptyMessage: {
      color: colors.foregroundMuted,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 22,
    },
    retryButton: {
      marginTop: 16,
      borderRadius: 12,
    },
  });
