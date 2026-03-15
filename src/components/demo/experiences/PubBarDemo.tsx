/**
 * Pub & Bar Demo — Noowe Tap House
 * Deep UX: Discover → Open Tab (pre-auth) → Group Tab (invite friends) → Happy Hour auto-pricing →
 * Tap List (ABV/IBU) → Order Rounds → Drink Customization → Repeat Round → Tab Limit Alert →
 * Per-Consumption Split → Close Tab → Rate
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint, ItemIcon } from '../DemoShared';
import {
  ArrowLeft, Check, Star, Clock, Plus, Minus, CreditCard, Gift, QrCode,
  Users, Timer, ArrowRight, Beer, RefreshCw, UserPlus, Share2,
  Copy, Send, ChevronDown, Zap, Sparkles, DollarSign, AlertTriangle,
  Bell, ThumbsUp, MapPin, Search, Thermometer, ChevronRight, Lock,
} from 'lucide-react';

type Screen =
  | 'home' | 'restaurant' | 'open-tab' | 'group-tab' | 'happy-hour'
  | 'tap-list' | 'drink-detail' | 'round-builder' | 'round-confirm'
  | 'repeat-round' | 'tab-live' | 'tab-limit' | 'close-tab' | 'tab-success';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir bar', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Abrir Tab Digital', screens: ['open-tab'] },
  { step: 3, label: 'Tab compartilhado', screens: ['group-tab'] },
  { step: 4, label: 'Happy Hour ativo', screens: ['happy-hour'] },
  { step: 5, label: 'Explorar torneiras', screens: ['tap-list', 'drink-detail'] },
  { step: 6, label: 'Montar rodada', screens: ['round-builder', 'round-confirm'] },
  { step: 7, label: 'Repetir rodada', screens: ['repeat-round'] },
  { step: 8, label: 'Tab em tempo real', screens: ['tab-live', 'tab-limit'] },
  { step: 9, label: 'Fechar Tab', screens: ['close-tab', 'tab-success'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'Bares com tab digital e happy hour ativo.' },
  'restaurant': { emoji: '🍺', title: 'Noowe Tap House', desc: 'Pub com 20 torneiras e tab digital.' },
  'open-tab': { emoji: '💳', title: 'Abrir Tab', desc: 'Pré-autorização no cartão — paga só o que beber.' },
  'group-tab': { emoji: '👥', title: 'Tab Compartilhado', desc: 'Amigos entram no tab e registram seus pedidos.' },
  'happy-hour': { emoji: '🎉', title: 'Happy Hour', desc: 'Descontos automáticos em chopp e drinks.' },
  'tap-list': { emoji: '🍺', title: 'Torneiras', desc: 'Lista completa com ABV, IBU e estilo.' },
  'drink-detail': { emoji: '🍻', title: 'Detalhe', desc: 'Ficha completa do chopp ou drink.' },
  'round-builder': { emoji: '🍻', title: 'Montar Rodada', desc: 'Monte a rodada para todo o grupo.' },
  'round-confirm': { emoji: '✅', title: 'Rodada Enviada', desc: 'Pedido confirmado no balcão.' },
  'repeat-round': { emoji: '🔄', title: 'Repetir Rodada', desc: 'Mesmo pedido com um toque.' },
  'tab-live': { emoji: '📊', title: 'Tab ao Vivo', desc: 'Consumo em tempo real por pessoa.' },
  'tab-limit': { emoji: '⚠️', title: 'Alerta de Limite', desc: 'Defina limites de gasto no tab.' },
  'close-tab': { emoji: '💰', title: 'Fechar Tab', desc: 'Divisão por consumo ou igual.' },
  'tab-success': { emoji: '✅', title: 'Tab Fechado', desc: 'Resumo final com pontos ganhos.' },
};

interface Drink {
  id: string; name: string; price: number; priceHH: number;
  emoji: string; cat: string; abv?: number; ibu?: number;
  style?: string; desc?: string; isNew?: boolean;
}

const DRINKS: Drink[] = [
  { id: 'd1', name: 'IPA Artesanal', price: 28, priceHH: 19, emoji: '🍺', cat: 'Chopp', abv: 6.5, ibu: 55, style: 'American IPA', desc: 'Lupulada e cítrica com final amargo', isNew: true },
  { id: 'd2', name: 'Pilsen Premium', price: 22, priceHH: 15, emoji: '🍺', cat: 'Chopp', abv: 4.8, ibu: 18, style: 'German Pilsner', desc: 'Leve, refrescante e maltada' },
  { id: 'd3', name: 'Stout de Chocolate', price: 30, priceHH: 21, emoji: '🍺', cat: 'Chopp', abv: 5.5, ibu: 35, style: 'Chocolate Stout', desc: 'Notas de cacau e café torrado' },
  { id: 'd4', name: 'Wheat Beer', price: 25, priceHH: 17, emoji: '🍺', cat: 'Chopp', abv: 5.0, ibu: 12, style: 'Hefeweizen', desc: 'Notas de banana e cravo' },
  { id: 'd5', name: 'Gin Tônica', price: 38, priceHH: 26, emoji: '🍸', cat: 'Drinks', abv: 12.0, desc: 'Gin artesanal com tônica premium' },
  { id: 'd6', name: 'Aperol Spritz', price: 35, priceHH: 24, emoji: '🥂', cat: 'Drinks', abv: 8.0, desc: 'Aperol, prosecco e soda' },
  { id: 'd7', name: 'Moscow Mule', price: 36, priceHH: 25, emoji: '🍹', cat: 'Drinks', abv: 10.0, desc: 'Vodka, ginger beer e limão' },
  { id: 'd8', name: 'Porção de Batata', price: 32, priceHH: 32, emoji: '🍟', cat: 'Petiscos', desc: 'Batata rústica com molhos' },
  { id: 'd9', name: 'Nachos Supreme', price: 38, priceHH: 38, emoji: '🫔', cat: 'Petiscos', desc: 'Nachos com guacamole e cheddar' },
  { id: 'd10', name: 'Tábua de Frios', price: 65, priceHH: 65, emoji: '🧀', cat: 'Petiscos', desc: 'Queijos, embutidos e frutas' },
];

interface TabItem { drinkId: string; who: string; time: string; }

const FRIENDS = [
  { id: 'f1', name: 'Você', initial: 'V', color: 'bg-primary', status: 'host' },
  { id: 'f2', name: 'Lucas', initial: 'L', color: 'bg-blue-500', status: 'joined' },
  { id: 'f3', name: 'Ana', initial: 'A', color: 'bg-pink-500', status: 'joined' },
  { id: 'f4', name: 'Pedro', initial: 'P', color: 'bg-green-500', status: 'pending' },
];

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const PubBarDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [isHappyHour] = useState(true);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [tabItems, setTabItems] = useState<TabItem[]>([
    { drinkId: 'd1', who: 'Você', time: '19:15' },
    { drinkId: 'd2', who: 'Lucas', time: '19:15' },
    { drinkId: 'd5', who: 'Ana', time: '19:15' },
    { drinkId: 'd1', who: 'Você', time: '19:45' },
    { drinkId: 'd2', who: 'Lucas', time: '19:45' },
    { drinkId: 'd5', who: 'Ana', time: '19:45' },
  ]);
  const [tabLimit, setTabLimit] = useState(300);
  const [splitMode, setSplitMode] = useState<'consumption' | 'equal'>('consumption');
  const [roundDrinks, setRoundDrinks] = useState<{ drinkId: string; who: string }[]>([]);
  const [hhMinutes, setHhMinutes] = useState(92);

  useEffect(() => {
    const t = setInterval(() => setHhMinutes(prev => Math.max(0, prev - 1)), 60000);
    return () => clearInterval(t);
  }, []);

  const getPrice = (d: Drink) => isHappyHour ? d.priceHH : d.price;
  const tabTotal = tabItems.reduce((s, t) => {
    const drink = DRINKS.find(d => d.id === t.drinkId);
    return s + (drink ? getPrice(drink) : 0);
  }, 0);
  const hhSavings = tabItems.reduce((s, t) => {
    const drink = DRINKS.find(d => d.id === t.drinkId);
    return s + (drink ? drink.price - getPrice(drink) : 0);
  }, 0);

  const getPersonTotal = (name: string) => tabItems.filter(t => t.who === name).reduce((s, t) => {
    const drink = DRINKS.find(d => d.id === t.drinkId);
    return s + (drink ? getPrice(drink) : 0);
  }, 0);

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
            <p className="text-sm text-muted-foreground">Sexta-feira</p>
            <h1 className="font-display text-xl font-bold">Bares por perto</h1>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/50 border border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Buscar bares...</span>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
            {['Happy Hour', 'Cerveja Artesanal', 'Coquetelaria', 'Ao vivo', 'Petiscos'].map((f, i) => (
              <button key={f} className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap ${i === 0 ? 'bg-warning text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f}</button>
            ))}
          </div>
          <GuidedHint text="Bares com Happy Hour ativo aparecem em destaque" />
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-3">
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <div className="h-24 bg-gradient-to-r from-amber-600/20 to-yellow-700/20 flex items-center justify-center relative">
                <ItemIcon cat="beer" size="hero" />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded-full bg-warning/90 text-primary-foreground text-[9px] font-bold animate-pulse">🎉 Happy Hour</span>
                </div>
                <div className="absolute bottom-2 left-3 px-2 py-1 rounded-lg bg-background/80 backdrop-blur text-[10px] font-semibold">
                  20 torneiras
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-base font-bold">Noowe Tap House</h3>
                  <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-accent fill-accent" /><span className="text-sm font-bold">4.7</span></div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Pub · Cerveja Artesanal · 400m</p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-success font-medium">Aberto até 02:00</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-warning font-medium">HH até 20:00</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      );

    case 'restaurant':
      return (
        <div className="px-5 pb-4">
          <Header title="Noowe Tap House" back="home" />
          <div className="text-center mb-4">
            <ItemIcon cat="beer" size="hero" className="mx-auto" />
            <h2 className="font-display text-xl font-bold mt-2">Noowe Tap House</h2>
            <p className="text-sm text-muted-foreground">20 torneiras artesanais · Ambiente social</p>
            <div className="flex items-center justify-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" />4.7 (1.2k)</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">R$ 25-60/pessoa</span>
            </div>
          </div>
          {isHappyHour && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-warning/10 to-accent/10 border border-warning/20 mb-4 text-center">
              <Sparkles className="w-5 h-5 text-warning mx-auto mb-1" />
              <p className="font-bold text-sm text-warning">Happy Hour Ativo!</p>
              <p className="text-xs text-muted-foreground">Chopp e drinks com até 30% off · Faltam {hhMinutes} min</p>
              <div className="w-full h-1.5 bg-muted rounded-full mt-2">
                <div className="h-full bg-warning rounded-full" style={{ width: `${(hhMinutes / 120) * 100}%` }} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Torneiras', value: '20', icon: '🍺' },
              { label: 'Drinks', value: '15+', icon: '🍸' },
              { label: 'Petiscos', value: '8', icon: '🍟' },
            ].map(s => (
              <div key={s.label} className="p-2.5 rounded-xl bg-muted/30 text-center">
                <span className="text-lg">{s.icon}</span>
                <p className="text-xs font-bold">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <GuidedHint text="Abra um tab digital — pré-autorização sem cobrança antecipada" />
          <button onClick={() => onNavigate('open-tab')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <Beer className="w-5 h-5" /> Abrir Tab Digital
          </button>
        </div>
      );

    case 'open-tab':
      return (
        <div className="px-5 pb-4">
          <Header title="Abrir Tab" back="restaurant" />
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold">Tab Digital</h2>
            <p className="text-sm text-muted-foreground">Vinculamos seu cartão — você paga só o que consumir</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1"><p className="text-sm font-medium">•••• •••• •••• 4242</p><p className="text-[10px] text-muted-foreground">Visa · Crédito</p></div>
              <Check className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 mb-4">
            <p className="text-xs font-semibold mb-2">⚙️ Configurar limite (opcional)</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setTabLimit(prev => Math.max(100, prev - 50))} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Minus className="w-4 h-4" /></button>
              <div className="flex-1 text-center">
                <p className="font-display text-xl font-bold">R$ {tabLimit}</p>
                <p className="text-[9px] text-muted-foreground">Alerta quando atingir 80%</p>
              </div>
              <button onClick={() => setTabLimit(prev => prev + 50)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="space-y-1.5 mb-4 text-xs text-muted-foreground">
            <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" /> Nenhuma cobrança até fechar o tab</p>
            <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" /> Convide amigos para tab compartilhado</p>
            <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" /> Alerta automático no limite</p>
          </div>
          <button onClick={() => onNavigate('group-tab')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow">
            Abrir Tab
          </button>
        </div>
      );

    case 'group-tab':
      return (
        <div className="px-5 pb-4">
          <Header title="Tab Compartilhado" back="open-tab" />
          <div className="p-4 rounded-xl bg-success/10 border border-success/20 mb-4 text-center">
            <Check className="w-6 h-6 text-success mx-auto mb-1" />
            <p className="text-sm font-bold text-success">Tab Aberto!</p>
            <p className="text-xs text-muted-foreground">Tab #TH-284 · Noowe Tap House</p>
          </div>
          <h3 className="font-semibold text-sm mb-3">Pessoas no Tab</h3>
          <div className="space-y-2 mb-4">
            {FRIENDS.map(f => (
              <div key={f.id} className={`flex items-center gap-3 p-3 rounded-xl border ${f.status === 'pending' ? 'border-dashed border-border' : 'border-border bg-card'}`}>
                <div className={`w-9 h-9 rounded-full ${f.color} flex items-center justify-center text-primary-foreground text-sm font-bold`}>{f.initial}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">{f.status === 'host' ? '👑 Host do Tab' : f.status === 'joined' ? '✓ No tab' : '⏳ Convite pendente'}</p>
                </div>
                {f.status === 'pending' && <button className="px-2 py-1 rounded-lg bg-primary/10 text-[10px] text-primary font-semibold">Reenviar</button>}
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border mb-4">
            <UserPlus className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Convidar mais amigos</span>
          </button>
          <div className="p-3 rounded-xl bg-card border border-border mb-4">
            <p className="text-xs font-semibold mb-1">Link do Tab</p>
            <div className="flex items-center gap-2">
              <span className="flex-1 text-xs text-muted-foreground truncate">noowe.app/tab/TH-284</span>
              <button className="p-1.5 rounded-md bg-primary/10"><Copy className="w-3 h-3 text-primary" /></button>
              <button className="p-1.5 rounded-md bg-primary/10"><Share2 className="w-3 h-3 text-primary" /></button>
            </div>
          </div>
          <GuidedHint text="Cada amigo registra o que pediu no seu celular" />
          <button onClick={() => onNavigate('happy-hour')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <Beer className="w-5 h-5" /> Ver Cardápio
          </button>
        </div>
      );

    case 'happy-hour':
      return (
        <div className="px-5 pb-4">
          <Header title="🎉 Happy Hour" back="group-tab" />
          <div className="p-4 rounded-xl bg-gradient-to-r from-warning/10 to-accent/10 border border-warning/20 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-sm text-warning">Happy Hour Ativo!</p>
                <p className="text-xs text-muted-foreground">Faltam {hhMinutes} min</p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-warning/20">
                <p className="text-xs font-bold text-warning">Até 30% OFF</p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full">
              <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${(hhMinutes / 120) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {DRINKS.filter(d => d.cat !== 'Petiscos').map(drink => {
              const discount = Math.round((1 - drink.priceHH / drink.price) * 100);
              return (
                <button key={drink.id} onClick={() => { setSelectedDrink(drink); onNavigate('drink-detail'); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                  <span className="text-2xl">{drink.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm">{drink.name}</p>
                      {drink.isNew && <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-bold">NOVO</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{drink.style || drink.desc}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="line-through text-xs text-muted-foreground">R$ {drink.price}</span>
                      <span className="text-warning font-bold text-xs">R$ {drink.priceHH}</span>
                      {discount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-warning/20 text-warning text-[9px] font-bold">-{discount}%</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
          <button onClick={() => onNavigate('tap-list')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">
            Ver Cardápio Completo
          </button>
        </div>
      );

    case 'tap-list':
      const cats = ['Todos', 'Chopp', 'Drinks', 'Petiscos'];
      const filtered = selectedCat === 'Todos' ? DRINKS : DRINKS.filter(d => d.cat === selectedCat);
      return (
        <div className="px-5 pb-4">
          <Header title="Cardápio" back="happy-hour" right={
            <button onClick={() => onNavigate('tab-live')} className="relative p-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">{tabItems.length}</span>
            </button>
          } />
          <div className="flex gap-2 mb-4">
            {cats.map(cat => (
              <button key={cat} onClick={() => setSelectedCat(cat)} className={`px-3 py-1.5 rounded-full text-[10px] font-medium ${selectedCat === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map(drink => (
              <button key={drink.id} onClick={() => { setSelectedDrink(drink); onNavigate('drink-detail'); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                <span className="text-2xl">{drink.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm">{drink.name}</p>
                    {drink.isNew && <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-bold">NOVO</span>}
                  </div>
                  {drink.abv && (
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>ABV {drink.abv}%</span>
                      {drink.ibu && <span>· IBU {drink.ibu}</span>}
                      {drink.style && <span>· {drink.style}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    {isHappyHour && drink.priceHH < drink.price ? (
                      <>
                        <span className="line-through text-[10px] text-muted-foreground">R$ {drink.price}</span>
                        <span className="text-warning font-bold text-xs">R$ {drink.priceHH}</span>
                      </>
                    ) : (
                      <span className="text-xs font-semibold">R$ {drink.price}</span>
                    )}
                  </div>
                </div>
                <Plus className="w-4 h-4 text-primary" />
              </button>
            ))}
          </div>
          <button onClick={() => onNavigate('round-builder')} className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            🍻 Montar Rodada
          </button>
        </div>
      );

    case 'drink-detail':
      const drink = selectedDrink || DRINKS[0];
      return (
        <div className="px-5 pb-4">
          <Header title={drink.name} back="tap-list" />
          <div className="text-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <span className="text-5xl">{drink.emoji}</span>
            </div>
            <h2 className="font-display text-lg font-bold">{drink.name}</h2>
            {drink.style && <p className="text-xs text-primary font-medium">{drink.style}</p>}
            <p className="text-sm text-muted-foreground mt-1">{drink.desc}</p>
          </div>
          {drink.abv && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-3 rounded-xl bg-muted/30 text-center">
                <p className="text-sm font-bold">{drink.abv}%</p>
                <p className="text-[9px] text-muted-foreground">ABV</p>
              </div>
              {drink.ibu && (
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <p className="text-sm font-bold">{drink.ibu}</p>
                  <p className="text-[9px] text-muted-foreground">IBU</p>
                </div>
              )}
              <div className="p-3 rounded-xl bg-muted/30 text-center">
                <p className="text-sm font-bold">300ml</p>
                <p className="text-[9px] text-muted-foreground">Copo</p>
              </div>
            </div>
          )}
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-center justify-between">
              <div>
                {isHappyHour && drink.priceHH < drink.price ? (
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">R$ {drink.price}</span>
                    <span className="font-display text-xl font-bold text-warning">R$ {drink.priceHH}</span>
                  </div>
                ) : (
                  <span className="font-display text-xl font-bold">R$ {drink.price}</span>
                )}
              </div>
              {isHappyHour && drink.priceHH < drink.price && (
                <span className="px-2 py-1 rounded-full bg-warning/20 text-warning text-xs font-bold">Happy Hour</span>
              )}
            </div>
          </div>
          <p className="text-xs font-semibold mb-2">Para quem?</p>
          <div className="flex gap-2 mb-4">
            {FRIENDS.filter(f => f.status !== 'pending').map(f => (
              <button key={f.id} className={`flex-1 p-2.5 rounded-xl border-2 text-center ${f.id === 'f1' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <div className={`w-8 h-8 rounded-full ${f.color} flex items-center justify-center text-primary-foreground text-xs font-bold mx-auto mb-1`}>{f.initial}</div>
                <p className="text-[9px] font-medium">{f.name}</p>
              </button>
            ))}
          </div>
          <button onClick={() => { setTabItems(prev => [...prev, { drinkId: drink.id, who: 'Você', time: '20:15' }]); onNavigate('round-confirm'); }} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Pedir · R$ {getPrice(drink)}
          </button>
        </div>
      );

    case 'round-builder':
      return (
        <div className="px-5 pb-4">
          <Header title="🍻 Montar Rodada" back="tap-list" />
          <GuidedHint text="Monte a rodada do grupo — todos os drinks de uma vez" />
          <div className="space-y-3 mb-4">
            {FRIENDS.filter(f => f.status !== 'pending').map(f => (
              <div key={f.id} className="p-3 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-full ${f.color} flex items-center justify-center text-primary-foreground text-xs font-bold`}>{f.initial}</div>
                  <span className="text-sm font-semibold">{f.name}</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {DRINKS.filter(d => d.cat !== 'Petiscos').slice(0, 4).map(d => {
                    const isSelected = roundDrinks.some(r => r.who === f.name && r.drinkId === d.id);
                    return (
                      <button key={d.id} onClick={() => setRoundDrinks(prev => isSelected ? prev.filter(r => !(r.who === f.name && r.drinkId === d.id)) : [...prev, { drinkId: d.id, who: f.name }])}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap border ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                        {d.emoji} {d.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {roundDrinks.length > 0 && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4">
              <p className="text-xs font-bold mb-1">Rodada: {roundDrinks.length} drinks</p>
              <p className="text-xs text-muted-foreground">
                Total: R$ {roundDrinks.reduce((s, r) => { const d = DRINKS.find(d => d.id === r.drinkId); return s + (d ? getPrice(d) : 0); }, 0)}
              </p>
            </div>
          )}
          <button onClick={() => onNavigate('round-confirm')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            🍻 Enviar Rodada ({roundDrinks.length} drinks)
          </button>
        </div>
      );

    case 'round-confirm':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-1">Pedido Enviado! 🍻</h2>
          <p className="text-sm text-muted-foreground mb-4">O barman já recebeu</p>
          <div className="w-full p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Tab acumulado</span>
              <span className="font-bold text-primary">R$ {tabTotal}</span>
            </div>
            {hhSavings > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-warning">Economia Happy Hour</span>
                <span className="text-warning font-semibold">-R$ {hhSavings}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 w-full">
            <button onClick={() => onNavigate('repeat-round')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <RefreshCw className="w-4 h-4" /> Repetir
            </button>
            <button onClick={() => onNavigate('tab-live')} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
              Ver Tab
            </button>
          </div>
        </div>
      );

    case 'repeat-round':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <RefreshCw className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-1">Rodada Repetida! 🍻</h2>
          <p className="text-sm text-muted-foreground mb-4">Mesmo pedido para os 3</p>
          <div className="w-full p-4 rounded-xl bg-card border border-border mb-4 space-y-2">
            {[
              { drink: 'IPA Artesanal', who: 'Você', price: 19 },
              { drink: 'Pilsen Premium', who: 'Lucas', price: 15 },
              { drink: 'Gin Tônica', who: 'Ana', price: 26 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-3 h-3 text-success" />
                <span className="flex-1">{item.drink}</span>
                <span className="text-xs text-muted-foreground">{item.who}</span>
                <span className="font-semibold text-xs">R$ {item.price}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-4">⚡ Barman já recebeu o pedido</p>
          <button onClick={() => onNavigate('tab-live')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Ver Tab Completo
          </button>
        </div>
      );

    case 'tab-live':
      return (
        <div className="px-5 pb-4">
          <Header title="Tab ao Vivo" back="tap-list" right={
            <button onClick={() => onNavigate('tab-limit')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-warning" />
            </button>
          } />
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">Tab #TH-284</span>
              <span className="font-display text-xl font-bold text-primary">R$ {tabTotal}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full mb-1">
              <div className={`h-full rounded-full transition-all ${tabTotal / tabLimit > 0.8 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${Math.min((tabTotal / tabLimit) * 100, 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">Limite: R$ {tabLimit} · {Math.round((tabTotal / tabLimit) * 100)}% usado</p>
          </div>

          <h3 className="font-semibold text-sm mb-2">Consumo por pessoa</h3>
          <div className="space-y-2 mb-4">
            {FRIENDS.filter(f => f.status !== 'pending').map(f => {
              const personTotal = getPersonTotal(f.name);
              const personItems = tabItems.filter(t => t.who === f.name);
              return (
                <div key={f.id} className="p-3 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-full ${f.color} flex items-center justify-center text-primary-foreground text-[10px] font-bold`}>{f.initial}</div>
                    <span className="text-sm font-semibold flex-1">{f.name}</span>
                    <span className="font-semibold text-sm">R$ {personTotal}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {personItems.map((item, i) => {
                      const d = DRINKS.find(d => d.id === item.drinkId);
                      return <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-[9px] text-muted-foreground">{d?.emoji} {d?.name.split(' ')[0]} · {item.time}</span>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {hhSavings > 0 && (
            <div className="p-3 rounded-xl bg-warning/5 border border-warning/20 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-warning" />
              <span className="text-xs text-warning font-medium">Economia HH: -R$ {hhSavings} 🎉</span>
            </div>
          )}

          <div className="flex gap-2 mb-3">
            <button onClick={() => onNavigate('tap-list')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <Plus className="w-4 h-4" /> Pedir Mais
            </button>
            <button onClick={() => onNavigate('repeat-round')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <RefreshCw className="w-4 h-4" /> Repetir
            </button>
          </div>
          <button onClick={() => onNavigate('close-tab')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow">
            Fechar Tab
          </button>
        </div>
      );

    case 'tab-limit':
      return (
        <div className="px-5 pb-4">
          <Header title="Limite do Tab" back="tab-live" />
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
            <h2 className="font-display text-lg font-bold">Controle de Gastos</h2>
            <p className="text-sm text-muted-foreground">Defina alertas para o tab do grupo</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <p className="text-xs font-semibold mb-3">Limite individual</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setTabLimit(prev => Math.max(100, prev - 50))} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><Minus className="w-4 h-4" /></button>
              <div className="flex-1 text-center">
                <p className="font-display text-2xl font-bold">R$ {tabLimit}</p>
              </div>
              <button onClick={() => setTabLimit(prev => prev + 50)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {[
              { label: 'Alerta em 80%', desc: `R$ ${Math.round(tabLimit * 0.8)}`, active: true },
              { label: 'Bloquear ao atingir limite', desc: 'Impede novos pedidos', active: false },
              { label: 'Notificar host', desc: 'Avisa quando alguém atingir', active: true },
            ].map((opt, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <div className="flex-1"><p className="text-sm font-medium">{opt.label}</p><p className="text-[10px] text-muted-foreground">{opt.desc}</p></div>
                <div className={`w-10 h-5 rounded-full ${opt.active ? 'bg-primary' : 'bg-muted'} relative`}>
                  <div className={`absolute top-0.5 ${opt.active ? 'right-0.5' : 'left-0.5'} w-4 h-4 rounded-full bg-primary-foreground shadow`} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('tab-live')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Salvar Configurações
          </button>
        </div>
      );

    case 'close-tab':
      return (
        <div className="px-5 pb-4">
          <Header title="Fechar Tab" back="tab-live" />
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <h3 className="font-semibold text-sm mb-3">Resumo do Tab</h3>
            {FRIENDS.filter(f => f.status !== 'pending').map(f => {
              const personTotal = getPersonTotal(f.name);
              const drinks = tabItems.filter(t => t.who === f.name).length;
              return (
                <div key={f.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full ${f.color} flex items-center justify-center text-primary-foreground text-xs font-bold`}>{f.initial}</div>
                    <div><p className="text-sm font-medium">{f.name}</p><p className="text-[10px] text-muted-foreground">{drinks} drinks</p></div>
                  </div>
                  <span className="font-semibold text-sm">R$ {personTotal}</span>
                </div>
              );
            })}
            <div className="border-t-2 border-border pt-3 mt-2 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>R$ {tabTotal}</span></div>
              {hhSavings > 0 && <div className="flex justify-between text-sm"><span className="text-warning">Economia HH</span><span className="text-warning">-R$ {hhSavings}</span></div>}
              <div className="flex justify-between font-display font-bold text-lg mt-1"><span>Total</span><span className="text-primary">R$ {tabTotal}</span></div>
            </div>
          </div>
          <p className="text-xs font-semibold mb-2">Modo de divisão</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button onClick={() => setSplitMode('consumption')} className={`p-3 rounded-xl border-2 text-center ${splitMode === 'consumption' ? 'border-primary bg-primary/10' : 'border-border'}`}>
              <DollarSign className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xs font-semibold">Por Consumo</p>
              <p className="text-[9px] text-muted-foreground">Cada um paga o que pediu</p>
            </button>
            <button onClick={() => setSplitMode('equal')} className={`p-3 rounded-xl border-2 text-center ${splitMode === 'equal' ? 'border-primary bg-primary/10' : 'border-border'}`}>
              <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-semibold">Igual</p>
              <p className="text-[9px] text-muted-foreground">R$ {Math.ceil(tabTotal / 3)} cada</p>
            </button>
          </div>
          {splitMode === 'consumption' && (
            <div className="p-4 rounded-xl bg-muted/30 mb-4">
              <p className="text-xs font-semibold mb-2">Você paga:</p>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">R$ {getPersonTotal('Você')}</span></div>
            </div>
          )}
          <button onClick={() => onNavigate('tab-success')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" /> Fechar & Pagar
          </button>
        </div>
      );

    case 'tab-success':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center mb-5 shadow-xl shadow-amber-500/30">
            <Beer className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-1">Tab Fechado! 🍻</h2>
          <p className="text-sm text-muted-foreground mb-4">Noowe Tap House agradece</p>
          <div className="w-full p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Você consumiu</span><span className="font-semibold">R$ {getPersonTotal('Você')}</span></div>
            {hhSavings > 0 && <div className="flex justify-between text-sm mb-1"><span className="text-warning">Economia HH total</span><span className="text-warning">-R$ {hhSavings}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status tab</span><span className="text-success font-semibold">✓ Todos pagaram</span></div>
          </div>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-3 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-semibold">+45 pontos ganhos!</p>
              <p className="text-[10px] text-muted-foreground">Próximo chopp grátis em 3 visitas</p>
            </div>
          </div>
          <div className="w-full p-3 rounded-xl bg-muted/30 mb-4 flex items-center gap-3">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <p className="text-xs text-muted-foreground">Selo Bar Regular conquistado! 🏆</p>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">
            Voltar ao Início
          </button>
        </div>
      );

    default: return null;
  }
};
