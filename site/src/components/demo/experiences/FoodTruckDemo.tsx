/**
 * Food Truck Demo — Taco Noowe
 */
import React, { useState, useEffect } from 'react';
import { useDemoContext } from '@/contexts/DemoContext';
import { GuidedHint, ItemIcon } from '../DemoShared';
import { FoodImg } from '../FoodImages';
import DemoPayment from '../DemoPayment';
import DemoPaymentSuccess from '../DemoPaymentSuccess';
import {
  AuthLoginScreen, AuthRegisterScreen, OnboardingScreen,
  WalletScreen, DigitalReceiptScreen, SupportScreen, ProfileScreen,
} from '../ClientExtendedScreens';
import {
  ArrowLeft, Check, Star, Clock, Plus, Minus, CreditCard, Gift,
  MapPin, Navigation, Timer, ArrowRight, Loader2, Bell, Map, Sparkles,
  Calendar, Heart, Users, Zap, ChefHat, AlertCircle, Flame,
  ShoppingBag, Smartphone, UtensilsCrossed, Footprints, ClipboardList,
} from 'lucide-react';

type Screen = 'home' | 'map' | 'truck-detail' | 'schedule' | 'queue' | 'menu' | 'item-detail' | 'cart' | 'payment' | 'waiting' | 'ready' | 'rating'
  | 'auth-login' | 'auth-register' | 'onboarding' | 'wallet' | 'digital-receipt' | 'support' | 'profile';

export const JOURNEY_STEPS = [
  { step: 0, label: 'Entrar / Cadastrar', screens: ['auth-login', 'auth-register', 'onboarding'] },
  { step: 1, label: 'Descobrir no mapa', screens: ['home', 'map'] },
  { step: 2, label: 'Ver food truck', screens: ['truck-detail', 'schedule'] },
  { step: 3, label: 'Fila virtual', screens: ['queue'] },
  { step: 4, label: 'Montar pedido', screens: ['menu', 'item-detail', 'cart'] },
  { step: 5, label: 'Pagamento', screens: ['payment'] },
  { step: 6, label: 'Preparo ao vivo', screens: ['waiting'] },
  { step: 7, label: 'Retirada & avaliação', screens: ['ready', 'rating'] },
  { step: 8, label: 'Recibo digital', screens: ['digital-receipt'] },
  { step: 9, label: 'Carteira & perfil', screens: ['wallet', 'profile'] },
  { step: 10, label: 'Ajuda & Suporte', screens: ['support'] },
];

export const SCREEN_INFO: Record<Screen, { title: string; desc: string }> = {
  'home': { title: 'Descoberta', desc: 'Food trucks com localização em tempo real.' },
  'map': { title: 'Mapa ao Vivo', desc: 'GPS em tempo real mostra onde cada truck está.' },
  'truck-detail': { title: 'Taco Noowe', desc: 'Food truck mexicano com fila virtual.' },
  'schedule': { title: 'Agenda', desc: 'Saiba onde o truck estará nos próximos dias.' },
  'queue': { title: 'Fila Virtual', desc: 'Entre na fila pelo app e espere onde quiser.' },
  'menu': { title: 'Cardápio', desc: 'Menu do dia com itens sazonais.' },
  'item-detail': { title: 'Detalhes', desc: 'Personalize seu taco com extras.' },
  'cart': { title: 'Carrinho', desc: 'Revise antes de confirmar.' },
  'payment': { title: 'Pagamento', desc: 'Pague antecipado para agilizar.' },
  'waiting': { title: 'Preparando', desc: 'Acompanhe o preparo em tempo real.' },
  'ready': { title: 'Pronto!', desc: 'Retire no truck com seu código.' },
  'rating': { title: 'Avaliação', desc: 'Avalie e ganhe stamps extras.' },
  'auth-login': { title: 'Login', desc: 'Acesse sua conta por e-mail, social login ou biometria.' },
  'auth-register': { title: 'Cadastro', desc: 'Cadastro rápido — nome, e-mail, celular e senha.' },
  'onboarding': { title: 'Onboarding', desc: 'Apresentação rápida das funcionalidades do app.' },
  'wallet': { title: 'Carteira Digital', desc: 'Saldo, cashback, métodos de pagamento, extrato e resgates.' },
  'digital-receipt': { title: 'Recibo Digital', desc: 'Recibo completo com NFC-e, exportação PDF e compartilhamento.' },
  'support': { title: 'Ajuda & Suporte', desc: 'FAQ, chat ao vivo, WhatsApp e histórico de chamados.' },
  'profile': { title: 'Meu Perfil', desc: 'Perfil com histórico, favoritos, nível de fidelidade e configurações.' },
};

