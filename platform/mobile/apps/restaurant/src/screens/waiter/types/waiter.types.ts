/**
 * Waiter Command Center — TypeScript Types
 *
 * All type definitions for the waiter command center feature,
 * including live feed events, table/guest management, kitchen pipeline,
 * and payment flow.
 *
 * @module waiter/types
 */

// ============================================
// LIVE FEED TYPES
// ============================================

export type LiveEventType =
  | 'kitchen_ready'
  | 'call'
  | 'payment'
  | 'payment_needed'
  | 'approval'
  | 'order'
  | 'alert';

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'info';

export interface LiveFeedEvent {
  id: string;
  time: string;
  table: number;
  event: string;
  detail: string;
  type: LiveEventType;
  urgency: UrgencyLevel;
  handled: boolean;
  timestamp: number;
}

// ============================================
// TABLE & GUEST TYPES
// ============================================

export type GuestOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export interface GuestOrder {
  id: string;
  item: string;
  qty: number;
  price: number;
  status: GuestOrderStatus;
  sentAt: string;
}

export interface TableGuest {
  id: string;
  name: string;
  hasApp: boolean;
  paid: boolean;
  method?: string;
  orders: GuestOrder[];
}

export interface WaiterTable {
  id: string;
  number: number;
  status: 'occupied' | 'billing';
  customerName: string;
  occupiedSince: string;
  orderTotal: number;
  guests: TableGuest[];
}

// ============================================
// KITCHEN PIPELINE TYPES
// ============================================

export type KitchenDishStatus = 'preparing' | 'ready' | 'served';

export interface KitchenDish {
  id: string;
  orderId: string;
  dish: string;
  qty: number;
  table: number;
  chef: string;
  status: KitchenDishStatus;
  readyAgo: number;
  sla: number;
  elapsed: number;
}

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentMethod = 'tap' | 'pix' | 'card' | 'cash';
export type PaymentStep = 'guests' | 'method' | 'processing' | 'done';

export interface PaymentMethodOption {
  id: PaymentMethod;
  labelKey: string;
  descKey: string;
  icon: string;
  highlight: boolean;
}

// ============================================
// MENU TYPES (for proxy ordering)
// ============================================

export interface MenuCategory {
  cat: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  time: string;
}

export interface CartItem {
  itemId: string;
  item: string;
  qty: number;
  price: number;
}

// ============================================
// WAITER TAB NAVIGATION
// ============================================

export type WaiterTab = 'live' | 'tables' | 'kitchen' | 'charge';
export type TableDetailTab = 'guests' | 'orders' | 'menu' | 'charge';

// ============================================
// DEVELOPMENT / DEMO DATA
// ============================================

export const TABLE_GUESTS_DATA: Record<number, TableGuest[]> = {
  1: [
    { id: 'g1-1', name: 'Maria S.', hasApp: true, paid: false, orders: [
      { id: 'oi1', item: 'Tartare de Atum', qty: 1, price: 58, status: 'served', sentAt: '18:32' },
      { id: 'oi2', item: 'Risotto de Cogumelos', qty: 1, price: 62, status: 'preparing', sentAt: '19:05' },
    ]},
    { id: 'g1-2', name: 'Paulo R.', hasApp: false, paid: false, orders: [
      { id: 'oi3', item: 'Salmao Grelhado', qty: 1, price: 72, status: 'preparing', sentAt: '19:05' },
    ]},
  ],
  3: [
    { id: 'g3-1', name: 'Joao', hasApp: true, paid: false, orders: [
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
      { id: 'oi8', item: 'File ao Molho de Vinho', qty: 1, price: 89, status: 'ready', sentAt: '18:40' },
      { id: 'oi9', item: 'Cafe Espresso', qty: 1, price: 12, status: 'served', sentAt: '18:25' },
    ]},
    { id: 'g5-2', name: 'Lucas C.', hasApp: true, paid: false, orders: [
      { id: 'oi10', item: 'File ao Molho de Vinho', qty: 1, price: 89, status: 'ready', sentAt: '18:40' },
      { id: 'oi11', item: 'Tiramisu', qty: 1, price: 32, status: 'pending', sentAt: '19:18' },
    ]},
    { id: 'g5-3', name: 'Mariana', hasApp: false, paid: false, orders: [
      { id: 'oi12', item: 'Salmao Grelhado', qty: 1, price: 72, status: 'preparing', sentAt: '18:55' },
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
      { id: 'oi17', item: 'Petit Gateau', qty: 1, price: 38, status: 'ready', sentAt: '19:00' },
      { id: 'oi18', item: 'Cafe Espresso', qty: 1, price: 12, status: 'served', sentAt: '18:45' },
    ]},
  ],
};

