/**
 * Restaurant Demo — Role-Specific Screens
 * Manager Operations, Approvals, Barman Station, Drink Recipes,
 * Cook Station, Stock, Waiter Calls/Tips, Floor Flow, Daily Report
 */
import React, { useState, useEffect } from 'react';
import {
  Clock, Users, Check, Plus, Star, Bell, Shield, DollarSign,
  Package, AlertCircle, CheckCircle2, XCircle, ChefHat, Wine,
  Timer, Flame, ArrowUp, ArrowDown, TrendingUp, UtensilsCrossed,
  BarChart3, Eye, Zap, Phone, UserCheck, X, BookOpen,
  Droplets, CookingPot, Beer,
} from 'lucide-react';
import { useDemoContext, type OrderStatus } from '@/contexts/DemoContext';
import { GuidedHint } from '@/components/demo/DemoShared';
import { PENDING_APPROVALS, STOCK_ITEMS, DRINK_RECIPES, TEAM_MEMBERS, formatTimeAgo, getElapsedMinutes } from './RestaurantDemoShared';

// ============ MANAGER OPERATIONS DASHBOARD ============

export const ManagerOpsScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { analytics, orders, tables, notifications, unreadNotifications } = useDemoContext();
  const activeOrders = orders.filter(o => !['paid', 'delivered'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'ready');
  const lateOrders = activeOrders.filter(o => getElapsedMinutes(o.createdAt) > 15);
  const onlineStaff = TEAM_MEMBERS.filter(m => m.status === 'online');

  return (
    <div className="space-y-6">
      <GuidedHint text="Painel operacional do gerente — alertas, aprovações pendentes e status da equipe" />

      {/* Alert Banner */}
      {(lateOrders.length > 0 || PENDING_APPROVALS.length > 0) && (
        <div className="flex gap-3 flex-wrap">
          {lateOrders.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-semibold text-destructive animate-pulse">
              <AlertCircle className="w-4 h-4" />
              {lateOrders.length} pedido(s) com atraso (&gt;15min)
            </div>
          )}
          {PENDING_APPROVALS.length > 0 && (
            <button onClick={() => onNavigate('approvals')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warning/10 border border-warning/20 text-sm font-semibold text-warning hover:bg-warning/20 transition-colors">
              <Shield className="w-4 h-4" />
              {PENDING_APPROVALS.length} aprovação(ões) pendente(s)
            </button>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pedidos Ativos', value: activeOrders.length.toString(), icon: UtensilsCrossed, color: 'text-primary', bg: 'bg-primary/10', sub: `${readyOrders.length} prontos` },
          { label: 'Receita Hoje', value: `R$ ${analytics.todayRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10', sub: '+12% vs ontem' },
          { label: 'Equipe Ativa', value: `${onlineStaff.length}/${TEAM_MEMBERS.length}`, icon: Users, color: 'text-info', bg: 'bg-info/10', sub: `${TEAM_MEMBERS.filter(m => m.status === 'offline').length} em folga` },
          { label: 'Ocupação', value: `${analytics.occupancyRate}%`, icon: BarChart3, color: 'text-warning', bg: 'bg-warning/10', sub: `${tables.filter(t => t.status === 'available').length} mesas livres` },
        ].map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Staff on duty */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold mb-4">Equipe em Serviço</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {onlineStaff.map(member => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{member.name}</p>
                  <p className="text-[10px] text-muted-foreground">{member.role} · {member.shift}</p>
                </div>
                <span className="text-[10px] text-success font-medium">● Ativo</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals Preview */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Aprovações Pendentes</h3>
            <button onClick={() => onNavigate('approvals')} className="text-xs text-primary font-semibold">Ver todas →</button>
          </div>
          <div className="space-y-2">
            {PENDING_APPROVALS.slice(0, 3).map(ap => {
              const typeConfig = {
                cancel: { label: 'Cancelamento', color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle },
                courtesy: { label: 'Cortesia', color: 'text-info', bg: 'bg-info/10', icon: Star },
                refund: { label: 'Estorno', color: 'text-warning', bg: 'bg-warning/10', icon: ArrowDown },
                discount: { label: 'Desconto', color: 'text-secondary', bg: 'bg-secondary/10', icon: DollarSign },
              }[ap.type];
              const Icon = typeConfig.icon;
              return (
                <div key={ap.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className={`w-9 h-9 rounded-lg ${typeConfig.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{typeConfig.label}: {ap.item}</p>
                    <p className="text-[10px] text-muted-foreground">Mesa {ap.table} · {ap.requestedBy}</p>
                  </div>
                  <span className="text-sm font-display font-bold text-destructive">-R$ {ap.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Orders Feed */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Feed de Pedidos em Tempo Real</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activeOrders.slice(0, 6).map(order => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isLate = elapsed > 15;
            return (
              <div key={order.id} className={`flex items-center gap-3 p-3 rounded-xl ${isLate ? 'bg-destructive/5 border border-destructive/20' : 'bg-muted/30'}`}>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary text-sm">{order.tableNumber}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.items.length} itens · R$ {order.total}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isLate ? 'text-destructive' : 'text-muted-foreground'}`}>{elapsed}min</span>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                    order.status === 'pending' ? 'bg-muted text-muted-foreground' :
                    order.status === 'preparing' ? 'bg-warning/10 text-warning' :
                    order.status === 'ready' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'
                  }`}>{
                    order.status === 'pending' ? 'Pendente' :
                    order.status === 'confirmed' ? 'Confirmado' :
                    order.status === 'preparing' ? 'Preparando' :
                    order.status === 'ready' ? 'Pronto' : 'Entregue'
                  }</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============ APPROVALS SCREEN ============

export const ApprovalsScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const [handled, setHandled] = useState<string[]>([]);

  const typeConfig: Record<string, { label: string; color: string; bg: string; icon: React.FC<{ className?: string }> }> = {
    cancel: { label: 'Cancelamento', color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle },
    courtesy: { label: 'Cortesia', color: 'text-info', bg: 'bg-info/10', icon: Star },
    refund: { label: 'Estorno', color: 'text-warning', bg: 'bg-warning/10', icon: ArrowDown },
    discount: { label: 'Desconto', color: 'text-secondary', bg: 'bg-secondary/10', icon: DollarSign },
  };

  return (
    <div className="space-y-6">
      <GuidedHint text="Aprovações requerem autorização do gerente ou dono — cancelamentos, cortesias e estornos" />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pendentes', value: PENDING_APPROVALS.filter(a => !handled.includes(a.id)).length, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Aprovadas Hoje', value: 7, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Recusadas Hoje', value: 2, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Total Impacto', value: 'R$ 239', color: 'text-primary', bg: 'bg-primary/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {PENDING_APPROVALS.map(ap => {
          const config = typeConfig[ap.type];
          const Icon = config.icon;
          const isHandled = handled.includes(ap.id);

          return (
            <div key={ap.id} className={`bg-card rounded-xl border-2 p-5 transition-all ${isHandled ? 'border-success/30 opacity-50' : 'border-border'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${config.bg} ${config.color}`}>{config.label}</span>
                    <span className="text-xs text-muted-foreground">{ap.time}</span>
                  </div>
                  <h4 className="font-semibold">{ap.item}</h4>
                  <p className="text-sm text-muted-foreground mt-1">Mesa {ap.table} · Solicitado por <span className="font-medium text-foreground">{ap.requestedBy}</span></p>
                  <p className="text-xs text-muted-foreground mt-1 italic">"{ap.reason}"</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-xl font-bold text-destructive">-R$ {ap.amount}</p>
                </div>
              </div>
              {!isHandled && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <button onClick={() => setHandled([...handled, ap.id])} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success text-success-foreground text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Aprovar
                  </button>
                  <button onClick={() => setHandled([...handled, ap.id])} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold">
                    <XCircle className="w-4 h-4" /> Recusar
                  </button>
                </div>
              )}
              {isHandled && (
                <div className="mt-3 flex items-center gap-2 text-success text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Processado
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ BARMAN STATION ============

export const BarmanStationScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { orders, updateOrderStatus } = useDemoContext();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(i);
  }, []);

  const barOrders = orders.filter(o => o.isBar && ['confirmed', 'preparing'].includes(o.status));
  const drinkItems = barOrders.flatMap(o =>
    o.items
      .filter(item => item.menuItem.category === 'Bebidas')
      .map(item => ({ ...item, orderId: o.id, orderStatus: o.status, table: o.tableNumber, elapsed: Math.round((now - o.createdAt.getTime()) / 60000) }))
  );

  return (
    <div className="space-y-6">
      <GuidedHint text="Sua estação de trabalho — drinks na fila, preparo e expedição" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-warning">{drinkItems.length}</p>
          <p className="text-xs text-muted-foreground">Drinks na Fila</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-success">
            {orders.filter(o => o.isBar && o.status === 'ready').length}
          </p>
          <p className="text-xs text-muted-foreground">Prontos</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-primary">47</p>
          <p className="text-xs text-muted-foreground">Drinks Hoje</p>
        </div>
      </div>

      {/* Drink Queue */}
      {drinkItems.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Beer className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">Nenhum drink na fila</p>
          <p className="text-sm text-muted-foreground/60">Pedidos de bebidas aparecerão aqui</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barOrders.map(order => {
            const elapsed = Math.round((now - order.createdAt.getTime()) / 60000);
            const isUrgent = elapsed > 5;
            const drinks = order.items.filter(i => i.menuItem.category === 'Bebidas');

            return (
              <div key={order.id} className={`rounded-2xl border-2 overflow-hidden ${
                isUrgent ? 'border-warning bg-warning/5' : 'border-border bg-card'
              }`}>
                <div className={`px-4 py-3 flex items-center justify-between ${isUrgent ? 'bg-warning/10' : 'bg-muted/30'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold">Mesa {order.tableNumber}</span>
                    {isUrgent && <Flame className="w-4 h-4 text-warning" />}
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isUrgent ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'}`}>
                    <Timer className="w-3 h-3" />{elapsed}min
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {drinks.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={item.menuItem.image} alt={item.menuItem.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{item.quantity}x {item.menuItem.name}</p>
                        {item.notes && <p className="text-[10px] text-muted-foreground italic">{item.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <button
                    onClick={() => updateOrderStatus(order.id, order.status === 'confirmed' ? 'preparing' : 'ready')}
                    className={`w-full py-3 rounded-xl text-sm font-bold ${
                      order.status === 'confirmed' ? 'bg-warning text-warning-foreground' : 'bg-success text-success-foreground'
                    }`}
                  >
                    {order.status === 'confirmed' ? '▶ Preparar' : '✓ Pronto para servir'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Access */}
      <div className="grid md:grid-cols-2 gap-4">
        <button onClick={() => onNavigate('drink-recipes')} className="bg-card rounded-xl border border-border p-5 text-left hover:border-primary/30 transition-colors">
          <BookOpen className="w-8 h-8 text-primary mb-2" />
          <h4 className="font-semibold">Receitas de Drinks</h4>
          <p className="text-xs text-muted-foreground">Fichas técnicas e medidas padronizadas</p>
        </button>
        <button onClick={() => onNavigate('stock')} className="bg-card rounded-xl border border-border p-5 text-left hover:border-warning/30 transition-colors">
          <Package className="w-8 h-8 text-warning mb-2" />
          <h4 className="font-semibold">Estoque do Bar</h4>
          <p className="text-xs text-muted-foreground">{STOCK_ITEMS.filter(s => s.status !== 'ok').length} itens com alerta</p>
        </button>
      </div>
    </div>
  );
};

// ============ DRINK RECIPES ============

export const DrinkRecipesScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const [selectedDrink, setSelectedDrink] = useState(DRINK_RECIPES[0].id);
  const drink = DRINK_RECIPES.find(d => d.id === selectedDrink)!;

  return (
    <div className="space-y-6">
      <GuidedHint text="Fichas técnicas padronizadas — ingredientes, medidas e apresentação" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recipe List */}
        <div className="space-y-2">
          {DRINK_RECIPES.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDrink(d.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                selectedDrink === d.id ? 'bg-primary/10 border border-primary/30' : 'bg-card border border-border hover:border-muted-foreground/30'
              }`}
            >
              <img src={d.image} alt={d.name} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-semibold">{d.name}</p>
                <p className="text-[10px] text-muted-foreground">{d.prepTime}min · R$ {d.price}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Recipe Detail */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex gap-6 mb-6">
            <img src={drink.image} alt={drink.name} className="w-32 h-32 rounded-2xl object-cover" />
            <div>
              <h3 className="font-display text-2xl font-bold">{drink.name}</h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" />{drink.prepTime}min</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />R$ {drink.price}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium">{drink.glass}</span>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{drink.garnish}</span>
              </div>
            </div>
          </div>

          <h4 className="font-display font-bold mb-3">Ingredientes</h4>
          <div className="space-y-2 mb-6">
            {drink.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                <span className="text-sm">{ing}</span>
              </div>
            ))}
          </div>

          <h4 className="font-display font-bold mb-3">Modo de Preparo</h4>
          <div className="p-4 rounded-xl bg-muted/30 text-sm text-muted-foreground leading-relaxed">
            1. Adicione os ingredientes ao mixing glass com gelo.<br/>
            2. Mexa suavemente por 20 segundos.<br/>
            3. Coe para o {drink.glass} previamente gelado.<br/>
            4. Decore com {drink.garnish}.<br/>
            5. Sirva imediatamente.
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ COOK STATION ============

export const CookStationScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { orders, updateOrderStatus } = useDemoContext();
  const [now, setNow] = useState(Date.now());
  const [station] = useState<'grelhados' | 'frios' | 'massas'>('grelhados');

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(i);
  }, []);

  const kitchenOrders = orders.filter(o => o.isKitchen && ['confirmed', 'preparing'].includes(o.status));

  // Simulate station-specific items
  const stationKeywords: Record<string, string[]> = {
    grelhados: ['Filé', 'Salmão', 'Polvo', 'Carpaccio'],
    frios: ['Tartare', 'Ceviche', 'Burrata', 'Carpaccio'],
    massas: ['Risoto', 'Ravioli'],
  };

  return (
    <div className="space-y-6">
      <GuidedHint text="Visão simplificada para o cozinheiro — foco nos tickets da sua estação" />

      {/* Station Selector */}
      <div className="flex gap-2">
        {[
          { id: 'grelhados', label: '🔥 Grelhados', count: 4 },
          { id: 'frios', label: '❄️ Frios', count: 2 },
          { id: 'massas', label: '🍝 Massas', count: 1 },
        ].map(s => (
          <div
            key={s.id}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
              station === s.id ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground'
            }`}
          >
            {s.label}
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary-foreground/20 text-[10px]">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Large ticket cards - designed for kitchen display */}
      <div className="grid md:grid-cols-2 gap-4">
        {kitchenOrders.map(order => {
          const elapsed = Math.round((now - order.createdAt.getTime()) / 60000);
          const isLate = elapsed > 15;
          const relevantItems = order.items.filter(
            item => stationKeywords[station]?.some(kw => item.menuItem.name.includes(kw))
          );

          if (relevantItems.length === 0) return null;

          return (
            <div key={order.id} className={`rounded-2xl border-2 overflow-hidden ${
              isLate ? 'border-destructive bg-destructive/5' :
              order.status === 'preparing' ? 'border-primary/30 bg-primary/5' :
              'border-border bg-card'
            }`}>
              <div className={`px-5 py-4 flex items-center justify-between ${
                isLate ? 'bg-destructive/10' : 'bg-muted/30'
              }`}>
                <span className="font-display text-2xl font-bold">Mesa {order.tableNumber}</span>
                <div className="flex items-center gap-2">
                  {isLate && <AlertCircle className="w-5 h-5 text-destructive animate-bounce" />}
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    isLate ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
                  }`}>
                    {elapsed}min
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {relevantItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg font-display font-bold">
                      {item.quantity}x
                    </span>
                    <div>
                      <p className="text-lg font-semibold">{item.menuItem.name}</p>
                      <p className="text-xs text-muted-foreground">{item.menuItem.prepTime}min preparo</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <button
                  onClick={() => updateOrderStatus(order.id, order.status === 'confirmed' ? 'preparing' : 'ready')}
                  className={`w-full py-4 rounded-xl text-base font-bold ${
                    order.status === 'confirmed' ? 'bg-warning text-warning-foreground' : 'bg-success text-success-foreground'
                  }`}
                >
                  {order.status === 'confirmed' ? '▶ INICIAR PREPARO' : '✓ PRONTO'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ STOCK ============

export const StockScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<'all' | 'low' | 'critical'>('all');
  const filtered = filter === 'all' ? STOCK_ITEMS : STOCK_ITEMS.filter(s => filter === 'critical' ? s.status === 'critical' : s.status !== 'ok');

  return (
    <div className="space-y-6">
      <GuidedHint text="Controle de estoque com alertas automáticos de nível baixo" />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-success">{STOCK_ITEMS.filter(s => s.status === 'ok').length}</p>
          <p className="text-xs text-muted-foreground">OK</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-warning">{STOCK_ITEMS.filter(s => s.status === 'low').length}</p>
          <p className="text-xs text-muted-foreground">Baixo</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-destructive">{STOCK_ITEMS.filter(s => s.status === 'critical').length}</p>
          <p className="text-xs text-muted-foreground">Crítico</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'all' as const, label: 'Todos' },
          { id: 'low' as const, label: 'Baixo Estoque' },
          { id: 'critical' as const, label: 'Crítico' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-xl text-xs font-medium ${
            filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>{f.label}</button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filtered.map(item => (
          <div key={item.id} className={`flex items-center gap-4 p-4 border-b border-border last:border-0 ${
            item.status === 'critical' ? 'bg-destructive/5' : item.status === 'low' ? 'bg-warning/5' : ''
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              item.status === 'critical' ? 'bg-destructive/10' : item.status === 'low' ? 'bg-warning/10' : 'bg-success/10'
            }`}>
              <Package className={`w-5 h-5 ${
                item.status === 'critical' ? 'text-destructive' : item.status === 'low' ? 'text-warning' : 'text-success'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">{item.category}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-display font-bold ${
                item.status === 'critical' ? 'text-destructive' : item.status === 'low' ? 'text-warning' : 'text-foreground'
              }`}>
                {item.current} {item.unit}
              </p>
              <p className="text-[10px] text-muted-foreground">mín: {item.min}</p>
            </div>
            <div className="w-24">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  item.status === 'critical' ? 'bg-destructive' : item.status === 'low' ? 'bg-warning' : 'bg-success'
                }`} style={{ width: `${Math.min(100, (item.current / item.min) * 100)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ WAITER CALLS (Enhanced) ============

export const WaiterCallsScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { notifications } = useDemoContext();
  const waiterCalls = notifications.filter(n => n.type === 'waiter_call');
  const [attended, setAttended] = useState<string[]>([]);

  const mockCalls = [
    { id: 'wc1', table: 3, type: 'garcom' as const, message: 'Cliente solicitou o garçom', time: '2min atrás', urgent: false, reason: 'Dúvida sobre harmonização', category: 'Atendimento' },
    { id: 'wc2', table: 8, type: 'gerente' as const, message: 'Solicita falar com gerente', time: '5min atrás', urgent: true, reason: 'Reclamação sobre tempo de espera do prato', category: 'Escalação' },
    { id: 'wc3', table: 1, type: 'garcom' as const, message: 'Pedido de sobremesa', time: '8min atrás', urgent: false, reason: 'Quer ver cardápio de sobremesas', category: 'Pedido' },
    { id: 'wc4', table: 5, type: 'ajuda' as const, message: 'Precisa de assistência especial', time: '1min atrás', urgent: true, reason: 'Acessibilidade — cadeira especial necessária', category: 'Acessibilidade' },
    { id: 'wc5', table: 10, type: 'garcom' as const, message: 'Questão sobre alérgenos', time: '4min atrás', urgent: false, reason: 'Cliente com restrição alimentar — intolerância a glúten', category: 'Segurança' },
  ];

  return (
    <div className="space-y-6">
      <GuidedHint text="Chamados em tempo real — atenda discretamente sem que o cliente precise levantar a mão" />

      {/* Urgent banner */}
      {mockCalls.filter(c => c.urgent && !attended.includes(c.id)).length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 animate-pulse">
          <Bell className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-sm font-bold text-destructive">{mockCalls.filter(c => c.urgent && !attended.includes(c.id)).length} chamado(s) urgente(s)!</p>
            <p className="text-xs text-destructive/70">Prioridade máxima — atenda imediatamente</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-warning">{mockCalls.filter(c => !attended.includes(c.id)).length}</p>
          <p className="text-xs text-muted-foreground">Pendentes</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-destructive">{mockCalls.filter(c => c.urgent && !attended.includes(c.id)).length}</p>
          <p className="text-xs text-muted-foreground">Urgentes</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-success">{attended.length}</p>
          <p className="text-xs text-muted-foreground">Atendidos</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-primary">~2min</p>
          <p className="text-xs text-muted-foreground">Tempo Médio</p>
        </div>
      </div>

      <div className="space-y-3">
        {mockCalls.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0)).map(call => {
          const isAttended = attended.includes(call.id);
          return (
            <div key={call.id} className={`bg-card rounded-xl border-2 p-4 transition-all ${
              isAttended ? 'border-success/30 opacity-50' :
              call.urgent ? 'border-destructive/30 bg-destructive/5 animate-pulse' :
              'border-border'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display text-lg font-bold ${
                  call.urgent ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                }`}>
                  {call.table}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{call.message}</p>
                    {call.urgent && <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">URGENTE</span>}
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">{call.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{call.reason}</p>
                  <p className="text-[10px] text-muted-foreground">Mesa {call.table} · {call.time}</p>
                </div>
                {!isAttended ? (
                  <button onClick={() => setAttended([...attended, call.id])} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-glow">
                    Atender
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-success text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Atendido
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ WAITER PAYMENT (TAP to Pay, PIX, Card) ============

export const WaiterPaymentScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { tables, orders } = useDemoContext();
  const myTables = tables.filter(t => ['occupied', 'billing'].includes(t.status));
  const [step, setStep] = useState<'select' | 'method' | 'processing' | 'done'>('select');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods = [
    { id: 'tap', label: 'TAP to Pay (NFC)', desc: 'Aproxime o cartão do cliente na parte traseira do celular', icon: '📱', highlight: true },
    { id: 'pix', label: 'PIX QR Code', desc: 'Gerar código para pagamento instantâneo', icon: '📲', highlight: false },
    { id: 'card', label: 'Cartão (chip/senha)', desc: 'Crédito ou débito — insira o cartão', icon: '💳', highlight: false },
    { id: 'cash', label: 'Dinheiro', desc: 'Pagamento em espécie com confirmação', icon: '💵', highlight: false },
  ];

  return (
    <div className="space-y-6">
      <GuidedHint text="Transforme o celular em uma maquininha — TAP to Pay, PIX, cartão ou dinheiro para clientes sem app" />

      {step === 'select' && (
        <>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-border p-5">
            <h3 className="font-display font-bold text-lg">Cobrar na Mesa</h3>
            <p className="text-sm text-muted-foreground mt-1">Selecione a mesa para processar o pagamento de clientes sem app</p>
          </div>
          <div className="space-y-3">
            {myTables.map(table => {
              const tableOrders = orders.filter(o => o.tableNumber === table.number && !['paid'].includes(o.status));
              const guestsWithoutApp = Math.floor(Math.random() * 2) + 1;
              return (
                <button key={table.id} onClick={() => { setSelectedTable(table.number); setStep('method'); }}
                  className="w-full text-left bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center font-display text-xl font-bold text-primary">{table.number}</div>
                    <div className="flex-1">
                      <p className="font-semibold">{table.customerName}</p>
                      <p className="text-xs text-muted-foreground">{table.seats} pessoas · {tableOrders.length} pedido(s)</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-bold">{guestsWithoutApp} sem app</span>
                        <span className="text-[10px] text-muted-foreground">Precisam pagamento via garçom</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-bold text-primary">R$ {table.orderTotal || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Total da mesa</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {step === 'method' && (
        <>
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('select')} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            <div>
              <h3 className="font-display font-bold">Mesa {selectedTable}</h3>
              <p className="text-sm text-muted-foreground">Valor: R$ {myTables.find(t => t.number === selectedTable)?.orderTotal || 0}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">Valor a cobrar</p>
            <p className="font-display text-4xl font-bold text-primary mt-2">R$ {myTables.find(t => t.number === selectedTable)?.orderTotal || 0}</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Selecione o método:</p>
            {paymentMethods.map(method => (
              <button key={method.id} onClick={() => { setSelectedMethod(method.id); setStep('processing'); }}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  method.highlight ? 'border-primary bg-primary/5 hover:bg-primary/10' : 'border-border bg-card hover:bg-muted/30'
                }`}>
                <span className="text-3xl">{method.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.desc}</p>
                </div>
                {method.highlight && <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">RECOMENDADO</span>}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'processing' && (
        <div className="text-center py-12 space-y-6">
          <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            {selectedMethod === 'tap' && <Phone className="w-14 h-14 text-primary" />}
            {selectedMethod === 'pix' && <div className="w-20 h-20 rounded-xl bg-muted border-2 border-foreground/20 flex items-center justify-center text-lg font-bold">QR</div>}
            {selectedMethod === 'card' && <DollarSign className="w-14 h-14 text-primary" />}
            {selectedMethod === 'cash' && <DollarSign className="w-14 h-14 text-primary" />}
          </div>
          {selectedMethod === 'tap' && (
            <>
              <h3 className="font-display text-2xl font-bold">Aproxime o Cartão</h3>
              <p className="text-muted-foreground">Peça ao cliente para aproximar o cartão na parte traseira do celular</p>
              <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Aguardando aproximação...
              </div>
            </>
          )}
          {selectedMethod === 'pix' && (
            <>
              <h3 className="font-display text-2xl font-bold">QR Code PIX</h3>
              <p className="text-muted-foreground">Mostre o QR ao cliente para pagamento via PIX</p>
              <div className="w-40 h-40 mx-auto bg-muted rounded-xl border-4 border-foreground/10 flex items-center justify-center">
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div key={i} className={`w-3.5 h-3.5 rounded-sm ${Math.random() > 0.4 ? 'bg-foreground' : 'bg-background'}`} />
                  ))}
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl border border-border text-sm font-medium">Copiar código PIX</button>
            </>
          )}
          {selectedMethod === 'card' && (
            <>
              <h3 className="font-display text-2xl font-bold">Insira o Cartão</h3>
              <p className="text-muted-foreground">Aguardando inserção do cartão com chip/senha...</p>
            </>
          )}
          {selectedMethod === 'cash' && (
            <>
              <h3 className="font-display text-2xl font-bold">Pagamento em Dinheiro</h3>
              <p className="text-muted-foreground">R$ {myTables.find(t => t.number === selectedTable)?.orderTotal || 0} — confirme o recebimento</p>
            </>
          )}
          <button onClick={() => setStep('done')} className="px-8 py-3 rounded-xl bg-success text-success-foreground font-semibold text-sm shadow-glow">
            {selectedMethod === 'cash' ? 'Confirmar Recebimento' : 'Simular Aprovação'}
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-12 space-y-6">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <h3 className="font-display text-2xl font-bold text-success">Pagamento Aprovado!</h3>
          <p className="text-muted-foreground">Mesa {selectedTable} · R$ {myTables.find(t => t.number === selectedTable)?.orderTotal || 0}</p>
          <div className="flex gap-3 justify-center">
            <button className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold">Enviar Recibo</button>
            <button className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold">Imprimir</button>
            <button onClick={() => { setStep('select'); setSelectedTable(null); }} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              Nova Cobrança
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ WAITER ACTIONS (Execute on behalf of client) ============

export const WaiterActionsScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { tables, orders } = useDemoContext();
  const myTables = tables.filter(t => ['occupied', 'billing'].includes(t.status));

  const ACTIONS = [
    { id: 'add-item', label: 'Adicionar Item ao Pedido', desc: 'Inclua um item no pedido do cliente', icon: Plus, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'request-bill', label: 'Solicitar Conta', desc: 'Gerar conta para o cliente fechar no app ou via garçom', icon: DollarSign, color: 'text-warning', bg: 'bg-warning/10' },
    { id: 'split-bill', label: 'Dividir Conta', desc: 'Dividir conta entre os convidados da mesa', icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
    { id: 'call-manager', label: 'Chamar Gerente', desc: 'Escalar situação para aprovação ou resolução', icon: Shield, color: 'text-destructive', bg: 'bg-destructive/10' },
    { id: 'courtesy', label: 'Solicitar Cortesia', desc: 'Requer aprovação do gerente — aniversários, compensações', icon: Star, color: 'text-accent-foreground', bg: 'bg-accent/10' },
    { id: 'cancel-item', label: 'Cancelar Item', desc: 'Requer aprovação do gerente antes de efetivar', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  return (
    <div className="space-y-6">
      <GuidedHint text="Execute ações pelo cliente — quando alguém precisar de ajuda com o app, você faz por ele" />

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-border p-5">
        <h3 className="font-display font-bold text-lg">Ações na Mesa</h3>
        <p className="text-sm text-muted-foreground mt-1">Quando o cliente precisar de ajuda com o app, execute a ação por ele. Algumas ações requerem aprovação do gerente.</p>
      </div>

      {myTables.map(table => {
        const tableOrders = orders.filter(o => o.tableNumber === table.number && !['paid'].includes(o.status));
        return (
          <div key={table.id} className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/20">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary">{table.number}</div>
              <div className="flex-1">
                <p className="font-semibold">{table.customerName}</p>
                <p className="text-xs text-muted-foreground">{table.seats} pessoas · {tableOrders.length} pedido(s) · R$ {table.orderTotal || 0}</p>
              </div>
              <div className="flex gap-1">
                {[true, true, false].map((hasApp, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    hasApp ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {hasApp ? '✓' : '?'}
                  </div>
                ))}
              </div>
            </div>
            {/* Actions grid */}
            <div className="grid grid-cols-2 gap-0">
              {ACTIONS.map(action => (
                <button key={action.id} className="flex items-start gap-3 p-4 border-b border-r border-border last:border-r-0 hover:bg-muted/20 transition-colors text-left">
                  <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center shrink-0`}>
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============ WAITER TIPS ============

export const WaiterTipsScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => (
  <div className="space-y-6">
    <GuidedHint text="Acompanhe suas gorjetas em tempo real — transparência total" />

    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-success/10 to-primary/10 rounded-xl border border-success/20 p-5 text-center">
        <p className="text-xs text-muted-foreground">Hoje</p>
        <p className="font-display text-3xl font-bold text-success mt-1">R$ 410</p>
        <p className="text-[10px] text-success mt-1">+18% vs ontem</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-5 text-center">
        <p className="text-xs text-muted-foreground">Semana</p>
        <p className="font-display text-3xl font-bold mt-1">R$ 1.840</p>
        <p className="text-[10px] text-muted-foreground mt-1">23 mesas</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-5 text-center">
        <p className="text-xs text-muted-foreground">Média/Mesa</p>
        <p className="font-display text-3xl font-bold text-primary mt-1">R$ 51</p>
        <p className="text-[10px] text-muted-foreground mt-1">8 mesas hoje</p>
      </div>
    </div>

    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-display font-bold mb-4">Gorjetas de Hoje</h3>
      <div className="space-y-2">
        {[
          { table: 8, customer: 'Grupo Aniversário', amount: 120, time: '30min atrás', pct: '15%' },
          { table: 5, customer: 'Grupo Pedro', amount: 85, time: '1h atrás', pct: '12%' },
          { table: 10, customer: 'Carlos M.', amount: 98, time: '1h30 atrás', pct: '10%' },
          { table: 3, customer: 'João & Ana', amount: 62, time: '2h atrás', pct: '10%' },
          { table: 1, customer: 'Maria S.', amount: 45, time: '2h30 atrás', pct: '15%' },
        ].map((tip, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center font-display font-bold text-success">
              {tip.table}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{tip.customer}</p>
              <p className="text-[10px] text-muted-foreground">{tip.time}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-display font-bold text-success">+R$ {tip.amount}</p>
              <p className="text-[10px] text-muted-foreground">{tip.pct} da conta</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Performance Chart */}
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-display font-bold mb-4">Sua Semana</h3>
      <div className="flex items-end gap-3 h-32">
        {[
          { day: 'Seg', value: 0 },
          { day: 'Ter', value: 280 },
          { day: 'Qua', value: 350 },
          { day: 'Qui', value: 420 },
          { day: 'Sex', value: 510 },
          { day: 'Sáb', value: 0 },
          { day: 'Dom', value: 410 },
        ].map((d, i) => {
          const max = 510;
          const height = max > 0 ? (d.value / max) * 100 : 0;
          const isToday = d.day === 'Dom';
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{d.value > 0 ? `R$${d.value}` : '-'}</span>
              <div
                className={`w-full rounded-t-lg ${isToday ? 'bg-gradient-to-t from-success to-success/60' : 'bg-gradient-to-t from-muted-foreground/20 to-muted-foreground/10'}`}
                style={{ height: `${height}%`, minHeight: d.value > 0 ? 4 : 2 }}
              />
              <span className={`text-[10px] ${isToday ? 'text-success font-bold' : 'text-muted-foreground'}`}>{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// ============ FLOOR FLOW (Maitre extended) ============

export const FloorFlowScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { tables } = useDemoContext();
  const occupied = tables.filter(t => t.status === 'occupied');

  return (
    <div className="space-y-6">
      <GuidedHint text="Controle o fluxo do salão — tempos de permanência, fila e rotação de mesas" />

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-2xl font-bold text-primary">{occupied.length}</p>
          <p className="text-[10px] text-muted-foreground">Mesas Ativas</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-2xl font-bold text-warning">42min</p>
          <p className="text-[10px] text-muted-foreground">Tempo Médio</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-2xl font-bold text-success">3</p>
          <p className="text-[10px] text-muted-foreground">Na Fila</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-2xl font-bold text-info">~15min</p>
          <p className="text-[10px] text-muted-foreground">Espera Estimada</p>
        </div>
      </div>

      {/* Table Rotation */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Rotação de Mesas</h3>
        <div className="space-y-3">
          {occupied.map(table => {
            const elapsed = table.occupiedSince ? getElapsedMinutes(table.occupiedSince) : 0;
            const isLong = elapsed > 60;
            return (
              <div key={table.id} className={`flex items-center gap-4 p-3 rounded-xl ${isLong ? 'bg-warning/5 border border-warning/20' : 'bg-muted/30'}`}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-display text-lg font-bold text-primary">
                  {table.number}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{table.customerName}</p>
                  <p className="text-[10px] text-muted-foreground">{table.seats} lugares · R$ {table.orderTotal || 0}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-display font-bold ${isLong ? 'text-warning' : 'text-muted-foreground'}`}>{elapsed}min</p>
                  <p className="text-[10px] text-muted-foreground">{isLong ? 'Acima da média' : 'Normal'}</p>
                </div>
                <div className="w-20">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isLong ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(100, (elapsed / 90) * 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Virtual Queue */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Fila Virtual</h3>
        <div className="space-y-2">
          {[
            { pos: 1, name: 'Marcos Pereira', party: 3, wait: '~15min' },
            { pos: 2, name: 'Sandra Alves', party: 2, wait: '~25min' },
            { pos: 3, name: 'Roberto Lima', party: 5, wait: '~35min' },
          ].map(guest => (
            <div key={guest.pos} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-sm font-bold text-warning">#{guest.pos}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{guest.name}</p>
                <p className="text-[10px] text-muted-foreground">{guest.party} pessoas · {guest.wait}</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-semibold">Chamar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ DAILY REPORT ============

export const DailyReportScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { analytics } = useDemoContext();

  return (
    <div className="space-y-6">
      <GuidedHint text="Relatório de fechamento do dia — métricas, comparativos e destaques" />

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-2xl font-bold">Fechamento do Dia</h3>
            <p className="text-sm text-muted-foreground">Domingo, 16 de Março 2026</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold">+12% vs semana passada</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Receita Total', value: `R$ ${analytics.todayRevenue.toLocaleString()}`, color: 'text-success' },
            { label: 'Pedidos', value: analytics.todayOrders.toString(), color: 'text-primary' },
            { label: 'Ticket Médio', value: `R$ ${analytics.avgTicket}`, color: 'text-info' },
            { label: 'Satisfação', value: `${analytics.customerSatisfaction} ⭐`, color: 'text-warning' },
          ].map((m, i) => (
            <div key={i} className="bg-card/50 rounded-xl p-4 text-center">
              <p className={`font-display text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Items */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="font-display font-bold mb-3">🏆 Mais Vendidos</h4>
          <div className="space-y-2">
            {analytics.topItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <span className={`font-display text-lg font-bold ${i === 0 ? 'text-primary' : 'text-muted-foreground/30'}`}>#{i + 1}</span>
                <span className="text-sm font-medium flex-1">{item.name}</span>
                <span className="text-sm font-bold">{item.quantity}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="font-display font-bold mb-3">👥 Desempenho Equipe</h4>
          <div className="space-y-2">
            {TEAM_MEMBERS.filter(m => m.sales > 0).sort((a, b) => b.sales - a.sales).map((member, i) => (
              <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{member.name}</p>
                  <p className="text-[10px] text-muted-foreground">{member.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">R$ {member.sales.toLocaleString()}</p>
                  <p className="text-[10px] text-success">+R$ {member.tips} gorjetas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly breakdown */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-display font-bold mb-4">Receita por Hora</h4>
        <div className="flex items-end gap-2 h-40">
          {analytics.hourlyRevenue.map((h, i) => {
            const max = Math.max(...analytics.hourlyRevenue.map(x => x.revenue));
            const height = max > 0 ? (h.revenue / max) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">R${(h.revenue/1000).toFixed(1)}k</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 hover:from-primary hover:to-primary/80 transition-colors cursor-pointer" style={{ height: `${height}%`, minHeight: 4 }} />
                <span className="text-[10px] text-muted-foreground">{h.hour}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
