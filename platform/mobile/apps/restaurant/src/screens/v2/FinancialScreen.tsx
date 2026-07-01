import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { TrendingUp, TrendingDown, CreditCard, DollarSign, BarChart2 } from 'lucide-react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { supabaseApiAdapter } from '@okinawa/shared/services/supabase-api';
import { V2Shell } from './shared/V2Shell';

interface FinancialSummary {
  revenue_today?: number;
  revenue_week?: number;
  revenue_month?: number;
  orders_today?: number;
  avg_ticket?: number;
  tips_today?: number;
  total_transactions?: number;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type?: string;
  payment_method?: string;
  description?: string;
  created_at: string;
  order_id?: string;
}

type Period = 'today' | 'week' | 'month';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'week', label: '7 dias' },
  { key: 'month', label: '30 dias' },
];

function fmt(value?: number): string {
  if (value == null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function periodDates(period: Period): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  if (period === 'week') from.setDate(to.getDate() - 7);
  else if (period === 'month') from.setDate(to.getDate() - 30);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

function txIcon(type?: string) {
  if (type === 'tip') return { icon: DollarSign, color: '#22C55E' };
  if (type === 'refund') return { icon: TrendingDown, color: '#EF4444' };
  return { icon: CreditCard, color: '#6366F1' };
}

export default function FinancialScreen() {
  const colors = useColors();
  const [period, setPeriod] = useState<Period>('today');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (p: Period) => {
    try {
      setError(null);
      const { from, to } = periodDates(p);
      const [summaryData, txData] = await Promise.all([
        supabaseApiAdapter.getFinancialSummary(undefined, from, to),
        supabaseApiAdapter.getTransactions(undefined, from, to, 20),
      ]);
      setSummary(summaryData ?? null);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar financeiro');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(period); }, [load, period]);

  const onRefresh = () => { setRefreshing(true); void load(period); };

  const revenue = period === 'today'
    ? summary?.revenue_today
    : period === 'week' ? summary?.revenue_week : summary?.revenue_month;

  return (
    <V2Shell title="Financeiro" subtitle="Visão geral" showBack>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.periodChip,
                period === p.key
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
              ]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: period === p.key ? '#FFF' : colors.foreground }}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && (
          <Text style={{ textAlign: 'center', color: colors.foregroundSecondary, marginTop: 24 }}>
            Carregando financeiro…
          </Text>
        )}
        {error && (
          <Text style={{ textAlign: 'center', color: '#EF4444', marginTop: 24 }}>{error}</Text>
        )}

        {!loading && !error && (
          <>
            {/* Revenue hero */}
            <View style={[styles.hero, { backgroundColor: colors.primary }]}>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                Faturamento {PERIODS.find((p) => p.key === period)?.label}
              </Text>
              <Text style={{ color: '#FFF', fontSize: 30, fontWeight: '800', marginTop: 4 }}>
                {fmt(revenue)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <TrendingUp size={15} color="rgba(255,255,255,0.85)" />
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                  {summary?.orders_today ?? 0} pedidos · ticket médio {fmt(summary?.avg_ticket)}
                </Text>
              </View>
            </View>

            {/* Stat grid */}
            <View style={styles.grid}>
              {[
                { label: 'Gorjetas', value: fmt(summary?.tips_today), icon: DollarSign, color: '#22C55E' },
                { label: 'Transações', value: String(summary?.total_transactions ?? transactions.length), icon: BarChart2, color: '#6366F1' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Icon size={18} color={stat.color} />
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.foreground, marginTop: 8 }}>
                      {stat.value}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>{stat.label}</Text>
                  </View>
                );
              })}
            </View>

            {/* Transactions */}
            {transactions.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Últimas transações
                </Text>
                <View style={[styles.txList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {transactions.map((tx, index) => {
                    const { icon: Icon, color } = txIcon(tx.transaction_type);
                    const isNeg = tx.transaction_type === 'refund';
                    return (
                      <View
                        key={tx.id}
                        style={[
                          styles.txRow,
                          index < transactions.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        ]}
                      >
                        <View style={[styles.txIcon, { backgroundColor: `${color}15` }]}>
                          <Icon size={16} color={color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '600', color: colors.foreground, fontSize: 14 }}>
                            {tx.description ?? (tx.payment_method ?? 'Transação')}
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>
                            {new Date(tx.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        <Text style={{ fontWeight: '700', fontSize: 15, color: isNeg ? '#EF4444' : '#22C55E' }}>
                          {isNeg ? '-' : '+'}{fmt(Math.abs(tx.amount))}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {transactions.length === 0 && (
              <Text style={{ textAlign: 'center', color: colors.foregroundSecondary, marginTop: 20 }}>
                Nenhuma transação no período.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </V2Shell>
  );
}

const styles = StyleSheet.create({
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  hero: { borderRadius: 16, padding: 20, marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  txList: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
