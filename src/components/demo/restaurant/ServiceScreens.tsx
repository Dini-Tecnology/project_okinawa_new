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

// ============ WAITER VIEW (Phone Shell) — Command Center Redesign ============

export type GuestOrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type GuestOrder = { id: string; item: string; qty: number; price: number; status: GuestOrderStatus; sentAt: string };
export type TableGuest = { id: string; name: string; hasApp: boolean; paid: boolean; method?: string; orders: GuestOrder[] };

export const KITCHEN_PIPELINE = [
  { id: 'k1', dish: 'Filé ao Molho de Vinho', qty: 2, table: 5, chef: 'Chef Felipe', status: 'ready' as const, readyAgo: 3, sla: 20, elapsed: 22 },
  { id: 'k2', dish: 'Petit Gâteau', qty: 1, table: 10, chef: 'Cozinheiro Thiago', status: 'ready' as const, readyAgo: 1, sla: 12, elapsed: 11 },
  { id: 'k3', dish: 'Risotto de Cogumelos', qty: 1, table: 3, chef: 'Chef Felipe', status: 'preparing' as const, readyAgo: 0, sla: 25, elapsed: 18 },
  { id: 'k4', dish: 'Salmão Grelhado', qty: 1, table: 8, chef: 'Cozinheiro Ana', status: 'preparing' as const, readyAgo: 0, sla: 22, elapsed: 8 },
  { id: 'k5', dish: 'Tiramisu', qty: 2, table: 1, chef: 'Cozinheiro Thiago', status: 'preparing' as const, readyAgo: 0, sla: 15, elapsed: 5 },
];

export const LIVE_FEED = [
  { id: 'lf1', time: 'agora', table: 5, event: 'Prato pronto para retirar', detail: '2x Filé ao Molho de Vinho — Chef Felipe', type: 'kitchen_ready' as const, urgency: 'critical' as const },
  { id: 'lf2', time: '1min', table: 10, event: 'Sobremesa pronta', detail: '1x Petit Gâteau — Cozinheiro Thiago', type: 'kitchen_ready' as const, urgency: 'critical' as const },
  { id: 'lf3', time: '2min', table: 3, event: 'Cliente chamou o garçom', detail: 'Convidado 3 sem app quer fazer pedido', type: 'call' as const, urgency: 'high' as const },
  { id: 'lf4', time: '3min', table: 8, event: 'Pagamento recebido pelo app', detail: 'Rafael C. pagou R$ 85 via Apple Pay', type: 'payment' as const, urgency: 'info' as const },
  { id: 'lf5', time: '5min', table: 1, event: 'Conta solicitada', detail: '1 convidado sem app precisa de cobrança', type: 'payment_needed' as const, urgency: 'high' as const },
  { id: 'lf6', time: '8min', table: 10, event: 'Cortesia solicitada', detail: 'Aniversário — solicitar Petit Gâteau ao gerente', type: 'approval' as const, urgency: 'medium' as const },
  { id: 'lf7', time: '12min', table: 5, event: 'Novo pedido registrado', detail: '1x Tiramisu + 1x Café Espresso via app', type: 'order' as const, urgency: 'info' as const },
];

// Richer guest data with individual orders
export const TABLE_GUESTS_DATA: Record<number, TableGuest[]> = {
  1: [
    { id: 'g1-1', name: 'Maria S.', hasApp: true, paid: false, orders: [
      { id: 'oi1', item: 'Tartare de Atum', qty: 1, price: 58, status: 'served', sentAt: '18:32' },
      { id: 'oi2', item: 'Risotto de Cogumelos', qty: 1, price: 62, status: 'preparing', sentAt: '19:05' },
    ]},
    { id: 'g1-2', name: 'Paulo R.', hasApp: false, paid: false, orders: [
      { id: 'oi3', item: 'Salmão Grelhado', qty: 1, price: 72, status: 'preparing', sentAt: '19:05' },
    ]},
  ],
  3: [
    { id: 'g3-1', name: 'João', hasApp: true, paid: false, orders: [
      { id: 'oi4', item: 'Costela Braseada', qty: 1, price: 78, status: 'confirmed', sentAt: '19:10' },
      { id: 'oi5', item: 'Vinho Tinto', qty: 1, price: 45, status: 'served', sentAt: '18:50' },
    ]},
    { id: 'g3-2', name: 'Ana', hasApp: true, paid: true, method: 'Apple Pay', orders: [
      { id: 'oi6', item: 'Polvo Grelhado', qty: 1, price: 68, status: 'served', sentAt: '18:50' },
      { id: 'oi7', item: 'Tiramisu', qty: 1, price: 32, status: 'preparing', sentAt: '19:15' },
    ]},
    { id: 'g3-3', name: 'Convidado 3', hasApp: false, paid: false, orders: [] },
  ],
  5: [
    { id: 'g5-1', name: 'Pedro M.', hasApp: true, paid: true, method: 'PIX', orders: [
      { id: 'oi8', item: 'Filé ao Molho de Vinho', qty: 1, price: 89, status: 'ready', sentAt: '18:40' },
      { id: 'oi9', item: 'Café Espresso', qty: 1, price: 12, status: 'served', sentAt: '18:25' },
    ]},
    { id: 'g5-2', name: 'Lucas C.', hasApp: true, paid: false, orders: [
      { id: 'oi10', item: 'Filé ao Molho de Vinho', qty: 1, price: 89, status: 'ready', sentAt: '18:40' },
      { id: 'oi11', item: 'Tiramisu', qty: 1, price: 32, status: 'pending', sentAt: '19:18' },
    ]},
    { id: 'g5-3', name: 'Mariana', hasApp: false, paid: false, orders: [
      { id: 'oi12', item: 'Salmão Grelhado', qty: 1, price: 72, status: 'preparing', sentAt: '18:55' },
    ]},
  ],
  8: [
    { id: 'g8-1', name: 'Rafael C.', hasApp: true, paid: true, method: 'Apple Pay', orders: [
      { id: 'oi13', item: 'Polvo Grelhado', qty: 1, price: 68, status: 'served', sentAt: '18:30' },
    ]},
    { id: 'g8-2', name: 'Fernanda A.', hasApp: true, paid: false, orders: [
      { id: 'oi14', item: 'Costela Braseada', qty: 1, price: 78, status: 'preparing', sentAt: '19:00' },
    ]},
    { id: 'g8-3', name: 'Thiago S.', hasApp: false, paid: false, orders: [
      { id: 'oi15', item: 'Tartare de Atum', qty: 1, price: 58, status: 'confirmed', sentAt: '19:08' },
      { id: 'oi16', item: 'Cerveja Artesanal', qty: 2, price: 24, status: 'served', sentAt: '18:35' },
    ]},
    { id: 'g8-4', name: 'Juliana', hasApp: false, paid: false, orders: [] },
  ],
  10: [
    { id: 'g10-1', name: 'Carlos M.', hasApp: true, paid: false, orders: [
      { id: 'oi17', item: 'Petit Gâteau', qty: 1, price: 38, status: 'ready', sentAt: '19:00' },
      { id: 'oi18', item: 'Café Espresso', qty: 1, price: 12, status: 'served', sentAt: '18:45' },
    ]},
  ],
};

