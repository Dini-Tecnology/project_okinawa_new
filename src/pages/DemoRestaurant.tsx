/**
 * Demo Restaurant Page
 * Interactive dashboard showing restaurant operations in real-time
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext, type OrderStatus, type TableStatus } from '@/contexts/DemoContext';
import {
  ArrowLeft, Bell, BarChart3, UtensilsCrossed, LayoutGrid, CalendarDays,
  ChefHat, TrendingUp, Users, DollarSign, Clock, Check, Play, Pause,
  ArrowRight, AlertCircle, Eye, Star, Wine,
} from 'lucide-react';

// ============ DASHBOARD TABS ============

type DashboardTab = 'overview' | 'tables' | 'orders' | 'kds' | 'reservations' | 'analytics';

const TAB_CONFIG: { id: DashboardTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'tables', label: 'Mesas', icon: LayoutGrid },
  { id: 'orders', label: 'Pedidos', icon: UtensilsCrossed },
  { id: 'kds', label: 'KDS', icon: ChefHat },
  { id: 'reservations', label: 'Reservas', icon: CalendarDays },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
];

// ============ OVERVIEW TAB ============

const OverviewTab = () => {
  const { analytics, orders, tables, notifications, unreadNotifications } = useDemoContext();
  const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'billing').length;
  const activeOrders = orders.filter(o => !['paid', 'delivered'].includes(o.status)).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita Hoje', value: `R$ ${analytics.todayRevenue.toLocaleString()}`, icon: DollarSign, change: '+12%', color: 'text-success' },
          { label: 'Pedidos Hoje', value: analytics.todayOrders.toString(), icon: UtensilsCrossed, change: '+8', color: 'text-primary' },
          { label: 'Ticket Médio', value: `R$ ${analytics.avgTicket}`, icon: TrendingUp, change: '+5%', color: 'text-info' },
          { label: 'Ocupação', value: `${analytics.occupancyRate}%`, icon: Users, change: `${occupiedTables}/12`, color: 'text-warning' },
        ].map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <span className={`text-xs font-semibold ${kpi.color}`}>{kpi.change}</span>
            </div>
            <p className="font-display text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Orders */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Pedidos Ativos</h3>
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{activeOrders}</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {orders.filter(o => !['paid', 'delivered'].includes(o.status)).slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {order.tableNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.items.length} itens · R$ {order.total}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Notificações</h3>
            {unreadNotifications > 0 && (
              <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">{unreadNotifications} novas</span>
            )}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.slice(0, 6).map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${n.read ? 'bg-muted/20' : 'bg-primary/5 border border-primary/10'}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                <div>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(n.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top items */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Itens Mais Vendidos Hoje</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {analytics.topItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <span className="font-display text-xl font-bold text-muted-foreground/30">#{i + 1}</span>
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.quantity} vendidos</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ TABLES TAB ============

const TablesTab = () => {
  const { tables, updateTableStatus } = useDemoContext();

  const statusColors: Record<TableStatus, string> = {
    available: 'bg-success/10 border-success/30 text-success',
    occupied: 'bg-primary/10 border-primary/30 text-primary',
    reserved: 'bg-warning/10 border-warning/30 text-warning',
    billing: 'bg-info/10 border-info/30 text-info',
  };

  const statusLabels: Record<TableStatus, string> = {
    available: 'Disponível',
    occupied: 'Ocupada',
    reserved: 'Reservada',
    billing: 'Pagamento',
  };

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColors[status as TableStatus].split(' ')[0]}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => {
              const nextStatus: Record<TableStatus, TableStatus> = {
                available: 'occupied', occupied: 'billing', billing: 'available', reserved: 'occupied',
              };
              updateTableStatus(table.id, nextStatus[table.status]);
            }}
            className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${statusColors[table.status]}`}
          >
            <div className="text-center">
              <p className="font-display text-2xl font-bold">{table.number}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1">{statusLabels[table.status]}</p>
              <p className="text-xs mt-1 opacity-60">{table.seats} lugares</p>
            </div>
            {table.customerName && (
              <p className="text-xs font-semibold mt-2 text-center truncate">{table.customerName}</p>
            )}
            {table.orderTotal && table.orderTotal > 0 && (
              <p className="text-xs font-display font-bold text-center mt-0.5">R$ {table.orderTotal}</p>
            )}
            {table.occupiedSince && (
              <p className="text-[10px] text-center mt-1 opacity-50">
                {Math.round((Date.now() - table.occupiedSince.getTime()) / 60000)}min
              </p>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Clique em uma mesa para alterar o status (simulação)
      </p>
    </div>
  );
};

// ============ ORDERS TAB ============

const OrdersTab = () => {
  const { orders, updateOrderStatus } = useDemoContext();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'pending', label: 'Pendentes' },
          { key: 'confirmed', label: 'Confirmados' },
          { key: 'preparing', label: 'Preparando' },
          { key: 'ready', label: 'Prontos' },
          { key: 'delivered', label: 'Entregues' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                  {order.tableNumber}
                </div>
                <div>
                  <p className="font-semibold text-sm">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(order.createdAt)}</p>
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="space-y-1 mb-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.quantity}x {item.menuItem.name}</span>
                  <span>R$ {item.menuItem.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="font-display font-bold">R$ {order.total}</span>
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                    Confirmar
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="px-3 py-1.5 rounded-lg bg-warning text-warning-foreground text-xs font-semibold">
                    Preparar
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateOrderStatus(order.id, 'ready')} className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-semibold">
                    Pronto
                  </button>
                )}
                {order.status === 'ready' && (
                  <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="px-3 py-1.5 rounded-lg bg-info text-info-foreground text-xs font-semibold">
                    Entregar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ KDS TAB ============

const KDSTab = () => {
  const { orders, updateOrderStatus } = useDemoContext();
  const [view, setView] = useState<'kitchen' | 'bar'>('kitchen');

  const kdsOrders = orders.filter(o =>
    ['confirmed', 'preparing'].includes(o.status) &&
    (view === 'kitchen' ? o.isKitchen : o.isBar)
  );

  return (
    <div>
      {/* Toggle kitchen/bar */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('kitchen')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            view === 'kitchen' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          Cozinha
        </button>
        <button
          onClick={() => setView('bar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            view === 'bar' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Wine className="w-4 h-4" />
          Bar
        </button>
      </div>

      {kdsOrders.length === 0 ? (
        <div className="text-center py-16">
          <ChefHat className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum pedido na fila da {view === 'kitchen' ? 'cozinha' : 'bar'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kdsOrders.map(order => {
            const elapsed = Math.round((Date.now() - order.createdAt.getTime()) / 60000);
            const isLate = elapsed > 15;
            return (
              <div key={order.id} className={`rounded-xl border-2 p-4 ${
                isLate ? 'border-destructive bg-destructive/5' : order.status === 'preparing' ? 'border-warning bg-warning/5' : 'border-border bg-card'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-bold">Mesa {order.tableNumber}</span>
                    {isLate && <AlertCircle className="w-4 h-4 text-destructive" />}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className={isLate ? 'text-destructive font-semibold' : ''}>{elapsed}min</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.filter(item => view === 'kitchen' ? item.menuItem.category !== 'Bebidas' : item.menuItem.category === 'Bebidas').map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                      <span className="text-sm font-medium">{item.menuItem.name}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, order.status === 'confirmed' ? 'preparing' : 'ready')}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    order.status === 'confirmed'
                      ? 'bg-warning text-warning-foreground'
                      : 'bg-success text-success-foreground'
                  }`}
                >
                  {order.status === 'confirmed' ? 'Iniciar Preparo' : 'Marcar como Pronto'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============ RESERVATIONS TAB ============

const ReservationsTab = () => {
  const { reservations } = useDemoContext();

  const statusStyles: Record<string, string> = {
    confirmed: 'bg-success/10 text-success',
    seated: 'bg-primary/10 text-primary',
    waiting: 'bg-warning/10 text-warning',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  const statusLabels: Record<string, string> = {
    confirmed: 'Confirmada',
    seated: 'Acomodada',
    waiting: 'Aguardando',
    cancelled: 'Cancelada',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold">Reservas de Hoje</h3>
          <p className="text-sm text-muted-foreground">{reservations.length} reservas agendadas</p>
        </div>
      </div>

      <div className="space-y-3">
        {reservations.map(res => (
          <div key={res.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{res.customerName}</p>
                  <p className="text-xs text-muted-foreground">{res.phone}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[res.status]}`}>
                {statusLabels[res.status]}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{res.time}</div>
              <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{res.partySize} pessoas</div>
            </div>
            {res.notes && (
              <p className="text-xs text-muted-foreground mt-2 italic">📝 {res.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ ANALYTICS TAB ============

const AnalyticsTab = () => {
  const { analytics } = useDemoContext();

  return (
    <div className="space-y-6">
      {/* Revenue chart placeholder */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Receita por Hora (Hoje)</h3>
        <div className="flex items-end gap-2 h-40">
          {analytics.hourlyRevenue.map((h, i) => {
            const maxRevenue = Math.max(...analytics.hourlyRevenue.map(x => x.revenue));
            const height = (h.revenue / maxRevenue) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">R${(h.revenue / 1000).toFixed(1)}k</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-light transition-all"
                  style={{ height: `${height}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-muted-foreground">{h.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly revenue */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Receita Semanal</h3>
        <div className="flex items-end gap-2 h-40">
          {analytics.weeklyRevenue.map((d, i) => {
            const maxRevenue = Math.max(...analytics.weeklyRevenue.map(x => x.revenue));
            const height = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">
                  {d.revenue > 0 ? `R$${(d.revenue / 1000).toFixed(0)}k` : '-'}
                </span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-secondary to-secondary-light transition-all"
                  style={{ height: `${height}%`, minHeight: d.revenue > 0 ? 4 : 2 }}
                />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Satisfaction */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold mb-4">Satisfação dos Clientes</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-primary">{analytics.customerSatisfaction}</p>
              <div className="flex items-center gap-0.5 mt-1 justify-center">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(analytics.customerSatisfaction) ? 'text-accent fill-accent' : 'text-muted-foreground/20'}`} />
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map(stars => {
                const pct = stars === 5 ? 72 : stars === 4 ? 18 : stars === 3 ? 7 : stars === 2 ? 2 : 1;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-3">{stars}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-6 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Returning customers */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold mb-4">Clientes Recorrentes</h3>
          <div className="text-center py-4">
            <p className="font-display text-5xl font-bold text-secondary">{analytics.returningCustomers}%</p>
            <p className="text-sm text-muted-foreground mt-2">dos clientes de hoje já visitaram antes</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-secondary to-secondary-light rounded-full" style={{ width: `${analytics.returningCustomers}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ HELPERS ============

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const styles: Record<OrderStatus, string> = {
    pending: 'bg-muted text-muted-foreground',
    confirmed: 'bg-info/10 text-info',
    preparing: 'bg-warning/10 text-warning',
    ready: 'bg-success/10 text-success',
    delivered: 'bg-primary/10 text-primary',
    paid: 'bg-muted text-muted-foreground',
  };
  const labels: Record<OrderStatus, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Pronto',
    delivered: 'Entregue',
    paid: 'Pago',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${styles[status]}`}>{labels[status]}</span>
  );
};

function formatTimeAgo(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  return `${Math.floor(mins / 60)}h atrás`;
}

// ============ MAIN COMPONENT ============

const DemoRestaurantInner = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const { isSimulationRunning, toggleSimulation, unreadNotifications, restaurant } = useDemoContext();

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'tables': return <TablesTab />;
      case 'orders': return <OrdersTab />;
      case 'kds': return <KDSTab />;
      case 'reservations': return <ReservationsTab />;
      case 'analytics': return <AnalyticsTab />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Demo Restaurante | NOOWE</title>
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        {/* Top bar */}
        <header className="bg-card border-b border-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/demo" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs font-display">N</span>
                </div>
                <div>
                  <p className="font-display font-bold text-sm leading-tight">{restaurant.name}</p>
                  <p className="text-[10px] text-muted-foreground">Painel de Gestão</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Simulation toggle */}
              <button
                onClick={toggleSimulation}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isSimulationRunning ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                }`}
              >
                {isSimulationRunning ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {isSimulationRunning ? 'Simulação ativa' : 'Simulação pausada'}
              </button>

              {/* Notifications */}
              <button className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Demo</span>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {renderTab()}
        </div>

        {/* Bottom CTA */}
        <div className="border-t border-border bg-card mt-12 py-8">
          <div className="max-w-2xl mx-auto text-center px-6">
            <h3 className="font-display text-xl font-bold mb-2">Quer ver isso no seu restaurante?</h3>
            <p className="text-sm text-muted-foreground mb-6">Converse com nossa equipe e descubra como a NOOWE transforma a operação do seu negócio.</p>
            <a
              href="https://wa.me/5511999999999?text=Olá! Vi a demo do painel da NOOWE e gostaria de saber mais."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow"
            >
              Falar pelo WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

const DemoRestaurant = () => (
  <DemoProvider>
    <DemoRestaurantInner />
  </DemoProvider>
);

export default DemoRestaurant;
