import type {
  HubOrder,
  TabOrder,
  KdsOrder,
  RestaurantProfile,
  BusinessHour,
  NotificationPrefs,
  PaymentMethods,
} from './v2Types';

export const OWNER_ROLES = [
  { id: 'owner', label: 'Dono', title: 'Dashboard Executivo', hint: 'Visão completa do restaurante' },
  { id: 'manager', label: 'Gerente', title: 'Operação do Turno', hint: 'Pedidos, equipe e sala' },
  { id: 'maitre', label: 'Maître', title: 'Sala e Reservas', hint: 'Fila, reservas e mesas' },
  { id: 'chef', label: 'Chef', title: 'Chef Executivo', hint: 'KDS, tempos e qualidade' },
  { id: 'barman', label: 'Barman', title: 'Bar KDS', hint: 'Drinks e bebidas' },
  { id: 'cook', label: 'Cozinheiro', title: 'Estação de Preparo', hint: 'Fila da sua praça' },
  { id: 'waiter', label: 'Garçom', title: 'Atendimento', hint: 'Mesas e chamados' },
] as const;

export const HUB_ORDERS: HubOrder[] = [
  {
    table: '7',
    name: 'Ana Oliveira',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    items: '3 itens',
    value: 'R$ 90',
    time: '3min atrás',
    status: 'Confirmado',
    action: 'Preparar',
  },
  {
    table: '9',
    name: 'Felipe Almeida',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    items: '1 item',
    value: 'R$ 42',
    time: '11min atrás',
    status: 'Confirmado',
    action: 'Preparar',
  },
  {
    table: '12',
    name: 'Beatriz Lima',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    items: '1 item',
    value: 'R$ 192',
    time: '1min atrás',
    status: 'Pendente',
    action: 'Confirmar',
  },
];

export const HUB_ORDER_ITEMS = [
  ['1x Ceviche Peruano', '1x Água com Gás'],
  ['1x Negroni Clássico'],
  ['2x Salmão Grelhado'],
];

export const HUB_TABLES = [
  { number: 1, status: 'Ocupada', seats: '2 lugares', guest: 'Maria S.', tone: 'danger' as const },
  { number: 2, status: 'Livre', seats: '2 lugares', guest: '', tone: 'success' as const },
  { number: 3, status: 'Ocupada', seats: '4 lugares', guest: 'João & Ana', tone: 'danger' as const },
  { number: 4, status: 'Reserva', seats: '4 lugares', guest: '', tone: 'warning' as const },
  { number: 5, status: 'Ocupada', seats: '6 lugares', guest: 'Grupo Pedro', tone: 'danger' as const },
  { number: 6, status: 'Conta', seats: '2 lugares', guest: 'Lucia F.', tone: 'info' as const },
];

export const TAB_ORDERS: TabOrder[] = [
  {
    id: '#1234',
    table: 'Mesa 5',
    items: ['2x Ramen Tonkotsu', '1x Gyoza'],
    total: 119.8,
    time: '14:32',
    status: 'preparing',
    customerName: 'Carlos Mendes',
    notes: 'Sem cebola no ramen',
    createdAt: '14:28',
  },
  {
    id: '#1235',
    table: 'Mesa 12',
    items: ['1x Udon', '2x Edamame'],
    total: 68,
    time: '14:35',
    status: 'new',
    customerName: 'Julia Rocha',
    createdAt: '14:33',
  },
  {
    id: '#1236',
    table: 'Mesa 3',
    items: ['3x Ramen', '2x Gyoza'],
    total: 194.7,
    time: '14:28',
    status: 'ready',
    customerName: 'Pedro Henrique',
    createdAt: '14:20',
  },
];

