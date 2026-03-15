/**
 * Quick Service Demo — NOOWE Express  
 * Deep journey: Discover → Skip the Line → Menu with Combos → Item Customization → Cart → Payment → Live Prep Tracking → Pickup → Rating
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint, ItemIcon } from '../DemoShared';
import { FoodImg } from '../FoodImages';
import {
  ArrowLeft, Search, Star, Clock, Minus, Plus, Check, Loader2,
  Zap, Timer, QrCode, ChevronRight, CreditCard, Gift, Smartphone,
  ChefHat, CheckCircle, MapPin, ShoppingBag, ArrowRight, Receipt,
  Flame, X, Heart, Nfc, Wallet, Award, ChevronDown, AlertCircle,
  Bell, Users,
} from 'lucide-react';

type Screen = 'home' | 'restaurant' | 'menu' | 'item' | 'cart' | 'payment' | 'preparing' | 'ready' | 'rating';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  img: string;
  customizations?: string[];
}

const MENU = [
  { id: 'q1', name: 'Smash Burger Classic', price: 29, cat: 'Burgers', time: 5, img: 'burger', desc: 'Blend especial 150g, queijo cheddar, alface, tomate, molho da casa', popular: true, cals: 520 },
  { id: 'q2', name: 'Smash Burger Duplo', price: 39, cat: 'Burgers', time: 6, img: 'burger-double', desc: 'Dois blends 150g, duplo cheddar, bacon crocante, molho especial', popular: true, cals: 780 },
  { id: 'q3', name: 'Chicken Crispy', price: 32, cat: 'Burgers', time: 6, img: 'chicken-burger', desc: 'Frango empanado crocante, coleslaw, maionese sriracha', cals: 480 },
  { id: 'q4', name: 'Veggie Smash', price: 28, cat: 'Burgers', time: 5, img: 'veggie-burger', desc: 'Hambúrguer de grão de bico, rúcula, tomate seco, tahini', cals: 380 },
  { id: 'q5', name: 'Batata Frita G', price: 18, cat: 'Acompanhamentos', time: 4, img: 'fries', desc: 'Batata frita crocante com sal e orégano', cals: 320 },
  { id: 'q6', name: 'Onion Rings (8un)', price: 16, cat: 'Acompanhamentos', time: 4, img: 'onion-rings', desc: 'Anéis de cebola empanados com molho ranch', cals: 280 },
  { id: 'q7', name: 'Nuggets (10un)', price: 22, cat: 'Acompanhamentos', time: 5, img: 'nuggets', desc: 'Nuggets artesanais com 3 molhos à escolha', cals: 350 },
  { id: 'q8', name: 'Milkshake Nutella', price: 22, cat: 'Bebidas', time: 3, img: 'milkshake', desc: 'Milkshake cremoso com Nutella e chantilly', cals: 450 },
  { id: 'q9', name: 'Milkshake Oreo', price: 22, cat: 'Bebidas', time: 3, img: 'milkshake-oreo', desc: 'Milkshake com Oreo triturado e calda de chocolate', cals: 420 },
  { id: 'q10', name: 'Refrigerante 500ml', price: 9, cat: 'Bebidas', time: 1, img: 'soda', desc: 'Coca-Cola, Guaraná ou Sprite', cals: 140 },
  { id: 'q11', name: 'Suco Natural 400ml', price: 14, cat: 'Bebidas', time: 2, img: 'juice', desc: 'Laranja, Limão com Hortelã ou Maracujá', cals: 120 },
  { id: 'q12', name: 'Sundae', price: 14, cat: 'Sobremesas', time: 2, img: 'sundae', desc: 'Chocolate, Morango ou Caramelo com granulado', cals: 280 },
  { id: 'q13', name: 'Cookie Gigante', price: 12, cat: 'Sobremesas', time: 1, img: 'cookie', desc: 'Cookie artesanal com gotas de chocolate belga', cals: 320 },
];

const COMBOS = [
  { id: 'combo1', name: 'Combo Classic', items: ['Smash Burger Classic', 'Batata Frita G', 'Refri 500ml'], price: 42, original: 56, img: 'combo', time: 6 },
  { id: 'combo2', name: 'Combo Duplo', items: ['Smash Burger Duplo', 'Batata Frita G', 'Milkshake'], price: 62, original: 79, img: 'combo', time: 7 },
  { id: 'combo3', name: 'Combo Kids', items: ['Nuggets (6un)', 'Batata P', 'Suco'], price: 32, original: 42, img: 'nuggets', time: 5 },
];

const CUSTOMIZATIONS = {
  extras: [
    { id: 'bacon', name: 'Bacon Crocante', price: 6 },
    { id: 'cheddar', name: 'Cheddar Extra', price: 4 },
    { id: 'egg', name: 'Ovo Frito', price: 5 },
    { id: 'jalapeno', name: 'Jalapeño', price: 3 },
  ],
  remove: ['Cebola', 'Tomate', 'Alface', 'Molho', 'Picles'],
};

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir restaurante', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Skip the Line & menu', screens: ['menu'] },
  { step: 3, label: 'Personalizar item', screens: ['item'] },
  { step: 4, label: 'Revisar carrinho', screens: ['cart'] },
  { step: 5, label: 'Pagamento rápido', screens: ['payment'] },
  { step: 6, label: 'Acompanhar preparo', screens: ['preparing'] },
  { step: 7, label: 'Retirar pedido', screens: ['ready'] },
  { step: 8, label: 'Avaliar & fidelidade', screens: ['rating'] },
];

export const SCREEN_INFO: Record<string, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'Encontre Quick Services com Skip the Line: peça antes de chegar e retire sem fila.' },
  'restaurant': { emoji: '⚡', title: 'NOOWE Express', desc: 'Restaurante focado em velocidade com pedido antecipado, combos otimizados e prep time visível.' },
  'menu': { emoji: '📋', title: 'Menu Rápido', desc: 'Combos em destaque, menu categorizado por tipo, tempo de preparo por item e montagem de carrinho.' },
  'item': { emoji: '🍔', title: 'Personalizar Item', desc: 'Customize: extras pagos (bacon, cheddar), remoção de ingredientes, tamanho e observações.' },
  'cart': { emoji: '🛒', title: 'Carrinho', desc: 'Revisão completa com quantidades, cupom de desconto, tempo estimado total e modo de retirada.' },
  'payment': { emoji: '💳', title: 'Pagamento', desc: 'PIX, cartão, Apple Pay, Google Pay ou carteira NOOWE. Pontos de fidelidade podem ser usados.' },
  'preparing': { emoji: '👨‍🍳', title: 'Preparo ao Vivo', desc: 'Tracking em 4 etapas: Recebido → Preparando → Conferência → Pronto. Push notification automática.' },
  'ready': { emoji: '✅', title: 'Pronto!', desc: 'Código de retirada, tempo total, balcão express designado e registro de velocidade.' },
  'rating': { emoji: '⭐', title: 'Avaliar', desc: 'Avaliação por categorias (velocidade, sabor, atendimento), pontos de fidelidade ganhos e stamp card.' },
};

interface Props { onNavigate: (s: string) => void; screen: string; }

export const QuickServiceDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<typeof MENU[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState('Combos');
  const [prepStage, setPrepStage] = useState(0);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [itemQty, setItemQty] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('pix');
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingTags, setRatingTags] = useState<string[]>([]);

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const estTime = Math.max(...cart.map(c => {
    const item = MENU.find(m => m.id === c.id);
    return item?.time || 5;
  }), 5);

  const addToCart = (item: { id: string; name: string; price: number; img: string }, qty: number, customs?: string[]) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing && !customs?.length) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + qty } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, qty, img: item.img, customizations: customs }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  // Prep tracking simulation
  useEffect(() => {
    if (screen === 'preparing') {
      setPrepStage(0);
      const stages = [1000, 3000, 5500, 8000];
      const timers = stages.map((t, i) => setTimeout(() => setPrepStage(i + 1), t));
      const final = setTimeout(() => onNavigate('ready'), 9500);
      return () => { timers.forEach(clearTimeout); clearTimeout(final); };
    }
  }, [screen]);

  const categories = ['Combos', ...new Set(MENU.map(m => m.cat))];

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bom dia</p>
              <h1 className="font-display text-xl font-bold">Pedido rápido</h1>
            </div>
            <button className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <GuidedHint text="Toque para fazer um pedido antecipado e pular a fila" />

          <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3 mb-5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Buscar restaurantes rápidos...</span>
          </div>

          <div className="flex gap-3 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {['Skip the Line', 'Burgers', 'Pizza', 'Açaí', 'Saudável'].map((cat, i) => (
              <button key={cat} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
            ))}
          </div>

          {/* Featured restaurant */}
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-5 group">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <ItemIcon cat="quick" size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">NOOWE Express</h3>
                    <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-bold">Aberto</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Fast Food Premium · R$ · 350m</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-semibold">4.5</span><span className="text-xs text-muted-foreground">(1.2k)</span></div>
                    <span className="text-xs text-muted-foreground">· Tempo médio: 5 min</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">Skip the Line — Peça antes de chegar!</span>
              </div>
            </div>
          </button>

          {/* Other nearby */}
          <h3 className="font-display font-semibold text-sm mb-3">Mais por perto</h3>
          {[
            { name: 'Burger Bros', dist: '800m', time: '8 min', rating: 4.3, cat: 'burger' },
            { name: 'Frango & Cia', dist: '1.2km', time: '10 min', rating: 4.1, cat: 'chicken' },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 mb-1">
              <ItemIcon cat={r.cat} />
              <div className="flex-1"><p className="font-semibold text-sm">{r.name}</p><p className="text-xs text-muted-foreground">{r.dist} · {r.time}</p></div>
              <div className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-semibold">{r.rating}</span></div>
            </div>
          ))}
        </div>
      );

    case 'restaurant':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">NOOWE Express</h1>
            <div className="w-8" />
          </div>

          <div className="text-center mb-4">
            <ItemIcon cat="quick" size="hero" className="mx-auto" />
            <h2 className="font-display text-xl font-bold mt-2">NOOWE Express</h2>
            <p className="text-sm text-muted-foreground">Fast Food Premium · Tempo médio 5 min</p>
            <div className="flex items-center justify-center gap-3 mt-2 text-sm">
              <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-accent fill-accent" /><span className="font-semibold">4.5</span></div>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /><span>350m</span></div>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3.5 h-3.5" /><span>10:00-23:00</span></div>
            </div>
          </div>

          {/* Live queue status */}
          <div className="p-4 rounded-xl bg-success/5 border border-success/20 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-semibold text-success">Fila rápida</span>
              </div>
              <span className="text-xs text-muted-foreground">~3 min de espera</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">12 pedidos na fila · 4 sendo preparados agora</p>
          </div>

          {/* How it works */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
            <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-primary" /><p className="text-sm font-semibold text-primary">Como funciona o Skip the Line</p></div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">1</span>Monte seu pedido pelo app</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">2</span>Pague na hora — sem fila no caixa</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">3</span>Receba o código e retire no balcão express</div>
            </div>
          </div>

          {/* Featured combos preview */}
          <h3 className="font-display font-semibold text-sm mb-2">Combos em destaque</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
            {COMBOS.map(combo => (
              <div key={combo.id} className="flex-shrink-0 w-36 p-3 rounded-xl bg-card border border-border">
                <ItemIcon cat="combos" size="sm" />
                <p className="font-semibold text-xs mt-1">{combo.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs line-through text-muted-foreground">R$ {combo.original}</span>
                  <span className="text-xs font-bold text-primary">R$ {combo.price}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onNavigate('menu')} className="py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex flex-col items-center gap-2 shadow-glow">
              <Zap className="w-5 h-5" />
              <span>Skip the Line</span>
              <span className="text-[10px] opacity-70">Peça antes de chegar</span>
            </button>
            <button onClick={() => onNavigate('menu')} className="py-4 rounded-xl border border-border font-semibold text-sm flex flex-col items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              <span>Pedir no Local</span>
              <span className="text-[10px] text-muted-foreground">QR Code da mesa</span>
            </button>
          </div>
        </div>
      );

    case 'menu':
      return (
        <div className="pb-4">
          <div className="sticky top-0 bg-background/95 backdrop-blur z-10 px-5 pb-3 pt-2">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => onNavigate('restaurant')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
              <div className="text-center">
                <h1 className="font-display font-bold text-sm">NOOWE Express</h1>
                <div className="flex items-center gap-1 justify-center text-xs text-success"><Zap className="w-3 h-3" /><span className="font-semibold">Skip the Line ativo</span></div>
              </div>
              <button onClick={() => onNavigate('cart')} className="relative w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{cartCount}</span>}
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
              ))}
            </div>
          </div>

          {cart.length === 0 && <div className="px-5"><GuidedHint text="Monte seu pedido e retire no balcão express" /></div>}

          {/* Combos section */}
          {activeCategory === 'Combos' && (
            <div className="px-5 space-y-3 mt-3">
              {COMBOS.map(combo => (
                <button key={combo.id} onClick={() => { addToCart({ id: combo.id, name: combo.name, price: combo.price, img: combo.img }, 1); }} className="w-full p-4 rounded-xl border border-border bg-card text-left">
                  <div className="flex items-center gap-3">
                    <FoodImg id={combo.img} size="md" alt={combo.name} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{combo.name}</p>
                        <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-[9px] font-bold">-{Math.round((1 - combo.price / combo.original) * 100)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{combo.items.join(' + ')}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1"><span className="text-xs line-through text-muted-foreground">R$ {combo.original}</span><span className="font-display font-bold text-sm text-primary">R$ {combo.price}</span></div>
                        <div className="flex items-center gap-0.5 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{combo.time}min</div>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Regular menu items */}
          {activeCategory !== 'Combos' && (
            <div className="px-5 space-y-2 mt-3">
              {MENU.filter(m => m.cat === activeCategory).map(item => {
                const inCart = cart.find(c => c.id === item.id);
                return (
                  <button key={item.id} onClick={() => { setSelectedItem(item); setSelectedExtras([]); setRemovedItems([]); setItemQty(1); onNavigate('item'); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                    <FoodImg id={item.img} size="md" alt={item.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{item.name}</p>
                        {item.popular && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">Popular</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-display font-bold text-sm">R$ {item.price}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{item.time}min</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Flame className="w-3 h-3" />{item.cals}kcal</div>
                      </div>
                    </div>
                    {inCart ? (
                      <span className="w-7 h-7 rounded-full bg-success text-primary-foreground flex items-center justify-center text-xs font-bold">{inCart.qty}</span>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Floating cart bar */}
          {cartCount > 0 && (
            <div className="fixed bottom-4 left-4 right-4" style={{ maxWidth: 345, margin: '0 auto' }}>
              <button onClick={() => onNavigate('cart')} className="w-full flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-glow">
                <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" />Ver Carrinho ({cartCount})</span>
                <span className="font-display">R$ {cartTotal}</span>
              </button>
            </div>
          )}
        </div>
      );

    case 'item':
      if (!selectedItem) return null;
      const extraTotal = selectedExtras.reduce((s, id) => { const e = CUSTOMIZATIONS.extras.find(x => x.id === id); return s + (e?.price || 0); }, 0);
      const itemTotal = (selectedItem.price + extraTotal) * itemQty;
      return (
        <div className="pb-4">
          <div className="bg-gradient-to-b from-muted/50 to-background p-8 text-center">
            <button onClick={() => onNavigate('menu')} className="absolute top-2 left-4 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <span className="text-7xl">{selectedItem.img}</span>
          </div>
          <div className="px-5 -mt-4 relative">
            <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
              <div className="flex items-start justify-between mb-1">
                <h1 className="font-display text-lg font-bold">{selectedItem.name}</h1>
                {selectedItem.popular && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Popular</span>}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{selectedItem.desc}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selectedItem.time} min</span>
                <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{selectedItem.cals} kcal</span>
              </div>

              {/* Extras */}
              {selectedItem.cat === 'Burgers' && (
                <>
                  <h3 className="font-semibold text-sm mb-2">Extras</h3>
                  <div className="space-y-2 mb-4">
                    {CUSTOMIZATIONS.extras.map(extra => (
                      <button key={extra.id} onClick={() => setSelectedExtras(prev => prev.includes(extra.id) ? prev.filter(e => e !== extra.id) : [...prev, extra.id])}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${selectedExtras.includes(extra.id) ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedExtras.includes(extra.id) ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                          {selectedExtras.includes(extra.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className="flex-1 text-sm">{extra.name}</span>
                        <span className="text-xs text-primary font-semibold">+R$ {extra.price}</span>
                      </button>
                    ))}
                  </div>

                  <h3 className="font-semibold text-sm mb-2">Remover ingredientes</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {CUSTOMIZATIONS.remove.map(item => (
                      <button key={item} onClick={() => setRemovedItems(prev => prev.includes(item) ? prev.filter(r => r !== item) : [...prev, item])}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${removedItems.includes(item) ? 'border-destructive bg-destructive/10 text-destructive line-through' : 'border-border text-muted-foreground'}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Quantity & Add */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setItemQty(Math.max(1, itemQty - 1))} className="w-9 h-9 rounded-full border border-border flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                  <span className="font-display font-bold text-lg w-6 text-center">{itemQty}</span>
                  <button onClick={() => setItemQty(itemQty + 1)} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={() => {
                  const customs = [...selectedExtras.map(id => CUSTOMIZATIONS.extras.find(e => e.id === id)?.name || ''), ...removedItems.map(r => `Sem ${r}`)].filter(Boolean);
                  addToCart({ id: selectedItem.id, name: selectedItem.name, price: selectedItem.price + extraTotal, img: selectedItem.img }, itemQty, customs.length ? customs : undefined);
                  onNavigate('menu');
                }} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow">
                  Adicionar · R$ {itemTotal}
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    case 'cart':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Meu Pedido</h1>
            <div className="w-8" />
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Seu carrinho está vazio</p>
              <button onClick={() => onNavigate('menu')} className="mt-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Ver Menu</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20 mb-4">
                <Zap className="w-4 h-4 text-success" />
                <span className="text-xs text-success font-semibold">Skip the Line — Retire no balcão express</span>
              </div>

              {cart.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-3 border-b border-border">
                  <span className="text-2xl">{c.img}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{c.name}</p>
                    {c.customizations && <p className="text-[10px] text-primary">{c.customizations.join(', ')}</p>}
                    <p className="text-xs text-muted-foreground">R$ {c.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(c.id, -1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-bold w-4 text-center">{c.qty}</span>
                    <button onClick={() => updateQty(c.id, 1)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}

              <button onClick={() => onNavigate('menu')} className="w-full mt-3 p-3 rounded-xl border border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground">
                <Plus className="w-4 h-4" /><span className="text-xs font-medium">Adicionar mais itens</span>
              </button>

              {/* Estimated time */}
              <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                <Timer className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Tempo estimado: ~{estTime} min</p>
                  <p className="text-xs text-muted-foreground">Baseado nos itens do pedido</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-muted/30">
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Subtotal ({cartCount} itens)</span><span>R$ {cartTotal}</span></div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
                  <span>Total</span><span>R$ {cartTotal}</span>
                </div>
              </div>

              <button onClick={() => onNavigate('payment')} className="w-full mt-4 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
                Ir para Pagamento · R$ {cartTotal}
              </button>
            </>
          )}
        </div>
      );

    case 'payment':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('cart')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Pagamento</h1>
            <div className="w-8" />
          </div>

          {/* Loyalty points */}
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 mb-4 flex items-center gap-3">
            <Award className="w-5 h-5 text-accent" />
            <div className="flex-1">
              <p className="text-xs font-semibold">Você tem 340 pontos</p>
              <p className="text-[10px] text-muted-foreground">Use 200 pts = R$ 10 de desconto</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-xs font-semibold">Usar</button>
          </div>

          {/* Payment methods */}
          <h2 className="font-semibold text-sm mb-3">Forma de pagamento</h2>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { id: 'pix', name: 'PIX', icon: QrCode },
              { id: 'credit', name: 'Crédito', icon: CreditCard },
              { id: 'apple', name: 'Apple Pay', icon: Smartphone },
              { id: 'google', name: 'Google Pay', icon: Smartphone },
              { id: 'tap', name: 'TAP to Pay', icon: Nfc },
              { id: 'wallet', name: 'Carteira', icon: Wallet },
            ].map((method) => (
              <button key={method.id} onClick={() => setSelectedPayment(method.id)} className={`p-3 rounded-xl border-2 text-center transition-all ${selectedPayment === method.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <method.icon className={`w-5 h-5 mx-auto mb-1 ${selectedPayment === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${selectedPayment === method.id ? 'text-primary' : 'text-muted-foreground'}`}>{method.name}</span>
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Subtotal</span><span>R$ {cartTotal}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Desconto pontos</span><span className="text-success">- R$ 0</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg"><span>Total</span><span className="text-primary">R$ {cartTotal}</span></div>
          </div>

          <button onClick={() => onNavigate('preparing')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Confirmar Pagamento
          </button>
        </div>
      );

    case 'preparing': {
      const stages = [
        { label: 'Pedido recebido', icon: CheckCircle, desc: 'Enviado para a cozinha' },
        { label: 'Preparando', icon: ChefHat, desc: 'Chef montando seu pedido' },
        { label: 'Conferência', icon: Search, desc: 'Verificação de qualidade' },
        { label: 'Pronto!', icon: Zap, desc: 'Disponível no balcão express' },
      ];
      return (
        <div className="flex flex-col h-full">
          <div className="bg-gradient-to-br from-primary to-accent p-5 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <ChefHat className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-primary-foreground">Preparando seu pedido</h1>
            <p className="text-sm text-primary-foreground/70">Tempo estimado: ~{estTime || 5} min</p>
          </div>

          <div className="px-5 -mt-4 flex-1">
            <div className="bg-card rounded-2xl p-5 shadow-md border border-border mb-4">
              <p className="text-xs text-muted-foreground mb-3 text-center">Seu código de retirada</p>
              <p className="font-display text-4xl font-bold tracking-widest text-primary text-center">NE-847</p>
              <p className="text-xs text-muted-foreground mt-2 text-center">Balcão Express · NOOWE Express</p>
            </div>

            {/* Live stages */}
            <div className="space-y-3">
              {stages.map((stage, i) => {
                const isActive = prepStage === i;
                const isDone = prepStage > i;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isDone ? 'bg-success/10 border border-success/20' : isActive ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30 border border-transparent'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-success' : isActive ? 'bg-primary animate-pulse' : 'bg-muted'}`}>
                      {isDone ? <Check className="w-4 h-4 text-primary-foreground" /> : <stage.icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDone ? 'text-success' : isActive ? 'text-primary' : 'text-muted-foreground'}`}>{stage.label}</p>
                      <p className="text-[10px] text-muted-foreground">{stage.desc}</p>
                    </div>
                    {isActive && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    case 'ready':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30 animate-bounce">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Pedido Pronto! 🎉</h2>
          <p className="text-sm text-muted-foreground mb-4">Retire no balcão express</p>

          <div className="w-full p-5 rounded-2xl bg-card border border-border mb-4">
            <p className="font-display text-4xl font-bold tracking-widest text-success">NE-847</p>
            <p className="text-xs text-muted-foreground mt-2">Tempo total: 4 min 32s ⚡</p>
          </div>

          <div className="w-full p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Award className="w-5 h-5 text-accent" />
            <div className="text-left"><p className="text-sm font-semibold">+{Math.round(cartTotal / 10)} pontos ganhos!</p><p className="text-xs text-muted-foreground">Total acumulado: {340 + Math.round(cartTotal / 10)} pts</p></div>
          </div>

          <button onClick={() => onNavigate('rating')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow">
            Avaliar Experiência
          </button>
        </div>
      );

    case 'rating':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <div className="w-8" />
            <h1 className="font-display font-bold">Avaliar</h1>
            <button onClick={() => onNavigate('home')} className="text-xs text-muted-foreground">Pular</button>
          </div>

          <div className="text-center mb-5">
            <span className="text-5xl">⚡</span>
            <h2 className="font-display text-lg font-bold mt-2">Como foi sua experiência?</h2>
            <p className="text-sm text-muted-foreground">NOOWE Express</p>
          </div>

          {/* Star rating */}
          <div className="flex gap-2 justify-center mb-5">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRatingStars(s)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${s <= ratingStars ? 'bg-accent/20 scale-110' : 'bg-muted'}`}>
                <Star className={`w-6 h-6 ${s <= ratingStars ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
              </button>
            ))}
          </div>

          {/* Quick tags */}
          {ratingStars > 0 && (
            <>
              <h3 className="font-semibold text-sm mb-2 text-center">O que se destacou?</h3>
              <div className="flex flex-wrap gap-2 justify-center mb-5">
                {['⚡ Velocidade', '🍔 Sabor', '📱 Praticidade', '😊 Atendimento', '💰 Custo-benefício', '📦 Embalagem'].map(tag => (
                  <button key={tag} onClick={() => setRatingTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${ratingTags.includes(tag) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Loyalty stamp card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
            <div className="flex items-center gap-2 mb-3"><Gift className="w-4 h-4 text-primary" /><span className="text-sm font-bold">Cartão Fidelidade</span></div>
            <div className="flex gap-1.5 mb-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`flex-1 h-6 rounded-md flex items-center justify-center ${i < 7 ? 'bg-primary' : 'bg-muted'}`}>
                  {i < 7 && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">7 de 10 visitas · Mais 3 e ganhe um combo grátis! 🎁</p>
          </div>

          <button onClick={() => onNavigate('home')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            {ratingStars > 0 ? 'Enviar Avaliação' : 'Voltar ao Início'}
          </button>
        </div>
      );

    default: return null;
  }
};
