import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Camera } from 'lucide-react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { supabaseApiAdapter } from '@okinawa/shared/services/supabase-api';
import { V2Shell } from './shared/V2Shell';
import { V2FormField } from './shared/V2FormField';

interface ProfileForm {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
}

const EMPTY_FORM: ProfileForm = { name: '', cnpj: '', address: '', phone: '', email: '' };

export default function RestaurantProfileScreen() {
  const colors = useColors();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
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
        const address = typeof data.address === 'string'
          ? data.address
          : data.address
            ? `${data.address.street ?? ''}, ${data.address.city ?? ''} - ${data.address.state ?? ''}`.trim().replace(/^,\s*/, '')
            : '';
        setForm({
          name: data.name ?? '',
          cnpj: data.cnpj ?? '',
          address,
          phone: data.phone ?? '',
          email: data.email ?? '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const update = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!restaurantId) return;
    setSaving(true);
    setError(null);
    try {
      await supabaseApiAdapter.updateRestaurantProfile(restaurantId, {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <V2Shell title="Dados do Restaurante" subtitle="Informações cadastrais" showBack>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={[styles.logoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.logoPlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
              <Camera size={24} color={colors.foregroundSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: colors.foreground }}>Logo do restaurante</Text>
              <Text style={{ fontSize: 12, color: colors.foregroundSecondary, marginTop: 2 }}>
                Toque para alterar a imagem
              </Text>
            </View>
          </View>

          <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <V2FormField label="Nome" value={form.name} onChangeText={(v) => update('name', v)} />
            <V2FormField
              label="CNPJ"
              value={form.cnpj}
              onChangeText={(v) => update('cnpj', v)}
              keyboardType="numeric"
            />
            <V2FormField label="Endereço" value={form.address} onChangeText={(v) => update('address', v)} />
            <V2FormField
              label="Telefone"
              value={form.phone}
              onChangeText={(v) => update('phone', v)}
              keyboardType="phone-pad"
            />
            <V2FormField
              label="E-mail"
              value={form.email}
              onChangeText={(v) => update('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
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
              {saving ? 'Salvando…' : 'Salvar'}
            </Text>
          </TouchableOpacity>

          {saved && (
            <Text style={{ textAlign: 'center', color: '#22C55E', marginTop: 12, fontWeight: '600' }}>
              Perfil atualizado com sucesso
            </Text>
          )}
        </>
      )}
    </V2Shell>
  );
}

const styles = StyleSheet.create({
  logoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