const MENU = [
  { id: 't1', name: 'Taco al Pastor (3un)', price: 35, cal: 480, desc: 'Carne suína marinada, abacaxi, coentro', popular: true, cat: 'Tacos', imgId: 'taco' },
  { id: 't2', name: 'Taco de Carnitas (3un)', price: 38, cal: 520, desc: 'Carne desfiada, cebola roxa, limão', cat: 'Tacos', imgId: 'taco' },
  { id: 't3', name: 'Taco Vegetariano (3un)', price: 30, cal: 350, desc: 'Cogumelos, pimentão, guacamole', cat: 'Tacos', imgId: 'taco' },
  { id: 'b1', name: 'Burrito Carne Asada', price: 38, cal: 680, desc: 'Carne grelhada, arroz, feijão, queijo', cat: 'Burritos', imgId: 'burrito' },
  { id: 'q1', name: 'Quesadilla Frango', price: 28, cal: 450, desc: 'Frango, queijo derretido, jalapeño', cat: 'Quesadillas', imgId: 'quesadilla' },
  { id: 'n1', name: 'Nachos Supreme', price: 32, cal: 590, desc: 'Tortilla, carne, guacamole, sour cream', cat: 'Petiscos', imgId: 'nachos' },
  { id: 'c1', name: 'Churros (4un)', price: 18, cal: 320, desc: 'Com doce de leite e canela', cat: 'Sobremesas', imgId: 'churros' },
  { id: 'a1', name: 'Agua Fresca Hibisco', price: 12, cal: 80, desc: 'Hibisco com limão, sem açúcar', cat: 'Bebidas', imgId: 'hibiscus' },
  { id: 'a2', name: 'Agua Fresca Horchata', price: 12, cal: 120, desc: 'Arroz, canela e baunilha', cat: 'Bebidas', imgId: 'horchata' },
];

