import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Camera } from 'lucide-react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { V2Shell } from './shared/V2Shell';
import { V2FormField } from './shared/V2FormField';
import { RESTAURANT_PROFILE } from './shared/v2Mocks';

export default function RestaurantProfileScreen() {
  const colors = useColors();
  const [profile, setProfile] = useState(RESTAURANT_PROFILE);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
  };

  return (
    <V2Shell title="Dados do Restaurante" subtitle="Informações cadastrais" showBack>
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
        <V2FormField
          label="Nome"
          value={profile.name}
          onChangeText={(v) => update('name', v)}
        />
        <V2FormField
          label="CNPJ"
          value={profile.cnpj}
          onChangeText={(v) => update('cnpj', v)}
          keyboardType="numeric"
        />
        <V2FormField
          label="Endereço"
          value={profile.address}
          onChangeText={(v) => update('address', v)}
        />
        <V2FormField
          label="Telefone"
          value={profile.phone}
          onChangeText={(v) => update('phone', v)}
          keyboardType="phone-pad"
        />
        <V2FormField
          label="E-mail"
          value={profile.email}
          onChangeText={(v) => update('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Salvar</Text>
      </TouchableOpacity>

      {saved && (
        <Text style={{ textAlign: 'center', color: '#22C55E', marginTop: 12, fontWeight: '600' }}>
          Alterações salvas localmente
        </Text>
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
