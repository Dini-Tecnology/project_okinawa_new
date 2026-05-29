/** Dados mockados da aba Pedidos — substituir por API quando integrado */

export type MockOrderTrackingStep = 'received' | 'preparing' | 'ready' | 'delivered';

export interface MockOrderListItem {
  id: string;
  orderNumber: string;
  restaurantName: string;
  tableNumber: string;
  status: MockOrderTrackingStep;
  statusLabel: string;
  itemCount: number;
  totalAmount: number;
  placedAt: string;
}

export interface MockOrderTrackingItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  orderedBy?: string;
}

export interface MockOrderTracking {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  tableNumber: string;
  guestCount: number;
  guestLabel: string;
  currentStep: MockOrderTrackingStep;
  estimatedMinutesMin: number;
  estimatedMinutesMax: number;
  progress: number;
  items: MockOrderTrackingItem[];
}

export interface MockComandaItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
}

export const MOCK_COMANDA_RESTAURANT = {
  id: 'mock-bistro-noowe',
  tableNumber: '7',
};

/** Pedidos ativos exibidos na aba Pedidos */
export const MOCK_ORDERS: MockOrderListItem[] = [
  {
    id: 'mock-order-2847',
    orderNumber: '2847',
    restaurantName: 'Bistrô Noowe',
    tableNumber: '7',
    status: 'received',
    statusLabel: 'Recebido',
    itemCount: 3,
    totalAmount: 186.0,
    placedAt: '19:42',
  },
  {
    id: 'mock-order-2841',
    orderNumber: '2841',
    restaurantName: 'Bistrô Noowe',
    tableNumber: '7',
    status: 'preparing',
    statusLabel: 'Preparando',
    itemCount: 2,
    totalAmount: 116.0,
    placedAt: '19:28',
  },
  {
    id: 'mock-order-2835',
    orderNumber: '2835',
    restaurantName: 'Bistrô Noowe',
    tableNumber: '7',
    status: 'ready',
    statusLabel: 'Pronto',
    itemCount: 1,
    totalAmount: 48.0,
    placedAt: '19:05',
  },
];

const MOCK_TRACKING_BY_ID: Record<string, MockOrderTracking> = {
  'mock-order-2847': {
    id: 'mock-order-2847',
    orderNumber: '2847',
    restaurantId: MOCK_COMANDA_RESTAURANT.id,
    restaurantName: 'Bistrô Noowe',
    tableNumber: '7',
    guestCount: 1,
    guestLabel: 'Você',
    currentStep: 'received',
    estimatedMinutesMin: 0,
    estimatedMinutesMax: 0,
    progress: 0.05,
    items: [
      { id: 'i1', name: 'Tartare de Atum', quantity: 1, unitPrice: 58, orderedBy: 'Você' },
      { id: 'i2', name: 'Risotto de Cogumelos', quantity: 1, unitPrice: 72, orderedBy: 'Você' },
      { id: 'i3', name: 'Mousse de Chocolate', quantity: 1, unitPrice: 56, orderedBy: 'Você' },
    ],
  },
  'mock-order-2841': {
    id: 'mock-order-2841',
    orderNumber: '2841',
    restaurantId: MOCK_COMANDA_RESTAURANT.id,
    restaurantName: 'Bistrô Noowe',
    tableNumber: '7',
    guestCount: 1,
    guestLabel: 'Você',
    currentStep: 'preparing',
    estimatedMinutesMin: 5,
    estimatedMinutesMax: 10,
    progress: 0.55,
    items: [
      { id: 'i4', name: 'Carpaccio de Salmão', quantity: 1, unitPrice: 48, orderedBy: 'Você' },
      { id: 'i5', name: 'Burrata com Tomates', quantity: 1, unitPrice: 68, orderedBy: 'Você' },
    ],
  },
  'mock-order-2835': {
    id: 'mock-order-2835',
    orderNumber: '2835',
    restaurantId: MOCK_COMANDA_RESTAURANT.id,
    restaurantName: 'Bistrô Noowe',
    tableNumber: '7',
    guestCount: 1,
    guestLabel: 'Você',
    currentStep: 'ready',
    estimatedMinutesMin: 0,
    estimatedMinutesMax: 2,
    progress: 0.9,
    items: [{ id: 'i6', name: 'Gateau de Chocolate', quantity: 1, unitPrice: 48, orderedBy: 'Você' }],
  },
};

export function getMockOrderTracking(orderId: string): MockOrderTracking | undefined {
  return MOCK_TRACKING_BY_ID[orderId];
}

export function getMockOrderListItem(orderId: string): MockOrderListItem | undefined {
  return MOCK_ORDERS.find((o) => o.id === orderId);
}

/** Comanda da mesa (opcional na aba Pedidos) */
export const MOCK_COMANDA_ITEMS: MockComandaItem[] = [
  {
    id: 'c1',
    name: 'Tartare de Atum',
    quantity: 1,
    unitPrice: 58,
    imageUrl:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'c2',
    name: 'Risotto de Cogumelos',
    quantity: 1,
    unitPrice: 72,
    imageUrl:
      'https://images.unsplash.com/photo-1476124369801-6140d0947f8f?auto=format&fit=crop&w=200&q=80',
  },
];

export const TRACKING_STEPS: {
  key: MockOrderTrackingStep;
  label: string;
  icon: 'checkmark' | 'restaurant' | 'restaurant-outline' | 'checkmark-done';
}[] = [
  { key: 'received', label: 'Recebido', icon: 'checkmark' },
  { key: 'preparing', label: 'Preparando', icon: 'restaurant' },
  { key: 'ready', label: 'Pronto', icon: 'restaurant-outline' },
  { key: 'delivered', label: 'Entregue', icon: 'checkmark-done' },
];
