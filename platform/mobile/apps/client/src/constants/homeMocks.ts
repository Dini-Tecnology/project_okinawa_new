/** Dados mockados para a home — substituir por API quando integrado */

export const MOCK_NOTIFICATION_COUNT = 3;

export const MOCK_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'fine-dining', label: 'Fine Dining' },
  { id: 'casual', label: 'Casual' },
  { id: 'bar', label: 'Bar' },
] as const;

export const MOCK_FEATURED_RESTAURANT = {
  id: 'mock-bistro-noowe',
  name: 'Bistrô Noowe',
  cuisine: 'Contemporânea Brasileira',
  priceLevel: '$$$$',
  rating: 4.8,
  reviewCount: 342,
  imageUrl:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
};

export const MOCK_NEARBY_RESTAURANTS = [
  {
    id: 'mock-bistro-noowe',
    name: 'Bistrô Noowe',
    cuisine: 'Contemporânea',
    distanceM: 350,
    rating: 4.8,
  },
];

export const MOCK_QUICK_ACTIONS = [
  {
    id: 'scan',
    label: 'Escanear',
    icon: 'qr-code-outline' as const,
    route: 'RestaurantQRScan',
    params: { restaurantId: 'mock-bistro-noowe' },
  },
  {
    id: 'reserve',
    label: 'Reservar',
    icon: 'calendar-outline' as const,
    route: 'RestaurantReserve',
    params: { restaurantId: 'mock-bistro-noowe' },
  },
  {
    id: 'queue',
    label: 'Fila Virtual',
    icon: 'timer-outline' as const,
    route: 'RestaurantVirtualQueue',
    params: { restaurantId: 'mock-bistro-noowe' },
  },
  { id: 'menu', label: 'Cardápio', icon: 'restaurant-outline' as const, route: 'MenuTab' },
] as const;
