/**
 * DesktopRestaurantScreens.tsx — Phase 3
 *
 * Native desktop experience for ≥ 1200 px content area.
 * ────────────────────────────────────────────────────
 *  Dashboard   → KPI row + wide revenue sparkline + orders data-table + alerts sidebar
 *  Table Map   → Visual floor plan (positioned tables) + sticky detail panel
 *  KDS         → True kanban (3 columns) with elapsed timers
 *  Waiter      → Persistent split-view: table list ← | → detail/actions
 *  Orders      → Full data-table with search, filters, sort, inline actions
 *  Analytics   → BI dashboard: 4 KPIs, 3 chart areas, top-items, export
 *  Config      → Fixed sidebar nav + wide form area
 *  + all remaining screens enhanced for desktop density
 */
import React, { useState, useMemo } from 'react';
import {
  AlertCircle, ArrowRight, BarChart3, Bell, BookOpen, Check, CheckCircle2,
  ChefHat, ChevronLeft, ChevronRight, Clock, Coffee, DollarSign, Download,
  Edit3, ExternalLink, Filter, Flame, LayoutGrid, Package, Plus, Search,
  Settings, Shield, ShoppingBag, Smartphone, Star, TrendingDown, TrendingUp,
  UserPlus, Users, Wine, X, XCircle, Zap,
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
} from './ExtendedScreens';
import { WaiterTablesActions } from './WaiterTablesActions';
import { useDemoI18n } from '@/components/demo/DemoI18n';
import {
  DRINK_RECIPES, PENDING_APPROVALS, ROLE_CONFIG, SCREEN_INFO,
  STOCK_ITEMS, TEAM_MEMBERS, TABLE_POSITIONS, formatTimeAgo, getElapsedMinutes,
  type RestaurantScreen, type StaffRole,
} from './RestaurantDemoShared';
import {
  type TableGuest, KITCHEN_PIPELINE, LIVE_FEED, TABLE_GUESTS_DATA,
  getTableGuests, WAITER_MENU,
} from './ServiceScreens';

/* ═══════════════════════════════════════════════
   SHARED DESKTOP HELPERS
   ═══════════════════════════════════════════════ */

const statusBadge: Record<OrderStatus, string> = {
  pending: 'bg-muted text-muted-foreground', confirmed: 'bg-info/10 text-info',
  preparing: 'bg-warning/10 text-warning', ready: 'bg-success/10 text-success',
  delivered: 'bg-primary/10 text-primary', paid: 'bg-muted text-muted-foreground',
};
const orderLabel: Record<OrderStatus, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', preparing: 'Preparando',
  ready: 'Pronto', delivered: 'Entregue', paid: 'Pago',
};
const tableBadge: Record<TableStatus, string> = {
  available: 'bg-success/10 text-success', occupied: 'bg-primary/10 text-primary',
  reserved: 'bg-warning/10 text-warning', billing: 'bg-info/10 text-info',
};
const tableLabel: Record<TableStatus, string> = {
  available: 'Livre', occupied: 'Ocupada', reserved: 'Reserva', billing: 'Conta',
};

const DeskStat: React.FC<{ label: string; value: string; tone?: 'primary' | 'success' | 'warning' | 'info' | 'destructive'; subtitle?: string; icon?: React.ReactNode }> = ({ label, value, tone = 'primary', subtitle, icon }) => {
  const bg: Record<string, string> = { primary: 'bg-primary/10 text-primary', success: 'bg-success/10 text-success', warning: 'bg-warning/10 text-warning', info: 'bg-info/10 text-info', destructive: 'bg-destructive/10 text-destructive' };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={`inline-flex rounded-xl px-3 py-1.5 text-base font-bold ${bg[tone]}`}>{value}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {subtitle && <p className="text-xs text-muted-foreground/60">{subtitle}</p>}
    </div>
  );
};

const DeskSection: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, action, children }) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between gap-4">
      <div><h3 className="text-base font-bold text-foreground">{title}</h3>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
      {action}
    </div>
    {children}
  </section>
);

