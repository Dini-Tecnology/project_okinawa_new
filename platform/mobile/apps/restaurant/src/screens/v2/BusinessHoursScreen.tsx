import React, { useState } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { V2Shell } from './shared/V2Shell';
import { V2FormField } from './shared/V2FormField';
import { BUSINESS_HOURS } from './shared/v2Mocks';
import type { BusinessHour } from './shared/v2Types';

export default function BusinessHoursScreen() {
  const colors = useColors();
  const [hours, setHours] = useState<BusinessHour[]>(BUSINESS_HOURS);

  const updateHour = (index: number, patch: Partial<BusinessHour>) => {
    setHours((prev) => prev.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  };

  return (
    <V2Shell title="Horário de Funcionamento" subtitle="Segunda a domingo" showBack>
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
    </V2Shell>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { padding: 16 },
  dayCol: { marginBottom: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  timeRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  timeInput: { paddingVertical: 6, fontSize: 14 },
});
