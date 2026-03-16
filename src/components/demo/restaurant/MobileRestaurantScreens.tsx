import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  DollarSign,
  Flame,
  LayoutGrid,
  Package,
  Shield,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
  Wine,
  XCircle,
} from 'lucide-react';
import { useDemoContext, type OrderStatus, type TableStatus } from '@/contexts/DemoContext';
import { useDemoI18n } from '@/components/demo/DemoI18n';
import {
  DRINK_RECIPES,
  PENDING_APPROVALS,
  ROLE_CONFIG,
  SCREEN_INFO,
  STOCK_ITEMS,
  TEAM_MEMBERS,
  formatTimeAgo,
  getElapsedMinutes,
  type RestaurantScreen,
  type StaffRole,
} from './RestaurantDemoShared';

const statusBadgeMap: Record<OrderStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  confirmed: 'bg-info/10 text-info',
  preparing: 'bg-warning/10 text-warning',
  ready: 'bg-success/10 text-success',
  delivered: 'bg-primary/10 text-primary',
  paid: 'bg-muted text-muted-foreground',
};

const orderLabelMap: Record<OrderStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivered: 'Entregue',
  paid: 'Pago',
};

const tableBadgeMap: Record<TableStatus, string> = {
  available: 'bg-success/10 text-success',
  occupied: 'bg-primary/10 text-primary',
  reserved: 'bg-warning/10 text-warning',
  billing: 'bg-info/10 text-info',
};

const tableLabelMap: Record<TableStatus, string> = {
  available: 'Livre',
  occupied: 'Ocupada',
  reserved: 'Reserva',
  billing: 'Conta',
};

const MobileSection: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, action, children }) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle ? <p className="text-[11px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const CompactStat: React.FC<{ label: string; value: string; tone?: 'primary' | 'success' | 'warning' | 'info' }> = ({ label, value, tone = 'primary' }) => {
  const toneMap = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
  } as const;

  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className={`inline-flex rounded-xl px-2 py-1 text-xs font-semibold ${toneMap[tone]}`}>{value}</div>
      <p className="mt-2 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
};

const MobileHint: React.FC<{ text: string }> = ({ text }) => (
  <div className="rounded-2xl border border-primary/10 bg-primary/5 px-3 py-2.5 text-[11px] text-primary">
    {text}
  </div>
);

