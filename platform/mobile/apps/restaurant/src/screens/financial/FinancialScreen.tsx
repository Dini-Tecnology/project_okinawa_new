/**
 * FinancialScreen - Restaurant Financial Dashboard
 *
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, SegmentedButtons, DataTable } from 'react-native-paper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface FinancialSummary {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  total_tips: number;
  payment_methods: {
    credit_card: number;
    debit_card: number;
    cash: number;
    pix: number;
    wallet: number;
  };
  top_selling_items: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

interface Transaction {
  id: string;
  type: 'order' | 'tip' | 'refund';
  amount: number;
  payment_method: string;
  created_at: string;
  description: string;
}

interface FinancialData {
  summary: FinancialSummary;
  transactions: Transaction[];
}

// ============================================
// QUERY KEYS
// ============================================

export const financialQueryKeys = {
  financial: (period: string) => ['restaurant', 'financial', period] as const,
};

// ============================================
// HELPERS
// ============================================

function getDateRange(period: string) {
  const now = new Date();
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'week':
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
}

// ============================================
// COMPONENT
// ============================================

export default function FinancialScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState('today');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    segmentedButtons: {
      margin: 15,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 15,
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
    revenue: {
      color: colors.success,
      fontWeight: 'bold',
    },
    tips: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    card: {
      margin: 15,
      marginTop: 0,
      backgroundColor: colors.card,
    },
    paymentMethod: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    paymentMethodText: {
      color: colors.foreground,
    },
    amount: {
      fontWeight: '600',
      color: colors.foreground,
    },
  }), [colors]);

  // ---- Main financial query with 60s polling fallback ----
  const {
    data: financialData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<FinancialData>({
    queryKey: financialQueryKeys.financial(period),
    queryFn: async () => {
      const { start, end } = getDateRange(period);
      const [summaryResponse, transactionsResponse] = await Promise.all([
        ApiService.getFinancialSummary({
          params: {
            start_date: start.toISOString(),
            end_date: end.toISOString(),
          },
        } as any),
        ApiService.getFinancialReport({
          params: {
            start_date: start.toISOString(),
            end_date: end.toISOString(),
            limit: 20,
          },
        } as any),
      ]);
      return {
        summary: summaryResponse.data,
        transactions: transactionsResponse.data,
      };
    },
    staleTime: 30_000,
    refetchInterval: 60_000, // poll every 60s as WebSocket fallback
  });

  const summary = financialData?.summary ?? null;
  const transactions = financialData?.transactions ?? [];

  // isRefreshing = a background refetch after initial load
  const refreshing = isFetching && !isLoading;

  // ---- WebSocket subscription for real-time financial updates ----
  const { on, off, connected } = useWebSocket('/');

  useEffect(() => {
    if (!connected) return;

    const handleFinancialUpdate = (data: FinancialData) => {
      queryClient.setQueryData(financialQueryKeys.financial(period), data);
    };

    on('financial:update', handleFinancialUpdate);
    on('revenue:update', handleFinancialUpdate);

    return () => {
      off('financial:update', handleFinancialUpdate);
      off('revenue:update', handleFinancialUpdate);
    };
  }, [connected, period, on, off, queryClient]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refetch} />
      }
    >
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
                  {t('financial.revenue')}
                </Text>
                <Text variant="displaySmall" style={styles.revenue}>
                  R$ {summary.total_revenue.toFixed(2)}
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>
                  {t('financial.totalOrders')}
                </Text>
                <Text variant="displaySmall" style={{ color: colors.foreground }}>
                  {summary.total_orders}
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>
                  {t('financial.averageTicket')}
                </Text>
                <Text variant="displaySmall" style={{ color: colors.foreground }}>
                  R$ {summary.average_order_value.toFixed(2)}
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>
                  {t('tips.title')}
                </Text>
                <Text variant="displaySmall" style={styles.tips}>
                  R$ {summary.total_tips.toFixed(2)}
                </Text>
              </Card.Content>
            </Card>
          </View>

          <Card style={styles.card}>
            <Card.Title title={t('payment.paymentMethod')} titleStyle={{ color: colors.foreground }} />
            <Card.Content>
              <View style={styles.paymentMethod}>
                <Text variant="bodyMedium" style={styles.paymentMethodText}>{t('payment.creditCard')}</Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  R$ {summary.payment_methods.credit_card.toFixed(2)}
                </Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text variant="bodyMedium" style={styles.paymentMethodText}>{t('payment.debitCard')}</Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  R$ {summary.payment_methods.debit_card.toFixed(2)}
                </Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text variant="bodyMedium" style={styles.paymentMethodText}>{t('payment.cash')}</Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  R$ {summary.payment_methods.cash.toFixed(2)}
                </Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text variant="bodyMedium" style={styles.paymentMethodText}>{t('payment.pix')}</Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  R$ {summary.payment_methods.pix.toFixed(2)}
                </Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text variant="bodyMedium" style={styles.paymentMethodText}>{t('payment.wallet')}</Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  R$ {summary.payment_methods.wallet.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title={t('financial.topSellingItems')} titleStyle={{ color: colors.foreground }} />
            <Card.Content>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title textStyle={{ color: colors.foreground }}>{t('menu.items')}</DataTable.Title>
                  <DataTable.Title numeric textStyle={{ color: colors.foreground }}>{t('menu.quantity')}</DataTable.Title>
                  <DataTable.Title numeric textStyle={{ color: colors.foreground }}>{t('financial.revenue')}</DataTable.Title>
                </DataTable.Header>

                {summary.top_selling_items.slice(0, 5).map((item, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell textStyle={{ color: colors.foreground }}>{item.name}</DataTable.Cell>
                    <DataTable.Cell numeric textStyle={{ color: colors.foreground }}>{item.quantity}</DataTable.Cell>
                    <DataTable.Cell numeric textStyle={{ color: colors.foreground }}>
                      R$ {item.revenue.toFixed(2)}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        </>
      )}

      <Card style={styles.card}>
        <Card.Title title={t('wallet.transactions')} titleStyle={{ color: colors.foreground }} />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title textStyle={{ color: colors.foreground }}>{t('common.view')}</DataTable.Title>
              <DataTable.Title textStyle={{ color: colors.foreground }}>{t('payment.paymentMethod')}</DataTable.Title>
              <DataTable.Title numeric textStyle={{ color: colors.foreground }}>{t('orders.total')}</DataTable.Title>
            </DataTable.Header>

            {transactions.map((transaction) => (
              <DataTable.Row key={transaction.id}>
                <DataTable.Cell textStyle={{ color: colors.foreground }}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </DataTable.Cell>
                <DataTable.Cell textStyle={{ color: colors.foreground }}>{transaction.payment_method}</DataTable.Cell>
                <DataTable.Cell numeric textStyle={{ color: colors.foreground }}>
                  R$ {transaction.amount.toFixed(2)}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
