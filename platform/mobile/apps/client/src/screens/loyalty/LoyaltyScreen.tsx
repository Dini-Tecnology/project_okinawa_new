import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Card, ProgressBar, IconButton, ActivityIndicator, Chip, Button, Divider } from 'react-native-paper';
import ApiService from '@/shared/services/api';
import { format } from 'date-fns';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { t } from '@okinawa/shared/i18n';
import logger from '@okinawa/shared/utils/logger';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

interface LoyaltyProgram {
  id: string;
  restaurant_id: string;
  points_balance: number;
  total_points_earned: number;
  total_points_redeemed: number;
  tier?: string;
  restaurant?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  is_available: boolean;
}

interface PointsTransaction {
  id: string;
  points: number;
  transaction_type: 'earned' | 'redeemed';
  description: string;
  created_at: string;
}

// Note: TIER_CONFIG uses brand/material colors that are intentionally static
// as they represent real-world medal colors, not theme-dependent UI elements
const TIER_CONFIG = {
  bronze: { name: 'Bronze', color: '#CD7F32', nextTier: 'Silver', pointsRequired: 500 },
  silver: { name: 'Silver', color: '#C0C0C0', nextTier: 'Gold', pointsRequired: 1000 },
  gold: { name: 'Gold', color: '#FFD700', nextTier: 'Platinum', pointsRequired: 2500 },
  platinum: { name: 'Platinum', color: '#E5E4E2', nextTier: null, pointsRequired: 5000 },
};

