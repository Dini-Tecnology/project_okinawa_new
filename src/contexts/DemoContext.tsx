/**
 * Demo Context - Simulation Engine for NOOWE Demo System
 * 
 * Provides realistic mock data and auto-simulation for the Bistrô Aurora demo restaurant.
 * Manages orders, tables, reservations, menu, and analytics with timed auto-progression.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// ============ TYPES ============

export interface DemoMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  prepTime: number; // minutes
  popular?: boolean;
  tags?: string[];
}

export interface DemoOrderItem {
  menuItem: DemoMenuItem;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'paid';

export interface DemoOrder {
  id: string;
  tableNumber: number;
  items: DemoOrderItem[];
  status: OrderStatus;
  total: number;
  customerName: string;
  createdAt: Date;
  updatedAt: Date;
  isKitchen?: boolean;
  isBar?: boolean;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'billing';

export interface DemoTable {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  customerName?: string;
  occupiedSince?: Date;
  orderTotal?: number;
}

export interface DemoReservation {
  id: string;
  customerName: string;
  partySize: number;
  time: string;
  status: 'confirmed' | 'seated' | 'waiting' | 'cancelled';
  phone: string;
  notes?: string;
}

export interface DemoNotification {
  id: string;
  type: 'new_order' | 'waiter_call' | 'reservation' | 'payment' | 'kitchen_ready';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface DemoAnalytics {
  todayRevenue: number;
  todayOrders: number;
  avgTicket: number;
  occupancyRate: number;
  topItems: { name: string; quantity: number }[];
  hourlyRevenue: { hour: string; revenue: number }[];
  weeklyRevenue: { day: string; revenue: number }[];
  customerSatisfaction: number;
  returningCustomers: number;
}

export interface CartItem extends DemoOrderItem {}

interface DemoContextType {
  // Restaurant data
  restaurant: typeof DEMO_RESTAURANT;
  menu: DemoMenuItem[];
  orders: DemoOrder[];
  tables: DemoTable[];
  reservations: DemoReservation[];
  notifications: DemoNotification[];
  analytics: DemoAnalytics;
  
  // Cart (client demo)
  cart: CartItem[];
  addToCart: (item: DemoMenuItem, quantity?: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  
  // Client actions
  placeOrder: () => DemoOrder | null;
  clientActiveOrder: DemoOrder | null;
  loyaltyPoints: number;
  
  // Restaurant actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  markNotificationRead: (notificationId: string) => void;
  unreadNotifications: number;
  
  // Simulation
  isSimulationRunning: boolean;
  toggleSimulation: () => void;
}

// ============ MOCK DATA ============

const DEMO_RESTAURANT = {
  name: 'Bistrô Aurora',
  description: 'Gastronomia contemporânea com ingredientes locais e sazonais',
  cuisine: 'Contemporânea Brasileira',
  rating: 4.8,
  reviewCount: 342,
  priceRange: '$$$$',
  address: 'Rua Oscar Freire, 432 - Jardins, São Paulo',
  phone: '(11) 3042-8900',
  hours: 'Ter-Dom · 12h–15h, 19h–00h',
  image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  logo: '🌅',
  features: ['Wi-Fi', 'Estacionamento', 'Acessível', 'Pet Friendly', 'Terraço'],
};

const MENU_ITEMS: DemoMenuItem[] = [
  // Entradas
  { id: 'e1', name: 'Tartare de Atum', description: 'Atum fresco com abacate, gergelim negro e ponzu cítrico', price: 58, category: 'Entradas', image: 'https://images.unsplash.com/photo-1534256958597-7fe685cbd745?w=400', prepTime: 8, popular: true, tags: ['Sem Glúten'] },
  { id: 'e2', name: 'Burrata Artesanal', description: 'Burrata com tomate confit, pesto de manjericão e redução de balsâmico', price: 52, category: 'Entradas', image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400', prepTime: 6, tags: ['Vegetariano'] },
  { id: 'e3', name: 'Ceviche Peruano', description: 'Peixe branco com leite de tigre, cebola roxa e milho crocante', price: 48, category: 'Entradas', image: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400', prepTime: 10, tags: ['Sem Glúten'] },
  { id: 'e4', name: 'Carpaccio de Wagyu', description: 'Wagyu A5 fatiado fino com rúcula, parmesão e azeite trufado', price: 72, category: 'Entradas', image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400', prepTime: 7, popular: true },
  
  // Pratos Principais
  { id: 'p1', name: 'Risoto de Funghi', description: 'Arroz arbóreo com mix de cogumelos frescos e parmesão 36 meses', price: 82, category: 'Pratos Principais', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400', prepTime: 22, popular: true, tags: ['Vegetariano'] },
  { id: 'p2', name: 'Filé ao Molho de Vinho', description: 'Filé mignon grelhado com demi-glace de vinho tinto e batata trufada', price: 118, category: 'Pratos Principais', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', prepTime: 25, popular: true },
  { id: 'p3', name: 'Salmão Grelhado', description: 'Salmão norueguês com crosta de ervas, purê de mandioquinha e aspargos', price: 96, category: 'Pratos Principais', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', prepTime: 18, tags: ['Sem Glúten'] },
  { id: 'p4', name: 'Polvo à Lagareiro', description: 'Tentáculos de polvo grelhados com batata ao murro e azeite', price: 108, category: 'Pratos Principais', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', prepTime: 20 },
  { id: 'p5', name: 'Ravioli de Lagosta', description: 'Massa fresca recheada com lagosta, bisque e manteiga de ervas', price: 124, category: 'Pratos Principais', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', prepTime: 20 },
  
  // Sobremesas
  { id: 'd1', name: 'Petit Gâteau', description: 'Bolo de chocolate belga com centro cremoso e sorvete de baunilha', price: 42, category: 'Sobremesas', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', prepTime: 15, popular: true },
  { id: 'd2', name: 'Crème Brûlée', description: 'Creme de baunilha Bourbon com casquinha caramelizada', price: 38, category: 'Sobremesas', image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400', prepTime: 5 },
  { id: 'd3', name: 'Cheesecake de Frutas', description: 'Base de biscoito com cream cheese e calda de frutas vermelhas', price: 40, category: 'Sobremesas', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', prepTime: 5, tags: ['Vegetariano'] },
  
  // Bebidas
  { id: 'b1', name: 'Gin Tônica Aurora', description: 'Gin artesanal com tônica premium, pepino e cardamomo', price: 38, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400', prepTime: 3, popular: true },
  { id: 'b2', name: 'Negroni Clássico', description: 'Gin, Campari e Vermute rosso com twist de laranja', price: 42, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1551751299-1b51cab2694c?w=400', prepTime: 3 },
  { id: 'b3', name: 'Vinho Malbec Reserva', description: 'Catena Zapata Malbec, Mendoza 2021 - Taça', price: 48, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', prepTime: 2 },
  { id: 'b4', name: 'Água com Gás San Pellegrino', description: '500ml', price: 14, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400', prepTime: 1 },
];

const CUSTOMER_NAMES = [
  'Maria Silva', 'João Santos', 'Ana Oliveira', 'Pedro Costa', 'Lucia Fernandes',
  'Carlos Mendes', 'Beatriz Lima', 'Rafael Souza', 'Camila Rodrigues', 'Felipe Almeida',
];

const generateTables = (): DemoTable[] => [
  { id: 't1', number: 1, seats: 2, status: 'occupied', customerName: 'Maria S.', occupiedSince: new Date(Date.now() - 45 * 60000), orderTotal: 186 },
  { id: 't2', number: 2, seats: 2, status: 'available' },
  { id: 't3', number: 3, seats: 4, status: 'occupied', customerName: 'João & Ana', occupiedSince: new Date(Date.now() - 20 * 60000), orderTotal: 312 },
  { id: 't4', number: 4, seats: 4, status: 'reserved' },
  { id: 't5', number: 5, seats: 6, status: 'occupied', customerName: 'Grupo Pedro', occupiedSince: new Date(Date.now() - 65 * 60000), orderTotal: 548 },
  { id: 't6', number: 6, seats: 2, status: 'billing', customerName: 'Lucia F.', occupiedSince: new Date(Date.now() - 90 * 60000), orderTotal: 224 },
  { id: 't7', number: 7, seats: 4, status: 'available' },
  { id: 't8', number: 8, seats: 8, status: 'occupied', customerName: 'Aniversário', occupiedSince: new Date(Date.now() - 30 * 60000), orderTotal: 890 },
  { id: 't9', number: 9, seats: 2, status: 'available' },
  { id: 't10', number: 10, seats: 4, status: 'occupied', customerName: 'Carlos M.', occupiedSince: new Date(Date.now() - 15 * 60000), orderTotal: 96 },
  { id: 't11', number: 11, seats: 6, status: 'reserved' },
  { id: 't12', number: 12, seats: 2, status: 'available' },
];

const generateReservations = (): DemoReservation[] => [
  { id: 'r1', customerName: 'Fernanda Machado', partySize: 2, time: '19:30', status: 'confirmed', phone: '(11) 99888-7766', notes: 'Aniversário de casamento' },
  { id: 'r2', customerName: 'Roberto Dias', partySize: 4, time: '20:00', status: 'confirmed', phone: '(11) 98765-4321' },
  { id: 'r3', customerName: 'Patricia Lemos', partySize: 6, time: '20:30', status: 'waiting', phone: '(11) 97654-3210', notes: 'Jantar de negócios' },
  { id: 'r4', customerName: 'André Martins', partySize: 2, time: '21:00', status: 'confirmed', phone: '(11) 96543-2109' },
  { id: 'r5', customerName: 'Juliana Costa', partySize: 8, time: '21:30', status: 'confirmed', phone: '(11) 95432-1098', notes: 'Mesa no terraço' },
];

const generateInitialOrders = (): DemoOrder[] => [
  {
    id: 'o1', tableNumber: 1, customerName: 'Maria S.',
    items: [{ menuItem: MENU_ITEMS[0], quantity: 1 }, { menuItem: MENU_ITEMS[5], quantity: 1 }, { menuItem: MENU_ITEMS[12], quantity: 2 }],
    status: 'preparing', total: 186, createdAt: new Date(Date.now() - 25 * 60000), updatedAt: new Date(Date.now() - 15 * 60000), isKitchen: true,
  },
  {
    id: 'o2', tableNumber: 3, customerName: 'João & Ana',
    items: [{ menuItem: MENU_ITEMS[3], quantity: 2 }, { menuItem: MENU_ITEMS[4], quantity: 1 }, { menuItem: MENU_ITEMS[13], quantity: 2 }],
    status: 'confirmed', total: 312, createdAt: new Date(Date.now() - 10 * 60000), updatedAt: new Date(Date.now() - 8 * 60000), isKitchen: true,
  },
  {
    id: 'o3', tableNumber: 5, customerName: 'Grupo Pedro',
    items: [{ menuItem: MENU_ITEMS[1], quantity: 2 }, { menuItem: MENU_ITEMS[6], quantity: 3 }, { menuItem: MENU_ITEMS[9], quantity: 2 }, { menuItem: MENU_ITEMS[14], quantity: 4 }],
    status: 'delivered', total: 548, createdAt: new Date(Date.now() - 55 * 60000), updatedAt: new Date(Date.now() - 30 * 60000), isKitchen: true,
  },
  {
    id: 'o4', tableNumber: 8, customerName: 'Aniversário',
    items: [{ menuItem: MENU_ITEMS[2], quantity: 4 }, { menuItem: MENU_ITEMS[7], quantity: 4 }, { menuItem: MENU_ITEMS[10], quantity: 4 }, { menuItem: MENU_ITEMS[12], quantity: 4 }],
    status: 'preparing', total: 890, createdAt: new Date(Date.now() - 20 * 60000), updatedAt: new Date(Date.now() - 12 * 60000), isKitchen: true,
  },
  {
    id: 'o5', tableNumber: 10, customerName: 'Carlos M.',
    items: [{ menuItem: MENU_ITEMS[0], quantity: 1 }, { menuItem: MENU_ITEMS[12], quantity: 1 }],
    status: 'pending', total: 96, createdAt: new Date(Date.now() - 3 * 60000), updatedAt: new Date(Date.now() - 3 * 60000), isBar: true,
  },
];

const DEMO_ANALYTICS: DemoAnalytics = {
  todayRevenue: 12840,
  todayOrders: 47,
  avgTicket: 273,
  occupancyRate: 72,
  topItems: [
    { name: 'Filé ao Molho de Vinho', quantity: 18 },
    { name: 'Tartare de Atum', quantity: 15 },
    { name: 'Risoto de Funghi', quantity: 14 },
    { name: 'Petit Gâteau', quantity: 12 },
    { name: 'Gin Tônica Aurora', quantity: 22 },
  ],
  hourlyRevenue: [
    { hour: '12h', revenue: 1200 }, { hour: '13h', revenue: 2800 }, { hour: '14h', revenue: 1600 },
    { hour: '19h', revenue: 1800 }, { hour: '20h', revenue: 3200 }, { hour: '21h', revenue: 2240 },
  ],
  weeklyRevenue: [
    { day: 'Seg', revenue: 0 }, { day: 'Ter', revenue: 8200 }, { day: 'Qua', revenue: 9400 },
    { day: 'Qui', revenue: 11200 }, { day: 'Sex', revenue: 15600 }, { day: 'Sáb', revenue: 18900 },
    { day: 'Dom', revenue: 14200 },
  ],
  customerSatisfaction: 4.8,
  returningCustomers: 38,
};

// ============ CONTEXT ============

const DemoContext = createContext<DemoContextType | null>(null);

export const useDemoContext = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoContext must be used within DemoProvider');
  return ctx;
};

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<DemoOrder[]>(generateInitialOrders);
  const [tables, setTables] = useState<DemoTable[]>(generateTables);
  const [reservations] = useState<DemoReservation[]>(generateReservations);
  const [notifications, setNotifications] = useState<DemoNotification[]>([
    { id: 'n1', type: 'new_order', message: 'Novo pedido na Mesa 10', timestamp: new Date(Date.now() - 3 * 60000), read: false },
    { id: 'n2', type: 'waiter_call', message: 'Mesa 5 chamou o garçom', timestamp: new Date(Date.now() - 8 * 60000), read: false },
    { id: 'n3', type: 'kitchen_ready', message: 'Pedido da Mesa 1 pronto', timestamp: new Date(Date.now() - 12 * 60000), read: true },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientActiveOrder, setClientActiveOrder] = useState<DemoOrder | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const [analytics, setAnalytics] = useState<DemoAnalytics>(DEMO_ANALYTICS);
  const orderCounterRef = useRef(6);

  // ---- Cart actions ----
  const addToCart = useCallback((item: DemoMenuItem, quantity = 1, notes?: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + quantity } : c);
      }
      return [...prev, { menuItem: item, quantity, notes }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  }, []);

  const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
    } else {
      setCart(prev => prev.map(c => c.menuItem.id === itemId ? { ...c, quantity } : c));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  // ---- Client actions ----
  const placeOrder = useCallback(() => {
    if (cart.length === 0) return null;
    const newOrder: DemoOrder = {
      id: `demo-${orderCounterRef.current++}`,
      tableNumber: 7,
      customerName: 'Você (Demo)',
      items: [...cart],
      status: 'pending',
      total: cartTotal,
      createdAt: new Date(),
      updatedAt: new Date(),
      isKitchen: cart.some(c => !['Bebidas'].includes(c.menuItem.category)),
      isBar: cart.some(c => c.menuItem.category === 'Bebidas'),
    };
    setOrders(prev => [newOrder, ...prev]);
    setClientActiveOrder(newOrder);
    setCart([]);
    setLoyaltyPoints(prev => prev + Math.floor(cartTotal / 10));

    // Auto-progress the order
    setTimeout(() => {
      setClientActiveOrder(prev => prev ? { ...prev, status: 'confirmed', updatedAt: new Date() } : null);
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: 'confirmed', updatedAt: new Date() } : o));
    }, 3000);
    setTimeout(() => {
      setClientActiveOrder(prev => prev ? { ...prev, status: 'preparing', updatedAt: new Date() } : null);
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: 'preparing', updatedAt: new Date() } : o));
    }, 8000);
    setTimeout(() => {
      setClientActiveOrder(prev => prev ? { ...prev, status: 'ready', updatedAt: new Date() } : null);
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: 'ready', updatedAt: new Date() } : o));
    }, 18000);
    setTimeout(() => {
      setClientActiveOrder(prev => prev ? { ...prev, status: 'delivered', updatedAt: new Date() } : null);
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: 'delivered', updatedAt: new Date() } : o));
    }, 25000);

    return newOrder;
  }, [cart, cartTotal]);

  // ---- Restaurant actions ----
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date() } : o));
  }, []);

  const updateTableStatus = useCallback((tableId: string, status: TableStatus) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const toggleSimulation = useCallback(() => setIsSimulationRunning(prev => !prev), []);

  // ---- Auto-simulation engine ----
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      // Random event every 30-60 seconds
      const event = Math.random();

      if (event < 0.3) {
        // New order arrives
        const tableNum = [2, 7, 9, 12][Math.floor(Math.random() * 4)];
        const customerName = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const randomItems: DemoOrderItem[] = [];
        for (let i = 0; i < itemCount; i++) {
          const item = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
          randomItems.push({ menuItem: item, quantity: Math.floor(Math.random() * 2) + 1 });
        }
        const total = randomItems.reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
        const newOrder: DemoOrder = {
          id: `sim-${orderCounterRef.current++}`,
          tableNumber: tableNum,
          customerName,
          items: randomItems,
          status: 'pending',
          total,
          createdAt: new Date(),
          updatedAt: new Date(),
          isKitchen: randomItems.some(i => i.menuItem.category !== 'Bebidas'),
          isBar: randomItems.some(i => i.menuItem.category === 'Bebidas'),
        };
        setOrders(prev => [newOrder, ...prev].slice(0, 20));
        setNotifications(prev => [{
          id: `ns-${Date.now()}`,
          type: 'new_order' as const,
          message: `Novo pedido na Mesa ${tableNum} — ${customerName}`,
          timestamp: new Date(),
          read: false,
        }, ...prev].slice(0, 10));
        setAnalytics(prev => ({
          ...prev,
          todayOrders: prev.todayOrders + 1,
          todayRevenue: prev.todayRevenue + total,
          avgTicket: Math.round((prev.todayRevenue + total) / (prev.todayOrders + 1)),
        }));
      } else if (event < 0.6) {
        // Progress existing orders
        setOrders(prev => {
          const pendingOrder = prev.find(o => o.status === 'pending');
          if (pendingOrder) {
            return prev.map(o => o.id === pendingOrder.id ? { ...o, status: 'confirmed' as OrderStatus, updatedAt: new Date() } : o);
          }
          const confirmedOrder = prev.find(o => o.status === 'confirmed');
          if (confirmedOrder) {
            return prev.map(o => o.id === confirmedOrder.id ? { ...o, status: 'preparing' as OrderStatus, updatedAt: new Date() } : o);
          }
          const preparingOrder = prev.find(o => o.status === 'preparing');
          if (preparingOrder) {
            setNotifications(n => [{
              id: `nk-${Date.now()}`,
              type: 'kitchen_ready',
              message: `Pedido da Mesa ${preparingOrder.tableNumber} pronto para servir`,
              timestamp: new Date(),
              read: false,
            }, ...n].slice(0, 10));
            return prev.map(o => o.id === preparingOrder.id ? { ...o, status: 'ready' as OrderStatus, updatedAt: new Date() } : o);
          }
          return prev;
        });
      } else if (event < 0.75) {
        // Waiter call
        const tableNum = [1, 3, 5, 8, 10][Math.floor(Math.random() * 5)];
        setNotifications(prev => [{
          id: `nw-${Date.now()}`,
          type: 'waiter_call',
          message: `Mesa ${tableNum} chamou o garçom`,
          timestamp: new Date(),
          read: false,
        }, ...prev].slice(0, 10));
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [isSimulationRunning]);

  return (
    <DemoContext.Provider value={{
      restaurant: DEMO_RESTAURANT,
      menu: MENU_ITEMS,
      orders, tables, reservations, notifications, analytics,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal,
      placeOrder, clientActiveOrder, loyaltyPoints,
      updateOrderStatus, updateTableStatus, markNotificationRead, unreadNotifications,
      isSimulationRunning, toggleSimulation,
    }}>
      {children}
    </DemoContext.Provider>
  );
};
