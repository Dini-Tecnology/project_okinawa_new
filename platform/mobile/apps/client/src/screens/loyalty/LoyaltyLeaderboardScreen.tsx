/**
 * LoyaltyLeaderboardScreen - Client App Loyalty Program Leaderboard
 * 
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { typography } from '@okinawa/shared/theme/typography';
import { spacing } from '@okinawa/shared/theme/spacing';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  isCurrentUser?: boolean;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image: string;
  available: boolean;
}

const tierLabels = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
  platinum: 'Platina',
  diamond: 'Diamante',
};

export const LoyaltyLeaderboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'rewards'>('leaderboard');

  /**
   * Dynamic tier colors - using material/real-world medal colors
   * These are intentionally static as they represent real physical medal colors
   * and should remain consistent regardless of light/dark theme
   */
  const getTierColor = useCallback((tier: string): string => {
    const tierColors: Record<string, string> = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
    };
    return tierColors[tier] || colors.mutedForeground;
  }, [colors]);

  const currentUser: LeaderboardUser = {
    id: 'current',
    name: 'Você',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    points: 2450,
    rank: 8,
    tier: 'gold',
    isCurrentUser: true,
  };

  const leaderboard: LeaderboardUser[] = [
    { id: '1', name: 'Ana Silva', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', points: 8750, rank: 1, tier: 'diamond' },
    { id: '2', name: 'Carlos M.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', points: 7200, rank: 2, tier: 'platinum' },
    { id: '3', name: 'Julia R.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', points: 6890, rank: 3, tier: 'platinum' },
    { id: '4', name: 'Pedro H.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', points: 5400, rank: 4, tier: 'gold' },
    { id: '5', name: 'Mariana L.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', points: 4800, rank: 5, tier: 'gold' },
    { id: '6', name: 'Lucas F.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', points: 3200, rank: 6, tier: 'gold' },
    { id: '7', name: 'Beatriz S.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', points: 2800, rank: 7, tier: 'gold' },
    currentUser,
    { id: '9', name: 'Rafael M.', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100', points: 2100, rank: 9, tier: 'silver' },
    { id: '10', name: 'Camila O.', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100', points: 1950, rank: 10, tier: 'silver' },
  ];

  const rewards: Reward[] = [
    { id: '1', name: 'Café Grátis', description: 'Um café expresso ou cappuccino', pointsCost: 500, image: '☕', available: true },
    { id: '2', name: '10% de Desconto', description: 'Válido em qualquer pedido', pointsCost: 1000, image: '🏷️', available: true },
    { id: '3', name: 'Sobremesa Grátis', description: 'Escolha qualquer sobremesa do menu', pointsCost: 1500, image: '🍰', available: true },
    { id: '4', name: 'Prato Principal', description: 'Um prato principal até R$50', pointsCost: 3000, image: '🍽️', available: false },
    { id: '5', name: 'Experiência VIP', description: 'Mesa exclusiva + champagne', pointsCost: 5000, image: '🥂', available: false },
    { id: '6', name: 'Jantar para Dois', description: 'Menu degustação completo', pointsCost: 8000, image: '💝', available: false },
  ];

  const nextTierPoints = {
    bronze: 1000,
    silver: 2000,
    gold: 5000,
    platinum: 10000,
    diamond: Infinity,
  };

  const progressToNextTier = () => {
    const current = currentUser.points;
    const next = nextTierPoints[currentUser.tier];
    const prev = Object.values(nextTierPoints)[Object.keys(nextTierPoints).indexOf(currentUser.tier) - 1] || 0;
    return ((current - prev) / (next - prev)) * 100;
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    title: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold as any,
      color: colors.foreground,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    statsCard: {
      borderRadius: spacing.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      backgroundColor: colors.primary,
    },
    statsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    statsUser: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    statsAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: colors.cardForeground,
    },
    statsName: {
      color: colors.glassStrong,
      fontSize: typography.sizes.sm,
    },
    statsPoints: {
      color: colors.cardForeground,
      fontSize: typography.sizes.xxl,
      fontWeight: typography.weights.bold as any,
    },
    statsTier: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: spacing.md,
    },
    statsTierText: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.bold as any,
      color: colors.foreground,
    },
    progressSection: {
      marginBottom: spacing.lg,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.glassBorder,
      borderRadius: 4,
      marginBottom: spacing.xs,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.cardForeground,
      borderRadius: 4,
    },
    progressText: {
      color: colors.glassStrong,
      fontSize: typography.sizes.xs,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      color: colors.cardForeground,
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold as any,
    },
    statLabel: {
      color: colors.glassBorder,
      fontSize: typography.sizes.xs,
    },
    statDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.glassBorder,
    },
    tabContainer: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: spacing.md,
      marginBottom: spacing.lg,
      backgroundColor: colors.muted,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: spacing.md - 2,
    },
    tabText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium as any,
    },
    podium: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-end',
      marginBottom: spacing.xl,
      paddingTop: spacing.xl,
    },
    podiumPlace: {
      alignItems: 'center',
      width: 100,
    },
    crownContainer: {
      marginBottom: spacing.xs,
    },
    podiumAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 3,
      borderColor: colors.border,
    },
    podiumAvatar1: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderColor: colors.ratingGold,
    },
    podiumBadge: {
      position: 'absolute',
      top: 40,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    podiumBadge1: {
      top: 56,
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    podiumRank: {
      color: colors.foreground,
      fontSize: 12,
      fontWeight: 'bold',
    },
    podiumRank1: {
      fontSize: 14,
    },
    podiumName: {
      marginTop: spacing.md,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium as any,
      color: colors.foreground,
    },
    podiumPoints: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.bold as any,
      color: colors.primary,
    },
    podiumBar: {
      width: '80%',
      borderTopLeftRadius: spacing.sm,
      borderTopRightRadius: spacing.sm,
      marginTop: spacing.sm,
    },
    podiumBar1: {
      height: 80,
    },
    podiumBar2: {
      height: 60,
    },
    podiumBar3: {
      height: 40,
    },
    listSection: {
      gap: spacing.sm,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: spacing.lg,
      borderWidth: 1,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    userRowCurrent: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
    },
    userRank: {
      width: 32,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium as any,
      color: colors.mutedForeground,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: spacing.md,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold as any,
      color: colors.foreground,
    },
    tierBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    tierDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    tierText: {
      fontSize: typography.sizes.xs,
      color: colors.mutedForeground,
    },
    userPoints: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold as any,
      color: colors.primary,
    },
    rewardsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    rewardCard: {
      width: '48%',
      padding: spacing.md,
      borderRadius: spacing.lg,
      borderWidth: 1,
      alignItems: 'center',
      position: 'relative',
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    rewardDisabled: {
      opacity: 0.6,
    },
    rewardEmoji: {
      fontSize: 40,
      marginBottom: spacing.sm,
    },
    rewardName: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold as any,
      textAlign: 'center',
      marginBottom: 2,
      color: colors.foreground,
    },
    rewardDescription: {
      fontSize: typography.sizes.xs,
      textAlign: 'center',
      marginBottom: spacing.sm,
      color: colors.mutedForeground,
    },
    rewardCost: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: spacing.sm,
    },
    rewardCostText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold as any,
    },
    redeemBadge: {
      position: 'absolute',
      top: -8,
      right: -8,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: spacing.sm,
      backgroundColor: colors.primary,
    },
    redeemText: {
      color: colors.cardForeground,
      fontSize: 10,
      fontWeight: 'bold',
    },
  }), [colors]);

  const renderLeaderboard = () => (
    <>
      {/* Top 3 Podium */}
      <View style={styles.podium}>
        {/* 2nd Place */}
        <View style={styles.podiumPlace}>
          <Image source={{ uri: leaderboard[1].avatar }} style={styles.podiumAvatar} accessibilityLabel={`${leaderboard[1].name} avatar`} />
          <View style={[styles.podiumBadge, { backgroundColor: getTierColor('silver') }]}>
            <Text style={styles.podiumRank}>2</Text>
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>
            {leaderboard[1].name}
          </Text>
          <Text style={styles.podiumPoints}>
            {leaderboard[1].points.toLocaleString()}
          </Text>
          <View style={[styles.podiumBar, styles.podiumBar2, { backgroundColor: getTierColor('silver') }]} />
        </View>

        {/* 1st Place */}
        <View style={styles.podiumPlace}>
          <View style={styles.crownContainer}>
            <Ionicons name="trophy" size={24} color={getTierColor('gold')} />
          </View>
          <Image source={{ uri: leaderboard[0].avatar }} style={[styles.podiumAvatar, styles.podiumAvatar1]} accessibilityLabel={`${leaderboard[0].name} avatar`} />
          <View style={[styles.podiumBadge, styles.podiumBadge1, { backgroundColor: getTierColor('gold') }]}>
            <Text style={[styles.podiumRank, styles.podiumRank1]}>1</Text>
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>
            {leaderboard[0].name}
          </Text>
          <Text style={styles.podiumPoints}>
            {leaderboard[0].points.toLocaleString()}
          </Text>
          <View style={[styles.podiumBar, styles.podiumBar1, { backgroundColor: getTierColor('gold') }]} />
        </View>

        {/* 3rd Place */}
        <View style={styles.podiumPlace}>
          <Image source={{ uri: leaderboard[2].avatar }} style={styles.podiumAvatar} accessibilityLabel={`${leaderboard[2].name} avatar`} />
          <View style={[styles.podiumBadge, { backgroundColor: getTierColor('bronze') }]}>
            <Text style={styles.podiumRank}>3</Text>
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>
            {leaderboard[2].name}
          </Text>
          <Text style={styles.podiumPoints}>
            {leaderboard[2].points.toLocaleString()}
          </Text>
          <View style={[styles.podiumBar, styles.podiumBar3, { backgroundColor: getTierColor('bronze') }]} />
        </View>
      </View>

      {/* Full List */}
      <View style={styles.listSection}>
        {leaderboard.slice(3).map(user => (
          <View
            key={user.id}
            style={[
              styles.userRow,
              user.isCurrentUser && styles.userRowCurrent,
            ]}
          >
            <Text style={styles.userRank}>
              #{user.rank}
            </Text>
            <Image source={{ uri: user.avatar }} style={styles.userAvatar} accessibilityLabel={`${user.name} avatar`} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user.name}
              </Text>
              <View style={styles.tierBadge}>
                <View style={[styles.tierDot, { backgroundColor: getTierColor(user.tier) }]} />
                <Text style={styles.tierText}>
                  {tierLabels[user.tier]}
                </Text>
              </View>
            </View>
            <Text style={styles.userPoints}>
              {user.points.toLocaleString()} pts
            </Text>
          </View>
        ))}
      </View>
    </>
  );

  const renderRewards = () => (
    <View style={styles.rewardsGrid}>
      {rewards.map(reward => {
        const canRedeem = currentUser.points >= reward.pointsCost;
        return (
          <TouchableOpacity
            key={reward.id}
            style={[
              styles.rewardCard,
              !canRedeem && styles.rewardDisabled,
            ]}
            disabled={!canRedeem}
            accessibilityRole="button"
            accessibilityLabel={`${reward.name}: ${reward.pointsCost.toLocaleString()} points`}
            accessibilityState={{ disabled: !canRedeem }}
          >
            <Text style={styles.rewardEmoji}>{reward.image}</Text>
            <Text style={styles.rewardName}>
              {reward.name}
            </Text>
            <Text style={styles.rewardDescription}>
              {reward.description}
            </Text>
            <View style={[styles.rewardCost, { backgroundColor: canRedeem ? `${colors.primary}20` : colors.muted }]}>
              <Ionicons name="star" size={14} color={canRedeem ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.rewardCostText, { color: canRedeem ? colors.primary : colors.mutedForeground }]}>
                {reward.pointsCost.toLocaleString()}
              </Text>
            </View>
            {canRedeem && (
              <View style={styles.redeemBadge}>
                <Text style={styles.redeemText}>Resgatar</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Fidelidade</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Loyalty program information"
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <View style={styles.statsUser}>
              <Image source={{ uri: currentUser.avatar }} style={styles.statsAvatar} />
              <View>
                <Text style={styles.statsName}>Seus Pontos</Text>
                <Text style={styles.statsPoints}>{currentUser.points.toLocaleString()}</Text>
              </View>
            </View>
            <View style={[styles.statsTier, { backgroundColor: getTierColor(currentUser.tier) }]}>
              <Ionicons name="ribbon" size={16} color={colors.foreground} />
              <Text style={styles.statsTierText}>{tierLabels[currentUser.tier]}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressToNextTier()}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {nextTierPoints[currentUser.tier] - currentUser.points} pts para {tierLabels[Object.keys(tierLabels)[Object.keys(tierLabels).indexOf(currentUser.tier) + 1] as keyof typeof tierLabels] || 'manter'}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>#{currentUser.rank}</Text>
              <Text style={styles.statLabel}>Ranking</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Visitas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Resgates</Text>
            </View>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'leaderboard' && { backgroundColor: colors.card }]}
            onPress={() => setActiveTab('leaderboard')}
            accessibilityRole="button"
            accessibilityLabel="Leaderboard tab"
            accessibilityState={{ selected: activeTab === 'leaderboard' }}
          >
            <Ionicons
              name="podium"
              size={18}
              color={activeTab === 'leaderboard' ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.tabText, { color: activeTab === 'leaderboard' ? colors.foreground : colors.mutedForeground }]}>
              Ranking
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rewards' && { backgroundColor: colors.card }]}
            onPress={() => setActiveTab('rewards')}
            accessibilityRole="button"
            accessibilityLabel="Rewards tab"
            accessibilityState={{ selected: activeTab === 'rewards' }}
          >
            <Ionicons
              name="gift"
              size={18}
              color={activeTab === 'rewards' ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.tabText, { color: activeTab === 'rewards' ? colors.foreground : colors.mutedForeground }]}>
              Recompensas
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'leaderboard' ? renderLeaderboard() : renderRewards()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoyaltyLeaderboardScreen;
