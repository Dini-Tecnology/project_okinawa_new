/**
 * Café & Bakery Demo — Café Noowe
 * Deep journey: Discover → QR Scan → Work Mode → Coffee Customization → Comanda Live → Refill → Payment → Loyalty
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint, ItemIcon } from '../DemoShared';
import { FoodImg } from '../FoodImages';
import {
  ArrowLeft, Check, Star, Clock, Plus, Minus, CreditCard,
  Wifi, Battery, Plug, Volume2, Coffee, Gift, QrCode, RefreshCw,
  Search, MapPin, Laptop, ArrowRight, Bell, Heart, Timer,
  Loader2, ChevronRight, Award, Nfc, Smartphone, Wallet,
  Zap, X, ChevronDown, Users, Sparkles,
} from 'lucide-react';

type Screen = 'home' | 'restaurant' | 'qr-scan' | 'work-mode' | 'menu' | 'customize' | 'comanda' | 'payment' | 'payment-success';

interface CartItem {
  id: string;
  name: string;
  price: number;
  iconCat: string;
  imgId: string;
  customizations?: string[];
  isRefill?: boolean;
}

const CAFE_MENU = [
  { id: 'c1', name: 'Espresso', price: 8, cat: 'Cafés', iconCat: 'coffee', imgId: 'espresso', refill: false, desc: 'Espresso duplo, grãos torrados na casa' },
  { id: 'c2', name: 'Cappuccino', price: 16, cat: 'Cafés', iconCat: 'coffee', imgId: 'cappuccino', refill: false, desc: 'Espresso, leite vaporizado e espuma cremosa' },
  { id: 'c3', name: 'Café Filtrado', price: 10, cat: 'Cafés', iconCat: 'coffee', imgId: 'filter-coffee', refill: true, desc: 'Coado na hora, blend da casa. Refil R$ 5', customizable: true },
  { id: 'c4', name: 'Latte', price: 18, cat: 'Cafés', iconCat: 'coffee', imgId: 'latte', refill: false, desc: 'Espresso com leite cremoso, opção de flavors', customizable: true },
  { id: 'c5', name: 'Cold Brew', price: 16, cat: 'Cafés', iconCat: 'coffee', imgId: 'cold-brew', refill: false, desc: 'Café extraído a frio por 24h, suave e refrescante' },
  { id: 'c6', name: 'Chá Verde', price: 12, cat: 'Chás', iconCat: 'tea', imgId: 'green-tea', refill: true, desc: 'Chá verde premium. Refil R$ 5' },
  { id: 'c7', name: 'Chá de Camomila', price: 12, cat: 'Chás', iconCat: 'tea', imgId: 'chamomile', refill: true, desc: 'Camomila orgânica. Refil R$ 5' },
  { id: 'c8', name: 'Matcha Latte', price: 20, cat: 'Chás', iconCat: 'tea', imgId: 'matcha', refill: false, desc: 'Matcha japonês com leite de aveia', customizable: true },
  { id: 'c9', name: 'Croissant Misto', price: 14, cat: 'Salgados', iconCat: 'bread', imgId: 'croissant', refill: false, desc: 'Croissant artesanal com queijo e presunto' },
  { id: 'c10', name: 'Pão de Queijo (6un)', price: 12, cat: 'Salgados', iconCat: 'cheese', imgId: 'pao-queijo', refill: false, desc: 'Pão de queijo mineiro quentinho' },
  { id: 'c11', name: 'Sanduíche Caprese', price: 22, cat: 'Salgados', iconCat: 'sandwich', imgId: 'sandwich-caprese', refill: false, desc: 'Mussarela de búfala, tomate, manjericão, pesto' },
  { id: 'c12', name: 'Torta de Maçã', price: 16, cat: 'Doces', iconCat: 'dessert', imgId: 'apple-pie', refill: false, desc: 'Torta caseira com canela e sorvete' },
  { id: 'c13', name: 'Brownie', price: 14, cat: 'Doces', iconCat: 'brownie', imgId: 'brownie', refill: false, desc: 'Brownie de chocolate 70% com nozes' },
  { id: 'c14', name: 'Cookie & Cream', price: 12, cat: 'Doces', iconCat: 'cookie', imgId: 'cookie', refill: false, desc: 'Cookie artesanal com sorvete de baunilha' },
];

const MILK_OPTIONS = ['Integral', 'Desnatado', 'Aveia', 'Amêndoas', 'Coco'];
const SIZE_OPTIONS = [
  { id: 'P', name: 'Pequeno', ml: '200ml', priceAdd: 0 },
  { id: 'M', name: 'Médio', ml: '350ml', priceAdd: 4 },
  { id: 'G', name: 'Grande', ml: '500ml', priceAdd: 8 },
];
const FLAVOR_OPTIONS = ['Baunilha', 'Caramelo', 'Avelã', 'Canela'];
const TEMP_OPTIONS = ['Quente', 'Morno', 'Gelado'];

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir café', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Escanear QR da mesa', screens: ['qr-scan'] },
  { step: 3, label: 'Modo trabalho', screens: ['work-mode'] },
  { step: 4, label: 'Cardápio & personalização', screens: ['menu', 'customize'] },
  { step: 5, label: 'Comanda & refil', screens: ['comanda'] },
  { step: 6, label: 'Pagamento', screens: ['payment', 'payment-success'] },
];

export const SCREEN_INFO: Record<string, { title: string; desc: string }> = {
  'home': { title: 'Descoberta', desc: 'Encontre cafeterias por Wi-Fi, tomadas, nível de ruído e pet friendly.' },
  'restaurant': { title: 'Café Noowe', desc: 'Cafeteria work-friendly com Wi-Fi 150Mbps, tomadas em todas as mesas e personalização completa de bebidas.' },
  'qr-scan': { title: 'QR da Mesa', desc: 'Escaneie o QR Code da mesa e peça sem sair do lugar. Identifica automaticamente tomadas disponíveis.' },
  'work-mode': { title: 'Modo Trabalho', desc: 'Dashboard com Wi-Fi (senha copiável), velocidade, nível de ruído em tempo real, tomadas e timer de sessão.' },
  'menu': { title: 'Cardápio', desc: 'Cafés especiais, chás, salgados e doces. Itens com refil marcados. Personalização completa de bebidas.' },
  'customize': { title: 'Personalizar Bebida', desc: 'Leite (integral, aveia, amêndoas), tamanho (P/M/G), temperatura, sabor extra e intensidade.' },
  'comanda': { title: 'Comanda', desc: 'Comanda aberta: adicione itens, peça refils e acompanhe o total sem sair da mesa.' },
  'payment': { title: 'Pagamento', desc: 'Pague quando quiser ir embora. PIX, cartão, Apple Pay ou carteira NOOWE.' },
  'payment-success': { title: 'Conta Fechada', desc: 'Pagamento confirmado com stamp card: a cada 10 cafés, o próximo é grátis.' },
};

interface Props { onNavigate: (s: string) => void; screen: string; }

export const CafeBakeryDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [scanned, setScanned] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<typeof CAFE_MENU[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState('Cafés');
  const [selectedMilk, setSelectedMilk] = useState('Integral');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [selectedTemp, setSelectedTemp] = useState('Quente');
  const [extraShot, setExtraShot] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('pix');
  const [sessionMinutes, setSessionMinutes] = useState(0);

  // Session timer
  useEffect(() => {
    if (screen === 'work-mode' || screen === 'menu' || screen === 'comanda' || screen === 'customize') {
      const t = setInterval(() => setSessionMinutes(prev => prev + 1), 30000);
      return () => clearInterval(t);
    }
  }, [screen]);

  const cartTotal = cart.reduce((s, c) => s + c.price, 0);
  const categories = [...new Set(CAFE_MENU.map(m => m.cat))];

  const addToCartDirect = (item: typeof CAFE_MENU[0]) => {
    setCart(prev => [...prev, { id: item.id + '-' + Date.now(), name: item.name, price: item.price, iconCat: item.iconCat }]);
  };

  const addCustomized = () => {
    if (!selectedItem) return;
    const size = SIZE_OPTIONS.find(s => s.id === selectedSize)!;
    const customs: string[] = [];
    if (selectedMilk !== 'Integral') customs.push(`Leite ${selectedMilk}`);
    customs.push(size.name);
    if (selectedTemp !== 'Quente') customs.push(selectedTemp);
    if (selectedFlavor) customs.push(`+ ${selectedFlavor}`);
    if (extraShot) customs.push('Shot extra');

    const totalPrice = selectedItem.price + size.priceAdd + (selectedFlavor ? 3 : 0) + (extraShot ? 4 : 0);
    setCart(prev => [...prev, { id: selectedItem.id + '-' + Date.now(), name: selectedItem.name, price: totalPrice, iconCat: selectedItem.iconCat, customizations: customs }]);
    onNavigate('comanda');
  };

  const addRefill = (originalItem: CartItem) => {
    setCart(prev => [...prev, { id: 'refill-' + Date.now(), name: `Refil ${originalItem.name}`, price: 5, iconCat: 'coffee', isRefill: true }]);
  };

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bom dia</p>
              <h1 className="font-display text-xl font-bold">Encontrar um café</h1>
            </div>
            <button className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <GuidedHint text="Encontre o café perfeito para trabalhar ou relaxar" />

          {/* Filters */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {['Wi-Fi Rápido', 'Tomadas', 'Silencioso', 'Pet Friendly', 'Ao Ar Livre'].map((cat, i) => (
              <button key={cat} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
            ))}
          </div>

          {/* Featured café */}
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-700/10 to-orange-800/10 border border-amber-700/20">
              <div className="flex items-center gap-3">
                <ItemIcon cat="coffee" size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">Café Noowe</h3>
                    <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-bold">Aberto</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Café & Padaria · R$$ · 200m</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-success" />150Mbps</span>
                    <span className="flex items-center gap-1"><Plug className="w-3 h-3 text-success" />Tomadas</span>
                    <span className="flex items-center gap-1"><Volume2 className="w-3 h-3 text-warning" />Moderado</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-semibold">4.7</span>
                    <span className="text-xs text-muted-foreground">(890)</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Laptop className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">Modo Trabalho disponível · Wi-Fi + Tomadas + Café refil</span>
              </div>
            </div>
          </button>

          {/* Other cafés */}
          <h3 className="font-display font-semibold text-sm mb-3">Mais opções</h3>
          {[
            { name: 'Padaria Artesanal', dist: '450m', wifi: true, rating: 4.4, cat: 'bakery' },
            { name: 'Chá & Companhia', dist: '900m', wifi: true, rating: 4.2, cat: 'tea' },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 mb-1">
              <ItemIcon cat={r.cat} />
              <div className="flex-1"><p className="font-semibold text-sm">{r.name}</p><p className="text-xs text-muted-foreground">{r.dist} {r.wifi ? '· Wi-Fi' : ''}</p></div>
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
            <h1 className="font-display font-bold">Café Noowe</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-4">
            <ItemIcon cat="coffee" size="hero" className="mx-auto" />
            <h2 className="font-display text-xl font-bold mt-2">Café Noowe</h2>
            <p className="text-sm text-muted-foreground">Seu espaço para trabalhar e saborear</p>
            <div className="flex items-center justify-center gap-3 mt-2 text-sm">
              <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-accent fill-accent" /><span className="font-semibold">4.7</span></div>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground text-xs">07:00 - 22:00</span>
            </div>
          </div>

          {/* Amenities grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: Wifi, label: 'Wi-Fi', value: '150Mbps', color: 'text-success' },
              { icon: Plug, label: 'Tomadas', value: 'Todas mesas', color: 'text-success' },
              { icon: Volume2, label: 'Ruído', value: 'Moderado', color: 'text-warning' },
            ].map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                <f.icon className={`w-5 h-5 mx-auto mb-1 ${f.color}`} />
                <p className="text-xs font-bold">{f.value}</p>
                <p className="text-[9px] text-muted-foreground">{f.label}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['Refil R$ 5', 'Pet Friendly', 'Estacionamento', 'Acessível', 'Opções veganas'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">{f}</span>
            ))}
          </div>

          {/* Occupancy */}
          <div className="p-3 rounded-xl bg-muted/30 mb-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Ocupação: 45%</p>
              <p className="text-xs text-muted-foreground">Mesas com tomada disponíveis</p>
            </div>
            <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-bold">Tranquilo</span>
          </div>

          <GuidedHint text="Escaneie o QR Code da mesa para pedir do seu lugar" />
          <button onClick={() => onNavigate('qr-scan')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <QrCode className="w-5 h-5" />Escanear QR da Mesa
          </button>
        </div>
      );

    case 'qr-scan':
      return (
        <div className="px-5 pb-4 flex flex-col items-center justify-center h-full text-center">
          {!scanned ? (
            <>
              <div className="w-48 h-48 rounded-3xl border-2 border-primary/30 flex items-center justify-center bg-foreground/5 mb-4 relative">
                <div className="absolute inset-4 border-2 border-primary rounded-2xl" />
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                <div className="absolute left-6 right-6 h-0.5 bg-primary animate-bounce" />
                <Coffee className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Aponte para o QR Code da mesa</p>
              <button onClick={() => setScanned(true)} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">Simular Scan</button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4"><Check className="w-8 h-8 text-success" /></div>
              <h2 className="font-display text-xl font-bold mb-2">Mesa 3 · Janela</h2>
              <p className="text-xs text-muted-foreground mb-1">Café Noowe</p>
              <div className="flex items-center gap-3 text-xs mb-5">
                <span className="flex items-center gap-1 text-success"><Plug className="w-3 h-3" />2 tomadas</span>
                <span className="flex items-center gap-1 text-success"><Wifi className="w-3 h-3" />Wi-Fi forte</span>
              </div>
              <div className="space-y-2 w-full">
                <button onClick={() => onNavigate('work-mode')} className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2"><Laptop className="w-4 h-4" />Ativar Modo Trabalho</button>
                <button onClick={() => onNavigate('menu')} className="w-full py-3.5 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2"><Coffee className="w-4 h-4" />Ir para Cardápio</button>
              </div>
            </>
          )}
        </div>
      );

    case 'work-mode':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('qr-scan')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold flex items-center gap-2"><Laptop className="w-4 h-4 text-primary" />Modo Trabalho</h1>
            <div className="w-8" />
          </div>

          {/* Session timer */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tempo de sessão</p>
            <p className="font-display text-3xl font-bold text-foreground">{Math.floor(sessionMinutes / 60)}h {sessionMinutes % 60}min</p>
            <p className="text-xs text-muted-foreground mt-1">Mesa 3 · Janela · Café Noowe</p>
          </div>

          {/* Wi-Fi card */}
          <div className="p-4 rounded-xl bg-card border border-border mb-3">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Wifi className="w-4 h-4 text-success" />Wi-Fi</h3>
            <div className="p-3 rounded-lg bg-muted/30 flex items-center justify-between mb-2">
              <div><p className="text-sm font-medium">CafeNoowe_Clientes</p><p className="text-xs text-muted-foreground">Senha: noowe2026</p></div>
              <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Copiar</button>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>↓ 150 Mbps</span><span>↑ 80 Mbps</span><span>Ping: 8ms</span>
            </div>
          </div>

          {/* Amenities status */}
          <div className="space-y-2 mb-4">
            {[
              { icon: Volume2, label: 'Nível de ruído', value: 'Moderado — bom para trabalho focado', color: 'text-warning', bg: 'bg-warning/10' },
              { icon: Battery, label: 'Tomadas', value: '2 disponíveis nesta mesa', color: 'text-success', bg: 'bg-success/10' },
              { icon: Coffee, label: 'Próximo café', value: cart.length > 0 ? 'Peça refil por R$ 5' : 'Peça pelo app', color: 'text-primary', bg: 'bg-primary/10' },
            ].map((item, i) => (
              <div key={i} className={`p-3 rounded-xl border border-border flex items-center gap-3`}>
                <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1"><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.value}</p></div>
              </div>
            ))}
          </div>

          <GuidedHint text="Peça um café sem sair da sua mesa" />
          <button onClick={() => onNavigate('menu')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <Coffee className="w-5 h-5" />Pedir pelo App
          </button>
          {cart.length > 0 && (
            <button onClick={() => onNavigate('comanda')} className="w-full mt-2 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <ArrowRight className="w-4 h-4" />Ver Minha Comanda ({cart.length} itens)
            </button>
          )}
        </div>
      );

    case 'menu':
      return (
        <div className="pb-4">
          <div className="sticky top-0 bg-background/95 backdrop-blur z-10 px-5 pb-3 pt-2">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => onNavigate('work-mode')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
              <h1 className="font-display font-bold">Cardápio</h1>
              <button onClick={() => onNavigate('comanda')} className="relative w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Coffee className="w-4 h-4" />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{cart.length}</span>}
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="px-5 space-y-2 mt-3">
            {CAFE_MENU.filter(m => m.cat === activeCategory).map(item => (
              <button key={item.id} onClick={() => {
                if ((item as any).customizable) {
                  setSelectedItem(item);
                  setSelectedMilk('Integral');
                  setSelectedSize('M');
                  setSelectedFlavor(null);
                  setSelectedTemp('Quente');
                  setExtraShot(false);
                  onNavigate('customize');
                } else {
                  addToCartDirect(item);
                  onNavigate('comanda');
                }
              }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                <ItemIcon cat={item.iconCat} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{item.name}</p>
                    {item.refill && <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[9px] font-semibold flex items-center gap-0.5"><RefreshCw className="w-2.5 h-2.5" /> Refil</span>}
                    {(item as any).customizable && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-semibold flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> Custom</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</p>
                  <p className="font-display font-bold text-sm mt-1">R$ {item.price}</p>
                </div>
                <Plus className="w-4 h-4 text-primary" />
              </button>
            ))}
          </div>
        </div>
      );

    case 'customize':
      if (!selectedItem) return null;
      const sizeAdd = SIZE_OPTIONS.find(s => s.id === selectedSize)?.priceAdd || 0;
      const customTotal = selectedItem.price + sizeAdd + (selectedFlavor ? 3 : 0) + (extraShot ? 4 : 0);
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Personalizar</h1>
            <div className="w-8" />
          </div>

          <div className="text-center mb-4">
            <ItemIcon cat={selectedItem.iconCat} size="xl" className="mx-auto" />
            <h2 className="font-display text-lg font-bold mt-2">{selectedItem.name}</h2>
            <p className="text-xs text-muted-foreground">{selectedItem.desc}</p>
          </div>

          {/* Size */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Tamanho</label>
            <div className="flex gap-2">
              {SIZE_OPTIONS.map(size => (
                <button key={size.id} onClick={() => setSelectedSize(size.id)} className={`flex-1 py-3 rounded-xl border-2 text-center transition-all ${selectedSize === size.id ? 'border-primary bg-primary/10' : 'border-border'}`}>
                  <p className={`font-bold text-sm ${selectedSize === size.id ? 'text-primary' : 'text-foreground'}`}>{size.id}</p>
                  <p className="text-[10px] text-muted-foreground">{size.ml}</p>
                  {size.priceAdd > 0 && <p className="text-[10px] text-primary font-semibold">+R$ {size.priceAdd}</p>}
                </button>
              ))}
            </div>
          </div>

          {/* Milk */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Tipo de leite</label>
            <div className="flex flex-wrap gap-2">
              {MILK_OPTIONS.map(milk => (
                <button key={milk} onClick={() => setSelectedMilk(milk)} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${selectedMilk === milk ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{milk}</button>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Temperatura</label>
            <div className="flex gap-2">
              {TEMP_OPTIONS.map(temp => (
                <button key={temp} onClick={() => setSelectedTemp(temp)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${selectedTemp === temp ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{temp}</button>
              ))}
            </div>
          </div>

          {/* Flavor */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Sabor extra <span className="text-muted-foreground font-normal">(+R$ 3)</span></label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedFlavor(null)} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${!selectedFlavor ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>Sem sabor</button>
              {FLAVOR_OPTIONS.map(flavor => (
                <button key={flavor} onClick={() => setSelectedFlavor(flavor)} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${selectedFlavor === flavor ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{flavor}</button>
              ))}
            </div>
          </div>

          {/* Extra shot */}
          <button onClick={() => setExtraShot(!extraShot)} className={`w-full p-3 rounded-xl border-2 mb-4 flex items-center gap-3 transition-all ${extraShot ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${extraShot ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
              {extraShot && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <div className="flex-1 text-left"><p className="text-sm font-medium">Shot extra de espresso</p><p className="text-xs text-muted-foreground">Mais intensidade</p></div>
            <span className="text-xs text-primary font-semibold">+R$ 4</span>
          </button>

          {/* Price & add */}
          <button onClick={addCustomized} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            Adicionar à Comanda · R$ {customTotal}
          </button>
        </div>
      );

    case 'comanda':
      const refillableItems = cart.filter(c => {
        const menuItem = CAFE_MENU.find(m => c.id.startsWith(m.id));
        return menuItem?.refill && !c.isRefill;
      });
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Minha Comanda</h1>
            <div className="w-8" />
          </div>

          <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-3 mb-4">
            <ItemIcon cat="coffee" size="sm" />
            <div className="flex-1"><p className="font-semibold text-sm">Café Noowe</p><p className="text-xs text-muted-foreground">Mesa 3 · Janela · {sessionMinutes > 0 ? `${sessionMinutes}min` : 'Modo Trabalho'}</p></div>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <Coffee className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Comanda vazia</p>
              <button onClick={() => onNavigate('menu')} className="mt-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Ver Cardápio</button>
            </div>
          ) : (
            <>
              {cart.map((c, i) => (
                <div key={c.id} className={`flex items-center gap-3 py-3 border-b border-border ${c.isRefill ? 'bg-success/5 -mx-1 px-1 rounded-lg' : ''}`}>
                  <ItemIcon cat={c.iconCat} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{c.name}</p>
                    {c.customizations && <p className="text-[10px] text-primary">{c.customizations.join(' · ')}</p>}
                    <p className="text-xs text-muted-foreground">R$ {c.price}</p>
                  </div>
                  {c.isRefill && <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[9px] font-bold">Refil</span>}
                </div>
              ))}

              {/* Refill buttons */}
              {refillableItems.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-success flex items-center gap-1"><RefreshCw className="w-3 h-3" />Bebidas com refil disponível</p>
                  {refillableItems.map(item => (
                    <button key={item.id} onClick={() => addRefill(item)} className="w-full p-3 rounded-xl border border-dashed border-success flex items-center justify-center gap-2 text-success hover:bg-success/5 transition-colors">
                      <RefreshCw className="w-4 h-4" /><span className="text-xs font-semibold">Refil {item.name} · R$ 5</span>
                    </button>
                  ))}
                </div>
              )}

              <button onClick={() => onNavigate('menu')} className="w-full mt-3 p-3 rounded-xl border border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground">
                <Plus className="w-4 h-4" /><span className="text-xs font-medium">Adicionar mais itens</span>
              </button>

              <div className="mt-4 p-4 rounded-xl bg-muted/30">
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Itens ({cart.length})</span><span>R$ {cartTotal}</span></div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg"><span>Total</span><span>R$ {cartTotal}</span></div>
              </div>

              <button onClick={() => onNavigate('payment')} className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />Fechar Conta
              </button>

              <button onClick={() => onNavigate('work-mode')} className="w-full mt-2 py-3 border border-border rounded-xl text-sm font-medium text-muted-foreground">
                Voltar ao Modo Trabalho
              </button>
            </>
          )}
        </div>
      );

    case 'payment':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('comanda')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Pagamento</h1>
            <div className="w-8" />
          </div>

          {/* Loyalty */}
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 mb-4 flex items-center gap-3">
            <Award className="w-5 h-5 text-accent" />
            <div className="flex-1">
              <p className="text-xs font-semibold">Café #8 de 10!</p>
              <p className="text-[10px] text-muted-foreground">Mais 2 cafés e o próximo é grátis ☕</p>
            </div>
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
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Itens ({cart.length})</span><span>R$ {cartTotal}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Sessão: {sessionMinutes}min</span><span className="text-success">Grátis</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg"><span>Total</span><span className="text-primary">R$ {cartTotal}</span></div>
          </div>

          <button onClick={() => onNavigate('payment-success')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Pagar R$ {cartTotal}
          </button>
        </div>
      );

    case 'payment-success':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Conta Fechada! ☕</h2>
          <p className="text-sm text-muted-foreground mb-2">Obrigado pela visita — volte sempre!</p>
          <p className="text-xs text-muted-foreground mb-5">Sessão: {sessionMinutes}min · Mesa 3</p>

          {/* Stamp card */}
          <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
            <div className="flex items-center gap-2 mb-3"><Gift className="w-4 h-4 text-primary" /><span className="text-sm font-bold">Cartão Fidelidade Café</span></div>
            <div className="flex gap-1.5 mb-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`flex-1 h-6 rounded-md flex items-center justify-center ${i < 8 ? 'bg-primary' : 'bg-muted'}`}>
                  {i < 8 ? <Check className="w-3 h-3 text-primary-foreground" /> : i === 8 ? <span className="text-[10px] text-muted-foreground">☕</span> : null}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">8 de 10 · Mais 2 cafés e o próximo é <span className="text-primary font-bold">GRÁTIS!</span></p>
          </div>

          <div className="w-full p-3 rounded-xl bg-success/10 border border-success/20 mb-4 flex items-center gap-3">
            <Award className="w-5 h-5 text-success" />
            <div className="text-left"><p className="text-sm font-semibold text-success">+{Math.round(cartTotal / 5)} pontos ganhos!</p></div>
          </div>

          <div className="w-full space-y-2">
            <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
          </div>
        </div>
      );

    default: return null;
  }
};
