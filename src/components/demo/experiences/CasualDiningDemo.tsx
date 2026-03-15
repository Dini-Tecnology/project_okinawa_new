/**
 * Casual Dining Demo — Cantina Noowe
 * Deep UX: Discovery → Entry Mode → Smart Waitlist (order while waiting) → Family Mode →
 * Rich Menu with allergens/popularity → Per-Person Ordering → Interactive Split Bill → Tip & Loyalty → Review
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint, ItemIcon } from '../DemoShared';
import { FoodImg } from '../FoodImages';
import {
  ArrowLeft, Check, Star, Clock, Plus, Minus, CreditCard, Gift, QrCode,
  Users, Timer, ArrowRight, UtensilsCrossed, CalendarDays, Baby, Heart,
  MapPin, Search, AlertTriangle, Flame, Leaf, ChevronDown, ChevronRight,
  Bell, MessageCircle, ThumbsUp, Sparkles, Wine, Dog, Sun, CircleParking,
  Accessibility, Lightbulb, GlassWater, ClipboardList, Palette, Puzzle,
  Map, ChefHat, Scale, DollarSign, Receipt, Wallet, Award, Trophy,
  User, CircleUser,
} from 'lucide-react';

type Screen =
  | 'home' | 'restaurant' | 'entry-choice' | 'waitlist' | 'waitlist-bar'
  | 'family-mode' | 'family-activities' | 'menu' | 'item-detail'
  | 'comanda' | 'split' | 'split-by-item' | 'tip' | 'payment-success' | 'review';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir restaurante', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Walk-in ou reserva', screens: ['entry-choice'] },
  { step: 3, label: 'Lista de espera inteligente', screens: ['waitlist', 'waitlist-bar'] },
  { step: 4, label: 'Modo família', screens: ['family-mode', 'family-activities'] },
  { step: 5, label: 'Cardápio interativo', screens: ['menu', 'item-detail'] },
  { step: 6, label: 'Comanda por pessoa', screens: ['comanda'] },
  { step: 7, label: 'Dividir conta', screens: ['split', 'split-by-item'] },
  { step: 8, label: 'Gorjeta & pagamento', screens: ['tip', 'payment-success'] },
  { step: 9, label: 'Avaliação & fidelidade', screens: ['review'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '', title: 'Descoberta', desc: 'Restaurantes casuais com filtros inteligentes.' },
  'restaurant': { emoji: '', title: 'Cantina Noowe', desc: 'Perfil completo com fotos, avaliações e badges.' },
  'entry-choice': { emoji: '', title: 'Entrada', desc: 'Walk-in com fila inteligente ou reserva antecipada.' },
  'waitlist': { emoji: '', title: 'Lista de Espera', desc: 'Posição em tempo real com notificação push.' },
  'waitlist-bar': { emoji: '', title: 'Pedir na Espera', desc: 'Peça drinks enquanto aguarda — vai pra comanda.' },
  'family-mode': { emoji: '', title: 'Modo Família', desc: 'Cardápio kids, cadeirão e kit de atividades.' },
  'family-activities': { emoji: '', title: 'Atividades Kids', desc: 'Jogos e colorir enquanto espera a comida.' },
  'menu': { emoji: '', title: 'Cardápio', desc: 'Menu com alérgenos, popularidade e fotos.' },
  'item-detail': { emoji: '', title: 'Detalhe do Prato', desc: 'Ingredientes, alérgenos e personalização.' },
  'comanda': { emoji: '', title: 'Comanda', desc: 'Pedidos organizados por pessoa da mesa.' },
  'split': { emoji: '', title: 'Dividir Conta', desc: '4 modos: meus itens, igual, por item, valor fixo.' },
  'split-by-item': { emoji: '', title: 'Divisão por Item', desc: 'Arraste itens para cada pessoa.' },
  'tip': { emoji: '', title: 'Gorjeta', desc: 'Gorjeta sugerida com base no serviço.' },
  'payment-success': { emoji: '', title: 'Pagamento', desc: 'Confirmação com pontos de fidelidade.' },
  'review': { emoji: '', title: 'Avaliação', desc: 'Avalie comida, serviço e ambiente.' },
};

interface MenuItem {
  id: string; name: string; price: number; cat: string;
  desc: string; popular?: boolean; kids?: boolean; vegetarian?: boolean;
  allergens?: string[]; prepTime?: number;
}

const MENU: MenuItem[] = [
  { id: 'm1', name: 'Lasanha Bolonhesa', price: 52, cat: 'Massas', desc: 'Camadas de massa fresca com ragu bolonhês e bechamel', popular: true, prepTime: 25, allergens: ['glúten', 'lactose'] },
  { id: 'm2', name: 'Pizza Pepperoni', price: 58, cat: 'Pizzas', desc: 'Massa artesanal, pepperoni importado e mussarela', popular: true, prepTime: 18, allergens: ['glúten', 'lactose'] },
  { id: 'm3', name: 'Risoto de Camarão', price: 72, cat: 'Especiais', desc: 'Arroz arbóreo, camarões grelhados e açafrão', prepTime: 30, allergens: ['crustáceos', 'lactose'] },
  { id: 'm4', name: 'Filé à Parmegiana', price: 65, cat: 'Carnes', desc: 'Filé empanado com molho pomodoro e queijo gratinado', popular: true, prepTime: 22, allergens: ['glúten', 'lactose'] },
  { id: 'm5', name: 'Salada Caesar', price: 38, cat: 'Saladas', desc: 'Alface romana, croutons, parmesão e molho caesar', vegetarian: true, prepTime: 8, allergens: ['glúten', 'lactose'] },
  { id: 'm6', name: 'Tiramisù', price: 28, cat: 'Sobremesas', desc: 'Clássico italiano com café e mascarpone', prepTime: 5, allergens: ['glúten', 'lactose', 'ovos'] },
  { id: 'm7', name: 'Mini Pizza Margherita', price: 25, cat: 'Kids', desc: 'Tamanho perfeito para os pequenos', kids: true, prepTime: 12, allergens: ['glúten', 'lactose'] },
  { id: 'm8', name: 'Nuggets com Batata', price: 22, cat: 'Kids', desc: 'Nuggets caseiros com batata frita', kids: true, prepTime: 15, allergens: ['glúten'] },
  { id: 'm9', name: 'Macarrão com Queijo', price: 20, cat: 'Kids', desc: 'Mac & cheese cremoso', kids: true, prepTime: 10, allergens: ['glúten', 'lactose'] },
  { id: 'm10', name: 'Bruschetta', price: 26, cat: 'Entradas', desc: 'Tomate fresco, manjericão e azeite', vegetarian: true, prepTime: 8, allergens: ['glúten'] },
];

const MENU_CAT_MAP: Record<string, string> = {
  'Massas': 'pasta', 'Pizzas': 'pizza', 'Especiais': 'seafood', 'Carnes': 'steak',
  'Saladas': 'salad', 'Sobremesas': 'dessert', 'Kids': 'kids', 'Entradas': 'bruschetta',
};

interface OrderItem { item: MenuItem; qty: number; who: string; notes?: string; }

const PEOPLE = [
  { id: 'p1', name: 'Você', color: 'bg-primary' },
  { id: 'p2', name: 'Maria', color: 'bg-pink-500' },
  { id: 'p3', name: 'João', color: 'bg-blue-500' },
  { id: 'p4', name: 'Sofia', color: 'bg-purple-500', isKid: true },
];

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const CasualDiningDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [queuePos, setQueuePos] = useState(3);
  const [familyMode, setFamilyMode] = useState(false);
  const [selectedCat, setSelectedCat] = useState('Todas');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([
    { item: MENU[0], qty: 1, who: 'Você' },
    { item: MENU[1], qty: 1, who: 'Maria' },
    { item: MENU[6], qty: 1, who: 'Sofia' },
    { item: MENU[3], qty: 1, who: 'João' },
  ]);
  const [barOrders, setBarOrders] = useState<{ name: string; price: number }[]>([]);
  const [splitMode, setSplitMode] = useState<'mine' | 'equal' | 'by-item' | 'fixed'>('mine');
  const [tipPct, setTipPct] = useState(10);
  const [ratings, setRatings] = useState({ food: 0, service: 0, ambiance: 0 });
  const [waitlistDrinks] = useState([
    { name: 'Caipirinha', price: 22, cat: 'drink' },
    { name: 'Cerveja Artesanal', price: 18, cat: 'beer' },
    { name: 'Suco Natural', price: 12, cat: 'juice' },
    { name: 'Porção de Pão de Alho', price: 16, cat: 'bread' },
  ]);

  const subtotal = orders.reduce((s, o) => s + o.item.price * o.qty, 0) + barOrders.reduce((s, o) => s + o.price, 0);
  const service = Math.round(subtotal * 0.1);
  const tip = Math.round(subtotal * tipPct / 100);
  const total = subtotal + service + tip;

  const myTotal = orders.filter(o => o.who === 'Você').reduce((s, o) => s + o.item.price * o.qty, 0);
  const equalSplit = Math.ceil(total / PEOPLE.length);

  useEffect(() => {
    if (screen === 'waitlist') {
      const t = setInterval(() => setQueuePos(prev => Math.max(1, prev - 1)), 4000);
      return () => clearInterval(t);
    }
  }, [screen]);

  const Header: React.FC<{ title: string; back: Screen; right?: React.ReactNode }> = ({ title, back, right }) => (
    <div className="flex items-center justify-between py-4">
      <button onClick={() => onNavigate(back)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
      <h1 className="font-display font-bold text-sm">{title}</h1>
      {right || <div className="w-8" />}
    </div>
  );

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-3">
            <p className="text-sm text-muted-foreground">Boa noite</p>
            <h1 className="font-display text-xl font-bold">Jantar em família</h1>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/50 border border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Buscar restaurantes...</span>
            </div>
            <button className="p-2.5 rounded-xl bg-muted/50 border border-border">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
            {['Kids', 'Pet Friendly', 'Ao ar livre', 'Estacionamento', 'Acessível'].map((f, i) => (
              <button key={f} className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f}</button>
            ))}
          </div>
          <GuidedHint text="Restaurantes com Modo Família ficam em destaque" />
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-3">
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <div className="h-28 bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center relative">
                <ItemIcon cat="pizza" size="hero" className="mx-auto" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-success/90 text-primary-foreground text-[9px] font-bold flex items-center gap-1"><Baby className="w-2.5 h-2.5" /> Kids Friendly</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[9px] font-bold flex items-center gap-1"><Dog className="w-2.5 h-2.5" /> Pet OK</span>
                </div>
                <div className="absolute bottom-2 left-3 px-2 py-1 rounded-lg bg-background/80 backdrop-blur text-[10px] font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ~15 min de espera
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-base font-bold">Cantina Noowe</h3>
                  <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-accent fill-accent" /><span className="text-sm font-bold">4.6</span></div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Casual Dining · Italiano · R$$$ · 500m</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">842 avaliações</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-[10px] text-success font-medium">Aberto até 23:00</span>
                </div>
              </div>
            </div>
          </button>
          <div className="p-3 rounded-2xl border border-border bg-card mb-3 flex items-center gap-3">
            <ItemIcon cat="sushi" size="lg" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Sushi Noowe</h3>
              <p className="text-[10px] text-muted-foreground">Japonês · R$$$$ · 1.2km</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-bold">4.8</span></div>
              <p className="text-[9px] text-muted-foreground">30 min</p>
            </div>
          </div>
        </div>
      );

    case 'restaurant':
      return (
        <div className="px-5 pb-4">
          <Header title="Cantina Noowe" back="home" right={<button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Heart className="w-4 h-4 text-muted-foreground" /></button>} />
          <div className="text-center mb-4">
            <ItemIcon cat="pizza" size="hero" className="mx-auto" />
            <h2 className="font-display text-xl font-bold mt-2">Cantina Noowe</h2>
            <p className="text-sm text-muted-foreground">Comida italiana casual · Ambiente familiar</p>
            <div className="flex items-center justify-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" />4.6 (842)</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">R$ 60-150/pessoa</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: UtensilsCrossed, label: 'Cardápio' },
              { icon: Heart, label: 'Fotos' },
              { icon: Star, label: 'Avaliações' },
              { icon: MapPin, label: 'Como ir' },
            ].map(a => (
              <button key={a.label} className="p-2 rounded-xl bg-muted/50 text-center">
                <a.icon className="w-5 h-5 text-primary mx-auto" />
                <p className="text-[9px] text-muted-foreground mt-0.5">{a.label}</p>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['Garçom na mesa', 'Kids Friendly', 'Reserva opcional', 'Grupos 10+', 'Cadeirão', 'Wi-Fi', 'Estacionamento'].map(f => (
              <span key={f} className="px-2.5 py-1 rounded-full bg-muted text-[10px] text-muted-foreground">{f}</span>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4">
            <p className="text-xs font-semibold mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Status Agora</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Lotação: <span className="text-warning font-semibold">75%</span></span>
              <span className="text-muted-foreground">Espera: <span className="font-semibold">~15 min</span></span>
              <span className="text-success font-semibold">Aberto</span>
            </div>
          </div>
          <GuidedHint text="Walk-in com fila inteligente ou reserve antecipado" />
          <button onClick={() => onNavigate('entry-choice')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow">
            Entrar no Restaurante
          </button>
        </div>
      );

    case 'entry-choice':
      return (
        <div className="px-5 pb-4">
          <Header title="Como entrar?" back="restaurant" />
          <GuidedHint text="Escolha como deseja entrar — walk-in permite pedir enquanto espera" />
          <div className="space-y-3">
            <button onClick={() => onNavigate('waitlist')} className="w-full p-5 rounded-2xl border-2 border-primary bg-primary/5 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-primary">Walk-in Inteligente</p>
                  <p className="text-xs text-muted-foreground">~15 min · 3 grupos na fila</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: GlassWater, label: 'Pedir drinks' },
                  { icon: Bell, label: 'Notificação' },
                  { icon: ClipboardList, label: 'Ver cardápio' },
                ].map(f => (
                  <span key={f.label} className="text-[10px] text-center py-1.5 rounded-lg bg-primary/5 text-primary flex items-center justify-center gap-1"><f.icon className="w-3 h-3" />{f.label}</span>
                ))}
              </div>
            </button>
            <button className="w-full p-5 rounded-2xl border-2 border-border bg-card text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Reserva Antecipada</p>
                  <p className="text-xs text-muted-foreground">Garanta sua mesa · Ideal para grupos 5+</p>
                </div>
              </div>
              <div className="flex gap-2">
                {['Hoje 20:00', 'Hoje 21:00', 'Amanhã'].map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-lg bg-muted text-[10px] text-muted-foreground">{t}</span>
                ))}
              </div>
            </button>
            <button className="w-full p-4 rounded-2xl border-2 border-border bg-card text-left flex items-center gap-3">
              <QrCode className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="font-bold text-sm">Já estou na mesa</p>
                <p className="text-xs text-muted-foreground">Escaneie o QR Code da mesa</p>
              </div>
            </button>
          </div>
        </div>
      );

    case 'waitlist':
      return (
        <div className="px-5 pb-4">
          <Header title="Lista de Espera" back="entry-choice" />
          <div className="text-center mb-4">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <p className="font-display text-2xl font-bold text-primary">{queuePos}º</p>
                  <p className="text-[9px] text-muted-foreground">na fila</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Estimativa: ~{queuePos * 5} min</p>
          </div>
          <div className="flex gap-2 mb-4">
            {[
              { label: 'Pessoas', value: `${PEOPLE.length}`, icon: Users },
              { label: 'Mesa', value: 'A definir', icon: UtensilsCrossed },
              { label: 'Status', value: 'Na fila', icon: Clock },
            ].map(s => (
              <div key={s.label} className="flex-1 p-2.5 rounded-xl bg-muted/30 text-center">
                <s.icon className="w-3.5 h-3.5 mx-auto mb-0.5 text-muted-foreground" />
                <p className="text-[10px] font-semibold">{s.value}</p>
                <p className="text-[8px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
            <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-primary" /> Enquanto espera:</p>
            <div className="space-y-2">
              <button onClick={() => onNavigate('waitlist-bar')} className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-left">
                <GlassWater className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-primary">Pedir drinks e aperitivos</p>
                  <p className="text-[10px] text-muted-foreground">Vai direto pra sua comanda</p>
                </div>
                <ChevronRight className="w-4 h-4 text-primary" />
              </button>
              <button onClick={() => onNavigate('menu')} className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 text-left">
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs font-semibold">Ver cardápio e favoritar</p>
                  <p className="text-[10px] text-muted-foreground">Adiante seu pedido</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border mb-4">
            <Baby className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Modo Família</p>
              <p className="text-[10px] text-muted-foreground">Cardápio kids, cadeirão e atividades</p>
            </div>
            <button onClick={() => { setFamilyMode(true); onNavigate('family-mode'); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${familyMode ? 'bg-success text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
              {familyMode ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Ativo</span> : 'Ativar'}
            </button>
          </div>
          {queuePos <= 1 && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 mb-4 text-center animate-pulse">
              <Bell className="w-5 h-5 text-success mx-auto mb-1" />
              <p className="text-sm font-bold text-success">Sua mesa está pronta!</p>
              <p className="text-xs text-muted-foreground">Mesa 8 · Dirija-se à recepção</p>
            </div>
          )}
        </div>
      );

    case 'waitlist-bar':
      return (
        <div className="px-5 pb-4">
          <Header title="Pedir na Espera" back="waitlist" />
          <GuidedHint text="Peça drinks e aperitivos — tudo vai pra comanda da mesa" />
          <div className="space-y-2 mb-4">
            {waitlistDrinks.map((drink, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <ItemIcon cat={drink.cat} size="sm" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{drink.name}</p>
                  <p className="text-xs text-muted-foreground">R$ {drink.price}</p>
                </div>
                <button onClick={() => setBarOrders(prev => [...prev, { name: drink.name, price: drink.price }])} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-primary" />
                </button>
              </div>
            ))}
          </div>
          {barOrders.length > 0 && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
              <p className="text-xs font-bold mb-2">Seu pedido de espera:</p>
              {barOrders.map((o, i) => (
                <div key={i} className="flex justify-between text-xs py-1">
                  <span>{o.name}</span><span className="font-semibold">R$ {o.price}</span>
                </div>
              ))}
              <div className="border-t border-border mt-2 pt-2 flex justify-between text-sm font-bold">
                <span>Total</span><span className="text-primary">R$ {barOrders.reduce((s, o) => s + o.price, 0)}</span>
              </div>
            </div>
          )}
          <button onClick={() => onNavigate('waitlist')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            {barOrders.length > 0 ? 'Confirmar Pedido' : 'Voltar para Fila'}
          </button>
        </div>
      );

    case 'family-mode':
      return (
        <div className="px-5 pb-4">
          <Header title="Modo Família" back="waitlist" />
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
            <p className="text-sm font-bold mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Modo Família Ativado</p>
            <div className="space-y-2">
              {[
                { icon: UtensilsCrossed, label: 'Cardápio Kids em destaque', desc: 'Itens especiais para crianças primeiro' },
                { icon: ArrowLeft, label: 'Cadeirão reservado', desc: 'Já preparamos tudo para vocês' },
                { icon: Palette, label: 'Kit de atividades', desc: 'Jogos e colorir na mesa' },
                { icon: Sparkles, label: 'Pratos kids primeiro', desc: 'Crianças comem antes, sem espera' },
                { icon: AlertTriangle, label: 'Alerta de alérgenos', desc: 'Itens com alérgenos infantis destacados' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><Baby className="w-4 h-4 text-primary" /> Quem são as crianças?</h3>
          <div className="space-y-2 mb-4">
            {[
              { name: 'Sofia', age: '5 anos', allergies: 'Nenhuma' },
            ].map((kid, i) => (
              <div key={i} className="p-3 rounded-xl border border-border bg-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Baby className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{kid.name}</p>
                  <p className="text-[10px] text-muted-foreground">{kid.age} · Alergias: {kid.allergies}</p>
                </div>
                <Check className="w-4 h-4 text-success" />
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('family-activities')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm mb-2 flex items-center justify-center gap-2">
            <Palette className="w-4 h-4" /> Ver Atividades Disponíveis
          </button>
          <button onClick={() => onNavigate('menu')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Ver Cardápio Completo
          </button>
        </div>
      );

    case 'family-activities':
      return (
        <div className="px-5 pb-4">
          <Header title="Atividades Kids" back="family-mode" />
          <GuidedHint text="Atividades para entreter as crianças enquanto a comida chega" />
          <div className="space-y-3">
            {[
              { name: 'Colorir na Mesa', desc: 'Kit de lápis e desenhos da Cantina', icon: Palette, active: true },
              { name: 'Quiz da Pizza', desc: 'Jogo interativo no tablet da mesa', icon: Puzzle, active: true },
              { name: 'Caça ao Tesouro', desc: 'Encontre 5 itens escondidos no restaurante', icon: Map, active: false },
              { name: 'Chef Mirim', desc: 'Monte sua própria mini pizza (30 min)', icon: ChefHat, active: true },
            ].map((act, i) => (
              <div key={i} className={`p-4 rounded-xl border ${act.active ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.active ? 'bg-primary/10' : 'bg-muted'}`}>
                    <act.icon className={`w-5 h-5 ${act.active ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{act.name}</p>
                    <p className="text-[10px] text-muted-foreground">{act.desc}</p>
                  </div>
                  {act.active ? <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[9px] font-bold">Disponível</span> : <span className="text-[9px] text-muted-foreground">Em breve</span>}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('menu')} className="w-full mt-4 py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Ir para o Cardápio
          </button>
        </div>
      );

    case 'menu':
      const cats = ['Todas', ...Array.from(new Set(MENU.map(m => m.cat)))];
      const filtered = selectedCat === 'Todas' ? MENU : MENU.filter(m => m.cat === selectedCat);
      if (familyMode && selectedCat === 'Todas') {
        filtered.sort((a, b) => (b.kids ? 1 : 0) - (a.kids ? 1 : 0));
      }
      return (
        <div className="px-5 pb-4">
          <Header title="Cardápio" back="restaurant" right={
            <button onClick={() => onNavigate('comanda')} className="relative p-2">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              {orders.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">{orders.length}</span>}
            </button>
          } />
          {familyMode && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10 mb-3">
              <Baby className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-primary font-semibold">Modo Família ativo — Kids Menu em destaque</span>
            </div>
          )}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-4">
            {cats.map(cat => (
              <button key={cat} onClick={() => setSelectedCat(cat)} className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap ${selectedCat === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map(item => (
              <button key={item.id} onClick={() => { setSelectedItem(item); onNavigate('item-detail'); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                <ItemIcon cat={MENU_CAT_MAP[item.cat] || item.cat.toLowerCase()} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm truncate">{item.name}</p>
                    {item.popular && <Flame className="w-3 h-3 text-orange-500 shrink-0" />}
                    {item.vegetarian && <Leaf className="w-3 h-3 text-success shrink-0" />}
                    {item.kids && <Baby className="w-3 h-3 text-purple-500 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-xs text-primary">R$ {item.price}</span>
                    {item.prepTime && <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{item.prepTime} min</span>}
                  </div>
                </div>
                <Plus className="w-4 h-4 text-primary shrink-0" />
              </button>
            ))}
          </div>
        </div>
      );

    case 'item-detail':
      const item = selectedItem || MENU[0];
      return (
        <div className="px-5 pb-4">
          <Header title={item.name} back="menu" />
          <div className="text-center mb-4">
            <ItemIcon cat={MENU_CAT_MAP[item.cat] || item.cat.toLowerCase()} size="hero" className="mx-auto" />
            <h2 className="font-display text-lg font-bold mt-3">{item.name}</h2>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
            <p className="font-display text-xl font-bold text-primary mt-2">R$ {item.price}</p>
          </div>
          {item.allergens && item.allergens.length > 0 && (
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                <span className="text-xs font-semibold text-warning">Alérgenos</span>
              </div>
              <div className="flex gap-1.5">
                {item.allergens.map(a => (
                  <span key={a} className="px-2 py-0.5 rounded-full bg-warning/20 text-[10px] text-warning font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2">Quem está pedindo?</p>
            <div className="flex gap-2">
              {PEOPLE.map(p => (
                <button key={p.id} className={`flex-1 p-2 rounded-xl border-2 text-center ${p.id === 'p1' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                  <div className={`w-7 h-7 rounded-full ${p.color} flex items-center justify-center text-primary-foreground text-[10px] font-bold mx-auto`}>{p.name[0]}</div>
                  <p className="text-[9px] font-medium mt-0.5">{p.name}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2">Observações</p>
            <div className="p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
              Ex: sem cebola, bem passado, extra queijo...
            </div>
          </div>
          <button onClick={() => { setOrders(prev => [...prev, { item, qty: 1, who: 'Você' }]); onNavigate('menu'); }} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Adicionar · R$ {item.price}
          </button>
        </div>
      );

    case 'comanda':
      const groupedByPerson = PEOPLE.map(p => ({
        ...p,
        items: orders.filter(o => o.who === p.name),
        total: orders.filter(o => o.who === p.name).reduce((s, o) => s + o.item.price * o.qty, 0),
      }));
      return (
        <div className="px-5 pb-4">
          <Header title="Comanda" back="menu" />
          <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-3 mb-4">
            <ItemIcon cat="pizza" size="sm" />
            <div className="flex-1"><p className="font-semibold text-sm">Cantina Noowe</p><p className="text-[10px] text-muted-foreground">Mesa 8 · {PEOPLE.length} pessoas</p></div>
            <button className="p-2 rounded-lg bg-primary/10"><Bell className="w-4 h-4 text-primary" /></button>
          </div>
          {groupedByPerson.filter(p => p.items.length > 0).map(person => (
            <div key={person.id} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full ${person.color} flex items-center justify-center text-primary-foreground text-[10px] font-bold`}>{person.name[0]}</div>
                <span className="text-xs font-semibold">{person.name}</span>
                {'isKid' in person && person.isKid && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 flex items-center gap-0.5"><Baby className="w-2.5 h-2.5" /> Kids</span>}
                <span className="ml-auto text-xs text-muted-foreground">R$ {person.total}</span>
              </div>
              {person.items.map((order, i) => (
                <div key={i} className="flex items-center gap-3 py-2 pl-8 border-b border-border/50">
                  <ItemIcon cat={MENU_CAT_MAP[order.item.cat] || order.item.cat.toLowerCase()} size="xs" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{order.item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{order.item.desc?.slice(0, 40)}...</p>
                  </div>
                  <span className="text-sm font-semibold">R$ {order.item.price}</span>
                </div>
              ))}
            </div>
          ))}
          {barOrders.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <GlassWater className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Pedidos na espera</span>
              </div>
              {barOrders.map((o, i) => (
                <div key={i} className="flex justify-between py-1.5 pl-8 text-sm border-b border-border/50">
                  <span>{o.name}</span><span className="font-semibold">R$ {o.price}</span>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Subtotal</span><span>R$ {subtotal}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Serviço (10%)</span><span>R$ {service}</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg"><span>Total</span><span>R$ {subtotal + service}</span></div>
          </div>
          <div className="flex gap-2 mb-3">
            <button onClick={() => onNavigate('menu')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
            <button className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Garçom
            </button>
          </div>
          <button onClick={() => onNavigate('split')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Users className="w-5 h-5" /> Fechar & Dividir Conta
          </button>
        </div>
      );

    case 'split':
      return (
        <div className="px-5 pb-4">
          <Header title="Dividir Conta" back="comanda" />
          <GuidedHint text="Escolha como dividir — cada pessoa pode pagar independente" />
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { id: 'mine' as const, name: 'Meus Itens', desc: `R$ ${myTotal + Math.round(myTotal * 0.1)}`, icon: User },
              { id: 'equal' as const, name: 'Partes Iguais', desc: `R$ ${equalSplit} cada`, icon: Scale },
              { id: 'by-item' as const, name: 'Por Item', desc: 'Selecione os itens', icon: Receipt },
              { id: 'fixed' as const, name: 'Valor Fixo', desc: 'Defina o valor', icon: Wallet },
            ].map(mode => (
              <button key={mode.id} onClick={() => setSplitMode(mode.id)} className={`p-4 rounded-2xl border-2 text-left ${splitMode === mode.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-1">
                  <mode.icon className="w-4 h-4 text-primary" />
                </div>
                <p className={`text-xs font-semibold ${splitMode === mode.id ? 'text-primary' : 'text-foreground'}`}>{mode.name}</p>
                <p className="text-[10px] text-muted-foreground">{mode.desc}</p>
              </button>
            ))}
          </div>

          {splitMode === 'mine' && (
            <div className="p-4 rounded-xl bg-card border border-border mb-4">
              <p className="text-xs font-semibold mb-2">Seus itens:</p>
              {orders.filter(o => o.who === 'Você').map((o, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
                  <span>{o.item.name}</span><span className="font-semibold">R$ {o.item.price}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Itens compartilhados (÷{PEOPLE.length})</span><span>R$ {Math.round(barOrders.reduce((s, o) => s + o.price, 0) / PEOPLE.length)}</span></div>
                <div className="flex justify-between text-xs mt-1"><span className="text-muted-foreground">Serviço (10%)</span><span>R$ {Math.round(myTotal * 0.1)}</span></div>
                <div className="flex justify-between font-bold text-lg mt-2"><span>Você paga</span><span className="text-primary">R$ {myTotal + Math.round(myTotal * 0.1) + Math.round(barOrders.reduce((s, o) => s + o.price, 0) / PEOPLE.length)}</span></div>
              </div>
            </div>
          )}

          {splitMode === 'equal' && (
            <div className="p-4 rounded-xl bg-card border border-border mb-4">
              <p className="text-xs font-semibold mb-3">Divisão igual entre {PEOPLE.length}:</p>
              {PEOPLE.map(p => (
                <div key={p.id} className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0">
                  <div className={`w-6 h-6 rounded-full ${p.color} flex items-center justify-center text-primary-foreground text-[9px] font-bold`}>{p.name[0]}</div>
                  <span className="text-sm flex-1">{p.name}</span>
                  <span className="font-semibold text-sm">R$ {equalSplit}</span>
                </div>
              ))}
            </div>
          )}

          {splitMode === 'by-item' && (
            <button onClick={() => onNavigate('split-by-item')} className="w-full p-4 rounded-xl border border-primary/30 bg-primary/5 text-center mb-4">
              <p className="text-sm font-semibold text-primary">Abrir seleção de itens</p>
              <p className="text-[10px] text-muted-foreground">Arraste cada item para quem vai pagar</p>
            </button>
          )}

          <button onClick={() => onNavigate('tip')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" /> Prosseguir para Pagamento
          </button>
        </div>
      );

    case 'split-by-item':
      return (
        <div className="px-5 pb-4">
          <Header title="Divisão por Item" back="split" />
          <GuidedHint text="Toque no item e escolha quem paga" />
          {orders.map((order, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card mb-2">
              <ItemIcon cat={MENU_CAT_MAP[order.item.cat] || order.item.cat.toLowerCase()} size="xs" />
              <div className="flex-1">
                <p className="text-sm font-medium">{order.item.name}</p>
                <p className="text-xs text-muted-foreground">R$ {order.item.price}</p>
              </div>
              <div className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${PEOPLE.find(p => p.name === order.who)?.color || 'bg-muted'} text-primary-foreground`}>
                {order.who}
              </div>
            </div>
          ))}
          <button onClick={() => onNavigate('tip')} className="w-full mt-4 py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-glow">
            Confirmar Divisão
          </button>
        </div>
      );

    case 'tip':
      return (
        <div className="px-5 pb-4">
          <Header title="Gorjeta & Pagamento" back="split" />
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground mb-1">Como foi o serviço?</p>
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-7 h-7 ${s <= 4 ? 'text-accent fill-accent' : 'text-muted'}`} />
              ))}
            </div>
          </div>
          <p className="text-xs font-semibold mb-2">Gorjeta sugerida</p>
          <div className="flex gap-2 mb-4">
            {[0, 10, 15, 20].map(p => (
              <button key={p} onClick={() => setTipPct(p)} className={`flex-1 py-3 rounded-xl text-center border-2 ${tipPct === p ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <p className={`text-sm font-bold ${tipPct === p ? 'text-primary' : 'text-foreground'}`}>{p === 0 ? 'Sem' : `${p}%`}</p>
                <p className="text-[9px] text-muted-foreground">{p === 0 ? '' : `R$ ${Math.round(subtotal * p / 100)}`}</p>
              </button>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Seus itens</span><span>R$ {myTotal}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Serviço (10%)</span><span>R$ {Math.round(myTotal * 0.1)}</span></div>
            {tipPct > 0 && <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Gorjeta ({tipPct}%)</span><span>R$ {Math.round(myTotal * tipPct / 100)}</span></div>}
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">R$ {myTotal + Math.round(myTotal * 0.1) + Math.round(myTotal * tipPct / 100)}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1"><p className="text-sm font-medium">•••• 4242</p><p className="text-[10px] text-muted-foreground">Visa Crédito</p></div>
              <Check className="w-4 h-4 text-success" />
            </div>
          </div>
          <button onClick={() => onNavigate('payment-success')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" /> Pagar R$ {myTotal + Math.round(myTotal * 0.1) + Math.round(myTotal * tipPct / 100)}
          </button>
        </div>
      );

    case 'payment-success':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-5 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-1">Pagamento Confirmado!</h2>
          <p className="text-sm text-muted-foreground mb-4">Cantina Noowe agradece sua visita</p>
          <div className="w-full p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Pago por você</span><span className="font-semibold">R$ {myTotal + Math.round(myTotal * 0.1) + Math.round(myTotal * tipPct / 100)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status mesa</span><span className="text-success font-semibold">3/4 pagaram</span></div>
          </div>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-3 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-semibold">+35 pontos ganhos!</p>
              <p className="text-[10px] text-muted-foreground">Próxima sobremesa kids grátis em 2 visitas</p>
            </div>
          </div>
          <div className="w-full p-3 rounded-xl bg-muted/30 mb-4 flex items-center gap-3">
            <Trophy className="w-4 h-4 text-accent" />
            <p className="text-xs text-muted-foreground">Selo de família ganho! Nível: Família Bronze</p>
          </div>
          <button onClick={() => onNavigate('review')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Avaliar Experiência
          </button>
        </div>
      );

    case 'review':
      return (
        <div className="px-5 pb-4">
          <Header title="Avaliação" back="payment-success" />
          <div className="text-center mb-4">
            <ItemIcon cat="pizza" size="xl" className="mx-auto" />
            <h2 className="font-display text-lg font-bold mt-2">Como foi na Cantina Noowe?</h2>
          </div>
          {[
            { label: 'Comida', key: 'food' as const, icon: UtensilsCrossed },
            { label: 'Serviço', key: 'service' as const, icon: ChefHat },
            { label: 'Ambiente', key: 'ambiance' as const, icon: MapPin },
          ].map(cat => (
            <div key={cat.key} className="mb-4">
              <p className="text-sm font-semibold mb-1 flex items-center gap-1.5"><cat.icon className="w-3.5 h-3.5 text-primary" /> {cat.label}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRatings(prev => ({ ...prev, [cat.key]: s }))} className="flex-1 py-2 rounded-lg border border-border text-center">
                    <Star className={`w-5 h-5 mx-auto ${s <= (ratings[cat.key] || 0) ? 'text-accent fill-accent' : 'text-muted'}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="p-3 rounded-xl border border-border bg-muted/30 mb-4">
            <p className="text-xs text-muted-foreground">Deixe um comentário (opcional)...</p>
          </div>
          <div className="flex gap-2 mb-4">
            {['Prato delicioso', 'Ótimo pra família', 'Bom preço', 'Rápido'].map(tag => (
              <button key={tag} className="px-2.5 py-1 rounded-full bg-muted text-[10px] text-muted-foreground">{tag}</button>
            ))}
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <ThumbsUp className="w-5 h-5" /> Enviar Avaliação
          </button>
        </div>
      );

    default: return null;
  }
};
