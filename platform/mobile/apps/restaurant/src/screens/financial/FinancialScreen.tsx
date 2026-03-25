/**
 * FinancialScreen - Restaurant Financial Dashboard
 * 
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, SegmentedButtons, DataTable } from 'react-native-paper';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { formatCurrency } from '@okinawa/shared/utils/formatters';
import { getLanguage } from '@okinawa/shared/i18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
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

export default function FinancialScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const [period, setPeriod] = useState('today');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    loadFinancialData();
  }, [period]);

  const getDateRange = () => {
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
  };

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const [summaryResponse, transactionsResponse] = await Promise.all([
        ApiService.getFinancialSummary({
          params: {
            start_date: start.toISOString(),
            end_date: end.toISOString(),
          },
        }),
        ApiService.getFinancialReport({
          params: {
            start_date: start.toISOString(),
            end_date: end.toISOString(),
            limit: 20,
          },
        }),
      ]);

      setSummary(summaryResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFinancialData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
                  {formatCurrency(summary.total_revenue, getLanguage())}
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
                  {formatCurrency(summary.average_order_value, getLanguage())}
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.cardLabel}>
                  {t('tips.title')}
                </Text>
                <Text variant="displaySmall" style={styles.tips}>
                  {formatCurrency(summary.total_tips, getLanguage())}
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
                  {formatCurrency(summary.payment_methods.credit_card, getLanguage())}
                </Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text variant="bodyMedium" style={styles.paymentMethodText}>{t('payment.debitCard')}</Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  {formatCurrency(summary.payment_methods.debit_card, getLanguage())}
                </Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text variant="bodyMedium" style={styles.paymentMethodText}>{t('payment.cash')}</Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  {formatCurrency(summary.payment_methods.cash, getLanguage())}
                </Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text variant="bodyMedium" style={styles.paymentMethodText}>{t('payment.pix')}</Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  {formatCurrency(summary.payment_methods.pix, getLanguage())}
                </Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text variant="bodyMedium" style={styles.paymentMethodText}>{t('payment.wallet')}</Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  {formatCurrency(summary.payment_methods.wallet, getLanguage())}
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
                      {formatCurrency(item.revenue, getLanguage())}
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
                  {formatCurrency(transaction.amount, getLanguage())}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