export const getTableGuests = (tableNum: number): TableGuest[] => TABLE_GUESTS_DATA[tableNum] || [];

// Simple menu categories for ordering flow
export const WAITER_MENU = [
  { cat: 'Entradas', items: [
    { id: 'm1', name: 'Tartare de Atum', price: 58, time: '8min' },
    { id: 'm2', name: 'Burrata com Presunto', price: 52, time: '5min' },
    { id: 'm3', name: 'Polvo Grelhado', price: 68, time: '12min' },
    { id: 'm4', name: 'Carpaccio de Wagyu', price: 72, time: '6min' },
  ]},
  { cat: 'Principais', items: [
    { id: 'm5', name: 'Filé ao Molho de Vinho', price: 89, time: '20min' },
    { id: 'm6', name: 'Risotto de Cogumelos', price: 62, time: '25min' },
    { id: 'm7', name: 'Salmão Grelhado', price: 72, time: '18min' },
    { id: 'm8', name: 'Costela Braseada', price: 78, time: '15min' },
  ]},
  { cat: 'Sobremesas', items: [
    { id: 'm9', name: 'Petit Gâteau', price: 38, time: '12min' },
    { id: 'm10', name: 'Tiramisu', price: 32, time: '5min' },
    { id: 'm11', name: 'Crème Brûlée', price: 34, time: '8min' },
  ]},
  { cat: 'Bebidas', items: [
    { id: 'm12', name: 'Café Espresso', price: 12, time: '3min' },
    { id: 'm13', name: 'Vinho Tinto (taça)', price: 45, time: '1min' },
    { id: 'm14', name: 'Cerveja Artesanal', price: 24, time: '1min' },
    { id: 'm15', name: 'Suco Natural', price: 16, time: '5min' },
  ]},
];

