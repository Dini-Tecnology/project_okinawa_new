/**
 * Restaurant Demo — Dashboard + Analytics Screens
 */
import React, { useState } from 'react';
import {
  DollarSign, UtensilsCrossed, TrendingUp, Users, Clock, Star,
  ArrowUp, ArrowDown, Bell, AlertCircle, CheckCircle2, Zap,
  CalendarDays, Target, Award, ShoppingBag,
} from 'lucide-react';
import { useDemoContext, type OrderStatus } from '@/contexts/DemoContext';
import { GuidedHint } from '@/components/demo/DemoShared';
import { formatTimeAgo } from './RestaurantDemoShared';

// ============ STATUS BADGE ============

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const styles: Record<OrderStatus, string> = {
    pending: 'bg-muted text-muted-foreground', confirmed: 'bg-info/10 text-info',
    preparing: 'bg-warning/10 text-warning', ready: 'bg-success/10 text-success',
    delivered: 'bg-primary/10 text-primary', paid: 'bg-muted text-muted-foreground',
  };
  const labels: Record<OrderStatus, string> = {
    pending: 'Pendente', confirmed: 'Confirmado', preparing: 'Preparando',
    ready: 'Pronto', delivered: 'Entregue', paid: 'Pago',
  };
  return <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${styles[status]}`}>{labels[status]}</span>;
};

// ============ DASHBOARD ============

export const DashboardScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { analytics, orders, tables, notifications, unreadNotifications } = useDemoContext();
  const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'billing').length;
  const activeOrders = orders.filter(o => !['paid', 'delivered'].includes(o.status)).length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      <GuidedHint text="Dashboard em tempo real com KPIs, pedidos ativos e alertas operacionais" />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita Hoje', value: `R$ ${analytics.todayRevenue.toLocaleString()}`, icon: DollarSign, change: '+12.4%', up: true, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pedidos', value: analytics.todayOrders.toString(), icon: UtensilsCrossed, change: `${activeOrders} ativos`, up: true, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Ticket Médio', value: `R$ ${analytics.avgTicket}`, icon: TrendingUp, change: '+5.2%', up: true, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Ocupação', value: `${analytics.occupancyRate}%`, icon: Users, change: `${occupiedTables}/12 mesas`, up: false, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${kpi.up ? 'text-success' : 'text-muted-foreground'}`}>
                {kpi.up ? <ArrowUp className="w-3 h-3" /> : null}
                {kpi.change}
              </span>
            </div>
            <p className="font-display text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Action Alerts */}
      {(readyOrders > 0 || pendingOrders > 0) && (
        <div className="flex gap-3 flex-wrap">
          {readyOrders > 0 && (
            <button onClick={() => onNavigate('orders')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 border border-success/20 text-sm font-semibold text-success hover:bg-success/20 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
              {readyOrders} pedido(s) pronto(s) para entregar
            </button>
          )}
          {pendingOrders > 0 && (
            <button onClick={() => onNavigate('orders')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warning/10 border border-warning/20 text-sm font-semibold text-warning hover:bg-warning/20 transition-colors">
              <AlertCircle className="w-4 h-4" />
              {pendingOrders} pedido(s) aguardando confirmação
            </button>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Receita por Hora</h3>
            <span className="text-xs text-muted-foreground">Hoje</span>
          </div>
          <div className="flex items-end gap-2 h-44">
            {analytics.hourlyRevenue.map((h, i) => {
              const max = Math.max(...analytics.hourlyRevenue.map(x => x.revenue));
              const height = max > 0 ? (h.revenue / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    R${(h.revenue / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 hover:from-primary hover:to-primary/80 transition-colors cursor-pointer"
                    style={{ height: `${height}%`, minHeight: 4 }}
                  />
                  <span className="text-[10px] text-muted-foreground">{h.hour}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Occupancy Gauge */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold mb-4">Ocupação do Salão</h3>
          <div className="relative w-40 h-40 mx-auto mb-4">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="10"
                strokeDasharray={`${(analytics.occupancyRate / 100) * 327} 327`}
                strokeLinecap="round" className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold">{analytics.occupancyRate}%</span>
              <span className="text-[10px] text-muted-foreground">ocupado</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-success/10">
              <p className="font-bold text-success">{tables.filter(t => t.status === 'available').length}</p>
              <p className="text-muted-foreground">Livres</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <p className="font-bold text-primary">{occupiedTables}</p>
              <p className="text-muted-foreground">Ocupadas</p>
            </div>
            <div className="p-2 rounded-lg bg-warning/10">
              <p className="font-bold text-warning">{tables.filter(t => t.status === 'reserved').length}</p>
              <p className="text-muted-foreground">Reservadas</p>
            </div>
            <div className="p-2 rounded-lg bg-info/10">
              <p className="font-bold text-info">{tables.filter(t => t.status === 'billing').length}</p>
              <p className="text-muted-foreground">Pagamento</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Orders */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Pedidos Ativos</h3>
            <button onClick={() => onNavigate('orders')} className="text-xs text-primary font-semibold hover:underline">Ver todos →</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {orders.filter(o => !['paid', 'delivered'].includes(o.status)).slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary text-sm">
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
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${n.read ? 'bg-muted/20' : 'bg-primary/5 border border-primary/10'}`}>
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

      {/* Top Items */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Top Vendidos Hoje</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {analytics.topItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <span className={`font-display text-2xl font-bold ${i === 0 ? 'text-primary' : i === 1 ? 'text-secondary' : 'text-muted-foreground/30'}`}>#{i + 1}</span>
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

// ============ ANALYTICS ============

export const AnalyticsScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { analytics } = useDemoContext();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  return (
    <div className="space-y-6">
      <GuidedHint text="Relatórios completos de receita, desempenho e insights operacionais" />

      {/* Period Selector */}
      <div className="flex gap-2">
        {[
          { id: 'today' as const, label: 'Hoje' },
          { id: 'week' as const, label: 'Semana' },
          { id: 'month' as const, label: 'Mês' },
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === p.id ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita Total', value: period === 'today' ? 'R$ 12.840' : period === 'week' ? 'R$ 77.500' : 'R$ 312.000', change: '+12%', icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Total Pedidos', value: period === 'today' ? '47' : period === 'week' ? '312' : '1.248', change: '+8%', icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Ticket Médio', value: period === 'today' ? 'R$ 273' : period === 'week' ? 'R$ 248' : 'R$ 250', change: '+5%', icon: Target, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Satisfação', value: `${analytics.customerSatisfaction}`, change: '342 avaliações', icon: Star, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((card, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="text-xs font-semibold text-success flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" />{card.change}
              </span>
            </div>
            <p className="font-display text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Revenue Chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Receita Semanal</h3>
        <div className="flex items-end gap-3 h-48">
          {analytics.weeklyRevenue.map((d, i) => {
            const max = Math.max(...analytics.weeklyRevenue.map(x => x.revenue));
            const height = max > 0 ? (d.revenue / max) * 100 : 0;
            const isToday = i === new Date().getDay() - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.revenue > 0 ? `R$${(d.revenue / 1000).toFixed(0)}k` : '-'}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-colors cursor-pointer ${
                    isToday ? 'bg-gradient-to-t from-primary to-primary/60' : 'bg-gradient-to-t from-secondary to-secondary/40'
                  }`}
                  style={{ height: `${height}%`, minHeight: d.revenue > 0 ? 4 : 2 }}
                />
                <span className={`text-[10px] ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Satisfaction */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold mb-4">Satisfação dos Clientes</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-display text-5xl font-bold text-primary">{analytics.customerSatisfaction}</p>
              <div className="flex gap-0.5 mt-1 justify-center">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(analytics.customerSatisfaction) ? 'text-warning fill-warning' : 'text-muted-foreground/20'}`} />
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map(stars => {
                const pct = stars === 5 ? 72 : stars === 4 ? 18 : stars === 3 ? 7 : stars === 2 ? 2 : 1;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-3">{stars}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-6 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Returning Customers */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold mb-4">Clientes Recorrentes</h3>
          <div className="text-center py-4">
            <p className="font-display text-5xl font-bold text-secondary">{analytics.returningCustomers}%</p>
            <p className="text-sm text-muted-foreground mt-2">já visitaram antes</p>
            <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-secondary to-secondary/60 rounded-full transition-all" style={{ width: `${analytics.returningCustomers}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Peak Hours Heatmap */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Horários de Pico</h3>
        <div className="grid grid-cols-7 gap-1">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="text-center text-[10px] text-muted-foreground font-semibold pb-1">{day}</div>
          ))}
          {Array.from({ length: 7 * 6 }, (_, i) => {
            const intensity = Math.random();
            const hour = 12 + Math.floor((i % 6) * 2);
            return (
              <div
                key={i}
                className={`h-8 rounded-lg transition-colors cursor-pointer ${
                  intensity > 0.8 ? 'bg-primary/80' : intensity > 0.6 ? 'bg-primary/50' : intensity > 0.4 ? 'bg-primary/25' : intensity > 0.2 ? 'bg-primary/10' : 'bg-muted/30'
                }`}
                title={`${hour}h`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-[10px] text-muted-foreground">Baixo</span>
          {[10, 25, 50, 80].map(p => (
            <div key={p} className={`w-4 h-4 rounded bg-primary/${p}`} />
          ))}
          <span className="text-[10px] text-muted-foreground">Alto</span>
        </div>
      </div>

      {/* Staff Performance */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Desempenho da Equipe</h3>
        <div className="space-y-3">
          {[
            { name: 'Bruno Oliveira', role: 'Garçom', orders: 23, revenue: 'R$ 3.200', tips: 'R$ 410', rating: 4.9 },
            { name: 'Carla Lima', role: 'Garçom', orders: 18, revenue: 'R$ 2.100', tips: 'R$ 280', rating: 4.7 },
            { name: 'Ana Rodrigues', role: 'Sommelier', orders: 12, revenue: 'R$ 1.800', tips: 'R$ 240', rating: 4.9 },
          ].map((staff, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
              <span className={`font-display text-xl font-bold ${i === 0 ? 'text-primary' : 'text-muted-foreground/30'}`}>#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{staff.name}</p>
                <p className="text-[10px] text-muted-foreground">{staff.role} · {staff.orders} pedidos</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{staff.revenue}</p>
                <p className="text-[10px] text-success">{staff.tips} gorjetas</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-warning fill-warning" />
                <span className="text-xs font-bold">{staff.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
