/**
 * Demo Client Page
 * Interactive phone mockup showing the full client journey
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext, type DemoMenuItem, type OrderStatus } from '@/contexts/DemoContext';
import {
  ArrowLeft, ArrowRight, Search, MapPin, Star, Clock, Heart,
  Minus, Plus, ShoppingCart, X, ChevronRight, CreditCard,
  Users, Gift, Check, Loader2, UtensilsCrossed, CalendarDays,
  Sparkles, Crown, QrCode, Bell,
} from 'lucide-react';

// ============ PHONE SHELL ============

const PhoneShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative mx-auto" style={{ width: 375, height: 812 }}>
    {/* Phone frame */}
    <div className="absolute inset-0 rounded-[3rem] bg-foreground/90 shadow-2xl" />
    <div className="absolute inset-[3px] rounded-[2.8rem] bg-background overflow-hidden">
      {/* Status bar */}
      <div className="h-12 flex items-center justify-between px-8 text-xs font-semibold text-foreground">
        <span>9:41</span>
        <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-7 bg-foreground/90 rounded-full" />
        <div className="flex items-center gap-1">
          <div className="w-4 h-2.5 border border-foreground/60 rounded-sm relative">
            <div className="absolute inset-[1px] right-[2px] bg-success rounded-[1px]" />
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="h-[calc(100%-48px)] overflow-y-auto">
        {children}
      </div>
    </div>
    {/* Home indicator */}
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/30 rounded-full" />
  </div>
);

// ============ SCREENS ============

type Screen = 'home' | 'restaurant' | 'menu' | 'item' | 'cart' | 'checkout' | 'order-status' | 'loyalty' | 'reservations';

const HomeScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { restaurant } = useDemoContext();
  return (
    <div className="px-5 pb-24">
      {/* Header */}
      <div className="pt-2 pb-4">
        <p className="text-sm text-muted-foreground">Boa noite 👋</p>
        <h1 className="font-display text-xl font-bold">Descubra experiências</h1>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3 mb-6">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Buscar restaurantes, pratos...</span>
      </div>

      {/* Categories */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {['Todos', 'Fine Dining', 'Casual', 'Bar', 'Café'].map((cat, i) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured restaurant */}
      <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-6">
        <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
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
        </div>
      </button>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: QrCode, label: 'QR Code', screen: 'menu' as Screen },
          { icon: CalendarDays, label: 'Reservar', screen: 'reservations' as Screen },
          { icon: Gift, label: 'Fidelidade', screen: 'loyalty' as Screen },
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
        { name: 'Bistrô Aurora', dist: '350m', cuisine: 'Contemporânea', rating: 4.8 },
        { name: 'Sushi Kenzo', dist: '800m', cuisine: 'Japonesa', rating: 4.6 },
        { name: 'La Pasta Fresca', dist: '1.2km', cuisine: 'Italiana', rating: 4.5 },
      ].map((r, i) => (
        <button key={i} onClick={() => i === 0 ? onNavigate('restaurant') : undefined} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors mb-1">
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

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-background/95 backdrop-blur border-t border-border flex items-center justify-around px-4" style={{ maxWidth: 369, margin: '0 auto' }}>
        {[
          { icon: Search, label: 'Explorar', active: true },
          { icon: CalendarDays, label: 'Reservas' },
          { icon: UtensilsCrossed, label: 'Pedidos' },
          { icon: Gift, label: 'Fidelidade' },
          { icon: Users, label: 'Perfil' },
        ].map(({ icon: Icon, label, active }) => (
          <button key={label} className="flex flex-col items-center gap-1">
            <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-[10px] ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const RestaurantScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { restaurant } = useDemoContext();
  return (
    <div className="pb-24">
      <div className="relative h-56">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent" />
        <button onClick={() => onNavigate('home')} className="absolute top-2 left-4 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="px-5 -mt-8 relative">
        <h1 className="font-display text-2xl font-bold mb-1">{restaurant.name}</h1>
        <p className="text-sm text-muted-foreground mb-3">{restaurant.description}</p>
        
        <div className="flex items-center gap-4 mb-4 text-sm">
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

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
          <Clock className="w-3.5 h-3.5" />
          <span>{restaurant.hours}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {restaurant.features.map(f => (
            <span key={f} className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">{f}</span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate('menu')} className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
            Ver Cardápio
          </button>
          <button onClick={() => onNavigate('reservations')} className="py-3 rounded-xl border border-border font-semibold text-sm">
            Reservar Mesa
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuScreen: React.FC<{ onNavigate: (s: Screen) => void; onSelectItem: (item: DemoMenuItem) => void }> = ({ onNavigate, onSelectItem }) => {
  const { menu, cart } = useDemoContext();
  const categories = [...new Set(menu.map(m => m.category))];
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="pb-24">
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

      <div className="px-5 space-y-3 mt-3">
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
        <div className="fixed bottom-4 left-4 right-4" style={{ maxWidth: 345, margin: '0 auto' }}>
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

  return (
    <div className="pb-8">
      <div className="relative h-64">
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
          <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
          
          {item.tags && (
            <div className="flex gap-2 mb-4">
              {item.tags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Clock className="w-4 h-4" />
            <span>Tempo de preparo: {item.prepTime} min</span>
          </div>

          <div className="flex items-center justify-between mb-6">
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
            onClick={() => { addToCart(item, quantity); onNavigate('menu'); }}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow"
          >
            Adicionar · R$ {item.price * quantity}
          </button>
        </div>
      </div>
    </div>
  );
};

const CartScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal } = useDemoContext();

  return (
    <div className="px-5 pb-32">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Seu Pedido</h1>
        <div className="w-8" />
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Seu carrinho está vazio</p>
          <button onClick={() => onNavigate('menu')} className="mt-4 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
            Ver Cardápio
          </button>
        </div>
      ) : (
        <>
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

          <div className="mt-6 p-4 rounded-xl bg-muted/30 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>R$ {cartTotal}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Taxa de serviço (10%)</span><span>R$ {Math.round(cartTotal * 0.1)}</span></div>
            <div className="border-t border-border pt-2 flex justify-between font-display font-bold">
              <span>Total</span><span>R$ {Math.round(cartTotal * 1.1)}</span>
            </div>
          </div>

          <div className="fixed bottom-4 left-4 right-4" style={{ maxWidth: 345, margin: '0 auto' }}>
            <button onClick={() => onNavigate('checkout')} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-glow">
              Ir para pagamento · R$ {Math.round(cartTotal * 1.1)}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const CheckoutScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { cartTotal, placeOrder } = useDemoContext();
  const [paymentMode, setPaymentMode] = useState<'full' | 'split'>('full');
  const [processing, setProcessing] = useState(false);
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
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('cart')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Pagamento</h1>
        <div className="w-8" />
      </div>

      {/* Payment mode */}
      <div className="mb-6">
        <p className="text-sm font-semibold mb-3">Como deseja pagar?</p>
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
        <div className="mb-6 p-4 rounded-xl bg-muted/30">
          <p className="text-sm font-semibold mb-3">Dividir igualmente entre:</p>
          <div className="flex gap-2">
            {[2, 3, 4].map(n => (
              <button key={n} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:border-primary hover:text-primary transition-colors">
                {n} pessoas
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Cada um paga R$ {Math.round(total / 2)}</p>
        </div>
      )}

      {/* Payment method */}
      <div className="mb-6">
        <p className="text-sm font-semibold mb-3">Método de pagamento</p>
        <div className="space-y-2">
          {[
            { label: 'Cartão de crédito ····4892', icon: '💳', selected: true },
            { label: 'Apple Pay', icon: '🍎' },
            { label: 'PIX', icon: '📱' },
          ].map((method, i) => (
            <button key={i} className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm transition-colors ${method.selected ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <span className="text-lg">{method.icon}</span>
              <span className="flex-1 text-left">{method.label}</span>
              {method.selected && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl bg-muted/30 mb-6">
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
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between py-4">
        <div className="w-8" />
        <h1 className="font-display font-bold">Acompanhar Pedido</h1>
        <div className="w-8" />
      </div>

      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          {status === 'pending' && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
          {status === 'confirmed' && <Check className="w-8 h-8 text-primary" />}
          {status === 'preparing' && <UtensilsCrossed className="w-8 h-8 text-primary animate-bounce-subtle" />}
          {status === 'ready' && <Bell className="w-8 h-8 text-primary animate-bounce-subtle" />}
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

      {/* Progress steps */}
      <div className="space-y-4 mb-8">
        {steps.map((step, i) => {
          const isCompleted = i <= statusIndex;
          const isCurrent = i === statusIndex;
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              } ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                {step.icon}
              </div>
              <span className={`text-sm ${isCompleted ? 'font-semibold' : 'text-muted-foreground'}`}>{step.label}</span>
              {isCurrent && <span className="ml-auto text-xs text-primary font-medium animate-pulse">agora</span>}
            </div>
          );
        })}
      </div>

      {/* Order items */}
      {clientActiveOrder && (
        <div className="p-4 rounded-xl bg-muted/30 mb-6">
          <h3 className="text-sm font-semibold mb-3">Itens do pedido</h3>
          {clientActiveOrder.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5">
              <span className="text-muted-foreground">{item.quantity}x {item.menuItem.name}</span>
              <span>R$ {item.menuItem.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-display font-bold">
            <span>Total</span><span>R$ {clientActiveOrder.total}</span>
          </div>
        </div>
      )}

      {status === 'delivered' && (
        <button onClick={() => onNavigate('loyalty')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow">
          Ver meus pontos de fidelidade
        </button>
      )}
    </div>
  );
};

const LoyaltyScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  const { loyaltyPoints } = useDemoContext();
  return (
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Fidelidade</h1>
        <div className="w-8" />
      </div>

      {/* Points card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-primary-foreground mb-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <Crown className="w-6 h-6 mb-3 opacity-80" />
        <p className="text-xs opacity-70 uppercase tracking-wider mb-1">Seus Pontos</p>
        <p className="font-display text-4xl font-bold">{loyaltyPoints.toLocaleString()}</p>
        <p className="text-xs opacity-70 mt-2">Nível: Gold · próximo nível em 750 pts</p>
        <div className="mt-3 h-1.5 bg-primary-foreground/20 rounded-full">
          <div className="h-full bg-primary-foreground rounded-full" style={{ width: '62%' }} />
        </div>
      </div>

      {/* Rewards */}
      <h3 className="font-display font-semibold text-sm mb-3">Recompensas disponíveis</h3>
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
            loyaltyPoints >= reward.points
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}>
            {loyaltyPoints >= reward.points ? 'Resgatar' : 'Faltam ' + (reward.points - loyaltyPoints)}
          </button>
        </div>
      ))}

      {/* Recent history */}
      <h3 className="font-display font-semibold text-sm mt-6 mb-3">Histórico recente</h3>
      {[
        { description: 'Visita ao Bistrô Aurora', points: '+125', date: 'Hoje' },
        { description: 'Bônus de aniversário', points: '+500', date: 'Ontem' },
        { description: 'Resgate: Drink da casa', points: '-800', date: '3 dias atrás' },
      ].map((entry, i) => (
        <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
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
  return (
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold">Reservar Mesa</h1>
        <div className="w-8" />
      </div>

      {!confirmed ? (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 mb-6">
            <span className="text-2xl">🌅</span>
            <div>
              <p className="font-semibold text-sm">Bistrô Aurora</p>
              <p className="text-xs text-muted-foreground">Jardins, São Paulo</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-semibold mb-2 block">Data</label>
              <div className="flex gap-2">
                {['Hoje', 'Amanhã', 'Sáb 15', 'Dom 16'].map((d, i) => (
                  <button key={d} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${i === 0 ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold mb-2 block">Horário</label>
              <div className="grid grid-cols-4 gap-2">
                {['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'].map((t, i) => (
                  <button key={t} className={`py-2 rounded-lg text-xs font-medium border transition-colors ${i === 2 ? 'border-primary bg-primary/5 text-primary' : i === 4 ? 'border-border text-muted-foreground/30 cursor-not-allowed' : 'border-border text-muted-foreground'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Convidados</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, '6+'].map((n, i) => (
                  <button key={n} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${i === 1 ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Observações</label>
              <div className="w-full p-3 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground min-h-[60px]">
                Aniversário de casamento...
              </div>
            </div>
          </div>

          <button onClick={() => setConfirmed(true)} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow">
            Confirmar Reserva
          </button>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Reserva Confirmada!</h2>
          <p className="text-sm text-muted-foreground mb-1">Bistrô Aurora · Hoje às 20:00</p>
          <p className="text-sm text-muted-foreground mb-6">2 pessoas · Mesa no salão</p>
          <div className="p-4 rounded-xl bg-muted/30 mb-6">
            <p className="text-xs text-muted-foreground">Código de confirmação</p>
            <p className="font-display text-2xl font-bold tracking-widest mt-1">BA-2847</p>
          </div>
          <button onClick={() => onNavigate('home')} className="px-8 py-3 rounded-xl border border-border font-semibold text-sm">
            Voltar ao início
          </button>
        </div>
      )}
    </div>
  );
};

// ============ MAIN COMPONENT ============

const DemoClientInner = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedItem, setSelectedItem] = useState<DemoMenuItem | null>(null);

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
    }
  };

  return (
    <>
      <Helmet>
        <title>Demo Cliente | NOOWE</title>
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center py-12 px-6">
        {/* Top bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8">
          <Link to="/demo" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar à demo
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Demo Cliente</span>
          </div>
        </div>

        <div className="flex gap-12 items-start">
          {/* Phone mockup */}
          <PhoneShell>
            {renderScreen()}
          </PhoneShell>

          {/* Side info */}
          <div className="hidden lg:block max-w-sm pt-8">
            <h2 className="font-display text-2xl font-bold mb-3">Experiência do Cliente</h2>
            <p className="text-muted-foreground mb-6">
              Navegue pelo app como um cliente faria. Descubra restaurantes, explore o menu, faça pedidos e acompanhe em tempo real.
            </p>
            
            <div className="space-y-3">
              {[
                { step: '1', label: 'Explore o restaurante e o menu', screen: 'home' },
                { step: '2', label: 'Adicione itens ao carrinho', screen: 'menu' },
                { step: '3', label: 'Faça o checkout e pague', screen: 'cart' },
                { step: '4', label: 'Acompanhe o pedido em tempo real', screen: 'order-status' },
                { step: '5', label: 'Acumule pontos de fidelidade', screen: 'loyalty' },
              ].map(({ step, label, screen }) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    currentScreen === screen ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentScreen === screen ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  <span className={`text-sm ${currentScreen === screen ? 'font-semibold' : 'text-muted-foreground'}`}>{label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 p-5 rounded-2xl bg-card border border-border">
              <h3 className="font-display font-bold mb-2">Gostou do que viu?</h3>
              <p className="text-sm text-muted-foreground mb-4">Leve essa experiência para o seu restaurante.</p>
              <a
                href="https://wa.me/5511999999999?text=Olá! Vi a demo do app cliente da NOOWE e gostaria de saber mais."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm"
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
