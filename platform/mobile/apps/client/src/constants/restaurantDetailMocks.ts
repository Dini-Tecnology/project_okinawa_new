/** Dados mockados do Bistrô Noowe — substituir por API quando integrado */

export const MOCK_RESTAURANT_ID = 'mock-bistro-noowe';

export type RestaurantDetail = {
  id: string;
  name: string;
  tagline: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  distanceM: number;
  priceLevel: string;
  hoursLabel: string;
  amenities: string[];
  neighborhood: string;
  city: string;
  occupancy: 'Baixa' | 'Média' | 'Alta';
  queueGroups: number;
  queueWaitMinutes: number;
  defaultTable: {
    number: number;
    seats: number;
  };
};

export const MOCK_RESTAURANT_DETAIL: RestaurantDetail = {
  id: MOCK_RESTAURANT_ID,
  name: 'Bistrô Noowe',
  tagline: 'Gastronomia contemporânea com ingredientes locais e sazonais',
  imageUrl:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  rating: 4.8,
  reviewCount: 342,
  distanceM: 350,
  priceLevel: '$$$$',
  hoursLabel: 'Ter-Dom · 12h–15h, 19h–00h',
  amenities: ['Wi-Fi', 'Estacionamento', 'Acessível', 'Pet Friendly', 'Terraço'],
  neighborhood: 'Jardins',
  city: 'São Paulo',
  occupancy: 'Alta',
  queueGroups: 3,
  queueWaitMinutes: 25,
  defaultTable: { number: 7, seats: 4 },
};

export function resolveRestaurantDetail(restaurantId?: string): RestaurantDetail {
  if (!restaurantId || restaurantId === MOCK_RESTAURANT_ID || restaurantId.startsWith('mock-')) {
    return MOCK_RESTAURANT_DETAIL;
  }
  return { ...MOCK_RESTAURANT_DETAIL, id: restaurantId };
}

export const MOCK_RESERVE_DATES = [
  { id: 'today', label: 'Hoje' },
  { id: 'tomorrow', label: 'Amanhã' },
  { id: 'sat', label: 'Sáb 15' },
  { id: 'sun', label: 'Dom 16' },
] as const;

export const MOCK_RESERVE_TIMES = [
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
] as const;

export const MOCK_RESERVE_GUESTS = ['1', '2', '3', '4', '5', '6+'] as const;

export const MOCK_QUEUE_PARTY = ['1', '2', '3', '4', '5+'] as const;

export const MOCK_QUEUE_PREFERENCES = [
  { id: 'salao', label: 'Salão' },
  { id: 'terraco', label: 'Terraço' },
  { id: 'qualquer', label: 'Qualquer' },
] as const;

export const MOCK_CALL_TEAM_OPTIONS = [
  {
    id: 'waiter',
    icon: 'hand-left-outline' as const,
    iconColor: '#FF4B22',
    iconBg: '#FFF0EA',
    title: 'Chamar Garçom',
    subtitle: 'Dúvidas sobre pratos, pedidos especiais',
  },
  {
    id: 'sommelier',
    icon: 'wine-outline' as const,
    iconColor: '#0D9488',
    iconBg: '#E6F7F5',
    title: 'Chamar Sommelier',
    subtitle: 'Harmonização de vinhos e drinks',
  },
  {
    id: 'help',
    icon: 'help-circle-outline' as const,
    iconColor: '#6B7280',
    iconBg: '#F3F4F6',
    title: 'Preciso de Ajuda',
    subtitle: 'Acessibilidade, limpeza, outros',
  },
] as const;