export default function LoyaltyScreen() {
  const colors = useColors();
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redeemingReward, setRedeemingReward] = useState<string | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      loadProgramDetails(selectedProgram.id);
    }
  }, [selectedProgram]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getMyLoyaltyPoints();
      setPrograms(data);
      if (data.length > 0) {
        setSelectedProgram(data[0]);
      }
    } catch (error) {
      logger.error('Failed to load loyalty programs:', error);
      Alert.alert(t('common.error'), t('loyaltyScreen.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const loadProgramDetails = async (programId: string) => {
    try {
      setRewards([
        { id: '1', name: 'Free Appetizer', description: 'Get any appetizer for free', points_required: 100, is_available: true },
        { id: '2', name: '10% Off Next Order', description: 'Get 10% discount on your next order', points_required: 200, is_available: true },
        { id: '3', name: 'Free Dessert', description: 'Choose any dessert on the house', points_required: 150, is_available: true },
        { id: '4', name: 'Free Main Course', description: 'Get any main course for free', points_required: 500, is_available: true },
      ]);

      setTransactions([
        { id: '1', points: 50, transaction_type: 'earned', description: 'Order #1234', created_at: new Date().toISOString() },
        { id: '2', points: 30, transaction_type: 'earned', description: 'Order #1235', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', points: -100, transaction_type: 'redeemed', description: 'Redeemed: Free Appetizer', created_at: new Date(Date.now() - 172800000).toISOString() },
      ]);
    } catch (error) {
      logger.error('Failed to load program details:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrograms();
    setRefreshing(false);
  };

  const getTierInfo = (tier?: string) => {
    const tierKey = (tier?.toLowerCase() || 'bronze') as keyof typeof TIER_CONFIG;
    return TIER_CONFIG[tierKey] || TIER_CONFIG.bronze;
  };

  const calculateProgress = (program: LoyaltyProgram) => {
    const tierInfo = getTierInfo(program.tier);
    if (!tierInfo.nextTier) return 1;

    const currentTierPoints = TIER_CONFIG[program.tier?.toLowerCase() as keyof typeof TIER_CONFIG]?.pointsRequired || 0;
    const nextTierPoints = tierInfo.pointsRequired;
    const progress = (program.total_points_earned - currentTierPoints) / (nextTierPoints - currentTierPoints);

    return Math.min(Math.max(progress, 0), 1);
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!selectedProgram) return;

    if (selectedProgram.points_balance < reward.points_required) {
      Alert.alert(t('loyaltyScreen.insufficientPoints'), t('loyaltyScreen.insufficientPointsMessage'));
      return;
    }

    Alert.alert(
      t('loyaltyScreen.redeemTitle'),
      t('loyaltyScreen.redeemConfirm', { name: reward.name, points: reward.points_required }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('loyaltyScreen.redeemAction'),
          onPress: async () => {
            try {
              setRedeemingReward(reward.id);

              setSelectedProgram({
                ...selectedProgram,
                points_balance: selectedProgram.points_balance - reward.points_required,
                total_points_redeemed: selectedProgram.total_points_redeemed + reward.points_required,
              });

              Alert.alert(t('common.success'), t('loyaltyScreen.redeemSuccess'));
              await loadPrograms();
            } catch (error: any) {
              Alert.alert(t('common.error'), error.response?.data?.message || t('errors.generic'));
            } finally {
              setRedeemingReward(null);
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <ScreenContainer>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('loyaltyScreen.loadingPrograms')}</Text>
      </View>
    
      </ScreenContainer>
    );
  }

  if (programs.length === 0) {
    return (
      <ScreenContainer>
      <View style={styles.emptyContainer}>
        <IconButton icon="star-outline" size={80} iconColor={colors.foregroundMuted} />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          {t('loyaltyScreen.emptyTitle')}
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          {t('loyaltyScreen.emptyMessage')}
        </Text>
      </View>
    
      </ScreenContainer>
    );
  }

  if (!selectedProgram) {
    return null;
  }

  const tierInfo = getTierInfo(selectedProgram.tier);
  const progress = calculateProgress(selectedProgram);

  return (
    <ScreenContainer>
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {programs.length > 1 && (
        <View style={styles.programSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {programs.map((program) => (
              <Chip
                key={program.id}
                selected={program.id === selectedProgram.id}
                onPress={() => setSelectedProgram(program)}
                style={styles.programChip}
              >
                {program.restaurant?.name || t('loyaltyScreen.restaurantFallback')}
              </Chip>
            ))}
          </ScrollView>
        </View>
      )}

      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.restaurantName}>
            {selectedProgram.restaurant?.name || t('loyaltyScreen.restaurantFallback')}
          </Text>

          <View style={styles.pointsContainer}>
            <View style={styles.pointsBadge}>
              <Text variant="headlineLarge" style={styles.pointsNumber}>
                {selectedProgram.points_balance}
              </Text>
              <Text variant="bodyLarge" style={styles.pointsLabel}>
                {t('loyaltyScreen.pointsAvailable')}
              </Text>
            </View>
          </View>

          <View style={styles.tierContainer}>
            <Chip
              icon="trophy"
              style={[styles.tierChip, { backgroundColor: tierInfo.color }]}
              textStyle={styles.tierText}
            >
              {t('loyaltyScreen.tierLabel', { name: tierInfo.name })}
            </Chip>
          </View>

          {tierInfo.nextTier && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text variant="bodyMedium" style={{ color: colors.foreground }}>
                  {t('loyaltyScreen.progressTo', { tier: tierInfo.nextTier || '' })}
                </Text>
                <Text variant="bodyMedium" style={styles.progressPoints}>
                  {selectedProgram.total_points_earned} / {tierInfo.pointsRequired}
                </Text>
              </View>
              <ProgressBar
                progress={progress}
                color={colors.primary}
                style={styles.progressBar}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('loyaltyScreen.tierBenefits', { name: tierInfo.name })}
          </Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <IconButton icon="check-circle" size={20} iconColor={colors.success} style={styles.benefitIcon} />
              <Text variant="bodyMedium" style={{ color: colors.foreground }}>{t('loyaltyScreen.earnPoints', { multiplier: tierInfo.name === 'Bronze' ? '1' : tierInfo.name === 'Silver' ? '1.5' : tierInfo.name === 'Gold' ? '2' : '3' })}</Text>
            </View>
            <View style={styles.benefitItem}>
              <IconButton icon="check-circle" size={20} iconColor={colors.success} style={styles.benefitIcon} />
              <Text variant="bodyMedium" style={{ color: colors.foreground }}>{t('loyaltyScreen.exclusiveRewards', { tier: tierInfo.name.toLowerCase() })}</Text>
            </View>
            {tierInfo.name !== 'Bronze' && (
              <View style={styles.benefitItem}>
                <IconButton icon="check-circle" size={20} iconColor={colors.success} style={styles.benefitIcon} />
                <Text variant="bodyMedium" style={{ color: colors.foreground }}>{t('loyaltyScreen.priorityBooking')}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('loyaltyScreen.availableRewards')}
          </Text>
          {rewards.filter(r => r.is_available).map((reward) => (
            <View key={reward.id} style={styles.rewardItem}>
              <View style={styles.rewardInfo}>
                <Text variant="titleMedium" style={{ color: colors.foreground }}>{reward.name}</Text>
                <Text variant="bodySmall" style={styles.rewardDescription}>
                  {reward.description}
                </Text>
                <View style={styles.rewardPoints}>
                  <IconButton icon="star" size={16} iconColor={colors.warning} style={styles.rewardIcon} />
                  <Text variant="bodyMedium" style={styles.pointsText}>
                    {t('loyaltyScreen.pointsRequired', { count: reward.points_required })}
                  </Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => handleRedeemReward(reward)}
                disabled={selectedProgram.points_balance < reward.points_required || redeemingReward === reward.id}
                loading={redeemingReward === reward.id}
                style={styles.redeemButton}
              >
                {selectedProgram.points_balance >= reward.points_required ? t('loyaltyScreen.redeemAction') : t('loyaltyScreen.lockedAction')}
              </Button>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('loyaltyScreen.statistics')}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {selectedProgram.total_points_earned}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {t('loyaltyScreen.totalEarned')}
              </Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {selectedProgram.total_points_redeemed}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {t('loyaltyScreen.totalRedeemed')}
              </Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {selectedProgram.points_balance}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {t('loyaltyScreen.available')}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('loyaltyScreen.recentActivity')}
          </Text>
          {transactions.slice(0, 5).map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text variant="bodyMedium" style={{ color: colors.foreground }}>{transaction.description}</Text>
                <Text variant="bodySmall" style={styles.transactionDate}>
                  {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                </Text>
              </View>
              <Text
                variant="titleMedium"
                style={[
                  styles.transactionPoints,
                  transaction.transaction_type === 'earned' ? styles.pointsEarned : styles.pointsRedeemed,
                ]}
              >
                {transaction.transaction_type === 'earned' ? '+' : ''}{transaction.points}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  
    </ScreenContainer>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 15,
    color: colors.foregroundMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.foreground,
  },
  emptyText: {
    marginTop: 10,
    color: colors.foregroundMuted,
    textAlign: 'center',
  },
  programSelector: {
    padding: 15,
  },
  programChip: {
    marginRight: 10,
  },
  headerCard: {
    margin: 15,
    backgroundColor: colors.card,
  },
  restaurantName: {
    textAlign: 'center',
    marginBottom: 15,
    color: colors.foreground,
  },
  pointsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pointsBadge: {
    alignItems: 'center',
  },
  pointsNumber: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  pointsLabel: {
    color: colors.foregroundMuted,
    marginTop: 5,
  },
  tierContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  tierChip: {},
  tierText: {
    color: '#000',
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressPoints: {
    color: colors.foregroundMuted,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  card: {
    margin: 15,
    marginTop: 0,
    backgroundColor: colors.card,
  },
  sectionTitle: {
    marginBottom: 15,
    color: colors.foreground,
  },
  benefitsList: {},
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    margin: 0,
    marginRight: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardDescription: {
    color: colors.foregroundMuted,
    marginTop: 4,
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rewardIcon: {
    margin: 0,
    marginRight: 4,
  },
  pointsText: {
    color: colors.foreground,
  },
  redeemButton: {},
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
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionInfo: {},
  transactionDate: {
    color: colors.foregroundMuted,
    marginTop: 4,
  },
  transactionPoints: {},
  pointsEarned: {
    color: colors.success,
  },
  pointsRedeemed: {
    color: colors.error,
  },
});
