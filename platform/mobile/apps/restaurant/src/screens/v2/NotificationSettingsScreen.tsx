import React, { useState } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Bell } from 'lucide-react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { V2Shell } from './shared/V2Shell';
import { NOTIFICATION_PREFS } from './shared/v2Mocks';
import type { NotificationPrefs } from './shared/v2Types';

const PREF_ITEMS: { key: keyof NotificationPrefs; label: string; subtitle: string }[] = [
  { key: 'newOrders', label: 'Novos pedidos', subtitle: 'Alerta quando um pedido chegar' },
  { key: 'kitchen', label: 'Cozinha', subtitle: 'Atualizações do KDS e preparo' },
  { key: 'reservations', label: 'Reservas', subtitle: 'Confirmações e cancelamentos' },
  { key: 'payments', label: 'Pagamentos', subtitle: 'Transações e cobranças' },
  { key: 'sound', label: 'Som', subtitle: 'Reproduzir alerta sonoro' },
];

export default function NotificationSettingsScreen() {
  const colors = useColors();
  const [prefs, setPrefs] = useState<NotificationPrefs>(NOTIFICATION_PREFS);

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <V2Shell title="Notificações" subtitle="Alertas e avisos" showBack>
      <View style={[styles.infoCard, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}>
        <Bell size={18} color={colors.primary} />
        <Text style={{ flex: 1, fontSize: 13, color: colors.foreground, marginLeft: 10 }}>
          Configure quais eventos geram notificações push e sonoras no app.
        </Text>
      </View>

      <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {PREF_ITEMS.map((item, index) => (
          <View
            key={item.key}
            style={[
              styles.row,
              index < PREF_ITEMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: colors.foreground }}>{item.label}</Text>
              <Text style={{ fontSize: 12, color: colors.foregroundSecondary, marginTop: 2 }}>{item.subtitle}</Text>
            </View>
            <Switch
              value={prefs[item.key]}
              onValueChange={() => toggle(item.key)}
              trackColor={{ false: colors.border, true: `${colors.primary}80` }}
              thumbColor={prefs[item.key] ? colors.primary : colors.foregroundSecondary}
            />
          </View>
        ))}
      </View>
    </V2Shell>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  list: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
});
