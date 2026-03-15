/**
 * Demo Client Page — Next Level
 * Guided interactive phone mockup with full client journey
 * Features: QR scan, call waiter, virtual queue, profile, guided tour
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext, type DemoMenuItem, type OrderStatus } from '@/contexts/DemoContext';
import {
  ArrowLeft, ArrowRight, Search, MapPin, Star, Clock, Heart,
  Minus, Plus, ShoppingCart, X, ChevronRight, CreditCard,
  Users, Gift, Check, Loader2, UtensilsCrossed, CalendarDays,
  Sparkles, Crown, QrCode, Bell, User, Settings, LogOut,
  MessageSquare, HandMetal, Timer, Wifi, Camera, ChevronDown,
  Phone, Mail, Award, History, HelpCircle, Zap,
} from 'lucide-react';

// ============ PHONE SHELL ============

const PhoneShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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

// ============ GUIDED TOUR TOOLTIP ============

const GuidedHint: React.FC<{ text: string; pulse?: boolean }> = ({ text, pulse = true }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 mb-4 ${pulse ? 'animate-pulse' : ''}`}>
    <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
    <span className="text-xs text-primary font-medium">{text}</span>
  </div>
);

// ============ BOTTOM NAV ============

type Screen = 
  | 'home' | 'restaurant' | 'menu' | 'item' | 'cart' | 'checkout' 
  | 'order-status' | 'loyalty' | 'reservations' | 'qr-scan' 
  | 'call-waiter' | 'profile' | 'virtual-queue' | 'my-orders';

type NavTab = 'explore' | 'orders' | 'scan' | 'loyalty' | 'profile';

const getNavTab = (screen: Screen): NavTab => {
  if (['home', 'restaurant'].includes(screen)) return 'explore';
  if (['menu', 'item', 'cart', 'checkout', 'order-status', 'my-orders', 'call-waiter'].includes(screen)) return 'orders';
  if (['qr-scan'].includes(screen)) return 'scan';
  if (['loyalty'].includes(screen)) return 'loyalty';
  if (['profile', 'reservations', 'virtual-queue'].includes(screen)) return 'profile';
  return 'explore';
};

const BottomNav: React.FC<{ currentScreen: Screen; onNavigate: (s: Screen) => void; cartCount: number }> = ({ currentScreen, onNavigate, cartCount }) => {
  const activeTab = getNavTab(currentScreen);
  const tabs: { id: NavTab; icon: React.FC<{ className?: string }>; label: string; screen: Screen; badge?: number }[] = [
    { id: 'explore', icon: Search, label: 'Explorar', screen: 'home' },
    { id: 'orders', icon: UtensilsCrossed, label: 'Pedidos', screen: 'my-orders', badge: cartCount },
    { id: 'scan', icon: QrCode, label: 'QR Code', screen: 'qr-scan' },
    { id: 'loyalty', icon: Gift, label: 'Fidelidade', screen: 'loyalty' },
    { id: 'profile', icon: User, label: 'Perfil', screen: 'profile' },
  ];

  return (
    <div className="absolute bottom-[3px] left-[3px] right-[3px] h-[68px] bg-background/95 backdrop-blur border-t border-border flex items-center justify-around px-2 rounded-b-[2.8rem]">
      {tabs.map(({ id, icon: Icon, label, screen, badge }) => (
        <button
          key={id}
          onClick={() => onNavigate(screen)}
          className="flex flex-col items-center gap-0.5 relative py-1 px-2"
        >
          {id === 'scan' ? (
            <div className="w-11 h-11 -mt-5 rounded-full bg-primary flex items-center justify-center shadow-glow">
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
          ) : (
            <div className="relative">
              <Icon className={`w-5 h-5 ${activeTab === id ? 'text-primary' : 'text-muted-foreground'}`} />
              {badge && badge > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </div>
          )}
          <span className={`text-[9px] ${activeTab === id ? 'text-primary font-semibold' : 'text-muted-foreground'} ${id === 'scan' ? 'mt-0' : ''}`}>{label}</span>
        </button>
      ))}
    </div>
  );
};

// ============ SCREENS ============

const HomeScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { restaurant } = useDemoContext();
  return (
    <div className="px-5 pb-4">
      <div className="pt-2 pb-4">
        <p className="text-sm text-muted-foreground">Boa noite 👋</p>
        <h1 className="font-display text-xl font-bold">Descubra experiências</h1>
      </div>

      <GuidedHint text="Toque no restaurante para começar sua jornada" />

      <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3 mb-5">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Buscar restaurantes, pratos...</span>
      </div>

      <div className="flex gap-3 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {['Todos', 'Fine Dining', 'Casual', 'Bar', 'Café'].map((cat, i) => (
          <button key={cat} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Featured */}
      <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-5 group">
        <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3.5 h-3.5 text-accent fill-accent" />
              <span className="text-xs font-semibold text-primary-foreground">{restaurant.rating}</span>
              <span className="text-xs text-primary-foreground/70">({restaurant.reviewCount})</span>
            </div>
            <h3 className="font-display text-lg font-bold text-primary-foreground">{restaurant.name}</h3>
            <p className="text-xs text-primary-foreground/70">{restaurant.cuisine} · {restaurant.priceRange}</p>
          </div>
          <div className="absolute top-3 right-3">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          {/* Tap indicator */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Toque aqui
          </div>
        </div>
      </button>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { icon: QrCode, label: 'Escanear', screen: 'qr-scan' as Screen },
          { icon: CalendarDays, label: 'Reservar', screen: 'reservations' as Screen },
          { icon: Timer, label: 'Fila Virtual', screen: 'virtual-queue' as Screen },
          { icon: UtensilsCrossed, label: 'Cardápio', screen: 'menu' as Screen },
        ].map(({ icon: Icon, label, screen }) => (
          <button key={label} onClick={() => onNavigate(screen)} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>

      {/* Nearby */}
      <h3 className="font-display font-semibold text-sm mb-3">Perto de você</h3>
      {[
        { name: 'Bistrô Aurora', dist: '350m', cuisine: 'Contemporânea', rating: 4.8, active: true },
        { name: 'Sushi Kenzo', dist: '800m', cuisine: 'Japonesa', rating: 4.6 },
        { name: 'La Pasta Fresca', dist: '1.2km', cuisine: 'Italiana', rating: 4.5 },
      ].map((r, i) => (
        <button key={i} onClick={() => r.active ? onNavigate('restaurant') : undefined} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors mb-1">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg">
            {['🌅', '🍣', '🍝'][i]}
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-sm">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.cuisine} · {r.dist}</div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-accent fill-accent" />
            <span className="text-xs font-semibold">{r.rating}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

const RestaurantScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { restaurant } = useDemoContext();
  return (
    <div className="pb-4">
      <div className="relative h-52">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent" />
        <button onClick={() => onNavigate('home')} className="absolute top-2 left-4 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="px-5 -mt-8 relative">
        <h1 className="font-display text-2xl font-bold mb-1">{restaurant.name}</h1>
        <p className="text-sm text-muted-foreground mb-3">{restaurant.description}</p>
        
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="font-semibold">{restaurant.rating}</span>
            <span className="text-muted-foreground">({restaurant.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>350m</span>
          </div>
          <span className="text-muted-foreground">{restaurant.priceRange}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span>{restaurant.hours}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {restaurant.features.map(f => (
            <span key={f} className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">{f}</span>
          ))}
        </div>

        <GuidedHint text="Explore o cardápio ou faça uma reserva" />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => onNavigate('menu')} className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            Ver Cardápio
          </button>
          <button onClick={() => onNavigate('reservations')} className="py-3 rounded-xl border border-border font-semibold text-sm flex items-center justify-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Reservar Mesa
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => onNavigate('qr-scan')} className="py-2.5 rounded-xl bg-muted text-xs font-medium flex flex-col items-center gap-1">
            <QrCode className="w-4 h-4 text-primary" />
            Escanear QR
          </button>
          <button onClick={() => onNavigate('virtual-queue')} className="py-2.5 rounded-xl bg-muted text-xs font-medium flex flex-col items-center gap-1">
            <Timer className="w-4 h-4 text-primary" />
            Fila Virtual
          </button>
          <button onClick={() => onNavigate('call-waiter')} className="py-2.5 rounded-xl bg-muted text-xs font-medium flex flex-col items-center gap-1">
            <HandMetal className="w-4 h-4 text-primary" />
            Chamar Garçom
          </button>
        </div>
      </div>
    </div>
  );
};

const QRScanScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!scanned) {
      const timer = setTimeout(() => setScanned(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [scanned]);

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Escanear QR Code</h1>
        <div className="w-8" />
      </div>

      {!scanned ? (
        <div className="text-center">
          <div className="relative w-56 h-56 mx-auto mb-6 rounded-3xl border-2 border-primary/30 flex items-center justify-center bg-foreground/5">
            <div className="absolute inset-4 border-2 border-primary rounded-2xl" />
            <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
            {/* Scanning line */}
            <div className="absolute left-6 right-6 h-0.5 bg-primary animate-bounce" />
            <Camera className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">Aponte para o QR Code da mesa</p>
          <p className="text-xs text-muted-foreground/60">Escaneando...</p>
          <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto mt-3" />
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Mesa 7 identificada!</h2>
          <p className="text-sm text-muted-foreground mb-1">Bistrô Aurora</p>
          <p className="text-xs text-muted-foreground mb-6">Você está acomodado na Mesa 7 · 4 lugares</p>

          <div className="space-y-3">
            <button onClick={() => onNavigate('menu')} className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              Abrir Cardápio
            </button>
            <button onClick={() => onNavigate('call-waiter')} className="w-full py-3.5 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <HandMetal className="w-4 h-4" />
              Chamar Garçom
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CallWaiterScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const [called, setCalled] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleCall = (type: string) => {
    setCalled(type);
    setTimeout(() => setConfirmed(true), 1500);
  };

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Chamar Equipe</h1>
        <div className="w-8" />
      </div>

      {!confirmed ? (
        <>
          <p className="text-sm text-muted-foreground mb-5">Mesa 7 · Bistrô Aurora</p>
          <div className="space-y-3">
            {[
              { type: 'waiter', icon: HandMetal, label: 'Chamar Garçom', desc: 'Atendimento geral', color: 'bg-primary/10 text-primary' },
              { type: 'sommelier', icon: Star, label: 'Chamar Sommelier', desc: 'Ajuda com vinhos e harmonização', color: 'bg-secondary/10 text-secondary' },
              { type: 'bill', icon: CreditCard, label: 'Pedir a Conta', desc: 'Solicitar fechamento', color: 'bg-accent/10 text-accent-foreground' },
              { type: 'help', icon: HelpCircle, label: 'Preciso de Ajuda', desc: 'Outras necessidades', color: 'bg-muted text-muted-foreground' },
            ].map(({ type, icon: Icon, label, desc, color }) => (
              <button
                key={type}
                onClick={() => handleCall(type)}
                disabled={called !== null}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-all text-left disabled:opacity-50"
              >
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                {called === type && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Chamado enviado!</h2>
          <p className="text-sm text-muted-foreground mb-1">
            {called === 'waiter' && 'O garçom está a caminho da sua mesa.'}
            {called === 'sommelier' && 'O sommelier está a caminho.'}
            {called === 'bill' && 'A conta será preparada em instantes.'}
            {called === 'help' && 'Alguém da equipe irá atendê-lo.'}
          </p>
          <p className="text-xs text-muted-foreground mb-6">Tempo estimado: ~2 min</p>
          <button onClick={() => onNavigate('menu')} className="px-6 py-3 rounded-xl border border-border font-semibold text-sm">
            Voltar ao Cardápio
          </button>
        </div>
      )}
    </div>
  );
};

const VirtualQueueScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const [joined, setJoined] = useState(false);
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Fila Virtual</h1>
        <div className="w-8" />
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 mb-5">
        <span className="text-2xl">🌅</span>
        <div>
          <p className="font-semibold text-sm">Bistrô Aurora</p>
          <p className="text-xs text-muted-foreground">Lotação atual: <span className="text-warning font-semibold">Alta</span></p>
        </div>
      </div>

      {!joined ? (
        <>
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-3">
              <Timer className="w-8 h-8 text-warning" />
            </div>
            <h2 className="font-display text-lg font-bold">3 grupos na fila</h2>
            <p className="text-sm text-muted-foreground">Espera estimada: ~25 min</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-semibold mb-2 block">Quantas pessoas?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, '5+'].map((n, i) => (
                  <button key={n} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${i === 1 ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Preferência</label>
              <div className="flex gap-2">
                {['Salão', 'Terraço', 'Qualquer'].map((p, i) => (
                  <button key={p} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${i === 2 ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => setJoined(true)} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow">
            Entrar na Fila Virtual
          </button>
        </>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Timer className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold mb-1">Você está na fila!</h2>
          <p className="text-sm text-muted-foreground mb-5">Posição: <span className="font-bold text-foreground">4º</span> · Espera: ~25 min</p>
          
          <div className="space-y-2 mb-6">
            {[
              { pos: 1, name: 'Mesa para 4', wait: '5 min' },
              { pos: 2, name: 'Mesa para 2', wait: '12 min' },
              { pos: 3, name: 'Mesa para 6', wait: '18 min' },
              { pos: 4, name: 'Você · Mesa para 2', wait: '~25 min', isYou: true },
            ].map((item) => (
              <div key={item.pos} className={`flex items-center gap-3 p-3 rounded-xl ${item.isYou ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${item.isYou ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {item.pos}
                </span>
                <span className="flex-1 text-sm text-left">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.wait}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mb-4">📲 Você receberá uma notificação quando sua mesa estiver pronta</p>
          <button onClick={() => onNavigate('menu')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">
            Ver Cardápio Enquanto Espera
          </button>
        </div>
      )}
    </div>
  );
};

const ProfileScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { loyaltyPoints } = useDemoContext();
  return (
    <div className="px-5 pb-4">
      <div className="py-4">
        <h1 className="font-display text-xl font-bold">Meu Perfil</h1>
      </div>

      {/* Profile card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 mb-5">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">Usuário Demo</h2>
          <p className="text-xs text-muted-foreground">demo@noowe.com.br</p>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-primary">{loyaltyPoints.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">pontos</p>
        </div>
      </div>

      {/* Level badge */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold">Nível Gold</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full">
          <div className="h-full bg-accent rounded-full" style={{ width: '62%' }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">750 pontos para Platinum</p>
      </div>

      {/* Menu items */}
      <div className="space-y-1">
        {[
          { icon: History, label: 'Histórico de Visitas', screen: 'my-orders' as Screen },
          { icon: CalendarDays, label: 'Minhas Reservas', screen: 'reservations' as Screen },
          { icon: Gift, label: 'Programa de Fidelidade', screen: 'loyalty' as Screen },
          { icon: CreditCard, label: 'Métodos de Pagamento' },
          { icon: Heart, label: 'Restaurantes Favoritos' },
          { icon: Bell, label: 'Notificações' },
          { icon: Settings, label: 'Configurações' },
          { icon: HelpCircle, label: 'Ajuda & Suporte' },
        ].map(({ icon: Icon, label, screen }) => (
          <button
            key={label}
            onClick={() => screen ? onNavigate(screen) : undefined}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-left">{label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          </button>
        ))}
      </div>

      <button className="w-full flex items-center gap-3 p-3 rounded-xl text-destructive hover:bg-destructive/5 transition-colors mt-4">
        <LogOut className="w-5 h-5" />
        <span className="text-sm">Sair</span>
      </button>
    </div>
  );
};

const MyOrdersScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { clientActiveOrder } = useDemoContext();
  return (
    <div className="px-5 pb-4">
      <div className="py-4">
        <h1 className="font-display text-xl font-bold">Meus Pedidos</h1>
      </div>

      {clientActiveOrder && (
        <>
          <GuidedHint text="Você tem um pedido ativo! Toque para acompanhar" />
          <button onClick={() => onNavigate('order-status')} className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-5 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Pedido ativo</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                {clientActiveOrder.status === 'preparing' ? 'Preparando' : clientActiveOrder.status === 'ready' ? 'Pronto!' : 'Em andamento'}
              </span>
            </div>
            <p className="text-sm font-semibold">Bistrô Aurora · Mesa 7</p>
            <p className="text-xs text-muted-foreground">{clientActiveOrder.items.length} itens · R$ {clientActiveOrder.total}</p>
            <div className="flex items-center gap-1 mt-2 text-primary text-xs font-medium">
              <span>Acompanhar</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </>
      )}

      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Últimas visitas</h3>
      {[
        { restaurant: 'Bistrô Aurora', date: 'Hoje', total: 'R$ 186', items: 3, rating: 5 },
        { restaurant: 'Bistrô Aurora', date: 'Há 3 dias', total: 'R$ 312', items: 5, rating: 4 },
        { restaurant: 'Sushi Kenzo', date: 'Há 1 semana', total: 'R$ 248', items: 4, rating: 5 },
      ].map((order, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 mb-1">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-lg">
            {i < 2 ? '🌅' : '🍣'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{order.restaurant}</p>
            <p className="text-xs text-muted-foreground">{order.date} · {order.items} itens</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-display font-bold">{order.total}</p>
            <div className="flex gap-0.5 justify-end">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className={`w-2.5 h-2.5 ${s < order.rating ? 'text-accent fill-accent' : 'text-muted'}`} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const MenuScreen: React.FC<{ onNavigate: (s: Screen) => void; onSelectItem: (item: DemoMenuItem) => void }> = ({ onNavigate, onSelectItem }) => {
  const { menu, cart } = useDemoContext();
  const categories = [...new Set(menu.map(m => m.category))];
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="pb-4">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 px-5 pb-3 pt-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => onNavigate('restaurant')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display font-bold">Cardápio</h1>
          <button onClick={() => onNavigate('cart')} className="relative w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Contextual action bar */}
        <div className="flex gap-2 mb-3">
          <button onClick={() => onNavigate('call-waiter')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium">
            <HandMetal className="w-3 h-3 text-primary" />
            Chamar Garçom
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium">
            <Sparkles className="w-3 h-3 text-secondary" />
            Harmonização IA
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {cartCount === 0 && (
        <div className="px-5">
          <GuidedHint text="Toque em um prato para ver detalhes e adicionar ao pedido" />
        </div>
      )}

      <div className="px-5 space-y-3 mt-2">
        {menu.filter(m => m.category === activeCategory).map(item => (
          <button key={item.id} onClick={() => onSelectItem(item)} className="w-full flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left">
            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
                {item.popular && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold shrink-0">Popular</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-display font-bold text-sm">R$ {item.price}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{item.prepTime}min</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4" style={{ maxWidth: 345, margin: '0 auto' }}>
          <button onClick={() => onNavigate('cart')} className="w-full flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-glow">
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Ver carrinho ({cartCount})
            </span>
            <span className="font-display">R$ {cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const ItemDetailScreen: React.FC<{ item: DemoMenuItem; onNavigate: (s: Screen) => void }> = ({ item, onNavigate }) => {
  const { addToCart } = useDemoContext();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(item, quantity);
    setAdded(true);
    setTimeout(() => onNavigate('menu'), 800);
  };

  return (
    <div className="pb-4">
      <div className="relative h-56">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <button onClick={() => onNavigate('menu')} className="absolute top-2 left-4 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="px-5 -mt-6 relative">
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <div className="flex items-start justify-between mb-2">
            <h1 className="font-display text-xl font-bold">{item.name}</h1>
            {item.popular && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Popular</span>}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
          
          {item.tags && (
            <div className="flex gap-2 mb-3">
              {item.tags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
            <Clock className="w-4 h-4" />
            <span>Preparo: {item.prepTime} min</span>
          </div>

          <div className="flex items-center justify-between mb-5">
            <span className="font-display text-2xl font-bold">R$ {item.price}</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-full border border-border flex items-center justify-center">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-display font-bold text-lg w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={added}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {added ? (
              <><Check className="w-4 h-4" /> Adicionado!</>
            ) : (
              <>Adicionar · R$ {item.price * quantity}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CartScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal } = useDemoContext();

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Seu Pedido</h1>
        <div className="w-8" />
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Seu carrinho está vazio</p>
          <button onClick={() => onNavigate('menu')} className="mt-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
            Ver Cardápio
          </button>
        </div>
      ) : (
        <>
          <GuidedHint text="Revise seu pedido e vá para o pagamento" pulse={false} />
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.menuItem.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <img src={item.menuItem.image} alt={item.menuItem.name} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{item.menuItem.name}</h3>
                  <p className="text-sm font-display font-semibold text-primary">R$ {item.menuItem.price * item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.menuItem.id)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-muted/30 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>R$ {cartTotal}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Taxa de serviço (10%)</span><span>R$ {Math.round(cartTotal * 0.1)}</span></div>
            <div className="border-t border-border pt-2 flex justify-between font-display font-bold">
              <span>Total</span><span>R$ {Math.round(cartTotal * 1.1)}</span>
            </div>
          </div>

          <button onClick={() => onNavigate('checkout')} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-glow mt-5">
            Ir para pagamento · R$ {Math.round(cartTotal * 1.1)}
          </button>
        </>
      )}
    </div>
  );
};

const CheckoutScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { cartTotal, placeOrder } = useDemoContext();
  const [paymentMode, setPaymentMode] = useState<'full' | 'split'>('full');
  const [splitCount, setSplitCount] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(0);
  const total = Math.round(cartTotal * 1.1);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      placeOrder();
      setProcessing(false);
      onNavigate('order-status');
    }, 2000);
  };

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('cart')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Pagamento</h1>
        <div className="w-8" />
      </div>

      <GuidedHint text="Escolha o método de pagamento e confirme" pulse={false} />

      {/* Payment mode */}
      <div className="mb-5">
        <p className="text-sm font-semibold mb-2">Como deseja pagar?</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setPaymentMode('full')} className={`p-3 rounded-xl border text-sm font-medium text-center transition-colors ${paymentMode === 'full' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
            <CreditCard className="w-5 h-5 mx-auto mb-1" />
            Pagar total
          </button>
          <button onClick={() => setPaymentMode('split')} className={`p-3 rounded-xl border text-sm font-medium text-center transition-colors ${paymentMode === 'split' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
            <Users className="w-5 h-5 mx-auto mb-1" />
            Dividir conta
          </button>
        </div>
      </div>

      {paymentMode === 'split' && (
        <div className="mb-5 p-4 rounded-xl bg-muted/30">
          <p className="text-sm font-semibold mb-2">Dividir entre:</p>
          <div className="flex gap-2 mb-2">
            {[2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setSplitCount(n)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  splitCount === n ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="text-center p-3 rounded-lg bg-background">
            <p className="text-xs text-muted-foreground">Cada pessoa paga</p>
            <p className="font-display text-xl font-bold text-primary">R$ {Math.round(total / splitCount)}</p>
          </div>
        </div>
      )}

      {/* Payment method */}
      <div className="mb-5">
        <p className="text-sm font-semibold mb-2">Método</p>
        <div className="space-y-2">
          {[
            { label: 'Cartão ····4892', icon: '💳' },
            { label: 'Apple Pay', icon: '🍎' },
            { label: 'PIX', icon: '📱' },
            { label: 'Google Pay', icon: '🔵' },
          ].map((method, i) => (
            <button
              key={i}
              onClick={() => setSelectedMethod(i)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm transition-colors ${selectedMethod === i ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <span className="text-lg">{method.icon}</span>
              <span className="flex-1 text-left">{method.label}</span>
              {selectedMethod === i && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="mb-5">
        <p className="text-sm font-semibold mb-2">Gorjeta (opcional)</p>
        <div className="flex gap-2">
          {['Nenhuma', '5%', '10%', '15%'].map((tip, i) => (
            <button key={tip} className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${i === 2 ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
              {tip}
            </button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="p-4 rounded-xl bg-muted/30 mb-5">
        <div className="flex justify-between font-display font-bold text-lg">
          <span>Total</span><span>R$ {total}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">+ {Math.floor(total / 10)} pontos de fidelidade</p>
      </div>

      <button onClick={handlePay} disabled={processing} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow disabled:opacity-70 flex items-center justify-center gap-2">
        {processing ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
        ) : (
          <>Confirmar pagamento · R$ {total}</>
        )}
      </button>
    </div>
  );
};

const OrderStatusScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { clientActiveOrder } = useDemoContext();
  const status = clientActiveOrder?.status || 'pending';

  const steps: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'confirmed', label: 'Confirmado', icon: <Check className="w-4 h-4" /> },
    { key: 'preparing', label: 'Preparando', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { key: 'ready', label: 'Pronto', icon: <Bell className="w-4 h-4" /> },
    { key: 'delivered', label: 'Entregue', icon: <Sparkles className="w-4 h-4" /> },
  ];
  const statusIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('my-orders')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Acompanhar Pedido</h1>
        <div className="w-8" />
      </div>

      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          {status === 'pending' && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
          {status === 'confirmed' && <Check className="w-8 h-8 text-primary" />}
          {status === 'preparing' && <UtensilsCrossed className="w-8 h-8 text-primary" />}
          {status === 'ready' && <Bell className="w-8 h-8 text-primary" />}
          {status === 'delivered' && <Sparkles className="w-8 h-8 text-success" />}
        </div>
        <h2 className="font-display text-lg font-bold">
          {status === 'pending' && 'Enviando pedido...'}
          {status === 'confirmed' && 'Pedido confirmado!'}
          {status === 'preparing' && 'Preparando seu pedido...'}
          {status === 'ready' && 'Pedido pronto!'}
          {status === 'delivered' && 'Bom apetite! 🎉'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Mesa 7 · Bistrô Aurora</p>
      </div>

      <div className="space-y-3 mb-6">
        {steps.map((step, i) => {
          const isCompleted = i <= statusIndex;
          const isCurrent = i === statusIndex;
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                {step.icon}
              </div>
              <span className={`text-sm ${isCompleted ? 'font-semibold' : 'text-muted-foreground'}`}>{step.label}</span>
              {isCurrent && <span className="ml-auto text-xs text-primary font-medium animate-pulse">agora</span>}
            </div>
          );
        })}
      </div>

      {clientActiveOrder && (
        <div className="p-4 rounded-xl bg-muted/30 mb-5">
          <h3 className="text-sm font-semibold mb-2">Itens</h3>
          {clientActiveOrder.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span className="text-muted-foreground">{item.quantity}x {item.menuItem.name}</span>
              <span>R$ {item.menuItem.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-display font-bold">
            <span>Total</span><span>R$ {clientActiveOrder.total}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {status === 'delivered' && (
          <button onClick={() => onNavigate('loyalty')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow flex items-center justify-center gap-2">
            <Gift className="w-4 h-4" />
            Ver meus pontos de fidelidade
          </button>
        )}
        <button onClick={() => onNavigate('call-waiter')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
          <HandMetal className="w-4 h-4" />
          Chamar Garçom
        </button>
      </div>
    </div>
  );
};

const LoyaltyScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { loyaltyPoints } = useDemoContext();
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Fidelidade</h1>
        <div className="w-8" />
      </div>

      <div className="relative rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-primary-foreground mb-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <Crown className="w-6 h-6 mb-3 opacity-80" />
        <p className="text-xs opacity-70 uppercase tracking-wider mb-1">Seus Pontos</p>
        <p className="font-display text-4xl font-bold">{loyaltyPoints.toLocaleString()}</p>
        <p className="text-xs opacity-70 mt-2">Nível: Gold · próximo nível em 750 pts</p>
        <div className="mt-3 h-1.5 bg-primary-foreground/20 rounded-full">
          <div className="h-full bg-primary-foreground rounded-full" style={{ width: '62%' }} />
        </div>
      </div>

      {/* Tier badges */}
      <div className="flex gap-2 mb-5">
        {[
          { name: 'Silver', min: 0, color: 'bg-muted text-muted-foreground' },
          { name: 'Gold', min: 1000, color: 'bg-accent/20 text-accent-foreground', active: true },
          { name: 'Platinum', min: 2000, color: 'bg-muted text-muted-foreground/50' },
          { name: 'Black', min: 5000, color: 'bg-muted text-muted-foreground/30' },
        ].map(tier => (
          <div key={tier.name} className={`flex-1 text-center py-2 rounded-lg text-[10px] font-semibold ${tier.color} ${tier.active ? 'ring-1 ring-accent' : ''}`}>
            {tier.name}
          </div>
        ))}
      </div>

      <h3 className="font-display font-semibold text-sm mb-3">Recompensas</h3>
      {[
        { name: 'Sobremesa grátis', points: 500, emoji: '🍰' },
        { name: 'Drink da casa', points: 800, emoji: '🍸' },
        { name: 'Entrada premium', points: 1200, emoji: '🥗' },
        { name: 'Jantar para 2', points: 3000, emoji: '🍽️' },
      ].map((reward, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors mb-1">
          <span className="text-2xl">{reward.emoji}</span>
          <div className="flex-1">
            <p className="font-semibold text-sm">{reward.name}</p>
            <p className="text-xs text-muted-foreground">{reward.points} pontos</p>
          </div>
          <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            loyaltyPoints >= reward.points ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {loyaltyPoints >= reward.points ? 'Resgatar' : `${reward.points - loyaltyPoints} pts`}
          </button>
        </div>
      ))}

      <h3 className="font-display font-semibold text-sm mt-5 mb-3">Histórico</h3>
      {[
        { description: 'Visita ao Bistrô Aurora', points: '+125', date: 'Hoje' },
        { description: 'Bônus de aniversário', points: '+500', date: 'Ontem' },
        { description: 'Resgate: Drink da casa', points: '-800', date: '3 dias atrás' },
      ].map((entry, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
          <div>
            <p className="text-sm">{entry.description}</p>
            <p className="text-xs text-muted-foreground">{entry.date}</p>
          </div>
          <span className={`font-display font-bold text-sm ${entry.points.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
            {entry.points}
          </span>
        </div>
      ))}
    </div>
  );
};

const ReservationsScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(2);
  const [selectedGuests, setSelectedGuests] = useState(1);

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('restaurant')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Reservar Mesa</h1>
        <div className="w-8" />
      </div>

      {!confirmed ? (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 mb-5">
            <span className="text-2xl">🌅</span>
            <div>
              <p className="font-semibold text-sm">Bistrô Aurora</p>
              <p className="text-xs text-muted-foreground">Jardins, São Paulo</p>
            </div>
          </div>

          <GuidedHint text="Selecione data, horário e convidados para reservar" pulse={false} />

          <div className="space-y-4 mb-5">
            <div>
              <label className="text-sm font-semibold mb-2 block">Data</label>
              <div className="flex gap-2">
                {['Hoje', 'Amanhã', 'Sáb 15', 'Dom 16'].map((d, i) => (
                  <button key={d} onClick={() => setSelectedDate(i)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${i === selectedDate ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold mb-2 block">Horário</label>
              <div className="grid grid-cols-4 gap-2">
                {['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'].map((t, i) => (
                  <button key={t} onClick={() => i !== 4 ? setSelectedTime(i) : undefined} className={`py-2 rounded-lg text-xs font-medium border transition-colors ${i === selectedTime ? 'border-primary bg-primary/5 text-primary' : i === 4 ? 'border-border text-muted-foreground/30 cursor-not-allowed line-through' : 'border-border text-muted-foreground'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Convidados</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, '6+'].map((n, i) => (
                  <button key={n} onClick={() => setSelectedGuests(i)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${i === selectedGuests ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Observações</label>
              <div className="w-full p-3 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground min-h-[50px]">
                Aniversário de casamento...
              </div>
            </div>
          </div>

          <button onClick={() => setConfirmed(true)} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow">
            Confirmar Reserva
          </button>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Reserva Confirmada!</h2>
          <p className="text-sm text-muted-foreground mb-1">Bistrô Aurora · Hoje às 20:00</p>
          <p className="text-sm text-muted-foreground mb-5">2 pessoas · Mesa no salão</p>
          <div className="p-4 rounded-xl bg-muted/30 mb-5">
            <p className="text-xs text-muted-foreground">Código de confirmação</p>
            <p className="font-display text-2xl font-bold tracking-widest mt-1">BA-2847</p>
          </div>
          <p className="text-xs text-muted-foreground mb-5">📲 Convide amigos! Compartilhe o link da reserva</p>
          <div className="space-y-2">
            <button onClick={() => onNavigate('menu')} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
              Ver Cardápio do Restaurante
            </button>
            <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">
              Voltar ao início
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ JOURNEY SIDEBAR ============

const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir restaurante', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Escanear QR da mesa', screens: ['qr-scan'] },
  { step: 3, label: 'Explorar o cardápio', screens: ['menu', 'item'] },
  { step: 4, label: 'Montar pedido', screens: ['cart'] },
  { step: 5, label: 'Pagar (ou dividir)', screens: ['checkout'] },
  { step: 6, label: 'Acompanhar pedido', screens: ['order-status'] },
  { step: 7, label: 'Programa de fidelidade', screens: ['loyalty'] },
  { step: 8, label: 'Reservar mesa', screens: ['reservations'] },
  { step: 9, label: 'Fila virtual', screens: ['virtual-queue'] },
  { step: 10, label: 'Chamar garçom', screens: ['call-waiter'] },
];

// ============ MAIN COMPONENT ============

const DemoClientInner = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedItem, setSelectedItem] = useState<DemoMenuItem | null>(null);
  const { cart } = useDemoContext();
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const handleNavigate = (screen: Screen) => setCurrentScreen(screen);
  const handleSelectItem = (item: DemoMenuItem) => { setSelectedItem(item); setCurrentScreen('item'); };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen onNavigate={handleNavigate} />;
      case 'restaurant': return <RestaurantScreen onNavigate={handleNavigate} />;
      case 'menu': return <MenuScreen onNavigate={handleNavigate} onSelectItem={handleSelectItem} />;
      case 'item': return selectedItem ? <ItemDetailScreen item={selectedItem} onNavigate={handleNavigate} /> : null;
      case 'cart': return <CartScreen onNavigate={handleNavigate} />;
      case 'checkout': return <CheckoutScreen onNavigate={handleNavigate} />;
      case 'order-status': return <OrderStatusScreen onNavigate={handleNavigate} />;
      case 'loyalty': return <LoyaltyScreen onNavigate={handleNavigate} />;
      case 'reservations': return <ReservationsScreen onNavigate={handleNavigate} />;
      case 'qr-scan': return <QRScanScreen onNavigate={handleNavigate} />;
      case 'call-waiter': return <CallWaiterScreen onNavigate={handleNavigate} />;
      case 'profile': return <ProfileScreen onNavigate={handleNavigate} />;
      case 'virtual-queue': return <VirtualQueueScreen onNavigate={handleNavigate} />;
      case 'my-orders': return <MyOrdersScreen onNavigate={handleNavigate} />;
    }
  };

  const currentJourneyStep = JOURNEY_STEPS.findIndex(s => s.screens.includes(currentScreen));

  return (
    <>
      <Helmet>
        <title>Demo Cliente | NOOWE — Experiência Interativa</title>
        <meta name="description" content="Experimente o app NOOWE como um cliente real. Descubra restaurantes, faça pedidos, divida a conta e acumule pontos." />
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center py-8 px-6">
        {/* Top bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-6">
          <Link to="/demo" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar à demo
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/demo/restaurant" className="px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors">
              Ver Demo Restaurante →
            </Link>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Demo Cliente</span>
          </div>
        </div>

        <div className="flex gap-10 items-start max-w-6xl w-full justify-center">
          {/* Journey sidebar - left */}
          <div className="hidden lg:block w-64 shrink-0 sticky top-8">
            <h2 className="font-display text-lg font-bold mb-1">Jornada do Cliente</h2>
            <p className="text-xs text-muted-foreground mb-5">Siga os passos ou explore livremente</p>
            
            <div className="space-y-1">
              {JOURNEY_STEPS.map(({ step, label, screens }) => {
                const isActive = screens.includes(currentScreen);
                const isPast = currentJourneyStep > JOURNEY_STEPS.findIndex(s => s === JOURNEY_STEPS.find(j => j.step === step));
                return (
                  <button
                    key={step}
                    onClick={() => handleNavigate(screens[0] as Screen)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                      isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive ? 'bg-primary text-primary-foreground' : isPast ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isPast && !isActive ? <Check className="w-3 h-3" /> : step}
                    </div>
                    <span className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone mockup - center */}
          <div className="relative">
            <PhoneShell>
              {renderScreen()}
            </PhoneShell>
            <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} cartCount={cartCount} />
          </div>

          {/* Info sidebar - right */}
          <div className="hidden xl:block w-72 shrink-0 sticky top-8">
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold mb-2">
                {currentScreen === 'home' && '🏠 Tela Inicial'}
                {currentScreen === 'restaurant' && '🌅 Página do Restaurante'}
                {currentScreen === 'menu' && '📋 Cardápio Digital'}
                {currentScreen === 'item' && '🍽️ Detalhe do Prato'}
                {currentScreen === 'cart' && '🛒 Carrinho'}
                {currentScreen === 'checkout' && '💳 Pagamento'}
                {currentScreen === 'order-status' && '📍 Acompanhamento'}
                {currentScreen === 'loyalty' && '🏆 Fidelidade'}
                {currentScreen === 'reservations' && '📅 Reservas'}
                {currentScreen === 'qr-scan' && '📷 QR Code'}
                {currentScreen === 'call-waiter' && '🙋 Chamar Equipe'}
                {currentScreen === 'profile' && '👤 Perfil'}
                {currentScreen === 'virtual-queue' && '⏱️ Fila Virtual'}
                {currentScreen === 'my-orders' && '📦 Meus Pedidos'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentScreen === 'home' && 'O cliente descobre restaurantes por proximidade, categoria e avaliação.'}
                {currentScreen === 'restaurant' && 'Perfil completo com fotos, avaliações, features e acesso rápido ao cardápio e reservas.'}
                {currentScreen === 'menu' && 'Menu digital com categorias, tags de alérgenos, tempo de preparo e itens populares.'}
                {currentScreen === 'item' && 'Detalhe do prato com foto, descrição, personalização e adição rápida ao carrinho.'}
                {currentScreen === 'cart' && 'Revisão do pedido com ajuste de quantidades, taxa de serviço e subtotal.'}
                {currentScreen === 'checkout' && 'Pagamento com opções de split (dividir conta), gorjeta e múltiplos métodos.'}
                {currentScreen === 'order-status' && 'Acompanhamento em tempo real do pedido com status live da cozinha.'}
                {currentScreen === 'loyalty' && 'Programa de pontos com níveis, recompensas resgatáveis e histórico de acúmulo.'}
                {currentScreen === 'reservations' && 'Reserva rápida com seleção de data, horário, convidados e preferências.'}
                {currentScreen === 'qr-scan' && 'Escaneamento do QR Code da mesa para associação automática.'}
                {currentScreen === 'call-waiter' && 'Chamada discreta da equipe: garçom, sommelier ou conta.'}
                {currentScreen === 'profile' && 'Perfil do cliente com histórico, favoritos e configurações.'}
                {currentScreen === 'virtual-queue' && 'Fila virtual para restaurantes lotados com acompanhamento em tempo real.'}
                {currentScreen === 'my-orders' && 'Histórico de pedidos e acompanhamento de pedidos ativos.'}
              </p>
            </div>

            {/* CTA */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
              <h3 className="font-display font-bold mb-2">Quer isso no seu restaurante?</h3>
              <p className="text-xs text-muted-foreground mb-4">Leve a experiência NOOWE para seus clientes.</p>
              <a
                href="https://wa.me/5511999999999?text=Olá! Vi a demo do app cliente da NOOWE e gostaria de saber mais."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow"
              >
                Falar com a equipe
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const DemoClient = () => (
  <DemoProvider>
    <DemoClientInner />
  </DemoProvider>
);

export default DemoClient;
