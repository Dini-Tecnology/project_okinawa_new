import React, { useMemo, useState } from 'react';
import { BookOpen, Check, CheckCircle2, ChevronLeft, Edit3, Smartphone, UserPlus, X } from 'lucide-react';
import { useDemoContext } from '@/contexts/DemoContext';
import { KITCHEN_PIPELINE, WAITER_MENU, getTableGuests, type TableGuest } from './ServiceScreens';

type TableDetailTab = 'guests' | 'orders' | 'menu' | 'charge';
type PaymentStep = 'guests' | 'method' | 'processing' | 'done';

type PendingOrder = { item: string; qty: number; price: number };
type SentOrder = { id: string; guest: string; item: string; qty: number; price: number; status: string; sentAt: string };

type OrderView = {
  id: string;
  item: string;
  qty: number;
  price: number;
  status: string;
  sentAt: string;
  guestName: string;
  guestId: string;
  hasApp: boolean;
};

export const WaiterTablesActions: React.FC = () => {
  const { tables } = useDemoContext();
  const myTables = useMemo(() => tables.filter((t) => ['occupied', 'billing'].includes(t.status)), [tables]);

  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [tableDetailTab, setTableDetailTab] = useState<TableDetailTab>('guests');
  const [addingGuest, setAddingGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [addedGuests, setAddedGuests] = useState<TableGuest[]>([]);
  const [menuCategory, setMenuCategory] = useState(WAITER_MENU[0].cat);
  const [orderingForGuest, setOrderingForGuest] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder[]>([]);
  const [sentOrders, setSentOrders] = useState<SentOrder[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<string[]>([]);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [orderSentToast, setOrderSentToast] = useState(false);
  const [servedOrders, setServedOrders] = useState<string[]>([]);

  const [paymentStep, setPaymentStep] = useState<PaymentStep>('guests');
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

  const getAllGuests = (tableNum: number): TableGuest[] => {
    const base = getTableGuests(tableNum);
    const added = addedGuests.filter((g) => g.id.startsWith(`added-${tableNum}-`));
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

    setAddedGuests((prev) => [...prev, newGuest]);
    setNewGuestName('');
    setAddingGuest(false);
  };

  const handleSendOrder = (guestId: string) => {
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

    setSentOrders((prev) => [...prev, ...newSent]);
    setPendingOrder([]);
    setOrderingForGuest(null);
    setTableDetailTab('orders');
    setOrderSentToast(true);
    setTimeout(() => setOrderSentToast(false), 2500);
  };

  if (myTables.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Nenhuma mesa ocupada para gestão no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 relative">
      {orderSentToast && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-success text-success-foreground rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <div>
            <p className="text-[11px] font-bold">Pedido enviado para a cozinha!</p>
            <p className="text-[10px] opacity-80">O chef recebeu e vai começar a preparar</p>
          </div>
        </div>
      )}

      {!selectedTable && (
        <div className="space-y-2">
          {myTables.map((table) => {
            const guests = getAllGuests(table.number);
            const paidCount = guests.filter((g) => g.paid).length;
            const paidPct = guests.length > 0 ? Math.round((paidCount / guests.length) * 100) : 0;
            const noAppCount = guests.filter((g) => !g.hasApp && !g.paid).length;
            const totalOrders =
              guests.reduce((a, g) => a + g.orders.length, 0) +
              sentOrders.filter((s) => guests.some((g) => g.id === s.guest)).length;
            const hasReady = KITCHEN_PIPELINE.some((d) => d.table === table.number && d.status === 'ready');

            return (
              <button
                key={table.id}
                onClick={() => {
                  setSelectedTable(table.number);
                  setTableDetailTab('guests');
                  setPaymentStep('guests');
                  setSelectedGuest(null);
                }}
                className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all ${
                  hasReady
                    ? 'border-destructive/30 bg-destructive/5'
                    : noAppCount > 0
                      ? 'border-warning/20 bg-warning/5'
                      : table.status === 'billing'
                        ? 'border-info/30 bg-info/5'
                        : 'border-border bg-card'
                }`}
              >
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-display font-bold">
                        {table.number}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{table.customerName}</p>
                        <p className="text-xs text-muted-foreground">{guests.length} pessoas · {totalOrders} pedidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-sm text-primary">R$ {table.orderTotal || 0}</span>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        {hasReady && <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 rounded">PRATO</span>}
                        {noAppCount > 0 && <span className="text-[10px] font-bold text-warning bg-warning/10 px-1.5 rounded">{noAppCount} S/APP</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {guests.slice(0, 6).map((g) => (
                      <div
                        key={g.id}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          g.paid ? 'bg-success/20 text-success' : g.hasApp ? 'bg-info/20 text-info' : 'bg-warning/20 text-warning'
                        }`}
                      >
                        {g.paid ? '✓' : g.hasApp ? '📱' : '!'}
                      </div>
                    ))}
                    <div className="flex-1 h-1.5 bg-muted rounded-full ml-1 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-success to-success/60 rounded-full" style={{ width: `${paidPct}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground ml-1">{paidPct}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedTable && (() => {
        const table = myTables.find((t) => t.number === selectedTable);
        if (!table) return null;

        const guests = getAllGuests(selectedTable);
        const paidCount = guests.filter((g) => g.paid).length;
        const paidPct = guests.length > 0 ? Math.round((paidCount / guests.length) * 100) : 0;

        const allOrders: OrderView[] = [
          ...guests.flatMap((g) =>
            g.orders.map((o) => ({
              ...o,
              status: servedOrders.includes(o.id) ? 'served' : o.status,
              guestName: g.name,
              guestId: g.id,
              hasApp: g.hasApp,
            })),
          ),
          ...sentOrders
            .filter((s) => guests.some((g) => g.id === s.guest))
            .map((s) => ({
              id: s.id,
              item: s.item,
              qty: s.qty,
              price: s.price,
              status: servedOrders.includes(s.id) ? 'served' : s.status,
              sentAt: s.sentAt,
              guestName: guests.find((g) => g.id === s.guest)?.name || 'Convidado',
              guestId: s.guest,
              hasApp: false,
            })),
        ].filter((o) => !cancelledOrders.includes(o.id));

        const tableTotal = allOrders.reduce((a, o) => a + o.price * o.qty, 0);

        return (
          <div className="space-y-2">
            <button
              onClick={() => {
                setSelectedTable(null);
                setTableDetailTab('guests');
                setAddingGuest(false);
                setOrderingForGuest(null);
              }}
              className="flex items-center gap-1 text-xs text-primary font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Todas as mesas
            </button>

            <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-bold">Mesa {table.number}</p>
                  <p className="text-xs text-muted-foreground">{table.customerName} · {guests.length} pessoas</p>
                </div>
                <div className="text-right">
                  <span className="font-display font-bold text-primary text-sm">R$ {tableTotal}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: `${paidPct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold">{paidPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex bg-muted/30 rounded-lg p-0.5">
              {[
                { id: 'guests' as const, label: 'Pessoas', count: guests.length },
                { id: 'orders' as const, label: 'Pedidos', count: allOrders.length },
                { id: 'menu' as const, label: 'Cardápio', count: 0 },
                { id: 'charge' as const, label: 'Cobrar', count: guests.filter((g) => !g.paid).length },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTableDetailTab(t.id)}
                  className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    tableDetailTab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {t.label}
                  {t.count > 0 && <span className="ml-1 text-[9px] opacity-60">({t.count})</span>}
                </button>
              ))}
            </div>

            {tableDetailTab === 'guests' && (
              <div className="space-y-1.5">
                {guests.map((guest) => {
                  const guestOrders = allOrders.filter((o) => o.guestId === guest.id);
                  const guestTotal = guestOrders.reduce((a, o) => a + o.price * o.qty, 0);

                  return (
                    <div
                      key={guest.id}
                      className={`rounded-xl border p-2.5 ${
                        guest.paid ? 'border-success/20 bg-success/5 opacity-70' : !guest.hasApp ? 'border-warning/20 bg-warning/5' : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${
                            guest.paid ? 'bg-success/20 text-success' : guest.hasApp ? 'bg-info/20 text-info' : 'bg-warning/20 text-warning'
                          }`}
                        >
                          {guest.paid ? '✓' : guest.hasApp ? '📱' : '!'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold truncate">{guest.name}</p>
                            <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${guest.hasApp ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                              {guest.hasApp ? 'APP' : 'SEM APP'}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{guestOrders.length} itens{guest.paid ? ` · Pago via ${guest.method}` : ''}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold">R$ {guestTotal}</p>
                          <div className="flex gap-1 mt-1">
                            {!guest.paid && (
                              <button
                                onClick={() => {
                                  setOrderingForGuest(guest.id);
                                  setTableDetailTab('menu');
                                  setPendingOrder([]);
                                }}
                                className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-bold"
                              >
                                + Pedir
                              </button>
                            )}
                            {!guest.paid && !guest.hasApp && (
                              <button
                                onClick={() => {
                                  setSelectedGuest(guest.name);
                                  setTableDetailTab('charge');
                                }}
                                className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-[10px] font-bold"
                              >
                                Cobrar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {addingGuest ? (
                  <div className="rounded-xl border-2 border-dashed border-primary/30 p-2.5 space-y-2">
                    <p className="text-xs font-semibold">Adicionar convidado sem app</p>
                    <input
                      type="text"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      placeholder="Nome do convidado"
                      className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleAddGuest(selectedTable)} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                        Adicionar
                      </button>
                      <button
                        onClick={() => {
                          setAddingGuest(false);
                          setNewGuestName('');
                        }}
                        className="py-2 px-3 rounded-lg border border-border text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingGuest(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-muted-foreground/20 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="text-xs font-semibold">Adicionar convidado sem app</span>
                  </button>
                )}
              </div>
            )}

            {tableDetailTab === 'orders' && (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Pendente', count: allOrders.filter((o) => ['pending', 'confirmed'].includes(o.status)).length, color: 'text-warning', bg: 'bg-warning/10' },
                    { label: 'Preparando', count: allOrders.filter((o) => o.status === 'preparing').length, color: 'text-info', bg: 'bg-info/10' },
                    { label: 'Pronto', count: allOrders.filter((o) => o.status === 'ready').length, color: 'text-destructive', bg: 'bg-destructive/10' },
                    { label: 'Servido', count: allOrders.filter((o) => o.status === 'served').length, color: 'text-success', bg: 'bg-success/10' },
                  ].map((s, i) => (
                    <div key={i} className={`rounded-lg p-1.5 text-center ${s.bg}`}>
                      <p className={`font-bold text-sm ${s.color}`}>{s.count}</p>
                      <p className="text-[9px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {(['ready', 'preparing', 'confirmed', 'pending', 'served'] as const).map((status) => {
                  const items = allOrders.filter((o) => o.status === status);
                  if (items.length === 0) return null;

                  const cfg = {
                    pending: { label: 'ENVIADO', color: 'text-warning', dotColor: 'bg-warning' },
                    confirmed: { label: 'CONFIRMADO', color: 'text-info', dotColor: 'bg-info' },
                    preparing: { label: 'PREPARANDO', color: 'text-info', dotColor: 'bg-info animate-pulse' },
                    ready: { label: '🔔 PRONTO', color: 'text-destructive', dotColor: 'bg-destructive animate-pulse' },
                    served: { label: '✓ SERVIDO', color: 'text-success', dotColor: 'bg-success' },
                  }[status];

                  return (
                    <div key={status} className="space-y-1">
                      <p className={`text-[10px] uppercase tracking-wider font-bold px-1 flex items-center gap-1 ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} /> {cfg.label}
                      </p>
                      {items.map((order) => (
                        <div
                          key={order.id}
                          className={`rounded-xl border p-2.5 ${
                            status === 'ready'
                              ? 'border-destructive/30 bg-destructive/5'
                              : status === 'served'
                                ? 'border-success/20 bg-success/5 opacity-60'
                                : 'border-border bg-card'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold">{order.qty}x {order.item}</p>
                              <span className={`text-[11px] ${order.hasApp ? 'text-info' : 'text-warning'}`}>
                                {order.hasApp ? '📱' : '👤'} {order.guestName}
                              </span>
                            </div>
                            <span className="text-xs font-bold">R$ {order.price * order.qty}</span>
                            {status !== 'served' && (
                              <div className="flex gap-1">
                                {status === 'ready' && (
                                  <button
                                    onClick={() => setServedOrders((prev) => [...prev, order.id])}
                                    className="px-2 py-1 rounded-lg bg-destructive text-destructive-foreground text-[10px] font-bold"
                                  >
                                    Servir
                                  </button>
                                )}
                                {['pending', 'confirmed'].includes(status) && (
                                  <>
                                    <button onClick={() => setEditingOrder(editingOrder === order.id ? null : order.id)} className="p-1.5 rounded-lg bg-muted">
                                      <Edit3 className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                    <button onClick={() => setCancelledOrders((prev) => [...prev, order.id])} className="p-1.5 rounded-lg bg-destructive/10">
                                      <X className="w-3 h-3 text-destructive" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {editingOrder === order.id && (
                            <div className="mt-2 pt-2 border-t border-border flex gap-1">
                              <button className="flex-1 py-1.5 rounded-lg bg-warning/10 text-warning text-[10px] font-bold">Alterar qtd</button>
                              <button className="flex-1 py-1.5 rounded-lg bg-info/10 text-info text-[10px] font-bold">Trocar item</button>
                              <button onClick={() => setCancelledOrders((prev) => [...prev, order.id])} className="flex-1 py-1.5 rounded-lg bg-destructive/10 text-destructive text-[10px] font-bold">Cancelar</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}

                {allOrders.length === 0 && (
                  <div className="text-center py-6">
                    <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Nenhum pedido ainda</p>
                    <button onClick={() => setTableDetailTab('menu')} className="mt-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                      Abrir Cardápio
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    setTableDetailTab('menu');
                    setOrderingForGuest(null);
                  }}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-primary/20 text-primary text-xs font-semibold"
                >
                  + Adicionar mais itens
                </button>
              </div>
            )}

            {tableDetailTab === 'menu' && (
              <div className="space-y-2">
                <div className="rounded-xl bg-info/5 border border-info/20 p-2.5">
                  <p className="text-[10px] text-info font-semibold uppercase tracking-wider">Fazendo pedido para</p>
                  {orderingForGuest ? (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs font-bold">{guests.find((g) => g.id === orderingForGuest)?.name || 'Convidado'}</p>
                      <button onClick={() => setOrderingForGuest(null)} className="text-[10px] text-primary underline">trocar</button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {guests
                        .filter((g) => !g.paid)
                        .map((g) => (
                          <button
                            key={g.id}
                            onClick={() => setOrderingForGuest(g.id)}
                            className={`px-2 py-1 rounded-lg border text-[10px] font-semibold ${
                              !g.hasApp ? 'border-warning/30 bg-warning/5 text-warning' : 'border-border bg-card text-foreground'
                            }`}
                          >
                            {!g.hasApp ? '👤' : '📱'} {g.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {orderingForGuest && (
                  <>
                    <div className="flex gap-1 overflow-x-auto pb-1">
                      {WAITER_MENU.map((c) => (
                        <button
                          key={c.cat}
                          onClick={() => setMenuCategory(c.cat)}
                          className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            menuCategory === c.cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {c.cat}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      {WAITER_MENU.find((c) => c.cat === menuCategory)?.items.map((item) => {
                        const inCart = pendingOrder.find((p) => p.item === item.name);
                        return (
                          <div key={item.id} className={`flex items-center gap-2 p-2.5 rounded-xl border ${inCart ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground">R$ {item.price} · {item.time}</p>
                            </div>
                            {inCart ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    setPendingOrder((prev) => {
                                      const idx = prev.findIndex((p) => p.item === item.name);
                                      if (idx === -1) return prev;
                                      if (prev[idx].qty <= 1) return prev.filter((_, i) => i !== idx);
                                      return prev.map((p, i) => (i === idx ? { ...p, qty: p.qty - 1 } : p));
                                    })
                                  }
                                  className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold w-4 text-center">{inCart.qty}</span>
                                <button
                                  onClick={() => setPendingOrder((prev) => prev.map((p) => (p.item === item.name ? { ...p, qty: p.qty + 1 } : p)))}
                                  className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setPendingOrder((prev) => [...prev, { item: item.name, qty: 1, price: item.price }])}
                                className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold"
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {pendingOrder.length > 0 && (
                      <div className="rounded-xl border-2 border-primary bg-primary/5 p-2.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold">{pendingOrder.reduce((a, p) => a + p.qty, 0)} itens</p>
                          <p className="text-sm font-bold text-primary">R$ {pendingOrder.reduce((a, p) => a + p.price * p.qty, 0)}</p>
                        </div>
                        <button onClick={() => handleSendOrder(orderingForGuest)} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                          🔥 Enviar para Cozinha
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {tableDetailTab === 'charge' && (
              <>
                {paymentStep === 'guests' && (
                  <div className="space-y-1.5">
                    {guests.map((guest) => {
                      const guestOrders = allOrders.filter((o) => o.guestId === guest.id);
                      const guestTotal = guestOrders.reduce((a, o) => a + o.price * o.qty, 0);

                      return (
                        <div
                          key={guest.id}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                            guest.paid ? 'border-success/20 bg-success/5 opacity-50' : !guest.hasApp ? 'border-warning/20 bg-warning/5' : 'border-border bg-card'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${
                              guest.paid ? 'bg-success/20 text-success' : guest.hasApp ? 'bg-info/20 text-info' : 'bg-warning/20 text-warning'
                            }`}
                          >
                            {guest.paid ? '✓' : guest.hasApp ? '📱' : '!'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{guest.name}</p>
                            <p className="text-[10px] text-muted-foreground">{guest.paid ? `Pago via ${guest.method}` : guest.hasApp ? 'Pagando pelo app' : 'Precisa do garçom'}</p>
                          </div>
                          <span className="text-xs font-bold">R$ {guestTotal}</span>
                          {!guest.paid && !guest.hasApp && (
                            <button
                              onClick={() => {
                                setSelectedGuest(guest.name);
                                setPaymentStep('method');
                              }}
                              className="px-2 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold"
                            >
                              Cobrar
                            </button>
                          )}
                        </div>
                      );
                    })}

                    <div className="rounded-xl border border-border p-2.5 flex items-center justify-between bg-muted/20">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${paidPct}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{paidCount}/{guests.length} pagos</span>
                      </div>
                      <span className="font-display font-bold text-xs text-primary">Total: R$ {tableTotal}</span>
                    </div>
                  </div>
                )}

                {paymentStep === 'method' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setPaymentStep('guests');
                        setSelectedGuest(null);
                      }}
                      className="flex items-center gap-1 text-xs text-primary font-semibold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Voltar
                    </button>
                    <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-3 text-center">
                      <p className="text-[10px] uppercase text-muted-foreground">Mesa {selectedTable} · {selectedGuest}</p>
                      <p className="font-display text-2xl font-bold text-primary mt-1">
                        R$ {allOrders.filter((o) => o.guestName === selectedGuest).reduce((a, o) => a + o.price * o.qty, 0) || Math.round(tableTotal * 0.25)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {[
                        { id: 'tap', label: 'TAP to Pay (NFC)', desc: 'Encoste o cartão', highlight: true, icon: '📱' },
                        { id: 'pix', label: 'PIX QR Code', desc: 'Gere o QR', highlight: false, icon: '⚡' },
                        { id: 'card', label: 'Cartão (Chip)', desc: 'Maquininha', highlight: false, icon: '💳' },
                        { id: 'cash', label: 'Dinheiro', desc: 'Valor recebido', highlight: false, icon: '💵' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setPaymentStep('processing')}
                          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all ${
                            m.highlight ? 'border-primary bg-primary/5' : 'border-border bg-card'
                          }`}
                        >
                          <span className="text-base">{m.icon}</span>
                          <div className="text-left flex-1">
                            <p className="text-xs font-semibold">{m.label}</p>
                            <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                          </div>
                          {m.highlight && <span className="px-1 py-0.5 rounded bg-success/10 text-success text-[9px] font-bold">REC</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentStep === 'processing' && (
                  <div className="text-center py-6 space-y-3">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                      <div className="absolute inset-2 rounded-full border-4 border-primary/30 animate-pulse" />
                      <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm">Aproxime o cartão</p>
                      <p className="text-xs text-muted-foreground mt-1">Peça ao cliente encostar o cartão no celular</p>
                    </div>
                    <div className="flex items-center gap-2 justify-center text-xs text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> Aguardando...
                    </div>
                    <div className="space-y-2 pt-2">
                      <button onClick={() => setPaymentStep('done')} className="w-full py-2.5 rounded-xl bg-success text-success-foreground font-semibold text-sm">
                        Confirmar Pagamento
                      </button>
                      <button onClick={() => setPaymentStep('method')} className="w-full py-2 rounded-xl border border-border text-xs text-muted-foreground">
                        Trocar método
                      </button>
                    </div>
                  </div>
                )}

                {paymentStep === 'done' && (
                  <div className="text-center py-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                    <p className="font-display font-bold text-success">Pagamento confirmado!</p>
                    <p className="text-xs text-muted-foreground">Mesa {selectedTable} · {selectedGuest}</p>
                    <div className="flex gap-2 justify-center pt-2">
                      <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold">Imprimir</button>
                      <button
                        onClick={() => {
                          setPaymentStep('guests');
                          setSelectedGuest(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                      >
                        Próximo →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
};
