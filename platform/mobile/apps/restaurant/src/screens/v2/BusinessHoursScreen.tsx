import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { supabaseApiAdapter } from '@okinawa/shared/services/supabase-api';
import { V2Shell } from './shared/V2Shell';
import { V2FormField } from './shared/V2FormField';
import type { BusinessHour } from './shared/v2Types';

const DEFAULT_HOURS: BusinessHour[] = [
  { day: 'Segunda', open: true, start: '11:00', end: '23:00' },
  { day: 'Terça', open: true, start: '11:00', end: '23:00' },
  { day: 'Quarta', open: true, start: '11:00', end: '23:00' },
  { day: 'Quinta', open: true, start: '11:00', end: '23:00' },
  { day: 'Sexta', open: true, start: '11:00', end: '00:00' },
  { day: 'Sábado', open: true, start: '12:00', end: '00:00' },
  { day: 'Domingo', open: false, start: '12:00', end: '22:00' },
];

export default function BusinessHoursScreen() {
  const colors = useColors();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [hours, setHours] = useState<BusinessHour[]>(DEFAULT_HOURS);
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
        if (data.business_hours && Array.isArray(data.business_hours)) {
          setHours(data.business_hours as BusinessHour[]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar horários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateHour = (index: number, patch: Partial<BusinessHour>) => {
    setHours((prev) => prev.map((h, i) => (i === index ? { ...h, ...patch } : h)));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!restaurantId) return;
    setSaving(true);
    setError(null);
    try {
      await supabaseApiAdapter.updateRestaurantProfile(restaurantId, {
        business_hours: hours,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar horários');
    } finally {
      setSaving(false);
    }
  };

  return (
    <V2Shell title="Horário de Funcionamento" subtitle="Segunda a domingo" showBack>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {hours.map((day, index) => (
              <View
                key={day.day}
                style={[
                  styles.row,
                  index < hours.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.dayCol}>
                  <Text style={{ fontWeight: '600', color: colors.foreground }}>{day.day}</Text>
                  <View style={styles.switchRow}>
                    <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>
                      {day.open ? 'Aberto' : 'Fechado'}
                    </Text>
                    <Switch
                      value={day.open}
                      onValueChange={(open) => updateHour(index, { open })}
                      trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                      thumbColor={day.open ? colors.primary : colors.foregroundSecondary}
                    />
                  </View>
                </View>
                {day.open && (
                  <View style={styles.timeRow}>
                    <V2FormField
                      label="Início"
                      value={day.start}
                      onChangeText={(start) => updateHour(index, { start })}
                      style={styles.timeInput}
                    />
                    <V2FormField
                      label="Fim"
                      value={day.end}
                      onChangeText={(end) => updateHour(index, { end })}
                      style={styles.timeInput}
                    />
                  </View>
                )}
              </View>
            ))}
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
              {saving ? 'Salvando…' : 'Salvar horários'}
            </Text>
          </TouchableOpacity>

          {saved && (
            <Text style={{ textAlign: 'center', color: '#22C55E', marginTop: 12, fontWeight: '600' }}>
              Horários atualizados
            </Text>
          )}
        </>
      )}
    </V2Shell>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  row: { padding: 16 },
  dayCol: { marginBottom: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  timeRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  timeInput: { paddingVertical: 6, fontSize: 14 },
  saveBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
});