/** Mini sparkline bar chart */
const MiniBar: React.FC<{ data: number[]; color?: string; height?: number }> = ({ data, color = 'bg-primary', height = 48 }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className={`flex-1 rounded-t ${color} transition-all`} style={{ height: `${(v / max) * 100}%`, minHeight: 2, opacity: 0.3 + (v / max) * 0.7 }} />
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   1. DASHBOARD — Full BI dashboard
   ═══════════════════════════════════════════════ */

const DesktopDashboard: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { analytics, orders, notifications, tables } = useDemoContext();
  const activeOrders = orders.filter(o => !['paid', 'delivered'].includes(o.status)).length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;
  const hourlyRevenue = [1200, 1800, 3200, 4800, 6200, 7100, 8500, 9200, 8800, 7600, 6100, 4200];

  return (
    <div className="space-y-6 overflow-hidden">
      {/* KPIs — responsive row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <DeskStat label="Receita Hoje" value={`R$ ${analytics.todayRevenue.toLocaleString()}`} tone="success" subtitle="vs ontem: +12%" icon={<TrendingUp className="w-4 h-4" />} />
        <DeskStat label="Pedidos Ativos" value={String(activeOrders)} tone="primary" subtitle={`${readyOrders} prontos para servir`} icon={<ShoppingBag className="w-4 h-4" />} />
        <DeskStat label="Ocupação" value={`${analytics.occupancyRate}%`} tone="warning" subtitle={`${tables.filter(t => t.status === 'available').length} mesas livres`} icon={<LayoutGrid className="w-4 h-4" />} />
        <DeskStat label="Ticket Médio" value={`R$ ${analytics.avgTicket}`} tone="info" subtitle="últimas 2h" icon={<DollarSign className="w-4 h-4" />} />
        <DeskStat label="Satisfação" value={String(analytics.customerSatisfaction)} tone="success" subtitle={`${analytics.returningCustomers}% retorno`} icon={<Star className="w-4 h-4" />} />
      </div>

      {/* Revenue sparkline */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Receita por hora</h3>
            <p className="text-sm text-muted-foreground">Hoje, 11h–22h</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-success font-semibold">
            <TrendingUp className="w-4 h-4" /> +12% vs ontem
          </div>
        </div>
        <div className="flex gap-1">
          {hourlyRevenue.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
                <div
                  className="w-full max-w-[32px] rounded-t bg-primary transition-all hover:bg-primary/80"
                  style={{ height: `${(v / Math.max(...hourlyRevenue)) * 100}%`, opacity: 0.4 + (v / Math.max(...hourlyRevenue)) * 0.6 }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{11 + i}h</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2-column: orders table + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-5">
        {/* Orders table */}
        <DeskSection title="Pedidos recentes" subtitle="Atualizações em tempo real">
          <div className="rounded-2xl border border-border bg-card overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                  <th className="px-3 py-2.5 w-12">Mesa</th>
                  <th className="px-3 py-2.5">Cliente</th>
                  <th className="px-3 py-2.5 w-16">Itens</th>
                  <th className="px-3 py-2.5 w-16">Tempo</th>
                  <th className="px-3 py-2.5 w-20">Valor</th>
                  <th className="px-3 py-2.5 w-16">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map(order => (
                  <tr key={order.id} onClick={() => onNavigate('orders')} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
                    <td className="px-3 py-2.5 font-display text-sm font-bold text-primary">{order.tableNumber}</td>
                    <td className="px-3 py-2.5 text-sm truncate max-w-[120px]">{order.customerName}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{order.items.length}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{formatTimeAgo(order.createdAt)}</td>
                    <td className="px-3 py-2.5 text-sm font-semibold">R$ {order.total}</td>
                    <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${statusBadge[order.status]}`}>{orderLabel[order.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DeskSection>

        {/* Sidebar: quick actions + alerts */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground">Ações rápidas</h4>
          {[
            { screen: 'orders', icon: ShoppingBag, color: 'text-primary', label: 'Pedidos', desc: `${activeOrders} ativos` },
            { screen: 'table-map', icon: LayoutGrid, color: 'text-info', label: 'Mesas', desc: `${tables.filter(t => t.status === 'occupied').length} ocupadas` },
            { screen: 'kds-kitchen', icon: ChefHat, color: 'text-warning', label: 'KDS Cozinha', desc: `${readyOrders} prontos` },
          ].map(item => (
            <button key={item.screen} onClick={() => onNavigate(item.screen)} className="w-full rounded-xl border border-border bg-card p-3 text-left hover:border-primary/30 transition-colors flex items-center gap-3">
              <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
              <div><p className="text-xs font-semibold">{item.label}</p><p className="text-[10px] text-muted-foreground">{item.desc}</p></div>
            </button>
          ))}

          {readyOrders > 0 && (
            <button onClick={() => onNavigate('kds-kitchen')} className="w-full rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-left">
              <p className="text-xs font-bold text-destructive">{readyOrders} prato(s) prontos!</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Aguardando retirada</p>
            </button>
          )}

          {notifications.slice(0, 3).map(n => (
            <div key={n.id} className="rounded-xl border border-border bg-card p-2.5">
              <p className="text-xs font-medium text-foreground">{n.message}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{formatTimeAgo(n.timestamp)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   2. TABLE MAP — Visual floor plan + detail panel
   ═══════════════════════════════════════════════ */

const DesktopTableMap: React.FC = () => {
  const { tables, updateTableStatus } = useDemoContext();
  const [selectedId, setSelectedId] = useState<string | null>(tables[0]?.id ?? null);
  const selected = tables.find(t => t.id === selectedId) ?? tables[0];

  const statusCounts = useMemo(() => ({
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    billing: tables.filter(t => t.status === 'billing').length,
  }), [tables]);

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex items-center gap-6">
        {([['available', 'Livres', 'bg-success'], ['occupied', 'Ocupadas', 'bg-primary'], ['reserved', 'Reservas', 'bg-warning'], ['billing', 'Conta', 'bg-info']] as const).map(([k, label, dot]) => (
          <div key={k} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-3 h-3 rounded-full ${dot}`} /> {label}: <span className="font-semibold text-foreground">{statusCounts[k]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        {/* Floor plan — positioned layout */}
        <div className="rounded-2xl border border-border bg-card p-6 relative" style={{ minHeight: 420 }}>
          <div className="absolute top-4 left-5 text-xs text-muted-foreground/50 uppercase tracking-wider">Salão principal</div>
          <div className="relative w-full" style={{ height: 380 }}>
            {tables.map((table, idx) => {
              const pos = TABLE_POSITIONS[idx] || { x: (idx % 5) * 20 + 5, y: Math.floor(idx / 5) * 30 + 10, shape: 'round' as const };
              const isSelected = selected?.id === table.id;
              const shapes: Record<string, string> = {
                round: 'rounded-full w-16 h-16',
                rect: 'rounded-xl w-20 h-14',
                long: 'rounded-xl w-24 h-12',
              };
              const statusColor: Record<TableStatus, string> = {
                available: 'border-success bg-success/10 hover:bg-success/20',
                occupied: 'border-primary bg-primary/10 hover:bg-primary/20',
                reserved: 'border-warning bg-warning/10 hover:bg-warning/20',
                billing: 'border-info bg-info/10 hover:bg-info/20',
              };
              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedId(table.id)}
                  className={`absolute flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${shapes[pos.shape]} ${statusColor[table.status]} ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-card scale-110 shadow-lg z-10' : 'z-0'}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: isSelected ? 'scale(1.1)' : undefined }}
                >
                  <span className="font-display text-sm font-bold text-foreground">{table.number}</span>
                  <span className="text-[8px] text-muted-foreground">{table.seats}p</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="sticky top-4 self-start space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-bold">Mesa {selected.number}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{selected.seats} lugares · {selected.customerName || 'Sem cliente'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tableBadge[selected.status]}`}>{tableLabel[selected.status]}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/30 p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{selected.seats}</p>
                  <p className="text-xs text-muted-foreground">Lugares</p>
                </div>
                <div className="rounded-xl bg-muted/30 p-3 text-center">
                  <p className="text-lg font-bold text-primary">{selected.orderTotal ? `R$ ${selected.orderTotal}` : '—'}</p>
                  <p className="text-xs text-muted-foreground">Conta</p>
                </div>
              </div>

              {selected.customerName && (
                <div className="rounded-xl border border-border p-3 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cliente</p>
                  <p className="text-sm font-semibold">{selected.customerName}</p>
                  {selected.orderTotal && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> ~45min na mesa
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {selected.status === 'available' && <button onClick={() => updateTableStatus(selected.id, 'occupied')} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Sentar cliente</button>}
                {selected.status === 'occupied' && (
                  <>
                    <button onClick={() => updateTableStatus(selected.id, 'billing')} className="w-full rounded-xl bg-info px-4 py-3 text-sm font-semibold text-info-foreground">Fechar conta</button>
                    <button className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground">Ver pedido</button>
                  </>
                )}
                {selected.status === 'billing' && <button onClick={() => updateTableStatus(selected.id, 'available')} className="w-full rounded-xl bg-success px-4 py-3 text-sm font-semibold text-success-foreground">Liberar mesa</button>}
                {selected.status === 'reserved' && <button onClick={() => updateTableStatus(selected.id, 'occupied')} className="w-full rounded-xl bg-warning px-4 py-3 text-sm font-semibold text-warning-foreground">Check-in</button>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   3. ORDERS — Full data table with search + filters
   ═══════════════════════════════════════════════ */

const DesktopOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useDemoContext();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'value' | 'table'>('time');

  const filtered = useMemo(() => {
    let result = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o => o.customerName.toLowerCase().includes(q) || String(o.tableNumber).includes(q));
    }
    return [...result].sort((a, b) => {
      if (sortBy === 'value') return b.total - a.total;
      if (sortBy === 'table') return a.tableNumber - b.tableNumber;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [orders, filter, search, sortBy]);

  const nextAction = (status: OrderStatus): { label: string; next: OrderStatus; tone: string } | null => {
    if (status === 'pending') return { label: 'Confirmar', next: 'confirmed', tone: 'bg-primary text-primary-foreground' };
    if (status === 'confirmed') return { label: 'Preparar', next: 'preparing', tone: 'bg-warning text-warning-foreground' };
    if (status === 'preparing') return { label: 'Pronto', next: 'ready', tone: 'bg-success text-success-foreground' };
    if (status === 'ready') return { label: 'Entregar', next: 'delivered', tone: 'bg-info text-info-foreground' };
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Toolbar: search + filters + sort */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente ou mesa…" className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered'] as const).map(key => (
            <button key={key} onClick={() => setFilter(key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${filter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {key === 'all' ? 'Todos' : orderLabel[key]}
              <span className="ml-1 opacity-60">({key === 'all' ? orders.length : orders.filter(o => o.status === key).length})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          {(['time', 'value', 'table'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)} className={`px-2 py-1 rounded ${sortBy === s ? 'bg-primary/10 text-primary font-semibold' : ''}`}>
              {s === 'time' ? 'Recentes' : s === 'value' ? 'Valor' : 'Mesa'}
            </button>
          ))}
        </div>
      </div>

      {/* Data table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
              <th className="px-4 py-3 w-12">Mesa</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Itens</th>
              <th className="px-4 py-3 w-12">Qtd</th>
              <th className="px-4 py-3 w-16">Tempo</th>
              <th className="px-4 py-3 w-20">Valor</th>
              <th className="px-4 py-3 w-20">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Nenhum pedido encontrado</td></tr>}
            {filtered.map(order => {
              const action = nextAction(order.status);
              return (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 font-display text-base font-bold text-primary">{order.tableNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium truncate max-w-[140px]">{order.customerName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {order.items.slice(0, 2).map((item, i) => (
                        <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground whitespace-nowrap">{item.quantity}x {item.menuItem.name}</span>
                      ))}
                      {order.items.length > 2 && <span className="text-[10px] text-muted-foreground">+{order.items.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{order.items.length}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatTimeAgo(order.createdAt)}</td>
                  <td className="px-4 py-3 text-sm font-semibold">R$ {order.total}</td>
                  <td className="px-4 py-3">
                    {action ? (
                      <button onClick={() => updateOrderStatus(order.id, action.next)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${action.tone}`}>{action.label}</button>
                    ) : (
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold whitespace-nowrap ${statusBadge[order.status]}`}>{orderLabel[order.status]}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground text-right">{filtered.length} pedido(s) exibidos</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   4. KDS — True kanban with timer highlights
   ═══════════════════════════════════════════════ */

const DesktopKDS: React.FC<{ view: 'kitchen' | 'bar' }> = ({ view }) => {
  const { orders, updateOrderStatus } = useDemoContext();
  const items = orders.filter(o => ['confirmed', 'preparing'].includes(o.status) && (view === 'kitchen' ? o.isKitchen : o.isBar));
  const confirmed = items.filter(i => i.status === 'confirmed');
  const preparing = items.filter(i => i.status === 'preparing');
  const ready = orders.filter(i => i.status === 'ready');

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <DeskStat label="Na fila" value={String(confirmed.length)} tone="warning" icon={<Clock className="w-4 h-4" />} />
        <DeskStat label="Preparando" value={String(preparing.length)} tone="primary" icon={<Flame className="w-4 h-4" />} />
        <DeskStat label="Prontos" value={String(ready.length)} tone="success" icon={<CheckCircle2 className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-3 gap-5 items-start">
        {[
          { title: 'FILA', items: confirmed, color: 'text-warning', dot: 'bg-warning', headerBg: 'bg-warning/5 border-warning/20', action: { label: 'Iniciar preparo', next: 'preparing' as OrderStatus, tone: 'bg-warning text-warning-foreground' } },
          { title: 'PREPARANDO', items: preparing, color: 'text-primary', dot: 'bg-primary animate-pulse', headerBg: 'bg-primary/5 border-primary/20', action: { label: 'Marcar pronto', next: 'ready' as OrderStatus, tone: 'bg-success text-success-foreground' } },
          { title: 'PRONTOS P/ SERVIR', items: ready, color: 'text-success', dot: 'bg-success', headerBg: 'bg-success/5 border-success/20', action: null },
        ].map(col => (
          <div key={col.title} className="space-y-3">
            <div className={`rounded-xl border p-3 ${col.headerBg} flex items-center justify-between`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${col.color} flex items-center gap-2`}>
                <div className={`w-2 h-2 rounded-full ${col.dot}`} /> {col.title}
              </h4>
              <span className={`text-sm font-bold ${col.color}`}>{col.items.length}</span>
            </div>
            <div className="space-y-3">
              {col.items.map(o => {
                const elapsed = getElapsedMinutes(o.createdAt);
                const isLate = elapsed > 20;
                return (
                  <div key={o.id} className={`rounded-2xl border bg-card p-4 ${isLate ? 'border-destructive/30 bg-destructive/5' : 'border-border'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display text-base font-bold text-primary">M{o.tableNumber}</span>
                      <span className={`text-xs font-semibold ${isLate ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {isLate && '⚠ '}{elapsed}min
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{o.customerName}</p>
                    <div className="space-y-1 mb-3">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.menuItem.name}</span>
                          <span className="text-muted-foreground">{item.menuItem.prepTime}min</span>
                        </div>
                      ))}
                    </div>
                    {col.action && (
                      <button onClick={() => updateOrderStatus(o.id, col.action!.next)} className={`w-full rounded-xl py-2.5 text-sm font-semibold ${col.action.tone}`}>{col.action.label}</button>
                    )}
                  </div>
                );
              })}
              {col.items.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nenhum item</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   5. WAITER — Persistent split-view
   ═══════════════════════════════════════════════ */

const DesktopWaiter: React.FC<{ initialTab?: 'live' | 'tables' | 'kitchen' | 'charge' }> = ({ initialTab = 'live' }) => {
  const { tables, notifications } = useDemoContext();
  const [waiterTab, setWaiterTab] = useState<'live' | 'tables' | 'kitchen' | 'charge'>(initialTab);
  const [selectedTableNum, setSelectedTableNum] = useState<number | null>(null);
  const myTables = tables.filter(t => ['occupied', 'billing'].includes(t.status));
  const waiterCalls = notifications.filter(n => n.type === 'waiter_call' && !n.read);
  const [handledItems, setHandledItems] = useState<string[]>([]);
  const [pickedUp, setPickedUp] = useState<string[]>([]);

  const readyDishes = KITCHEN_PIPELINE.filter(d => d.status === 'ready' && !pickedUp.includes(d.id));
  const activeFeed = LIVE_FEED.filter(f => !handledItems.includes(f.id));
  

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Minhas Mesas', value: myTables.length.toString(), tone: 'primary' as const },
          { label: 'Pratos p/ Retirar', value: readyDishes.length.toString(), tone: readyDishes.length > 0 ? 'destructive' as const : 'success' as const },
          { label: 'Chamados', value: (waiterCalls.length || activeFeed.filter(f => f.type === 'call').length).toString(), tone: waiterCalls.length > 0 ? 'warning' as const : 'success' as const },
          { label: 'Gorjetas Hoje', value: 'R$ 410', tone: 'success' as const },
        ].map((s, i) => (
          <DeskStat key={i} label={s.label} value={s.value} tone={s.tone} />
        ))}
      </div>

      {/* Split view: table list (left) + content (right) */}
      <div className={`grid gap-5 ${waiterTab === 'tables' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[220px_1fr]'}`}>
        {/* Left — My tables list */}
        {waiterTab !== 'tables' && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">Minhas mesas</h4>
            {myTables.map(table => {
              const guests = getTableGuests(table.number);
              const paidPct = guests.length > 0 ? Math.round((guests.filter(g => g.paid).length / guests.length) * 100) : 0;
              const isActive = selectedTableNum === table.number;
              return (
                <button key={table.id} onClick={() => setSelectedTableNum(isActive ? null : table.number)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${isActive ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card hover:border-primary/20'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-display font-bold text-primary">{table.number}</div>
                      <div>
                        <p className="text-sm font-semibold truncate">{table.customerName}</p>
                        <p className="text-xs text-muted-foreground">{guests.length}p</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">R$ {table.orderTotal || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full transition-all" style={{ width: `${paidPct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{paidPct}%</span>
                  </div>
                </button>
              );
            })}
            {myTables.length === 0 && <p className="text-sm text-muted-foreground py-4">Nenhuma mesa atribuída</p>}
          </div>
        )}

        {/* Right — Tabs + content */}
        <div className="space-y-4">
          {/* Tab bar */}
          <div className="flex bg-muted/30 rounded-xl p-1">
            {[
              { id: 'live' as const, label: 'Feed Ao Vivo', badge: activeFeed.filter(f => f.urgency !== 'info').length },
              { id: 'tables' as const, label: 'Detalhes Mesa', badge: 0 },
              { id: 'kitchen' as const, label: 'Cozinha/Bar', badge: readyDishes.length },
              { id: 'charge' as const, label: 'Cobrar/TAP', badge: 0 },
            ].map(tab => (
              <button key={tab.id} onClick={() => setWaiterTab(tab.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${waiterTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                {tab.label}
                {tab.badge > 0 && (
                  <span className={`absolute -top-1 right-3 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center ${tab.id === 'kitchen' ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-primary text-primary-foreground'}`}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* LIVE FEED */}
          {waiterTab === 'live' && (
            <div className="space-y-4">
              {readyDishes.length > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <ChefHat className="w-5 h-5 text-destructive animate-pulse" />
                  <div className="flex-1"><p className="text-sm font-bold text-destructive">{readyDishes.length} prato(s) esperando retirada!</p></div>
                  <button onClick={() => setWaiterTab('kitchen')} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-bold">Ver</button>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {activeFeed.map(item => {
                  const cfg: Record<string, { icon: React.FC<{className?: string}>; color: string; bg: string; border: string; action: string | null }> = {
                    kitchen_ready: { icon: ChefHat, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', action: 'Retirar' },
                    call: { icon: Bell, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', action: 'Atender' },
                    payment: { icon: Check, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', action: null },
                    payment_needed: { icon: Smartphone, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', action: 'Cobrar' },
                    approval: { icon: Shield, color: 'text-info', bg: 'bg-info/10', border: 'border-info/20', action: 'Solicitar' },
                    order: { icon: BookOpen, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', action: null },
                  };
                  const c = cfg[item.type] || cfg.order;
                  const Icon = c.icon;
                  return (
                    <div key={item.id} className={`rounded-xl border ${c.border} overflow-hidden`}>
                      <div className="flex items-start gap-3 p-4">
                        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}><Icon className={`w-5 h-5 ${c.color}`} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">M{item.table}</span>
                            <span className="text-xs text-muted-foreground">{item.time}</span>
                          </div>
                          <p className="text-sm font-semibold mt-1">{item.event}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                        </div>
                      </div>
                      {c.action && (
                        <button onClick={() => setHandledItems(prev => [...prev, item.id])} className={`w-full py-2.5 text-sm font-bold border-t ${c.border} ${c.bg} ${c.color}`}>
                          {c.action} →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {activeFeed.length === 0 && (
                <div className="text-center py-16"><Check className="w-12 h-12 text-success/30 mx-auto mb-3" /><p className="font-display font-bold text-success text-lg">Tudo tranquilo!</p></div>
              )}
            </div>
          )}

          {/* TABLE ACTIONS — Full parity with mobile */}
          {waiterTab === 'tables' && <WaiterTablesActions />}

          {/* KITCHEN */}
          {waiterTab === 'kitchen' && (
            <div className="grid grid-cols-2 gap-5">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-destructive font-bold mb-3">🔔 PRONTO PARA RETIRAR</h4>
                <div className="space-y-3">
                  {readyDishes.map(dish => (
                    <div key={dish.id} className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center font-display font-bold text-lg text-destructive">{dish.table}</div>
                      <div className="flex-1"><p className="text-sm font-bold">{dish.qty}x {dish.dish}</p><p className="text-xs text-muted-foreground">{dish.chef} · {dish.readyAgo}min atrás</p></div>
                      <button onClick={() => setPickedUp(prev => [...prev, dish.id])} className="px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold">Retirar ✓</button>
                    </div>
                  ))}
                  {readyDishes.length === 0 && <p className="text-sm text-muted-foreground py-4">Nenhum prato pronto</p>}
                </div>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-warning font-bold mb-3">⏳ PREPARANDO</h4>
                <div className="space-y-3">
                  {KITCHEN_PIPELINE.filter(d => d.status === 'preparing').map(dish => (
                    <div key={dish.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center font-display font-bold text-lg text-warning">{dish.table}</div>
                      <div className="flex-1"><p className="text-sm font-semibold">{dish.qty}x {dish.dish}</p><p className="text-xs text-muted-foreground">{dish.chef}</p></div>
                      <div className="w-20 text-right">
                        <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-warning rounded-full" style={{ width: `${Math.min((dish.elapsed / dish.sla) * 100, 100)}%` }} /></div>
                        <p className={`text-[10px] font-bold mt-1 ${dish.elapsed > dish.sla ? 'text-destructive' : 'text-muted-foreground'}`}>{dish.elapsed > dish.sla ? `+${dish.elapsed - dish.sla}min` : `${dish.sla - dish.elapsed}min`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CHARGE */}
          {waiterTab === 'charge' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 p-5">
                <p className="text-base font-semibold">Cobrança inteligente</p>
                <p className="text-sm text-muted-foreground mt-1">Quem pagou pelo app aparece automaticamente. Cobre apenas quem precisa.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {myTables.map(table => {
                  const guests = getTableGuests(table.number);
                  const paidCount = guests.filter(g => g.paid).length;
                  return (
                    <div key={table.id} className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="flex items-center gap-3 p-4 bg-muted/20 border-b border-border">
                        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center font-display font-bold text-primary text-lg">{table.number}</div>
                        <div className="flex-1"><p className="text-sm font-semibold">{table.customerName}</p><span className="text-xs text-success">{paidCount}/{guests.length} pagos</span></div>
                      </div>
                      <div className="p-3 space-y-1">
                        {guests.map((guest, i) => (
                          <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${guest.paid ? 'opacity-40' : !guest.hasApp ? 'bg-warning/5' : ''}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${guest.paid ? 'bg-success/10 text-success' : guest.hasApp ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'}`}>
                              {guest.paid ? '✓' : guest.hasApp ? '📱' : '!'}
                            </div>
                            <span className="flex-1 text-sm truncate">{guest.name}</span>
                            <span className="text-sm font-semibold">R$ {guest.orders.reduce((a: number, o: { price: number; qty: number }) => a + o.price * o.qty, 0)}</span>
                            {!guest.paid && !guest.hasApp && <button className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Cobrar</button>}
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
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   6. ANALYTICS — BI Dashboard
   ═══════════════════════════════════════════════ */

const DesktopAnalytics: React.FC = () => {
  const { analytics } = useDemoContext();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  const weekData = [4200, 5100, 4800, 6300, 7200, 8100, 7800];
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const peakHours = [2, 5, 8, 15, 28, 42, 55, 68, 72, 58, 45, 30, 18, 8];
  const satisfactionData = [
    { label: '⭐ 5', value: 62, color: 'bg-success' },
    { label: '⭐ 4', value: 24, color: 'bg-primary' },
    { label: '⭐ 3', value: 9, color: 'bg-warning' },
    { label: '⭐ 2', value: 3, color: 'bg-destructive/60' },
    { label: '⭐ 1', value: 2, color: 'bg-destructive' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with period selector + export */}
      <div className="flex items-center justify-between">
        <div className="flex bg-muted/30 rounded-xl p-1">
          {(['day', 'week', 'month'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${period === p ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              {p === 'day' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/30">
          <Download className="w-4 h-4" /> Exportar relatório
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <DeskStat label="Receita" value="R$ 77.5k" tone="success" subtitle="vs semana anterior: +8%" icon={<TrendingUp className="w-4 h-4" />} />
        <DeskStat label="Pedidos" value="312" tone="primary" subtitle="Média: 44/dia" icon={<ShoppingBag className="w-4 h-4" />} />
        <DeskStat label="Satisfação" value={String(analytics.customerSatisfaction)} tone="warning" subtitle="NPS: 72" icon={<Star className="w-4 h-4" />} />
        <DeskStat label="Recorrência" value={`${analytics.returningCustomers}%`} tone="info" subtitle="clientes voltam" icon={<Users className="w-4 h-4" />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-[1fr_1fr] gap-6">
        {/* Revenue chart */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Receita semanal</h3>
            <span className="text-xs text-success font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +8%</span>
          </div>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {weekData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: 100 }}>
                  <div className="w-full max-w-[36px] rounded-t bg-primary transition-all hover:bg-primary/80" style={{ height: `${(v / Math.max(...weekData)) * 100}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak hours */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Horários de pico</h3>
            <span className="text-xs text-muted-foreground">Ocupação média (%)</span>
          </div>
          <div className="flex items-end gap-[3px]" style={{ height: 100 }}>
            {peakHours.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
                  <div className={`w-full max-w-[20px] rounded-t transition-all ${v > 60 ? 'bg-destructive/70' : v > 40 ? 'bg-warning/70' : 'bg-success/70'}`} style={{ height: `${v}%` }} />
                </div>
                <span className="text-[8px] text-muted-foreground">{10 + i}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: satisfaction + top items */}
      <div className="grid grid-cols-[1fr_1fr] gap-6">
        {/* Satisfaction breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">Satisfação dos clientes</h3>
          <div className="space-y-3">
            {satisfactionData.map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-sm w-10">{s.label}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.value}%` }} />
                </div>
                <span className="text-xs font-semibold text-muted-foreground w-10 text-right">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top items */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">Top vendidos</h3>
          <div className="space-y-3">
            {analytics.topItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center font-display text-xs font-bold text-primary">#{i + 1}</span>
                <span className="text-sm font-semibold flex-1">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.quantity} un.</span>
                <div className="w-16"><MiniBar data={[item.quantity * 0.4, item.quantity * 0.7, item.quantity * 0.9, item.quantity]} height={20} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   7. CONFIG — Sidebar navigation + wide form
   ═══════════════════════════════════════════════ */

const CONFIG_NAV = [
  { screen: 'config-hub' as RestaurantScreen, label: 'Visão Geral', icon: LayoutGrid },
  { screen: 'config-profile' as RestaurantScreen, label: 'Perfil', icon: Edit3 },
  { screen: 'config-service-types' as RestaurantScreen, label: 'Tipos de Serviço', icon: Coffee },
  { screen: 'config-experience' as RestaurantScreen, label: 'Experiência', icon: Star },
  { screen: 'config-floor' as RestaurantScreen, label: 'Salão & Mesas', icon: LayoutGrid },
  { screen: 'config-menu' as RestaurantScreen, label: 'Cardápio', icon: BookOpen },
  { screen: 'config-team' as RestaurantScreen, label: 'Equipe', icon: Users },
  { screen: 'config-kitchen' as RestaurantScreen, label: 'Cozinha & Bar', icon: ChefHat },
  { screen: 'config-payments' as RestaurantScreen, label: 'Pagamentos', icon: DollarSign },
  { screen: 'config-features' as RestaurantScreen, label: 'Marketplace', icon: Zap },
];

const DesktopConfigWrapper: React.FC<{ screen: RestaurantScreen; onNavigate: (screen: string) => void; activeRole: StaffRole }> = ({ screen, onNavigate, activeRole }) => {
  const renderContent = () => {
    switch (screen) {
      case 'config-hub': return <ConfigHub onNavigate={onNavigate} />;
      case 'config-profile': return <ConfigProfile onNavigate={onNavigate} />;
      case 'config-service-types': return <ConfigServiceTypes onNavigate={onNavigate} />;
      case 'config-experience': return <ConfigExperience onNavigate={onNavigate} />;
      case 'config-floor': return <ConfigFloor onNavigate={onNavigate} />;
      case 'config-menu': return <ConfigMenu onNavigate={onNavigate} />;
      case 'config-team': return <ConfigTeam onNavigate={onNavigate} activeRole={activeRole} />;
      case 'config-kitchen': return <ConfigKitchen onNavigate={onNavigate} />;
      case 'config-payments': return <ConfigPayments onNavigate={onNavigate} />;
      case 'config-features': return <ConfigFeatures onNavigate={onNavigate} />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-[220px_1fr] gap-6">
      {/* Fixed sidebar nav */}
      <nav className="sticky top-4 self-start space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-3">Configuração</h4>
        {CONFIG_NAV.map(item => {
          const active = item.screen === screen;
          return (
            <button key={item.screen} onClick={() => onNavigate(item.screen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
      {/* Wide form */}
      <div className="min-w-0">{renderContent()}</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   REMAINING SCREENS — enhanced for desktop density
   ═══════════════════════════════════════════════ */

const reservationLabel: Record<string, string> = { confirmed: 'Confirmada', waiting: 'Aguardando', cancelled: 'Cancelada', seated: 'Acomodado' };

const DesktopMaitre: React.FC = () => {
  const { reservations, tables } = useDemoContext();
  const available = tables.filter(t => t.status === 'available');
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <DeskStat label="Reservas Hoje" value={String(reservations.length)} tone="primary" icon={<Users className="w-4 h-4" />} />
        <DeskStat label="Mesas Livres" value={String(available.length)} tone="success" />
        <DeskStat label="Fila estimada" value="25min" tone="warning" />
        <DeskStat label="Capacidade" value={`${tables.length} mesas`} tone="info" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-5">
        <DeskSection title="Reservas do dia">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_80px_120px] px-5 py-2.5 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
              <span>Cliente</span><span>Horário</span><span>Pessoas</span><span>Status</span>
            </div>
            {reservations.map(r => (
              <div key={r.id} className="grid grid-cols-[1fr_100px_80px_120px] px-5 py-3 border-b last:border-0 items-center">
                <div><p className="text-sm font-semibold">{r.customerName}</p>{r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}</div>
                <span className="text-sm">{r.time}</span>
                <span className="text-sm">{r.partySize}</span>
                <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-semibold text-warning">{reservationLabel[r.status] || r.status}</span>
              </div>
            ))}
          </div>
        </DeskSection>
        <div>
          <h4 className="text-sm font-bold mb-3">Mesas disponíveis</h4>
          <div className="space-y-2">
            {available.map(t => (
              <div key={t.id} className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center justify-between">
                <div><span className="font-display font-bold text-base">Mesa {t.number}</span><p className="text-xs text-muted-foreground">{t.seats} lugares</p></div>
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success">Livre</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DesktopMenu: React.FC = () => {
  const { menu } = useDemoContext();
  const categories = [...new Set(menu.map(item => item.category))];
  const [category, setCategory] = useState(categories[0]);
  const items = menu.filter(item => item.category === category);
  return (
    <div className="space-y-5">
      <div className="flex gap-3 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`rounded-full px-5 py-2.5 text-sm font-semibold ${category === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
            <div className="min-w-0 flex-1"><p className="text-base font-semibold">{item.name}</p><p className="line-clamp-2 text-sm text-muted-foreground mt-1">{item.description}</p></div>
            <span className="text-base font-bold text-primary shrink-0">R$ {item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DesktopTeam: React.FC = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden overflow-x-auto">
    <table className="w-full text-left min-w-[500px]">
      <thead>
        <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
          <th className="px-4 py-3">Nome</th>
          <th className="px-4 py-3 w-20">Função</th>
          <th className="px-4 py-3 w-20">Turno</th>
          <th className="px-4 py-3 w-16">Vendas</th>
          <th className="px-4 py-3 w-16">Gorjetas</th>
          <th className="px-4 py-3 w-16">Status</th>
        </tr>
      </thead>
      <tbody>
        {TEAM_MEMBERS.map(m => (
          <tr key={m.id} className="border-b last:border-0">
            <td className="px-4 py-3"><div className="flex items-center gap-2"><img src={m.avatar} alt={m.name} className="h-8 w-8 rounded-full object-cover" /><span className="text-sm font-semibold truncate">{m.name}</span></div></td>
            <td className="px-4 py-3 text-xs">{m.role}</td>
            <td className="px-4 py-3 text-xs text-muted-foreground">{m.shift}</td>
            <td className="px-4 py-3 text-xs">{m.sales > 0 ? `R$ ${(m.sales / 1000).toFixed(1)}k` : '—'}</td>
            <td className="px-4 py-3 text-xs text-success">{m.tips > 0 ? `R$ ${m.tips}` : '—'}</td>
            <td className="px-4 py-3"><span className={`text-xs font-semibold ${m.status === 'online' ? 'text-success' : 'text-muted-foreground'}`}>{m.status === 'online' ? 'Ativo' : 'Folga'}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DesktopManager: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { analytics, orders } = useDemoContext();
  const lateOrders = orders.filter(o => !['delivered', 'paid'].includes(o.status) && getElapsedMinutes(o.createdAt) > 15);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <DeskStat label="Pedidos ativos" value={String(orders.filter(o => !['delivered', 'paid'].includes(o.status)).length)} tone="primary" />
        <DeskStat label="Aprovações" value={String(PENDING_APPROVALS.length)} tone="warning" />
        <DeskStat label="Equipe ativa" value={String(TEAM_MEMBERS.filter(t => t.status === 'online').length)} tone="info" />
        <DeskStat label="Receita" value={`R$ ${analytics.todayRevenue.toLocaleString()}`} tone="success" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {lateOrders.length > 0 && (
            <button onClick={() => onNavigate('orders')} className="flex w-full items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-left text-sm font-semibold text-destructive">
              <AlertCircle className="h-5 w-5" /> {lateOrders.length} pedidos com atraso
            </button>
          )}
          <button onClick={() => onNavigate('approvals')} className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-5 py-4 text-left">
            <div><p className="text-sm font-semibold">Central de aprovações</p><p className="text-xs text-muted-foreground">{PENDING_APPROVALS.length} pendentes</p></div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </button>
          <button onClick={() => onNavigate('daily-report')} className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-5 py-4 text-left">
            <div><p className="text-sm font-semibold">Relatório do dia</p><p className="text-xs text-muted-foreground">Fechamento e métricas</p></div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div><h4 className="text-sm font-bold mb-3">Equipe em serviço</h4><DesktopTeam /></div>
      </div>
    </div>
  );
};

const DesktopApprovals: React.FC = () => {
  const [handled, setHandled] = useState<string[]>([]);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden overflow-x-auto">
      <table className="w-full text-left min-w-[500px]">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3 w-16">Mesa</th>
            <th className="px-4 py-3 w-20">Solicitante</th>
            <th className="px-4 py-3 w-16">Valor</th>
            <th className="px-4 py-3 w-28">Ação</th>
          </tr>
        </thead>
        <tbody>
          {PENDING_APPROVALS.map(item => {
            const done = handled.includes(item.id);
            return (
              <tr key={item.id} className={`border-b last:border-0 ${done ? 'bg-success/5' : ''}`}>
                <td className="px-4 py-3"><p className="text-sm font-semibold">{item.item}</p><p className="text-xs text-muted-foreground">{item.reason}</p></td>
                <td className="px-4 py-3 text-sm">Mesa {item.table}</td>
                <td className="px-4 py-3 text-sm">{item.requestedBy}</td>
                <td className="px-4 py-3 text-sm font-semibold text-destructive">R$ {item.amount}</td>
                <td className="px-4 py-3">
                  {!done ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => setHandled(p => [...p, item.id])} className="rounded-lg bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground">Aprovar</button>
                      <button onClick={() => setHandled(p => [...p, item.id])} className="rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">Recusar</button>
                    </div>
                  ) : <span className="flex items-center gap-1 text-xs font-semibold text-success"><CheckCircle2 className="h-3.5 w-3.5" /> OK</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const DesktopRecipes: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
    {DRINK_RECIPES.map(recipe => (
      <div key={recipe.id} className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-4">
          <img src={recipe.image} alt={recipe.name} className="h-20 w-20 rounded-xl object-cover" />
          <div className="min-w-0 flex-1"><p className="text-base font-semibold">{recipe.name}</p><p className="text-sm text-muted-foreground">{recipe.glass} · {recipe.prepTime}min</p></div>
          <span className="text-base font-bold text-primary">R$ {recipe.price}</span>
        </div>
        <div className="border-t border-border pt-3 space-y-1">
          {recipe.ingredients.map((ing, i) => (
            <p key={i} className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary" />{ing}</p>
          ))}
          <p className="text-xs text-muted-foreground mt-1">Garnish: {recipe.garnish}</p>
        </div>
      </div>
    ))}
  </div>
);

const DesktopStock: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'critical'>('all');
  const filtered = filterStatus === 'all' ? STOCK_ITEMS : STOCK_ITEMS.filter(s => s.status === filterStatus);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {(['all', 'low', 'critical'] as const).map(k => (
          <button key={k} onClick={() => setFilterStatus(k)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${filterStatus === k ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {k === 'all' ? 'Todos' : k === 'low' ? 'Baixo' : 'Crítico'}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[480px]">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3 w-20">Categoria</th>
              <th className="px-4 py-3 w-16">Estoque</th>
              <th className="px-4 py-3 w-14">Mín</th>
              <th className="px-4 py-3 w-16">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm font-semibold">{item.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{item.category}</td>
                <td className="px-4 py-3 text-xs">{item.current} {item.unit}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{item.min}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${item.status === 'critical' ? 'bg-destructive/10 text-destructive' : item.status === 'low' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                    {item.status === 'critical' ? 'Crítico' : item.status === 'low' ? 'Baixo' : 'OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DesktopTips: React.FC = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-4 gap-4">
      <DeskStat label="Gorjetas do dia" value="R$ 410" tone="success" icon={<DollarSign className="w-4 h-4" />} />
      <DeskStat label="Mesas atendidas" value="12" tone="primary" />
      <DeskStat label="Média por mesa" value="R$ 34" tone="info" />
      <DeskStat label="Gorjeta média" value="12%" tone="warning" />
    </div>
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-[60px_1fr_100px_100px] px-5 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
        <span>Mesa</span><span>Cliente</span><span>% da conta</span><span>Valor</span>
      </div>
      {[
        { table: 8, customer: 'Grupo Aniversário', amount: 120, pct: '15%' },
        { table: 5, customer: 'Grupo Pedro', amount: 85, pct: '12%' },
        { table: 10, customer: 'Carlos M.', amount: 98, pct: '10%' },
        { table: 3, customer: 'João & Ana', amount: 62, pct: '10%' },
        { table: 1, customer: 'Maria S.', amount: 45, pct: '15%' },
      ].map((tip, i) => (
        <div key={i} className="grid grid-cols-[60px_1fr_100px_100px] px-5 py-3 border-b last:border-0 items-center">
          <span className="font-display font-bold text-success">{tip.table}</span>
          <span className="text-sm font-semibold">{tip.customer}</span>
          <span className="text-sm text-muted-foreground">{tip.pct}</span>
          <span className="text-sm font-bold text-success">+R$ {tip.amount}</span>
        </div>
      ))}
    </div>
  </div>
);

const DesktopFloorFlow: React.FC = () => {
  const { reservations, tables } = useDemoContext();
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <DeskStat label="Fila estimada" value="25min" tone="warning" />
        <DeskStat label="Mesas livres" value={String(tables.filter(t => t.status === 'available').length)} tone="success" />
        <DeskStat label="Reservas" value={String(reservations.length)} tone="primary" />
        <DeskStat label="Tempo médio" value="72min" tone="info" />
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_80px_120px] px-5 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
          <span>Cliente</span><span>Horário</span><span>Pessoas</span><span>Status</span>
        </div>
        {reservations.map(item => (
          <div key={item.id} className="grid grid-cols-[1fr_100px_80px_120px] px-5 py-3 border-b last:border-0 items-center">
            <span className="text-sm font-semibold">{item.customerName}</span>
            <span className="text-sm">{item.time}</span>
            <span className="text-sm">{item.partySize}</span>
            <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-semibold text-warning">{reservationLabel[item.status] || item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DesktopDailyReport: React.FC = () => {
  const { analytics } = useDemoContext();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <DeskStat label="Receita dia" value={`R$ ${analytics.todayRevenue.toLocaleString()}`} tone="success" />
        <DeskStat label="Pedidos" value={String(analytics.todayOrders)} tone="primary" />
        <DeskStat label="Ticket Médio" value={`R$ ${analytics.avgTicket}`} tone="info" />
        <DeskStat label="Ocupação" value={`${analytics.occupancyRate}%`} tone="warning" />
        <DeskStat label="Satisfação" value={String(analytics.customerSatisfaction)} tone="success" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-base font-bold mb-4">Fechamento operacional</p>
          <div className="space-y-3">
            {['Caixa conciliado', 'Equipe encerrada', 'Estoque revisado', 'Pendências zeradas'].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm text-foreground"><Check className="h-5 w-5 text-success" /> {item}</div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-base font-bold mb-4">Top vendidos do dia</p>
          <div className="space-y-3">
            {analytics.topItems.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="font-bold text-primary">#{i + 1}</span> {item.name}</span>
                <span className="text-muted-foreground">{item.quantity} vendidos</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DesktopWelcome: React.FC<{ onSelectRole?: (role: StaffRole) => void }> = ({ onSelectRole }) => (
  <div className="space-y-6">
    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8 text-center">
      <p className="text-sm font-semibold text-primary">DEMO INTERATIVA</p>
      <h2 className="mt-3 font-display text-3xl font-bold text-foreground">Bistrô Noowe</h2>
      <p className="mt-2 text-base text-muted-foreground max-w-lg mx-auto">Escolha o papel e veja a operação sob a ótica de cada equipe.</p>
    </div>
    <div className="grid grid-cols-4 gap-4">
      {ROLE_CONFIG.map(role => (
        <button key={role.id} onClick={() => onSelectRole?.(role.id)} className={`rounded-2xl border border-border bg-gradient-to-br ${role.gradient} p-6 text-left hover:shadow-lg transition-shadow`}>
          <span className="text-3xl">{role.emoji}</span>
          <p className="mt-3 text-base font-bold">{role.label}</p>
          <p className="text-sm text-muted-foreground mt-1">{role.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

const DesktopSetup: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const STEPS = [
    { id: '1', title: 'Informações Básicas', desc: 'Nome, endereço, tipo de culinária e horário', icon: '🏪', required: true, done: true },
    { id: '2', title: 'Configurar Cardápio', desc: 'Categorias, pratos, preços e descrições', icon: '🍽️', required: true, done: true },
    { id: '3', title: 'Configurar Mesas', desc: 'Layout do salão e número de mesas', icon: '🪑', required: true, done: false },
    { id: '4', title: 'Sistema de Reservas', desc: 'Capacidade, horários e políticas', icon: '📅', required: true, done: false },
    { id: '5', title: 'Métodos de Pagamento', desc: 'Formas de pagamento e taxas', icon: '💳', required: true, done: false },
    { id: '6', title: 'Equipe e Funções', desc: 'Membros e permissões (7 roles)', icon: '👥', required: false, done: false },
    { id: '7', title: 'Configurações de Gorjetas', desc: 'Porcentagens e distribuição', icon: '⭐', required: false, done: false },
    { id: '8', title: 'Integrações', desc: 'Delivery apps e sistemas externos', icon: '🔗', required: false, done: false },
  ];
  const req = STEPS.filter(s => s.required);
  const opt = STEPS.filter(s => !s.required);
  const doneReq = req.filter(s => s.done).length;
  const pct = Math.round((doneReq / req.length) * 100);

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">🚀</div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Configuração do Restaurante</h2>
            <p className="text-sm text-muted-foreground">Complete os passos abaixo para começar a operar</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{doneReq}/{req.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">Faltam {req.length - doneReq} passos obrigatórios</p>
      </div>

      {/* Required steps grid */}
      <div>
        <p className="text-xs font-bold text-destructive uppercase tracking-wider mb-3 flex items-center gap-1">⚠️ Passos Obrigatórios</p>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {req.map(s => (
            <div key={s.id} className={`flex items-center gap-3 p-4 rounded-2xl border ${s.done ? 'bg-green-500/5 border-green-500/20' : 'bg-card border-border hover:border-primary/20'} transition-colors cursor-pointer`}>
              <span className="text-2xl">{s.icon}</span>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${s.done ? 'line-through text-green-600' : ''}`}>{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              {s.done ? <span className="text-green-500">✓</span> : <span className="text-muted-foreground/30">○</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Optional steps */}
      <div>
        <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-1">⭐ Passos Opcionais</p>
        <div className="grid grid-cols-3 gap-3">
          {opt.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-warning/20 transition-colors cursor-pointer">
              <span className="text-2xl">{s.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <span className="text-muted-foreground/30">○</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => onNavigate('config-hub')} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-muted/30 text-sm font-semibold hover:bg-muted/60 transition-colors">
          ⚙️ Config Hub Avançado
        </button>
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          📊 Ir para Dashboard
        </button>
      </div>
    </div>
  );
};

const DesktopWaiterAssist: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  return <WaiterAssistScreen onNavigate={onNavigate} />;
};

/* ═══════════════════════════════════════════════
   MAIN SCREEN ROUTER
   ═══════════════════════════════════════════════ */

const isConfigScreen = (s: string): boolean => s.startsWith('config-');

export const DesktopRestaurantScreen: React.FC<{
  screen: RestaurantScreen;
  activeRole: StaffRole;
  onNavigate: (screen: string) => void;
  onSelectRole: (role: StaffRole) => void;
}> = ({ screen, activeRole, onNavigate, onSelectRole }) => {
  const { t, translateText } = useDemoI18n();
  const title = translateText(SCREEN_INFO[screen]?.title || '');

  // Config screens get sidebar wrapper
  if (isConfigScreen(screen)) {
    return (
      <div className="space-y-6 pb-8">
        <div className="rounded-2xl border border-border bg-card px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{translateText('Configuração')}</p>
            <p className="mt-1 text-lg font-bold text-foreground">{title}</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Desktop</span>
        </div>
        <DesktopConfigWrapper screen={screen} onNavigate={onNavigate} activeRole={activeRole} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-2xl border border-border bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{translateText('Modo desktop')}</p>
          <p className="mt-1 text-lg font-bold text-foreground">{title}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Desktop</span>
      </div>

      {screen === 'welcome' && <DesktopWelcome onSelectRole={onSelectRole} />}
      {screen === 'setup' && <DesktopSetup onNavigate={onNavigate} />}
      {screen === 'dashboard' && <DesktopDashboard onNavigate={onNavigate} />}
      {screen === 'table-map' && <DesktopTableMap />}
      {screen === 'orders' && <DesktopOrders />}
      {screen === 'kds-kitchen' && <DesktopKDS view="kitchen" />}
      {screen === 'kds-bar' && <DesktopKDS view="bar" />}
      {screen === 'maitre' && <DesktopMaitre />}
      {screen === 'waiter' && <DesktopWaiter />}
      {screen === 'menu-editor' && <DesktopMenu />}
      {screen === 'team' && <DesktopTeam />}
      {screen === 'analytics' && <DesktopAnalytics />}
      {screen === 'manager-ops' && <DesktopManager onNavigate={onNavigate} />}
      {screen === 'approvals' && <DesktopApprovals />}
      {screen === 'barman-station' && <DesktopKDS view="bar" />}
      {screen === 'drink-recipes' && <DesktopRecipes />}
      {screen === 'cook-station' && <DesktopKDS view="kitchen" />}
      {screen === 'stock' && <DesktopStock />}
      {screen === 'waiter-calls' && <DesktopWaiter initialTab="live" />}
      {screen === 'waiter-tips' && <DesktopTips />}
      {screen === 'waiter-payment' && <DesktopWaiter initialTab="charge" />}
      {screen === 'waiter-actions' && <DesktopWaiter initialTab="live" />}
      {screen === 'waiter-assist' && <DesktopWaiterAssist onNavigate={onNavigate} />}
      {screen === 'waiter-table-detail' && <DesktopWaiter initialTab="tables" />}
      {screen === 'floor-flow' && <DesktopFloorFlow />}
      {screen === 'daily-report' && <DesktopDailyReport />}
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

      <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{translateText('Perfil ativo')}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{t('roles', activeRole)}</p>
        </div>
      </div>
    </div>
  );
};