export const WaiterScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { orders, tables, notifications, menu } = useDemoContext();
  const [waiterTab, setWaiterTab] = useState<'live' | 'tables' | 'kitchen' | 'charge'>('live');
  const myTables = tables.filter(t => ['occupied', 'billing'].includes(t.status));
  const waiterCalls = notifications.filter(n => n.type === 'waiter_call' && !n.read);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [paymentStep, setPaymentStep] = useState<'guests' | 'method' | 'processing' | 'done'>('guests');
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [handledItems, setHandledItems] = useState<string[]>([]);
  const [pickedUp, setPickedUp] = useState<string[]>([]);

  // Table detail sub-views
  const [tableDetailTab, setTableDetailTab] = useState<'guests' | 'orders' | 'menu' | 'charge'>('guests');
  const [addingGuest, setAddingGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [addedGuests, setAddedGuests] = useState<TableGuest[]>([]);
  const [menuCategory, setMenuCategory] = useState(WAITER_MENU[0].cat);
  const [orderingForGuest, setOrderingForGuest] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Array<{ item: string; qty: number; price: number }>>([]);
  const [sentOrders, setSentOrders] = useState<Array<{ id: string; guest: string; item: string; qty: number; price: number; status: string; sentAt: string }>>([]);
  const [cancelledOrders, setCancelledOrders] = useState<string[]>([]);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [orderSentToast, setOrderSentToast] = useState(false);

  const activeOrders = orders.filter(o => !['paid', 'delivered'].includes(o.status));
  const readyDishes = KITCHEN_PIPELINE.filter(d => d.status === 'ready' && !pickedUp.includes(d.id));
  const activeFeed = LIVE_FEED.filter(f => !handledItems.includes(f.id));

  const getAllGuests = (tableNum: number): TableGuest[] => {
    const base = getTableGuests(tableNum);
    const added = addedGuests.filter(g => g.id.startsWith(`added-${tableNum}-`));
    return [...base, ...added];
  };

  const handleAddGuest = (tableNum: number) => {
    if (!newGuestName.trim()) return;
    const newGuest: TableGuest = {
      id: `added-${tableNum}-${Date.now()}`,
      name: newGuestName.trim(),
      hasApp: false,
      paid: false,
      orders: [],
    };
    setAddedGuests(prev => [...prev, newGuest]);
    setNewGuestName('');
    setAddingGuest(false);
  };

  const handleSendOrder = (tableNum: number, guestId: string) => {
    if (pendingOrder.length === 0) return;
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newSent = pendingOrder.map((item, i) => ({
      id: `sent-${Date.now()}-${i}`,
      guest: guestId,
      item: item.item,
      qty: item.qty,
      price: item.price,
      status: 'pending',
      sentAt: now,
    }));
    setSentOrders(prev => [...prev, ...newSent]);
    setPendingOrder([]);
    setOrderingForGuest(null);
    setTableDetailTab('orders');
    setOrderSentToast(true);
    setTimeout(() => setOrderSentToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      <GuidedHint text="Central de comando do garçom — gestão completa de mesas, pedidos, cardápio e cobrança" />

      <div className="flex justify-center">
        <PhoneShell>
          <div className="bg-background min-h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-primary/90 to-accent px-4 pt-2 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-primary-foreground/60 text-[10px] font-medium">Turno das 18h</p>
                  <p className="text-primary-foreground font-display font-bold text-base">Bruno — Garçom</p>
                </div>
                <div className="flex items-center gap-3">
                  {readyDishes.length > 0 && (
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                        <ChefHat className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center">{readyDishes.length}</span>
                    </div>
                  )}
                  <div className="relative">
                    <Bell className="w-5 h-5 text-primary-foreground" />
                    {waiterCalls.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center animate-pulse">{waiterCalls.length}</span>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Mesas', value: myTables.length.toString(), urgent: false },
                  { label: 'Retirar', value: readyDishes.length.toString(), urgent: readyDishes.length > 0 },
                  { label: 'Chamados', value: (waiterCalls.length || activeFeed.filter(f => f.type === 'call').length).toString(), urgent: waiterCalls.length > 0 },
                  { label: 'Gorjetas', value: 'R$410', urgent: false },
                ].map((s, i) => (
                  <div key={i} className={`rounded-lg p-1.5 text-center ${s.urgent ? 'bg-destructive/20' : 'bg-primary-foreground/10'}`}>
                    <p className={`font-display font-bold text-sm ${s.urgent ? 'text-destructive-foreground' : 'text-primary-foreground'}`}>{s.value}</p>
                    <p className="text-primary-foreground/50 text-[8px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab nav */}
            <div className="flex border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
              {[
                { id: 'live' as const, label: 'Ao Vivo', badge: activeFeed.filter(f => f.urgency !== 'info').length },
                { id: 'tables' as const, label: 'Mesas', badge: 0 },
                { id: 'kitchen' as const, label: 'Cozinha', badge: readyDishes.length },
                { id: 'charge' as const, label: 'Cobrar', badge: 0 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setWaiterTab(tab.id); setSelectedTable(null); setPaymentStep('guests'); setSelectedGuest(null); setTableDetailTab('guests'); }}
                  className={`flex-1 py-2.5 text-[10px] font-semibold border-b-2 transition-all relative ${
                    waiterTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                  }`}
                >
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className={`absolute top-1 right-1/4 w-4 h-4 rounded-full text-[7px] font-bold flex items-center justify-center ${
                      tab.id === 'kitchen' ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-primary text-primary-foreground'
                    }`}>{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Toast */}
            {orderSentToast && (
              <div className="absolute top-32 left-4 right-4 z-50 bg-success text-success-foreground rounded-xl px-4 py-3 flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
                <Check className="w-5 h-5" />
                <div>
                  <p className="text-xs font-bold">Pedido enviado para a cozinha!</p>
                  <p className="text-[9px] opacity-80">O chef recebeu e vai começar a preparar</p>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 space-y-2.5">

                {/* ═══ AO VIVO ═══ */}
                {waiterTab === 'live' && (
                  <>
                    {readyDishes.length > 0 && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                        <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center animate-pulse">
                          <ChefHat className="w-4 h-4 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-bold text-destructive">{readyDishes.length} prato(s) esperando retirada!</p>
                          <p className="text-[9px] text-destructive/70">A cozinha está aguardando</p>
                        </div>
                        <button onClick={() => setWaiterTab('kitchen')} className="px-2.5 py-1 rounded-lg bg-destructive text-destructive-foreground text-[9px] font-bold">Ver</button>
                      </div>
                    )}
                    {activeFeed.map(item => {
                      const config = {
                        kitchen_ready: { icon: ChefHat, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', action: 'Retirar' },
                        call: { icon: Bell, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', action: 'Atender' },
                        payment: { icon: Check, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', action: null },
                        payment_needed: { icon: Smartphone, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', action: 'Cobrar' },
                        approval: { icon: Shield, color: 'text-info', bg: 'bg-info/10', border: 'border-info/20', action: 'Solicitar' },
                        order: { icon: BookOpen, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', action: null },
                      }[item.type];
                      const Icon = config.icon;
                      return (
                        <div key={item.id} className={`rounded-xl border ${config.border} overflow-hidden ${item.urgency === 'critical' ? 'ring-1 ring-destructive/20' : ''}`}>
                          <div className="flex items-start gap-2.5 p-2.5">
                            <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center shrink-0 ${item.urgency === 'critical' ? 'animate-pulse' : ''}`}>
                              <Icon className={`w-4 h-4 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">M{item.table}</span>
                                <span className="text-[9px] text-muted-foreground">{item.time}</span>
                                {item.urgency === 'critical' && <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[7px] font-bold animate-pulse">AGORA</span>}
                              </div>
                              <p className="text-[11px] font-semibold mt-0.5">{item.event}</p>
                              <p className="text-[9px] text-muted-foreground">{item.detail}</p>
                            </div>
                          </div>
                          {config.action && (
                            <button
                              onClick={() => {
                                setHandledItems(prev => [...prev, item.id]);
                                if (item.type === 'payment_needed') { setWaiterTab('charge'); setSelectedTable(item.table); }
                                if (item.type === 'kitchen_ready') { setWaiterTab('kitchen'); }
                                if (item.type === 'call') { setWaiterTab('tables'); setSelectedTable(item.table); }
                              }}
                              className={`w-full py-2 text-[10px] font-bold border-t ${config.border} ${
                                item.urgency === 'critical' ? 'bg-destructive text-destructive-foreground' :
                                item.urgency === 'high' ? `${config.bg} ${config.color}` : `bg-muted/30 ${config.color}`
                              }`}
                            >
                              {config.action} →
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {activeFeed.length === 0 && (
                      <div className="text-center py-12">
                        <Check className="w-10 h-10 text-success/30 mx-auto mb-2" />
                        <p className="font-display font-bold text-success text-sm">Tudo tranquilo!</p>
                        <p className="text-[10px] text-muted-foreground">Nenhuma ação pendente</p>
                      </div>
                    )}
                  </>
                )}

                {/* ═══ MESAS — overview ═══ */}
                {waiterTab === 'tables' && !selectedTable && (
                  <>
                    {myTables.map(table => {
                      const guests = getAllGuests(table.number);
                      const paidCount = guests.filter(g => g.paid).length;
                      const paidPct = guests.length > 0 ? Math.round((paidCount / guests.length) * 100) : 0;
                      const noAppCount = guests.filter(g => !g.hasApp && !g.paid).length;
                      const totalOrders = guests.reduce((a, g) => a + g.orders.length, 0) + sentOrders.filter(s => guests.some(g => g.id === s.guest)).length;
                      const hasReady = KITCHEN_PIPELINE.some(d => d.table === table.number && d.status === 'ready' && !pickedUp.includes(d.id));
                      return (
                        <button key={table.id} onClick={() => { setSelectedTable(table.number); setTableDetailTab('guests'); }} className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all ${
                          hasReady ? 'border-destructive/30 bg-destructive/5' :
                          noAppCount > 0 ? 'border-warning/20 bg-warning/5' :
                          table.status === 'billing' ? 'border-info/30 bg-info/5' : 'border-border bg-card'
                        }`}>
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm ${
                                  hasReady ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-primary/10 text-primary'
                                }`}>{table.number}</div>
                                <div>
                                  <p className="font-semibold text-xs">{table.customerName}</p>
                                  <p className="text-[9px] text-muted-foreground">{guests.length} pessoas · {totalOrders} pedidos</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-display font-bold text-xs text-primary">R$ {table.orderTotal || 0}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {hasReady && <span className="text-[7px] font-bold text-destructive bg-destructive/10 px-1 rounded">PRATO</span>}
                                  {noAppCount > 0 && <span className="text-[7px] font-bold text-warning bg-warning/10 px-1 rounded">{noAppCount} S/APP</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {guests.slice(0, 5).map((g, i) => (
                                <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold ${
                                  g.paid ? 'bg-success/20 text-success' : g.hasApp ? 'bg-info/20 text-info' : 'bg-warning/20 text-warning'
                                }`}>{g.paid ? '✓' : g.hasApp ? '📱' : '!'}</div>
                              ))}
                              {guests.length > 5 && <span className="text-[8px] text-muted-foreground">+{guests.length - 5}</span>}
                              <div className="flex-1 h-1.5 bg-muted rounded-full ml-2 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-success to-success/60 rounded-full" style={{ width: `${paidPct}%` }} />
                              </div>
                              <span className="text-[8px] font-bold text-muted-foreground ml-1">{paidPct}%</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* ═══ TABLE DETAIL — Full Command Center ═══ */}
                {waiterTab === 'tables' && selectedTable && (() => {
                  const table = myTables.find(t => t.number === selectedTable);
                  if (!table) return null;
                  const guests = getAllGuests(selectedTable);
                  const paidCount = guests.filter(g => g.paid).length;
                  const paidPct = guests.length > 0 ? Math.round((paidCount / guests.length) * 100) : 0;
                  const allOrders = [
                    ...guests.flatMap(g => g.orders.map(o => ({ ...o, guestName: g.name, guestId: g.id, hasApp: g.hasApp }))),
                    ...sentOrders.filter(s => guests.some(g => g.id === s.guest)).map(s => ({
                      id: s.id, item: s.item, qty: s.qty, price: s.price, status: s.status,
                      sentAt: s.sentAt, guestName: guests.find(g => g.id === s.guest)?.name || 'Convidado', guestId: s.guest, hasApp: false,
                    })),
                  ].filter(o => !cancelledOrders.includes(o.id));
                  const tableTotal = allOrders.reduce((a, o) => a + o.price * o.qty, 0);

                  return (
                    <div className="space-y-2">
                      {/* Back + Table Header */}
                      <button onClick={() => { setSelectedTable(null); setTableDetailTab('guests'); }} className="flex items-center gap-1 text-[10px] text-primary font-semibold">
                        <ChevronLeft className="w-3 h-3" /> Todas as mesas
                      </button>

                      <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-display text-lg font-bold">Mesa {table.number}</p>
                            <p className="text-[9px] text-muted-foreground">{table.customerName} · {guests.length} pessoas · {table.occupiedSince ? `${Math.round((Date.now() - table.occupiedSince.getTime()) / 60000)}min` : '—'}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-display text-lg font-bold text-primary">R$ {tableTotal}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: `${paidPct}%` }} />
                              </div>
                              <span className="text-[8px] font-bold">{paidPct}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sub-tabs: Guests | Orders | Menu | Charge */}
                      <div className="flex bg-muted/30 rounded-lg p-0.5">
                        {[
                          { id: 'guests' as const, label: 'Pessoas', count: guests.length },
                          { id: 'orders' as const, label: 'Pedidos', count: allOrders.length },
                          { id: 'menu' as const, label: 'Cardápio', count: 0 },
                          { id: 'charge' as const, label: 'Cobrar', count: guests.filter(g => !g.paid).length },
                        ].map(t => (
                          <button key={t.id} onClick={() => setTableDetailTab(t.id)}
                            className={`flex-1 py-1.5 rounded-md text-[9px] font-semibold transition-all relative ${
                              tableDetailTab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                            }`}>
                            {t.label}
                            {t.count > 0 && <span className="ml-0.5 text-[7px] opacity-60">({t.count})</span>}
                          </button>
                        ))}
                      </div>

                      {/* ── PESSOAS TAB ── */}
                      {tableDetailTab === 'guests' && (
                        <div className="space-y-1.5">
                          {guests.map(guest => {
                            const guestOrders = allOrders.filter(o => o.guestId === guest.id);
                            const guestTotal = guestOrders.reduce((a, o) => a + o.price * o.qty, 0);
                            const activeOrderCount = guestOrders.filter(o => o.status !== 'served' && o.status !== 'cancelled').length;
                            return (
                              <div key={guest.id} className={`rounded-xl border p-2.5 ${
                                guest.paid ? 'border-success/20 bg-success/5 opacity-70' :
                                !guest.hasApp ? 'border-warning/20 bg-warning/5' : 'border-border bg-card'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                    guest.paid ? 'bg-success/20 text-success' : guest.hasApp ? 'bg-info/20 text-info' : 'bg-warning/20 text-warning'
                                  }`}>{guest.paid ? '✓' : guest.hasApp ? '📱' : '!'}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-[11px] font-semibold truncate">{guest.name}</p>
                                      <span className={`px-1 py-0.5 rounded text-[7px] font-bold ${guest.hasApp ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                        {guest.hasApp ? 'APP' : 'SEM APP'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[8px] text-muted-foreground">{guestOrders.length} itens</span>
                                      {activeOrderCount > 0 && <span className="text-[8px] text-warning font-medium">{activeOrderCount} em andamento</span>}
                                      {guest.paid && <span className="text-[8px] text-success">Pago via {guest.method}</span>}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-[11px] font-bold">R$ {guestTotal}</p>
                                    <div className="flex gap-1 mt-1">
                                      {!guest.paid && (
                                        <button onClick={() => { setOrderingForGuest(guest.id); setTableDetailTab('menu'); setPendingOrder([]); }}
                                          className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[7px] font-bold">+ Pedir</button>
                                      )}
                                      {!guest.paid && !guest.hasApp && (
                                        <button onClick={() => { setSelectedGuest(guest.name); setTableDetailTab('charge'); }}
                                          className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-[7px] font-bold">Cobrar</button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Add guest */}
                          {addingGuest ? (
                            <div className="rounded-xl border-2 border-dashed border-primary/30 p-3 space-y-2">
                              <p className="text-[10px] font-semibold">Adicionar convidado sem app</p>
                              <input
                                type="text"
                                value={newGuestName}
                                onChange={e => setNewGuestName(e.target.value)}
                                placeholder="Nome do convidado"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button onClick={() => handleAddGuest(selectedTable)} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">Adicionar</button>
                                <button onClick={() => { setAddingGuest(false); setNewGuestName(''); }} className="py-2 px-3 rounded-lg border border-border text-[10px]">Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setAddingGuest(true)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-muted-foreground/20 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
                              <UserPlus className="w-4 h-4" />
                              <span className="text-[10px] font-semibold">Adicionar convidado sem app</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* ── PEDIDOS TAB ── */}
                      {tableDetailTab === 'orders' && (
                        <div className="space-y-2">
                          {/* Status summary */}
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { label: 'Pendente', count: allOrders.filter(o => ['pending', 'confirmed'].includes(o.status)).length, color: 'text-warning', bg: 'bg-warning/10' },
                              { label: 'Preparando', count: allOrders.filter(o => o.status === 'preparing').length, color: 'text-info', bg: 'bg-info/10' },
                              { label: 'Pronto', count: allOrders.filter(o => o.status === 'ready').length, color: 'text-destructive', bg: 'bg-destructive/10' },
                              { label: 'Servido', count: allOrders.filter(o => o.status === 'served').length, color: 'text-success', bg: 'bg-success/10' },
                            ].map((s, i) => (
                              <div key={i} className={`rounded-lg p-1.5 text-center ${s.bg}`}>
                                <p className={`font-bold text-sm ${s.color}`}>{s.count}</p>
                                <p className="text-[7px] text-muted-foreground">{s.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* Order list grouped by status */}
                          {['ready', 'preparing', 'confirmed', 'pending', 'served'].map(status => {
                            const items = allOrders.filter(o => o.status === status);
                            if (items.length === 0) return null;
                            const statusConfig: Record<string, { label: string; color: string; bg: string; dotColor: string }> = {
                              pending: { label: 'ENVIADO — AGUARDANDO', color: 'text-warning', bg: 'bg-warning/10', dotColor: 'bg-warning' },
                              confirmed: { label: 'CONFIRMADO', color: 'text-info', bg: 'bg-info/10', dotColor: 'bg-info' },
                              preparing: { label: 'PREPARANDO', color: 'text-info', bg: 'bg-info/10', dotColor: 'bg-info animate-pulse' },
                              ready: { label: '🔔 PRONTO — RETIRAR', color: 'text-destructive', bg: 'bg-destructive/10', dotColor: 'bg-destructive animate-pulse' },
                              served: { label: 'SERVIDO ✓', color: 'text-success', bg: 'bg-success/10', dotColor: 'bg-success' },
                            };
                            const cfg = statusConfig[status];
                            return (
                              <div key={status} className="space-y-1">
                                <p className={`text-[8px] uppercase tracking-wider font-bold px-1 flex items-center gap-1 ${cfg.color}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} /> {cfg.label}
                                </p>
                                {items.map(order => (
                                  <div key={order.id} className={`rounded-xl border p-2.5 ${
                                    status === 'ready' ? 'border-destructive/30 bg-destructive/5' :
                                    status === 'preparing' ? 'border-info/20 bg-info/5' :
                                    status === 'served' ? 'border-success/20 bg-success/5 opacity-60' : 'border-border bg-card'
                                  }`}>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-semibold">{order.qty}x {order.item}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className={`text-[8px] ${order.hasApp ? 'text-info' : 'text-warning'}`}>
                                            {order.hasApp ? '📱' : '👤'} {order.guestName}
                                          </span>
                                          <span className="text-[8px] text-muted-foreground">· {order.sentAt}</span>
                                        </div>
                                      </div>
                                      <span className="text-[10px] font-bold">R$ {order.price * order.qty}</span>
                                      {/* Actions */}
                                      {status !== 'served' && (
                                        <div className="flex gap-1">
                                          {status === 'ready' && (
                                            <button onClick={() => setPickedUp(prev => [...prev, order.id])}
                                              className="px-2 py-1 rounded-lg bg-destructive text-destructive-foreground text-[8px] font-bold">Servir</button>
                                          )}
                                          {['pending', 'confirmed'].includes(status) && (
                                            <>
                                              <button onClick={() => setEditingOrder(editingOrder === order.id ? null : order.id)}
                                                className="p-1 rounded-lg bg-muted hover:bg-muted/80">
                                                <Edit3 className="w-3 h-3 text-muted-foreground" />
                                              </button>
                                              <button onClick={() => setCancelledOrders(prev => [...prev, order.id])}
                                                className="p-1 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                                                <X className="w-3 h-3 text-destructive" />
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {/* Edit expanded */}
                                    {editingOrder === order.id && (
                                      <div className="mt-2 pt-2 border-t border-border space-y-2">
                                        <div className="flex gap-2">
                                          <button className="flex-1 py-1.5 rounded-lg bg-warning/10 text-warning text-[9px] font-bold">Alterar qtd</button>
                                          <button className="flex-1 py-1.5 rounded-lg bg-info/10 text-info text-[9px] font-bold">Trocar item</button>
                                          <button onClick={() => setCancelledOrders(prev => [...prev, order.id])}
                                            className="flex-1 py-1.5 rounded-lg bg-destructive/10 text-destructive text-[9px] font-bold">Cancelar</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })}

                          {allOrders.length === 0 && (
                            <div className="text-center py-8">
                              <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                              <p className="text-xs text-muted-foreground">Nenhum pedido ainda</p>
                              <button onClick={() => setTableDetailTab('menu')} className="mt-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">Abrir Cardápio</button>
                            </div>
                          )}

                          <button onClick={() => { setTableDetailTab('menu'); setOrderingForGuest(null); }} className="w-full py-2.5 rounded-xl border-2 border-dashed border-primary/20 text-primary text-[10px] font-semibold hover:border-primary/40 transition-colors">
                            + Adicionar mais itens
                          </button>
                        </div>
                      )}

                      {/* ── CARDÁPIO TAB (Ordering) ── */}
                      {tableDetailTab === 'menu' && (
                        <div className="space-y-2">
                          {/* Ordering for */}
                          <div className="rounded-xl bg-info/5 border border-info/20 p-2.5">
                            <p className="text-[9px] text-info font-semibold uppercase tracking-wider">Fazendo pedido para</p>
                            {orderingForGuest ? (
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs font-bold">{guests.find(g => g.id === orderingForGuest)?.name || 'Convidado'}</p>
                                <button onClick={() => setOrderingForGuest(null)} className="text-[8px] text-primary underline">trocar</button>
                              </div>
                            ) : (
                              <div className="flex gap-1 mt-1.5 flex-wrap">
                                {guests.filter(g => !g.paid).map(g => (
                                  <button key={g.id} onClick={() => setOrderingForGuest(g.id)}
                                    className={`px-2 py-1 rounded-lg text-[9px] font-semibold border ${
                                      !g.hasApp ? 'border-warning/30 bg-warning/10 text-warning' : 'border-border bg-card text-foreground'
                                    }`}>
                                    {!g.hasApp ? '👤 ' : '📱 '}{g.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Category pills */}
                          <div className="flex gap-1 overflow-x-auto pb-1">
                            {WAITER_MENU.map(c => (
                              <button key={c.cat} onClick={() => setMenuCategory(c.cat)}
                                className={`px-2.5 py-1 rounded-full text-[9px] font-medium whitespace-nowrap ${
                                  menuCategory === c.cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}>{c.cat}</button>
                            ))}
                          </div>

                          {/* Menu items */}
                          {WAITER_MENU.find(c => c.cat === menuCategory)?.items.map(item => {
                            const inCart = pendingOrder.find(o => o.item === item.name);
                            return (
                              <div key={item.id} className={`rounded-xl border p-2.5 flex items-center gap-2.5 ${
                                inCart ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
                              }`}>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-semibold">{item.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-bold text-primary">R$ {item.price}</span>
                                    <span className="text-[8px] text-muted-foreground">⏱ {item.time}</span>
                                  </div>
                                </div>
                                {inCart ? (
                                  <div className="flex items-center gap-1.5">
                                    <button onClick={() => setPendingOrder(prev => {
                                      const existing = prev.find(o => o.item === item.name);
                                      if (existing && existing.qty <= 1) return prev.filter(o => o.item !== item.name);
                                      return prev.map(o => o.item === item.name ? { ...o, qty: o.qty - 1 } : o);
                                    })} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">−</button>
                                    <span className="text-xs font-bold w-4 text-center">{inCart.qty}</span>
                                    <button onClick={() => setPendingOrder(prev => prev.map(o => o.item === item.name ? { ...o, qty: o.qty + 1 } : o))}
                                      className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">+</button>
                                  </div>
                                ) : (
                                  <button onClick={() => {
                                    if (!orderingForGuest) return;
                                    setPendingOrder(prev => [...prev, { item: item.name, qty: 1, price: item.price }]);
                                  }} disabled={!orderingForGuest}
                                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold ${
                                      orderingForGuest ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'
                                    }`}>
                                    + Adicionar
                                  </button>
                                )}
                              </div>
                            );
                          })}

                          {/* Cart / send button */}
                          {pendingOrder.length > 0 && orderingForGuest && (
                            <div className="sticky bottom-0 bg-background border-t border-border -mx-3 px-3 py-2.5 space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] font-semibold">{pendingOrder.reduce((a, o) => a + o.qty, 0)} itens</p>
                                  <p className="text-[9px] text-muted-foreground">{guests.find(g => g.id === orderingForGuest)?.name}</p>
                                </div>
                                <p className="font-display font-bold text-primary">R$ {pendingOrder.reduce((a, o) => a + o.price * o.qty, 0)}</p>
                              </div>
                              <button onClick={() => handleSendOrder(selectedTable, orderingForGuest)}
                                className="w-full py-3 rounded-xl bg-success text-success-foreground font-bold text-sm flex items-center justify-center gap-2">
                                <ChefHat className="w-4 h-4" /> Enviar para Cozinha
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── COBRAR TAB ── */}
                      {tableDetailTab === 'charge' && (
                        <>
                          {paymentStep === 'guests' && (
                            <div className="space-y-2">
                              <div className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 p-2.5">
                                <p className="text-[10px] font-semibold">Cobrança Mesa {selectedTable}</p>
                                <p className="text-[9px] text-muted-foreground">Quem pagou pelo app aparece automaticamente. Cobre apenas quem precisa.</p>
                              </div>
                              {guests.map(guest => {
                                const guestOrders = allOrders.filter(o => o.guestId === guest.id);
                                const guestTotal = guestOrders.reduce((a, o) => a + o.price * o.qty, 0);
                                return (
                                  <div key={guest.id} className={`rounded-xl border p-2.5 ${
                                    guest.paid ? 'border-success/20 bg-success/5 opacity-60' : !guest.hasApp ? 'border-warning/20 bg-warning/5' : 'border-border bg-card'
                                  }`}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                        guest.paid ? 'bg-success/20 text-success' : guest.hasApp ? 'bg-info/20 text-info' : 'bg-warning/20 text-warning'
                                      }`}>{guest.paid ? '✓' : guest.hasApp ? '📱' : '!'}</div>
                                      <div className="flex-1">
                                        <p className="text-[11px] font-semibold">{guest.name}</p>
                                        <p className="text-[8px] text-muted-foreground">
                                          {guest.paid ? `Pago via ${guest.method} ✓` : guest.hasApp ? 'Pagando pelo app' : 'Sem app — cobrar manualmente'}
                                        </p>
                                      </div>
                                      <span className="text-[11px] font-bold">R$ {guestTotal}</span>
                                      {!guest.paid && !guest.hasApp && (
                                        <button onClick={() => { setSelectedGuest(guest.name); setPaymentStep('method'); }}
                                          className="px-2 py-1 rounded-lg bg-primary text-primary-foreground text-[8px] font-bold">Cobrar</button>
                                      )}
                                      {!guest.paid && guest.hasApp && (
                                        <span className="px-1.5 py-0.5 rounded bg-info/10 text-info text-[8px]">No app</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="rounded-xl border border-border p-2.5 flex items-center justify-between bg-muted/20">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-success rounded-full" style={{ width: `${paidPct}%` }} />
                                  </div>
                                  <span className="text-[9px] text-muted-foreground">{paidCount}/{guests.length} pagos</span>
                                </div>
                                <span className="font-display font-bold text-sm text-primary">Total: R$ {tableTotal}</span>
                              </div>
                            </div>
                          )}

                          {paymentStep === 'method' && (
                            <div className="space-y-2.5">
                              <button onClick={() => { setPaymentStep('guests'); setSelectedGuest(null); }} className="flex items-center gap-1 text-[10px] text-primary font-semibold">
                                <ChevronLeft className="w-3 h-3" /> Voltar
                              </button>
                              <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-4 text-center">
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Mesa {selectedTable} · {selectedGuest}</p>
                                <p className="font-display text-3xl font-bold text-primary mt-1">
                                  R$ {allOrders.filter(o => o.guestName === selectedGuest).reduce((a, o) => a + o.price * o.qty, 0) || Math.round(tableTotal * 0.25)}
                                </p>
                              </div>
                              <div className="space-y-1.5">
                                {[
                                  { id: 'tap', label: 'TAP to Pay (NFC)', desc: 'Encoste o cartão no celular', highlight: true, icon: '📱' },
                                  { id: 'pix', label: 'PIX QR Code', desc: 'Gere o QR e mostre ao cliente', highlight: false, icon: '⚡' },
                                  { id: 'card', label: 'Cartão (Chip/Senha)', desc: 'Maquininha vinculada', highlight: false, icon: '💳' },
                                  { id: 'cash', label: 'Dinheiro', desc: 'Confirme valor recebido', highlight: false, icon: '💵' },
                                ].map(m => (
                                  <button key={m.id} onClick={() => setPaymentStep('processing')}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                      m.highlight ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card'
                                    }`}>
                                    <span className="text-lg">{m.icon}</span>
                                    <div className="text-left flex-1">
                                      <p className="text-xs font-semibold">{m.label}</p>
                                      <p className="text-[9px] text-muted-foreground">{m.desc}</p>
                                    </div>
                                    {m.highlight && <span className="px-1.5 py-0.5 rounded bg-success/10 text-success text-[7px] font-bold">RECOMENDADO</span>}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {paymentStep === 'processing' && (
                            <div className="text-center py-6 space-y-4">
                              <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                                <div className="absolute inset-2 rounded-full border-4 border-primary/30 animate-pulse" />
                                <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Smartphone className="w-8 h-8 text-primary" />
                                </div>
                              </div>
                              <div>
                                <p className="font-display font-bold text-sm">Aproxime o cartão</p>
                                <p className="text-[9px] text-muted-foreground mt-1">Peça ao cliente encostar o cartão no celular</p>
                              </div>
                              <div className="flex items-center gap-2 justify-center text-[9px] text-primary">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> Aguardando...
                              </div>
                              <div className="space-y-2 pt-2">
                                <button onClick={() => setPaymentStep('done')} className="w-full py-3 rounded-xl bg-success text-success-foreground font-semibold text-sm">
                                  Confirmar Pagamento
                                </button>
                                <button onClick={() => setPaymentStep('method')} className="w-full py-2 rounded-xl border border-border text-xs text-muted-foreground">
                                  Trocar método
                                </button>
                              </div>
                            </div>
                          )}

                          {paymentStep === 'done' && (
                            <div className="text-center py-8 space-y-3">
                              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                                <Check className="w-7 h-7 text-success" />
                              </div>
                              <p className="font-display font-bold text-success">Pagamento confirmado!</p>
                              <p className="text-[9px] text-muted-foreground">Mesa {selectedTable} · {selectedGuest}</p>
                              <p className="text-[9px] text-muted-foreground">Recibo enviado automaticamente</p>
                              <div className="flex gap-2 justify-center pt-2">
                                <button className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-semibold">Imprimir</button>
                                <button onClick={() => { setPaymentStep('guests'); setSelectedGuest(null); }}
                                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold">Próximo →</button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* ═══ COZINHA ═══ */}
                {waiterTab === 'kitchen' && (
                  <>
                    {readyDishes.length > 0 && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 animate-pulse">
                        <ChefHat className="w-5 h-5 text-destructive" />
                        <div>
                          <p className="text-[11px] font-bold text-destructive">{readyDishes.length} prato(s) para retirar agora!</p>
                          <p className="text-[9px] text-destructive/70">Tempo é qualidade — retire e sirva</p>
                        </div>
                      </div>
                    )}
                    {readyDishes.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] uppercase tracking-wider text-destructive font-bold px-1 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" /> PRONTO — RETIRAR
                        </p>
                        {readyDishes.map(dish => (
                          <div key={dish.id} className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center font-display font-bold text-sm text-destructive">{dish.table}</div>
                              <div className="flex-1">
                                <p className="text-xs font-bold">{dish.qty}x {dish.dish}</p>
                                <p className="text-[9px] text-muted-foreground">{dish.chef} · pronto há {dish.readyAgo}min</p>
                              </div>
                              <button onClick={() => setPickedUp(prev => [...prev, dish.id])}
                                className="px-3 py-2 rounded-xl bg-destructive text-destructive-foreground text-[10px] font-bold shadow-lg">
                                Retirar ✓
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase tracking-wider text-warning font-bold px-1 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" /> PREPARANDO
                      </p>
                      {KITCHEN_PIPELINE.filter(d => d.status === 'preparing').map(dish => (
                        <div key={dish.id} className="rounded-xl border border-border bg-card p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center font-display font-bold text-sm text-warning">{dish.table}</div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold">{dish.qty}x {dish.dish}</p>
                              <p className="text-[9px] text-muted-foreground">{dish.chef}</p>
                            </div>
                            <div className="w-14 text-right">
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${Math.min((dish.elapsed / dish.sla) * 100, 100)}%` }} />
                              </div>
                              <p className={`text-[8px] font-bold mt-0.5 ${dish.elapsed > dish.sla ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {dish.elapsed > dish.sla ? `+${dish.elapsed - dish.sla}min` : `${dish.sla - dish.elapsed}min`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {pickedUp.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] uppercase tracking-wider text-success font-bold px-1">✓ SERVIDO</p>
                        {KITCHEN_PIPELINE.filter(d => pickedUp.includes(d.id)).map(dish => (
                          <div key={dish.id} className="rounded-xl border border-success/20 bg-success/5 p-2.5 opacity-60">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success text-xs font-bold">{dish.table}</div>
                              <p className="text-[11px] text-muted-foreground">{dish.qty}x {dish.dish}</p>
                              <Check className="w-4 h-4 text-success ml-auto" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ═══ COBRAR (global) ═══ */}
                {waiterTab === 'charge' && (
                  <>
                    {paymentStep === 'guests' && (
                      <>
                        <div className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 p-3">
                          <p className="text-[11px] font-semibold">Cobrança inteligente</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">Quem pagou pelo app aparece automaticamente. Cobre apenas quem precisa do garçom.</p>
                        </div>
                        {myTables.map(table => {
                          const guests = getAllGuests(table.number);
                          const paidCount = guests.filter(g => g.paid).length;
                          const needsWaiter = guests.filter(g => !g.paid && !g.hasApp);
                          const waitingApp = guests.filter(g => !g.paid && g.hasApp);
                          return (
                            <div key={table.id} className="rounded-xl border border-border bg-card overflow-hidden">
                              <div className="flex items-center gap-2.5 p-2.5 bg-muted/20 border-b border-border">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center font-display font-bold text-primary text-sm">{table.number}</div>
                                <div className="flex-1">
                                  <p className="text-xs font-semibold">{table.customerName}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] text-success font-medium">{paidCount} pago</span>
                                    {waitingApp.length > 0 && <span className="text-[9px] text-info">· {waitingApp.length} no app</span>}
                                    {needsWaiter.length > 0 && <span className="text-[9px] text-warning font-bold">· {needsWaiter.length} sem app</span>}
                                  </div>
                                </div>
                                <div className="relative w-10 h-10">
                                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--success))" strokeWidth="3" strokeDasharray={`${(paidCount / guests.length) * 94} 94`} strokeLinecap="round" />
                                  </svg>
                                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">{paidCount}/{guests.length}</span>
                                </div>
                              </div>
                              <div className="p-2 space-y-1">
                                {guests.map((guest, i) => (
                                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${
                                    guest.paid ? 'opacity-40' : !guest.hasApp ? 'bg-warning/5 border border-warning/15' : ''
                                  }`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold ${
                                      guest.paid ? 'bg-success/20 text-success' : guest.hasApp ? 'bg-info/20 text-info' : 'bg-warning/20 text-warning'
                                    }`}>{guest.paid ? '✓' : guest.hasApp ? '📱' : '!'}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-medium truncate">{guest.name}</p>
                                      <p className="text-[8px] text-muted-foreground">{guest.paid ? `Pago via ${guest.method}` : guest.hasApp ? 'Pagando pelo app' : 'Precisa do garçom'}</p>
                                    </div>
                                    <span className="text-[10px] font-semibold">R$ {guest.orders.reduce((a: number, o: { price: number; qty: number }) => a + o.price * o.qty, 0)}</span>
                                    {!guest.paid && !guest.hasApp && (
                                      <button onClick={() => { setSelectedTable(table.number); setSelectedGuest(guest.name); setPaymentStep('method'); }}
                                        className="px-2 py-1 rounded-lg bg-primary text-primary-foreground text-[8px] font-bold">Cobrar</button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {paymentStep === 'method' && (
                      <div className="space-y-3">
                        <button onClick={() => { setPaymentStep('guests'); setSelectedGuest(null); }} className="flex items-center gap-1 text-[10px] text-primary font-semibold">
                          <ChevronLeft className="w-3 h-3" /> Voltar
                        </button>
                        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-4 text-center">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Mesa {selectedTable} · {selectedGuest || 'Convidado'}</p>
                          <p className="font-display text-3xl font-bold text-primary mt-1">R$ {Math.round((myTables.find(t => t.number === selectedTable)?.orderTotal || 0) * 0.25)}</p>
                        </div>
                        <div className="space-y-1.5">
                          {[
                            { id: 'tap', label: 'TAP to Pay (NFC)', desc: 'Encoste o cartão no celular', highlight: true, icon: '📱' },
                            { id: 'pix', label: 'PIX QR Code', desc: 'Gere o QR e mostre ao cliente', highlight: false, icon: '⚡' },
                            { id: 'card', label: 'Cartão (Chip/Senha)', desc: 'Maquininha vinculada', highlight: false, icon: '💳' },
                            { id: 'cash', label: 'Dinheiro', desc: 'Confirme valor recebido', highlight: false, icon: '💵' },
                          ].map(m => (
                            <button key={m.id} onClick={() => setPaymentStep('processing')}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                m.highlight ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card'
                              }`}>
                              <span className="text-lg">{m.icon}</span>
                              <div className="text-left flex-1">
                                <p className="text-xs font-semibold">{m.label}</p>
                                <p className="text-[9px] text-muted-foreground">{m.desc}</p>
                              </div>
                              {m.highlight && <span className="px-1.5 py-0.5 rounded bg-success/10 text-success text-[7px] font-bold">RECOMENDADO</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {paymentStep === 'processing' && (
                      <div className="text-center py-8 space-y-4">
                        <div className="relative w-28 h-28 mx-auto">
                          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                          <div className="absolute inset-2 rounded-full border-4 border-primary/30 animate-pulse" />
                          <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <Smartphone className="w-10 h-10 text-primary" />
                          </div>
                        </div>
                        <div>
                          <p className="font-display font-bold text-base">Aproxime o cartão</p>
                          <p className="text-[10px] text-muted-foreground mt-1">Peça ao cliente encostar o cartão no celular</p>
                        </div>
                        <div className="flex items-center gap-2 justify-center text-[10px] text-primary">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> Aguardando...
                        </div>
                        <div className="space-y-2 pt-2">
                          <button onClick={() => setPaymentStep('done')} className="w-full py-3 rounded-xl bg-success text-success-foreground font-semibold text-sm">
                            Confirmar Pagamento
                          </button>
                          <button onClick={() => setPaymentStep('method')} className="w-full py-2 rounded-xl border border-border text-xs text-muted-foreground">
                            Trocar método
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentStep === 'done' && (
                      <div className="text-center py-10 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                          <Check className="w-8 h-8 text-success" />
                        </div>
                        <p className="font-display font-bold text-success">Pagamento confirmado!</p>
                        <p className="text-[10px] text-muted-foreground">Mesa {selectedTable} · {selectedGuest || 'Convidado'}</p>
                        <p className="text-[10px] text-muted-foreground">Recibo enviado automaticamente</p>
                        <div className="flex gap-2 justify-center pt-2">
                          <button className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-semibold">Imprimir recibo</button>
                          <button onClick={() => { setPaymentStep('guests'); setSelectedGuest(null); setSelectedTable(null); }}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold">Próximo →</button>
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>
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
