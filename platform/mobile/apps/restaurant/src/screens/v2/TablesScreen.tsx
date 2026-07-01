import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { QrCode, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import ApiService from '@okinawa/shared/services/api';
import { V2Shell } from './shared/V2Shell';
import { useRestaurantTables } from './shared/useRestaurantOperations';

export default function TablesScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: tables, loading, error, refresh } = useRestaurantTables();
  const selectedTable = tables.find((table) => table.id === selected);

  const statusBg = (status: string) => {
    if (status === 'occupied') return `${colors.primary}15`;
    if (status === 'reserved') return '#8B5CF615';
    if (status === 'cleaning') return '#F59E0B15';
    if (status === 'payment') return '#0EA5E915';
    if (status === 'blocked') return '#EF444415';
    return '#22C55E15';
  };

  const updateSelectedStatus = async (status: string) => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await ApiService.updateTableStatus(selected, status);
      await refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <V2Shell
      title="Mapa de Mesas"
      headerRight={
        <Pressable onPress={() => navigation.navigate('QRBatch')} style={[styles.qrBtn, { backgroundColor: `${colors.primary}15` }]}>
          <QrCode size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>QR</Text>
        </Pressable>
      }
    >
      <View style={styles.legend}>
        <Legend dotColor={colors.primary} label="Ocupada" muted={colors.foregroundSecondary} />
        <Legend dotColor="#8B5CF6" label="Reservada" muted={colors.foregroundSecondary} />
        <Legend dotColor="#22C55E" label="Livre" muted={colors.foregroundSecondary} />
        <Legend dotColor="#F59E0B" label="Limpeza" muted={colors.foregroundSecondary} />
        <Legend dotColor={colors.primary} label="Selecionada" muted={colors.foregroundSecondary} ring />
      </View>

      {loading ? (
        <StateCard message="Carregando mesas..." />
      ) : error ? (
        <StateCard message={error} actionLabel="Tentar novamente" onAction={refresh} />
      ) : tables.length === 0 ? (
        <StateCard message="Nenhuma mesa cadastrada." />
      ) : null}

      <View style={styles.grid}>
        {tables.map((table) => {
          const isSelected = selected === table.id;
          return (
            <Pressable
              key={table.id}
              onPress={() => setSelected(isSelected ? null : table.id)}
              style={({ pressed }) => [
                styles.cellOuter,
                isSelected && styles.cellOuterSelected,
                pressed && styles.cellPressed,
              ]}
            >
              <View
                style={[
                  styles.cell,
                  {
                    backgroundColor: statusBg(table.status),
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 3 : 1,
                  },
                ]}
              >
                {isSelected && (
                  <CheckCircle size={16} color={colors.primary} style={styles.checkIcon} />
                )}
                {table.hasQR && <QrCode size={12} color={colors.foregroundSecondary} style={styles.qrIcon} />}
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground }}>{table.label}</Text>
                <Text style={{ fontSize: 11, color: colors.foregroundSecondary }}>{table.section}</Text>
                {table.status === 'occupied' && (
                  <Text style={{ fontSize: 10, color: colors.foregroundSecondary, marginTop: 4 }}>{table.guests} · {table.time}</Text>
                )}
                {table.status === 'reserved' && (
                  <Text style={{ fontSize: 10, color: colors.foregroundSecondary, marginTop: 4 }}>{table.time}</Text>
                )}
                {table.status === 'available' && (
                  <View style={styles.freeRow}>
                    <CheckCircle size={12} color="#22C55E" />
                    <Text style={{ fontSize: 10, color: colors.foregroundSecondary }}>Livre</Text>
                  </View>
                )}
                {table.status === 'cleaning' && (
                  <Text style={{ fontSize: 10, color: colors.foregroundSecondary, marginTop: 4 }}>Limpeza</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
      {selectedTable && (
        <View style={[styles.detail, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ fontWeight: '700', color: colors.foreground }}>Mesa {selectedTable.label}</Text>
          <Text style={{ marginTop: 4, color: colors.foregroundSecondary }}>
            {selectedTable.section} · {selectedTable.status}
          </Text>
          <View style={styles.statusActions}>
            <Pressable
              disabled={isSubmitting}
              style={[styles.statusBtn, { borderColor: colors.border }]}
              onPress={() => void updateSelectedStatus('available')}
            >
              <Text style={{ color: colors.foreground, fontWeight: '600' }}>Livre</Text>
            </Pressable>
            <Pressable
              disabled={isSubmitting}
              style={[styles.statusBtn, { borderColor: colors.border }]}
              onPress={() => void updateSelectedStatus('occupied')}
            >
              <Text style={{ color: colors.foreground, fontWeight: '600' }}>Ocupada</Text>
            </Pressable>
            <Pressable
              disabled={isSubmitting}
              style={[styles.statusBtn, { borderColor: colors.border }]}
              onPress={() => void updateSelectedStatus('cleaning')}
            >
              <Text style={{ color: colors.foreground, fontWeight: '600' }}>Limpeza</Text>
            </Pressable>
          </View>
          <Pressable style={[styles.genBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('QRGenerator')}>
            <QrCode size={16} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Gerar QR Code</Text>
          </Pressable>
        </View>
      )}
    </V2Shell>
  );
}

function StateCard({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.stateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={{ color: colors.foregroundSecondary, textAlign: 'center' }}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#FFF', fontWeight: '700' }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Legend({ dotColor, label, muted, ring }: { dotColor: string; label: string; muted: string; ring?: boolean }) {
  return (
    <View style={styles.legendItem}>
      {ring ? (
        <View style={[styles.ringDot, { borderColor: dotColor }]} />
      ) : (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      )}
      <Text style={{ fontSize: 11, color: muted }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  qrBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  ringDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, backgroundColor: 'transparent' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cellOuter: { width: '30%' },
  cellOuterSelected: { transform: [{ scale: 1.03 }] },
  cellPressed: { opacity: 0.88 },
  cell: {
    minHeight: 96,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  qrIcon: { position: 'absolute', top: 6, right: 6 },
  checkIcon: { position: 'absolute', top: 6, left: 6 },
  freeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  detail: { marginTop: 20, padding: 16, borderRadius: 16, borderWidth: 1 },
  genBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  statusActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  statusBtn: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  stateCard: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 12, alignItems: 'center', gap: 10 },
  retryBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
});
