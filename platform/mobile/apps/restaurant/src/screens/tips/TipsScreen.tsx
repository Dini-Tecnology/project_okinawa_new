/**
 * TipsScreen - Restaurant Tips Management
 * 
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, SegmentedButtons, Chip, DataTable } from 'react-native-paper';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { formatCurrency } from '@okinawa/shared/utils/formatters';
import { getLanguage } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { format } from 'date-fns';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

interface TipSummary {
  total_tips: number;
  tips_count: number;
  average_tip: number;
  pending_distribution: number;
  staff_tips: Array<{
    staff_id: string;
    staff_name: string;
    total_tips: number;
    tips_count: number;
  }>;
}

interface TipTransaction {
  id: string;
  amount: number;
  tip_type: 'order' | 'direct' | 'pooled';
  status: 'pending' | 'distributed';
  order_id?: string;
  staff_member?: {
    id: string;
    name: string;
  };
  created_at: string;
}

export default function TipsScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const [period, setPeriod] = useState('today');
  const [summary, setSummary] = useState<TipSummary | null>(null);
  const [transactions, setTransactions] = useState<TipTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    segmentedButtons: {
      margin: 16,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 16,
      paddingTop: 0,
      gap: 15,
    },
    summaryCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.card,
    },
    cardLabel: {
      color: colors.mutedForeground,
      marginBottom: 5,
    },
    totalTips: {
      color: colors.success,
      fontWeight: 'bold',
    },
    pending: {
      color: colors.warning,
      fontWeight: 'bold',
    },
    displayText: {
      color: colors.foreground,
    },
    distributeButton: {
      marginHorizontal: 15,
      marginBottom: 15,
      backgroundColor: colors.primary,
    },
    staffCard: {
      margin: 16,
      marginTop: 0,
      backgroundColor: colors.card,
    },
    sectionTitle: {
      marginHorizontal: 15,
      marginBottom: 10,
      color: colors.foreground,
    },
    list: {
      padding: 16,
      paddingTop: 0,
    },
    card: {
      marginBottom: 15,
      backgroundColor: colors.card,
    },
    transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    transactionAmount: {
      color: colors.foreground,
    },
    date: {
      color: colors.mutedForeground,
      marginTop: 4,
    },
    chips: {
      gap: 5,
      alignItems: 'flex-end',
    },
    typeChip: {
      height: 24,
      backgroundColor: colors.muted,
    },
    distributedChip: {
      backgroundColor: colors.success,
    },
    pendingChip: {
      backgroundColor: colors.warning,
    },
    chipText: {
      fontSize: 12,
    },
    chipTextWhite: {
      color: colors.cardForeground,
      fontSize: 12,
    },
    staffName: {
      marginTop: 10,
      color: colors.foreground,
    },
    orderId: {
      marginTop: 5,
      color: colors.mutedForeground,
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 50,
    },
    emptyText: {
      color: colors.mutedForeground,
    },
    tableText: {
      color: colors.foreground,
    },
  }), [colors]);

  useEffect(() => {
    loadTipsData();
  }, [period]);

  const loadTipsData = async () => {
    setLoading(true);
    try {
      const [summaryResponse, transactionsResponse] = await Promise.all([
        ApiService.getTips({ date: period }),
        ApiService.getTips({ date: period }),
      ]);

      setSummary(summaryResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Failed to load tips data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTipsData();
    setRefreshing(false);
  };

  const distributeTips = async () => {
    try {
      await ApiService.distributeTips({ distributions: [] });
      loadTipsData();
    } catch (error) {
      console.error('Failed to distribute tips:', error);
    }
  };

  const renderTransaction = ({ item }: { item: TipTransaction }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <View>
            <Text variant="titleMedium" style={styles.transactionAmount}>
              {formatCurrency(item.amount, getLanguage())}
            </Text>
            <Text variant="bodySmall" style={styles.date}>
              {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}
            </Text>
          </View>
          <View style={styles.chips}>
            <Chip
              style={styles.typeChip}
              textStyle={styles.chipText}
            >
              {item.tip_type.toUpperCase()}
            </Chip>
            <Chip
              style={item.status === 'distributed' ? styles.distributedChip : styles.pendingChip}
              textStyle={styles.chipTextWhite}
            >
              {item.status.toUpperCase()}
            </Chip>
          </View>
        </View>

        {item.staff_member && (
          <Text variant="bodyMedium" style={styles.staffName}>
            {t('staff.title')}: {item.staff_member.name}
          </Text>
        )}

        {item.order_id && (
          <Text variant="bodySmall" style={styles.orderId}>
            {t('orders.title')}: #{item.order_id.slice(0, 8)}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <ScreenContainer>
    <View style={styles.container} accessibilityLabel="Tips management">
      <SegmentedButtons
        value={period}
        onValueChange={setPeriod}
        buttons={[
          { value: 'today', label: t('financial.today') },
          { value: 'week', label: t('financial.thisWeek') },
          { value: 'month', label: t('financial.thisMonth') },
        ]}
        style={styles.segmentedButtons}
      />

      {summary && (
        <>
          <View style={styles.grid}>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>
                  {t('tips.title')}
                </Text>
                <Text variant="displaySmall" style={styles.totalTips}>
                  {formatCurrency(summary.total_tips, getLanguage())}
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>
                  {t('menu.quantity')}
                </Text>
                <Text variant="displaySmall" style={styles.displayText}>{summary.tips_count}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>
                  {t('financial.averageTicket')}
                </Text>
                <Text variant="displaySmall" style={styles.displayText}>
                  {formatCurrency(summary.average_tip, getLanguage())}
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>
                  {t('orders.status.pending')}
                </Text>
                <Text variant="displaySmall" style={styles.pending}>
                  {formatCurrency(summary.pending_distribution, getLanguage())}
                </Text>
              </Card.Content>
            </Card>
          </View>

          {summary.pending_distribution > 0 && (
            <Button
              mode="contained"
              onPress={distributeTips}
              style={styles.distributeButton}
              icon="share"
            >
              {t('tips.tipDistribution')}
            </Button>
          )}

          <Card style={styles.staffCard}>
            <Card.Title title={t('staff.title')} titleStyle={{ color: colors.foreground }} />
            <Card.Content>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title textStyle={styles.tableText}>{t('staff.title')}</DataTable.Title>
                  <DataTable.Title numeric textStyle={styles.tableText}>{t('menu.quantity')}</DataTable.Title>
                  <DataTable.Title numeric textStyle={styles.tableText}>{t('orders.total')}</DataTable.Title>
                </DataTable.Header>

                {summary.staff_tips.map((staff) => (
                  <DataTable.Row key={staff.staff_id}>
                    <DataTable.Cell textStyle={styles.tableText}>{staff.staff_name}</DataTable.Cell>
                    <DataTable.Cell numeric textStyle={styles.tableText}>{staff.tips_count}</DataTable.Cell>
                    <DataTable.Cell numeric textStyle={styles.tableText}>
                      {formatCurrency(staff.total_tips, getLanguage())}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        </>
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t('wallet.transactions')}
      </Text>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        getItemLayout={(_, index) => ({
          length: 72,
          offset: 72 * index,
          index,
        })}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={styles.emptyText}>{t('wallet.noTransactions')}</Text>
          </View>
        }
      />
    </View>
    </ScreenContainer>
  );
}
