import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';
import {
  MOCK_WALLET,
  MOCK_WALLET_QUICK_ACTIONS,
  MOCK_PAYMENT_METHODS,
  MOCK_WALLET_TRANSACTIONS,
} from '../../constants/walletTabMocks';

function formatCurrency(value: number, hidden = false): string {
  if (hidden) return '••••••';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

/** Aba Carteira — Minha Carteira (mock) */
export default function WalletScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const [balanceVisible, setBalanceVisible] = useState(true);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scrollContent: {
          paddingBottom: 24,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 28,
          gap: 8,
        },
        backRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          minWidth: 72,
        },
        backText: {
          fontSize: 15,
          color: colors.foregroundSecondary,
        },
        headerTitle: {
          flex: 1,
          textAlign: 'center',
          fontSize: 18,
          fontWeight: '700',
          color: colors.foreground,
        },
        headerSpacer: {
          minWidth: 72,
        },
        balanceCard: {
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 20,
          padding: 18,
          overflow: 'hidden',
        },
        balanceTop: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        },
        balanceLabel: {
          color: 'rgba(255,255,255,0.9)',
          fontSize: 14,
        },
        balanceValue: {
          color: '#FFFFFF',
          fontSize: 36,
          fontWeight: '700',
          letterSpacing: -0.5,
          marginBottom: 16,
        },
        statsRow: {
          flexDirection: 'row',
          gap: 8,
        },
        statBox: {
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 8,
          alignItems: 'center',
        },
        statValue: {
          color: '#FFFFFF',
          fontSize: 15,
          fontWeight: '700',
          marginBottom: 2,
        },
        statLabel: {
          color: 'rgba(255,255,255,0.85)',
          fontSize: 11,
        },
        quickActions: {
          flexDirection: 'row',
          paddingHorizontal: 16,
          gap: 10,
          marginBottom: 24,
        },
        quickAction: {
          flex: 1,
          alignItems: 'center',
          paddingVertical: 14,
          borderRadius: 14,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        quickLabel: {
          marginTop: 8,
          fontSize: 11,
          fontWeight: '500',
          color: colors.foregroundSecondary,
          textAlign: 'center',
        },
        sectionHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: 12,
        },
        sectionTitle: {
          fontSize: 17,
          fontWeight: '700',
          color: colors.foreground,
        },
        addLink: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.primary,
        },
        paymentCard: {
          marginHorizontal: 16,
          marginBottom: 24,
          borderRadius: 16,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        paymentRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 14,
          gap: 12,
        },
        paymentDivider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
          marginLeft: 56,
        },
        paymentIcon: {
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: colors.backgroundTertiary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        paymentInfo: {
          flex: 1,
        },
        paymentLabel: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: 2,
        },
        paymentSub: {
          fontSize: 13,
          color: colors.foregroundSecondary,
        },
        defaultBadge: {
          backgroundColor: '#FFF3EE',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 8,
        },
        defaultBadgeText: {
          fontSize: 11,
          fontWeight: '600',
          color: colors.primary,
        },
        txSection: {
          paddingHorizontal: 16,
        },
        txRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingVertical: 14,
          gap: 12,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        txIcon: {
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: colors.backgroundTertiary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        txInfo: {
          flex: 1,
        },
        txTitle: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: 4,
        },
        txSub: {
          fontSize: 13,
          color: colors.foregroundSecondary,
        },
        txRight: {
          alignItems: 'flex-end',
        },
        txAmount: {
          fontSize: 15,
          fontWeight: '700',
          color: colors.foreground,
        },
        txAmountPositive: {
          color: '#22C55E',
        },
        txCashback: {
          fontSize: 12,
          color: '#22C55E',
          marginTop: 4,
        },
      }),
    [colors],
  );

  const goProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const onQuickAction = useCallback((id: string) => {
    Alert.alert('Em breve', `Ação "${id}" disponível em breve.`);
  }, []);

  const onAddPayment = useCallback(() => {
    Alert.alert('Adicionar', 'Cadastro de método de pagamento em breve.');
  }, []);

  return (
    <ScreenContainer edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backRow}
            onPress={goProfile}
            accessibilityRole="button"
            accessibilityLabel="Voltar ao perfil"
          >
            <Ionicons name="arrow-back" size={20} color={colors.foregroundSecondary} />
            <Text style={styles.backText}>Perfil</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Minha Carteira</Text>
          <View style={styles.headerSpacer} />
        </View>

        <LinearGradient
          colors={[colors.primary, '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <TouchableOpacity
              onPress={() => setBalanceVisible((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={balanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
            >
              <Ionicons
                name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceValue}>
            {formatCurrency(MOCK_WALLET.balance, !balanceVisible)}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {balanceVisible ? formatCurrency(MOCK_WALLET.cashback) : '•••'}
              </Text>
              <Text style={styles.statLabel}>Cashback</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {balanceVisible ? String(MOCK_WALLET.points) : '•••'}
              </Text>
              <Text style={styles.statLabel}>Pontos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {balanceVisible ? formatCurrency(MOCK_WALLET.credits) : '•••'}
              </Text>
              <Text style={styles.statLabel}>Créditos</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.quickActions}>
          {MOCK_WALLET_QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickAction}
              onPress={() => onQuickAction(action.id)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Ionicons name={action.icon as any} size={24} color={action.color} />
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Métodos de Pagamento</Text>
          <TouchableOpacity onPress={onAddPayment} accessibilityRole="button">
            <Text style={styles.addLink}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.paymentCard}>
          {MOCK_PAYMENT_METHODS.map((method, index) => (
            <View key={method.id}>
              {index > 0 && <View style={styles.paymentDivider} />}
              <View style={styles.paymentRow}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="card-outline" size={22} color={colors.foregroundMuted} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentLabel}>{method.label}</Text>
                  <Text style={styles.paymentSub}>{method.sublabel}</Text>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Padrão</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas Transações</Text>
        </View>
        <View style={styles.txSection}>
          {MOCK_WALLET_TRANSACTIONS.map((tx, index) => (
            <View
              key={tx.id}
              style={[
                styles.txRow,
                index === MOCK_WALLET_TRANSACTIONS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.txIcon}>
                <Ionicons
                  name={tx.icon === 'gift' ? 'gift-outline' : 'receipt-outline'}
                  size={22}
                  color={colors.foregroundMuted}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txSub}>{tx.subtitle}</Text>
              </View>
              <View style={styles.txRight}>
                <Text
                  style={[
                    styles.txAmount,
                    tx.amountColor === 'positive' && styles.txAmountPositive,
                  ]}
                >
                  {tx.amount}
                </Text>
                {tx.cashbackNote && (
                  <Text style={styles.txCashback}>{tx.cashbackNote}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