const MENU_CAT_MAP: Record<string, string> = {
  'Tacos': 'taco', 'Burritos': 'burrito', 'Quesadillas': 'cheese',
  'Petiscos': 'petiscos', 'Sobremesas': 'dessert', 'Bebidas': 'drink',
};

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const FoodTruckDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const { pushExternalOrder } = useDemoContext();
  const [queuePos, setQueuePos] = useState(5);
  const [prepProgress, setPrepProgress] = useState(0);

  useEffect(() => {
    if (screen === 'queue') {
      const t = setInterval(() => setQueuePos(prev => Math.max(1, prev - 1)), 3000);
      return () => clearInterval(t);
    }
  }, [screen]);

  useEffect(() => {
    if (screen === 'waiting') {
      setPrepProgress(0);
      const stages = [1, 2, 3];
      let i = 0;
      const t = setInterval(() => {
        i++;
        if (i > stages.length) { clearInterval(t); onNavigate('ready'); return; }
        setPrepProgress(stages[i-1]);
      }, 1500);
      return () => clearInterval(t);
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
            <p className="text-sm text-muted-foreground">Com fome?</p>
            <h1 className="font-display text-xl font-bold">Food Trucks ao vivo</h1>
          </div>
          <GuidedHint text="Localização em tempo real dos trucks por perto" />
          <button onClick={() => onNavigate('map')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow mb-4">
            <Map className="w-5 h-5" />Ver Mapa ao Vivo
          </button>
          {[
            { name: 'Taco Noowe', dist: '800m', cuisine: 'Mexicana', rating: 4.8, cat: 'taco', active: true, wait: '~12 min' },
            { name: 'Burger Bros', dist: '1.5km', cuisine: 'Burgers', rating: 4.5, cat: 'burger', wait: '~20 min' },
            { name: 'Açaí Tropical', dist: '2.1km', cuisine: 'Açaí & Bowls', rating: 4.3, cat: 'acai', wait: '~8 min' },
          ].map((truck, i) => (
            <button key={i} onClick={() => truck.active ? onNavigate('truck-detail') : undefined} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 mb-1.5 text-left border border-border bg-card">
              <ItemIcon cat={truck.cat} />
              <div className="flex-1">
                <p className="font-semibold text-sm">{truck.name}</p>
                <p className="text-xs text-muted-foreground">{truck.cuisine} · {truck.dist}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end"><Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-semibold">{truck.rating}</span></div>
                <p className="text-[9px] text-muted-foreground">{truck.wait}</p>
              </div>
            </button>
          ))}
        </div>
      );

    case 'map':
      return (
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 via-green-800/10 to-green-900/20 flex items-center justify-center">
            <div className="text-center opacity-30">
              <Map className="w-20 h-20 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Mapa interativo</p>
            </div>
          </div>
          <div className="absolute top-28 left-14 cursor-pointer" onClick={() => onNavigate('truck-detail')}>
            <div className="px-3 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-lg flex items-center gap-1.5">
              <UtensilsCrossed className="w-3 h-3" /> <span>800m</span>
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            </div>
            <div className="w-3 h-3 bg-primary rotate-45 -mt-1.5 ml-4" />
          </div>
          <div className="absolute top-52 right-10">
            <div className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1"><ItemIcon cat="burger" size="xs" /> 1.5km</div>
          </div>
          <div className="absolute bottom-44 left-20">
            <div className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1"><ItemIcon cat="acai" size="xs" /> 2.1km</div>
          </div>
          <div className="absolute bottom-48 right-16 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 border-4 border-blue-200 shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary-foreground" />
            </div>
            <span className="text-[9px] font-semibold text-foreground mt-1 bg-background/80 px-1.5 rounded">Você</span>
          </div>
          <div className="absolute top-2 left-4">
            <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center shadow"><ArrowLeft className="w-4 h-4" /></button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <button onClick={() => onNavigate('truck-detail')} className="w-full p-4 rounded-2xl bg-background/95 backdrop-blur border border-border shadow-lg flex items-center gap-3">
              <ItemIcon cat="taco" size="md" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Taco Noowe</p>
                <p className="text-xs text-muted-foreground">800m · 5 na fila · ~12 min</p>
              </div>
              <ArrowRight className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      );

    case 'truck-detail':
      return (
        <div className="px-5 pb-4">
          <Header title="Taco Noowe" back="home" />
          <div className="text-center mb-4">
            <ItemIcon cat="taco" size="hero" className="mx-auto" />
            <h2 className="font-display text-xl font-bold mt-2">Taco Noowe</h2>
            <p className="text-sm text-muted-foreground">Tacos artesanais mexicanos autênticos</p>
            <div className="flex items-center justify-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" />4.8 (342)</span>
              <span className="flex items-center gap-1 text-success"><MapPin className="w-3 h-3" />800m</span>
            </div>
          </div>
          {/* Queue status */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 mb-3">
            <Timer className="w-4 h-4 text-warning" />
            <span className="text-xs text-warning font-semibold">{queuePos} na fila · ~12 min de espera</span>
          </div>
          {/* Schedule preview */}
          <button onClick={() => onNavigate('schedule')} className="w-full p-3 rounded-xl bg-muted/30 mb-3 flex items-center gap-3 text-left">
            <Calendar className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-semibold">Agenda da semana</p>
              <p className="text-[10px] text-muted-foreground">Hoje: Parque Ibirapuera · Amanhã: Av. Paulista</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Tempo preparo', value: '8 min' },
              { label: 'Pedidos hoje', value: '127' },
              { label: 'Favorito', value: '#1 Taco' },
            ].map((s, i) => (
              <div key={i} className="p-2 rounded-xl bg-muted/30 text-center">
                <p className="font-bold text-xs">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <GuidedHint text="Entre na fila virtual e peça antecipado" />
          <button onClick={() => onNavigate('queue')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <Timer className="w-5 h-5" />Entrar na Fila Virtual
          </button>
        </div>
      );

    case 'schedule':
      return (
        <div className="px-5 pb-4">
          <Header title="Agenda Semanal" back="truck-detail" />
          <div className="space-y-2">
            {[
              { day: 'Hoje (Seg)', loc: 'Parque Ibirapuera', time: '11:00 - 20:00', active: true },
              { day: 'Ter', loc: 'Av. Paulista, 1000', time: '11:00 - 20:00' },
              { day: 'Qua', loc: 'Av. Paulista, 1000', time: '11:00 - 20:00' },
              { day: 'Qui', loc: 'Vila Madalena', time: '17:00 - 23:00' },
              { day: 'Sex', loc: 'Vila Madalena', time: '17:00 - 23:00' },
              { day: 'Sáb', loc: 'Pq. Villa-Lobos', time: '10:00 - 18:00' },
              { day: 'Dom', loc: 'Pq. Villa-Lobos', time: '10:00 - 18:00' },
            ].map((d, i) => (
              <div key={i} className={`p-3 rounded-xl border ${d.active ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold ${d.active ? 'text-primary' : ''}`}>{d.day}</p>
                  {d.active && <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[9px] font-bold">Aqui agora</span>}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{d.loc}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{d.time}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-medium">Ativar notificação de localização</span>
          </div>
        </div>
      );

    case 'queue':
      return (
        <div className="px-5 pb-4">
          <Header title="Fila Virtual" back="truck-detail" />
          <div className="text-center mb-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Timer className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold">Posição: {queuePos}º</h2>
            <p className="text-sm text-muted-foreground">Espera: ~{queuePos * 3} min</p>
          </div>
          <div className="flex items-center gap-1.5 justify-center mb-5">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                i < queuePos - 1 ? 'bg-muted text-muted-foreground' :
                i === queuePos - 1 ? 'bg-primary text-primary-foreground' :
                'bg-muted/30 text-muted-foreground/30'
              }`}>{i + 1}</div>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4">
            <p className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> Enquanto espera:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><ShoppingBag className="w-3 h-3 text-primary" /> Faça o pedido antecipado</p>
              <p className="flex items-center gap-1.5"><Footprints className="w-3 h-3 text-primary" /> Passeie — notificamos por push</p>
              <p className="flex items-center gap-1.5"><ClipboardList className="w-3 h-3 text-primary" /> Veja o cardápio completo</p>
            </div>
          </div>
          <GuidedHint text="Peça antecipado para agilizar quando for sua vez" />
          <button onClick={() => onNavigate('menu')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            Fazer Pedido Antecipado
          </button>
        </div>
      );

    case 'menu':
      return (
        <div className="px-5 pb-4">
          <Header title="Cardápio" back="queue" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
            {['Tacos', 'Burritos', 'Quesadillas', 'Petiscos', 'Sobremesas', 'Bebidas'].map((cat, i) => (
              <button key={cat} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
            ))}
          </div>
          <div className="space-y-2">
            {MENU.map(item => (
              <button key={item.id} onClick={() => onNavigate('cart')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                <FoodImg id={item.imgId} size="md" alt={item.name} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{item.name}</p>
                    {item.popular && <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">Popular</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{item.cal} kcal</p>
                </div>
                <div className="text-right">
                  <span className="font-display font-bold text-sm">R$ {item.price}</span>
                  <button className="mt-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center ml-auto"><Plus className="w-3 h-3" /></button>
                </div>
              </button>
            ))}
          </div>
        </div>
      );

    case 'cart':
      return (
        <div className="px-5 pb-4">
          <Header title="Seu Pedido" back="menu" />
          {[
            { item: MENU[0], qty: 1, notes: 'Extra coentro' },
            { item: MENU[7], qty: 1, notes: '' },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card mb-2">
              <FoodImg id={c.item.imgId} size="sm" alt={c.item.name} />
              <div className="flex-1">
                <p className="font-semibold text-sm">{c.item.name}</p>
                {c.notes && <p className="text-[10px] text-primary flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> {c.notes}</p>}
              </div>
              <div className="text-right">
                <span className="font-bold text-sm">R$ {c.item.price}</span>
                <div className="flex items-center gap-1.5 mt-1 justify-end">
                  <button className="w-5 h-5 rounded-full bg-muted flex items-center justify-center"><Minus className="w-2.5 h-2.5" /></button>
                  <span className="text-xs font-bold">{c.qty}</span>
                  <button className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-2.5 h-2.5" /></button>
                </div>
              </div>
            </div>
          ))}
          <div className="p-4 rounded-xl bg-muted/30 mt-3 mb-4">
            <div className="flex justify-between font-display font-bold text-lg"><span>Total</span><span className="text-primary">R$ 47</span></div>
          </div>
          <button onClick={() => onNavigate('payment')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Pagar R$ 47
          </button>
        </div>
      );

    case 'payment':
      return (
        <DemoPayment
          title="Pagamento"
          subtitle="Taco Noowe · Food Truck"
          total="R$ 47"
          items={[
            { label: 'Taco al Pastor (3un)', value: 'R$ 35' },
            { label: 'Agua Fresca Hibisco', value: 'R$ 12' },
          ]}
          infoBanner={{ icon: Zap, text: `Fila #${queuePos} · Pedido começa quando for sua vez`, variant: 'success' }}
          fullMethodGrid={true}
          onBack={() => onNavigate('cart')}
          onConfirm={() => {
            pushExternalOrder(MENU.map(m => ({ name: m.name, price: m.price, quantity: 1, prepTime: 10 })), MENU.reduce((s, m) => s + m.price, 0), 'Taco Noowe');
            onNavigate('waiting');
          }}
          ctaLabel="Confirmar Pagamento"
        />
      );

    case 'waiting':
      const prepStages = [
        { label: 'Sua vez na fila!', desc: 'Preparação iniciada', icon: Sparkles },
        { label: 'Grelhando proteína', desc: 'Carne al pastor na chapa', icon: Flame },
        { label: 'Montando tacos', desc: 'Tortilla + recheio + toppings', icon: UtensilsCrossed },
      ];
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
            {prepProgress < prepStages.length ? (
              (() => { const Icon = prepStages[prepProgress].icon; return <Icon className="w-10 h-10 text-primary" />; })()
            ) : (
              <Check className="w-10 h-10 text-success" />
            )}
          </div>
          <h2 className="font-display text-lg font-bold mb-1">
            {prepProgress < prepStages.length ? prepStages[prepProgress].label : 'Quase lá!'}
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            {prepProgress < prepStages.length ? prepStages[prepProgress].desc : 'Finalizando...'}
          </p>
          <div className="w-full space-y-2 mb-4">
            {prepStages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${i < prepProgress ? 'bg-success/10 border border-success/20' : i === prepProgress ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}>
                  <Icon className={`w-5 h-5 ${i <= prepProgress ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs ${i <= prepProgress ? 'font-semibold' : 'text-muted-foreground'}`}>{stage.label}</span>
                  {i < prepProgress && <Check className="w-3.5 h-3.5 text-success ml-auto" />}
                  {i === prepProgress && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin ml-auto" />}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Bell className="w-3 h-3 text-primary" /> Push notification quando estiver pronto</p>
        </div>
      );

    case 'ready':
      return (
        <DemoPaymentSuccess
          heading="Pedido Pronto!"
          subtitle="Retire no truck — Taco Noowe"
          summaryItems={[
            { label: 'Código de retirada', value: 'TN-023', highlight: 'success' },
          ]}
          loyaltyReward={{ points: '+10 pontos ganhos!', description: 'Stamp 4 de 8 — taco grátis em breve!' }}
          stats={[
            { label: 'Stamp 1', value: '✓' },
            { label: 'Stamp 2', value: '✓' },
            { label: 'Stamp 3', value: '✓' },
            { label: 'Stamp 4', value: '✓' },
          ]}
          primaryAction={{ label: 'Avaliar', onClick: () => onNavigate('rating'), icon: Star }}
        />
      );

    case 'rating':
      return (
        <div className="px-5 pb-4">
          <Header title="Como foi?" back="ready" />
          <div className="text-center mb-4">
            <ItemIcon cat="taco" size="xl" className="mx-auto" />
            <div className="flex items-center justify-center gap-2 mb-2 mt-3">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-7 h-7 ${i <= 5 ? 'text-accent fill-accent' : 'text-muted'}`} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-5 justify-center">
            {['Autêntico', 'Porção boa', 'Rápido', 'Sabor incrível', 'Voltaria!'].map(tag => (
              <button key={tag} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/20">{tag}</button>
            ))}
          </div>
          <button onClick={() => onNavigate('digital-receipt')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow">Enviar Avaliação</button>
          <button onClick={() => onNavigate('wallet')} className="w-full mt-2 py-3 text-sm text-muted-foreground">Ver Carteira</button>
        </div>
      );

    case 'auth-login': return <AuthLoginScreen onNavigate={onNavigate} />;
    case 'auth-register': return <AuthRegisterScreen onNavigate={onNavigate} />;
    case 'onboarding': return <OnboardingScreen onNavigate={onNavigate} />;
    case 'wallet': return <WalletScreen onNavigate={onNavigate} />;
    case 'digital-receipt': return <DigitalReceiptScreen onNavigate={onNavigate} />;
    case 'support': return <SupportScreen onNavigate={onNavigate} />;
    case 'profile': return <ProfileScreen onNavigate={onNavigate} />;
    default: return null;
  }
};
