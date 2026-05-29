import React, { useState } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { CreditCard } from 'lucide-react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { V2Shell } from './shared/V2Shell';
import { V2FormField } from './shared/V2FormField';
import { PAYMENT_METHODS } from './shared/v2Mocks';
import type { PaymentMethods } from './shared/v2Types';

const METHOD_ITEMS: { key: keyof Pick<PaymentMethods, 'pix' | 'creditCard' | 'debitCard' | 'cash'>; label: string }[] = [
  { key: 'pix', label: 'Pix' },
  { key: 'creditCard', label: 'Cartão de crédito' },
  { key: 'debitCard', label: 'Cartão de débito' },
  { key: 'cash', label: 'Dinheiro' },
];

export default function PaymentSettingsScreen() {
  const colors = useColors();
  const [methods, setMethods] = useState<PaymentMethods>(PAYMENT_METHODS);

  const toggle = (key: keyof Pick<PaymentMethods, 'pix' | 'creditCard' | 'debitCard' | 'cash'>) => {
    setMethods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <V2Shell title="Pagamentos" subtitle="Métodos aceitos" showBack>
      <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {METHOD_ITEMS.map((item, index) => (
          <View
            key={item.key}
            style={[
              styles.row,
              index < METHOD_ITEMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
              <CreditCard size={18} color={colors.primary} />
            </View>
            <Text style={{ flex: 1, fontWeight: '600', color: colors.foreground }}>{item.label}</Text>
            <Switch
              value={methods[item.key]}
              onValueChange={() => toggle(item.key)}
              trackColor={{ false: colors.border, true: `${colors.primary}80` }}
              thumbColor={methods[item.key] ? colors.primary : colors.foregroundSecondary}
            />
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Taxas e Pix</Text>
      <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <V2FormField
          label="Chave Pix"
          value={methods.pixKey}
          onChangeText={(pixKey) => setMethods((prev) => ({ ...prev, pixKey }))}
          autoCapitalize="none"
        />
        <V2FormField
          label="Taxa de serviço (%)"
          value={String(methods.feePercent)}
          onChangeText={(v) => setMethods((prev) => ({ ...prev, feePercent: parseFloat(v) || 0 }))}
          keyboardType="decimal-pad"
        />
      </View>
    </V2Shell>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  form: { borderRadius: 16, borderWidth: 1, padding: 16 },
});
