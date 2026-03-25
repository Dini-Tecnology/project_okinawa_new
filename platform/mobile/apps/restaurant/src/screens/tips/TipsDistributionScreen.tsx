import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, List, Divider, TextInput, IconButton } from 'react-native-paper';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { formatCurrency } from '@okinawa/shared/utils/formatters';
import { getLanguage } from '@okinawa/shared/i18n';
import { useColors } from '@/shared/theme';

interface StaffTips {
  staff_id: string;
  staff_name: string;
  role: string;
  amount: number;
  percentage?: number;
}

export default function TipsDistributionScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const [totalTips, setTotalTips] = useState(450.00);
  const [distributionMethod, setDistributionMethod] = useState<'equal' | 'role' | 'manual'>('equal');
  const [staff, setStaff] = useState<StaffTips[]>([
    { staff_id: '1', staff_name: 'João Silva', role: 'waiter', amount: 0 },
    { staff_id: '2', staff_name: 'Maria Santos', role: 'waiter', amount: 0 },
    { staff_id: '3', staff_name: 'Pedro Costa', role: 'chef', amount: 0 },
    { staff_id: '4', staff_name: 'Ana Lima', role: 'cashier', amount: 0 },
  ]);
  const [distributing, setDistributing] = useState(false);

  const calculateDistribution = () => {
    const updatedStaff = [...staff];

    if (distributionMethod === 'equal') {
      const amountPerPerson = totalTips / staff.length;
      updatedStaff.forEach(s => {
        s.amount = amountPerPerson;
        s.percentage = 100 / staff.length;
      });
    } else if (distributionMethod === 'role') {
      // Role-based distribution: Chef 30%, Waiters 50% split, Cashier 20%
      const roleWeights: Record<string, number> = {
        chef: 0.30,
        waiter: 0.50,
        cashier: 0.20,
      };

      const waiterCount = staff.filter(s => s.role === 'waiter').length;

      updatedStaff.forEach(s => {
        if (s.role === 'waiter' && waiterCount > 0) {
          s.amount = (totalTips * roleWeights.waiter) / waiterCount;
          s.percentage = (roleWeights.waiter / waiterCount) * 100;
        } else {
          s.amount = totalTips * (roleWeights[s.role] || 0);
          s.percentage = (roleWeights[s.role] || 0) * 100;
        }
      });
    }

    setStaff(updatedStaff);
  };

  const handleManualAmountChange = (staffId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    const updatedStaff = staff.map(s =>
      s.staff_id === staffId ? { ...s, amount } : s
    );
    setStaff(updatedStaff);
  };

  const handleDistribute = async () => {
    const totalDistributed = staff.reduce((sum, s) => sum + s.amount, 0);

    if (Math.abs(totalDistributed - totalTips) > 0.01) {
      Alert.alert(
        t('common.error'),
        t('tips.totalDifferent', { distributed: totalDistributed.toFixed(2), total: totalTips.toFixed(2) })
      );
      return;
    }

    try {
      setDistributing(true);

      await ApiService.distributeTips({ distributions: staff.map(s => ({ staff_id: s.staff_id, amount: s.amount })) });
      Alert.alert(t('common.success'), t('tips.distributionSuccess'));
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setDistributing(false);
    }
  };

  const totalDistributed = staff.reduce((sum, s) => sum + s.amount, 0);
  const remaining = totalTips - totalDistributed;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {t('tips.totalTips')}
          </Text>
          <Text variant="displayMedium" style={styles.totalAmount}>
            {formatCurrency(totalTips, getLanguage())}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('tips.period')}: {format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {t('tips.distributionMethod')}
          </Text>
          <View style={styles.methodButtons}>
            <Chip
              selected={distributionMethod === 'equal'}
              onPress={() => setDistributionMethod('equal')}
              style={styles.methodChip}
            >
              {t('tips.equal')}
            </Chip>
            <Chip
              selected={distributionMethod === 'role'}
              onPress={() => setDistributionMethod('role')}
              style={styles.methodChip}
            >
              {t('tips.byRole')}
            </Chip>
            <Chip
              selected={distributionMethod === 'manual'}
              onPress={() => setDistributionMethod('manual')}
              style={styles.methodChip}
            >
              {t('tips.manual')}
            </Chip>
          </View>
          {distributionMethod !== 'manual' && (
            <Button mode="outlined" onPress={calculateDistribution} style={styles.calculateButton}>
              {t('tips.calculateDistribution')}
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {t('tips.distributionByStaff')}
          </Text>
          {staff.map((person, index) => (
            <View key={person.staff_id}>
              {index > 0 && <Divider style={styles.divider} />}
              <View style={styles.staffRow}>
                <View style={styles.staffInfo}>
                  <Text variant="titleMedium">{person.staff_name}</Text>
                  <Text variant="bodySmall" style={styles.role}>
                    {t(`staff.roles.${person.role}` as any)}
                  </Text>
                </View>
                {distributionMethod === 'manual' ? (
                  <TextInput
                    mode="outlined"
                    value={person.amount.toFixed(2)}
                    onChangeText={(value) => handleManualAmountChange(person.staff_id, value)}
                    keyboardType="decimal-pad"
                    style={styles.manualInput}
                    dense
                  />
                ) : (
                  <View style={styles.amountContainer}>
                    {person.percentage && (
                      <Text variant="bodySmall" style={styles.percentage}>
                        {person.percentage.toFixed(1)}%
                      </Text>
                    )}
                    <Text variant="titleLarge" style={styles.amount}>
                      {formatCurrency(person.amount, getLanguage())}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <Text variant="titleMedium">{t('tips.totalDistributed')}:</Text>
            <Text variant="titleLarge" style={styles.distributedAmount}>
              {formatCurrency(totalDistributed, getLanguage())}
            </Text>
          </View>
          {Math.abs(remaining) > 0.01 && (
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.remainingLabel}>
                {t('tips.remaining')}:
              </Text>
              <Text variant="bodyLarge" style={[styles.remainingAmount, remaining < 0 && styles.negative]}>
                {formatCurrency(remaining, getLanguage())}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleDistribute}
          loading={distributing}
          disabled={distributing || Math.abs(remaining) > 0.01}
          style={styles.distributeButton}
          icon="cash-multiple"
        >
          {t('tips.confirmDistribution')}
        </Button>
      </View>
    </ScrollView>
  );
}

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    card: {
      margin: 16,
      marginBottom: 8,
      elevation: 2,
      backgroundColor: colors.card,
    },
    title: {
      marginBottom: 16,
      color: colors.foreground,
    },
    totalAmount: {
      color: colors.success,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      color: colors.textMuted,
    },
    methodButtons: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    methodChip: {
      flex: 1,
    },
    calculateButton: {
      marginTop: 8,
    },
    staffRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    staffInfo: {
      flex: 1,
    },
    role: {
      color: colors.textMuted,
      marginTop: 4,
    },
    amountContainer: {
      alignItems: 'flex-end',
    },
    percentage: {
      color: colors.textMuted,
      marginBottom: 4,
    },
    amount: {
      color: colors.success,
      fontWeight: 'bold',
    },
    manualInput: {
      width: 120,
      backgroundColor: colors.background,
    },
    divider: {
      marginVertical: 8,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    distributedAmount: {
      color: colors.success,
      fontWeight: 'bold',
    },
    remainingLabel: {
      color: colors.textMuted,
    },
    remainingAmount: {
      color: colors.warning,
      fontWeight: '600',
    },
    negative: {
      color: colors.error,
    },
    actions: {
      padding: 16,
    },
    distributeButton: {
      marginBottom: 16,
    },
  }), [colors]);

  const totalDistributed = staff.reduce((sum, s) => sum + s.amount, 0);
  const remaining = totalTips - totalDistributed;

  return (
