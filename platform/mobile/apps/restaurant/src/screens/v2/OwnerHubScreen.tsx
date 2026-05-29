import React, { ComponentType } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import {
  UtensilsCrossed,
  Users,
  CreditCard,
  BarChart,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';
import { V2_TONE, V2Tone } from './shared/v2Theme';
import { HUB_ORDERS, OWNER_ROLES } from './shared/v2Mocks';
import { V2StatusBadge } from './shared/V2StatusBadge';
import { hubStatusTone } from './shared/v2Types';

type RoleId = (typeof OWNER_ROLES)[number]['id'];

export default function OwnerHubScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const [role, setRole] = React.useState<RoleId>('owner');

  const selectedRole = React.useMemo(
    () => OWNER_ROLES.find((r) => r.id === role) ?? OWNER_ROLES[0],
    [role],
  );

  const isOwner = role === 'owner';

  const openScreen = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <ScreenContainer edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={[styles.eyebrow, { color: colors.foregroundSecondary }]}>MODO MOBILE</Text>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>{selectedRole.title}</Text>
              <Text style={[styles.headerHint, { color: colors.foregroundSecondary }]}>{selectedRole.hint}</Text>
            </View>
          </View>
          <View style={[styles.rolePicker, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {OWNER_ROLES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setRole(item.id)}
                  style={[
                    styles.roleChip,
                    role === item.id && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      { color: role === item.id ? '#FFF' : colors.foreground },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {isOwner ? (
          <DashboardTab onNavigate={openScreen} colors={colors} />
        ) : (
          <>
            <RolePlaceholder role={selectedRole} colors={colors} onNavigate={openScreen} />
            <View style={[styles.roleHint, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.foregroundSecondary, fontSize: 12, fontWeight: '600' }}>
                Nav de {selectedRole.label} — acesse telas pelo menu Config
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

function DashboardTab({ onNavigate, colors }: { onNavigate: (s: string) => void; colors: ReturnType<typeof useColors> }) {
  const quickActions: { title: string; detail: string; screen: string; icon: IconComponent }[] = [
    { title: 'Cardápio', detail: 'Gerenciar itens', screen: 'Menu', icon: UtensilsCrossed },
    { title: 'Equipe', detail: 'Staff e turnos', screen: 'Staff', icon: Users },
    { title: 'Financeiro', detail: 'Receita e custos', screen: 'Financial', icon: CreditCard },
    { title: 'Relatórios', detail: 'Métricas', screen: 'Reports', icon: BarChart },
  ];

  return (
    <View style={styles.section}>
      <View style={[styles.banner, { backgroundColor: V2_TONE.danger.bg }]}>
        <Text style={{ color: V2_TONE.danger.text, fontSize: 11 }}>
          Resumo executivo otimizado para leitura rápida no celular.
        </Text>
      </View>
      <View style={styles.metricGrid}>
        <Metric value="R$ 13.736" label="Receita Hoje" tone="success" />
        <Metric value="10" label="Pedidos Ativos" tone="danger" />
        <Metric value="72%" label="Ocupação" tone="warning" />
        <Metric value="R$ 259" label="Ticket Médio" tone="info" />
      </View>
      <SectionTitle title="Ações rápidas" subtitle="Atalhos para o que importa agora" colors={colors} />
      <View style={styles.metricGrid}>
        {quickActions.map((action) => (
          <QuickAction
            key={action.title}
            title={action.title}
            detail={action.detail}
            icon={action.icon}
            onPress={() => onNavigate(action.screen)}
            colors={colors}
          />
        ))}
      </View>
      <SectionTitle title="Pedidos recentes" colors={colors} />
      {HUB_ORDERS.slice(0, 3).map((order) => (
        <CompactOrder key={`${order.table}-${order.name}`} order={order} colors={colors} />
      ))}
    </View>
  );
}

function RolePlaceholder({
  role,
  colors,
  onNavigate,
}: {
  role: (typeof OWNER_ROLES)[number];
  colors: ReturnType<typeof useColors>;
  onNavigate: (s: string) => void;
}) {
  const links: Record<RoleId, string> = {
    owner: 'Hub',
    manager: 'Orders',
    maitre: 'Maitre',
    chef: 'Kitchen',
    barman: 'BarKDS',
    cook: 'Kitchen',
    waiter: 'Waiter',
  };

  return (
    <View style={styles.section}>
      <View style={[styles.banner, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, borderWidth: 1 }]}>
        <Text style={{ color: colors.foregroundSecondary, fontSize: 10, fontWeight: '700' }}>PREVIEW POR CARGO</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginTop: 8 }}>{role.label}</Text>
        <Text style={{ color: colors.foregroundSecondary, marginTop: 4 }}>{role.hint}</Text>
      </View>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
        onPress={() => onNavigate(links[role.id] ?? 'Hub')}
      >
        <Text style={{ color: '#FFF', fontWeight: '700', textAlign: 'center' }}>Abrir painel {role.label}</Text>
      </TouchableOpacity>
    </View>
  );
}

function SectionTitle({ title, subtitle, colors }: { title: string; subtitle?: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ marginBottom: 12, marginTop: 8 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>{title}</Text>
      {subtitle ? <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>{subtitle}</Text> : null}
    </View>
  );
}

function Metric({ value, label, tone }: { value: string; label: string; tone: V2Tone }) {
  return (
    <View style={[styles.metricCard, { borderColor: '#E2E8F0' }]}>
      <Text style={[styles.metricValue, { color: V2_TONE[tone].text, backgroundColor: V2_TONE[tone].bg }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  title,
  detail,
  icon: Icon,
  onPress,
  colors,
}: {
  title: string;
  detail: string;
  icon: IconComponent;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.quickAction, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Icon size={16} color={colors.primary} />
      <Text style={{ fontWeight: '700', color: colors.foreground, marginTop: 8 }}>{title}</Text>
      <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>{detail}</Text>
    </TouchableOpacity>
  );
}

function CompactOrder({ order, colors }: { order: (typeof HUB_ORDERS)[number]; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.orderCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={styles.orderRow}>
        <Image source={{ uri: order.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: colors.foreground }}>{order.name}</Text>
          <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>Mesa {order.table} · {order.items}</Text>
        </View>
        <V2StatusBadge label={order.status} tone={hubStatusTone(order.status)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 88 },
  headerCard: { borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between' },
  headerText: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  headerTitle: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  headerHint: { fontSize: 11, marginTop: 4 },
  rolePicker: { marginTop: 12, borderRadius: 12, borderWidth: 1, padding: 8 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginRight: 8 },
  roleChipText: { fontSize: 12, fontWeight: '600' },
  section: { gap: 12 },
  banner: { borderRadius: 16, padding: 12 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { width: '47%', borderRadius: 16, borderWidth: 1, padding: 12, backgroundColor: '#FFF' },
  metricValue: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
  metricLabel: { marginTop: 12, fontSize: 12, color: '#64748B' },
  quickAction: { width: '47%', minHeight: 82, borderRadius: 16, borderWidth: 1, padding: 12 },
  orderCard: { borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 8 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  actionBtn: { marginTop: 12, borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  roleHint: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
});
