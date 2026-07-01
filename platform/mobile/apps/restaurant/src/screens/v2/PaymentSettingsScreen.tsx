import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { CreditCard } from 'lucide-react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { supabaseApiAdapter } from '@okinawa/shared/services/supabase-api';
import { V2Shell } from './shared/V2Shell';
import { V2FormField } from './shared/V2FormField';
import type { PaymentMethods } from './shared/v2Types';

const METHOD_ITEMS: { key: keyof Pick<PaymentMethods, 'pix' | 'creditCard' | 'debitCard' | 'cash'>; label: string }[] = [
  { key: 'pix', label: 'Pix' },
  { key: 'creditCard', label: 'Cartão de crédito' },
  { key: 'debitCard', label: 'Cartão de débito' },
  { key: 'cash', label: 'Dinheiro' },
];

const DEFAULT_METHODS: PaymentMethods = {
  pix: true,
  creditCard: true,
  debitCard: true,
  cash: true,
  pixKey: '',
  feePercent: 0,
};

export default function PaymentSettingsScreen() {
  const colors = useColors();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [methods, setMethods] = useState<PaymentMethods>(DEFAULT_METHODS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await supabaseApiAdapter.getRestaurantProfile();
      if (data) {
        setRestaurantId(data.id ?? null);
        const stored = data.settings?.payment_methods;
        if (stored && typeof stored === 'object') {
          setMethods({ ...DEFAULT_METHODS, ...stored } as PaymentMethods);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggle = (key: keyof Pick<PaymentMethods, 'pix' | 'creditCard' | 'debitCard' | 'cash'>) => {
    setMethods((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!restaurantId) return;
    setSaving(true);
    setError(null);
    try {
      const data = await supabaseApiAdapter.getRestaurantProfile();
      const currentSettings = data?.settings ?? {};
      await supabaseApiAdapter.updateRestaurantProfile(restaurantId, {
        settings: { ...currentSettings, payment_methods: methods },
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <V2Shell title="Pagamentos" subtitle="Métodos aceitos" showBack>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
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
              onChangeText={(pixKey) => { setMethods((prev) => ({ ...prev, pixKey })); setSaved(false); }}
              autoCapitalize="none"
            />
            <V2FormField
              label="Taxa de serviço (%)"
              value={String(methods.feePercent)}
              onChangeText={(v) => { setMethods((prev) => ({ ...prev, feePercent: parseFloat(v) || 0 })); setSaved(false); }}
              keyboardType="decimal-pad"
            />
          </View>

          {error && (
            <Text style={{ textAlign: 'center', color: '#EF4444', marginBottom: 8 }}>{error}</Text>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
            onPress={() => void handleSave()}
            disabled={saving || !restaurantId}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>
              {saving ? 'Salvando…' : 'Salvar configurações'}
            </Text>
          </TouchableOpacity>

          {saved && (
            <Text style={{ textAlign: 'center', color: '#22C55E', marginTop: 12, fontWeight: '600' }}>
              Configurações salvas
            </Text>
          )}
        </>
      )}
    </V2Shell>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  form: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  saveBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
});
