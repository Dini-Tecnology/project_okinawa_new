import React, { ComponentType } from 'react';
import {
  Alert,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import {
  AlertCircle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Clock,
  CheckCircle,
  CreditCard as CreditCardIcon,
  DollarSign,
  Phone,
  Package,
  QrCode,
  Settings,
  Zap,
  XCircle,
  UtensilsCrossed,
  Users,
  BarChart,
  ChefHat,
  LogOut,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';
import { authService } from '@/shared/services/auth';
import { V2_TONE, V2Tone } from './shared/v2Theme';
import { V2StatusBadge } from './shared/V2StatusBadge';
import { orderStatusLabel, orderStatusTone } from './shared/v2Types';
import { shortOrderId, useDashboardSnapshot, useKdsOrders, useRestaurantOrders } from './shared/useRestaurantOperations';
import { supabaseApiAdapter } from '@okinawa/shared/services/supabase-api';
import type { TabOrder } from './shared/v2Types';
import {
  ChefRoleView,
  BarmanRoleView,
  CookRoleView,
  MaitreRoleView,
  ManagerRoleView,
  WaiterRoleView,
  useRestaurantRole,
} from '../../contexts/RestaurantRoleContext';

const OWNER_ROLES = [
  { id: 'owner', label: 'Dono', title: 'Dashboard Executivo', hint: 'Visão completa do restaurante' },
  { id: 'manager', label: 'Gerente', title: 'Operação do Turno', hint: 'Pedidos, equipe e sala' },
  { id: 'maitre', label: 'Maître', title: 'Sala e Reservas', hint: 'Fila, reservas e mesas' },
  { id: 'chef', label: 'Chef', title: 'Chef Executivo', hint: 'KDS, tempos e qualidade' },
  { id: 'barman', label: 'Barman', title: 'Bar KDS', hint: 'Drinks e bebidas' },
  { id: 'cook', label: 'Cozinheiro', title: 'Estação de Preparo', hint: 'Fila da sua praça' },
  { id: 'waiter', label: 'Garçom', title: 'Atendimento', hint: 'Mesas e chamados' },
] as const;

type RoleId = (typeof OWNER_ROLES)[number]['id'];

export default function OwnerHubScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const {
    role,
    setRole,
    managerView,
    setManagerView,
    maitreView,
    setMaitreView,
    chefView,
    barmanView,
    cookView,
    waiterView,
  } = useRestaurantRole();

  const selectedRole = React.useMemo(
    () => OWNER_ROLES.find((r) => r.id === role) ?? OWNER_ROLES[0],
    [role],
  );
  const headerTitle =
    role === 'manager'
      ? managerViewTitle(managerView)
      : role === 'maitre'
        ? maitreViewTitle(maitreView)
        : role === 'chef'
          ? chefViewTitle(chefView)
          : role === 'barman'
            ? barmanViewTitle(barmanView)
            : role === 'cook'
              ? cookViewTitle(cookView)
              : role === 'waiter'
                ? waiterViewTitle(waiterView)
          : selectedRole.title;

  const isOwner = role === 'owner';

  const openScreen = (screen: string) => {
    navigation.navigate(screen);
  };

  const handleSignOut = () => {
    Alert.alert('Sair da conta', 'Deseja encerrar sua sessão neste dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          void authService.logout();
        },
      },
    ]);
  };

  return (
    <ScreenContainer edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={[styles.eyebrow, { color: colors.foregroundSecondary }]}>MODO MOBILE</Text>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>{headerTitle}</Text>
              <Text style={[styles.headerHint, { color: colors.foregroundSecondary }]}>{selectedRole.hint}</Text>
            </View>
            <TouchableOpacity
              onPress={handleSignOut}
              style={[styles.signOutButton, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
            >
              <LogOut size={16} color={colors.error} strokeWidth={2.4} />
              <Text style={[styles.signOutText, { color: colors.error }]}>Sair</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.rolePicker, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleScrollContent}>
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
            <View pointerEvents="none" style={styles.roleScrollHint}>
              <View style={[styles.roleScrollHintIcon, { backgroundColor: `${colors.primary}22` }]}>
                <ArrowRight size={13} color={colors.primary} strokeWidth={2.6} />
              </View>
            </View>
          </View>
        </View>

        {isOwner ? (
          <DashboardTab onNavigate={openScreen} colors={colors} />
        ) : role === 'manager' ? (
          <ManagerContent
            view={managerView}
            setView={setManagerView}
            onNavigate={openScreen}
            colors={colors}
          />
        ) : role === 'maitre' ? (
          <MaitreContent
            view={maitreView}
            setView={setMaitreView}
            colors={colors}
          />
        ) : role === 'chef' ? (
          <ChefContent
            view={chefView}
            colors={colors}
          />
        ) : role === 'barman' ? (
          <BarmanContent
            view={barmanView}
            colors={colors}
          />
        ) : role === 'cook' ? (
          <CookContent
            view={cookView}
            colors={colors}
          />
        ) : role === 'waiter' ? (
          <WaiterContent
            view={waiterView}
            colors={colors}
          />
        ) : (
          <>
            <RolePlaceholder role={selectedRole} colors={colors} onNavigate={openScreen} />
            <View style={[styles.roleHint, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.foregroundSecondary, fontSize: 12, fontWeight: '600' }}>
                Nav de {selectedRole.label} — acesse telas pelo menu inferior
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

function managerViewTitle(view: ManagerRoleView) {
  const titles: Record<ManagerRoleView, string> = {
    'manager-ops': 'Painel Operacional',
    'manager-orders': 'Gestão de Pedidos',
    'manager-approvals': 'Central de Aprovações',
    'manager-cash': 'Controle de Caixa',
    'manager-tables': 'Mapa de Mesas',
    'manager-staff': 'Gestão de Equipe',
    'manager-report': 'Relatório do Dia',
    'manager-stock': 'Controle de Estoque',
    'manager-promotions': 'Promoções & Campanhas',
    'manager-qr': 'QR Codes',
    'manager-settings': 'Central de Configuração',
  };
  return titles[view];
}

function maitreViewTitle(view: MaitreRoleView) {
  const titles: Record<MaitreRoleView, string> = {
    'maitre-reservations': 'Painel do Maître',
    'maitre-flow': 'Fluxo do Salão',
    'maitre-tables': 'Mapa de Mesas',
    'maitre-management': 'Gestão de Reservas',
  };
  return titles[view];
}

function chefViewTitle(view: ChefRoleView) {
  const titles: Record<ChefRoleView, string> = {
    'chef-kds': 'KDS — Cozinha',
    'chef-approvals': 'Aprovações do Chef',
    'chef-analytics': 'KDS Analytics',
    'chef-cost': 'Custo & Margem',
    'chef-menu': 'Editor de Cardápio',
    'chef-stock': 'Controle de Estoque',
  };
  return titles[view];
}

function barmanViewTitle(view: BarmanRoleView) {
  const titles: Record<BarmanRoleView, string> = {
    'barman-station': 'Estação do Barman',
    'bar-kds': 'KDS — Bar',
    'bar-recipes': 'Receitas de Drinks',
    'bar-stock': 'Controle de Estoque',
  };
  return titles[view];
}

function cookViewTitle(view: CookRoleView) {
  const titles: Record<CookRoleView, string> = {
    'cook-station': 'Estação de Preparo',
    'cook-kds': 'KDS Cozinha',
  };
  return titles[view];
}

function waiterViewTitle(view: WaiterRoleView) {
  const titles: Record<WaiterRoleView, string> = {
    waiter: 'Visão do Garçom',
    'waiter-calls': 'Chamados de Clientes',
    'waiter-table-actions': 'Ações na Mesa',
    'waiter-assistance': 'Assistência ao Cliente',
    'waiter-table-charge': 'Cobrar na Mesa',
    'waiter-tap-to-pay': 'TAP to Pay',
    'waiter-order-management': 'Gestão de Pedidos',
    'waiter-table-map': 'Mapa de Mesas',
    'waiter-tips': 'Minhas Gorjetas',
  };
  return titles[view];
}

const MANAGER_STAFF = [
  {
    name: 'Ricardo Alves',
    role: 'Dono · Integral',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  },
  {
    name: 'Marina Costa',
    role: 'Gerente · 14h–23h',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  },
  {
    name: 'Felipe Santos',
    role: 'Chef · 15h–23h',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
  },
  {
    name: 'Ana Rodrigues',
    role: 'Sommelier · 18h–00h',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
  },
  {
    name: 'Bruno Oliveira',
    role: 'Garçom · 18h–00h',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
  },
];

const MANAGER_APPROVALS = [
  { title: 'Filé ao Molho de Vinho', amount: 'R$ 118', meta: 'Mesa 5 · Bruno Oliveira', reason: 'Cliente mudou de ideia' },
  { title: 'Sobremesa (Petit Gâteau)', amount: 'R$ 42', meta: 'Mesa 8 · Carla Lima', reason: 'Aniversariante na mesa' },
];

const MANAGER_CASH_MOVES = [
  { label: 'Venda Cartão', time: '19:45', value: '+R$ 4.200', tone: 'success' as const, icon: CreditCardIcon },
  { label: 'Venda PIX', time: '19:30', value: '+R$ 2.800', tone: 'success' as const, icon: QrCode },
  { label: 'Venda Dinheiro', time: '18:50', value: '+R$ 1.420', tone: 'success' as const, icon: DollarSign },
  { label: 'Sangria', time: '18:00', value: 'R$ 1.500', tone: 'danger' as const, icon: ArrowDown },
  { label: 'Reforço', time: '14:05', value: '+R$ 500', tone: 'success' as const, icon: ArrowUp },
];

const MANAGER_TABLES = [
  { number: 1, status: 'Ocupada', seats: '2 lugares', guest: 'Maria S.', tone: 'danger' as const },
  { number: 2, status: 'Livre', seats: '2 lugares', guest: '', tone: 'success' as const },
  { number: 3, status: 'Ocupada', seats: '4 lugares', guest: 'João & Ana', tone: 'danger' as const },
  { number: 4, status: 'Reserva', seats: '4 lugares', guest: '', tone: 'warning' as const },
  { number: 5, status: 'Ocupada', seats: '6 lugares', guest: 'Grupo Pedro', tone: 'danger' as const },
  { number: 6, status: 'Conta', seats: '2 lugares', guest: 'Lucia F.', tone: 'info' as const },
  { number: 7, status: 'Livre', seats: '4 lugares', guest: '', tone: 'success' as const },
  { number: 8, status: 'Ocupada', seats: '8 lugares', guest: 'Aniversário', tone: 'danger' as const },
  { number: 9, status: 'Livre', seats: '2 lugares', guest: '', tone: 'success' as const },
  { number: 10, status: 'Ocupada', seats: '4 lugares', guest: 'Carlos M.', tone: 'danger' as const },
  { number: 11, status: 'Reserva', seats: '6 lugares', guest: '', tone: 'warning' as const },
  { number: 12, status: 'Livre', seats: '2 lugares', guest: '', tone: 'success' as const },
];

const MAITRE_RESERVATIONS = [
  { name: 'Fernanda Machado', time: '19:30 · 2 pessoas', note: 'Aniversário de casamento', status: 'Confirmada', tone: 'warning' as const },
  { name: 'Roberto Dias', time: '20:00 · 4 pessoas', note: '', status: 'Confirmada', tone: 'warning' as const },
  { name: 'Patricia Lemos', time: '20:30 · 6 pessoas', note: 'Jantar de negócios', status: 'Aguardando', tone: 'warning' as const },
  { name: 'André Martins', time: '21:00 · 2 pessoas', note: '', status: 'Confirmada', tone: 'warning' as const },
  { name: 'Juliana Costa', time: '21:30 · 8 pessoas', note: 'Mesa no terraço', status: 'Confirmada', tone: 'warning' as const },
];

const MAITRE_MANAGEMENT = [
  { name: 'Ricardo Silva', time: '19:00', table: 'Mesa 5', people: '4 pessoas', phone: '(11) 9xxxx-1234', status: 'Confirmada', tone: 'success' as const },
  { name: 'Grupo Corporativo', time: '20:00', table: 'Mesas 8+9', people: '10 pessoas', phone: '(11) 9xxxx-5678', status: 'Pendente', tone: 'warning' as const },
  { name: 'Aniversário Julia', time: '20:30', table: 'Mesa 11', people: '8 pessoas', phone: '(11) 9xxxx-9012', status: 'Confirmada', tone: 'success' as const },
];

const MANAGER_STOCK = [
  ['Gin Tanqueray', 'Destilados', '3 garrafas', 'warning'],
  ['Tônica Fever Tree', 'Mixers', '12 unidades', 'success'],
  ['Limão Tahiti', 'Frutas', '8 unidades', 'danger'],
  ['Campari', 'Licores', '4 garrafas', 'success'],
  ['Filé Mignon', 'Carnes', '6 kg', 'warning'],
  ['Salmão Norueguês', 'Peixes', '4 kg', 'warning'],
  ['Arroz Arbóreo', 'Grãos', '15 kg', 'success'],
  ['Azeite Trufado', 'Condimentos', '2 garrafas', 'warning'],
] as const;

const MANAGER_CAMPAIGNS = [
  ['Happy Hour — 17h às 19h', 'Desconto: 30% em drinks', '142 usos este mês'],
  ['Almoço Executivo', 'Combo: Entrada + Prato + Bebida R$ 49,90', '89 usos este mês'],
  ['Aniversariante', 'Cortesia: Sobremesa grátis', '23 usos este mês'],
] as const;

const MANAGER_CONFIG = [
  ['Perfil do Restaurante', 'Nome, logo, fotos, contato', UtensilsCrossed, 'danger'],
  ['Tipos de Serviço', '11 modelos de operação', UtensilsCrossed, 'success'],
  ['Experiência do Cliente', 'Reservas, fila, QR, pedidos', Zap, 'danger'],
  ['Mapa do Salão', 'Mesas, zonas, áreas VIP', Users, 'warning'],
  ['Cardápio', 'Categorias, itens, preços', Package, 'danger'],
  ['Equipe & Permissões', 'Cargos, escalas, acesso', Users, 'danger'],
  ['Cozinha & Bar', 'Estações, KDS, receitas', UtensilsCrossed, 'warning'],
  ['Pagamentos', 'Taxa, gorjeta, split, métodos', CreditCardIcon, 'danger'],
] as const;


const CHEF_APPROVALS = [
  ['Carlos & Maria', "Chef's Table", '05/04 — 20h', '2 convidados', 'Sem glúten', 'Aniversário de casamento'],
  ['Grupo Eventos Corp', 'Menu Degustação', '07/04 — 19h30', '8 convidados', '1 vegetariano', 'Evento corporativo'],
  ['Ana Beatriz', "Chef's Table", '06/04 — 21h', '4 convidados', 'Nenhuma', 'Harmonização de vinhos'],
] as const;

const CHEF_STATIONS = [
  ['Grill', '14min', '91%', '45 tickets', 'warning'],
  ['Frios', '8min', '98%', '38 tickets', 'success'],
  ['Massas', '11min', '95%', '32 tickets', 'success'],
  ['Bar', '4min', '99%', '27 tickets', 'success'],
] as const;

const CHEF_MARGINS = [
  ['Risoto de Cogumelos', 'Custo: R$ 18.50 → Venda: R$ 68', '72.8%', 'success'],
  ['Filé Mignon ao Molho', 'Custo: R$ 42.00 → Venda: R$ 118', '64.4%', 'warning'],
  ['Salmão Grelhado', 'Custo: R$ 38.00 → Venda: R$ 95', '60%', 'warning'],
  ['Camarão Flamejado', 'Custo: R$ 52.00 → Venda: R$ 125', '58.4%', 'warning'],
  ['Picanha na Brasa', 'Custo: R$ 48.00 → Venda: R$ 98', '51%', 'danger'],
] as const;

const CHEF_MENU_ITEMS = [
  ['Tartare de Atum', 'Atum fresco com abacate, gergelim negro e ponzu cítrico', 'R$ 58', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=160'],
  ['Burrata Artesanal', 'Burrata com tomate confit, pesto de manjericão e redução de balsâmico', 'R$ 52', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=160'],
  ['Ceviche Peruano', 'Peixe branco com leite de tigre, cebola roxa e milho crocante', 'R$ 48', 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=160'],
  ['Carpaccio de Wagyu', 'Wagyu A5 fatiado fino com rúcula, parmesão e azeite trufado', 'R$ 72', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=160'],
] as const;

const BARMAN_RECIPES = [
  ['Gin Tônica Aurora', 'Taça Balloon · 3min', 'R$ 38', 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=160'],
  ['Negroni Clássico', 'Copo Old Fashioned · 3min', 'R$ 42', 'https://images.unsplash.com/photo-1551751299-1b51cab2694c?w=160'],
  ['Espresso Martini', 'Taça Martini · 4min', 'R$ 40', 'https://images.unsplash.com/photo-1605270012917-bf157c5a9541?w=160'],
  ['Caipirinha Premium', 'Copo Old Fashioned · 2min', 'R$ 32', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=160'],
  ['Moscow Mule', 'Caneca de cobre · 2min', 'R$ 36', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=160'],
] as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function DashboardTab({ onNavigate, colors }: { onNavigate: (s: string) => void; colors: ReturnType<typeof useColors> }) {
  const { data: snapshot, loading: snapshotLoading, error: snapshotError, refresh: refreshSnapshot } = useDashboardSnapshot();
  const { data: recentOrders, loading: ordersLoading, error: ordersError, refresh: refreshOrders } = useRestaurantOrders();
  const quickActions: { title: string; detail: string; screen: string; icon: IconComponent }[] = [
    { title: 'Cardápio', detail: 'Gerenciar itens', screen: 'Menu', icon: UtensilsCrossed },
    { title: 'Equipe', detail: 'Staff e turnos', screen: 'Staff', icon: Users },
    { title: 'Financeiro', detail: 'Receita e custos', screen: 'Financial', icon: CreditCardIcon },
    { title: 'Relatórios', detail: 'Métricas', screen: 'Reports', icon: BarChart },
  ];
  const occupancy = snapshot?.tables.total
    ? Math.round((snapshot.tables.occupied / snapshot.tables.total) * 100)
    : 0;
  const averageTicket = snapshot?.orders_today
    ? snapshot.revenue_today / snapshot.orders_today
    : 0;

  return (
    <View style={styles.section}>
      <View style={[styles.banner, { backgroundColor: V2_TONE.danger.bg }]}>
        <Text style={{ color: V2_TONE.danger.text, fontSize: 11 }}>
          Resumo executivo otimizado para leitura rápida no celular.
        </Text>
      </View>
      <View style={styles.metricGrid}>
        <Metric value={snapshotLoading ? '...' : formatCurrency(snapshot?.revenue_today ?? 0)} label="Receita Hoje" tone="success" />
        <Metric value={snapshotLoading ? '...' : String(snapshot?.active_orders ?? 0)} label="Pedidos Ativos" tone="danger" />
        <Metric value={snapshotLoading ? '...' : `${occupancy}%`} label="Ocupação" tone="warning" />
        <Metric value={snapshotLoading ? '...' : formatCurrency(averageTicket)} label="Ticket Médio" tone="info" />
      </View>
      {snapshotError ? (
        <InlineNotice message={snapshotError} actionLabel="Recarregar" onPress={() => void refreshSnapshot()} colors={colors} />
      ) : null}
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
      {ordersLoading ? (
        <InlineNotice message="Carregando pedidos recentes..." colors={colors} />
      ) : ordersError ? (
        <InlineNotice message={ordersError} actionLabel="Recarregar" onPress={() => void refreshOrders()} colors={colors} />
      ) : recentOrders.length === 0 ? (
        <InlineNotice message="Nenhum pedido recente." colors={colors} />
      ) : (
        recentOrders.slice(0, 3).map((order) => (
          <CompactOrder key={order.id} order={order} colors={colors} />
        ))
      )}
    </View>
  );
}

function ManagerContent({
  view,
  setView,
  onNavigate,
  colors,
}: {
  view: ManagerRoleView;
  setView: (view: ManagerRoleView) => void;
  onNavigate: (s: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  if (view === 'manager-orders') return <ManagerOrdersView colors={colors} />;
  if (view === 'manager-approvals') return <ManagerApprovalsView colors={colors} />;
  if (view === 'manager-cash') return <ManagerCashView colors={colors} />;
  if (view === 'manager-tables') return <ManagerTablesView colors={colors} />;
  if (view === 'manager-staff') return <ManagerStaffView colors={colors} />;
  if (view === 'manager-report') return <ManagerReportView colors={colors} />;
  if (view === 'manager-stock') return <ManagerStockView colors={colors} />;
  if (view === 'manager-promotions') return <ManagerPromotionsView colors={colors} />;
  if (view === 'manager-qr') return <ManagerQrView colors={colors} />;
  if (view === 'manager-settings') return <ManagerSettingsView colors={colors} setView={setView} />;
  return <ManagerDashboardTab setView={setView} onNavigate={onNavigate} colors={colors} />;
}

function MaitreContent({
  view,
  colors,
}: {
  view: MaitreRoleView;
  setView: (view: MaitreRoleView) => void;
  colors: ReturnType<typeof useColors>;
}) {
  if (view === 'maitre-flow') return <MaitreFlowView colors={colors} />;
  if (view === 'maitre-tables') return <MaitreTablesView colors={colors} />;
  if (view === 'maitre-management') return <MaitreManagementView colors={colors} />;
  return <MaitreReservationsView colors={colors} />;
}

function ChefContent({
  view,
  colors,
}: {
  view: ChefRoleView;
  colors: ReturnType<typeof useColors>;
}) {
  if (view === 'chef-approvals') return <ChefApprovalsView colors={colors} />;
  if (view === 'chef-analytics') return <ChefAnalyticsView colors={colors} />;
  if (view === 'chef-cost') return <ChefCostView colors={colors} />;
  if (view === 'chef-menu') return <ChefMenuView colors={colors} />;
  if (view === 'chef-stock') return <ChefStockView colors={colors} />;
  return <ChefKdsView colors={colors} />;
}

function BarmanContent({
  view,
  colors,
}: {
  view: BarmanRoleView;
  colors: ReturnType<typeof useColors>;
}) {
  if (view === 'bar-recipes') return <BarmanRecipesView colors={colors} />;
  if (view === 'bar-stock') return <BarmanStockView colors={colors} />;
  return <BarmanQueueView colors={colors} mode={view === 'bar-kds' ? 'kds' : 'station'} />;
}

function CookContent({
  view,
  colors,
}: {
  view: CookRoleView;
  colors: ReturnType<typeof useColors>;
}) {
  return <CookQueueView colors={colors} mode={view === 'cook-kds' ? 'kds' : 'station'} />;
}

function CookQueueView({
  colors,
  mode,
}: {
  colors: ReturnType<typeof useColors>;
  mode: 'station' | 'kds';
}) {
  const { data: orders, loading } = useKdsOrders();
  const queueCount = orders.filter((o) => o.status === 'queue').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  return (
    <View style={styles.section}>
      <View style={styles.threeMetricGrid}>
        <CompactMetric value={String(queueCount)} label="Fila" tone="warning" />
        <CompactMetric value={String(preparingCount)} label="Preparando" tone="danger" />
        <CompactMetric value={String(readyCount)} label="Prontos" tone="success" />
      </View>
      {loading && <Text style={[styles.staffRole, { color: colors.foregroundSecondary, textAlign: 'center', marginTop: 12 }]}>Carregando fila…</Text>}
      {orders.map((order) => {
        const isReady = order.status === 'ready';
        const isPreparing = order.status === 'preparing';
        const tone = isReady ? 'success' : isPreparing ? 'warning' : 'info';
        const actionLabel = isReady ? 'Pronto ✓' : isPreparing ? 'Marcar pronto' : 'Iniciar preparo';
        const actionColor = isPreparing ? '#22C55E' : '#F59E0B';
        return (
          <View key={`${mode}-${order.id}`} style={[styles.managerOrderCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.managerOrderHeader}>
              <View>
                <Text style={[styles.reservationTitle, { color: colors.foreground }]}>{order.table}</Text>
                <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{order.meta}</Text>
              </View>
              <StatusChip label={tone === 'success' ? 'Pronto' : tone === 'warning' ? 'Preparando' : 'Fila'} tone={tone} />
            </View>
            <View style={{ marginTop: 10, gap: 6 }}>
              {order.items.map(([name, time]) => (
                <View key={name} style={styles.chefItemRow}>
                  <Text style={[styles.staffRole, { color: colors.foreground }]}>{name}</Text>
                  <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{time}</Text>
                </View>
              ))}
            </View>
            {!isReady && (
              <TouchableOpacity
                style={[styles.wideAction, { backgroundColor: actionColor }]}
                onPress={() => void supabaseApiAdapter.updateOrderStatus(order.id, isPreparing ? 'ready' : 'preparing')}
              >
                <Text style={[styles.wideActionText, { color: '#FFF' }]}>{actionLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      <ProfileActive colors={colors} roleName="Cozinheiro" />
    </View>
  );
}

function BarmanQueueView({
  colors,
  mode,
}: {
  colors: ReturnType<typeof useColors>;
  mode: 'station' | 'kds';
}) {
  const [barOrders, setBarOrders] = React.useState<any[]>([]);
  const [loadingBar, setLoadingBar] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    supabaseApiAdapter.getBarQueue().then((data) => {
      if (!cancelled) setBarOrders(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoadingBar(false); });
    return () => { cancelled = true; };
  }, []);

  const queueCount = barOrders.filter((o) => o.status === 'confirmed' || o.status === 'pending').length;
  const preparingCount = barOrders.filter((o) => o.status === 'preparing').length;
  const readyCount = barOrders.filter((o) => o.status === 'ready').length;

  return (
    <View style={styles.section}>
      {mode === 'kds' ? (
        <View style={[styles.tipBanner, { backgroundColor: V2_TONE.info.bg, borderColor: '#BFDBFE' }]}>
          <Text style={[styles.tipBannerText, { color: V2_TONE.info.text }]}>
            KDS Bar — priorize drinks com menor tempo e mesas aguardando garçom.
          </Text>
        </View>
      ) : (
        <View style={[styles.tipBanner, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
          <Text style={[styles.tipBannerText, { color: '#C2410C' }]}>
            Estação — confirme novos pedidos de bar antes de enviar ao KDS.
          </Text>
        </View>
      )}
      <View style={styles.threeMetricGrid}>
        <CompactMetric value={String(queueCount)} label="Fila" tone="warning" />
        <CompactMetric value={String(preparingCount)} label="Preparando" tone="danger" />
        <CompactMetric value={String(readyCount)} label="Prontos" tone="success" />
      </View>
      {loadingBar && <Text style={[styles.staffRole, { color: colors.foregroundSecondary, textAlign: 'center', marginTop: 12 }]}>Carregando bar…</Text>}
      {barOrders.map((item) => {
        const isPreparing = item.status === 'preparing';
        const isReady = item.status === 'ready';
        const tone = isReady ? 'success' : isPreparing ? 'warning' : 'info';
        const actionLabel = isReady ? 'Pronto ✓' : isPreparing ? 'Marcar pronto' : 'Iniciar preparo';
        const actionColor = isPreparing ? '#22C55E' : '#F59E0B';
        const tableLabel = item.table_label ?? `Item ${item.id?.slice(0, 6) ?? '?'}`;
        const meta = `${item.quantity ?? 1}x ${item.item_name ?? 'Bebida'}${item.elapsed_minutes != null ? ` · ${item.elapsed_minutes}min` : ''}`;
        return (
          <View
            key={item.id}
            style={[styles.managerOrderCard, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <View style={styles.managerOrderHeader}>
              <View>
                <Text style={[styles.reservationTitle, { color: colors.foreground }]}>{tableLabel}</Text>
                <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{meta}</Text>
              </View>
              <StatusChip label={isReady ? 'Pronto' : isPreparing ? 'Preparando' : 'Fila'} tone={tone} />
            </View>
            {!isReady && (
              <TouchableOpacity
                style={[styles.wideAction, { backgroundColor: actionColor }]}
                onPress={() => void supabaseApiAdapter.updateOrderItemStatus(item.id, isPreparing ? 'ready' : 'preparing')}
              >
                <Text style={[styles.wideActionText, { color: '#FFF' }]}>{actionLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      <ProfileActive colors={colors} roleName="Barman" />
    </View>
  );
}

function BarmanRecipesView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      {BARMAN_RECIPES.map(([name, meta, price, image]) => (
        <View key={name} style={[styles.menuEditorCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Image source={{ uri: image }} style={styles.menuEditorImage} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.approvalTitle, { color: colors.foreground }]}>{name}</Text>
            <Text numberOfLines={1} style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{meta}</Text>
          </View>
          <Text style={styles.menuEditorPrice}>{price}</Text>
        </View>
      ))}
      <ProfileActive colors={colors} roleName="Barman" />
    </View>
  );
}

function BarmanStockView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <ManagerStockView colors={colors} roleName="Barman" />;
}

function ChefKdsView({ colors }: { colors: ReturnType<typeof useColors> }) {
  const { data: orders, loading } = useKdsOrders();
  const queueCount = orders.filter((o) => o.status === 'queue').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  return (
    <View style={styles.section}>
      <View style={styles.threeMetricGrid}>
        <CompactMetric value={String(queueCount)} label="Fila" tone="warning" />
        <CompactMetric value={String(preparingCount)} label="Preparando" tone="danger" />
        <CompactMetric value={String(readyCount)} label="Prontos" tone="success" />
      </View>
      {loading && <Text style={[styles.staffRole, { color: colors.foregroundSecondary, textAlign: 'center', marginTop: 12 }]}>Carregando KDS…</Text>}
      {orders.map((order) => {
        const isReady = order.status === 'ready';
        const isPreparing = order.status === 'preparing';
        const tone = isReady ? 'success' : isPreparing ? 'warning' : 'info';
        const actionLabel = isReady ? 'Pronto ✓' : isPreparing ? 'Marcar pronto' : 'Iniciar preparo';
        const actionColor = isReady ? '#22C55E' : isPreparing ? '#22C55E' : '#F59E0B';
        const actionTextColor = '#FFF';
        return (
          <View key={order.id} style={[styles.managerOrderCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.managerOrderHeader}>
              <View>
                <Text style={[styles.reservationTitle, { color: colors.foreground }]}>{order.table}</Text>
                <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{order.meta}</Text>
              </View>
              <StatusChip label={tone === 'success' ? 'Pronto' : tone === 'warning' ? 'Preparando' : 'Fila'} tone={tone} />
            </View>
            <View style={{ marginTop: 10, gap: 6 }}>
              {order.items.map(([name, time]) => (
                <View key={name} style={styles.chefItemRow}>
                  <Text style={[styles.staffRole, { color: colors.foreground }]}>{name}</Text>
                  <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{time}</Text>
                </View>
              ))}
            </View>
            {!isReady && (
              <TouchableOpacity
                style={[styles.wideAction, { backgroundColor: actionColor }]}
                onPress={() => void supabaseApiAdapter.updateOrderStatus(order.id, isPreparing ? 'ready' : 'preparing')}
              >
                <Text style={[styles.wideActionText, { color: actionTextColor }]}>{actionLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

function ChefApprovalsView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <Zap size={16} color="#FF8A7A" />
        <Text style={[styles.tipBannerText, { color: '#FF8A7A' }]}>Reservas do Chef's Table e menus especiais aguardando aprovação</Text>
      </View>
      <View style={styles.metricGrid}>
        <Metric value="3" label="Pendentes" tone="warning" />
        <Metric value="5" label="Aprovados Hoje" tone="success" />
      </View>
      {CHEF_APPROVALS.map(([name, tag, date, guests, restriction, note]) => (
        <View key={name} style={[styles.approvalCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.managerOrderHeader}>
            <Text style={[styles.approvalTitle, { color: colors.foreground }]}>{name}</Text>
            <StatusChip label={tag} tone="warning" />
          </View>
          <View style={styles.chefApprovalGrid}>
            <Text style={[styles.metaLineText, { color: colors.foregroundSecondary }]}>🗓️ {date}</Text>
            <Text style={[styles.metaLineText, { color: colors.foregroundSecondary }]}>👥 {guests}</Text>
            <Text style={[styles.metaLineText, { color: colors.foregroundSecondary }]}>🍽️ {restriction}</Text>
            <Text style={[styles.metaLineText, { color: colors.foregroundSecondary }]}>📝 {note}</Text>
          </View>
          <View style={styles.approvalActions}>
            <TouchableOpacity style={[styles.approvalButton, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0', borderWidth: 1 }]}>
              <Text style={[styles.approvalButtonText, { color: '#22C55E' }]}>✓ Aprovar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.approvalButton, { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1 }]}>
              <Text style={[styles.approvalButtonText, { color: '#EF4444' }]}>X Recusar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

function ChefAnalyticsView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <Zap size={16} color="#FF8A7A" />
        <Text style={[styles.tipBannerText, { color: '#FF8A7A' }]}>Métricas de performance da cozinha — tempos, eficiência e SLA</Text>
      </View>
      <View style={styles.metricGrid}>
        <Metric value="12min" label="Tempo Médio" tone="danger" />
        <Metric value="94%" label="SLA (<15min)" tone="success" />
        <Metric value="142" label="Tickets Hoje" tone="danger" />
        <Metric value="3" label="Itens Atrasados" tone="warning" />
      </View>
      <View style={[styles.listPanel, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.panelTitle, { color: colors.foreground }]}>Por Estação</Text>
        {CHEF_STATIONS.map(([station, time, sla, tickets, tone]) => (
          <View key={station} style={styles.chefStationRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <ChefHat size={15} color={colors.foregroundSecondary} />
              <Text style={[styles.staffName, { color: colors.foreground }]}>{station}</Text>
            </View>
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{time}</Text>
            <Text style={[styles.staffName, { color: V2_TONE[tone as V2Tone].text }]}>{sla}</Text>
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{tickets}</Text>
          </View>
        ))}
      </View>
      <ProfileActive colors={colors} roleName="Chef" />
    </View>
  );
}

function ChefCostView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <Zap size={16} color="#FF8A7A" />
        <Text style={[styles.tipBannerText, { color: '#FF8A7A' }]}>CMV por prato, fichas técnicas e margem de contribuição</Text>
      </View>
      <View style={styles.threeMetricGrid}>
        <CompactMetric value="32%" label="CMV Médio" tone="danger" />
        <CompactMetric value="68%" label="Margem Média" tone="success" />
        <CompactMetric value="3" label="CMV Alto" tone="warning" />
      </View>
      <View style={[styles.listPanel, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.panelTitle, { color: colors.foreground }]}>Top Pratos por Margem</Text>
        {CHEF_MARGINS.map(([name, desc, margin, tone]) => (
          <View key={name} style={styles.marginRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.staffName, { color: colors.foreground }]}>{name}</Text>
              <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{desc}</Text>
            </View>
            <Text style={[styles.compactMetricValue, { color: V2_TONE[tone as V2Tone].text }]}>{margin}</Text>
          </View>
        ))}
      </View>
      <ProfileActive colors={colors} roleName="Chef" />
    </View>
  );
}

function ChefMenuView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {['Entradas', 'Pratos Principais', 'Sobremesas', 'Bebidas'].map((item, index) => (
          <View key={item} style={[styles.filterChip, { backgroundColor: index === 0 ? '#FF5A3D' : '#F3F4F6' }]}>
            <Text style={[styles.filterText, { color: index === 0 ? '#FFF' : '#64748B' }]}>{item}</Text>
          </View>
        ))}
      </ScrollView>
      {CHEF_MENU_ITEMS.map(([name, desc, price, image]) => (
        <View key={name} style={[styles.menuEditorCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Image source={{ uri: image }} style={styles.menuEditorImage} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.approvalTitle, { color: colors.foreground }]}>{name}</Text>
            <Text numberOfLines={2} style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{desc}</Text>
          </View>
          <Text style={styles.menuEditorPrice}>{price}</Text>
        </View>
      ))}
      <ProfileActive colors={colors} roleName="Chef" />
    </View>
  );
}

function ChefStockView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <ManagerStockView colors={colors} roleName="Chef" />;
}

function MaitreReservationsView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={styles.metricGrid}>
        <Metric value="5" label="Reservas Hoje" tone="danger" />
        <Metric value="4" label="Mesas Livres" tone="success" />
      </View>
      <SectionTitle title="Reservas confirmadas" colors={colors} />
      {MAITRE_RESERVATIONS.map((reservation) => (
        <View key={reservation.name} style={[styles.reservationCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.managerOrderHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.reservationTitle, { color: colors.foreground }]}>{reservation.name}</Text>
              <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{reservation.time}</Text>
            </View>
            <StatusChip label={reservation.status} tone={reservation.tone} />
          </View>
          {!!reservation.note && <Text style={[styles.reservationNote, { color: colors.foregroundSecondary }]}>{reservation.note}</Text>}
        </View>
      ))}
      <ProfileActive colors={colors} roleName="Maître" />
    </View>
  );
}

function MaitreFlowView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={styles.metricGrid}>
        <Metric value="25min" label="Fila estimada" tone="warning" />
        <Metric value="4" label="Mesas livres" tone="success" />
      </View>
      <SectionTitle title="Fluxo atual" colors={colors} />
      {MAITRE_RESERVATIONS.slice(0, 4).map((reservation) => (
        <View key={reservation.name} style={[styles.flowCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.reservationTitle, { color: colors.foreground }]}>{reservation.name}</Text>
          <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>
            {reservation.time} · {reservation.status}
          </Text>
        </View>
      ))}
      <ProfileActive colors={colors} roleName="Maître" />
    </View>
  );
}

function MaitreTablesView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <Text style={styles.tipBannerText}>No mobile, o mapa vira uma grade operacional rápida para seleção e ação.</Text>
      </View>
      <View style={styles.tableGrid}>
        {MANAGER_TABLES.map((table) => (
          <View key={table.number} style={[styles.tableCard, table.number === 1 && { borderColor: '#FF5A3D' }]}>
            <View style={styles.managerOrderHeader}>
              <Text style={[styles.tableTitle, { color: colors.foreground }]}>{table.number}</Text>
              <StatusChip label={table.status} tone={table.tone} />
            </View>
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{table.seats}</Text>
            {!!table.guest && <Text style={[styles.staffName, { color: colors.foreground }]}>{table.guest}</Text>}
          </View>
        ))}
      </View>
      <View style={[styles.listPanel, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.managerOrderHeader}>
          <View>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>Mesa 1</Text>
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>Maria S.</Text>
          </View>
          <StatusChip label="Ocupada" tone="danger" />
        </View>
        <View style={styles.metricGrid}>
          <Metric value="2" label="Lugares" tone="info" />
          <Metric value="R$ 186" label="Conta" tone="danger" />
        </View>
        <TouchableOpacity style={[styles.wideAction, { backgroundColor: '#38BDF8' }]}>
          <Text style={[styles.wideActionText, { color: '#FFF' }]}>Fechar conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MaitreManagementView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <Zap size={16} color="#FF5A3D" />
        <Text style={styles.tipBannerText}>Gestão completa de reservas — confirmação, grupos e no-show</Text>
      </View>
      <View style={styles.threeMetricGrid}>
        <CompactMetric value="12" label="Hoje" tone="info" />
        <CompactMetric value="9" label="Confirmadas" tone="success" />
        <CompactMetric value="3" label="Pendentes" tone="warning" />
      </View>
      {MAITRE_MANAGEMENT.map((reservation) => (
        <View key={reservation.name} style={[styles.managementCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.managerOrderHeader}>
            <Text style={[styles.reservationTitle, { color: colors.foreground }]}>{reservation.name}</Text>
            <StatusChip label={reservation.status} tone={reservation.tone} />
          </View>
          <View style={styles.managementMetaGrid}>
            <MetaLine icon={Clock} label={reservation.time} color={colors.foregroundSecondary} />
            <MetaLine icon={Users} label={reservation.people} color={colors.foregroundSecondary} />
            <MetaLine icon={UtensilsCrossed} label={reservation.table} color={colors.foregroundSecondary} />
            <MetaLine icon={Phone} label={reservation.phone} color={colors.foregroundSecondary} />
          </View>
        </View>
      ))}
      <ProfileActive colors={colors} roleName="Maître" />
    </View>
  );
}

function ManagerDashboardTab({
  setView,
  colors,
}: {
  setView: (view: ManagerRoleView) => void;
  onNavigate: (s: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.metricGrid}>
        <Metric value="8" label="Pedidos ativos" tone="danger" />
        <Metric value="4" label="Aprovações" tone="warning" />
        <Metric value="9" label="Equipe ativa" tone="info" />
        <Metric value="R$ 13.742" label="Receita" tone="success" />
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setView('manager-orders')}
        style={[styles.delayAlert, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}
      >
        <AlertCircle size={16} color={V2_TONE.danger.text} />
        <Text style={[styles.delayAlertText, { color: V2_TONE.danger.text }]}>3 pedidos com atraso</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setView('manager-approvals')}
        style={[styles.managerShortcut, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.managerShortcutTitle, { color: colors.foreground }]}>Central de aprovações</Text>
          <Text style={[styles.managerShortcutSubtitle, { color: colors.foregroundSecondary }]}>
            Cancelamentos, cortesias e estornos
          </Text>
        </View>
        <ArrowRight size={20} color={colors.foregroundSecondary} />
      </TouchableOpacity>

      <View style={styles.managerApprovalList}>
        {MANAGER_APPROVALS.map((approval) => (
          <View key={approval.title} style={[styles.approvalCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.approvalTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.approvalTitle, { color: colors.foreground }]}>{approval.title}</Text>
                <Text style={[styles.approvalMeta, { color: colors.foregroundSecondary }]}>{approval.meta}</Text>
                <Text style={[styles.approvalReason, { color: colors.foregroundSecondary }]}>{approval.reason}</Text>
              </View>
              <Text style={styles.approvalAmount}>{approval.amount}</Text>
            </View>
            <View style={styles.approvalActions}>
              <TouchableOpacity style={[styles.approvalButton, { backgroundColor: '#35B36F' }]}>
                <CheckCircle size={16} color="#FFF" />
                <Text style={styles.approvalButtonText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.approvalButton, { backgroundColor: '#FDEAEA' }]}>
                <XCircle size={16} color="#EF4444" />
                <Text style={[styles.approvalButtonText, { color: '#EF4444' }]}>Recusar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.managerStaffList}>
        {MANAGER_STAFF.map((member) => (
          <View key={member.name} style={[styles.staffCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Image source={{ uri: member.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.staffName, { color: colors.foreground }]}>{member.name}</Text>
              <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{member.role}</Text>
            </View>
            <Text style={styles.staffStatus}>Ativo</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ManagerOrdersView({ colors }: { colors: ReturnType<typeof useColors> }) {
  const { data: orders, loading, error, refresh } = useRestaurantOrders();

  return (
    <View style={styles.section}>
      <View style={styles.filterRow}>
        {['Todos', 'Pendente', 'Confirmado', 'Preparando'].map((filter, index) => (
          <View key={filter} style={[styles.filterChip, { backgroundColor: index === 0 ? colors.primary : colors.backgroundSecondary }]}>
            <Text style={[styles.filterText, { color: index === 0 ? '#FFF' : colors.foregroundSecondary }]}>{filter}</Text>
          </View>
        ))}
      </View>
      {loading ? (
        <InlineNotice message="Carregando pedidos..." colors={colors} />
      ) : error ? (
        <InlineNotice message={error} actionLabel="Recarregar" onPress={() => void refresh()} colors={colors} />
      ) : orders.length === 0 ? (
        <InlineNotice message="Nenhum pedido ativo." colors={colors} />
      ) : orders.map((order) => (
        <View key={order.id} style={[styles.managerOrderCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.orderRow}>
            <View style={styles.tableNumberBubble}>
              <Text style={styles.tableNumberText}>{order.table.replace('Mesa ', '')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.managerOrderHeader}>
                <Text style={[styles.approvalTitle, { color: colors.foreground }]}>{order.customerName || shortOrderId(order.id)}</Text>
                <StatusChip label={orderStatusLabel(order.status)} tone={orderStatusTone(order.status)} />
              </View>
              <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{order.items.length} itens · {formatCurrency(order.total)} · {order.time}</Text>
              <View style={styles.orderItemChips}>
                {order.items.slice(0, 2).map((item) => (
                  <Text key={item} style={styles.orderItemChip}>{item}</Text>
                ))}
              </View>
            </View>
          </View>
          <TouchableOpacity style={[styles.wideAction, { backgroundColor: order.status === 'preparing' ? '#35B36F' : '#F6A21A' }]}>
            <Text style={[styles.wideActionText, { color: order.status === 'preparing' ? '#FFF' : '#111827' }]}>{order.status === 'preparing' ? 'Marcar pronto' : 'Preparar'}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function ManagerApprovalsView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      {[...MANAGER_APPROVALS, { title: 'Ceviche Peruano', amount: 'R$ 48', meta: 'Mesa 1 · Bruno Oliveira', reason: 'Prato devolvido — não atendeu expectativa' }, { title: 'Conta Mesa 3', amount: 'R$ 31', meta: 'Mesa 3 · Marina Costa', reason: '10% desconto fidelidade' }].map((approval) => (
        <View key={approval.title} style={[styles.approvalCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.approvalTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.approvalTitle, { color: colors.foreground }]}>{approval.title}</Text>
              <Text style={[styles.approvalMeta, { color: colors.foregroundSecondary }]}>{approval.meta}</Text>
              <Text style={[styles.approvalReason, { color: colors.foregroundSecondary }]}>{approval.reason}</Text>
            </View>
            <Text style={styles.approvalAmount}>{approval.amount}</Text>
          </View>
          <View style={styles.approvalActions}>
            <TouchableOpacity style={[styles.approvalButton, { backgroundColor: '#35B36F' }]}>
              <Text style={styles.approvalButtonText}>Aprovar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.approvalButton, { backgroundColor: '#FDEAEA' }]}>
              <Text style={[styles.approvalButtonText, { color: '#EF4444' }]}>Recusar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <ProfileActive colors={colors} />
    </View>
  );
}

function ManagerCashView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: '#FFF1ED', borderColor: '#FED7CC' }]}>
        <Zap size={16} color="#FF5A3D" />
        <Text style={styles.tipBannerText}>Controle completo do caixa — abertura, sangria, reforço e fechamento</Text>
      </View>
      <View style={[styles.cashSummary, { borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }]}>
        <View style={styles.cashStatusRow}>
          <View style={styles.statusDot} />
          <Text style={[styles.approvalTitle, { color: colors.foreground }]}>Caixa Aberto</Text>
          <Text style={[styles.cashBy, { color: colors.foregroundSecondary }]}>Aberto por Marina Costa às 14:00</Text>
        </View>
        <View style={styles.cashMetricRow}>
          <CashMetric label="Abertura" value="R$ 500" />
          <CashMetric label="Entradas" value="R$ 8.420" success />
          <CashMetric label="Saldo" value="R$ 3.180" />
        </View>
      </View>
      <View style={[styles.listPanel, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.panelTitle, { color: colors.foreground }]}>Movimentações</Text>
        {MANAGER_CASH_MOVES.map((move) => {
          const Icon = move.icon;
          return (
            <View key={move.label} style={[styles.cashMoveRow, { borderBottomColor: colors.border }]}>
              <Icon size={18} color={colors.foregroundSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.staffName, { color: colors.foreground }]}>{move.label}</Text>
                <Text style={[styles.approvalMeta, { color: colors.foregroundSecondary }]}>{move.time}</Text>
              </View>
              <Text style={[styles.cashValue, { color: move.tone === 'success' ? '#22C55E' : '#EF4444' }]}>{move.value}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.cashActions}>
        <TouchableOpacity style={[styles.cashAction, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}><Text style={[styles.cashActionText, { color: '#F59E0B' }]}>Sangria</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.cashAction, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}><Text style={[styles.cashActionText, { color: '#3B82F6' }]}>Reforço</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.cashAction, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}><Text style={[styles.cashActionText, { color: '#EF4444' }]}>Fechar Caixa</Text></TouchableOpacity>
      </View>
      <ProfileActive colors={colors} />
    </View>
  );
}

function ManagerTablesView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <Text style={styles.tipBannerText}>No mobile, o mapa vira uma grade operacional rápida para seleção e ação.</Text>
      </View>
      <View style={styles.tableGrid}>
        {MANAGER_TABLES.map((table) => (
          <View key={table.number} style={[styles.tableCard, table.number === 1 && { borderColor: '#FF5A3D' }]}>
            <View style={styles.managerOrderHeader}>
              <Text style={[styles.tableTitle, { color: colors.foreground }]}>{table.number}</Text>
              <StatusChip label={table.status} tone={table.tone} />
            </View>
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{table.seats}</Text>
            {!!table.guest && <Text style={[styles.staffName, { color: colors.foreground }]}>{table.guest}</Text>}
          </View>
        ))}
      </View>
      <View style={[styles.listPanel, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.managerOrderHeader}>
          <View><Text style={[styles.panelTitle, { color: colors.foreground }]}>Mesa 1</Text><Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>Maria S.</Text></View>
          <StatusChip label="Ocupada" tone="danger" />
        </View>
        <View style={styles.metricGrid}>
          <Metric value="2" label="Lugares" tone="info" />
          <Metric value="R$ 186" label="Conta" tone="danger" />
        </View>
      </View>
    </View>
  );
}

function ManagerStaffView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.managerStaffList}>
      {[...MANAGER_STAFF, { name: 'Carla Lima', role: 'Garçom · 12h–18h', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100' }, { name: 'Diego Martins', role: 'Barman · Folga', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100' }, { name: 'Juliana Ferraz', role: 'Hostess · 18h–00h', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100' }].map((member) => (
        <View key={member.name} style={[styles.staffCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Image source={{ uri: member.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.staffName, { color: colors.foreground }]}>{member.name}</Text>
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{member.role}</Text>
          </View>
          <Text style={[styles.staffStatus, member.role.includes('Folga') && { color: colors.foregroundSecondary }]}>{member.role.includes('Folga') ? 'Folga' : 'Ativo'}</Text>
        </View>
      ))}
    </View>
  );
}

function ManagerReportView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={styles.metricGrid}>
        <Metric value="R$ 13.182" label="Receita dia" tone="success" />
        <Metric value="50" label="Pedidos" tone="danger" />
      </View>
      <View style={[styles.listPanel, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.panelTitle, { color: colors.foreground }]}>Fechamento operacional</Text>
        {['Caixa conciliado', 'Equipe encerrada', 'Estoque revisado', 'Pendências zeradas'].map((item) => (
          <View key={item} style={styles.checkRow}>
            <CheckCircle size={15} color="#22C55E" />
            <Text style={[styles.staffName, { color: colors.foreground }]}>{item}</Text>
          </View>
        ))}
      </View>
      <ProfileActive colors={colors} />
    </View>
  );
}

function ManagerStockView({ colors, roleName = 'Gerente' }: { colors: ReturnType<typeof useColors>; roleName?: string }) {
  return (
    <View style={styles.managerStaffList}>
      {MANAGER_STOCK.map(([name, group, qty, tone]) => (
        <View key={name} style={[styles.stockRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View>
            <Text style={[styles.approvalTitle, { color: colors.foreground }]}>{name}</Text>
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{group}</Text>
          </View>
          <StatusChip label={qty} tone={tone} />
        </View>
      ))}
      <ProfileActive colors={colors} roleName={roleName} />
    </View>
  );
}

function ManagerPromotionsView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <Zap size={16} color="#FF5A3D" />
        <Text style={styles.tipBannerText}>Campanhas ativas, cupons e happy hour</Text>
      </View>
      {MANAGER_CAMPAIGNS.map(([title, desc, usage]) => (
        <View key={title} style={[styles.campaignCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.managerOrderHeader}>
            <Text style={[styles.approvalTitle, { color: colors.foreground }]}>{title}</Text>
            <StatusChip label="Ativa" tone="success" />
          </View>
          <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{desc}</Text>
          <Text style={[styles.approvalMeta, { color: colors.foregroundSecondary }]}>{usage}</Text>
        </View>
      ))}
      <ProfileActive colors={colors} />
    </View>
  );
}

function ManagerQrView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <Zap size={16} color="#FF5A3D" />
        <Text style={styles.tipBannerText}>Gere QR codes para mesas — individual ou em lote</Text>
      </View>
      <View style={styles.metricGrid}>
        <QuickAction title="QR Individual" detail="Gerar por mesa" icon={QrCode} onPress={() => {}} colors={colors} />
        <QuickAction title="QR em Lote" detail="Todas as mesas" icon={ArrowDown} onPress={() => {}} colors={colors} />
      </View>
      <View style={[styles.listPanel, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.panelTitle, { color: colors.foreground }]}>QR Codes Gerados</Text>
        <View style={styles.qrGrid}>
          {Array.from({ length: 12 }, (_, index) => (
            <View key={index} style={styles.qrItem}>
              <View style={styles.qrBox}><QrCode size={30} color="#9CA3AF" /></View>
              <Text style={styles.qrLabel}>Mesa {index + 1}</Text>
            </View>
          ))}
        </View>
      </View>
      <ProfileActive colors={colors} />
    </View>
  );
}

function ManagerSettingsView({
  colors,
  setView,
}: {
  colors: ReturnType<typeof useColors>;
  setView: (view: ManagerRoleView) => void;
}) {
  const routeByTitle: Record<string, ManagerRoleView> = {
    'Mapa do Salão': 'manager-tables',
    'Equipe & Permissões': 'manager-staff',
    Cardápio: 'manager-stock',
    Pagamentos: 'manager-cash',
  };
  return (
    <View style={styles.section}>
      <View style={styles.configHero}>
        <View style={styles.configIcon}><Settings size={24} color="#FF5A3D" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.configTitle}>Central de Configuração</Text>
          <Text style={styles.configSub}>Omakase Sushi · Fine Dining</Text>
          <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
        </View>
        <Text style={styles.configPercent}>72%</Text>
      </View>
      <View style={styles.configStats}>
        <Metric value="1" label="Completos" tone="success" />
        <Metric value="5" label="Configurados" tone="danger" />
        <Metric value="3" label="Pendentes" tone="warning" />
      </View>
      {MANAGER_CONFIG.map(([title, subtitle, Icon, tone]) => (
        <TouchableOpacity
          key={title}
          onPress={() => {
            const view = routeByTitle[title];
            if (view) setView(view);
          }}
          style={[styles.configRow, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <View style={styles.configRowIcon}><Icon size={20} color={V2_TONE[tone as V2Tone].text} /></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.staffName, { color: colors.foreground }]}>{title}</Text>
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{subtitle}</Text>
            <View style={styles.configMiniTrack}><View style={[styles.configMiniFill, { backgroundColor: V2_TONE[tone as V2Tone].text }]} /></View>
          </View>
          <ArrowRight size={18} color={colors.foregroundSecondary} />
        </TouchableOpacity>
      ))}
      <ProfileActive colors={colors} />
    </View>
  );
}

function WaiterContent({
  view,
  colors,
}: {
  view: WaiterRoleView;
  colors: ReturnType<typeof useColors>;
}) {
  if (view === 'waiter-assistance') return <WaiterAssistanceView colors={colors} />;
  if (view === 'waiter-table-charge') return <WaiterChargeView colors={colors} />;
  if (view === 'waiter-tap-to-pay') return <WaiterTapToPayView colors={colors} />;
  if (view === 'waiter-order-management') return <WaiterOrdersView colors={colors} />;
  if (view === 'waiter-table-map') return <WaiterTableMapView colors={colors} />;
  if (view === 'waiter-tips') return <WaiterTipsView colors={colors} />;
  return <WaiterCommandView activeSegment={view === 'waiter-table-actions' ? 'Mesas' : 'Ao Vivo'} colors={colors} />;
}

function WaiterCommandView({
  activeSegment,
  colors,
}: {
  activeSegment: string;
  colors: ReturnType<typeof useColors>;
}) {
  const events = [
    ['danger', 'M5', 'agora', 'AGORA', 'Prato pronto para retirar', '2x Filé ao Molho de Vinho — Chef Felipe', 'Retirar'],
    ['danger', 'M10', '1min', 'AGORA', 'Sobremesa pronta', '1x Petit Gâteau — Cozinheiro Thiago', 'Retirar'],
    ['warning', 'M3', '2min', '', 'Cliente chamou o garçom', 'Convidado 3 sem app quer fazer pedido', 'Atender'],
    ['success', 'M8', '3min', '', 'Pagamento recebido pelo app', 'Rafael C. pagou R$ 85 via Apple Pay', ''],
    ['danger', 'M1', '5min', '', 'Conta solicitada', '1 convidado sem app precisa de cobrança', 'Cobrar'],
    ['info', 'M10', '8min', '', 'Cortesia solicitada', 'Aniversário — solicitar Petit Gâteau ao gerente', 'Solicitar'],
  ] as const;

  return (
    <View style={styles.section}>
      <WaiterStats />
      <WaiterSegments active={activeSegment} />
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <ChefHat size={16} color="#FF5A3D" />
        <Text style={styles.tipBannerText}>2 prato(s) esperando retirada! A cozinha está aguardando</Text>
        <StatusChip label="Ver" tone="danger" />
      </View>
      {events.map(([tone, badge, time, tag, title, detail, action]) => (
        <View
          key={`${badge}-${title}`}
          style={[
            styles.managerOrderCard,
            {
              borderColor:
                tone === 'danger'
                  ? '#FECACA'
                  : tone === 'warning'
                    ? '#FED7AA'
                    : tone === 'success'
                      ? '#BBF7D0'
                      : '#BAE6FD',
              backgroundColor: colors.card,
            },
          ]}
        >
          <View style={styles.managerOrderHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={[styles.configRowIcon, { width: 36, height: 36, borderRadius: 18, backgroundColor: V2_TONE[tone].bg }]}>
                {tone === 'success' ? <CheckCircle size={17} color={V2_TONE[tone].text} /> : tone === 'warning' ? <AlertCircle size={17} color={V2_TONE[tone].text} /> : <ChefHat size={17} color={V2_TONE[tone].text} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <StatusChip label={badge} tone="danger" />
                  <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{time}</Text>
                  {tag ? <StatusChip label={tag} tone="danger" /> : null}
                </View>
                <Text style={[styles.staffName, { color: colors.foreground, marginTop: 4 }]}>{title}</Text>
                <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{detail}</Text>
              </View>
            </View>
          </View>
          {action ? (
            <TouchableOpacity style={[styles.wideAction, { backgroundColor: V2_TONE[tone].bg }]}>
              <Text style={[styles.wideActionText, { color: V2_TONE[tone].text }]}>{action} →</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
      <ProfileActive colors={colors} roleName="Garçom" />
    </View>
  );
}

function WaiterAssistanceView({ colors }: { colors: ReturnType<typeof useColors> }) {
  const tables = [
    ['1', 'Maria S.', '2 pessoas'],
    ['3', 'João & Ana', '4 pessoas'],
    ['5', 'Grupo Pedro', '6 pessoas'],
    ['6', 'Lucia F.', '2 pessoas'],
  ];

  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <Zap size={16} color="#FF5A3D" />
        <Text style={styles.tipBannerText}>Hub de assistência — tudo que o garçom precisa para ser gestor da experiência do cliente</Text>
      </View>
      <View style={styles.filterRow}>
        {['QR / Onboarding (5)', 'Alérgenos (4)'].map((label, index) => (
          <View key={label} style={[styles.filterChip, { backgroundColor: index === 0 ? '#FF5A3D' : '#F3F4F6' }]}>
            <Text style={[styles.filterText, { color: index === 0 ? '#FFF' : '#6B7280' }]}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.tipBanner, { backgroundColor: '#EFF6FF', borderColor: '#BAE6FD' }]}>
        <QrCode size={18} color="#0EA5E9" />
        <Text style={[styles.tipBannerText, { color: '#0284C7' }]}>Onboarding de Clientes — mostre o QR code da mesa</Text>
      </View>
      {tables.map(([table, name, people]) => (
        <View key={table} style={[styles.staffCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.tableNumberBubble}><Text style={styles.tableNumberText}>{table}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.reservationTitle, { color: colors.foreground }]}>{name}</Text>
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{people}</Text>
          </View>
          <StatusChip label="Mostrar QR" tone="danger" />
        </View>
      ))}
    </View>
  );
}

function WaiterChargeView({ colors }: { colors: ReturnType<typeof useColors> }) {
  const tables = [
    ['1', 'Maria S.', '0 pago · 1 no app · 1 sem app', '0/2'],
    ['3', 'João & Ana', '1 pago · 1 no app · 1 sem app', '1/3'],
    ['5', 'Grupo Pedro', '1 pago · 1 no app · 1 sem app', '1/3'],
  ];

  return (
    <View style={styles.section}>
      <WaiterStats />
      <WaiterSegments active="Cobrar" />
      <View style={[styles.tipBanner, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
        <CreditCardIcon size={16} color="#F97316" />
        <Text style={[styles.tipBannerText, { color: '#EA580C' }]}>Cobrança inteligente — cobre apenas quem precisa.</Text>
      </View>
      {tables.map(([table, name, summary, progress]) => (
        <View key={table} style={[styles.managerOrderCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.managerOrderHeader}>
            <View style={styles.tableNumberBubble}><Text style={styles.tableNumberText}>{table}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.staffName, { color: colors.foreground }]}>{name}</Text>
              <Text style={[styles.approvalMeta, { color: '#F97316' }]}>{summary}</Text>
            </View>
            <StatusChip label={progress} tone="success" />
          </View>
          <View style={styles.checkRow}>
            <StatusChip label="Sem app" tone="warning" />
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary, flex: 1 }]}>Cobrança manual pendente</Text>
            <StatusChip label="Cobrar" tone="danger" />
          </View>
        </View>
      ))}
    </View>
  );
}

function WaiterTapToPayView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <Zap size={16} color="#FF5A3D" />
        <Text style={styles.tipBannerText}>Transforme o celular em maquininha NFC — Stripe Terminal</Text>
      </View>
      <View style={[styles.listPanel, { borderColor: '#FED7AA', backgroundColor: colors.card, alignItems: 'center' }]}>
        <Phone size={54} color="#FF5A3D" />
        <Text style={[styles.panelTitle, { color: colors.foreground, marginTop: 14 }]}>TAP to Pay</Text>
        <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>Pronto para receber pagamento</Text>
        <Text style={[styles.reservationTitle, { color: colors.foreground, marginTop: 20, fontSize: 24 }]}>R$ 342,50</Text>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF5A3D', alignSelf: 'stretch' }]}>
          <Text style={{ color: '#FFF', fontWeight: '800', textAlign: 'center' }}>Iniciar Cobrança</Text>
        </TouchableOpacity>
      </View>
      <ProfileActive colors={colors} roleName="Garçom" />
    </View>
  );
}

function WaiterOrdersView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={styles.filterRow}>
        {['Todos', 'Pendente', 'Confirmado', 'Preparando'].map((label, index) => (
          <View key={label} style={[styles.filterChip, { backgroundColor: index === 0 ? '#FF5A3D' : '#F3F4F6' }]}>
            <Text style={[styles.filterText, { color: index === 0 ? '#FFF' : '#6B7280' }]}>{label}</Text>
          </View>
        ))}
      </View>
      {[
        ['7', 'Maria Silva', '2 itens · R$ 162 · 10min atrás'],
        ['9', 'Camila Rodrigues', '3 itens · R$ 174 · 11min atrás'],
        ['12', 'Felipe Almeida', '3 itens · R$ 194 · 14min atrás'],
      ].map(([table, name, meta]) => (
        <View key={`${table}-${name}`} style={[styles.managerOrderCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.managerOrderHeader}>
            <View style={styles.tableNumberBubble}><Text style={styles.tableNumberText}>{table}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.staffName, { color: colors.foreground }]}>{name}</Text>
              <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{meta}</Text>
              <View style={styles.orderItemChips}>
                <Text style={styles.orderItemChip}>1x Gin Tônica Aurora</Text>
                <Text style={styles.orderItemChip}>1x Ravioli de Lagosta</Text>
              </View>
            </View>
            <StatusChip label="Confirmado" tone="info" />
          </View>
          <TouchableOpacity style={[styles.wideAction, { backgroundColor: '#F59E0B' }]}>
            <Text style={[styles.wideActionText, { color: '#111827' }]}>Preparar</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function WaiterTableMapView({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <View style={[styles.tipBanner, { backgroundColor: V2_TONE.danger.bg, borderColor: '#FECACA' }]}>
        <Text style={styles.tipBannerText}>No mobile, o mapa vira uma grade operacional rápida para seleção e ação.</Text>
      </View>
      <View style={styles.tableGrid}>
        {MANAGER_TABLES.map((table) => (
          <View key={table.number} style={[styles.tableCard, table.number === 1 && { borderColor: '#FF5A3D' }]}>
            <View style={styles.managerOrderHeader}>
              <Text style={styles.tableTitle}>{table.number}</Text>
              <StatusChip label={table.status} tone={table.tone} />
            </View>
            <Text style={styles.metricLabel}>{table.seats}</Text>
            {table.guest ? <Text numberOfLines={1} style={[styles.staffName, { color: colors.foreground }]}>{table.guest}</Text> : null}
          </View>
        ))}
      </View>
      <View style={[styles.listPanel, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.managerOrderHeader}>
          <View>
            <Text style={[styles.panelTitle, { color: colors.foreground, marginBottom: 2 }]}>Mesa 1</Text>
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>Maria S.</Text>
          </View>
          <StatusChip label="Ocupada" tone="danger" />
        </View>
        <View style={[styles.threeMetricGrid, { marginTop: 14 }]}>
          <Metric value="2" label="Lugares" tone="info" />
          <Metric value="R$ 186" label="Conta" tone="danger" />
        </View>
      </View>
    </View>
  );
}

function WaiterTipsView({ colors }: { colors: ReturnType<typeof useColors> }) {
  const rows = [
    ['8', 'Grupo Aniversário', '15% da conta', '+R$ 120'],
    ['5', 'Grupo Pedro', '12% da conta', '+R$ 85'],
    ['10', 'Carlos M.', '10% da conta', '+R$ 98'],
    ['3', 'João & Ana', '10% da conta', '+R$ 62'],
    ['1', 'Maria S.', '15% da conta', '+R$ 45'],
  ];

  return (
    <View style={styles.section}>
      <View style={[styles.listPanel, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <StatusChip label="R$ 410" tone="success" />
        <Text style={[styles.staffRole, { color: colors.foregroundSecondary, marginTop: 12 }]}>Gorjetas do dia</Text>
      </View>
      {rows.map(([table, name, percent, amount]) => (
        <View key={table} style={[styles.staffCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={[styles.tableNumberBubble, { backgroundColor: '#ECFDF5' }]}><Text style={[styles.tableNumberText, { color: '#22C55E' }]}>{table}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.staffName, { color: colors.foreground }]}>{name}</Text>
            <Text style={[styles.staffRole, { color: colors.foregroundSecondary }]}>{percent}</Text>
          </View>
          <Text style={{ color: '#22C55E', fontWeight: '800' }}>{amount}</Text>
        </View>
      ))}
      <ProfileActive colors={colors} roleName="Garçom" />
    </View>
  );
}

function WaiterStats() {
  return (
    <View style={styles.configStats}>
      <CompactMetric value="6" label="Mesas" tone="danger" />
      <CompactMetric value="2" label="Retirar" tone="danger" />
      <CompactMetric value="5" label="Chamados" tone="danger" />
      <CompactMetric value="R$410" label="Gorjetas" tone="warning" />
    </View>
  );
}

function WaiterSegments({ active }: { active: string }) {
  return (
    <View style={styles.filterRow}>
      {['Ao Vivo', 'Mesas', 'Cozinha', 'Cobrar'].map((label) => (
        <View key={label} style={[styles.filterChip, { backgroundColor: active === label ? '#FFF' : '#F8FAFC', borderWidth: active === label ? 1 : 0, borderColor: '#E5E7EB' }]}>
          <Text style={[styles.filterText, { color: active === label ? '#111827' : '#6B7280' }]}>{label}</Text>
        </View>
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
        <Text style={{ color: colors.foregroundSecondary, fontSize: 10, fontWeight: '700' }}>VISÃO POR CARGO</Text>
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

function CompactMetric({ value, label, tone }: { value: string; label: string; tone: V2Tone }) {
  return (
    <View style={[styles.compactMetricCard, { borderColor: '#E2E8F0' }]}>
      <Text style={[styles.compactMetricValue, { color: V2_TONE[tone].text }]}>{value}</Text>
      <Text numberOfLines={1} style={styles.metricLabel}>{label}</Text>
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

function InlineNotice({
  message,
  actionLabel,
  onPress,
  colors,
}: {
  message: string;
  actionLabel?: string;
  onPress?: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.inlineNotice, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Text style={{ color: colors.foregroundSecondary, flex: 1 }}>{message}</Text>
      {actionLabel && onPress ? (
        <TouchableOpacity onPress={onPress} style={[styles.inlineNoticeBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function CompactOrder({ order, colors }: { order: TabOrder; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.orderCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={styles.orderRow}>
        <View style={[styles.orderInitials, { backgroundColor: `${colors.primary}18` }]}>
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>
            {shortOrderId(order.id).replace('#', '')}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: colors.foreground }}>{order.customerName || shortOrderId(order.id)}</Text>
          <Text style={{ fontSize: 12, color: colors.foregroundSecondary }}>{order.table} · {order.items.length} itens · {formatCurrency(order.total)}</Text>
        </View>
        <V2StatusBadge label={orderStatusLabel(order.status)} tone={orderStatusTone(order.status)} />
      </View>
    </View>
  );
}

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: V2Tone;
}) {
  return (
    <Text style={[styles.statusChip, { color: V2_TONE[tone].text, backgroundColor: V2_TONE[tone].bg }]}>
      {label}
    </Text>
  );
}

function CashMetric({ label, value, success }: { label: string; value: string; success?: boolean }) {
  return (
    <View style={styles.cashMetric}>
      <Text style={styles.cashMetricLabel}>{label}</Text>
      <Text style={[styles.cashMetricValue, success && { color: '#22C55E' }]}>{value}</Text>
    </View>
  );
}

function MetaLine({
  icon: Icon,
  label,
  color,
}: {
  icon: IconComponent;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.metaLine}>
      <Icon size={13} color="#7C2D8D" strokeWidth={2.2} />
      <Text numberOfLines={1} style={[styles.metaLineText, { color }]}>{label}</Text>
    </View>
  );
}

function ProfileActive({ colors, roleName = 'Gerente' }: { colors: ReturnType<typeof useColors>; roleName?: string }) {
  return (
    <View style={[styles.profileActive, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Text style={[styles.eyebrow, { color: colors.foregroundSecondary }]}>PERFIL ATIVO</Text>
      <Text style={[styles.staffName, { color: colors.foreground, marginTop: 6 }]}>{roleName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 88 },
  headerCard: { borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  headerText: { flex: 1 },
  signOutButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  signOutText: { fontSize: 12, fontWeight: '700' },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  headerTitle: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  headerHint: { fontSize: 11, marginTop: 4 },
  rolePicker: { marginTop: 12, borderRadius: 12, borderWidth: 1, padding: 8, position: 'relative' },
  roleScrollContent: { paddingRight: 34 },
  roleScrollHint: {
    position: 'absolute',
    right: 6,
    top: 0,
    bottom: 0,
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleScrollHintIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginRight: 8 },
  roleChipText: { fontSize: 12, fontWeight: '600' },
  section: { gap: 12 },
  banner: { borderRadius: 16, padding: 12 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { width: '47%', borderRadius: 16, borderWidth: 1, padding: 12, backgroundColor: '#FFF' },
  metricValue: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
  metricLabel: { marginTop: 12, fontSize: 12, color: '#64748B' },
  compactMetricCard: { flex: 1, minHeight: 70, borderRadius: 16, borderWidth: 1, padding: 12, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  compactMetricValue: { fontSize: 18, fontWeight: '800' },
  quickAction: { width: '47%', minHeight: 82, borderRadius: 16, borderWidth: 1, padding: 12 },
  inlineNotice: { borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  inlineNoticeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  orderCard: { borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 8 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  orderInitials: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { marginTop: 12, borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  delayAlert: {
    minHeight: 42,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  delayAlertText: { fontSize: 13, fontWeight: '700' },
  managerShortcut: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  managerShortcutTitle: { fontSize: 13, fontWeight: '700' },
  managerShortcutSubtitle: { fontSize: 12, marginTop: 2 },
  managerApprovalList: { gap: 10 },
  approvalCard: { borderRadius: 16, borderWidth: 1, padding: 12 },
  approvalTop: { flexDirection: 'row', gap: 8 },
  approvalTitle: { fontSize: 13, fontWeight: '700' },
  approvalMeta: { fontSize: 11, marginTop: 2 },
  approvalReason: { fontSize: 11, marginTop: 6 },
  approvalAmount: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  approvalActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  approvalButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  approvalButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  managerStaffList: { gap: 10 },
  staffCard: { borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  staffName: { fontSize: 13, fontWeight: '700' },
  staffRole: { fontSize: 12, marginTop: 2 },
  staffStatus: { color: '#22C55E', fontSize: 11, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  filterText: { fontSize: 11, fontWeight: '700' },
  managerOrderCard: { borderRadius: 16, borderWidth: 1, padding: 12 },
  managerOrderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  reservationCard: { minHeight: 78, borderRadius: 16, borderWidth: 1, padding: 12, justifyContent: 'center' },
  reservationTitle: { fontSize: 15, fontWeight: '800' },
  reservationNote: { fontSize: 11, marginTop: 10 },
  flowCard: { minHeight: 60, borderRadius: 16, borderWidth: 1, padding: 12, justifyContent: 'center' },
  threeMetricGrid: { flexDirection: 'row', gap: 12 },
  managementCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  managementMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  metaLine: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaLineText: { flex: 1, fontSize: 12, fontWeight: '600' },
  tableNumberBubble: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  tableNumberText: { color: '#FF5A3D', fontWeight: '800', fontSize: 16 },
  statusChip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 9, fontWeight: '800', overflow: 'hidden' },
  orderItemChips: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  orderItemChip: { backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: 10, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, overflow: 'hidden' },
  wideAction: { minHeight: 38, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  wideActionText: { fontSize: 13, fontWeight: '800' },
  tipBanner: { minHeight: 48, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipBannerText: { flex: 1, color: '#FF5A3D', fontSize: 12, fontWeight: '600', lineHeight: 17 },
  cashSummary: { borderRadius: 16, borderWidth: 1, padding: 14 },
  cashStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E' },
  cashBy: { marginLeft: 'auto', fontSize: 10 },
  cashMetricRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  cashMetric: { alignItems: 'center', flex: 1 },
  cashMetricLabel: { color: '#6B7280', fontSize: 12 },
  cashMetricValue: { color: '#111827', fontSize: 15, fontWeight: '800', marginTop: 4 },
  listPanel: { borderRadius: 16, borderWidth: 1, padding: 16 },
  panelTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  cashMoveRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  cashValue: { fontSize: 14, fontWeight: '800' },
  cashActions: { flexDirection: 'row', gap: 8 },
  cashAction: { flex: 1, minHeight: 38, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cashActionText: { fontSize: 12, fontWeight: '800' },
  tableGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tableCard: { width: '31.5%', minHeight: 94, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 10, backgroundColor: '#FFF' },
  tableTitle: { fontSize: 20, fontWeight: '800' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  stockRow: { borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  campaignCard: { borderRadius: 16, borderWidth: 1, minHeight: 98, padding: 14, justifyContent: 'center', gap: 8 },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  qrItem: { width: '22%', alignItems: 'center', gap: 6 },
  qrBox: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  qrLabel: { fontSize: 10, color: '#111827', fontWeight: '600' },
  configHero: { borderRadius: 18, backgroundColor: '#41383B', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  configIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#5A3431', alignItems: 'center', justifyContent: 'center' },
  configTitle: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  configSub: { color: '#E5E7EB', fontSize: 11, marginTop: 2 },
  progressTrack: { height: 7, borderRadius: 999, backgroundColor: '#6B7280', overflow: 'hidden', marginTop: 12 },
  progressFill: { width: '72%', height: '100%', backgroundColor: '#FF5A3D' },
  configPercent: { color: '#FFF', fontWeight: '800', alignSelf: 'flex-end' },
  configStats: { flexDirection: 'row', gap: 8 },
  configRow: { borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  configRowIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  configMiniTrack: { height: 4, borderRadius: 999, backgroundColor: '#E5E7EB', marginTop: 8, overflow: 'hidden' },
  configMiniFill: { width: '72%', height: '100%' },
  profileActive: { borderRadius: 16, borderWidth: 1, padding: 14 },
  roleHint: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  chefItemRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  chefApprovalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    marginTop: 12,
  },
  chefStationRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  marginRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  menuEditorCard: {
    minHeight: 78,
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuEditorImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
  },
  menuEditorPrice: {
    color: '#FF5A3D',
    fontSize: 12,
    fontWeight: '800',
  },
});
