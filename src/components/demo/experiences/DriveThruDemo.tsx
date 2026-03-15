/**
 * Drive-Thru Demo — NOOWE Drive
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint, ItemIcon } from '../DemoShared';
import { FoodImg } from '../FoodImages';
import {
  ArrowLeft, Check, Star, Clock, Plus, Minus, CreditCard, Gift,
  MapPin, Navigation, Car, ArrowRight, Loader2, Radio, Zap, Sparkles,
  ChefHat, Bell, AlertCircle, Search, Smartphone, Flame, ThumbsUp,
  UtensilsCrossed, Satellite, CircleParking,
} from 'lucide-react';

type Screen = 'home' | 'restaurant' | 'menu' | 'customize' | 'cart' | 'payment' | 'gps-tracking' | 'geofence' | 'lane-assign' | 'pickup' | 'done';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Pedir no caminho', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Montar pedido', screens: ['menu', 'customize', 'cart'] },
  { step: 3, label: 'Pagamento antecipado', screens: ['payment'] },
  { step: 4, label: 'GPS rastreia você', screens: ['gps-tracking'] },
  { step: 5, label: 'Geofencing (500m)', screens: ['geofence'] },
  { step: 6, label: 'Pista designada', screens: ['lane-assign'] },
  { step: 7, label: 'Retirada & avaliação', screens: ['pickup', 'done'] },
];

export const SCREEN_INFO: Record<Screen, { title: string; desc: string }> = {
  'home': { title: 'Descoberta', desc: 'Peça no caminho sem sair do carro.' },
  'restaurant': { title: 'NOOWE Drive', desc: 'Drive-thru inteligente com GPS.' },
  'menu': { title: 'Menu Drive', desc: 'Combos e individuais otimizados para levar.' },
  'customize': { title: 'Personalizar', desc: 'Customize ingredientes, extras e observações.' },
  'cart': { title: 'Carrinho', desc: 'Revise e confirme antes de pagar.' },
  'payment': { title: 'Pagamento', desc: 'Pague antecipado — retirada express.' },
  'gps-tracking': { title: 'GPS Ativo', desc: 'Rastreamento em tempo real da sua aproximação.' },
  'geofence': { title: 'Geofencing', desc: 'A 500m, a cozinha finaliza seu pedido.' },
  'lane-assign': { title: 'Pista Designada', desc: 'Siga para a pista indicada pelo app.' },
  'pickup': { title: 'Retirada', desc: 'Pedido pronto e pago — retire na janela.' },
  'done': { title: 'Concluído', desc: 'Entrega sem espera. Avalie a experiência.' },
};

const MENU_ITEMS = [
  { id: 'classic', name: 'Combo Classic', desc: 'Smash Burger 180g + Batata G + Refri 500ml', price: 42, cal: 980, popular: true, cat: 'Combos', iconCat: 'burger', imgId: 'burger' },
  { id: 'chicken', name: 'Combo Chicken', desc: 'Chicken Crispy + Batata G + Refri 500ml', price: 45, cal: 880, cat: 'Combos', iconCat: 'chicken', imgId: 'chicken-burger' },
  { id: 'double', name: 'Combo Double', desc: 'Double Smash 360g + Batata G + Refri 500ml', price: 52, cal: 1350, cat: 'Combos', iconCat: 'burger', imgId: 'burger-double' },
  { id: 'kids', name: 'Combo Kids', desc: 'Mini Burger + Batata P + Suco Box', price: 32, cal: 550, cat: 'Combos', iconCat: 'kids', imgId: 'nuggets' },
  { id: 'wrap', name: 'Wrap Grelhado', desc: 'Frango, alface, tomate, molho ranch', price: 28, cal: 420, cat: 'Individuais', iconCat: 'wrap', imgId: 'wrap' },
  { id: 'sundae', name: 'Sundae', desc: 'Chocolate, Morango ou Caramelo', price: 14, cal: 280, cat: 'Sobremesas', iconCat: 'icecream', imgId: 'sundae' },
  { id: 'coffee', name: 'Café Latte 400ml', desc: 'Espresso com leite cremoso', price: 12, cal: 150, cat: 'Bebidas', iconCat: 'coffee', imgId: 'latte' },
  { id: 'shake', name: 'Milkshake 500ml', desc: 'Ovomaltine, Chocolate ou Morango', price: 22, cal: 480, cat: 'Bebidas', iconCat: 'milkshake', imgId: 'milkshake' },
];

interface CartItem { id: string; qty: number; notes: string; }

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const DriveThruDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [cart, setCart] = useState<CartItem[]>([
    { id: 'classic', qty: 1, notes: 'Sem cebola, molho extra' },
    { id: 'sundae', qty: 1, notes: 'Chocolate' },
  ]);
  const [distance, setDistance] = useState(5.2);
  const [geoTriggered, setGeoTriggered] = useState(false);
  const [selectedItem, setSelectedItem] = useState('classic');

  const cartTotal = cart.reduce((s, c) => {
    const item = MENU_ITEMS.find(m => m.id === c.id);
    return s + (item ? item.price * c.qty : 0);
  }, 0);

  useEffect(() => {
    if (screen === 'gps-tracking') {
      setDistance(5.2);
      const t = setInterval(() => {
        setDistance(prev => {
          const next = prev - 0.3;
          if (next <= 0.5) { clearInterval(t); setTimeout(() => onNavigate('geofence'), 600); return 0.5; }
          return Math.round(next * 10) / 10;
        });
      }, 350);
      return () => clearInterval(t);
    }
  }, [screen]);

  useEffect(() => {
    if (screen === 'geofence' && !geoTriggered) {
      setGeoTriggered(true);
      setTimeout(() => onNavigate('lane-assign'), 3000);
    }
  }, [screen]);

  const Header: React.FC<{ title: string; back: Screen }> = ({ title, back }) => (
    <div className="px-5 flex items-center justify-between py-4">
      <button onClick={() => onNavigate(back)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
      <h1 className="font-display font-bold text-sm">{title}</h1>
      <div className="w-8" />
    </div>
  );

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">No caminho?</p>
            <h1 className="font-display text-xl font-bold">Peça no caminho</h1>
          </div>
          <GuidedHint text="Peça pelo app, pague antecipado, retire sem esperar" />
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <ItemIcon cat="drive" size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">NOOWE Drive</h3>
                    <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[9px] font-bold">Aberto</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Drive-Thru · 5.2km · GPS ativo</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Navigation className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary font-semibold">Preparo por GPS — 0 espera</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
          {/* How it works mini */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { step: '1', label: 'Peça', icon: Smartphone },
              { step: '2', label: 'Pague', icon: CreditCard },
              { step: '3', label: 'Dirija', icon: Car },
              { step: '4', label: 'Retire', icon: Check },
            ].map(s => (
              <div key={s.step} className="p-2 rounded-xl bg-muted/30 text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto" />
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'restaurant':
      return (
        <div className="px-5 pb-4">
          <Header title="NOOWE Drive" back="home" />
          <div className="text-center mb-4">
            <ItemIcon cat="drive" size="hero" className="mx-auto" />
            <h2 className="font-display text-xl font-bold mt-2">Drive-Thru Inteligente</h2>
            <p className="text-sm text-muted-foreground">Peça agora. Pague antes. Retire sem espera.</p>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
            <p className="text-sm font-semibold text-primary mb-2">Como funciona?</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">1</span>Monte seu pedido pelo app</p>
              <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">2</span>Pague antecipado — sem cartão na janela</p>
              <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">3</span>O GPS detecta quando você se aproxima</p>
              <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">4</span>Cozinha finaliza na hora certa — fresquinho</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Tempo médio', value: '1:48', sub: 'na janela' },
              { label: 'Pedidos hoje', value: '234', sub: 'já servidos' },
              { label: 'Satisfação', value: '98%', sub: '5 estrelas' },
            ].map((s, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-muted/30 text-center">
                <p className="font-bold text-sm">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('menu')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <Car className="w-5 h-5" />Ver Menu Drive
          </button>
        </div>
      );

    case 'menu':
      return (
        <div className="px-5 pb-4">
          <Header title="Menu Drive" back="restaurant" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
            {['Combos', 'Individuais', 'Sobremesas', 'Bebidas'].map((cat, i) => (
              <button key={cat} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
            ))}
          </div>
          <div className="space-y-2">
            {MENU_ITEMS.map(item => (
              <button key={item.id} onClick={() => { setSelectedItem(item.id); onNavigate('customize'); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                <FoodImg id={item.imgId} size="md" alt={item.name} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{item.name}</p>
                    {item.popular && <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">#1</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{item.cal} kcal</p>
                </div>
                <span className="font-display font-bold text-sm">R$ {item.price}</span>
              </button>
            ))}
          </div>
          {cart.length > 0 && (
            <button onClick={() => onNavigate('cart')} className="w-full mt-4 py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 shadow-glow">
              Ver Carrinho ({cart.reduce((s,c)=>s+c.qty,0)} itens) · R$ {cartTotal}
            </button>
          )}
        </div>
      );

    case 'customize':
      const customItem = MENU_ITEMS.find(m => m.id === selectedItem)!;
      return (
        <div className="px-5 pb-4">
          <Header title="Personalizar" back="menu" />
          <div className="text-center mb-4">
            <FoodImg id={customItem.imgId} size="hero" alt={customItem.name} className="mx-auto" />
            <h2 className="font-display text-lg font-bold mt-2">{customItem.name}</h2>
            <p className="text-xs text-muted-foreground">{customItem.desc}</p>
          </div>
          <h3 className="text-xs font-semibold mb-2">Remover ingredientes</h3>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['Cebola', 'Pickle', 'Mostarda', 'Ketchup', 'Alface'].map((ing, i) => (
              <button key={ing} className={`px-3 py-1.5 rounded-full text-xs border ${i === 0 ? 'border-destructive/30 bg-destructive/10 text-destructive line-through' : 'border-border text-muted-foreground'}`}>{ing}</button>
            ))}
          </div>
          <h3 className="text-xs font-semibold mb-2">Extras (+)</h3>
          {[
            { name: 'Bacon Extra', price: 6, icon: Flame },
            { name: 'Queijo Extra', price: 4, icon: UtensilsCrossed },
            { name: 'Molho Especial', price: 3, icon: Zap },
          ].map((extra, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border mb-1.5 ${i === 2 ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <extra.icon className={`w-4 h-4 ${i === 2 ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="flex-1 text-sm">{extra.name}</span>
              <span className="text-xs text-primary font-semibold">+R$ {extra.price}</span>
              {i === 2 && <Check className="w-4 h-4 text-primary" />}
            </div>
          ))}
          <h3 className="text-xs font-semibold mt-3 mb-2">Observações</h3>
          <div className="p-3 rounded-xl bg-muted/30 border border-border mb-4">
            <p className="text-xs text-muted-foreground italic">Sem cebola, molho extra por favor</p>
          </div>
          <button onClick={() => onNavigate('cart')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2">
            Adicionar ao Carrinho · R$ {customItem.price + 3}
          </button>
        </div>
      );

    case 'cart':
      return (
        <div className="px-5 pb-4">
          <Header title="Seu Pedido" back="menu" />
          <div className="space-y-2 mb-4">
            {cart.map(c => {
              const item = MENU_ITEMS.find(m => m.id === c.id)!;
              return (
                <div key={c.id} className="p-3 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <FoodImg id={item.imgId} size="sm" alt={item.name} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      {c.notes && <p className="text-[10px] text-primary flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> {c.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-bold w-3 text-center">{c.qty}</span>
                      <button className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="flex justify-end mt-1"><span className="font-bold text-sm">R$ {item.price * c.qty}</span></div>
                </div>
              );
            })}
          </div>
          <button onClick={() => onNavigate('menu')} className="w-full py-2.5 border border-dashed border-border rounded-xl text-sm text-muted-foreground flex items-center justify-center gap-2 mb-4">
            <Plus className="w-4 h-4" />Adicionar mais itens
          </button>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between font-display font-bold text-lg"><span>Total</span><span className="text-primary">R$ {cartTotal}</span></div>
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-medium">GPS ativado — preparo sincronizado com sua chegada</span>
          </div>
          <button onClick={() => onNavigate('payment')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Pagar Antecipado
          </button>
        </div>
      );

    case 'payment':
      return (
        <div className="px-5 pb-4">
          <Header title="Pagamento" back="cart" />
          <div className="p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1"><p className="text-sm font-medium">•••• 4242</p><p className="text-xs text-muted-foreground">Visa · Crédito · Apple Pay</p></div>
              <Check className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Subtotal</span><span>R$ {cartTotal}</span></div>
            <div className="flex justify-between text-sm mb-1 text-success"><span>Pontos NOOWE</span><span>-R$ 5,00</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
              <span>Total</span><span className="text-primary">R$ {cartTotal - 5}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-success/10 border border-success/20 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-success" />
            <span className="text-xs text-success font-medium">Pré-pagamento = retirada express (sem parar no caixa)</span>
          </div>
          <button onClick={() => { setDistance(5.2); setGeoTriggered(false); onNavigate('gps-tracking'); }} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Confirmar R$ {cartTotal - 5}
          </button>
        </div>
      );

    case 'gps-tracking':
      const milestones = [
        { dist: 5, label: 'Pedido confirmado', icon: Check },
        { dist: 3, label: 'Cozinha alertada', icon: ChefHat },
        { dist: 1, label: 'Preparo iniciado', icon: Flame },
        { dist: 0.5, label: 'Geofencing ativado', icon: Satellite },
      ];
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-36 h-36 rounded-full bg-blue-500/10 border-4 border-blue-500/30 flex flex-col items-center justify-center mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary/15 animate-ping" />
            <Navigation className="w-7 h-7 text-primary mb-1" />
            <span className="font-display text-2xl font-bold text-primary">{distance}km</span>
            <span className="text-[10px] text-muted-foreground">até NOOWE Drive</span>
          </div>
          <h2 className="font-display text-lg font-bold mb-1">Dirigindo ao Drive</h2>
          <p className="text-xs text-muted-foreground mb-4">ETA: ~{Math.max(1, Math.round(distance * 2))} min</p>
          <div className="w-full space-y-1.5">
            {milestones.map((m, i) => {
              const done = distance <= m.dist;
              const Icon = m.icon;
              return (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${done ? 'bg-success/10 border border-success/20' : 'bg-muted/30 border border-transparent'}`}>
                  <Icon className={`w-5 h-5 ${done ? 'text-success' : 'text-muted-foreground'}`} />
                  <span className={`text-xs ${done ? 'text-success font-semibold' : 'text-muted-foreground'}`}>{m.dist === 0.5 ? '500m' : `${m.dist}km`} — {m.label}</span>
                  {done && <Check className="w-3.5 h-3.5 text-success ml-auto" />}
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'geofence':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-warning/10 flex items-center justify-center mb-4 animate-pulse">
            <Radio className="w-12 h-12 text-warning" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Geofencing Ativado!</h2>
          <p className="text-sm text-muted-foreground mb-2">Você está a 500m do NOOWE Drive</p>
          <p className="text-xs text-primary font-semibold mb-3 flex items-center gap-1"><ChefHat className="w-3.5 h-3.5" /> Cozinha finalizando seu pedido...</p>
          <div className="w-full p-3 rounded-xl bg-muted/30 mb-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> Pedido ficará pronto em ~1:30</p>
          </div>
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      );

    case 'lane-assign':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Car className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Siga para a Pista 2</h2>
          <p className="text-sm text-muted-foreground mb-4">Seu pedido está pronto!</p>
          {/* Visual lane indicator */}
          <div className="w-full grid grid-cols-3 gap-2 mb-5">
            {[1, 2, 3].map(lane => (
              <div key={lane} className={`p-4 rounded-xl border-2 text-center ${lane === 2 ? 'border-primary bg-primary/10 animate-pulse' : 'border-border bg-muted/30'}`}>
                <p className={`font-display text-2xl font-bold ${lane === 2 ? 'text-primary' : 'text-muted-foreground'}`}>{lane}</p>
                <p className="text-[9px] text-muted-foreground">{lane === 2 ? 'Sua pista' : lane === 1 ? 'Ocupada' : 'Livre'}</p>
              </div>
            ))}
          </div>
          <div className="w-full p-4 rounded-2xl bg-card border border-border mb-4">
            <p className="text-xs text-muted-foreground">Código de retirada</p>
            <p className="font-display text-4xl font-bold tracking-widest text-success mt-1">ND-056</p>
          </div>
          <button onClick={() => onNavigate('pickup')} className="w-full py-4 bg-success text-primary-foreground rounded-xl font-semibold">
            Confirmar Retirada
          </button>
        </div>
      );

    case 'pickup':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-5 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2 flex items-center gap-2">Boa viagem! <Car className="w-6 h-6 text-primary" /></h2>
          <p className="text-sm text-muted-foreground mb-1">Pedido entregue em <strong>1min 48s</strong></p>
          <p className="text-xs text-primary font-semibold mb-4">Sem sair do carro. Sem esperar. Sem fila.</p>
          <div className="w-full p-3 rounded-xl bg-primary/5 border border-primary/20 mb-3 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">+{Math.round(cartTotal / 5)} pontos ganhos!</p><p className="text-xs text-muted-foreground">Stamp #12 — próximo combo grátis!</p></div>
          </div>
          <div className="w-full flex items-center justify-center gap-2 mb-4">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-7 h-7 ${i <= 5 ? 'text-accent fill-accent' : 'text-muted'}`} />
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['Rápido', 'Quentinho', 'Correto', 'Atendimento'].map(tag => (
              <button key={tag} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{tag}</button>
            ))}
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default: return null;
  }
};