const MobileDashboard: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { analytics, orders, notifications, tables } = useDemoContext();
  const activeOrders = orders.filter(o => !['paid', 'delivered'].includes(o.status)).length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;

  return (
    <div className="space-y-4">
      <MobileHint text="Resumo executivo otimizado para leitura rápida no celular." />
      <div className="grid grid-cols-2 gap-3">
        <CompactStat label="Receita Hoje" value={`R$ ${analytics.todayRevenue.toLocaleString()}`} tone="success" />
        <CompactStat label="Pedidos Ativos" value={String(activeOrders)} tone="primary" />
        <CompactStat label="Ocupação" value={`${analytics.occupancyRate}%`} tone="warning" />
        <CompactStat label="Ticket Médio" value={`R$ ${analytics.avgTicket}`} tone="info" />
      </div>

      <MobileSection title="Ações rápidas" subtitle="Atalhos para o que importa agora">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onNavigate('orders')} className="rounded-2xl border border-border bg-card p-3 text-left">
            <ShoppingBag className="mb-2 h-4 w-4 text-primary" />
            <p className="text-xs font-semibold">Pedidos</p>
            <p className="text-[11px] text-muted-foreground">{activeOrders} em andamento</p>
          </button>
          <button onClick={() => onNavigate('table-map')} className="rounded-2xl border border-border bg-card p-3 text-left">
            <LayoutGrid className="mb-2 h-4 w-4 text-info" />
            <p className="text-xs font-semibold">Mesas</p>
            <p className="text-[11px] text-muted-foreground">{tables.filter(t => t.status === 'occupied').length} ocupadas</p>
          </button>
          <button onClick={() => onNavigate('kds-kitchen')} className="rounded-2xl border border-border bg-card p-3 text-left">
            <ChefHat className="mb-2 h-4 w-4 text-warning" />
            <p className="text-xs font-semibold">KDS Cozinha</p>
            <p className="text-[11px] text-muted-foreground">{readyOrders} prontos</p>
          </button>
          <button onClick={() => onNavigate('analytics')} className="rounded-2xl border border-border bg-card p-3 text-left">
            <TrendingUp className="mb-2 h-4 w-4 text-success" />
            <p className="text-xs font-semibold">Analytics</p>
            <p className="text-[11px] text-muted-foreground">Top itens e pico</p>
          </button>
        </div>
      </MobileSection>

      <MobileSection title="Pedidos recentes">
        <div className="space-y-2">
          {orders.slice(0, 4).map(order => (
            <button key={order.id} onClick={() => onNavigate('orders')} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary">
                {order.tableNumber}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{order.customerName}</p>
                <p className="text-[11px] text-muted-foreground">{order.items.length} itens · {formatTimeAgo(order.createdAt)}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusBadgeMap[order.status]}`}>{orderLabelMap[order.status]}</span>
            </button>
          ))}
        </div>
      </MobileSection>

      <MobileSection title="Alertas">
        <div className="space-y-2">
          {notifications.slice(0, 3).map(item => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-3">
              <p className="text-xs font-medium text-foreground">{item.message}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{formatTimeAgo(item.timestamp)}</p>
            </div>
          ))}
        </div>
      </MobileSection>
    </div>
  );
};

const MobileTableMap: React.FC = () => {
  const { tables, updateTableStatus } = useDemoContext();
  const [selectedTable, setSelectedTable] = useState<string | null>(tables[0]?.id ?? null);
  const selected = tables.find(t => t.id === selectedTable) ?? tables[0];

  return (
    <div className="space-y-4">
      <MobileHint text="No mobile, o mapa vira uma grade operacional rápida para seleção e ação." />
      <div className="grid grid-cols-3 gap-2">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => setSelectedTable(table.id)}
            className={`rounded-2xl border p-3 text-left ${selected?.id === table.id ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-foreground">{table.number}</span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${tableBadgeMap[table.status]}`}>{tableLabelMap[table.status]}</span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{table.seats} lugares</p>
            {table.customerName ? <p className="truncate text-[11px] font-medium text-foreground">{table.customerName}</p> : null}
          </button>
        ))}
      </div>

      {selected ? (
        <div className="rounded-3xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg font-bold">Mesa {selected.number}</p>
              <p className="text-[11px] text-muted-foreground">{selected.customerName || 'Sem cliente no momento'}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tableBadgeMap[selected.status]}`}>{tableLabelMap[selected.status]}</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <CompactStat label="Lugares" value={String(selected.seats)} tone="info" />
            <CompactStat label="Conta" value={selected.orderTotal ? `R$ ${selected.orderTotal}` : '—'} tone="primary" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {selected.status === 'available' ? <button onClick={() => updateTableStatus(selected.id, 'occupied')} className="rounded-2xl bg-primary px-3 py-3 text-xs font-semibold text-primary-foreground">Sentar cliente</button> : null}
            {selected.status === 'occupied' ? <button onClick={() => updateTableStatus(selected.id, 'billing')} className="rounded-2xl bg-info px-3 py-3 text-xs font-semibold text-info-foreground">Fechar conta</button> : null}
            {selected.status === 'billing' ? <button onClick={() => updateTableStatus(selected.id, 'available')} className="rounded-2xl bg-success px-3 py-3 text-xs font-semibold text-success-foreground">Liberar mesa</button> : null}
            {selected.status === 'reserved' ? <button onClick={() => updateTableStatus(selected.id, 'occupied')} className="rounded-2xl bg-warning px-3 py-3 text-xs font-semibold text-warning-foreground">Check-in</button> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const MobileOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useDemoContext();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const filtered = filter === 'all' ? orders : orders.filter(order => order.status === filter);

  const nextAction = (status: OrderStatus): { label: string; next: OrderStatus; tone: string } | null => {
    if (status === 'pending') return { label: 'Confirmar', next: 'confirmed', tone: 'bg-primary text-primary-foreground' };
    if (status === 'confirmed') return { label: 'Preparar', next: 'preparing', tone: 'bg-warning text-warning-foreground' };
    if (status === 'preparing') return { label: 'Marcar pronto', next: 'ready', tone: 'bg-success text-success-foreground' };
    if (status === 'ready') return { label: 'Entregar', next: 'delivered', tone: 'bg-info text-info-foreground' };
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(['all', 'pending', 'confirmed', 'preparing', 'ready'] as const).map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold ${filter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {key === 'all' ? 'Todos' : orderLabelMap[key]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(order => {
          const action = nextAction(order.status);
          return (
            <div key={order.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary">
                  {order.tableNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{order.customerName}</p>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusBadgeMap[order.status]}`}>{orderLabelMap[order.status]}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{order.items.length} itens · R$ {order.total} · {formatTimeAgo(order.createdAt)}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {order.items.slice(0, 2).map((item, index) => (
                      <span key={index} className="rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">{item.quantity}x {item.menuItem.name}</span>
                    ))}
                  </div>
                </div>
              </div>
              {action ? (
                <button onClick={() => updateOrderStatus(order.id, action.next)} className={`mt-3 w-full rounded-2xl px-3 py-2.5 text-xs font-semibold ${action.tone}`}>
                  {action.label}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MobileKDS: React.FC<{ view: 'kitchen' | 'bar' }> = ({ view }) => {
  const { orders, updateOrderStatus } = useDemoContext();
  const items = orders.filter(o => ['confirmed', 'preparing'].includes(o.status) && (view === 'kitchen' ? o.isKitchen : o.isBar));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <CompactStat label="Fila" value={String(items.filter(i => i.status === 'confirmed').length)} tone="warning" />
        <CompactStat label="Preparando" value={String(items.filter(i => i.status === 'preparing').length)} tone="primary" />
        <CompactStat label="Prontos" value={String(orders.filter(i => i.status === 'ready').length)} tone="success" />
      </div>
      <div className="space-y-2">
        {items.map(order => (
          <div key={order.id} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Mesa {order.tableNumber}</p>
                <p className="text-[11px] text-muted-foreground">{order.items.length} itens · {getElapsedMinutes(order.createdAt)}min</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusBadgeMap[order.status]}`}>{orderLabelMap[order.status]}</span>
            </div>
            <div className="mt-2 space-y-1">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-[11px]">
                  <span className="text-foreground">{item.quantity}x {item.menuItem.name}</span>
                  <span className="text-muted-foreground">{item.menuItem.prepTime}min</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => updateOrderStatus(order.id, order.status === 'confirmed' ? 'preparing' : 'ready')}
              className={`mt-3 w-full rounded-2xl px-3 py-2.5 text-xs font-semibold ${order.status === 'confirmed' ? 'bg-warning text-warning-foreground' : 'bg-success text-success-foreground'}`}
            >
              {order.status === 'confirmed' ? 'Iniciar preparo' : 'Marcar pronto'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileMaitre: React.FC = () => {
  const { reservations, tables } = useDemoContext();
  const available = tables.filter(t => t.status === 'available').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <CompactStat label="Reservas Hoje" value={String(reservations.length)} tone="primary" />
        <CompactStat label="Mesas Livres" value={String(available)} tone="success" />
      </div>
      <MobileSection title="Reservas confirmadas">
        <div className="space-y-2">
          {reservations.map(reservation => (
            <div key={reservation.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{reservation.customerName}</p>
                  <p className="text-[11px] text-muted-foreground">{reservation.time} · {reservation.partySize} pessoas</p>
                </div>
                <span className="rounded-full bg-warning/10 px-2 py-1 text-[10px] font-semibold text-warning">{reservation.status}</span>
              </div>
              {reservation.notes ? <p className="mt-2 text-[11px] text-muted-foreground">{reservation.notes}</p> : null}
            </div>
          ))}
        </div>
      </MobileSection>
    </div>
  );
};

const MobileWaiter: React.FC = () => {
  const { orders, tables, notifications } = useDemoContext();
  const waiterCalls = notifications.filter(n => n.type === 'waiter_call' && !n.read);
  const myTables = tables.filter(t => ['occupied', 'billing'].includes(t.status));
  const activeOrders = orders.filter(o => !['paid', 'delivered'].includes(o.status));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <CompactStat label="Mesas" value={String(myTables.length)} tone="primary" />
        <CompactStat label="Pedidos" value={String(activeOrders.length)} tone="info" />
        <CompactStat label="Chamados" value={String(waiterCalls.length)} tone="warning" />
        <CompactStat label="Gorjetas" value="R$ 410" tone="success" />
      </div>

      {/* Urgent call banner */}
      {waiterCalls.length > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-destructive/10 border border-destructive/20 animate-pulse">
          <Bell className="h-4 w-4 text-destructive" />
          <p className="text-[11px] font-semibold text-destructive">{waiterCalls.length} chamado(s) pendente(s)!</p>
        </div>
      )}

      <MobileSection title="Minhas mesas">
        <div className="space-y-2">
          {myTables.map(table => {
            const tableOrders = orders.filter(o => o.tableNumber === table.number && !['paid'].includes(o.status));
            const hasCall = waiterCalls.some(c => c.message.includes(`Mesa ${table.number}`));
            return (
              <div key={table.id} className={`rounded-2xl border-2 p-3 ${
                hasCall ? 'border-destructive/30 bg-destructive/5' :
                table.status === 'billing' ? 'border-warning/30 bg-warning/5' : 'border-border bg-card'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm ${
                      hasCall ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                    }`}>{table.number}</div>
                    <div>
                      <p className="text-sm font-semibold">{table.customerName}</p>
                      <p className="text-[10px] text-muted-foreground">{table.seats} pessoas · {tableOrders.length} pedido(s)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-primary">{table.orderTotal ? `R$ ${table.orderTotal}` : '—'}</span>
                    {hasCall && <p className="text-[8px] font-bold text-destructive">CHAMADO!</p>}
                    {table.status === 'billing' && <p className="text-[8px] font-bold text-warning">PAGTO</p>}
                  </div>
                </div>
                {/* Order items preview */}
                {tableOrders.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {tableOrders[0].items.slice(0, 2).map((item, i) => (
                      <span key={i} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{item.quantity}x {item.menuItem.name}</span>
                    ))}
                  </div>
                )}
                {/* Guest status */}
                <div className="mt-2 flex items-center gap-1">
                  {[true, true, false].slice(0, Math.min(3, table.seats)).map((hasApp, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${
                      hasApp ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}>{hasApp ? '✓' : '?'}</div>
                  ))}
                  <span className="text-[9px] text-muted-foreground ml-1">2 com app · 1 sem app</span>
                </div>
              </div>
            );
          })}
        </div>
      </MobileSection>
    </div>
  );
};

const MobileMenu: React.FC = () => {
  const { menu } = useDemoContext();
  const categories = useMemo(() => [...new Set(menu.map(item => item.category))], [menu]);
  const [category, setCategory] = useState(categories[0] ?? '');
  const items = menu.filter(item => item.category === category);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(item => (
          <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold ${category === item ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.name}</p>
              <p className="line-clamp-2 text-[11px] text-muted-foreground">{item.description}</p>
            </div>
            <span className="text-xs font-semibold text-primary">R$ {item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileTeam: React.FC = () => (
  <div className="space-y-2">
    {TEAM_MEMBERS.map(member => (
      <div key={member.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
        <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{member.name}</p>
          <p className="text-[11px] text-muted-foreground">{member.role} · {member.shift}</p>
        </div>
        <span className={`text-[10px] font-semibold ${member.status === 'online' ? 'text-success' : 'text-muted-foreground'}`}>{member.status === 'online' ? 'Ativo' : 'Folga'}</span>
      </div>
    ))}
  </div>
);

const MobileAnalytics: React.FC = () => {
  const { analytics } = useDemoContext();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <CompactStat label="Receita" value="R$ 77.5k" tone="success" />
        <CompactStat label="Pedidos" value="312" tone="primary" />
        <CompactStat label="Satisfação" value={String(analytics.customerSatisfaction)} tone="warning" />
        <CompactStat label="Recorrência" value={`${analytics.returningCustomers}%`} tone="info" />
      </div>
      <MobileSection title="Top vendidos">
        <div className="space-y-2">
          {analytics.topItems.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">#{index + 1}</div>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.quantity} vendidos</p>
                </div>
              </div>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          ))}
        </div>
      </MobileSection>
    </div>
  );
};

const MobileManager: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { analytics, orders } = useDemoContext();
  const lateOrders = orders.filter(order => !['delivered', 'paid'].includes(order.status) && getElapsedMinutes(order.createdAt) > 15);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <CompactStat label="Pedidos ativos" value={String(orders.filter(o => !['delivered', 'paid'].includes(o.status)).length)} tone="primary" />
        <CompactStat label="Aprovações" value={String(PENDING_APPROVALS.length)} tone="warning" />
        <CompactStat label="Equipe ativa" value={String(TEAM_MEMBERS.filter(t => t.status === 'online').length)} tone="info" />
        <CompactStat label="Receita" value={`R$ ${analytics.todayRevenue.toLocaleString()}`} tone="success" />
      </div>
      {lateOrders.length ? (
        <button onClick={() => onNavigate('orders')} className="flex w-full items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-3 text-left text-xs font-semibold text-destructive">
          <AlertCircle className="h-4 w-4" />
          {lateOrders.length} pedidos com atraso
        </button>
      ) : null}
      <button onClick={() => onNavigate('approvals')} className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-3 py-3 text-left">
        <div>
          <p className="text-xs font-semibold">Central de aprovações</p>
          <p className="text-[11px] text-muted-foreground">Cancelamentos, cortesias e estornos</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </button>
      <MobileTeam />
    </div>
  );
};

const MobileApprovals: React.FC = () => {
  const [handled, setHandled] = useState<string[]>([]);
  return (
    <div className="space-y-2">
      {PENDING_APPROVALS.map(item => {
        const done = handled.includes(item.id);
        return (
          <div key={item.id} className={`rounded-2xl border p-3 ${done ? 'border-success/20 bg-success/5' : 'border-border bg-card'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{item.item}</p>
                <p className="text-[11px] text-muted-foreground">Mesa {item.table} · {item.requestedBy}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{item.reason}</p>
              </div>
              <span className="text-xs font-semibold text-destructive">R$ {item.amount}</span>
            </div>
            {!done ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => setHandled(prev => [...prev, item.id])} className="rounded-2xl bg-success px-3 py-2.5 text-xs font-semibold text-success-foreground">Aprovar</button>
                <button onClick={() => setHandled(prev => [...prev, item.id])} className="rounded-2xl bg-destructive/10 px-3 py-2.5 text-xs font-semibold text-destructive">Recusar</button>
              </div>
            ) : <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-success"><CheckCircle2 className="h-4 w-4" /> Processado</div>}
          </div>
        );
      })}
    </div>
  );
};

