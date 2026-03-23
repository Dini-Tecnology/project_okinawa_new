import { QueryClient } from '@tanstack/react-query';

// Configure React Query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 1000 * 60 * 5, // 5 minutes - data is considered fresh for 5 mins
      gcTime: 1000 * 60 * 30, // 30 minutes - cache garbage collection time (formerly cacheTime)

      // Retry configuration
      retry: 2, // Retry failed requests 2 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      refetchOnWindowFocus: true, // Refetch when app comes to foreground
      refetchOnReconnect: true, // Refetch when internet reconnects
      refetchOnMount: true, // Refetch on component mount

      // Performance
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

// Query keys factory for consistent cache key management
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
    profile: ['auth', 'profile'] as const,
  },

  // Restaurants
  restaurants: {
    all: ['restaurants'] as const,
    list: (filters?: Record<string, any>) => ['restaurants', 'list', filters] as const,
    detail: (id: string) => ['restaurants', 'detail', id] as const,
    menu: (id: string) => ['restaurants', 'menu', id] as const,
    nearby: (lat: number, lng: number) => ['restaurants', 'nearby', lat, lng] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    list: (filters?: Record<string, any>) => ['orders', 'list', filters] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
    my: ['orders', 'my'] as const,
  },

  // Reservations
  reservations: {
    all: ['reservations'] as const,
    list: (filters?: Record<string, any>) => ['reservations', 'list', filters] as const,
    detail: (id: string) => ['reservations', 'detail', id] as const,
    my: ['reservations', 'my'] as const,
  },

  // Favorites
  favorites: {
    all: ['favorites'] as const,
    my: ['favorites', 'my'] as const,
  },

  // Reviews
  reviews: {
    all: ['reviews'] as const,
    restaurant: (restaurantId: string) => ['reviews', 'restaurant', restaurantId] as const,
    my: ['reviews', 'my'] as const,
  },

  // Loyalty
  loyalty: {
    points: ['loyalty', 'points'] as const,
    history: ['loyalty', 'history'] as const,
  },

  // Wallet
  wallet: {
    balance: ['wallet', 'balance'] as const,
    transactions: (filters?: Record<string, any>) => ['wallet', 'transactions', filters] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: Record<string, any>) => ['notifications', 'list', filters] as const,
    unreadCount: ['notifications', 'unreadCount'] as const,
  },

  // Menu Items
  menuItems: {
    all: ['menuItems'] as const,
    detail: (id: string) => ['menuItems', 'detail', id] as const,
  },

  // Tips
  tips: {
    my: ['tips', 'my'] as const,
    detail: (id: string) => ['tips', 'detail', id] as const,
  },

  // Tabs (Pub & Bar Comanda)
  tabs: {
    all: ['tabs'] as const,
    my: ['tabs', 'my'] as const,
    detail: (id: string) => ['tabs', 'detail', id] as const,
    splitOptions: (id: string) => ['tabs', 'split-options', id] as const,
  },
};

// Helper to invalidate related queries after mutations
export const invalidateQueries = {
  // After creating/updating/deleting an order
  afterOrderMutation: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
  },

  // After creating/updating/deleting a reservation
  afterReservationMutation: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
  },

  // After adding/removing favorites
  afterFavoriteMutation: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
  },

  // After creating/updating/deleting a review
  afterReviewMutation: (restaurantId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    if (restaurantId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.restaurant(restaurantId) });
    }
  },

  // After wallet transaction
  afterWalletMutation: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    queryClient.invalidateQueries({ queryKey: queryKeys.wallet.transactions() });
  },

  // After notification action
  afterNotificationMutation: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
  },

  // After tab mutation (add item, close, payment)
  afterTabMutation: (tabId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tabs.all });
    if (tabId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.tabs.detail(tabId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tabs.splitOptions(tabId) });
    }
  },
};
