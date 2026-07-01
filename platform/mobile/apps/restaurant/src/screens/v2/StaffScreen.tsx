import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Users, Shield, UserCheck, UserX } from 'lucide-react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { supabaseApiAdapter } from '@okinawa/shared/services/supabase-api';
import { V2Shell } from './shared/V2Shell';

interface StaffMember {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Dono',
  manager: 'Gerente',
  maitre: 'Maître',
  chef: 'Chef',
  barman: 'Barman',
  cook: 'Cozinheiro',
  waiter: 'Garçom',
};

const ROLE_COLORS: Record<string, string> = {
  owner: '#7C3AED',
  manager: '#1D4ED8',
  maitre: '#0891B2',
  chef: '#B45309',
  barman: '#BE185D',
  cook: '#059669',
  waiter: '#374151',
};

export default function StaffScreen() {
  const colors = useColors();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await supabaseApiAdapter.getStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipe');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); void load(); };

  const active = staff.filter((s) => s.is_active);
  const inactive = staff.filter((s) => !s.is_active);

  const groupedByRole = active.reduce<Record<string, StaffMember[]>>((acc, member) => {
    const key = member.role;
    if (!acc[key]) acc[key] = [];
    acc[key].push(member);
    return acc;
  }, {});

  return (
    <V2Shell title="Equipe" subtitle="Gestão de staff" showBack>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <Text style={{ textAlign: 'center', color: colors.foregroundSecondary, marginTop: 24 }}>
            Carregando equipe…
          </Text>
        )}
        {error && (
          <Text style={{ textAlign: 'center', color: '#EF4444', marginTop: 24 }}>{error}</Text>
        )}

        {!loading && !error && (
          <>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <UserCheck size={18} color="#22C55E" />
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 6 }}>
                  {active.length}
                </Text>
                <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>Ativos</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Users size={18} color={colors.primary} />
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 6 }}>
                  {staff.length}
                </Text>
                <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>Total</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <UserX size={18} color="#EF4444" />
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 6 }}>
                  {inactive.length}
                </Text>
                <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>Inativos</Text>
              </View>
            </View>

            {staff.length === 0 && (
              <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Users size={32} color={colors.foregroundSecondary} />
                <Text style={{ color: colors.foregroundSecondary, marginTop: 10, textAlign: 'center' }}>
                  Nenhum membro de equipe cadastrado.
                </Text>
              </View>
            )}

            {Object.entries(groupedByRole).map(([role, members]) => (
              <View key={role} style={{ marginBottom: 20 }}>
                <View style={styles.roleHeader}>
                  <Shield size={14} color={ROLE_COLORS[role] ?? colors.primary} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: ROLE_COLORS[role] ?? colors.primary, marginLeft: 6 }}>
                    {ROLE_LABELS[role] ?? role} ({members.length})
                  </Text>
                </View>
                <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {members.map((member, index) => (
                    <View
                      key={member.id}
                      style={[
                        styles.memberRow,
                        index < members.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      ]}
                    >
                      <View style={[styles.avatar, { backgroundColor: `${ROLE_COLORS[member.role] ?? colors.primary}20` }]}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: ROLE_COLORS[member.role] ?? colors.primary }}>
                          {(member.full_name ?? member.email ?? '?')[0].toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', color: colors.foreground }}>
                          {member.full_name ?? 'Sem nome'}
                        </Text>
                        {member.email && (
                          <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>{member.email}</Text>
                        )}
                      </View>
                      <View style={[styles.activeBadge, { backgroundColor: '#F0FDF4', borderColor: '#22C55E' }]}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#166534' }}>Ativo</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </V2Shell>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    padding: 12, alignItems: 'center',
  },
  roleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  groupCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  emptyBox: { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center', marginTop: 24 },
});