const MobileBarman: React.FC = () => <MobileKDS view="bar" />;
const MobileCook: React.FC = () => <MobileKDS view="kitchen" />;

const MobileRecipes: React.FC = () => (
  <div className="space-y-2">
    {DRINK_RECIPES.map(recipe => (
      <div key={recipe.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
        <img src={recipe.image} alt={recipe.name} className="h-14 w-14 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{recipe.name}</p>
          <p className="text-[11px] text-muted-foreground">{recipe.glass} · {recipe.prepTime}min</p>
        </div>
        <span className="text-xs font-semibold text-primary">R$ {recipe.price}</span>
      </div>
    ))}
  </div>
);

const MobileStock: React.FC = () => (
  <div className="space-y-2">
    {STOCK_ITEMS.map(item => (
      <div key={item.id} className="rounded-2xl border border-border bg-card p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="text-[11px] text-muted-foreground">{item.category}</p>
          </div>
          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.status === 'critical' ? 'bg-destructive/10 text-destructive' : item.status === 'low' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>{item.current} {item.unit}</span>
        </div>
      </div>
    ))}
  </div>
);

const MobileCalls: React.FC = () => {
  const { notifications } = useDemoContext();
  const waiterCalls = notifications.filter(item => item.type === 'waiter_call');
  return (
    <div className="space-y-2">
      {waiterCalls.map(item => (
        <div key={item.id} className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10"><Bell className="h-4 w-4 text-destructive" /></div>
            <div>
              <p className="text-sm font-semibold">{item.message}</p>
              <p className="text-[11px] text-muted-foreground">{formatTimeAgo(item.timestamp)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const MobileTips: React.FC = () => (
  <div className="space-y-4">
    <CompactStat label="Gorjetas do dia" value="R$ 410" tone="success" />
    <div className="space-y-2">
      {[45, 62, 120, 85, 98].map((amount, index) => (
        <div key={index} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3">
          <div>
            <p className="text-sm font-semibold">Mesa {index + 1}</p>
            <p className="text-[11px] text-muted-foreground">Recebido hoje</p>
          </div>
          <span className="text-xs font-semibold text-success">R$ {amount}</span>
        </div>
      ))}
    </div>
  </div>
);

const MobileFloorFlow: React.FC = () => {
  const { reservations, tables } = useDemoContext();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <CompactStat label="Fila estimada" value="25min" tone="warning" />
        <CompactStat label="Mesas livres" value={String(tables.filter(t => t.status === 'available').length)} tone="success" />
      </div>
      <MobileSection title="Fluxo atual">
        <div className="space-y-2">
          {reservations.slice(0, 4).map(item => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-3">
              <p className="text-sm font-semibold">{item.customerName}</p>
              <p className="text-[11px] text-muted-foreground">{item.time} · {item.partySize} pessoas · {item.status}</p>
            </div>
          ))}
        </div>
      </MobileSection>
    </div>
  );
};

const MobileDailyReport: React.FC = () => {
  const { analytics } = useDemoContext();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <CompactStat label="Receita dia" value={`R$ ${analytics.todayRevenue.toLocaleString()}`} tone="success" />
        <CompactStat label="Pedidos" value={String(analytics.todayOrders)} tone="primary" />
      </div>
      <div className="rounded-3xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">Fechamento operacional</p>
        <div className="mt-3 space-y-2">
          {['Caixa conciliado', 'Equipe encerrada', 'Estoque revisado', 'Pendências zeradas'].map(item => (
            <div key={item} className="flex items-center gap-2 text-[11px] text-foreground">
              <Check className="h-4 w-4 text-success" /> {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MobileWelcome: React.FC<{ onSelectRole?: (role: StaffRole) => void }> = ({ onSelectRole }) => (
  <div className="space-y-4">
    <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-4">
      <p className="text-xs font-semibold text-primary">DEMO INTERATIVA</p>
      <h2 className="mt-2 font-display text-xl font-bold text-foreground">Bistrô Noowe</h2>
      <p className="mt-1 text-[11px] text-muted-foreground">Escolha o papel e veja a operação sob a ótica de cada equipe.</p>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {ROLE_CONFIG.map(role => (
        <button key={role.id} onClick={() => onSelectRole?.(role.id)} className={`rounded-2xl border border-border bg-gradient-to-br ${role.gradient} p-3 text-left`}>
          <span className="text-lg">{role.emoji}</span>
          <p className="mt-2 text-xs font-semibold">{role.label}</p>
          <p className="text-[10px] text-muted-foreground">{role.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

const MobileSetup: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      {['Perfil', 'Serviço', 'Recursos', 'Pagamentos'].map((item, index) => (
        <div key={item} className="rounded-2xl border border-border bg-card p-3">
          <p className="text-[10px] text-muted-foreground">Etapa {index + 1}</p>
          <p className="text-xs font-semibold">{item}</p>
        </div>
      ))}
    </div>
    <div className="rounded-3xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">Configuração resumida</p>
      <p className="mt-2 text-[11px] text-muted-foreground">Fine Dining, reservas online, QR nas mesas, split de pagamento e operação full-service.</p>
      <button onClick={() => onNavigate('dashboard')} className="mt-4 w-full rounded-2xl bg-primary px-3 py-3 text-xs font-semibold text-primary-foreground">Ir para dashboard</button>
    </div>
  </div>
);

export const MobileRestaurantScreen: React.FC<{
  screen: RestaurantScreen;
  activeRole: StaffRole;
  onNavigate: (screen: string) => void;
  onSelectRole: (role: StaffRole) => void;
}> = ({ screen, activeRole, onNavigate, onSelectRole }) => {
  const { t, translateText } = useDemoI18n();
  const title = translateText(SCREEN_INFO[screen]?.title || '');

  return (
    <div className="space-y-4 pb-4">
      <div className="rounded-2xl border border-border bg-card px-3 py-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{translateText('Modo mobile')}</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
      </div>

      {screen === 'welcome' && <MobileWelcome onSelectRole={onSelectRole} />}
      {screen === 'setup' && <MobileSetup onNavigate={onNavigate} />}
      {screen === 'dashboard' && <MobileDashboard onNavigate={onNavigate} />}
      {screen === 'table-map' && <MobileTableMap />}
      {screen === 'orders' && <MobileOrders />}
      {screen === 'kds-kitchen' && <MobileKDS view="kitchen" />}
      {screen === 'kds-bar' && <MobileKDS view="bar" />}
      {screen === 'maitre' && <MobileMaitre />}
      {screen === 'waiter' && <MobileWaiter />}
      {screen === 'menu-editor' && <MobileMenu />}
      {screen === 'team' && <MobileTeam />}
      {screen === 'analytics' && <MobileAnalytics />}
      {screen === 'manager-ops' && <MobileManager onNavigate={onNavigate} />}
      {screen === 'approvals' && <MobileApprovals />}
      {screen === 'barman-station' && <MobileBarman />}
      {screen === 'drink-recipes' && <MobileRecipes />}
      {screen === 'cook-station' && <MobileCook />}
      {screen === 'stock' && <MobileStock />}
      {screen === 'waiter-calls' && <MobileCalls />}
      {screen === 'waiter-tips' && <MobileTips />}
      {screen === 'floor-flow' && <MobileFloorFlow />}
      {screen === 'daily-report' && <MobileDailyReport />}

      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{translateText('Perfil ativo')}</p>
        <p className="mt-1 text-xs font-semibold text-foreground">{t('roles', activeRole)}</p>
      </div>
    </div>
  );
};