export const FLOOR_TABLES = [
  { id: '1', status: 'occupied' as const, guests: 4, time: '45 min', section: 'Interna', hasQR: true },
  { id: '2', status: 'available' as const, guests: 0, time: '', section: 'Interna', hasQR: true },
  { id: '3', status: 'reserved' as const, guests: 2, time: '19:00', section: 'Interna', hasQR: false },
  { id: '4', status: 'occupied' as const, guests: 2, time: '20 min', section: 'Varanda', hasQR: true },
  { id: '5', status: 'available' as const, guests: 0, time: '', section: 'Varanda', hasQR: false },
  { id: '6', status: 'occupied' as const, guests: 6, time: '1h 10min', section: 'Privativo', hasQR: true },
];

export const KDS_ORDERS: KdsOrder[] = [
  {
    id: 'kds-1',
    table: 'Mesa 5',
    meta: '3 itens · 4min',
    status: 'preparing',
    items: [['Ramen Tonkotsu', '10min'], ['Gyoza (6un)', '5min']],
    total: 119.8,
    time: '14:32',
    customerName: 'Carlos Mendes',
  },
  {
    id: 'kds-2',
    table: 'Mesa 12',
    meta: '1 item · 2min',
    status: 'queue',
    items: [['Yakissoba', '8min']],
    total: 42,
    time: '14:35',
    customerName: 'Julia Rocha',
  },
  {
    id: 'kds-3',
    table: 'Mesa 3',
    meta: '2 itens · 5min',
    status: 'queue',
    items: [['Temaki Salmão', '6min'], ['Hot Roll', '4min']],
    total: 86,
    time: '14:28',
    customerName: 'Pedro Henrique',
  },
  {
    id: 'kds-4',
    table: 'Mesa 8',
    meta: '2 itens · 1min',
    status: 'queue',
    items: [['Sashimi Mix', '5min'], ['Missoshiru', '3min']],
    total: 95,
    time: '14:36',
    customerName: 'Mariana Costa',
  },
  {
    id: 'kds-5',
    table: 'Mesa 1',
    meta: '1 item · 8min',
    status: 'preparing',
    items: [['Tempurá', '7min']],
    total: 38,
    time: '14:24',
    customerName: 'Lucas Ferreira',
  },
  {
    id: 'kds-6',
    table: 'Mesa 10',
    meta: '3 itens · 3min',
    status: 'queue',
    items: [['Ramen Shoyu', '10min'], ['Edamame', '3min'], ['Mochi', '2min']],
    total: 112,
    time: '14:34',
    customerName: 'Camila Oliveira',
  },
];

export const RESTAURANT_PROFILE: RestaurantProfile = {
  name: 'NOOWE Sushi House',
  cnpj: '12.345.678/0001-90',
  address: 'Av. Paulista, 1000 — Bela Vista, São Paulo - SP',
  phone: '(11) 3456-7890',
  email: 'contato@noowe.com.br',
};

export const BUSINESS_HOURS: BusinessHour[] = [
  { day: 'Segunda', open: true, start: '11:00', end: '23:00' },
  { day: 'Terça', open: true, start: '11:00', end: '23:00' },
  { day: 'Quarta', open: true, start: '11:00', end: '23:00' },
  { day: 'Quinta', open: true, start: '11:00', end: '23:00' },
  { day: 'Sexta', open: true, start: '11:00', end: '00:00' },
  { day: 'Sábado', open: true, start: '12:00', end: '00:00' },
  { day: 'Domingo', open: false, start: '12:00', end: '22:00' },
];

export const NOTIFICATION_PREFS: NotificationPrefs = {
  newOrders: true,
  kitchen: true,
  reservations: true,
  payments: false,
  sound: true,
};

export const PAYMENT_METHODS: PaymentMethods = {
  pix: true,
  creditCard: true,
  debitCard: true,
  cash: true,
  pixKey: 'contato@noowe.com.br',
  feePercent: 2.5,
};

export const WAITER_TABLES = [
  { id: 5, status: 'needs_attention' as const, message: 'Solicitação pendente' },
  { id: 12, status: 'new_order' as const, message: 'Novo pedido' },
  { id: 3, status: 'payment' as const, message: 'Aguardando pagamento' },
];
