/**
 * Restaurant Demo — Maitre + Waiter + Menu Editor + Team Screens
 */
import React, { useState } from 'react';
import {
  Clock, Users, Check, Plus, Star, CalendarDays, Phone, Bell,
  UserPlus, ChefHat, Wine, UtensilsCrossed, Shield, Briefcase,
  MoreHorizontal, Edit3, Trash2, Save, X, Hash, DollarSign,
  MessageSquare, AlertCircle, ArrowRight, Smartphone, MapPin,
  Coffee, HandPlatter, ChevronLeft, BookOpen,
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

// ============ WAITER VIEW (Phone Shell) — Completely Redesigned ============

export const WaiterScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { orders, tables, notifications } = useDemoContext();
  const [waiterScreen, setWaiterScreen] = useState<'tables' | 'calls' | 'payment' | 'actions'>('tables');
  const myTables = tables.filter(t => ['occupied', 'billing'].includes(t.status));
  const waiterCalls = notifications.filter(n => n.type === 'waiter_call' && !n.read);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'method' | 'processing' | 'done'>('select');
  const [selectedPayMethod, setSelectedPayMethod] = useState<string | null>(null);

  const activeOrders = orders.filter(o => !['paid', 'delivered'].includes(o.status));

  return (
    <div className="space-y-6">
      <GuidedHint text="App completo do garçom — mesas, chamados, cobrança TAP to Pay e ações pelo cliente" />

      <div className="flex justify-center">
        <PhoneShell>
          <div className="bg-background min-h-full">
            {/* Waiter App Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-5 pt-2 pb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-primary-foreground/70 text-xs">Olá, Bruno 👋</p>
                  <p className="text-primary-foreground font-display font-bold text-lg">Central do Garçom</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Bell className="w-5 h-5 text-primary-foreground" />
                    {waiterCalls.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {waiterCalls.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Mesas', value: myTables.length.toString(), icon: '🪑' },
                  { label: 'Pedidos', value: activeOrders.length.toString(), icon: '📋' },
                  { label: 'Chamados', value: waiterCalls.length.toString(), icon: '🔔' },
                  { label: 'Gorjetas', value: 'R$ 410', icon: '💰' },
                ].map((s, i) => (
                  <div key={i} className="bg-primary-foreground/10 rounded-xl p-2 text-center">
                    <p className="text-primary-foreground font-display font-bold text-sm">{s.value}</p>
                    <p className="text-primary-foreground/60 text-[9px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab Bar — 4 tabs */}
            <div className="flex border-b border-border">
              {[
                { id: 'tables' as const, label: 'Mesas', icon: LayoutGridIcon, badge: 0 },
                { id: 'calls' as const, label: 'Chamados', icon: Bell, badge: waiterCalls.length },
                { id: 'payment' as const, label: 'Cobrar', icon: Smartphone, badge: 0 },
                { id: 'actions' as const, label: 'Ações', icon: HandPlatter, badge: 0 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setWaiterScreen(tab.id); setSelectedTable(null); setPaymentStep('select'); }}
                  className={`flex-1 py-3 text-[11px] font-semibold border-b-2 transition-colors relative ${
                    waiterScreen === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                  }`}
                >
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="absolute top-1 right-1/4 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* === MESAS TAB === */}
              {waiterScreen === 'tables' && !selectedTable && myTables.map(table => {
                const tableOrders = orders.filter(o => o.tableNumber === table.number && !['paid'].includes(o.status));
                const hasUrgent = waiterCalls.some(c => c.message.includes(`Mesa ${table.number}`));
                return (
                  <button key={table.id} onClick={() => setSelectedTable(table.number)} className={`w-full text-left bg-card rounded-xl border-2 p-4 transition-all ${
                    hasUrgent ? 'border-destructive/40 bg-destructive/5' :
                    table.status === 'billing' ? 'border-warning/40 bg-warning/5' : 'border-border'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold ${
                          hasUrgent ? 'bg-destructive/10 text-destructive animate-pulse' :
                          table.status === 'billing' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                        }`}>
                          {table.number}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{table.customerName}</p>
                          <p className="text-[10px] text-muted-foreground">{table.seats} pessoas · {table.occupiedSince ? `${Math.round((Date.now() - table.occupiedSince.getTime()) / 60000)}min` : '—'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {table.orderTotal && <span className="font-display font-bold text-sm text-primary">R$ {table.orderTotal}</span>}
                        {hasUrgent && <p className="text-[9px] font-bold text-destructive mt-0.5">CHAMADO!</p>}
                        {table.status === 'billing' && <p className="text-[9px] font-bold text-warning mt-0.5">PAGAMENTO</p>}
                      </div>
                    </div>
                    {/* Order items preview */}
                    {tableOrders.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {tableOrders[0].items.slice(0, 3).map((item, i) => (
                          <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{item.quantity}x {item.menuItem.name}</span>
                        ))}
                        {tableOrders[0].items.length > 3 && <span className="text-[10px] text-muted-foreground">+{tableOrders[0].items.length - 3}</span>}
                      </div>
                    )}
                    {/* Payment status indicators */}
                    <div className="mt-2 flex items-center gap-2">
                      {tableOrders.map((o, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            o.status === 'ready' ? 'bg-success' :
                            o.status === 'preparing' ? 'bg-warning animate-pulse' :
                            o.status === 'confirmed' ? 'bg-info' : 'bg-muted-foreground/30'
                          }`} />
                          <span className="text-[9px] text-muted-foreground capitalize">{o.status}</span>
                        </div>
                      ))}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 absolute right-4 top-1/2 -translate-y-1/2" />
                  </button>
                );
              })}

              {/* === TABLE DETAIL === */}
              {waiterScreen === 'tables' && selectedTable && (() => {
                const table = myTables.find(t => t.number === selectedTable);
                const tableOrders = orders.filter(o => o.tableNumber === selectedTable && !['paid'].includes(o.status));
                if (!table) return null;
                return (
                  <div className="space-y-3">
                    <button onClick={() => setSelectedTable(null)} className="flex items-center gap-1 text-xs text-primary font-semibold">
                      <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display text-2xl font-bold">Mesa {table.number}</p>
                          <p className="text-sm text-muted-foreground">{table.customerName} · {table.seats} pessoas</p>
                        </div>
                        <span className="font-display text-xl font-bold text-primary">R$ {table.orderTotal || 0}</span>
                      </div>
                    </div>

                    {/* Guest payment status */}
                    <div className="bg-card rounded-xl border border-border p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Status dos Clientes</p>
                      {[
                        { name: table.customerName || 'Cliente 1', hasApp: true, paid: false, amount: 'R$ 85' },
                        { name: 'Convidado 2', hasApp: true, paid: false, amount: 'R$ 62' },
                        { name: 'Convidado 3', hasApp: false, paid: false, amount: 'R$ 45' },
                      ].map((guest, i) => (
                        <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                          <div className={`w-2 h-2 rounded-full ${guest.hasApp ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                          <span className="text-xs flex-1">{guest.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${guest.hasApp ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {guest.hasApp ? 'App' : 'Sem app'}
                          </span>
                          <span className="text-xs font-semibold">{guest.amount}</span>
                        </div>
                      ))}
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-success to-success/60 rounded-full" style={{ width: '33%' }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">1 de 3 pagaram · 33% da conta</p>
                    </div>

                    {/* Order items */}
                    <div className="bg-card rounded-xl border border-border p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Pedidos</p>
                      {tableOrders.length > 0 ? tableOrders[0].items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                          <span className="text-xs font-semibold text-primary">{item.quantity}x</span>
                          <span className="text-xs flex-1">{item.menuItem.name}</span>
                          <span className="text-xs">R$ {item.menuItem.price * item.quantity}</span>
                        </div>
                      )) : <p className="text-xs text-muted-foreground">Nenhum pedido ativo</p>}
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { setWaiterScreen('payment'); setSelectedTable(selectedTable); }} className="flex items-center gap-2 p-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
                        <Smartphone className="w-4 h-4" /> Cobrar
                      </button>
                      <button className="flex items-center gap-2 p-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold">
                        <Plus className="w-4 h-4" /> Novo pedido
                      </button>
                      <button className="flex items-center gap-2 p-3 rounded-xl border border-border text-xs font-semibold">
                        <Shield className="w-4 h-4" /> Cortesia
                      </button>
                      <button className="flex items-center gap-2 p-3 rounded-xl border border-border text-xs font-semibold">
                        <AlertCircle className="w-4 h-4" /> Chamar gerente
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* === CHAMADOS TAB === */}
              {waiterScreen === 'calls' && (
                <div className="space-y-3">
                  {/* Urgent banner */}
                  {waiterCalls.filter(c => c.type === 'waiter_call').length > 0 && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive animate-pulse">
                      <Bell className="w-4 h-4" />
                      {waiterCalls.length} chamado(s) pendente(s) — atenda agora!
                    </div>
                  )}
                  {[
                    { id: 'wc1', table: 3, type: 'garcom', message: 'Cliente solicitou o garçom', time: '2min', urgent: false, reason: 'Dúvida sobre prato' },
                    { id: 'wc2', table: 8, type: 'gerente', message: 'Solicita falar com gerente', time: '5min', urgent: true, reason: 'Reclamação sobre tempo de espera' },
                    { id: 'wc3', table: 1, type: 'garcom', message: 'Pedido de sobremesa', time: '8min', urgent: false, reason: 'Quer ver cardápio de sobremesas' },
                    { id: 'wc4', table: 5, type: 'ajuda', message: 'Precisa de assistência', time: '1min', urgent: true, reason: 'Acessibilidade — precisa de cadeira especial' },
                  ].map(call => (
                    <div key={call.id} className={`rounded-xl border-2 p-3 ${
                      call.urgent ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold ${
                          call.urgent ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-primary/10 text-primary'
                        }`}>
                          {call.table}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold">{call.message}</p>
                            {call.urgent && <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[8px] font-bold">URGENTE</span>}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{call.reason} · {call.time} atrás</p>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold">
                          Atender
                        </button>
                      </div>
                    </div>
                  ))}
                  {waiterCalls.length === 0 && (
                    <div className="text-center py-10">
                      <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhum chamado no momento</p>
                    </div>
                  )}
                </div>
              )}

              {/* === COBRAR / TAP TO PAY TAB === */}
              {waiterScreen === 'payment' && (
                <div className="space-y-3">
                  {paymentStep === 'select' && (
                    <>
                      <p className="text-xs text-muted-foreground">Selecione a mesa para cobrar:</p>
                      {myTables.map(table => (
                        <button key={table.id} onClick={() => { setSelectedTable(table.number); setPaymentStep('method'); }}
                          className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary">{table.number}</div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{table.customerName}</p>
                            <p className="text-[10px] text-muted-foreground">{table.seats} pessoas</p>
                          </div>
                          <span className="font-display font-bold text-sm">R$ {table.orderTotal || 0}</span>
                        </button>
                      ))}
                    </>
                  )}

                  {paymentStep === 'method' && (
                    <>
                      <button onClick={() => setPaymentStep('select')} className="flex items-center gap-1 text-xs text-primary font-semibold">
                        <ChevronLeft className="w-4 h-4" /> Voltar
                      </button>
                      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 text-center">
                        <p className="text-xs text-muted-foreground">Cobrando Mesa {selectedTable}</p>
                        <p className="font-display text-3xl font-bold text-primary mt-1">R$ {myTables.find(t => t.number === selectedTable)?.orderTotal || 0}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Valor total da conta</p>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Método de Pagamento</p>
                      {[
                        { id: 'tap', label: 'TAP to Pay (NFC)', desc: 'Aproxime o cartão do cliente', icon: '📱', highlight: true },
                        { id: 'pix', label: 'PIX QR Code', desc: 'Gerar código para pagamento instantâneo', icon: '📲', highlight: false },
                        { id: 'card', label: 'Cartão (inserir)', desc: 'Crédito ou débito com chip/senha', icon: '💳', highlight: false },
                        { id: 'cash', label: 'Dinheiro', desc: 'Pagamento em espécie', icon: '💵', highlight: false },
                      ].map(method => (
                        <button key={method.id} onClick={() => { setSelectedPayMethod(method.id); setPaymentStep('processing'); }}
                          className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                            method.highlight ? 'border-primary bg-primary/5 hover:bg-primary/10' : 'border-border bg-card hover:bg-muted/30'
                          }`}>
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <p className="text-sm font-semibold">{method.label}</p>
                            <p className="text-[10px] text-muted-foreground">{method.desc}</p>
                          </div>
                          {method.highlight && <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">RECOMENDADO</span>}
                        </button>
                      ))}
                    </>
                  )}

                  {paymentStep === 'processing' && (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                        {selectedPayMethod === 'tap' && <Smartphone className="w-10 h-10 text-primary" />}
                        {selectedPayMethod === 'pix' && <div className="w-14 h-14 rounded-lg bg-muted border-2 border-foreground/20 flex items-center justify-center text-xs font-bold">QR</div>}
                        {selectedPayMethod === 'card' && <DollarSign className="w-10 h-10 text-primary" />}
                        {selectedPayMethod === 'cash' && <DollarSign className="w-10 h-10 text-primary" />}
                      </div>
                      {selectedPayMethod === 'tap' && (
                        <>
                          <p className="font-display font-bold text-lg">Aproxime o Cartão</p>
                          <p className="text-sm text-muted-foreground">Peça ao cliente para aproximar o cartão na parte traseira do celular</p>
                        </>
                      )}
                      {selectedPayMethod === 'pix' && (
                        <>
                          <p className="font-display font-bold text-lg">QR Code PIX</p>
                          <p className="text-sm text-muted-foreground">Mostre o QR ao cliente para pagamento via PIX</p>
                          <div className="w-32 h-32 mx-auto bg-muted rounded-xl border-4 border-foreground/10 flex items-center justify-center">
                            <div className="grid grid-cols-5 gap-0.5">
                              {Array.from({ length: 25 }).map((_, i) => (
                                <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.4 ? 'bg-foreground' : 'bg-background'}`} />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPayMethod === 'card' && (
                        <>
                          <p className="font-display font-bold text-lg">Insira o Cartão</p>
                          <p className="text-sm text-muted-foreground">Aguardando inserção do cartão com chip...</p>
                        </>
                      )}
                      {selectedPayMethod === 'cash' && (
                        <>
                          <p className="font-display font-bold text-lg">Pagamento em Dinheiro</p>
                          <p className="text-sm text-muted-foreground">Confirme o recebimento do valor</p>
                        </>
                      )}
                      <button onClick={() => setPaymentStep('done')} className="px-6 py-2.5 rounded-xl bg-success text-success-foreground font-semibold text-sm">
                        {selectedPayMethod === 'cash' ? 'Confirmar Recebimento' : 'Simular Aprovação'}
                      </button>
                    </div>
                  )}

                  {paymentStep === 'done' && (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                        <Check className="w-10 h-10 text-success" />
                      </div>
                      <p className="font-display font-bold text-lg text-success">Pagamento Aprovado!</p>
                      <p className="text-sm text-muted-foreground">Mesa {selectedTable} · R$ {myTables.find(t => t.number === selectedTable)?.orderTotal || 0}</p>
                      <div className="flex gap-2 justify-center">
                        <button className="px-4 py-2 rounded-xl border border-border text-xs font-semibold">Enviar Recibo</button>
                        <button onClick={() => { setPaymentStep('select'); setSelectedTable(null); }} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
                          Nova Cobrança
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* === AÇÕES NA MESA TAB === */}
              {waiterScreen === 'actions' && (
                <div className="space-y-3">
                  <div className="bg-muted/30 rounded-xl p-3 border border-border">
                    <p className="text-xs font-semibold">Executar ação pelo cliente</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Quando o cliente tiver dificuldade com o app, você pode executar ações por ele</p>
                  </div>
                  {myTables.map(table => (
                    <div key={table.id} className="bg-card rounded-xl border border-border p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-display font-bold text-primary text-sm">{table.number}</div>
                        <p className="text-sm font-semibold">{table.customerName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: 'Adicionar item', icon: Plus, color: 'text-primary' },
                          { label: 'Ver cardápio', icon: BookOpen, color: 'text-info' },
                          { label: 'Solicitar conta', icon: DollarSign, color: 'text-warning' },
                          { label: 'Chamar gerente', icon: Shield, color: 'text-destructive' },
                          { label: 'Dividir conta', icon: Users, color: 'text-secondary' },
                          { label: 'Transferir mesa', icon: ArrowRight, color: 'text-accent-foreground' },
                        ].map((action, i) => (
                          <button key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 text-left transition-colors">
                            <action.icon className={`w-3.5 h-3.5 ${action.color}`} />
                            <span className="text-[11px] font-medium">{action.label}</span>
                          </button>
                        ))}
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

// Tiny helper
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
