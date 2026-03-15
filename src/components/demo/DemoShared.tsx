/**
 * Shared Demo Components — PhoneShell, BottomNav, GuidedHint, ServiceTypeSelector, ItemIcon
 */
import React from 'react';
import {
  Search, QrCode, Gift, User, UtensilsCrossed, Wifi, Zap,
  Check, Bell, Coffee, Beer, Wine, Music, Car, Truck, ChefHat,
  Leaf, Flame, Scale, Timer, Ticket, MapPin, ShoppingBag,
  Droplets, Sandwich, CakeSlice, IceCream, Soup, Fish, Egg,
  Cherry, Grape, Pizza, Salad,
} from 'lucide-react';

// ============ ITEM ICON — Replaces emojis with consistent Lucide icons ============
const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  burger: UtensilsCrossed, chicken: UtensilsCrossed, meat: Flame, steak: Flame,
  fries: UtensilsCrossed, sides: UtensilsCrossed, nuggets: UtensilsCrossed,
  salad: Leaf, veggie: Leaf, healthy: Leaf, bowl: Leaf, wrap: Leaf,
  coffee: Coffee, tea: Coffee, cafe: Coffee, bakery: CakeSlice,
  beer: Beer, chopp: Beer, drink: Wine, cocktail: Wine, wine: Wine,
  soda: Droplets, juice: Droplets, water: Droplets, milkshake: Droplets,
  pizza: Pizza, pasta: UtensilsCrossed, italian: UtensilsCrossed,
  sushi: Fish, seafood: Fish, fish: Fish, shrimp: Fish,
  taco: UtensilsCrossed, mexican: UtensilsCrossed, burrito: UtensilsCrossed,
  dessert: CakeSlice, cake: CakeSlice, cookie: CakeSlice, brownie: CakeSlice,
  icecream: IceCream, sundae: IceCream,
  soup: Soup, bread: Sandwich, sandwich: Sandwich,
  egg: Egg, cheese: UtensilsCrossed, tofu: Leaf,
  fruit: Cherry, acai: Grape,
  quick: Zap, express: Zap, fast: Zap,
  car: Car, drive: Car, truck: Truck, foodtruck: Truck,
  chef: ChefHat, kitchen: ChefHat,
  music: Music, club: Music, dj: Music,
  buffet: Scale, weigh: Scale,
  queue: Timer, wait: Timer,
  ticket: Ticket, event: Ticket,
  location: MapPin, map: MapPin,
  order: ShoppingBag, bag: ShoppingBag,
  generic: UtensilsCrossed,
};

export const ItemIcon: React.FC<{
  cat?: string;
  icon?: React.FC<{ className?: string }>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  gradient?: string;
  className?: string;
}> = ({ cat = 'generic', icon, size = 'md', gradient, className = '' }) => {
  const sizeMap = {
    xs: { container: 'w-7 h-7 rounded-lg', icon: 'w-3.5 h-3.5' },
    sm: { container: 'w-8 h-8 rounded-lg', icon: 'w-4 h-4' },
    md: { container: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
    lg: { container: 'w-12 h-12 rounded-xl', icon: 'w-6 h-6' },
    xl: { container: 'w-16 h-16 rounded-2xl', icon: 'w-8 h-8' },
    hero: { container: 'w-20 h-20 rounded-2xl', icon: 'w-10 h-10' },
  };
  const s = sizeMap[size];
  const IconComp = icon || CATEGORY_ICONS[cat.toLowerCase()] || UtensilsCrossed;
  const bg = gradient || 'bg-primary/10';
  return (
    <div className={`${s.container} ${bg} flex items-center justify-center shrink-0 ${className}`}>
      <IconComp className={`${s.icon} text-primary`} />
    </div>
  );
};

// ============ PHONE SHELL ============
export const PhoneShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative mx-auto shrink-0" style={{ width: 375, height: 812 }}>
    <div className="absolute inset-0 rounded-[3rem] bg-foreground/90 shadow-2xl" />
    <div className="absolute inset-[3px] rounded-[2.8rem] bg-background overflow-hidden">
      <div className="h-12 flex items-center justify-between px-8 text-xs font-semibold text-foreground">
        <span>9:41</span>
        <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-7 bg-foreground/90 rounded-full" />
        <div className="flex items-center gap-1">
          <Wifi className="w-3.5 h-3.5" />
          <div className="w-4 h-2.5 border border-foreground/60 rounded-sm relative">
            <div className="absolute inset-[1px] right-[2px] bg-success rounded-[1px]" />
          </div>
        </div>
      </div>
      <div className="h-[calc(100%-48px-68px)] overflow-y-auto scrollbar-hide">
        {children}
      </div>
    </div>
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/30 rounded-full" />
  </div>
);

