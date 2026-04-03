import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  ActivityIndicator,
  FAB,
  Chip,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/theme';
import logger from '@okinawa/shared/utils/logger';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

interface Wallet {
  id: string;
  balance: number;
  currency: string;
  is_active: boolean;
}

interface WalletTransaction {
  id: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  balance_after: number;
  description?: string;
  reference_type?: string;
  reference_id?: string;
  created_at: string;
}

export default function WalletScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const navigation = useNavigation();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [walletData, transactionsData] = await Promise.all([
        ApiService.getWallet(),
        ApiService.getWalletTransactions(),
      ]);
      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (error) {
      logger.error('Failed to load wallet data:', error);
      Alert.alert(t('common.error'), t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleAddFunds = () => {
    Alert.alert(
      t('wallet.addFunds'),
      t('wallet.choosePaymentMethod'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('payment.creditCard'),
          onPress: () => navigation.navigate('PaymentMethods' as never),
        },
        {
          text: t('payment.pix'),
          onPress: () => Alert.alert(t('payment.pix'), t('common.comingSoon')),
        },
      ]
    );
  };

  const handleWithdraw = () => {
    if (!wallet || wallet.balance <= 0) {
      Alert.alert(t('common.error'), t('wallet.insufficientBalance'));
      return;
    }

    Alert.alert(
      t('wallet.withdraw'),
      `${t('wallet.availableBalance')}: ${formatCurrency(wallet.balance)}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('wallet.requestWithdrawal'),
          onPress: () => Alert.alert(t('common.success'), t('wallet.withdrawalSubmitted')),
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `R$ ${amount.toFixed(2).replace('.', ',')}`;
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? 'plus-circle' : 'minus-circle';
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' ? colors.success : colors.error;
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType === 'all') return true;
    return transaction.transaction_type === filterType;
  });

  const styles = useMemo(() => StyleSheet.create({
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
      color: colors.foregroundSecondary,
    },
    balanceCard: {
      margin: 16,
      elevation: 4,
      backgroundColor: colors.card,
    },
    balanceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    balanceLabel: {
      color: colors.foregroundSecondary,
      marginLeft: 10,
    },
    balanceAmount: {
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 20,
    },
    balanceActions: {
      flexDirection: 'row',
      gap: 10,
    },
    actionButton: {
      flex: 1,
    },
    filtersContainer: {
      paddingHorizontal: 15,
      marginBottom: 10,
    },
    transactionsTitle: {
      marginBottom: 10,
      fontWeight: 'bold',
      color: colors.foreground,
    },
    filterChips: {
      flexDirection: 'row',
      gap: 8,
    },
    filterChip: {
      marginRight: 0,
    },
    transactionsList: {
      padding: 16,
      paddingTop: 5,
    },
    transactionCard: {
      marginBottom: 10,
      backgroundColor: colors.card,
    },
    transactionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    transactionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    transactionIcon: {
      margin: 0,
    },
    transactionInfo: {
      marginLeft: 10,
      flex: 1,
    },
    transactionDate: {
      color: colors.foregroundMuted,
      marginTop: 2,
    },
    transactionReference: {
      color: colors.foregroundSecondary,
      marginTop: 2,
    },
    transactionRight: {
      alignItems: 'flex-end',
    },
    transactionAmount: {
      fontWeight: 'bold',
    },
    balanceAfter: {
      color: colors.foregroundMuted,
      marginTop: 4,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 100,
    },
    emptyTitle: {
      marginTop: 20,
      textAlign: 'center',
      color: colors.foreground,
    },
    emptyText: {
      marginTop: 10,
      color: colors.foregroundSecondary,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
  }), [colors]);

  if (loading) {
    return (
      <ScreenContainer>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
    <View style={styles.container} accessibilityLabel="Wallet">
      {/* Wallet Balance Card */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <View style={styles.balanceHeader}>
            <IconButton icon="wallet" size={40} iconColor={colors.primary} />
            <Text variant="titleSmall" style={styles.balanceLabel}>
              {t('wallet.availableBalance')}
            </Text>
          </View>
          <Text variant="displaySmall" style={styles.balanceAmount}>
            {wallet ? formatCurrency(wallet.balance) : 'R$ 0,00'}
          </Text>
          <View style={styles.balanceActions}>
            <Button
              mode="contained"
              icon="plus"
              onPress={handleAddFunds}
              style={styles.actionButton}
              buttonColor={colors.primary}
            >
              {t('wallet.addFunds')}
            </Button>
            <Button
              mode="outlined"
              icon="bank-transfer"
              onPress={handleWithdraw}
              style={styles.actionButton}
              textColor={colors.primary}
            >
              {t('wallet.withdraw')}
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Transaction Filters */}
      <View style={styles.filtersContainer}>
        <Text variant="titleMedium" style={styles.transactionsTitle}>
          {t('wallet.transactionHistory')}
        </Text>
        <View style={styles.filterChips}>
          <Chip
            selected={filterType === 'all'}
            onPress={() => setFilterType('all')}
            style={styles.filterChip}
            showSelectedCheck={false}
          >
            {t('common.all')}
          </Chip>
          <Chip
            selected={filterType === 'credit'}
            onPress={() => setFilterType('credit')}
            style={styles.filterChip}
            showSelectedCheck={false}
          >
            {t('wallet.income')}
          </Chip>
          <Chip
            selected={filterType === 'debit'}
            onPress={() => setFilterType('debit')}
            style={styles.filterChip}
            showSelectedCheck={false}
          >
            {t('wallet.expense')}
          </Chip>
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.transactionsList}
        getItemLayout={(_, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="history" size={80} iconColor={colors.foregroundMuted} />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              {t('wallet.noTransactions')}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {t('wallet.transactionsWillAppear')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.transactionCard}>
            <Card.Content>
              <View style={styles.transactionRow}>
                <View style={styles.transactionLeft}>
                  <IconButton
                    icon={getTransactionIcon(item.transaction_type)}
                    size={24}
                    iconColor={getTransactionColor(item.transaction_type)}
                    style={styles.transactionIcon}
                  />
                  <View style={styles.transactionInfo}>
                    <Text variant="titleMedium" style={{ color: colors.foreground }}>
                      {item.description || t('wallet.transaction')}
                    </Text>
                    <Text variant="bodySmall" style={styles.transactionDate}>
                      {format(new Date(item.created_at), 'MMM d, yyyy • HH:mm')}
                    </Text>
                    {item.reference_type && (
                      <Text variant="bodySmall" style={styles.transactionReference}>
                        {item.reference_type} #{item.reference_id?.substring(0, 8)}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(item.transaction_type) },
                    ]}
                  >
                    {item.transaction_type === 'credit' ? '+' : '-'}
                    {formatCurrency(item.amount)}
                  </Text>
                  <Text variant="bodySmall" style={styles.balanceAfter}>
                    {t('wallet.balance')}: {formatCurrency(item.balance_after)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  
    </ScreenContainer>
  );
}
