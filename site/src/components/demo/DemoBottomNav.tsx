/**
 * DemoBottomNav — Barra de navegação inferior reutilizável
 * Conecta todas as telas das demos de cliente com navegação consistente
 */
import React from 'react';
import { Home, UtensilsCrossed, ClipboardList, Wallet, User } from 'lucide-react';

interface DemoBottomNavProps {
  onNavigate: (screen: string) => void;
  activeScreen: string;
  /** Override dos nomes das telas-alvo */
  screens?: {
    home?: string;
    menu?: string;
    orders?: string;
    wallet?: string;
    profile?: string;
  };
}

const DEFAULT_SCREENS = {
  home: 'home',
  menu: 'menu',
  orders: 'order-status',
  wallet: 'wallet',
  profile: 'profile',
};

const TABS = [
  { key: 'home', icon: Home, label: 'Início' },
  { key: 'menu', icon: UtensilsCrossed, label: 'Cardápio' },
  { key: 'orders', icon: ClipboardList, label: 'Pedidos' },
  { key: 'wallet', icon: Wallet, label: 'Carteira' },
  { key: 'profile', icon: User, label: 'Perfil' },
] as const;

/** Screens where bottom nav should be hidden (full-screen flows) */
const HIDDEN_ON = new Set([
  'auth-login', 'auth-register', 'onboarding',
  'payment', 'qr-scan', 'check-in', 'checkin',
]);

/** Map screens to their tab key for active highlighting */
const SCREEN_TAB_MAP: Record<string, string> = {
  home: 'home', restaurant: 'home', discovery: 'home',
  menu: 'menu', 'item-detail': 'menu', item: 'menu', 'drink-detail': 'menu',
  'floor-menu': 'menu', customize: 'menu', 'builder-base': 'menu',
  'builder-protein': 'menu', 'builder-toppings': 'menu', 'builder-sauce': 'menu',
  'builder-summary': 'menu', 'saved-bowls': 'menu', stations: 'menu',
  'order-status': 'orders', comanda: 'orders', cart: 'orders',
  'my-orders': 'orders', preparing: 'orders', waiting: 'orders',
  'tab-live': 'orders', 'min-spend': 'orders',
  wallet: 'wallet', 'digital-receipt': 'wallet',
  profile: 'profile', support: 'profile', notifications: 'profile',
  loyalty: 'profile', reservations: 'profile',
};

const DemoBottomNav: React.FC<DemoBottomNavProps> = ({ onNavigate, activeScreen, screens: screenOverrides }) => {
  if (HIDDEN_ON.has(activeScreen)) return null;
  
  const screens = { ...DEFAULT_SCREENS, ...screenOverrides };
  const activeTab = SCREEN_TAB_MAP[activeScreen] || '';

  return (
    <div className="sticky bottom-0 z-30 bg-card/95 backdrop-blur-md border-t border-border px-2 py-1.5 flex justify-around">
      {TABS.map(({ key, icon: Icon, label }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(screens[key as keyof typeof screens] || key)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors min-w-[52px] ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
            <span className={`text-[9px] font-medium ${isActive ? 'text-primary' : ''}`}>{label}</span>
            {isActive && <div className="w-4 h-0.5 rounded-full bg-primary mt-0.5" />}
          </button>
        );
      })}
    </div>
  );
};

export default DemoBottomNav;