// ============ GUIDED HINT ============
export const GuidedHint: React.FC<{ text: string; pulse?: boolean }> = ({ text, pulse = true }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 mb-4 ${pulse ? 'animate-pulse' : ''}`}>
    <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
    <span className="text-xs text-primary font-medium">{text}</span>
  </div>
);

// ============ NAV TYPES ============
export type NavTab = 'explore' | 'orders' | 'scan' | 'loyalty' | 'profile';

// ============ BOTTOM NAV ============
export const BottomNav: React.FC<{
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  cartCount?: number;
  notifCount?: number;
}> = ({ activeTab, onTabChange, cartCount = 0, notifCount = 0 }) => {
  const tabs: { id: NavTab; icon: React.FC<{ className?: string }>; label: string; badge?: number }[] = [
    { id: 'explore', icon: Search, label: 'Explorar' },
    { id: 'orders', icon: UtensilsCrossed, label: 'Pedidos', badge: cartCount },
    { id: 'scan', icon: QrCode, label: 'QR Code' },
    { id: 'loyalty', icon: Gift, label: 'Fidelidade' },
    { id: 'profile', icon: User, label: 'Perfil', badge: notifCount },
  ];

  return (
    <div className="absolute bottom-[3px] left-[3px] right-[3px] h-[68px] bg-background/95 backdrop-blur border-t border-border flex items-center justify-around px-2 rounded-b-[2.8rem]">
      {tabs.map(({ id, icon: Icon, label, badge }) => (
        <button key={id} onClick={() => onTabChange(id)} className="flex flex-col items-center gap-0.5 relative py-1 px-2">
          {id === 'scan' ? (
            <div className="w-11 h-11 -mt-5 rounded-full bg-primary flex items-center justify-center shadow-glow">
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
          ) : (
            <div className="relative">
              <Icon className={`w-5 h-5 ${activeTab === id ? 'text-primary' : 'text-muted-foreground'}`} />
              {badge && badge > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">{badge}</span>
              )}
            </div>
          )}
          <span className={`text-[9px] ${activeTab === id ? 'text-primary font-semibold' : 'text-muted-foreground'} ${id === 'scan' ? 'mt-0' : ''}`}>{label}</span>
        </button>
      ))}
    </div>
  );
};

// ============ SERVICE TYPE CONFIG ============
export interface ServiceTypeDemo {
  id: string;
  name: string;
  emoji: string;
  restaurant: string;
  tagline: string;
  color: string;
}

export const SERVICE_TYPES: ServiceTypeDemo[] = [
  { id: 'fine-dining', name: 'Fine Dining', emoji: '🍷', restaurant: 'Bistrô Noowe', tagline: 'Experiência gastronômica premium', color: 'from-rose-900/20 to-amber-900/20' },
  { id: 'quick-service', name: 'Quick Service', emoji: '⚡', restaurant: 'NOOWE Express', tagline: 'Velocidade e conveniência', color: 'from-yellow-500/20 to-orange-500/20' },
  { id: 'fast-casual', name: 'Fast Casual', emoji: '🥗', restaurant: 'NOOWE Fresh', tagline: 'Monte seu prato ideal', color: 'from-green-500/20 to-emerald-500/20' },
  { id: 'cafe-bakery', name: 'Café & Padaria', emoji: '☕', restaurant: 'Café Noowe', tagline: 'Seu espaço, seu ritmo', color: 'from-amber-700/20 to-orange-800/20' },
  { id: 'buffet', name: 'Buffet', emoji: '🍽️', restaurant: 'Sabores Noowe', tagline: 'Sirva-se à vontade', color: 'from-orange-500/20 to-red-500/20' },
  { id: 'drive-thru', name: 'Drive-Thru', emoji: '🚗', restaurant: 'NOOWE Drive', tagline: 'Sem sair do carro', color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'food-truck', name: 'Food Truck', emoji: '🚚', restaurant: 'Taco Noowe', tagline: 'Comida de rua premium', color: 'from-lime-500/20 to-green-500/20' },
  { id: 'chefs-table', name: "Chef's Table", emoji: '👨‍🍳', restaurant: 'Mesa do Chef Noowe', tagline: 'Exclusividade absoluta', color: 'from-zinc-800/20 to-stone-700/20' },
  { id: 'casual-dining', name: 'Casual Dining', emoji: '🍕', restaurant: 'Cantina Noowe', tagline: 'Sabor em família', color: 'from-red-500/20 to-orange-500/20' },
  { id: 'pub-bar', name: 'Pub & Bar', emoji: '🍺', restaurant: 'Noowe Tap House', tagline: 'Drinks e boa companhia', color: 'from-amber-600/20 to-yellow-700/20' },
  { id: 'club', name: 'Club & Balada', emoji: '🎵', restaurant: 'NOOWE Club', tagline: 'Noite sem limites', color: 'from-purple-600/20 to-pink-600/20' },
];

// ============ JOURNEY STEP TYPE ============
export interface JourneyStep {
  step: number;
  label: string;
  screens: string[];
}

export interface ScreenInfo {
  emoji: string;
  title: string;
  desc: string;
}
