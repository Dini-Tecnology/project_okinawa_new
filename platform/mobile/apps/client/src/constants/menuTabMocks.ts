import type { ImageSourcePropType } from 'react-native';

/** Dados mockados do cardápio — substituir por API quando integrado */

export const MOCK_MENU_RESTAURANT = {
  id: 'mock-bistro-noowe',
  tableNumber: '12',
};

export const MOCK_MENU_CATEGORIES = [
  { id: 'entradas', label: 'Entradas' },
  { id: 'principais', label: 'Pratos Principais' },
  { id: 'sobremesas', label: 'Sobremesas' },
] as const;

export type MockMenuCategoryId = (typeof MOCK_MENU_CATEGORIES)[number]['id'];

export interface MockMenuItem {
  id: string;
  categoryId: MockMenuCategoryId;
  name: string;
  description: string;
  price: number;
  prepMinutes: number;
  popular?: boolean;
  dietaryTags?: string[];
  image: ImageSourcePropType;
}

export function getMockMenuItem(itemId: string): MockMenuItem | undefined {
  return MOCK_MENU_ITEMS.find((item) => item.id === itemId);
}

export const MOCK_MENU_ITEMS: MockMenuItem[] = [
  {
    id: '1',
    categoryId: 'entradas',
    name: 'Tartare de Atum',
    description: 'Atum fresco com abacate, gergelim negro e ponzu cítrico.',
    price: 58,
    prepMinutes: 8,
    popular: true,
    dietaryTags: ['Sem Glúten'],
    image: require('../../assets/menu-mock/tartare.jpg'),
  },
  {
    id: '2',
    categoryId: 'entradas',
    name: 'Carpaccio de Salmão',
    description: 'Salmão curado, alcaparras, rúcula e azeite trufado',
    price: 52,
    prepMinutes: 10,
    image: require('../../assets/menu-mock/salmon.jpg'),
  },
  {
    id: '3',
    categoryId: 'entradas',
    name: 'Burrata com Tomates',
    description: 'Burrata cremosa, tomates confitados e pesto de manjericão',
    price: 48,
    prepMinutes: 12,
    popular: true,
    image: require('../../assets/menu-mock/burrata.jpg'),
  },
  {
    id: '4',
    categoryId: 'principais',
    name: 'Filé ao Molho Madeira',
    description: 'Filé mignon 200g, purê trufado e legumes grelhados',
    price: 98,
    prepMinutes: 25,
    popular: true,
    image: require('../../assets/menu-mock/file.jpg'),
  },
  {
    id: '5',
    categoryId: 'principais',
    name: 'Risoto de Cogumelos',
    description: 'Arborio, mix de cogumelos selvagens e parmesão',
    price: 72,
    prepMinutes: 22,
    image: require('../../assets/menu-mock/risotto.jpg'),
  },
  {
    id: '6',
    categoryId: 'sobremesas',
    name: 'Petit Gateau',
    description: 'Chocolate belga, sorvete de baunilha e calda quente',
    price: 38,
    prepMinutes: 15,
    popular: true,
    image: require('../../assets/menu-mock/gateau.jpg'),
  },
  {
    id: '7',
    categoryId: 'sobremesas',
    name: 'Mousse de Chocolate',
    description: 'Chocolate 70%, creme fresco e raspas de cacau',
    price: 32,
    prepMinutes: 5,
    image: require('../../assets/menu-mock/mousse.jpg'),
  },
];
