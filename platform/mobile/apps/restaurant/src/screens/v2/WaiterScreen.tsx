import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Bell, CreditCard, Plus } from 'lucide-react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { V2Shell } from './shared/V2Shell';
import { WAITER_TABLES } from './shared/v2Mocks';

export default function WaiterScreen() {
  const colors = useColors();

  return (
    <V2Shell title="Garçom" subtitle="Mesas e chamados" showBack>
      {WAITER_TABLES.map((table) => {
        const tone =
          table.status === 'needs_attention'
            ? { bg: '#FEE2E2', border: '#EF4444', icon: Bell, iconBg: '#EF4444' }
            : table.status === 'payment'
              ? { bg: '#EDE9FE', border: '#8B5CF6', icon: CreditCard, iconBg: '#8B5CF6' }
              : { bg: `${colors.primary}15`, border: colors.primary, icon: Plus, iconBg: colors.primary };
        const Icon = tone.icon;
        return (
          <View key={table.id} style={[styles.card, { backgroundColor: tone.bg, borderColor: tone.border }]}>
            <View>
              <Text style={{ fontWeight: '700', fontSize: 18, color: colors.foreground }}>Mesa {table.id}</Text>
              <Text style={{ color: colors.foregroundSecondary }}>{table.message}</Text>
            </View>
            <View style={[styles.iconWrap, { backgroundColor: tone.iconBg }]}>
              <Icon size={20} color="#FFF" />
            </View>
          </View>
        );
      })}
    </V2Shell>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 12 },
  iconWrap: { padding: 12, borderRadius: 12 },
});
