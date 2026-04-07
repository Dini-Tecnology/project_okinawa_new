/**
 * TabletRestaurantScreens.tsx
 * 
 * Native tablet experience for the restaurant demo.
 * NOT "mobile stretched" — each screen is redesigned for ~700-900px width:
 * - 2-3 column grids instead of 1
 * - Side-by-side layouts (list + detail)
 * - Larger touch targets, more data density
 * - No PhoneShell chrome
 */
import React, { useMemo, useState } from 'react';
import {
  AlertCircle, ArrowRight, Bell, BookOpen, Check, CheckCircle2,
  ChefHat, ChevronLeft, Clock, DollarSign, Edit3, Flame,
  LayoutGrid, Package, Plus, Shield, ShoppingBag, Smartphone,
  Star, TrendingUp, UserPlus, Users, Wine, X, XCircle,
} from 'lucide-react';
import {
  ConfigHub, ConfigProfile, ConfigServiceTypes, ConfigExperience,
  ConfigFloor, ConfigMenu, ConfigTeam, ConfigKitchen, ConfigPayments, ConfigFeatures,
} from './ConfigHubScreens';
import { useDemoContext, type OrderStatus, type TableStatus } from '@/contexts/DemoContext';
import { WaiterAssistScreen } from './RoleScreens';
import {
  FinancialDashboardScreen, CashRegisterScreen, FiscalScreen, CostControlScreen, ForecastScreen,
  ChefApprovalsScreen, ChefTableScreen, KdsAnalyticsScreen, KdsBrainConfigScreen,
  CrmScreen, HrScreen, IntegrationsScreen, LoyaltyMgmtScreen, PromotionsMgmtScreen,
  QrCodesScreen, TapToPayScreen, ReportsScreen, ReviewsMgmtScreen, ReservationsMgmtScreen,
  ClubDoorScreen, ClubQueueMgmtScreen, ClubPromoterScreen, ClubVipMgmtScreen,
  DriveThruMgmtScreen, FoodTruckMgmtScreen, ConfigLanguageScreen, ConfigNotificationsScreen,
  QRScannerStaffScreen, StationSettingsScreen, MaitreDashboardScreen, RestaurantSettingsScreen as RestaurantSettingsExtScreen,
} from './ExtendedScreens';
import { WaiterTablesActions } from './WaiterTablesActions';
import { useDemoI18n } from '@/components/demo/DemoI18n';
import {
  DRINK_RECIPES, PENDING_APPROVALS, ROLE_CONFIG, SCREEN_INFO,
  STOCK_ITEMS, TEAM_MEMBERS, formatTimeAgo, getElapsedMinutes,
  type RestaurantScreen, type StaffRole,
} from './RestaurantDemoShared';
import {
  type TableGuest, KITCHEN_PIPELINE, LIVE_FEED, TABLE_GUESTS_DATA,
  getTableGuests, WAITER_MENU,
} from './ServiceScreens';

// ═══════════════════════════════════════════════
// SHARED HELPERS (tablet-sized)
// ═══════════════════════════════════════════════

const statusBadgeMap: Record<OrderStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  confirmed: 'bg-info/10 text-info',
  preparing: 'bg-warning/10 text-warning',
  ready: 'bg-success/10 text-success',
  delivered: 'bg-primary/10 text-primary',
  paid: 'bg-muted text-muted-foreground',
};

const orderLabelMap: Record<OrderStatus, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', preparing: 'Preparando',
  ready: 'Pronto', delivered: 'Entregue', paid: 'Pago',
};

const tableBadgeMap: Record<TableStatus, string> = {
  available: 'bg-success/10 text-success',
  occupied: 'bg-primary/10 text-primary',
  reserved: 'bg-warning/10 text-warning',
  billing: 'bg-info/10 text-info',
};

const tableLabelMap: Record<TableStatus, string> = {
  available: 'Livre', occupied: 'Ocupada', reserved: 'Reserva', billing: 'Conta',
};

const TabletSection: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, action, children }) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const TabletStat: React.FC<{ label: string; value: string; tone?: 'primary' | 'success' | 'warning' | 'info' }> = ({ label, value, tone = 'primary' }) => {
  const toneMap = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`inline-flex rounded-xl px-3 py-1.5 text-sm font-bold ${toneMap[tone]}`}>{value}</div>
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

const TabletHint: React.FC<{ text: string }> = ({ text }) => (
  <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs text-primary flex items-center gap-2">
    <Smartphone className="w-4 h-4 shrink-0" />
    {text}
  </div>
);

// ═══════════════════════════════════════════════
// DASHBOARD — 3-col KPIs, 2-col actions, wider order list
// ═══════════════════════════════════════════════

