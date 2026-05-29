/** Dados mockados da carteira — substituir por API quando integrado */

export const MOCK_WALLET = {
  balance: 124.5,
  cashback: 45,
  points: 850,
  credits: 30,
};

export const MOCK_WALLET_QUICK_ACTIONS = [
  { id: 'add', label: 'Adicionar', icon: 'add-circle', color: '#22C55E' },
  { id: 'transfer', label: 'Transferir', icon: 'paper-plane', color: '#3B82F6' },
  { id: 'qr', label: 'Pagar QR', icon: 'qr-code', color: '#EA580C' },
  { id: 'redeem', label: 'Resgatar', icon: 'gift', color: '#EAB308' },
] as const;

export interface MockPaymentMethod {
  id: string;
  label: string;
  sublabel: string;
  isDefault?: boolean;
}

export const MOCK_PAYMENT_METHODS: MockPaymentMethod[] = [
  {
    id: 'visa',
    label: 'Visa •••• 4242',
    sublabel: 'Cartão de Crédito',
    isDefault: true,
  },
  {
    id: 'master',
    label: 'Mastercard •••• 8821',
    sublabel: 'Cartão de Débito',
  },
  {
    id: 'pix',
    label: 'PIX',
    sublabel: 'Chave CPF',
  },
];

export interface MockWalletTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  amountColor: 'default' | 'positive';
  cashbackNote?: string;
  icon: 'receipt' | 'gift';
}

export const MOCK_WALLET_TRANSACTIONS: MockWalletTransaction[] = [
  {
    id: '1',
    title: 'Bistrô Noowe',
    subtitle: 'Hoje, 20:30',
    amount: 'R$ 148,50',
    cashbackNote: '+R$ 7,42 cashback',
    icon: 'receipt',
  },
  {
    id: '2',
    title: 'Cashback recebido',
    subtitle: 'Ontem',
    amount: '+R$ 12,30',
    amountColor: 'positive',
    icon: 'gift',
  },
  {
    id: '3',
    title: 'Café Noowe',
    subtitle: '28/03',
    amount: 'R$ 32,00',
    cashbackNote: '+R$ 1,60 cashback',
    icon: 'receipt',
  },
];
