import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { TrendingUp, CreditCard } from 'lucide-react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { V2Shell } from './shared/V2Shell';

export default function FinancialScreen() {
  const colors = useColors();

  return (
    <V2Shell title="Financeiro" subtitle="Visão geral" showBack>
      <View style={styles.hero}>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Faturamento Hoje</Text>
        <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '700' }}>R$ 12.450,00</Text>
        <View style={styles.trend}>
          <TrendingUp size={16} color="#FFF" />
          <Text style={{ color: '#FFF', fontSize: 13 }}>+18% vs ontem</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {[
          { label: 'Receita Mês', value: 'R$ 89.2K', icon: CreditCard },
          { label: 'Ticket Médio', value: 'R$ 78,50', icon: TrendingUp },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <View key={stat.label} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon size={18} color={colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginTop: 8 }}>{stat.value}</Text>
              <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>{stat.label}</Text>
            </View>
          );
        })}
      </View>
    </V2Shell>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#22C55E', borderRadius: 16, padding: 20, marginBottom: 16 },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  grid: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 16 },
});