export const WAITER_MENU: MenuCategory[] = [
  { cat: 'Entradas', items: [
    { id: 'm1', name: 'Tartare de Atum', price: 58, time: '8min' },
    { id: 'm2', name: 'Burrata com Presunto', price: 52, time: '5min' },
    { id: 'm3', name: 'Polvo Grelhado', price: 68, time: '12min' },
    { id: 'm4', name: 'Carpaccio de Wagyu', price: 72, time: '6min' },
  ]},
  { cat: 'Principais', items: [
    { id: 'm5', name: 'File ao Molho de Vinho', price: 89, time: '20min' },
    { id: 'm6', name: 'Risotto de Cogumelos', price: 62, time: '25min' },
    { id: 'm7', name: 'Salmao Grelhado', price: 72, time: '18min' },
    { id: 'm8', name: 'Costela Braseada', price: 78, time: '15min' },
  ]},
  { cat: 'Sobremesas', items: [
    { id: 'm9', name: 'Petit Gateau', price: 38, time: '12min' },
    { id: 'm10', name: 'Tiramisu', price: 32, time: '5min' },
    { id: 'm11', name: 'Creme Brulee', price: 34, time: '8min' },
  ]},
  { cat: 'Bebidas', items: [
    { id: 'm12', name: 'Cafe Espresso', price: 12, time: '3min' },
    { id: 'm13', name: 'Vinho Tinto (taca)', price: 45, time: '1min' },
    { id: 'm14', name: 'Cerveja Artesanal', price: 24, time: '1min' },
    { id: 'm15', name: 'Suco Natural', price: 16, time: '5min' },
  ]},
];

export const getTableGuests = (tableNum: number): TableGuest[] =>
  TABLE_GUESTS_DATA[tableNum] || [];

// Kitchen pipeline — placeholder data for KitchenTab until the kitchen API is wired up
export const KITCHEN_PIPELINE: KitchenDish[] = [
  { id: 'k1', orderId: 'ord-1', dish: 'File ao Molho de Vinho', qty: 2, table: 5, chef: 'Chef Felipe', status: 'ready', readyAgo: 3, sla: 20, elapsed: 22 },
  { id: 'k2', orderId: 'ord-2', dish: 'Petit Gateau', qty: 1, table: 10, chef: 'Cozinheiro Thiago', status: 'ready', readyAgo: 1, sla: 12, elapsed: 11 },
  { id: 'k3', orderId: 'ord-3', dish: 'Risotto de Cogumelos', qty: 1, table: 3, chef: 'Chef Felipe', status: 'preparing', readyAgo: 0, sla: 25, elapsed: 18 },
  { id: 'k4', orderId: 'ord-4', dish: 'Salmao Grelhado', qty: 1, table: 8, chef: 'Cozinheiro Ana', status: 'preparing', readyAgo: 0, sla: 22, elapsed: 8 },
  { id: 'k5', orderId: 'ord-5', dish: 'Tiramisu', qty: 2, table: 1, chef: 'Cozinheiro Thiago', status: 'preparing', readyAgo: 0, sla: 15, elapsed: 5 },
];
