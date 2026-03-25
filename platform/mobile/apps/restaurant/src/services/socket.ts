import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://api.okinawa.com';

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'completed'
  | 'cancelled';

interface OrderItemPayload {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  special_instructions?: string;
}

interface NewOrderPayload {
  order_id: string;
  user_id: string;
  customer_name: string;
  items: OrderItemPayload[];
  total_amount: number;
  order_type: string;
  table_id?: string;
}

interface OrderUpdatePayload {
  order_id: string;
  status: OrderStatus;
  updated_by: string;
}

interface ReservationPayload {
  id: string;
  customer_name: string;
  party_size: number;
  reservation_time: string;
  status: string;
}

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  async connect() {
    const token = await AsyncStorage.getItem('access_token');

    if (!token) {
      console.warn('No access token found, cannot connect to socket');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });

    // New orders from customers
    this.socket.on('order:new', (data: NewOrderPayload) => {
      this.emit('order:new', data);
    });

    // Order status updates
    this.socket.on('order:update', (data: OrderUpdatePayload) => {
      this.emit('order:update', data);
    });

    // Order cancellations
    this.socket.on('order:cancelled', (data: { order_id: string; reason?: string; cancelled_by?: string }) => {
      this.emit('order:cancelled', data);
    });

    // New reservations
    this.socket.on('reservation:new', (data: ReservationPayload) => {
      this.emit('reservation:new', data);
    });

    // Reservation updates
    this.socket.on('reservation:update', (data: ReservationPayload) => {
      this.emit('reservation:update', data);
    });

    // Table status updates
    this.socket.on('table:update', (data: { table_id: string; status: string; updated_by?: string }) => {
      this.emit('table:update', data);
    });

    // Notifications
    this.socket.on('notification', (data: NotificationPayload) => {
      this.emit('notification', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Event subscription
  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Unsubscribe from event
  off(event: string, callback?: (data: unknown) => void) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  // Emit to local listeners
  private emit(event: string, data: unknown) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Send events to server
  send(event: string, data: Record<string, unknown>) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot send:', event);
    }
  }

  // Join restaurant room to receive all restaurant events
  joinRestaurantRoom(restaurantId: string) {
    this.send('restaurant:join', { restaurant_id: restaurantId });
  }

  leaveRestaurantRoom(restaurantId: string) {
    this.send('restaurant:leave', { restaurant_id: restaurantId });
  }

  // Update order status (broadcasts to customer)
  updateOrderStatus(orderId: string, status: OrderStatus, estimatedTime?: number) {
    this.send('order:status_update', {
      order_id: orderId,
      status,
      estimated_time: estimatedTime,
    });
  }

  // Notify customer when order is ready
  notifyOrderReady(orderId: string) {
    this.send('order:ready', { order_id: orderId });
  }

  // Update table status (broadcasts to other staff and customers)
  updateTableStatus(tableId: string, status: string) {
    this.send('table:status_update', {
      table_id: tableId,
      status,
    });
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new SocketService();
