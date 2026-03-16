/**
 * Restaurant Demo — Table Map + Orders + KDS Screens
 */
import React, { useState, useEffect } from 'react';
import {
  Clock, Users, ChefHat, Wine, AlertCircle, Check, Play,
  UtensilsCrossed, Eye, ArrowRight, Timer, Flame, Zap,
  Search, Filter, MoreHorizontal, Bell,
} from 'lucide-react';
import { useDemoContext, type OrderStatus, type TableStatus } from '@/contexts/DemoContext';
import { GuidedHint } from '@/components/demo/DemoShared';
import { TABLE_POSITIONS, formatTimeAgo, getElapsedMinutes } from './RestaurantDemoShared';

// ============ TABLE MAP ============

export const TableMapScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { tables, updateTableStatus } = useDemoContext();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const statusColors: Record<TableStatus, { bg: string; border: string; text: string; label: string }> = {
    available: { bg: 'bg-success/20', border: 'border-success/50', text: 'text-success', label: 'Disponível' },
    occupied: { bg: 'bg-primary/20', border: 'border-primary/50', text: 'text-primary', label: 'Ocupada' },
    reserved: { bg: 'bg-warning/20', border: 'border-warning/50', text: 'text-warning', label: 'Reservada' },
    billing: { bg: 'bg-info/20', border: 'border-info/50', text: 'text-info', label: 'Pagamento' },
  };

  const selected = tables.find(t => t.id === selectedTable);

  return (
    <div className="space-y-6">
      <GuidedHint text="Planta interativa do salão — clique nas mesas para ver detalhes e alterar status" />

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(statusColors).map(([status, config]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${config.bg} border ${config.border}`} />
            <span className="text-xs text-muted-foreground">{config.label}</span>
          </div>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">
          {tables.filter(t => t.status === 'available').length} livres · {tables.filter(t => t.status === 'occupied').length} ocupadas
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Floor Plan */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 relative" style={{ minHeight: 480 }}>
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 text-[10px] text-muted-foreground/40 uppercase tracking-widest">Salão Principal</div>
          <div className="absolute top-4 right-4 text-[10px] text-muted-foreground/40">Terraço →</div>
          <div className="absolute bottom-4 left-4 text-[10px] text-muted-foreground/40">← Entrada</div>
          <div className="absolute bottom-4 right-1/2 translate-x-1/2 text-[10px] text-muted-foreground/40">Bar ↑</div>

          {/* Grid lines */}
          <div className="absolute inset-8 border border-dashed border-border/30 rounded-xl" />

          {/* Tables */}
          {tables.map((table) => {
            const pos = TABLE_POSITIONS.find(p => p.id === table.id);
            if (!pos) return null;
            const colors = statusColors[table.status];
            const isSelected = selectedTable === table.id;

            return (
              <button
                key={table.id}
                onClick={() => setSelectedTable(isSelected ? null : table.id)}
                className={`absolute transition-all duration-200 hover:scale-110 ${isSelected ? 'scale-110 z-10' : ''}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.1)' : ''}` }}
              >
                <div className={`
                  ${pos.shape === 'round' ? 'w-16 h-16 rounded-full' : pos.shape === 'rect' ? 'w-20 h-16 rounded-2xl' : 'w-24 h-14 rounded-2xl'}
                  ${colors.bg} border-2 ${isSelected ? 'border-foreground shadow-lg' : colors.border}
                  flex flex-col items-center justify-center gap-0.5 relative
                `}>
                  <span className={`font-display text-lg font-bold ${colors.text}`}>{table.number}</span>
                  <span className="text-[8px] text-muted-foreground">{table.seats}p</span>
                  {table.customerName && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[9px] font-semibold bg-card px-1.5 py-0.5 rounded border border-border shadow-sm">{table.customerName}</span>
                    </div>
                  )}
                  {/* Timer dot for occupied tables */}
                  {table.status === 'occupied' && table.occupiedSince && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="bg-card rounded-xl border border-border p-5">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-bold">Mesa {selected.number}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selected.status].bg} ${statusColors[selected.status].text}`}>
                  {statusColors[selected.status].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-sm font-bold">{selected.seats}</p>
                  <p className="text-[10px] text-muted-foreground">Lugares</p>
                </div>
                {selected.occupiedSince && (
                  <div className="p-3 rounded-xl bg-muted/30 text-center">
                    <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <p className="text-sm font-bold">{getElapsedMinutes(selected.occupiedSince)}min</p>
                    <p className="text-[10px] text-muted-foreground">Tempo</p>
                  </div>
                )}
              </div>

              {selected.customerName && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-semibold">{selected.customerName}</p>
                  {selected.orderTotal && <p className="text-sm font-display font-bold text-primary mt-1">R$ {selected.orderTotal}</p>}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações Rápidas</p>
                {selected.status === 'available' && (
                  <button onClick={() => updateTableStatus(selected.id, 'occupied')} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                    Sentar Cliente
                  </button>
                )}
                {selected.status === 'occupied' && (
                  <button onClick={() => updateTableStatus(selected.id, 'billing')} className="w-full py-2.5 rounded-xl bg-info text-info-foreground text-sm font-semibold">
                    Fechar Conta
                  </button>
                )}
                {selected.status === 'billing' && (
                  <button onClick={() => updateTableStatus(selected.id, 'available')} className="w-full py-2.5 rounded-xl bg-success text-success-foreground text-sm font-semibold">
                    Liberar Mesa
                  </button>
                )}
                {selected.status === 'reserved' && (
                  <button onClick={() => updateTableStatus(selected.id, 'occupied')} className="w-full py-2.5 rounded-xl bg-warning text-warning-foreground text-sm font-semibold">
                    Check-in Reserva
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Clique em uma mesa para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ ORDERS ============

const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const styles: Record<OrderStatus, string> = {
    pending: 'bg-muted text-muted-foreground', confirmed: 'bg-info/10 text-info',
    preparing: 'bg-warning/10 text-warning', ready: 'bg-success/10 text-success',
    delivered: 'bg-primary/10 text-primary', paid: 'bg-muted text-muted-foreground',
  };
  const labels: Record<OrderStatus, string> = {
    pending: 'Pendente', confirmed: 'Confirmado', preparing: 'Preparando',
    ready: 'Pronto', delivered: 'Entregue', paid: 'Pago',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${styles[status]}`}>{labels[status]}</span>;
};

export const OrdersScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { orders, updateOrderStatus } = useDemoContext();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      <GuidedHint text="Gerencie todos os pedidos — confirme, acompanhe o preparo e controle as entregas" />

      {/* Summary Bar */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {[
          { key: 'all' as const, label: 'Todos', count: orders.length },
          { key: 'pending' as const, label: 'Pendentes', count: orders.filter(o => o.status === 'pending').length },
          { key: 'confirmed' as const, label: 'Confirmados', count: orders.filter(o => o.status === 'confirmed').length },
          { key: 'preparing' as const, label: 'Preparando', count: orders.filter(o => o.status === 'preparing').length },
          { key: 'ready' as const, label: 'Prontos', count: orders.filter(o => o.status === 'ready').length },
          { key: 'delivered' as const, label: 'Entregues', count: orders.filter(o => o.status === 'delivered').length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.key ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground'
            }`}
          >
            {f.label}
            {f.count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${filter === f.key ? 'bg-primary-foreground/20' : 'bg-foreground/10'}`}>{f.count}</span>}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/20 transition-colors">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-display text-lg font-bold text-primary">
                    {order.tableNumber}
                  </div>
                  <div>
                    <p className="font-semibold">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(order.createdAt)} · {order.items.length} itens
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"
                  >
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {order.items.slice(0, 3).map((item, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg bg-muted/30">{item.quantity}x {item.menuItem.name}</span>
                ))}
                {order.items.length > 3 && <span className="text-muted-foreground">+{order.items.length - 3}</span>}
              </div>

              {/* Expanded details */}
              {expandedOrder === order.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={item.menuItem.image} alt={item.menuItem.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{item.quantity}x {item.menuItem.name}</p>
                        {item.notes && <p className="text-[10px] text-muted-foreground italic">📝 {item.notes}</p>}
                      </div>
                      <span className="text-sm font-display font-bold">R$ {item.menuItem.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="font-display text-lg font-bold">R$ {order.total}</span>
                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-glow">
                      ✓ Confirmar
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="px-4 py-2 rounded-xl bg-warning text-warning-foreground text-xs font-semibold">
                      🔥 Preparar
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateOrderStatus(order.id, 'ready')} className="px-4 py-2 rounded-xl bg-success text-success-foreground text-xs font-semibold">
                      ✓ Pronto
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="px-4 py-2 rounded-xl bg-info text-info-foreground text-xs font-semibold">
                      🍽️ Entregar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ KDS ============

export const KDSScreen: React.FC<{ view: 'kitchen' | 'bar'; onNavigate: (screen: string) => void }> = ({ view, onNavigate }) => {
  const { orders, updateOrderStatus } = useDemoContext();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const kdsOrders = orders.filter(o =>
    ['confirmed', 'preparing'].includes(o.status) &&
    (view === 'kitchen' ? o.isKitchen : o.isBar)
  );

  const newOrders = kdsOrders.filter(o => o.status === 'confirmed');
  const preparingOrders = kdsOrders.filter(o => o.status === 'preparing');

  const isKitchen = view === 'kitchen';
  const Icon = isKitchen ? ChefHat : Wine;
  const title = isKitchen ? 'Cozinha' : 'Bar';
  const accentColor = isKitchen ? 'warning' : 'secondary';

  return (
    <div className="space-y-6">
      <GuidedHint text={`KDS ${title} — Display profissional com tickets, timers e controle de produção`} />

      {/* KDS Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-warning">{newOrders.length}</p>
          <p className="text-xs text-muted-foreground">Na fila</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-primary">{preparingOrders.length}</p>
          <p className="text-xs text-muted-foreground">Preparando</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-success">
            {orders.filter(o => o.status === 'ready').length}
          </p>
          <p className="text-xs text-muted-foreground">Prontos</p>
        </div>
      </div>

      {kdsOrders.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <Icon className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">Nenhum pedido na fila</p>
          <p className="text-sm text-muted-foreground/60">Os tickets aparecerão aqui automaticamente</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kdsOrders.map(order => {
            const elapsed = Math.round((now - order.createdAt.getTime()) / 60000);
            const isLate = elapsed > 15;
            const isUrgent = elapsed > 10;

            return (
              <div
                key={order.id}
                className={`rounded-2xl border-2 overflow-hidden transition-all ${
                  isLate ? 'border-destructive bg-destructive/5 animate-pulse' :
                  isUrgent ? 'border-warning bg-warning/5' :
                  order.status === 'preparing' ? 'border-primary/30 bg-primary/5' :
                  'border-border bg-card'
                }`}
              >
                {/* Ticket Header */}
                <div className={`px-4 py-3 flex items-center justify-between ${
                  isLate ? 'bg-destructive/10' : order.status === 'preparing' ? 'bg-primary/10' : 'bg-muted/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-bold">Mesa {order.tableNumber}</span>
                    {isLate && <AlertCircle className="w-5 h-5 text-destructive animate-bounce" />}
                    {isUrgent && !isLate && <Flame className="w-4 h-4 text-warning" />}
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isLate ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Timer className="w-3 h-3" />
                    {elapsed}min
                  </div>
                </div>

                {/* Ticket Items */}
                <div className="p-4 space-y-3">
                  {order.items
                    .filter(item => view === 'kitchen' ? item.menuItem.category !== 'Bebidas' : item.menuItem.category === 'Bebidas')
                    .map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-display font-bold">
                          {item.quantity}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{item.menuItem.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.menuItem.prepTime}min preparo</p>
                        </div>
                      </div>
                    ))
                  }
                </div>

                {/* Ticket Action */}
                <div className="px-4 pb-4">
                  <button
                    onClick={() => updateOrderStatus(order.id, order.status === 'confirmed' ? 'preparing' : 'ready')}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                      order.status === 'confirmed'
                        ? `bg-${accentColor} text-${accentColor}-foreground`
                        : 'bg-success text-success-foreground'
                    }`}
                  >
                    {order.status === 'confirmed' ? '▶ Iniciar Preparo' : '✓ Marcar como Pronto'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