const TabletDashboard: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { analytics, orders, notifications, tables } = useDemoContext();
  const activeOrders = orders.filter(o => !['paid', 'delivered'].includes(o.status)).length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;

  return (
    <div className="space-y-6">
      <TabletHint text="Tablet: dashboard expandido com visão executiva de toda a operação em uma tela." />

      {/* KPIs — 4 columns */}
      <div className="grid grid-cols-4 gap-4">
        <TabletStat label="Receita Hoje" value={`R$ ${analytics.todayRevenue.toLocaleString()}`} tone="success" />
        <TabletStat label="Pedidos Ativos" value={String(activeOrders)} tone="primary" />
        <TabletStat label="Ocupação" value={`${analytics.occupancyRate}%`} tone="warning" />
        <TabletStat label="Ticket Médio" value={`R$ ${analytics.avgTicket}`} tone="info" />
      </div>

      {/* 2-column: actions + alerts */}
      <div className="grid grid-cols-2 gap-6">
        <TabletSection title="Ações rápidas" subtitle="Atalhos operacionais">
          <div className="grid grid-cols-2 gap-3">
            {[
              { screen: 'orders', icon: ShoppingBag, color: 'text-primary', label: 'Pedidos', desc: `${activeOrders} em andamento` },
              { screen: 'table-map', icon: LayoutGrid, color: 'text-info', label: 'Mesas', desc: `${tables.filter(t => t.status === 'occupied').length} ocupadas` },
              { screen: 'kds-kitchen', icon: ChefHat, color: 'text-warning', label: 'KDS Cozinha', desc: `${readyOrders} prontos` },
              { screen: 'analytics', icon: TrendingUp, color: 'text-success', label: 'Analytics', desc: 'Top itens e pico' },
            ].map(item => (
              <button key={item.screen} onClick={() => onNavigate(item.screen)} className="rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/30 transition-colors">
                <item.icon className={`mb-2 h-5 w-5 ${item.color}`} />
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </button>
            ))}
          </div>
        </TabletSection>

        <TabletSection title="Alertas" subtitle="Atualizações em tempo real">
          <div className="space-y-2">
            {notifications.slice(0, 5).map(item => (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-3 flex items-start gap-3">
                <Bell className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatTimeAgo(item.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </TabletSection>
      </div>

      {/* Recent orders — table format */}
      <TabletSection title="Pedidos recentes">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_120px_100px_80px] px-4 py-2 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
            <span>Mesa</span><span>Cliente</span><span>Itens</span><span>Valor</span><span>Status</span>
          </div>
          {orders.slice(0, 6).map(order => (
            <button key={order.id} onClick={() => onNavigate('orders')} className="grid grid-cols-[80px_1fr_120px_100px_80px] px-4 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors items-center text-left w-full">
              <span className="font-display text-sm font-bold text-primary">{order.tableNumber}</span>
              <span className="text-sm font-medium truncate">{order.customerName}</span>
              <span className="text-xs text-muted-foreground">{order.items.length} itens · {formatTimeAgo(order.createdAt)}</span>
              <span className="text-sm font-semibold">R$ {order.total}</span>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusBadgeMap[order.status]}`}>{orderLabelMap[order.status]}</span>
            </button>
          ))}
        </div>
      </TabletSection>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TABLE MAP — expanded grid + detail panel side-by-side
// ═══════════════════════════════════════════════

const TabletTableMap: React.FC = () => {
  const { tables, updateTableStatus } = useDemoContext();
  const [selectedTable, setSelectedTable] = useState<string | null>(tables[0]?.id ?? null);
  const selected = tables.find(t => t.id === selectedTable) ?? tables[0];

  return (
    <div className="space-y-5">
      <TabletHint text="Tablet: mapa e detalhes lado a lado para ação rápida sem trocar de tela." />

      <div className="grid grid-cols-[1fr_280px] gap-5">
        {/* Grid */}
        <div className="grid grid-cols-4 gap-3">
          {tables.map(table => (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table.id)}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${selected?.id === table.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/20'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl font-bold text-foreground">{table.number}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tableBadgeMap[table.status]}`}>{tableLabelMap[table.status]}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{table.seats} lugares</p>
              {table.customerName && <p className="truncate text-xs font-medium text-foreground mt-1">{table.customerName}</p>}
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="rounded-2xl border border-border bg-card p-5 sticky top-4 self-start">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl font-bold">Mesa {selected.number}</p>
                <p className="text-xs text-muted-foreground">{selected.customerName || 'Sem cliente no momento'}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tableBadgeMap[selected.status]}`}>{tableLabelMap[selected.status]}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <TabletStat label="Lugares" value={String(selected.seats)} tone="info" />
              <TabletStat label="Conta" value={selected.orderTotal ? `R$ ${selected.orderTotal}` : '—'} tone="primary" />
            </div>
            <div className="mt-4 space-y-2">
              {selected.status === 'available' && <button onClick={() => updateTableStatus(selected.id, 'occupied')} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Sentar cliente</button>}
              {selected.status === 'occupied' && <button onClick={() => updateTableStatus(selected.id, 'billing')} className="w-full rounded-2xl bg-info px-4 py-3 text-sm font-semibold text-info-foreground">Fechar conta</button>}
              {selected.status === 'billing' && <button onClick={() => updateTableStatus(selected.id, 'available')} className="w-full rounded-2xl bg-success px-4 py-3 text-sm font-semibold text-success-foreground">Liberar mesa</button>}
              {selected.status === 'reserved' && <button onClick={() => updateTableStatus(selected.id, 'occupied')} className="w-full rounded-2xl bg-warning px-4 py-3 text-sm font-semibold text-warning-foreground">Check-in</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// ORDERS — filter bar + table layout
// ═══════════════════════════════════════════════

const TabletOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useDemoContext();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const nextAction = (status: OrderStatus): { label: string; next: OrderStatus; tone: string } | null => {
    if (status === 'pending') return { label: 'Confirmar', next: 'confirmed', tone: 'bg-primary text-primary-foreground' };
    if (status === 'confirmed') return { label: 'Preparar', next: 'preparing', tone: 'bg-warning text-warning-foreground' };
    if (status === 'preparing') return { label: 'Marcar pronto', next: 'ready', tone: 'bg-success text-success-foreground' };
    if (status === 'ready') return { label: 'Entregar', next: 'delivered', tone: 'bg-info text-info-foreground' };
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        {(['all', 'pending', 'confirmed', 'preparing', 'ready'] as const).map(key => (
          <button key={key} onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${filter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {key === 'all' ? 'Todos' : orderLabelMap[key]}
            <span className="ml-1.5 opacity-60">({key === 'all' ? orders.length : orders.filter(o => o.status === key).length})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map(order => {
          const action = nextAction(order.status);
          return (
            <div key={order.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-display text-base font-bold text-primary">{order.tableNumber}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{order.customerName}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusBadgeMap[order.status]}`}>{orderLabelMap[order.status]}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{order.items.length} itens · R$ {order.total} · {formatTimeAgo(order.createdAt)}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {order.items.slice(0, 3).map((item, i) => (
                      <span key={i} className="rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">{item.quantity}x {item.menuItem.name}</span>
                    ))}
                  </div>
                </div>
              </div>
              {action && (
                <button onClick={() => updateOrderStatus(order.id, action.next)} className={`mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold ${action.tone}`}>{action.label}</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// KDS — Kanban-style columns
// ═══════════════════════════════════════════════

const TabletKDS: React.FC<{ view: 'kitchen' | 'bar' }> = ({ view }) => {
  const { orders, updateOrderStatus } = useDemoContext();
  const items = orders.filter(o => ['confirmed', 'preparing'].includes(o.status) && (view === 'kitchen' ? o.isKitchen : o.isBar));
  const confirmed = items.filter(i => i.status === 'confirmed');
  const preparing = items.filter(i => i.status === 'preparing');
  const ready = orders.filter(i => i.status === 'ready');

  const renderTicket = (order: typeof orders[0], actionLabel: string, actionNext: OrderStatus, actionTone: string) => (
    <div key={order.id} className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold text-primary">M{order.tableNumber}</span>
          <span className="text-xs text-muted-foreground">{getElapsedMinutes(order.createdAt)}min</span>
        </div>
      </div>
      <div className="space-y-1 mb-3">
        {order.items.slice(0, 4).map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span>{item.quantity}x {item.menuItem.name}</span>
            <span className="text-muted-foreground">{item.menuItem.prepTime}min</span>
          </div>
        ))}
      </div>
      <button onClick={() => updateOrderStatus(order.id, actionNext)} className={`w-full rounded-xl py-2.5 text-xs font-semibold ${actionTone}`}>{actionLabel}</button>
    </div>
  );

  return (
    <div className="space-y-5">
      <TabletHint text={`Tablet: KDS em formato kanban — veja fila, preparo e prontos simultaneamente.`} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <TabletStat label="Na fila" value={String(confirmed.length)} tone="warning" />
        <TabletStat label="Preparando" value={String(preparing.length)} tone="primary" />
        <TabletStat label="Prontos" value={String(ready.length)} tone="success" />
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-warning mb-3 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-warning" /> FILA
          </h4>
          <div className="space-y-3">
            {confirmed.map(o => renderTicket(o, 'Iniciar preparo', 'preparing', 'bg-warning text-warning-foreground'))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> PREPARANDO
          </h4>
          <div className="space-y-3">
            {preparing.map(o => renderTicket(o, 'Marcar pronto', 'ready', 'bg-success text-success-foreground'))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-success mb-3 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" /> PRONTOS
          </h4>
          <div className="space-y-3">
            {ready.map(o => (
              <div key={o.id} className="rounded-2xl border border-success/20 bg-success/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display text-sm font-bold text-success">M{o.tableNumber}</span>
                  <Check className="w-4 h-4 text-success" />
                </div>
                <div className="space-y-1">
                  {o.items.slice(0, 3).map((item, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{item.quantity}x {item.menuItem.name}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAITRE — split view: reservations + available tables
// ═══════════════════════════════════════════════

const reservationStatusLabel: Record<string, string> = { confirmed: 'Confirmada', waiting: 'Aguardando', cancelled: 'Cancelada', seated: 'Acomodado' };

const TabletMaitre: React.FC = () => {
  const { reservations, tables } = useDemoContext();
  const available = tables.filter(t => t.status === 'available');

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <TabletStat label="Reservas Hoje" value={String(reservations.length)} tone="primary" />
        <TabletStat label="Mesas Livres" value={String(available.length)} tone="success" />
        <TabletStat label="Fila estimada" value="25min" tone="warning" />
      </div>

      <div className="grid grid-cols-[1fr_240px] gap-5">
        <TabletSection title="Reservas confirmadas">
          <div className="space-y-3">
            {reservations.map(r => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{r.customerName}</p>
                  <p className="text-xs text-muted-foreground">{r.time} · {r.partySize} pessoas</p>
                  {r.notes && <p className="mt-1 text-xs text-muted-foreground italic">{r.notes}</p>}
                </div>
                <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-semibold text-warning">{reservationStatusLabel[r.status] || r.status}</span>
              </div>
            ))}
          </div>
        </TabletSection>

        <div>
          <h4 className="text-sm font-semibold mb-3">Mesas disponíveis</h4>
          <div className="space-y-2">
            {available.map(t => (
              <div key={t.id} className="rounded-xl border border-success/20 bg-success/5 p-3 flex items-center justify-between">
                <div>
                  <span className="font-display font-bold text-sm">Mesa {t.number}</span>
                  <p className="text-xs text-muted-foreground">{t.seats} lugares</p>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">Livre</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// WAITER — The most complex screen. Tablet version uses wider tabs, more data.
// ═══════════════════════════════════════════════

const TabletWaiter: React.FC<{ initialTab?: 'live' | 'tables' | 'kitchen' | 'charge' }> = ({ initialTab = 'live' }) => {
  const { orders, tables, notifications, menu } = useDemoContext();
  const [waiterTab, setWaiterTab] = useState<'live' | 'tables' | 'kitchen' | 'charge'>(initialTab);
  const myTables = tables.filter(t => ['occupied', 'billing'].includes(t.status));
  const waiterCalls = notifications.filter(n => n.type === 'waiter_call' && !n.read);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [handledItems, setHandledItems] = useState<string[]>([]);
  const [pickedUp, setPickedUp] = useState<string[]>([]);
  const [paymentStep, setPaymentStep] = useState<'guests' | 'method' | 'processing' | 'done'>('guests');
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

  const readyDishes = KITCHEN_PIPELINE.filter(d => d.status === 'ready' && !pickedUp.includes(d.id));
  const activeFeed = LIVE_FEED.filter(f => !handledItems.includes(f.id));

  const getAllGuests = (tableNum: number): TableGuest[] => {
    const base = getTableGuests(tableNum);
    return base;
  };

  return (
    <div className="space-y-4">
      {/* Stats — wider on tablet */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Minhas Mesas', value: myTables.length.toString(), urgent: false },
          { label: 'Pratos p/ Retirar', value: readyDishes.length.toString(), urgent: readyDishes.length > 0 },
          { label: 'Chamados', value: (waiterCalls.length || activeFeed.filter(f => f.type === 'call').length).toString(), urgent: waiterCalls.length > 0 },
          { label: 'Gorjetas Hoje', value: 'R$ 410', urgent: false },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl p-3 text-center ${s.urgent ? 'bg-destructive/10 border border-destructive/20' : 'bg-card border border-border'}`}>
            <p className={`font-display font-bold text-lg ${s.urgent ? 'text-destructive' : 'text-primary'}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab nav — bigger on tablet */}
      <div className="flex bg-muted/30 rounded-xl p-1">
        {[
          { id: 'live' as const, label: 'Ao Vivo', badge: activeFeed.filter(f => f.urgency !== 'info').length },
          { id: 'tables' as const, label: 'Minhas Mesas', badge: 0 },
          { id: 'kitchen' as const, label: 'Cozinha/Bar', badge: readyDishes.length },
          { id: 'charge' as const, label: 'Cobrar/TAP', badge: 0 },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setWaiterTab(tab.id); setSelectedTable(null); setPaymentStep('guests'); setSelectedGuest(null); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all relative ${
              waiterTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}>
            {tab.label}
            {tab.badge > 0 && (
              <span className={`absolute -top-1 right-2 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                tab.id === 'kitchen' ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-primary text-primary-foreground'
              }`}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* AO VIVO — 2 columns on tablet */}
      {waiterTab === 'live' && (
        <div className="space-y-3">
          {readyDishes.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="w-9 h-9 rounded-lg bg-destructive/20 flex items-center justify-center animate-pulse">
                <ChefHat className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-destructive">{readyDishes.length} prato(s) esperando retirada!</p>
                <p className="text-[10px] text-destructive/70">A cozinha está aguardando</p>
              </div>
              <button onClick={() => setWaiterTab('kitchen')} className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold">Ver</button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {activeFeed.map(item => {
              const config: Record<string, { icon: React.FC<{className?: string}>; color: string; bg: string; border: string; action: string | null }> = {
                kitchen_ready: { icon: ChefHat, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', action: 'Retirar' },
                call: { icon: Bell, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', action: 'Atender' },
                payment: { icon: Check, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', action: null },
                payment_needed: { icon: Smartphone, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', action: 'Cobrar' },
                approval: { icon: Shield, color: 'text-info', bg: 'bg-info/10', border: 'border-info/20', action: 'Solicitar' },
                order: { icon: BookOpen, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', action: null },
              };
              const cfg = config[item.type] || config.order;
              const Icon = cfg.icon;
              return (
                <div key={item.id} className={`rounded-xl border ${cfg.border} overflow-hidden ${item.urgency === 'critical' ? 'ring-1 ring-destructive/20' : ''}`}>
                  <div className="flex items-start gap-3 p-3">
                    <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 ${item.urgency === 'critical' ? 'animate-pulse' : ''}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">M{item.table}</span>
                        <span className="text-[10px] text-muted-foreground">{item.time}</span>
                        {item.urgency === 'critical' && <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[9px] font-bold animate-pulse">AGORA</span>}
                      </div>
                      <p className="text-xs font-semibold mt-1">{item.event}</p>
                      <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                  {cfg.action && (
                    <button onClick={() => { setHandledItems(prev => [...prev, item.id]); }}
                      className={`w-full py-2 text-xs font-bold border-t ${cfg.border} ${
                        item.urgency === 'critical' ? 'bg-destructive text-destructive-foreground' : `${cfg.bg} ${cfg.color}`
                      }`}>
                      {cfg.action} →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {activeFeed.length === 0 && (
            <div className="text-center py-12">
              <Check className="w-10 h-10 text-success/30 mx-auto mb-3" />
              <p className="font-display font-bold text-success text-base">Tudo tranquilo!</p>
              <p className="text-xs text-muted-foreground">Nenhuma ação pendente</p>
            </div>
          )}
        </div>
      )}

      {/* MESAS — full command actions */}
      {waiterTab === 'tables' && <WaiterTablesActions />}

      {/* COZINHA — wider cards on tablet */}
      {waiterTab === 'kitchen' && (
        <div className="space-y-4">
          {readyDishes.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-destructive font-bold mb-2 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> PRONTO PARA RETIRAR
              </p>
              <div className="grid grid-cols-2 gap-3">
                {readyDishes.map(dish => (
                  <div key={dish.id} className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center font-display font-bold text-base text-destructive">{dish.table}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{dish.qty}x {dish.dish}</p>
                        <p className="text-xs text-muted-foreground">{dish.chef} · {dish.readyAgo}min atrás</p>
                      </div>
                      <button onClick={() => setPickedUp(prev => [...prev, dish.id])}
                        className="px-3 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold shadow-lg">
                        Retirar ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-warning font-bold mb-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse" /> PREPARANDO
            </p>
            <div className="grid grid-cols-2 gap-3">
              {KITCHEN_PIPELINE.filter(d => d.status === 'preparing').map(dish => (
                <div key={dish.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center font-display font-bold text-base text-warning">{dish.table}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{dish.qty}x {dish.dish}</p>
                    <p className="text-xs text-muted-foreground">{dish.chef}</p>
                  </div>
                  <div className="w-16 text-right">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full" style={{ width: `${Math.min((dish.elapsed / dish.sla) * 100, 100)}%` }} />
                    </div>
                    <p className={`text-[9px] font-bold mt-0.5 ${dish.elapsed > dish.sla ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {dish.elapsed > dish.sla ? `+${dish.elapsed - dish.sla}min` : `${dish.sla - dish.elapsed}min`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COBRAR — wider payment flow */}
      {waiterTab === 'charge' && (
        <div className="space-y-3">
          <div className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 p-4">
            <p className="text-sm font-semibold">Cobrança inteligente</p>
            <p className="text-xs text-muted-foreground mt-1">Quem pagou pelo app aparece automaticamente. Cobre apenas quem precisa.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {myTables.map(table => {
              const guests = getAllGuests(table.number);
              const paidCount = guests.filter(g => g.paid).length;
              const needsWaiter = guests.filter(g => !g.paid && !g.hasApp);
              const waitingApp = guests.filter(g => !g.paid && g.hasApp);
              return (
                <div key={table.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-3 p-3 bg-muted/20 border-b border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-display font-bold text-primary">{table.number}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{table.customerName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-success font-medium">{paidCount} pago</span>
                        {waitingApp.length > 0 && <span className="text-[10px] text-info">· {waitingApp.length} no app</span>}
                        {needsWaiter.length > 0 && <span className="text-[10px] text-warning font-bold">· {needsWaiter.length} sem app</span>}
                      </div>
                    </div>
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--success))" strokeWidth="3" strokeDasharray={`${(paidCount / guests.length) * 94} 94`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">{paidCount}/{guests.length}</span>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    {guests.map((guest, i) => (
                      <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${
                        guest.paid ? 'opacity-40' : !guest.hasApp ? 'bg-warning/5 border border-warning/15' : ''
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${
                          guest.paid ? 'bg-success/10 text-success' : guest.hasApp ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                        }`}>{guest.paid ? '✓' : guest.hasApp ? '📱' : '!'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{guest.name}</p>
                          <p className="text-[9px] text-muted-foreground">{guest.paid ? `Pago via ${guest.method}` : guest.hasApp ? 'No app' : 'Sem app'}</p>
                        </div>
                        <span className="text-xs font-semibold">R$ {guest.orders.reduce((a: number, o: { price: number; qty: number }) => a + o.price * o.qty, 0)}</span>
                        {!guest.paid && !guest.hasApp && (
                          <button className="px-2 py-1 rounded-lg bg-primary text-primary-foreground text-[9px] font-bold">Cobrar</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// SIMPLER SCREENS — tablet-adapted versions
// ═══════════════════════════════════════════════

const TabletMenu: React.FC = () => {
  const { menu } = useDemoContext();
  const categories = [...new Set(menu.map(item => item.category))];
  const [category, setCategory] = useState(categories[0]);
  const items = menu.filter(item => item.category === category);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {categories.map(item => (
          <button key={item} onClick={() => setCategory(item)}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${category === item ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground mt-1">{item.description}</p>
            </div>
            <span className="text-sm font-semibold text-primary shrink-0">R$ {item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabletTeam: React.FC = () => (
  <div className="grid grid-cols-2 gap-3">
    {TEAM_MEMBERS.map(member => (
      <div key={member.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <img src={member.avatar} alt={member.name} className="h-12 w-12 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.role} · {member.shift}</p>
        </div>
        <span className={`text-xs font-semibold ${member.status === 'online' ? 'text-success' : 'text-muted-foreground'}`}>{member.status === 'online' ? 'Ativo' : 'Folga'}</span>
      </div>
    ))}
  </div>
);

const TabletAnalytics: React.FC = () => {
  const { analytics } = useDemoContext();
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <TabletStat label="Receita" value="R$ 77.5k" tone="success" />
        <TabletStat label="Pedidos" value="312" tone="primary" />
        <TabletStat label="Satisfação" value={String(analytics.customerSatisfaction)} tone="warning" />
        <TabletStat label="Recorrência" value={`${analytics.returningCustomers}%`} tone="info" />
      </div>
      <TabletSection title="Top vendidos">
        <div className="grid grid-cols-2 gap-3">
          {analytics.topItems.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">#{index + 1}</div>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} vendidos</p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          ))}
        </div>
      </TabletSection>
    </div>
  );
};

const TabletManager: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { analytics, orders } = useDemoContext();
  const lateOrders = orders.filter(o => !['delivered', 'paid'].includes(o.status) && getElapsedMinutes(o.createdAt) > 15);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <TabletStat label="Pedidos ativos" value={String(orders.filter(o => !['delivered', 'paid'].includes(o.status)).length)} tone="primary" />
        <TabletStat label="Aprovações" value={String(PENDING_APPROVALS.length)} tone="warning" />
        <TabletStat label="Equipe ativa" value={String(TEAM_MEMBERS.filter(t => t.status === 'online').length)} tone="info" />
        <TabletStat label="Receita" value={`R$ ${analytics.todayRevenue.toLocaleString()}`} tone="success" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          {lateOrders.length > 0 && (
            <button onClick={() => onNavigate('orders')} className="flex w-full items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-left text-sm font-semibold text-destructive mb-4">
              <AlertCircle className="h-5 w-5" /> {lateOrders.length} pedidos com atraso
            </button>
          )}
          <button onClick={() => onNavigate('approvals')} className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-4 text-left">
            <div>
              <p className="text-sm font-semibold">Central de aprovações</p>
              <p className="text-xs text-muted-foreground">Cancelamentos, cortesias e estornos</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Equipe</h4>
          <TabletTeam />
        </div>
      </div>
    </div>
  );
};

const TabletApprovals: React.FC = () => {
  const [handled, setHandled] = useState<string[]>([]);
  return (
    <div className="grid grid-cols-2 gap-3">
      {PENDING_APPROVALS.map(item => {
        const done = handled.includes(item.id);
        return (
          <div key={item.id} className={`rounded-2xl border p-4 ${done ? 'border-success/20 bg-success/5' : 'border-border bg-card'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{item.item}</p>
                <p className="text-xs text-muted-foreground">Mesa {item.table} · {item.requestedBy}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
              </div>
              <span className="text-sm font-semibold text-destructive">R$ {item.amount}</span>
            </div>
            {!done ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => setHandled(prev => [...prev, item.id])} className="rounded-xl bg-success px-3 py-2.5 text-xs font-semibold text-success-foreground">Aprovar</button>
                <button onClick={() => setHandled(prev => [...prev, item.id])} className="rounded-xl bg-destructive/10 px-3 py-2.5 text-xs font-semibold text-destructive">Recusar</button>
              </div>
            ) : <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-success"><CheckCircle2 className="h-4 w-4" /> Processado</div>}
          </div>
        );
      })}
    </div>
  );
};

const TabletRecipes: React.FC = () => (
  <div className="grid grid-cols-2 gap-3">
    {DRINK_RECIPES.map(recipe => (
      <div key={recipe.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <img src={recipe.image} alt={recipe.name} className="h-16 w-16 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{recipe.name}</p>
          <p className="text-xs text-muted-foreground">{recipe.glass} · {recipe.prepTime}min</p>
        </div>
        <span className="text-sm font-semibold text-primary">R$ {recipe.price}</span>
      </div>
    ))}
  </div>
);

const TabletStock: React.FC = () => (
  <div className="grid grid-cols-2 gap-3">
    {STOCK_ITEMS.map(item => (
      <div key={item.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.category}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'critical' ? 'bg-destructive/10 text-destructive' : item.status === 'low' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>{item.current} {item.unit}</span>
      </div>
    ))}
  </div>
);

const TabletTips: React.FC = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-3 gap-4">
      <TabletStat label="Gorjetas do dia" value="R$ 410" tone="success" />
      <TabletStat label="Mesas atendidas" value="12" tone="primary" />
      <TabletStat label="Média por mesa" value="R$ 34" tone="info" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      {[
        { table: 8, customer: 'Grupo Aniversário', amount: 120, pct: '15%' },
        { table: 5, customer: 'Grupo Pedro', amount: 85, pct: '12%' },
        { table: 10, customer: 'Carlos M.', amount: 98, pct: '10%' },
        { table: 3, customer: 'João & Ana', amount: 62, pct: '10%' },
        { table: 1, customer: 'Maria S.', amount: 45, pct: '15%' },
      ].map((tip, i) => (
        <div key={i} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center text-xs font-bold text-success">{tip.table}</div>
            <div>
              <p className="text-sm font-semibold">{tip.customer}</p>
              <p className="text-xs text-muted-foreground">{tip.pct} da conta</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-success">+R$ {tip.amount}</span>
        </div>
      ))}
    </div>
  </div>
);

const TabletFloorFlow: React.FC = () => {
  const { reservations, tables } = useDemoContext();
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <TabletStat label="Fila estimada" value="25min" tone="warning" />
        <TabletStat label="Mesas livres" value={String(tables.filter(t => t.status === 'available').length)} tone="success" />
        <TabletStat label="Reservas" value={String(reservations.length)} tone="primary" />
      </div>
      <TabletSection title="Fluxo atual">
        <div className="grid grid-cols-2 gap-3">
          {reservations.slice(0, 6).map(item => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">{item.customerName}</p>
              <p className="text-xs text-muted-foreground">{item.time} · {item.partySize} pessoas · {reservationStatusLabel[item.status] || item.status}</p>
            </div>
          ))}
        </div>
      </TabletSection>
    </div>
  );
};

const TabletDailyReport: React.FC = () => {
  const { analytics } = useDemoContext();
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <TabletStat label="Receita dia" value={`R$ ${analytics.todayRevenue.toLocaleString()}`} tone="success" />
        <TabletStat label="Pedidos" value={String(analytics.todayOrders)} tone="primary" />
        <TabletStat label="Ticket Médio" value={`R$ ${analytics.avgTicket}`} tone="info" />
        <TabletStat label="Ocupação" value={`${analytics.occupancyRate}%`} tone="warning" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-3">Fechamento operacional</p>
          <div className="space-y-3">
            {['Caixa conciliado', 'Equipe encerrada', 'Estoque revisado', 'Pendências zeradas'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-success" /> {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-3">Top vendidos</p>
          <div className="space-y-2">
            {analytics.topItems.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="font-bold text-primary">#{i + 1}</span> {item.name}</span>
                <span className="text-muted-foreground">{item.quantity}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TabletWelcome: React.FC<{ onSelectRole?: (role: StaffRole) => void }> = ({ onSelectRole }) => (
  <div className="space-y-5">
    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-6">
      <p className="text-sm font-semibold text-primary">DEMO INTERATIVA</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-foreground">Bistrô Noowe</h2>
      <p className="mt-2 text-sm text-muted-foreground">Escolha o papel e veja a operação sob a ótica de cada equipe.</p>
    </div>
    <div className="grid grid-cols-4 gap-3">
      {ROLE_CONFIG.map(role => (
        <button key={role.id} onClick={() => onSelectRole?.(role.id)} className={`rounded-2xl border border-border bg-gradient-to-br ${role.gradient} p-4 text-left hover:shadow-md transition-shadow`}>
          <span className="text-2xl">{role.emoji}</span>
          <p className="mt-2 text-sm font-semibold">{role.label}</p>
          <p className="text-xs text-muted-foreground">{role.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

const TabletSetup: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const STEPS = [
    { id: '1', title: 'Informações Básicas', desc: 'Nome, endereço, horário', icon: '🏪', required: true, done: true },
    { id: '2', title: 'Configurar Cardápio', desc: 'Categorias e pratos', icon: '🍽️', required: true, done: true },
    { id: '3', title: 'Configurar Mesas', desc: 'Layout do salão', icon: '🪑', required: true, done: false },
    { id: '4', title: 'Sistema de Reservas', desc: 'Capacidade e horários', icon: '📅', required: true, done: false },
    { id: '5', title: 'Pagamentos', desc: 'Métodos e taxas', icon: '💳', required: true, done: false },
    { id: '6', title: 'Equipe e Funções', desc: '7 roles', icon: '👥', required: false, done: false },
    { id: '7', title: 'Gorjetas', desc: 'Distribuição', icon: '⭐', required: false, done: false },
    { id: '8', title: 'Integrações', desc: 'Delivery e externos', icon: '🔗', required: false, done: false },
  ];
  const req = STEPS.filter(s => s.required);
  const opt = STEPS.filter(s => !s.required);
  const doneReq = req.filter(s => s.done).length;
  const pct = Math.round((doneReq / req.length) * 100);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl">🚀</div>
          <div className="flex-1">
            <p className="font-bold">Configuração do Restaurante</p>
            <p className="text-xs text-muted-foreground">Complete os passos para operar</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{doneReq}/{req.length}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Required */}
      <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">⚠️ Obrigatórios</p>
      <div className="grid grid-cols-2 gap-3">
        {req.map(s => (
          <div key={s.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${s.done ? 'bg-green-500/5 border-green-500/20' : 'bg-card border-border'}`}>
            <span className="text-xl">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${s.done ? 'line-through text-green-600' : ''}`}>{s.title}</p>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </div>
            {s.done ? <span className="text-green-500 text-sm">✓</span> : <span className="text-muted-foreground/30">○</span>}
          </div>
        ))}
      </div>

      {/* Optional */}
      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">⭐ Opcionais</p>
      <div className="grid grid-cols-3 gap-3">
        {opt.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card">
            <span className="text-xl">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{s.title}</p>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => onNavigate('config-hub')} className="flex-1 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs font-semibold">⚙️ Config Hub</button>
        <button onClick={() => onNavigate('dashboard')} className="flex-1 rounded-xl bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground">📊 Dashboard</button>
      </div>
    </div>
  );
};

const TabletWaiterAssist: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  return <WaiterAssistScreen onNavigate={onNavigate} />;
};

// ═══════════════════════════════════════════════
// MAIN SCREEN ROUTER
// ═══════════════════════════════════════════════

export const TabletRestaurantScreen: React.FC<{
  screen: RestaurantScreen;
  activeRole: StaffRole;
  onNavigate: (screen: string) => void;
  onSelectRole: (role: StaffRole) => void;
}> = ({ screen, activeRole, onNavigate, onSelectRole }) => {
  const { t, translateText } = useDemoI18n();
  const title = translateText(SCREEN_INFO[screen]?.title || '');

  return (
    <div className="space-y-5 pb-6">
      <div className="rounded-2xl border border-border bg-card px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{translateText('Modo tablet')}</p>
          <p className="mt-0.5 text-base font-semibold text-foreground">{title}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">Tablet</span>
      </div>

      {screen === 'welcome' && <TabletWelcome onSelectRole={onSelectRole} />}
      {screen === 'setup' && <TabletSetup onNavigate={onNavigate} />}
      {screen === 'dashboard' && <TabletDashboard onNavigate={onNavigate} />}
      {screen === 'table-map' && <TabletTableMap />}
      {screen === 'orders' && <TabletOrders />}
      {screen === 'kds-kitchen' && <TabletKDS view="kitchen" />}
      {screen === 'kds-bar' && <TabletKDS view="bar" />}
      {screen === 'maitre' && <TabletMaitre />}
      {screen === 'waiter' && <TabletWaiter />}
      {screen === 'menu-editor' && <TabletMenu />}
      {screen === 'team' && <TabletTeam />}
      {screen === 'analytics' && <TabletAnalytics />}
      {screen === 'manager-ops' && <TabletManager onNavigate={onNavigate} />}
      {screen === 'approvals' && <TabletApprovals />}
      {screen === 'barman-station' && <TabletKDS view="bar" />}
      {screen === 'drink-recipes' && <TabletRecipes />}
      {screen === 'cook-station' && <TabletKDS view="kitchen" />}
      {screen === 'stock' && <TabletStock />}
      {screen === 'waiter-calls' && <TabletWaiter initialTab="live" />}
      {screen === 'waiter-tips' && <TabletTips />}
      {screen === 'waiter-payment' && <TabletWaiter initialTab="charge" />}
      {screen === 'waiter-actions' && <TabletWaiter initialTab="live" />}
      {screen === 'waiter-assist' && <TabletWaiterAssist onNavigate={onNavigate} />}
      {screen === 'waiter-table-detail' && <TabletWaiter initialTab="tables" />}
      {screen === 'floor-flow' && <TabletFloorFlow />}
      {screen === 'daily-report' && <TabletDailyReport />}
      {/* Config screens — already handle their own layout well */}
      {screen === 'config-hub' && <ConfigHub onNavigate={onNavigate} />}
      {screen === 'config-profile' && <ConfigProfile onNavigate={onNavigate} />}
      {screen === 'config-service-types' && <ConfigServiceTypes onNavigate={onNavigate} />}
      {screen === 'config-experience' && <ConfigExperience onNavigate={onNavigate} />}
      {screen === 'config-floor' && <ConfigFloor onNavigate={onNavigate} />}
      {screen === 'config-menu' && <ConfigMenu onNavigate={onNavigate} />}
      {screen === 'config-team' && <ConfigTeam onNavigate={onNavigate} activeRole={activeRole} />}
      {screen === 'config-kitchen' && <ConfigKitchen onNavigate={onNavigate} />}
      {screen === 'config-payments' && <ConfigPayments onNavigate={onNavigate} />}
      {screen === 'config-features' && <ConfigFeatures onNavigate={onNavigate} />}
      {screen === 'config-language' && <ConfigLanguageScreen />}
      {screen === 'config-notifications' && <ConfigNotificationsScreen />}
      {screen === 'financial-dashboard' && <FinancialDashboardScreen />}
      {screen === 'cash-register' && <CashRegisterScreen />}
      {screen === 'fiscal' && <FiscalScreen />}
      {screen === 'cost-control' && <CostControlScreen />}
      {screen === 'forecast' && <ForecastScreen />}
      {screen === 'chef-approvals' && <ChefApprovalsScreen />}
      {screen === 'chef-table' && <ChefTableScreen />}
      {screen === 'kds-analytics' && <KdsAnalyticsScreen />}
      {screen === 'kds-brain-config' && <KdsBrainConfigScreen />}
      {screen === 'crm' && <CrmScreen />}
      {screen === 'hr' && <HrScreen />}
      {screen === 'integrations' && <IntegrationsScreen />}
      {screen === 'loyalty-mgmt' && <LoyaltyMgmtScreen />}
      {screen === 'promotions-mgmt' && <PromotionsMgmtScreen />}
      {screen === 'qr-codes' && <QrCodesScreen />}
      {screen === 'tap-to-pay' && <TapToPayScreen />}
      {screen === 'reports' && <ReportsScreen />}
      {screen === 'reviews-mgmt' && <ReviewsMgmtScreen />}
      {screen === 'reservations-mgmt' && <ReservationsMgmtScreen />}
      {screen === 'club-door' && <ClubDoorScreen />}
      {screen === 'club-queue-mgmt' && <ClubQueueMgmtScreen />}
      {screen === 'club-promoter' && <ClubPromoterScreen />}
      {screen === 'club-vip-mgmt' && <ClubVipMgmtScreen />}
      {screen === 'drive-thru-mgmt' && <DriveThruMgmtScreen />}
      {screen === 'food-truck-mgmt' && <FoodTruckMgmtScreen />}

      <div className="rounded-2xl border border-border bg-card p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{translateText('Perfil ativo')}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{t('roles', activeRole)}</p>
        </div>
      </div>
    </div>
  );
};
