/**
 * Buffet Demo — Sabores Noowe
 * Deep UX: Discovery → Occupation/Menu → QR Check-in → Browse Stations → Smart Scale (multi-weigh) → Drinks Order → Live Comanda → Payment → Rating
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint, ItemIcon } from '../DemoShared';
import { FoodImg } from '../FoodImages';
import {
  ArrowLeft, Check, Star, Clock, Plus, CreditCard, Gift, QrCode,
  Search, MapPin, Scale, ArrowRight, Utensils, Droplets, Users,
  Loader2, RefreshCw, AlertCircle, ChefHat, Minus, Zap, Bell,
} from 'lucide-react';

type Screen = 'home' | 'restaurant' | 'checkin' | 'stations' | 'scale' | 'scale-history' | 'drinks' | 'comanda' | 'payment' | 'payment-success';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir buffet', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Check-in digital', screens: ['checkin'] },
  { step: 3, label: 'Estações ao vivo', screens: ['stations'] },
  { step: 4, label: 'Balança inteligente', screens: ['scale', 'scale-history'] },
  { step: 5, label: 'Pedir bebidas', screens: ['drinks'] },
  { step: 6, label: 'Comanda em tempo real', screens: ['comanda'] },
  { step: 7, label: 'Pagamento sem fila', screens: ['payment', 'payment-success'] },
];

export const SCREEN_INFO: Record<Screen, { title: string; desc: string }> = {
  'home': { title: 'Descoberta', desc: 'Encontre buffets por peso ou preço fixo.' },
  'restaurant': { title: 'Sabores Noowe', desc: 'Buffet self-service com balança inteligente.' },
  'checkin': { title: 'Check-in', desc: 'Check-in digital vincula sua comanda automaticamente.' },
  'stations': { title: 'Estações', desc: 'Veja o que está disponível em cada estação, ao vivo.' },
  'scale': { title: 'Balança', desc: 'QR Code na balança registra o peso automaticamente.' },
  'scale-history': { title: 'Pesagens', desc: 'Histórico de pesagens — volte quantas vezes quiser.' },
  'drinks': { title: 'Bebidas', desc: 'Peça bebidas pelo app — entregam na mesa.' },
  'comanda': { title: 'Comanda', desc: 'Comanda ao vivo: comida por peso + bebidas + sobremesa.' },
  'payment': { title: 'Pagamento', desc: 'Pague sem fila no caixa.' },
  'payment-success': { title: 'Sucesso', desc: 'Pagamento confirmado com pontos e stamps.' },
};

const STATIONS = [
  { name: 'Grelhados', cat: 'grelhados', imgId: 'grilled-meat', items: ['Fraldinha', 'Linguiça', 'Frango'], status: 'fresh' as const },
  { name: 'Massas', cat: 'massas', imgId: 'pasta', items: ['Espaguete', 'Penne', 'Lasanha'], status: 'fresh' as const },
  { name: 'Saladas', cat: 'saladas', imgId: 'salad-bar', items: ['Folhas Mix', 'Tabule', 'Grega'], status: 'fresh' as const },
  { name: 'Acompanhamentos', cat: 'acompanhamentos', imgId: 'rice', items: ['Arroz', 'Feijão', 'Purê', 'Farofa'], status: 'replenishing' as const },
  { name: 'Sobremesas', cat: 'sobremesas', imgId: 'pudding', items: ['Pudim', 'Mousse', 'Frutas'], status: 'fresh' as const },
  { name: 'Sushi Bar', cat: 'sushi', imgId: 'sushi-platter', items: ['Salmão', 'Atum', 'Philadelphia'], status: 'fresh' as const },
];

const DRINK_MENU = [
  { id: 'd1', name: 'Suco Natural (500ml)', price: 12, iconCat: 'juice', imgId: 'juice', cat: 'Sucos' },
  { id: 'd2', name: 'Suco Verde Detox', price: 15, iconCat: 'juice', imgId: 'juice-green', cat: 'Sucos' },
  { id: 'd3', name: 'Refrigerante Lata', price: 8, iconCat: 'soda', imgId: 'soda', cat: 'Refrigerantes' },
  { id: 'd4', name: 'Água Mineral', price: 6, iconCat: 'water', imgId: 'water', cat: 'Água' },
  { id: 'd5', name: 'Água com Gás', price: 7, iconCat: 'water', imgId: 'sparkling-water', cat: 'Água' },
  { id: 'd6', name: 'Cerveja Artesanal', price: 18, iconCat: 'beer', imgId: 'ipa', cat: 'Cervejas' },
  { id: 'd7', name: 'Taça de Vinho', price: 22, iconCat: 'wine', imgId: 'wine-red', cat: 'Vinhos' },
];

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const BuffetDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [weight, setWeight] = useState(0);
  const [weighing, setWeighing] = useState(false);
  const [weighHistory, setWeighHistory] = useState<number[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<{id: string, qty: number}[]>([{ id: 'd1', qty: 1 }, { id: 'd6', qty: 2 }]);
  const pricePerKg = 79.9;
  const totalWeight = weighHistory.reduce((s, w) => s + w, 0) + (weight >= 480 ? weight : 0);
  const foodTotal = Math.round(totalWeight * pricePerKg / 1000 * 100) / 100;
  const drinksTotal = selectedDrinks.reduce((s, d) => {
    const drink = DRINK_MENU.find(dm => dm.id === d.id);
    return s + (drink ? drink.price * d.qty : 0);
  }, 0);
  const serviceCharge = Math.round((foodTotal + drinksTotal) * 0.1 * 100) / 100;
  const grandTotal = foodTotal + drinksTotal + serviceCharge;

  useEffect(() => {
    if (weighing) {
      let w = 0;
      const interval = setInterval(() => {
        w += Math.random() * 50 + 15;
        if (w > 485) { w = 485; clearInterval(interval); setWeighing(false); }
        setWeight(Math.round(w));
      }, 180);
      return () => clearInterval(interval);
    }
  }, [weighing]);

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
            <p className="text-sm text-muted-foreground">Bom almoço</p>
            <h1 className="font-display text-xl font-bold">Buffets por perto</h1>
          </div>
          <GuidedHint text="Buffet com balança inteligente e comanda digital" />
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <div className="flex items-center gap-3">
                <ItemIcon cat="buffet" size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">Sabores Noowe</h3>
                    <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[9px] font-bold">Aberto</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Buffet por Peso · R$ 79,90/kg · Sushi Bar</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-semibold">4.4</span></span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />65% lotação</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />200m</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      );

    case 'restaurant':
      return (
        <div className="px-5 pb-4">
          <Header title="Sabores Noowe" back="home" />
          <div className="text-center mb-4">
            <ItemIcon cat="buffet" size="hero" className="mx-auto" />
            <h2 className="font-display text-xl font-bold mt-2">Buffet Self-Service</h2>
            <p className="text-sm text-muted-foreground">Sirva-se à vontade · R$ 79,90/kg</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Opções Hoje', value: '84+', icon: ChefHat },
              { label: 'Preço/kg', value: 'R$ 79,90', icon: Scale },
              { label: 'Sushi Bar', value: '✓ Incluso', icon: Utensils },
              { label: 'Ocupação', value: '65%', icon: Users },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto" />
                <p className="text-xs font-bold mt-1">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Live station alerts */}
          <div className="p-3 rounded-xl bg-success/10 border border-success/20 mb-3 flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-success" />
            <span className="text-xs text-success font-medium">Fraldinha acabou de sair da churrasqueira!</span>
          </div>
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 mb-4 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-warning" />
            <span className="text-xs text-warning font-medium">Arroz sendo reabastecido · 3 min</span>
          </div>
          <GuidedHint text="Faça check-in para vincular sua comanda digital" />
          <button onClick={() => onNavigate('checkin')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5" />Check-in Digital
          </button>
        </div>
      );

    case 'checkin':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Check-in realizado!</h2>
          <p className="text-sm text-muted-foreground mb-1">Mesa 12 · Sabores Noowe</p>
          <p className="text-xs text-muted-foreground mb-4">Comanda digital ativa</p>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-3">
            <p className="text-xs text-muted-foreground">Código da comanda</p>
            <p className="font-display text-3xl font-bold tracking-widest text-primary mt-1">SN-012</p>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Este código aparece automaticamente na balança via NFC</p>
          <div className="w-full grid grid-cols-2 gap-2">
            <button onClick={() => onNavigate('stations')} className="py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">Ver Estações</button>
            <button onClick={() => onNavigate('scale')} className="py-3 border border-border rounded-xl font-semibold text-sm">Ir à Balança</button>
          </div>
        </div>
      );

    case 'stations':
      return (
        <div className="px-5 pb-4">
          <Header title="Estações ao Vivo" back="checkin" />
          <p className="text-xs text-muted-foreground mb-3">Atualizado em tempo real pela cozinha</p>
          <div className="space-y-2">
            {STATIONS.map((station, i) => (
              <div key={i} className="p-3 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ItemIcon cat={station.cat} size="sm" />
                    <span className="font-semibold text-sm">{station.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    station.status === 'fresh' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                    {station.status === 'fresh' ? '✓ Fresco' : '⏳ Reabastecendo'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {station.items.map(item => (
                    <span key={item} className="px-2.5 py-1 rounded-full bg-muted text-[10px]">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('scale')} className="w-full mt-4 py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <Scale className="w-5 h-5" />Ir para Balança
          </button>
        </div>
      );

    case 'scale':
      return (
        <div className="px-5 pb-4 flex flex-col items-center justify-center h-full text-center">
          <Scale className="w-10 h-10 text-primary mb-3" />
          <h2 className="font-display text-lg font-bold mb-2">Balança Inteligente</h2>
          {weight === 0 && !weighing ? (
            <>
              <p className="text-sm text-muted-foreground mb-1">Coloque seu prato na balança</p>
              <p className="text-xs text-muted-foreground mb-5">O app conecta automaticamente via NFC</p>
              {weighHistory.length > 0 && (
                <div className="w-full p-3 rounded-xl bg-muted/30 mb-4">
                  <p className="text-xs text-muted-foreground">Pesagens anteriores: {weighHistory.length} · Total: {weighHistory.reduce((a,b)=>a+b,0)}g</p>
                </div>
              )}
              <button onClick={() => setWeighing(true)} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow">
                Simular Pesagem
              </button>
            </>
          ) : weight < 480 ? (
            <>
              <div className="w-36 h-36 rounded-full border-4 border-primary/30 flex flex-col items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-ping" />
                <span className="font-display text-3xl font-bold text-primary">{weight}g</span>
                <span className="text-[10px] text-muted-foreground">pesando...</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">Estabilizando...</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-36 h-36 rounded-full border-4 border-success bg-success/5 flex flex-col items-center justify-center mb-4">
                <span className="font-display text-3xl font-bold text-success">485g</span>
                <span className="text-xs text-success font-semibold">✓ Registrado</span>
              </div>
              <div className="w-full p-4 rounded-xl bg-card border border-border mb-3">
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Esta pesagem</span><span>485g</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Preço/kg</span><span>R$ 79,90</span></div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
                  <span>Parcial</span><span className="text-primary">R$ {(485 * 79.9 / 1000).toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Pode voltar e pesar mais vezes!</p>
              <div className="w-full grid grid-cols-2 gap-2">
                <button onClick={() => { setWeighHistory(prev => [...prev, 485]); setWeight(0); }} className="py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />Pesar Mais
                </button>
                <button onClick={() => { setWeighHistory(prev => [...prev, 485]); onNavigate('drinks'); }} className="py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
                  Pedir Bebidas
                </button>
              </div>
            </>
          )}
        </div>
      );

    case 'drinks':
      return (
        <div className="px-5 pb-4">
          <Header title="Bebidas" back="scale" />
          <p className="text-xs text-muted-foreground mb-1">Peça pelo app — entregam na sua mesa</p>
          <p className="text-[10px] text-primary font-semibold mb-3">Mesa 12 · Comanda SN-012</p>
          {['Sucos', 'Refrigerantes', 'Água', 'Cervejas', 'Vinhos'].map(cat => {
            const catDrinks = DRINK_MENU.filter(d => d.cat === cat);
            if (catDrinks.length === 0) return null;
            return (
              <div key={cat} className="mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">{cat}</h3>
                {catDrinks.map(drink => {
                  const sel = selectedDrinks.find(d => d.id === drink.id);
                  return (
                    <div key={drink.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card mb-1.5">
                      <ItemIcon cat={drink.iconCat} size="xs" />
                      <div className="flex-1"><p className="text-sm font-medium">{drink.name}</p><p className="text-xs text-muted-foreground">R$ {drink.price}</p></div>
                      {sel ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedDrinks(prev => prev.map(d => d.id === drink.id ? {...d, qty: Math.max(0, d.qty-1)} : d).filter(d => d.qty > 0))} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                          <span className="text-sm font-bold w-4 text-center">{sel.qty}</span>
                          <button onClick={() => setSelectedDrinks(prev => prev.map(d => d.id === drink.id ? {...d, qty: d.qty+1} : d))} className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setSelectedDrinks(prev => [...prev, {id: drink.id, qty: 1}])} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <button onClick={() => onNavigate('comanda')} className="w-full mt-2 py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            Ver Comanda <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );

    case 'comanda':
      return (
        <div className="px-5 pb-4">
          <Header title="Minha Comanda" back="drinks" />
          <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-3 mb-4">
            <ItemIcon cat="buffet" size="sm" />
            <div><p className="font-semibold text-sm">Sabores Noowe</p><p className="text-xs text-muted-foreground">Mesa 12 · Comanda SN-012</p></div>
          </div>
          {/* Food section */}
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">Comida (por peso)</h3>
          {weighHistory.map((w, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm">Pesagem {i+1}</span>
              <div className="text-right">
                <span className="text-sm font-medium">{w}g</span>
                <span className="text-xs text-muted-foreground ml-2">R$ {(w * pricePerKg / 1000).toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between py-2 text-sm font-semibold border-b border-border">
            <span>Total comida ({totalWeight}g)</span>
            <span className="text-primary">R$ {foodTotal.toFixed(2)}</span>
          </div>
          {/* Drinks section */}
          <h3 className="text-xs font-semibold text-muted-foreground mt-4 mb-2">Bebidas</h3>
          {selectedDrinks.map(sd => {
            const drink = DRINK_MENU.find(d => d.id === sd.id)!;
            return (
              <div key={sd.id} className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm">{drink.name} ×{sd.qty}</span>
                <span className="text-sm">R$ {(drink.price * sd.qty).toFixed(2)}</span>
              </div>
            );
          })}
          {/* Total */}
          <div className="mt-4 p-4 rounded-xl bg-muted/30">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Comida</span><span>R$ {foodTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Bebidas</span><span>R$ {drinksTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Serviço (10%)</span><span>R$ {serviceCharge.toFixed(2)}</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
              <span>Total</span><span className="text-primary">R$ {grandTotal.toFixed(2)}</span>
            </div>
          </div>
          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => { setWeight(0); onNavigate('scale'); }} className="py-3 border border-border rounded-xl text-sm font-semibold flex items-center justify-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" />Pesar Mais
            </button>
            <button onClick={() => onNavigate('payment')} className="py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow text-sm">
              Pagar
            </button>
          </div>
        </div>
      );

    case 'payment':
      return (
        <div className="px-5 pb-4">
          <Header title="Pagamento" back="comanda" />
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <div><p className="text-xs font-semibold">Pague pelo app — sem fila no caixa!</p><p className="text-[10px] text-muted-foreground">Seu gasto saiu imediatamente da comanda</p></div>
          </div>
          {/* Payment method */}
          <div className="p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1"><p className="text-sm font-medium">•••• 4242</p><p className="text-xs text-muted-foreground">Visa · Crédito</p></div>
              <Check className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Comida ({totalWeight}g)</span><span>R$ {foodTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Bebidas</span><span>R$ {drinksTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Serviço (10%)</span><span>R$ {serviceCharge.toFixed(2)}</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
              <span>Total</span><span className="text-primary">R$ {grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={() => onNavigate('payment-success')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Pagar R$ {grandTotal.toFixed(2)}
          </button>
        </div>
      );

    case 'payment-success':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-5 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Bom apetite!</h2>
          <p className="text-sm text-muted-foreground mb-1">Pagamento confirmado — sem fila no caixa!</p>
          <p className="text-xs text-muted-foreground mb-4">Pode continuar comendo e voltar a pesar</p>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-3 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">+{Math.round(grandTotal / 2)} pontos ganhos!</p><p className="text-xs text-muted-foreground">Visita #5 — próxima sobremesa grátis!</p></div>
          </div>
          <div className="w-full p-3 rounded-xl bg-muted/30 mb-4 text-left">
            <p className="text-xs font-semibold mb-1">Seu perfil de buffet</p>
            <p className="text-[10px] text-muted-foreground">Peso médio por visita: 520g</p>
            <p className="text-[10px] text-muted-foreground">Estação favorita: Grelhados</p>
            <p className="text-[10px] text-muted-foreground">Total em 5 visitas: R$ 287,40</p>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default: return null;
  }
};