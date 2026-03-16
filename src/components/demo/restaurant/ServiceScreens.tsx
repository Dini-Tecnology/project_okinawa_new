/**
 * Restaurant Demo — Maitre + Waiter + Menu Editor + Team Screens
 */
import React, { useState } from 'react';
import {
  Clock, Users, Check, Plus, Star, CalendarDays, Phone, Bell,
  UserPlus, ChefHat, Wine, UtensilsCrossed, Shield, Briefcase,
  MoreHorizontal, Edit3, Trash2, Save, X, Hash, DollarSign,
  MessageSquare, AlertCircle, ArrowRight, Smartphone, MapPin,
  Coffee, HandPlatter,
} from 'lucide-react';
import { useDemoContext, type DemoReservation } from '@/contexts/DemoContext';
import { PhoneShell, GuidedHint } from '@/components/demo/DemoShared';
import { TEAM_MEMBERS, formatTimeAgo } from './RestaurantDemoShared';

// ============ MAITRE ============

export const MaitreScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { reservations, tables } = useDemoContext();
  const [selectedRes, setSelectedRes] = useState<string | null>(null);
  const availableTables = tables.filter(t => t.status === 'available');

  const VIRTUAL_QUEUE = [
    { id: 'q1', name: 'Marcos Pereira', party: 3, waitTime: '~15min', position: 1, phone: '(11) 99111-2233' },
    { id: 'q2', name: 'Sandra Alves', party: 2, waitTime: '~25min', position: 2, phone: '(11) 98222-3344' },
    { id: 'q3', name: 'Roberto Lima', party: 5, waitTime: '~35min', position: 3, phone: '(11) 97333-4455' },
  ];

  const statusStyles: Record<string, string> = {
    confirmed: 'bg-success/10 text-success',
    seated: 'bg-primary/10 text-primary',
    waiting: 'bg-warning/10 text-warning',
    cancelled: 'bg-destructive/10 text-destructive',
  };
  const statusLabels: Record<string, string> = {
    confirmed: 'Confirmada', seated: 'Sentado', waiting: 'Aguardando', cancelled: 'Cancelada',
  };

  return (
    <div className="space-y-6">
      <GuidedHint text="Painel do Maitre — reservas, fila virtual e gestão de fluxo do salão" />

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Reservas Hoje', value: reservations.length.toString(), color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Confirmadas', value: reservations.filter(r => r.status === 'confirmed').length.toString(), color: 'text-success', bg: 'bg-success/10' },
          { label: 'Na Fila', value: VIRTUAL_QUEUE.length.toString(), color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Mesas Livres', value: availableTables.length.toString(), color: 'text-info', bg: 'bg-info/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reservations Timeline */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Reservas de Hoje</h3>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
              <Plus className="w-3 h-3" /> Nova
            </button>
          </div>
          <div className="space-y-3">
            {reservations.map((res) => (
              <button
                key={res.id}
                onClick={() => setSelectedRes(selectedRes === res.id ? null : res.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedRes === res.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                }`}
              >
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
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusStyles[res.status]}`}>
                    {statusLabels[res.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{res.time}</div>
                  <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{res.partySize} pessoas</div>
                </div>
                {res.notes && <p className="text-[10px] text-muted-foreground mt-2 italic">📝 {res.notes}</p>}

                {selectedRes === res.id && (
                  <div className="mt-3 pt-3 border-t border-border flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-success text-success-foreground text-xs font-semibold">Check-in</button>
                    <button className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">Editar</button>
                    <button className="py-2 px-3 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">Cancelar</button>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Virtual Queue */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">Fila Virtual</h3>
              <span className="px-2 py-1 rounded-full bg-warning/10 text-warning text-xs font-semibold">{VIRTUAL_QUEUE.length} na fila</span>
            </div>
            <div className="space-y-3">
              {VIRTUAL_QUEUE.map((guest) => (
                <div key={guest.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                    <span className="text-sm font-display font-bold text-warning">#{guest.position}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{guest.name}</p>
                    <p className="text-[10px] text-muted-foreground">{guest.party} pessoas · {guest.waitTime}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center hover:bg-success/20 transition-colors">
                      <Check className="w-4 h-4 text-success" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Tables for Assignment */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-bold mb-3">Mesas Disponíveis</h3>
            <div className="grid grid-cols-4 gap-2">
              {availableTables.map(table => (
                <div key={table.id} className="p-3 rounded-xl bg-success/10 border border-success/20 text-center cursor-pointer hover:bg-success/20 transition-colors">
                  <p className="font-display font-bold text-success">{table.number}</p>
                  <p className="text-[9px] text-muted-foreground">{table.seats}p</p>
                </div>
              ))}
              {availableTables.length === 0 && (
                <div className="col-span-4 text-center py-4 text-sm text-muted-foreground">Nenhuma mesa disponível</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ WAITER VIEW (Phone Shell) ============

export const WaiterScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { orders, tables, notifications } = useDemoContext();
  const [waiterScreen, setWaiterScreen] = useState<'tables' | 'calls' | 'tips'>('tables');
  const myTables = tables.filter(t => ['occupied', 'billing'].includes(t.status));
  const waiterCalls = notifications.filter(n => n.type === 'waiter_call' && !n.read);

  return (
    <div className="space-y-6">
      <GuidedHint text="Assim fica o app no celular do garçom — mesas, chamados e gorjetas em tempo real" />

      <div className="flex justify-center">
        <PhoneShell>
          <div className="bg-background min-h-full">
            {/* Waiter App Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-5 pt-2 pb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-primary-foreground/70 text-xs">Olá, Bruno 👋</p>
                  <p className="text-primary-foreground font-display font-bold text-lg">Suas Mesas</p>
                </div>
                <div className="relative">
                  <Bell className="w-5 h-5 text-primary-foreground" />
                  {waiterCalls.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {waiterCalls.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Mesas', value: myTables.length.toString() },
                  { label: 'Pedidos', value: orders.filter(o => !['paid', 'delivered'].includes(o.status)).length.toString() },
                  { label: 'Gorjetas', value: 'R$ 410' },
                ].map((s, i) => (
                  <div key={i} className="bg-primary-foreground/10 rounded-xl p-2.5 text-center">
                    <p className="text-primary-foreground font-display font-bold text-lg">{s.value}</p>
                    <p className="text-primary-foreground/60 text-[10px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-border">
              {[
                { id: 'tables' as const, label: 'Mesas', icon: LayoutGridIcon },
                { id: 'calls' as const, label: 'Chamados', icon: Bell, badge: waiterCalls.length },
                { id: 'tips' as const, label: 'Gorjetas', icon: DollarSign },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setWaiterScreen(tab.id)}
                  className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors relative ${
                    waiterScreen === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                  }`}
                >
                  {tab.label}
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute top-1 right-1/4 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {waiterScreen === 'tables' && myTables.map(table => {
                const tableOrders = orders.filter(o => o.tableNumber === table.number && !['paid'].includes(o.status));
                return (
                  <div key={table.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                          {table.number}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{table.customerName}</p>
                          <p className="text-[10px] text-muted-foreground">{table.seats} lugares</p>
                        </div>
                      </div>
                      {table.orderTotal && <span className="font-display font-bold text-sm text-primary">R$ {table.orderTotal}</span>}
                    </div>
                    {tableOrders.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {tableOrders[0].items.slice(0, 2).map((item, i) => (
                          <p key={i} className="text-[11px] text-muted-foreground">{item.quantity}x {item.menuItem.name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {waiterScreen === 'calls' && (
                waiterCalls.length > 0 ? waiterCalls.map(call => (
                  <div key={call.id} className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
                      <Bell className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{call.message}</p>
                      <p className="text-[10px] text-muted-foreground">{formatTimeAgo(call.timestamp)}</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                      Atender
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum chamado no momento</p>
                  </div>
                )
              )}

              {waiterScreen === 'tips' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-xl p-5 text-center">
                    <p className="text-xs text-muted-foreground">Gorjetas Hoje</p>
                    <p className="font-display text-3xl font-bold text-success mt-1">R$ 410</p>
                    <p className="text-[10px] text-muted-foreground mt-1">+18% vs ontem</p>
                  </div>
                  {[
                    { table: 1, amount: 'R$ 45', time: '30min atrás' },
                    { table: 3, amount: 'R$ 62', time: '1h atrás' },
                    { table: 8, amount: 'R$ 120', time: '1h30 atrás' },
                    { table: 5, amount: 'R$ 85', time: '2h atrás' },
                    { table: 10, amount: 'R$ 98', time: '2h30 atrás' },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-xs font-bold text-success">
                        {tip.table}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-success">{tip.amount}</p>
                        <p className="text-[10px] text-muted-foreground">{tip.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PhoneShell>
      </div>
    </div>
  );
};

// Tiny helper - we can't import LayoutGrid here as it's already used differently
const LayoutGridIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

// ============ MENU EDITOR ============

export const MenuEditorScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { menu } = useDemoContext();
  const categories = [...new Set(menu.map(m => m.category))];
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <GuidedHint text="Gerencie o cardápio completo — categorias, itens, preços, fotos e disponibilidade" />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-lg">Editor de Cardápio</h3>
          <p className="text-sm text-muted-foreground">{menu.length} itens · {categories.length} categorias</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            <Hash className="w-4 h-4" /> Categorias
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-glow">
            <Plus className="w-4 h-4" /> Novo Item
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {cat} ({menu.filter(m => m.category === cat).length})
          </button>
        ))}
      </div>

      {/* Menu items */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {menu.filter(m => m.category === activeCategory).map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-semibold text-sm">{item.name}</h4>
                {item.popular && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold">POPULAR</span>}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
              <div className="flex items-center gap-3 mt-1">
                {item.tags?.map(tag => (
                  <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                ))}
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />{item.prepTime}min
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display font-bold text-sm">R$ {item.price}</p>
              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"
                >
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick edit panel */}
      {editingItem && (() => {
        const item = menu.find(m => m.id === editingItem);
        if (!item) return null;
        return (
          <div className="bg-card rounded-xl border-2 border-primary/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display font-bold">Editando: {item.name}</h4>
              <button onClick={() => setEditingItem(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Nome', value: item.name },
                { label: 'Preço (R$)', value: item.price },
                { label: 'Tempo de preparo (min)', value: item.prepTime },
                { label: 'Categoria', value: item.category },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</label>
                  <div className="mt-1 p-2.5 rounded-lg border border-border bg-muted/30 text-sm">{field.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</label>
              <div className="mt-1 p-2.5 rounded-lg border border-border bg-muted/30 text-sm">{item.description}</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                <Save className="w-4 h-4" /> Salvar
              </button>
              <button onClick={() => setEditingItem(null)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium">Cancelar</button>
            </div>
          </div>
        );
      })()}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="font-display text-3xl font-bold text-primary">{menu.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Itens no cardápio</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="font-display text-3xl font-bold text-secondary">{categories.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Categorias</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="font-display text-3xl font-bold text-accent-foreground">R$ {Math.round(menu.reduce((s, m) => s + m.price, 0) / menu.length)}</p>
          <p className="text-xs text-muted-foreground mt-1">Preço médio</p>
        </div>
      </div>
    </div>
  );
};

// ============ TEAM ============

export const TeamScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const roleColors: Record<string, string> = {
    'Dono': 'bg-primary/10 text-primary',
    'Gerente': 'bg-secondary/10 text-secondary',
    'Chef': 'bg-warning/10 text-warning',
    'Sommelier': 'bg-accent/10 text-accent-foreground',
    'Garçom': 'bg-info/10 text-info',
    'Barman': 'bg-secondary/10 text-secondary',
    'Hostess': 'bg-primary/10 text-primary',
  };

  const roleIcons: Record<string, React.FC<{ className?: string }>> = {
    'Dono': Shield,
    'Gerente': Briefcase,
    'Chef': ChefHat,
    'Sommelier': Wine,
    'Garçom': HandPlatter,
    'Barman': Coffee,
    'Hostess': CalendarDays,
  };

  return (
    <div className="space-y-6">
      <GuidedHint text="Gerencie sua equipe — escalas, funções, permissões e desempenho" />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-lg">Equipe</h3>
          <p className="text-sm text-muted-foreground">{TEAM_MEMBERS.length} membros · {TEAM_MEMBERS.filter(m => m.status === 'online').length} em serviço</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-glow">
          <UserPlus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {/* Today's schedule */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-success">{TEAM_MEMBERS.filter(m => m.status === 'online').length}</p>
          <p className="text-xs text-muted-foreground">Em serviço</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-warning">{TEAM_MEMBERS.filter(m => m.status === 'offline').length}</p>
          <p className="text-xs text-muted-foreground">Folga</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-3xl font-bold text-info">R$ 847</p>
          <p className="text-xs text-muted-foreground">Gorjetas hoje</p>
        </div>
      </div>

      {/* Team list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {TEAM_MEMBERS.map((member, i) => {
          const RoleIcon = roleIcons[member.role] || UtensilsCrossed;
          return (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
              <div className="relative shrink-0">
                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${member.status === 'online' ? 'bg-success' : 'bg-muted-foreground/30'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{member.name}</p>
                <p className="text-[10px] text-muted-foreground">Desde {member.since} · {member.shift}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${roleColors[member.role] || 'bg-muted text-muted-foreground'}`}>
                {member.role}
              </span>
              <span className={`text-xs font-medium ${member.status === 'online' ? 'text-success' : 'text-muted-foreground'}`}>
                {member.status === 'online' ? '● Ativo' : '○ Folga'}
              </span>
              <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Roles & Permissions */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-display font-bold mb-3">Funções & Permissões</h4>
        <div className="space-y-2">
          {[
            { role: 'Dono', perms: 'Acesso total ao sistema', icon: Shield },
            { role: 'Gerente', perms: 'Gestão operacional, equipe, relatórios', icon: Briefcase },
            { role: 'Chef', perms: 'KDS, gestão de cardápio, estoque', icon: ChefHat },
            { role: 'Garçom', perms: 'Pedidos, mesas, atendimento', icon: HandPlatter },
            { role: 'Barman', perms: 'KDS bar, pedidos de bebidas', icon: Wine },
            { role: 'Hostess/Maitre', perms: 'Reservas, fila, mapa de mesas', icon: CalendarDays },
          ].map(({ role, perms, icon: Icon }) => (
            <div key={role} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{role}</p>
                <p className="text-[10px] text-muted-foreground">{perms}</p>
              </div>
              <button className="text-xs text-primary font-medium">Editar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
