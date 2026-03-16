/**
 * Pub & Bar Demo — Noowe Tap House
 * 
 * 10-Stage Service Blueprint:
 * 1. Discovery → 2. Decision → 3. Arrival (QR check-in) → 4. Menu
 * 5. Order → 6. Continuous Consumption (rounds) → 7. Bill (live tab)
 * 8. Split → 9. Payment → 10. Post-Experience
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint, ItemIcon } from '../DemoShared';
import DemoSplitBill from '../DemoSplitBill';
import DemoPayment from '../DemoPayment';
import DemoPaymentSuccess from '../DemoPaymentSuccess';
import { FoodImg } from '../FoodImages';
import {
  ArrowLeft, Check, Star, Clock, Plus, Minus, CreditCard, Gift, QrCode,
  Users, Timer, ArrowRight, Beer, RefreshCw, UserPlus, Share2,
  Copy, Sparkles, DollarSign, AlertTriangle,
  Bell, ThumbsUp, MapPin, Search, ChevronRight,
  UtensilsCrossed, Crown, Trophy, Settings, MessageCircle,
  ScanLine, Volume2, CircleDollarSign, TrendingUp, Utensils,
} from 'lucide-react';

type Screen =
  | 'discovery' | 'venue' | 'check-in' | 'tab-opened'
  | 'invite-friends' | 'menu' | 'drink-detail'
  | 'order-status' | 'call-waiter' | 'round-builder' | 'round-sent'
  | 'tab-live' | 'split' | 'payment' | 'post';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descoberta', screens: ['discovery', 'venue'] },
  { step: 2, label: 'Chegada & Check-in', screens: ['check-in', 'tab-opened'] },
  { step: 3, label: 'Convidar amigos', screens: ['invite-friends'] },
  { step: 4, label: 'Cardápio & Pedido', screens: ['menu', 'drink-detail', 'order-status'] },
  { step: 5, label: 'Chamar garçom', screens: ['call-waiter'] },
  { step: 6, label: 'Rodada do grupo', screens: ['round-builder', 'round-sent'] },
  { step: 7, label: 'Conta ao vivo', screens: ['tab-live'] },
  { step: 8, label: 'Dividir & Pagar', screens: ['split', 'payment'] },
  { step: 9, label: 'Pós-experiência', screens: ['post'] },
];

export const SCREEN_INFO: Record<Screen, { title: string; desc: string }> = {
  'discovery': { title: 'Descoberta', desc: 'Bares por perto com happy hour, ocupação e amigos presentes.' },
  'venue': { title: 'Noowe Tap House', desc: 'Detalhes do bar: torneiras, happy hour, ambiente.' },
  'check-in': { title: 'Check-in', desc: 'Escaneie o QR da mesa — tab abre automaticamente.' },
  'tab-opened': { title: 'Tab Aberto', desc: 'Cartão pré-autorizado, cover vira crédito.' },
  'invite-friends': { title: 'Tab Compartilhado', desc: 'Amigos entram no tab pelo link.' },
  'menu': { title: 'Cardápio', desc: 'Peça direto do celular — sem esperar garçom.' },
  'drink-detail': { title: 'Detalhe', desc: 'Ficha do chopp: ABV, IBU, harmonização.' },
  'order-status': { title: 'Pedido Enviado', desc: 'Barman recebeu — acompanhe o status.' },
  'call-waiter': { title: 'Chamar Garçom', desc: 'Garçom notificado com motivo — sem levantar a mão.' },
  'round-builder': { title: 'Rodada', desc: 'Monte a rodada do grupo — cada um escolhe o seu.' },
  'round-sent': { title: 'Rodada Enviada', desc: 'Todos os drinks enviados ao bar de uma vez.' },
  'tab-live': { title: 'Conta ao Vivo', desc: 'Quem pediu o quê, quanto cada um deve, em tempo real.' },
  'split': { title: 'Dividir Conta', desc: 'Por consumo, igual ou seletivo.' },
  'payment': { title: 'Pagamento', desc: 'Pague e saia — sem esperar.' },
  'post': { title: 'Pós-Experiência', desc: 'Avalie, ganhe pontos, salve o bar.' },
};

interface Drink {
  id: string; name: string; price: number; priceHH: number;
  cat: string; abv?: number; ibu?: number;
  style?: string; desc?: string; isNew?: boolean;
  trending?: boolean; imgId: string;
}

const DRINKS: Drink[] = [
  { id: 'd1', name: 'IPA Artesanal', price: 28, priceHH: 19, cat: 'Chopp', abv: 6.5, ibu: 55, style: 'American IPA', desc: 'Lupulada e cítrica com final amargo', isNew: true, trending: true, imgId: 'ipa' },
  { id: 'd2', name: 'Pilsen Premium', price: 22, priceHH: 15, cat: 'Chopp', abv: 4.8, ibu: 18, style: 'German Pilsner', desc: 'Leve, refrescante e maltada', trending: true, imgId: 'pilsen' },
  { id: 'd3', name: 'Stout de Chocolate', price: 30, priceHH: 21, cat: 'Chopp', abv: 5.5, ibu: 35, style: 'Chocolate Stout', desc: 'Notas de cacau e café torrado', imgId: 'stout' },
  { id: 'd4', name: 'Wheat Beer', price: 25, priceHH: 17, cat: 'Chopp', abv: 5.0, ibu: 12, style: 'Hefeweizen', desc: 'Notas de banana e cravo', imgId: 'wheat-beer' },
  { id: 'd5', name: 'Gin Tônica Artesanal', price: 38, priceHH: 26, cat: 'Drinks', abv: 12.0, desc: 'Gin artesanal com tônica premium', imgId: 'gin-tonic' },
  { id: 'd6', name: 'Aperol Spritz', price: 35, priceHH: 24, cat: 'Drinks', abv: 8.0, desc: 'Aperol, prosecco e soda', imgId: 'aperol' },
  { id: 'd7', name: 'Moscow Mule', price: 36, priceHH: 25, cat: 'Drinks', abv: 10.0, desc: 'Vodka, ginger beer e limão', imgId: 'moscow-mule' },
  { id: 'd8', name: 'Porção de Batata', price: 32, priceHH: 32, cat: 'Petiscos', desc: 'Batata rústica com trio de molhos', imgId: 'rustic-fries' },
  { id: 'd9', name: 'Nachos Supreme', price: 38, priceHH: 38, cat: 'Petiscos', desc: 'Nachos com guacamole e cheddar', imgId: 'nachos' },
  { id: 'd10', name: 'Tábua de Frios', price: 65, priceHH: 65, cat: 'Petiscos', desc: 'Queijos artesanais, embutidos e frutas', imgId: 'cheese-board' },
];

interface TabItem { drinkId: string; who: string; time: string; }

const FRIENDS = [
  { id: 'f1', name: 'Você', initial: 'V', color: 'bg-primary', status: 'host' as const },
  { id: 'f2', name: 'Lucas', initial: 'L', color: 'bg-blue-500', status: 'joined' as const },
  { id: 'f3', name: 'Ana', initial: 'A', color: 'bg-pink-500', status: 'joined' as const },
  { id: 'f4', name: 'Pedro', initial: 'P', color: 'bg-green-500', status: 'pending' as const },
];

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const PubBarDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [isHappyHour] = useState(true);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [tabItems, setTabItems] = useState<TabItem[]>([
    { drinkId: 'd1', who: 'Você', time: '19:15' },
    { drinkId: 'd2', who: 'Lucas', time: '19:15' },
    { drinkId: 'd5', who: 'Ana', time: '19:20' },
    { drinkId: 'd8', who: 'Mesa', time: '19:25' },
    { drinkId: 'd1', who: 'Você', time: '19:45' },
    { drinkId: 'd2', who: 'Lucas', time: '19:45' },
  ]);
  const [tabLimit, setTabLimit] = useState(300);
  const [splitMode, setSplitMode] = useState<'consumption' | 'equal' | 'selective'>('consumption');
  const [roundDrinks, setRoundDrinks] = useState<{ drinkId: string; who: string }[]>([]);
  const [hhMinutes, setHhMinutes] = useState(92);
  const [waiterReason, setWaiterReason] = useState<string | null>(null);
  const coverCredit = 25;

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
    /* ═══ STAGE 1: DISCOVERY ═══ */
    case 'discovery':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-3">
            <p className="text-sm text-muted-foreground">Sexta-feira, 18:30</p>
            <h1 className="font-display text-xl font-bold">Onde ir hoje?</h1>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/50 border border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Buscar bares, pubs...</span>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
            {['Happy Hour', 'Cerveja Artesanal', 'Coquetelaria', 'Ao vivo', 'Petiscos'].map((f, i) => (
              <button key={f} className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap ${i === 0 ? 'bg-warning text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f}</button>
            ))}
          </div>

          {/* Smart discovery: amigos frequentam */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-3 flex items-center gap-3">
            <div className="flex -space-x-2">
              {FRIENDS.slice(1, 3).map(f => (
                <div key={f.id} className={`w-7 h-7 rounded-full ${f.color} flex items-center justify-center text-primary-foreground text-[10px] font-bold border-2 border-background`}>{f.initial}</div>
              ))}
            </div>
            <p className="text-xs"><span className="font-semibold">Lucas e Ana</span> <span className="text-muted-foreground">frequentam o Noowe Tap House</span></p>
          </div>

          <GuidedHint text="Discovery inteligente: sugestões por horário, clima, perfil e amigos" />
          <button onClick={() => onNavigate('venue')} className="w-full text-left mb-3">
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <div className="h-24 bg-gradient-to-r from-amber-600/20 to-yellow-700/20 flex items-center justify-center relative">
                <ItemIcon cat="beer" size="hero" />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded-full bg-warning/90 text-primary-foreground text-[9px] font-bold animate-pulse flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> HH Ativo</span>
                </div>
                <div className="absolute bottom-2 left-3 flex items-center gap-2">
                  <span className="px-2 py-1 rounded-lg bg-background/80 backdrop-blur text-[10px] font-semibold">20 torneiras</span>
                  <span className="px-2 py-1 rounded-lg bg-success/80 text-primary-foreground text-[10px] font-semibold flex items-center gap-1"><Users className="w-2.5 h-2.5" /> 60% ocupado</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-base font-bold">Noowe Tap House</h3>
                  <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-accent fill-accent" /><span className="text-sm font-bold">4.7</span></div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Pub · Cerveja Artesanal · 400m</p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-success font-medium">Aberto</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-warning font-medium">HH até 20:00</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">~ R$ 45/pessoa</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">Cover R$25</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      );

    /* ═══ STAGE 1b: VENUE DETAIL ═══ */
    case 'venue':
      return (
        <div className="px-5 pb-4">
          <Header title="Noowe Tap House" back="discovery" />
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
              <p className="text-xs text-muted-foreground">Chopp e drinks até 30% off · Faltam {hhMinutes} min</p>
              <div className="w-full h-1.5 bg-muted rounded-full mt-2">
                <div className="h-full bg-warning rounded-full" style={{ width: `${(hhMinutes / 120) * 100}%` }} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: 'Ocupação', value: '60%', icon: Users },
              { label: 'Espera', value: '~5 min', icon: Clock },
              { label: 'Torneiras', value: '20', icon: Beer },
              { label: 'Cover', value: 'R$25', icon: CircleDollarSign },
            ].map(s => (
              <div key={s.label} className="p-2 rounded-xl bg-muted/30 text-center">
                <s.icon className="w-4 h-4 text-primary mx-auto mb-0.5" />
                <p className="text-[10px] font-bold">{s.value}</p>
                <p className="text-[8px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Mais pedidos */}
          <div className="p-3 rounded-xl bg-muted/30 mb-4">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-primary" /> Mais pedidos agora</p>
            <div className="flex gap-2">
              {DRINKS.filter(d => d.trending).map(d => (
                <div key={d.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-card border border-border">
                  <FoodImg id={d.imgId} size="xs" alt={d.name} />
                  <span className="text-[10px] font-medium">{d.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <GuidedHint text="Chegou no bar? Escaneie o QR da mesa para abrir o tab" />
          <button onClick={() => onNavigate('check-in')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <ScanLine className="w-5 h-5" /> Fazer Check-in (QR da Mesa)
          </button>
        </div>
      );

    /* ═══ STAGE 3: ARRIVAL — CHECK-IN ═══ */
    case 'check-in':
      return (
        <div className="px-5 pb-4">
          <Header title="Check-in" back="venue" />
          <div className="text-center mb-5">
            <div className="w-44 h-44 mx-auto bg-gradient-to-br from-muted to-muted/30 rounded-3xl flex items-center justify-center relative mb-4 border-2 border-dashed border-primary/30">
              <ScanLine className="w-14 h-14 text-primary/40" />
              <div className="absolute inset-4 border-2 border-primary/50 rounded-2xl animate-pulse" />
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br-lg" />
            </div>
            <h2 className="font-display text-lg font-bold">Aponte para o QR da mesa</h2>
            <p className="text-sm text-muted-foreground mt-1">No centro da mesa ou no porta-copos</p>
          </div>
          <div className="space-y-2 mb-4">
            {[
              { icon: QrCode, text: 'Escaneie → tab abre automaticamente na sua mesa' },
              { icon: CreditCard, text: 'Cartão pré-autorizado — paga só o que consumir' },
              { icon: CircleDollarSign, text: 'Cover de R$25 convertido em crédito de consumação' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <item.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('tab-opened')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <Check className="w-5 h-5" /> Simular Scan — Mesa 7
          </button>
        </div>
      );

    case 'tab-opened':
      return (
        <div className="px-5 pb-4">
          <Header title="Tab Aberto" back="check-in" />
          <div className="text-center mb-4">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h2 className="font-display text-xl font-bold">Check-in realizado!</h2>
            <p className="text-sm text-muted-foreground">Mesa 7 · Tab #TH-284</p>
          </div>
          <div className="p-4 rounded-xl bg-success/5 border border-success/20 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-success">R$ {coverCredit} em crédito</p>
                <p className="text-[10px] text-muted-foreground">Cover convertido em consumação</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1"><p className="text-sm font-medium">•••• 4242</p><p className="text-[10px] text-muted-foreground">Visa · Pré-autorizado</p></div>
              <Check className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 mb-4">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-muted-foreground" /> Limite de gasto (opcional)</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setTabLimit(prev => Math.max(100, prev - 50))} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Minus className="w-4 h-4" /></button>
              <div className="flex-1 text-center"><p className="font-display text-xl font-bold">R$ {tabLimit}</p><p className="text-[9px] text-muted-foreground">Alerta em 80%</p></div>
              <button onClick={() => setTabLimit(prev => prev + 50)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <GuidedHint text="Tab aberto! Convide amigos ou vá direto pro cardápio" />
          <button onClick={() => onNavigate('invite-friends')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5" /> Convidar Amigos pro Tab
          </button>
          <button onClick={() => onNavigate('menu')} className="w-full mt-2 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
            <Beer className="w-4 h-4" /> Ir pro Cardápio
          </button>
        </div>
      );

    /* ═══ STAGE 3b: INVITE FRIENDS TO TAB ═══ */
    case 'invite-friends':
      return (
        <div className="px-5 pb-4">
          <Header title="Tab Compartilhado" back="tab-opened" />
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-4 text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold">Tab #TH-284 · Mesa 7</p>
            <p className="text-xs text-muted-foreground">Cada um pede no seu celular — tudo registrado por pessoa</p>
          </div>
          <div className="space-y-2 mb-4">
            {FRIENDS.map(f => (
              <div key={f.id} className={`flex items-center gap-3 p-3 rounded-xl border ${f.status === 'pending' ? 'border-dashed border-border' : 'border-border bg-card'}`}>
                <div className={`w-9 h-9 rounded-full ${f.color} flex items-center justify-center text-primary-foreground text-sm font-bold`}>{f.initial}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {f.status === 'host' && <><Crown className="w-2.5 h-2.5 text-accent" /> Host</>}
                    {f.status === 'joined' && <><Check className="w-2.5 h-2.5 text-success" /> No tab</>}
                    {f.status === 'pending' && <><Clock className="w-2.5 h-2.5 text-warning" /> Convite enviado</>}
                  </p>
                </div>
                {f.status === 'pending' && <button className="px-2 py-1 rounded-lg bg-primary/10 text-[10px] text-primary font-semibold">Reenviar</button>}
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border mb-3">
            <UserPlus className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Convidar mais</span>
          </button>
          <div className="p-3 rounded-xl bg-card border border-border mb-4">
            <p className="text-xs font-semibold mb-1">Link do Tab</p>
            <div className="flex items-center gap-2">
              <span className="flex-1 text-xs text-muted-foreground truncate">noowe.app/tab/TH-284</span>
              <button className="p-1.5 rounded-md bg-primary/10"><Copy className="w-3 h-3 text-primary" /></button>
              <button className="p-1.5 rounded-md bg-primary/10"><Share2 className="w-3 h-3 text-primary" /></button>
            </div>
          </div>
          <button onClick={() => onNavigate('menu')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <Beer className="w-5 h-5" /> Ver Cardápio
          </button>
        </div>
      );

    /* ═══ STAGE 4 & 5: MENU & ORDER ═══ */
    case 'menu': {
      const cats = ['Todos', 'Chopp', 'Drinks', 'Petiscos'];
      const filtered = selectedCat === 'Todos' ? DRINKS : DRINKS.filter(d => d.cat === selectedCat);
      return (
        <div className="px-5 pb-4">
          <Header title="Cardápio" back="invite-friends" right={
            <button onClick={() => onNavigate('tab-live')} className="relative p-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">{tabItems.length}</span>
            </button>
          } />
          {/* Happy Hour banner inline */}
          {isHappyHour && (
            <div className="p-2.5 rounded-xl bg-warning/10 border border-warning/20 mb-3 flex items-center justify-between">
              <span className="text-xs text-warning font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Happy Hour — até 30% off</span>
              <span className="text-[10px] text-warning">{hhMinutes} min</span>
            </div>
          )}
          {/* Cover credit */}
          <div className="p-2 rounded-xl bg-success/5 border border-success/20 mb-3 flex items-center justify-between">
            <span className="text-[10px] text-success flex items-center gap-1"><CircleDollarSign className="w-3 h-3" /> Crédito cover</span>
            <span className="text-xs font-bold text-success">R$ {coverCredit}</span>
          </div>
          <div className="flex gap-2 mb-3">
            {cats.map(cat => (
              <button key={cat} onClick={() => setSelectedCat(cat)} className={`px-3 py-1.5 rounded-full text-[10px] font-medium ${selectedCat === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map(drink => (
              <button key={drink.id} onClick={() => { setSelectedDrink(drink); onNavigate('drink-detail'); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                <FoodImg id={drink.imgId} size="md" alt={drink.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm">{drink.name}</p>
                    {drink.isNew && <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-bold">NOVO</span>}
                    {drink.trending && <span className="px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-[8px] font-bold flex items-center gap-0.5"><TrendingUp className="w-2 h-2" />Top</span>}
                  </div>
                  {drink.abv && <p className="text-[10px] text-muted-foreground">{drink.style} · ABV {drink.abv}%{drink.ibu ? ` · IBU ${drink.ibu}` : ''}</p>}
                  {!drink.abv && <p className="text-[10px] text-muted-foreground">{drink.desc}</p>}
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
          <div className="flex gap-2 mt-4">
            <button onClick={() => onNavigate('call-waiter')} className="flex-1 py-3.5 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5">
              <Bell className="w-4 h-4" /> Garçom
            </button>
            <button onClick={() => onNavigate('round-builder')} className="flex-1 py-3.5 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-1.5">
              <Beer className="w-4 h-4" /> Rodada
            </button>
          </div>
        </div>
      );
    }

    case 'drink-detail': {
      const drink = selectedDrink || DRINKS[0];
      return (
        <div className="px-5 pb-4">
          <Header title={drink.name} back="menu" />
          <div className="text-center mb-4">
            <FoodImg id={drink.imgId} size="hero" alt={drink.name} className="mx-auto" />
            <h2 className="font-display text-lg font-bold mt-3">{drink.name}</h2>
            {drink.style && <p className="text-xs text-primary font-medium">{drink.style}</p>}
            <p className="text-sm text-muted-foreground mt-1">{drink.desc}</p>
          </div>
          {drink.abv && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-3 rounded-xl bg-muted/30 text-center"><p className="text-sm font-bold">{drink.abv}%</p><p className="text-[9px] text-muted-foreground">ABV</p></div>
              {drink.ibu && <div className="p-3 rounded-xl bg-muted/30 text-center"><p className="text-sm font-bold">{drink.ibu}</p><p className="text-[9px] text-muted-foreground">IBU</p></div>}
              <div className="p-3 rounded-xl bg-muted/30 text-center"><p className="text-sm font-bold">300ml</p><p className="text-[9px] text-muted-foreground">Copo</p></div>
            </div>
          )}
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-center justify-between">
              {isHappyHour && drink.priceHH < drink.price ? (
                <div className="flex items-center gap-2">
                  <span className="line-through text-muted-foreground">R$ {drink.price}</span>
                  <span className="font-display text-xl font-bold text-warning">R$ {drink.priceHH}</span>
                </div>
              ) : (
                <span className="font-display text-xl font-bold">R$ {drink.price}</span>
              )}
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
          <button onClick={() => { setTabItems(prev => [...prev, { drinkId: drink.id, who: 'Você', time: '20:15' }]); onNavigate('order-status'); }} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Pedir · R$ {getPrice(drink)}
          </button>
        </div>
      );
    }

    case 'order-status':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-1">Pedido Enviado!</h2>
          <p className="text-sm text-muted-foreground mb-1">O barman já está preparando</p>
          {/* Status pipeline */}
          <div className="w-full flex items-center justify-center gap-3 my-4">
            {['Recebido', 'Preparando', 'Pronto'].map((st, i) => (
              <React.Fragment key={st}>
                {i > 0 && <div className={`h-0.5 w-6 ${i <= 1 ? 'bg-primary' : 'bg-muted'}`} />}
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {i === 0 ? <Check className="w-4 h-4" /> : i === 1 ? <Timer className="w-4 h-4 animate-pulse" /> : <Beer className="w-4 h-4" />}
                  </div>
                  <span className={`text-[9px] font-medium ${i <= 1 ? 'text-primary' : 'text-muted-foreground'}`}>{st}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1"><Timer className="w-3 h-3" /> ~3-5 min</p>
          <div className="w-full p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Tab acumulado</span>
              <span className="font-bold text-primary">R$ {tabTotal}</span>
            </div>
            {hhSavings > 0 && <div className="flex items-center justify-between text-xs"><span className="text-warning">Economia HH</span><span className="text-warning">-R$ {hhSavings}</span></div>}
          </div>
          <div className="flex gap-2 w-full">
            <button onClick={() => onNavigate('menu')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm">Pedir Mais</button>
            <button onClick={() => onNavigate('call-waiter')} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <Bell className="w-4 h-4" /> Garçom
            </button>
          </div>
        </div>
      );

    /* ═══ STAGE 6: CONTINUOUS CONSUMPTION ═══ */
    case 'call-waiter':
      return (
        <div className="px-5 pb-4">
          <Header title="Chamar Garçom" back="menu" />
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold">Precisa de ajuda?</h2>
            <p className="text-sm text-muted-foreground">O garçom recebe uma notificação instantânea</p>
          </div>
          <GuidedHint text="Para pedir ou pagar, use o app — chamar garçom é para assistência" />
          <div className="space-y-2 mb-4">
            {[
              { reason: 'Dúvida sobre o cardápio', desc: 'Quero saber mais sobre um chopp ou drink', icon: MessageCircle },
              { reason: 'Preciso de copos/guardanapos', desc: 'Materiais na mesa', icon: Utensils },
              { reason: 'Pedido especial', desc: 'Algo que não está no cardápio', icon: Sparkles },
              { reason: 'Problema na mesa', desc: 'Mesa suja, cadeira quebrada, etc.', icon: AlertTriangle },
            ].map((opt, i) => (
              <button key={i} onClick={() => setWaiterReason(opt.reason)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left ${waiterReason === opt.reason ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${waiterReason === opt.reason ? 'bg-primary/10' : 'bg-muted/50'}`}>
                  <opt.icon className={`w-5 h-5 ${waiterReason === opt.reason ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div><p className="text-sm font-semibold">{opt.reason}</p><p className="text-[10px] text-muted-foreground">{opt.desc}</p></div>
              </button>
            ))}
          </div>
          <button onClick={() => onNavigate('round-builder')} className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${waiterReason ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground'}`}>
            <Bell className="w-5 h-5" /> Chamar Garçom · Mesa 7
          </button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">Tempo médio: ~2 min</p>
        </div>
      );

    case 'round-builder':
      return (
        <div className="px-5 pb-4">
          <Header title="Rodada" back="menu" />
          <GuidedHint text="Cada amigo escolhe seu drink — envia tudo ao bar de uma vez" />
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
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap border ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                        <FoodImg id={d.imgId} size="xs" alt={d.name} />
                        {d.name.split(' ')[0]}
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
                {isHappyHour && <span className="text-warning ml-1">(preço HH)</span>}
              </p>
            </div>
          )}
          <button onClick={() => onNavigate('round-sent')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Beer className="w-5 h-5" /> Enviar Rodada ({roundDrinks.length})
          </button>
        </div>
      );

    case 'round-sent':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <RefreshCw className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-1">Rodada Enviada!</h2>
          <p className="text-sm text-muted-foreground mb-4">O barman está preparando {roundDrinks.length || 3} drinks</p>
          <div className="w-full p-4 rounded-xl bg-card border border-border mb-4 space-y-2">
            {(roundDrinks.length > 0 ? roundDrinks : [
              { drinkId: 'd1', who: 'Você' },
              { drinkId: 'd2', who: 'Lucas' },
              { drinkId: 'd5', who: 'Ana' },
            ]).map((item, i) => {
              const d = DRINKS.find(d => d.id === item.drinkId);
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-3 h-3 text-success" />
                  <span className="flex-1">{d?.name}</span>
                  <span className="text-xs text-muted-foreground">{item.who}</span>
                  <span className="font-semibold text-xs">R$ {d ? getPrice(d) : 0}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 w-full">
            <button onClick={() => onNavigate('menu')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm">Pedir Mais</button>
            <button onClick={() => onNavigate('tab-live')} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">Ver Conta</button>
          </div>
        </div>
      );

    /* ═══ STAGE 7: THE BILL (LIVE TAB) ═══ */
    case 'tab-live':
      return (
        <div className="px-5 pb-4">
          <Header title="Conta ao Vivo" back="menu" right={
            <button onClick={() => onNavigate('call-waiter')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Bell className="w-4 h-4" /></button>
          } />
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div><span className="text-sm font-bold">Tab #TH-284</span><p className="text-[10px] text-muted-foreground">Mesa 7 · {tabItems.length} itens</p></div>
              <span className="font-display text-xl font-bold text-primary">R$ {tabTotal}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full mb-1">
              <div className={`h-full rounded-full transition-all ${tabTotal / tabLimit > 0.8 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${Math.min((tabTotal / tabLimit) * 100, 100)}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Limite: R$ {tabLimit}</span>
              <span>{Math.round((tabTotal / tabLimit) * 100)}%</span>
            </div>
          </div>
          {coverCredit > 0 && (
            <div className="p-2.5 rounded-xl bg-success/5 border border-success/20 mb-3 flex items-center justify-between">
              <span className="text-xs text-success flex items-center gap-1"><CircleDollarSign className="w-3 h-3" /> Crédito cover</span>
              <span className="text-xs font-bold text-success">R$ {coverCredit}</span>
            </div>
          )}
          {hhSavings > 0 && (
            <div className="p-2.5 rounded-xl bg-warning/5 border border-warning/20 mb-3 flex items-center justify-between">
              <span className="text-xs text-warning flex items-center gap-1"><Sparkles className="w-3 h-3" /> Economia Happy Hour</span>
              <span className="text-xs font-bold text-warning">-R$ {hhSavings}</span>
            </div>
          )}
          <h3 className="font-semibold text-sm mb-2">Por pessoa</h3>
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
                      return <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-[9px] text-muted-foreground">{d?.name.split(' ')[0]} · {item.time}</span>;
                    })}
                  </div>
                </div>
              );
            })}
            {tabItems.filter(t => t.who === 'Mesa').length > 0 && (
              <div className="p-3 rounded-xl border border-border bg-card flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><Users className="w-3.5 h-3.5" /></div>
                <span className="text-sm font-semibold flex-1">Mesa (dividir)</span>
                <span className="font-semibold text-sm">R$ {getPersonTotal('Mesa')}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 mb-3">
            <button onClick={() => onNavigate('menu')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1"><Plus className="w-4 h-4" /> Pedir</button>
            <button onClick={() => onNavigate('round-builder')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1"><RefreshCw className="w-4 h-4" /> Rodada</button>
          </div>
          <button onClick={() => onNavigate('split')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow">
            Fechar Conta
          </button>
        </div>
      );

    /* ═══ STAGE 8 & 9: SPLIT & PAYMENT ═══ */
    case 'split':
      return (
        <DemoSplitBill
          title="Dividir Conta"
          subtitle={`Noowe Tap House · Mesa 7`}
          total={`R$ ${Math.max(0, tabTotal - coverCredit)}`}
          people={FRIENDS.filter(f => f.status !== 'pending').map(f => ({
            id: f.id,
            name: f.name,
            color: f.color,
            initial: f.initial,
            amount: getPersonTotal(f.name),
          }))}
          modes={[
            { id: 'individual', name: 'Por Consumo', desc: 'Cada um paga o seu', icon: DollarSign },
            { id: 'equal', name: 'Igual', desc: `R$ ${Math.ceil((tabTotal - coverCredit) / 3)} cada`, icon: Users },
            { id: 'selective', name: 'Seletivo', desc: 'Escolher itens', icon: UtensilsCrossed },
          ]}
          summaryLines={[
            { label: 'Subtotal', value: `R$ ${tabTotal}` },
            ...(coverCredit > 0 ? [{ label: 'Crédito cover', value: `-R$ ${coverCredit}`, highlight: 'success' as const }] : []),
            ...(hhSavings > 0 ? [{ label: 'Economia HH', value: `-R$ ${hhSavings}`, highlight: 'warning' as const }] : []),
          ]}
          yourAmount={`R$ ${getPersonTotal('Você')}`}
          onBack={() => onNavigate('tab-live')}
          onProceed={() => onNavigate('payment')}
          ctaLabel="Pagar"
        />
      );

    case 'payment':
      return (
        <DemoPayment
          title="Pagamento"
          subtitle="Noowe Tap House · Mesa 7"
          total={`R$ ${getPersonTotal('Você')}`}
          items={[
            { label: 'Seu consumo', value: `R$ ${getPersonTotal('Você')}` },
            ...(coverCredit > 0 ? [{ label: 'Crédito cover aplicado', value: `-R$ ${coverCredit}`, highlight: 'success' as const }] : []),
          ]}
          infoBanner={{ icon: Check, text: 'Pré-autorização será liquidada', variant: 'success' }}
          fullMethodGrid={false}
          onBack={() => onNavigate('split')}
          onConfirm={() => onNavigate('post')}
          ctaLabel={`Confirmar · R$ ${getPersonTotal('Você')}`}
        />
      );

    /* ═══ STAGE 10: POST-EXPERIENCE ═══ */
    case 'post':
      return (
        <DemoPaymentSuccess
          heading="Conta Fechada!"
          subtitle="Noowe Tap House agradece"
          icon={Beer}
          gradientFrom="from-accent"
          gradientTo="to-accent/80"
          shadowColor="shadow-accent/30"
          summaryItems={[
            { label: 'Você consumiu', value: `R$ ${getPersonTotal('Você')}` },
            ...(coverCredit > 0 ? [{ label: 'Crédito cover', value: `-R$ ${coverCredit}`, highlight: 'success' as const }] : []),
            ...(hhSavings > 0 ? [{ label: 'Economia HH', value: `-R$ ${hhSavings}`, highlight: 'warning' as const }] : []),
            { label: 'Status', value: 'Todos pagaram', highlight: 'success' as const },
          ]}
          loyaltyReward={{ points: '+45 pontos ganhos!', description: 'Próximo chopp grátis em 3 visitas' }}
          badge={{ icon: Trophy, text: 'Selo "Bar Regular" conquistado!' }}
          secondaryAction={{ label: 'Voltar ao Início', onClick: () => onNavigate('discovery') }}
        />
      );

    default: return null;
  }
};
