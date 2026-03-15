/**
 * Fast Casual Demo — NOOWE Fresh
 * Deep UX: Discovery → Saved Bowls → Dish Builder (4 steps) → Allergy/Nutrition → Favorites → Payment → Live Prep → Pickup → Rating
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint, ItemIcon } from '../DemoShared';
import { FoodImg } from '../FoodImages';
import {
  ArrowLeft, Check, Loader2, Star, Clock, ChevronRight,
  Leaf, Flame, Droplets, Wheat, CreditCard, Gift, Plus,
  ArrowRight, Search, MapPin, Zap, Heart, AlertTriangle,
  Bookmark, Award, ThumbsUp, Minus, ShieldCheck, RotateCcw,
  Sparkles, ChefHat,
} from 'lucide-react';

type Screen =
  | 'home' | 'restaurant' | 'saved-bowls'
  | 'builder-base' | 'builder-protein' | 'builder-toppings' | 'builder-sauce'
  | 'builder-summary' | 'allergies' | 'payment' | 'prep-tracking' | 'ready' | 'rating';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir restaurante', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Bowls salvos ou novo', screens: ['saved-bowls'] },
  { step: 3, label: 'Montar prato (4 etapas)', screens: ['builder-base', 'builder-protein', 'builder-toppings', 'builder-sauce'] },
  { step: 4, label: 'Resumo & alergias', screens: ['builder-summary', 'allergies'] },
  { step: 5, label: 'Pagamento', screens: ['payment'] },
  { step: 6, label: 'Preparo em tempo real', screens: ['prep-tracking'] },
  { step: 7, label: 'Retirada & avaliação', screens: ['ready', 'rating'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'Encontre opções saudáveis e customizáveis por perto.' },
  'restaurant': { emoji: '🥗', title: 'NOOWE Fresh', desc: 'Restaurante fast casual com montagem personalizada.' },
  'saved-bowls': { emoji: '⭐', title: 'Meus Bowls', desc: 'Refaça pedidos salvos ou crie um novo do zero.' },
  'builder-base': { emoji: '🍚', title: 'Escolha a Base', desc: 'Primeiro passo: arroz, quinoa, salada ou wrap.' },
  'builder-protein': { emoji: '🥩', title: 'Proteína', desc: 'Selecione a proteína principal do seu prato.' },
  'builder-toppings': { emoji: '🥬', title: 'Toppings', desc: 'Adicione vegetais e complementos — alguns premium.' },
  'builder-sauce': { emoji: '🫗', title: 'Molho', desc: 'Toque final: escolha até 2 molhos artesanais.' },
  'builder-summary': { emoji: '📊', title: 'Seu Bowl', desc: 'Resumo completo com nutrição e preço.' },
  'allergies': { emoji: '⚠️', title: 'Alergias', desc: 'Verificação de alérgenos antes de confirmar.' },
  'payment': { emoji: '💳', title: 'Pagamento', desc: 'Checkout com pontos e cupons aplicáveis.' },
  'prep-tracking': { emoji: '👨‍🍳', title: 'Preparando', desc: 'Acompanhe cada etapa do preparo em tempo real.' },
  'ready': { emoji: '✅', title: 'Pronto!', desc: 'Retire na bandeja com seu nome.' },
  'rating': { emoji: '⭐', title: 'Avaliação', desc: 'Avalie e ganhe pontos extras.' },
};

const BASES = [
  { id: 'rice', name: 'Arroz Branco', cal: 200, carbs: 44, prot: 4, fiber: 1, imgId: 'rice', desc: 'Grão longo, soltinho' },
  { id: 'brown', name: 'Arroz Integral', cal: 180, carbs: 38, prot: 5, fiber: 4, imgId: 'brown-rice', desc: 'Rico em fibras' },
  { id: 'quinoa', name: 'Quinoa', cal: 160, carbs: 27, prot: 8, fiber: 5, imgId: 'quinoa', desc: 'Superfood proteico' },
  { id: 'salad', name: 'Mix de Folhas', cal: 30, carbs: 5, prot: 2, fiber: 3, imgId: 'mixed-greens', desc: 'Low carb, leve' },
  { id: 'wrap', name: 'Wrap Integral', cal: 150, carbs: 25, prot: 4, fiber: 3, imgId: 'wrap-bowl', desc: 'Prático para levar' },
];

const PROTEINS = [
  { id: 'chicken', name: 'Frango Grelhado', cal: 165, carbs: 0, prot: 31, price: 12, imgId: 'grilled-chicken', desc: 'Peito marinado no limão', allergens: [] },
  { id: 'beef', name: 'Carne Bovina', cal: 250, carbs: 0, prot: 26, price: 16, imgId: 'beef', desc: 'Acém desfiado ao molho', allergens: [] },
  { id: 'salmon', name: 'Salmão Grelhado', cal: 208, carbs: 0, prot: 20, price: 20, imgId: 'salmon', desc: 'Filé com crosta de ervas', allergens: ['peixe'] },
  { id: 'tofu', name: 'Tofu Crocante', cal: 144, carbs: 3, prot: 17, price: 10, imgId: 'tofu', desc: 'Empanado e dourado', allergens: ['soja'] },
  { id: 'shrimp', name: 'Camarão Salteado', cal: 99, carbs: 0, prot: 24, price: 22, imgId: 'shrimp', desc: 'Com alho e azeite', allergens: ['crustáceo'] },
];

const TOPPINGS = [
  { id: 'tomato', name: 'Tomate Cereja', cal: 5, prot: 0, imgId: 'tomato' },
  { id: 'corn', name: 'Milho Grelhado', cal: 15, prot: 1, imgId: 'corn' },
  { id: 'cucumber', name: 'Pepino', cal: 3, prot: 0, imgId: 'cucumber' },
  { id: 'carrot', name: 'Cenoura Ralada', cal: 8, prot: 0, imgId: 'carrot' },
  { id: 'beet', name: 'Beterraba', cal: 10, prot: 1, imgId: 'beet' },
  { id: 'edamame', name: 'Edamame', cal: 30, prot: 4, imgId: 'edamame', extra: 4, allergens: ['soja'] },
  { id: 'avocado', name: 'Abacate', cal: 40, prot: 1, imgId: 'avocado', extra: 5 },
  { id: 'egg', name: 'Ovo Cozido', cal: 70, prot: 6, imgId: 'egg', extra: 3, allergens: ['ovo'] },
  { id: 'cheese', name: 'Queijo Feta', cal: 50, prot: 4, imgId: 'feta', extra: 5, allergens: ['lactose'] },
];

const SAUCES = [
  { id: 'tahini', name: 'Tahini Limão', cal: 45, imgId: 'tahini', desc: 'Cremoso, cítrico', allergens: ['gergelim'] },
  { id: 'caesar', name: 'Caesar Light', cal: 40, imgId: 'food-generic', desc: 'Clássico, levinho', allergens: ['lactose', 'ovo'] },
  { id: 'oriental', name: 'Shoyu & Gengibre', cal: 25, imgId: 'food-generic', desc: 'Umami intenso', allergens: ['soja'] },
  { id: 'mostarda', name: 'Mostarda & Mel', cal: 50, imgId: 'food-generic', desc: 'Agridoce', allergens: ['mostarda'] },
  { id: 'pesto', name: 'Pesto de Manjericão', cal: 55, imgId: 'pesto', desc: 'Fresco e aromático', allergens: ['castanha', 'lactose'] },
];

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const FastCasualDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [base, setBase] = useState('quinoa');
  const [protein, setProtein] = useState('chicken');
  const [toppings, setToppings] = useState<string[]>(['tomato', 'corn', 'avocado']);
  const [sauces, setSauces] = useState<string[]>(['tahini']);
  const [prepStage, setPrepStage] = useState(0);
  const [bowlName, setBowlName] = useState('');
  const [saved, setSaved] = useState(false);

  const baseItem = BASES.find(b => b.id === base)!;
  const proteinItem = PROTEINS.find(p => p.id === protein)!;
  const selectedToppings = TOPPINGS.filter(t => toppings.includes(t.id));
  const selectedSauces = SAUCES.filter(s => sauces.includes(s.id));

  const totalCal = baseItem.cal + proteinItem.cal + selectedToppings.reduce((s, t) => s + t.cal, 0) + selectedSauces.reduce((s, sa) => s + sa.cal, 0);
  const totalProt = baseItem.prot + proteinItem.prot + selectedToppings.reduce((s, t) => s + (t.prot || 0), 0);
  const totalCarbs = baseItem.carbs + proteinItem.carbs;
  const totalFiber = baseItem.fiber || 0;
  const basePrice = 28;
  const totalPrice = basePrice + proteinItem.price + selectedToppings.reduce((s, t) => s + (t.extra || 0), 0);

  // Collect allergens
  const allAllergens = new Set<string>();
  proteinItem.allergens?.forEach(a => allAllergens.add(a));
  selectedToppings.forEach(t => t.allergens?.forEach(a => allAllergens.add(a)));
  selectedSauces.forEach(s => s.allergens?.forEach(a => allAllergens.add(a)));

  const toggleTopping = (id: string) => setToppings(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  const toggleSauce = (id: string) => setSauces(prev => prev.includes(id) ? prev.filter(s => s !== id) : prev.length < 2 ? [...prev, id] : prev);

  useEffect(() => {
    if (screen === 'prep-tracking') {
      const stages = [1, 2, 3, 4];
      let i = 0;
      setPrepStage(0);
      const t = setInterval(() => {
        i++;
        if (i >= stages.length) { clearInterval(t); setPrepStage(4); setTimeout(() => onNavigate('ready'), 1200); return; }
        setPrepStage(stages[i]);
      }, 1800);
      return () => clearInterval(t);
    }
  }, [screen]);

  const BuilderProgress: React.FC<{ step: number }> = ({ step }) => (
    <div className="flex items-center gap-1 px-5 mb-4">
      {['Base', 'Proteína', 'Toppings', 'Molho'].map((label, i) => (
        <div key={label} className="flex-1">
          <div className={`h-1.5 rounded-full transition-all ${i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-muted'}`} />
          <p className={`text-[9px] text-center mt-1 ${i <= step ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{label}</p>
        </div>
      ))}
    </div>
  );

  const Header: React.FC<{ title: string; back: Screen }> = ({ title, back }) => (
    <div className="px-5 flex items-center justify-between py-4">
      <button onClick={() => onNavigate(back)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
      <h1 className="font-display font-bold text-sm">{title}</h1>
      <div className="w-8" />
    </div>
  );

  // Running cal indicator
  const CalBadge = () => (
    <div className="mx-5 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50">
      <Flame className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-semibold">{totalCal} kcal</span>
      <span className="text-[10px] text-muted-foreground">· {totalProt}g prot</span>
      <span className="ml-auto text-xs font-bold text-primary">R$ {totalPrice}</span>
    </div>
  );

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Olá</p>
            <h1 className="font-display text-xl font-bold">Monte seu prato ideal</h1>
          </div>
          <GuidedHint text="Customize cada ingrediente do seu bowl perfeito" />
          <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Buscar por ingrediente ou bowl...</span>
          </div>
          {/* Featured restaurant */}
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <ItemIcon cat="salad" size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">NOOWE Fresh</h3>
                    <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[9px] font-bold">Aberto</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Fast Casual · Bowls · Wraps · Sucos</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-semibold">4.7</span></span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />8-12 min</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />350m</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
          {/* Popular bowls */}
          <h3 className="font-semibold text-sm mb-2">Bowls populares</h3>
          {[
            { name: 'Protein Power', items: 'Quinoa + Frango + Ovo + Avocado', cal: 520, price: 42 },
            { name: 'Veggie Zen', items: 'Mix Folhas + Tofu + Edamame + Pesto', cal: 380, price: 38 },
          ].map((bowl, i) => (
            <button key={i} onClick={() => onNavigate('restaurant')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card mb-2 text-left">
              <ItemIcon cat={i === 0 ? 'meat' : 'veggie'} />
              <div className="flex-1">
                <p className="font-semibold text-sm">{bowl.name}</p>
                <p className="text-[10px] text-muted-foreground">{bowl.items}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold">R$ {bowl.price}</p>
                <p className="text-[9px] text-muted-foreground">{bowl.cal} kcal</p>
              </div>
            </button>
          ))}
        </div>
      );

    case 'restaurant':
      return (
        <div className="px-5 pb-4">
          <Header title="NOOWE Fresh" back="home" />
          <div className="text-center mb-4">
            <ItemIcon cat="salad" size="hero" className="mx-auto" />
            <h2 className="font-display text-xl font-bold mt-2">Monte do zero ou repita</h2>
            <p className="text-sm text-muted-foreground">100% fresco · Calorias calculadas em tempo real</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { icon: Leaf, label: 'Ingredientes\nFrescos', value: '100%' },
              { icon: Flame, label: 'Calorias\nCalculadas', value: 'Tempo Real' },
              { icon: Clock, label: 'Tempo\nMédio', value: '8 min' },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground whitespace-pre-line">{s.label}</p>
              </div>
            ))}
          </div>
          <GuidedHint text="Veja seus bowls salvos ou monte um novo" />
          <button onClick={() => onNavigate('saved-bowls')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <Sparkles className="w-5 h-5" />Começar
          </button>
        </div>
      );

    case 'saved-bowls':
      return (
        <div className="px-5 pb-4">
          <Header title="Meus Bowls" back="restaurant" />
          <p className="text-xs text-muted-foreground mb-4">Repita um favorito ou crie algo novo</p>
          {/* Saved bowl */}
          <div className="p-4 rounded-2xl border-2 border-primary/30 bg-primary/5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary fill-primary" />
                <span className="font-semibold text-sm">Meu Bowl de Sempre</span>
              </div>
              <span className="text-xs text-muted-foreground">Pedido 12x</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Quinoa + Frango + Tomate + Milho + Avocado + Tahini</p>
            <div className="flex items-center justify-between">
              <span className="text-xs"><Flame className="w-3 h-3 text-primary inline mr-1" />485 kcal · R$ 45</span>
              <button onClick={() => onNavigate('payment')} className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />Repetir
              </button>
            </div>
          </div>
          {/* Another saved */}
          <div className="p-4 rounded-2xl border border-border bg-card mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-sm">Wrap Proteico</span>
              </div>
              <span className="text-xs text-muted-foreground">Pedido 5x</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Wrap + Carne + Ovo + Queijo + Mostarda&Mel</p>
            <div className="flex items-center justify-between">
              <span className="text-xs"><Flame className="w-3 h-3 text-primary inline mr-1" />620 kcal · R$ 52</span>
              <button className="px-4 py-1.5 rounded-lg bg-muted text-xs font-medium">Repetir</button>
            </div>
          </div>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">ou</span></div>
          </div>
          <button onClick={() => onNavigate('builder-base')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />Criar Novo Bowl
          </button>
        </div>
      );

    case 'builder-base':
      return (
        <div className="pb-4">
          <Header title="Escolha a Base" back="saved-bowls" />
          <BuilderProgress step={0} />
          <div className="px-5 space-y-2">
            {BASES.map(b => (
              <button key={b.id} onClick={() => setBase(b.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${base === b.id ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-card'}`}>
                <FoodImg id={b.imgId} size="sm" alt={b.name} />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{b.cal} kcal</p>
                  <p className="text-[9px] text-muted-foreground">{b.prot}g prot</p>
                </div>
                {base === b.id && <Check className="w-5 h-5 text-primary shrink-0" />}
              </button>
            ))}
          </div>
          <div className="px-5 mt-4">
            <CalBadge />
            <button onClick={() => onNavigate('builder-protein')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
              Próximo: Proteína <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'builder-protein':
      return (
        <div className="pb-4">
          <Header title="Escolha a Proteína" back="builder-base" />
          <BuilderProgress step={1} />
          <div className="px-5 space-y-2">
            {PROTEINS.map(p => (
              <button key={p.id} onClick={() => setProtein(p.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${protein === p.id ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-card'}`}>
                <FoodImg id={p.imgId} size="sm" alt={p.name} />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                  {p.allergens && p.allergens.length > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-2.5 h-2.5 text-warning" />
                      <span className="text-[9px] text-warning">{p.allergens.join(', ')}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary">+R$ {p.price}</p>
                  <p className="text-[9px] text-muted-foreground">{p.cal} kcal · {p.prot}g</p>
                </div>
                {protein === p.id && <Check className="w-5 h-5 text-primary shrink-0" />}
              </button>
            ))}
          </div>
          <div className="px-5 mt-4">
            <CalBadge />
            <button onClick={() => onNavigate('builder-toppings')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
              Próximo: Toppings <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'builder-toppings':
      return (
        <div className="pb-4">
          <Header title="Toppings" back="builder-protein" />
          <BuilderProgress step={2} />
          <p className="px-5 text-xs text-muted-foreground mb-2">Grátis ilimitados · Premium com custo extra</p>
          <div className="px-5 space-y-1.5">
            {TOPPINGS.map(t => (
              <button key={t.id} onClick={() => toggleTopping(t.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${toppings.includes(t.id) ? 'border-primary bg-primary/5' : 'border-border/50 bg-card'}`}>
                <FoodImg id={t.imgId} size="xs" alt={t.name} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{t.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{t.cal} kcal</span>
                    {t.extra ? <span className="text-[10px] text-primary font-semibold">+R$ {t.extra}</span> : <span className="text-[10px] text-success">Grátis</span>}
                    {t.allergens && <span className="text-[9px] text-warning flex items-center gap-0.5"><AlertTriangle className="w-2 h-2" />{t.allergens.join(', ')}</span>}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${toppings.includes(t.id) ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                  {toppings.includes(t.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </button>
            ))}
          </div>
          <div className="px-5 mt-4">
            <CalBadge />
            <button onClick={() => onNavigate('builder-sauce')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
              Próximo: Molho <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'builder-sauce':
      return (
        <div className="pb-4">
          <Header title="Molhos (até 2)" back="builder-toppings" />
          <BuilderProgress step={3} />
          <p className="px-5 text-xs text-muted-foreground mb-3">Escolha até 2 molhos artesanais</p>
          <div className="px-5 space-y-2">
            {SAUCES.map(s => (
              <button key={s.id} onClick={() => toggleSauce(s.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${sauces.includes(s.id) ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <FoodImg id={s.imgId} size="sm" alt={s.name} />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc} · {s.cal} kcal</p>
                  {s.allergens.length > 0 && (
                    <span className="text-[9px] text-warning flex items-center gap-0.5 mt-0.5"><AlertTriangle className="w-2 h-2" />{s.allergens.join(', ')}</span>
                  )}
                </div>
                {sauces.includes(s.id) && <Check className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
          <div className="px-5 mt-4">
            <CalBadge />
            <button onClick={() => onNavigate('builder-summary')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
              Ver Resumo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'builder-summary':
      return (
        <div className="px-5 pb-4">
          <Header title="Seu Bowl" back="builder-sauce" />
          {/* Bowl visual */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-bold">Bowl Personalizado</h2>
              <button onClick={() => setSaved(!saved)} className="p-1.5">
                <Heart className={`w-5 h-5 ${saved ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
              </button>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2"><FoodImg id={baseItem.imgId} size="xs" alt={baseItem.name} /><span className="font-medium">{baseItem.name}</span></div>
              <div className="flex items-center gap-2"><FoodImg id={proteinItem.imgId} size="xs" alt={proteinItem.name} /><span className="font-medium">{proteinItem.name}</span></div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedToppings.map(t => (<span key={t.id} className="px-2 py-0.5 rounded-full bg-muted text-[10px]">{t.name}</span>))}
              </div>
              <div className="flex gap-1.5 mt-1">
                {selectedSauces.map(s => (<span key={s.id} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">{s.emoji} {s.name}</span>))}
              </div>
            </div>
          </div>
          {/* Nutrition grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: Flame, label: 'Calorias', value: `${totalCal}`, unit: 'kcal' },
              { icon: Droplets, label: 'Proteína', value: `${totalProt}`, unit: 'g' },
              { icon: Wheat, label: 'Carbos', value: `${totalCarbs}`, unit: 'g' },
              { icon: Leaf, label: 'Fibras', value: `${totalFiber}`, unit: 'g' },
            ].map((n, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-card border border-border text-center">
                <n.icon className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                <p className="text-sm font-bold">{n.value}<span className="text-[9px] text-muted-foreground">{n.unit}</span></p>
                <p className="text-[9px] text-muted-foreground">{n.label}</p>
              </div>
            ))}
          </div>
          {/* Allergen alert */}
          {allAllergens.size > 0 && (
            <button onClick={() => onNavigate('allergies')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20 mb-4">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold text-warning">Contém alérgenos</p>
                <p className="text-[10px] text-muted-foreground">{Array.from(allAllergens).join(', ')}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-warning" />
            </button>
          )}
          {/* Pricing */}
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Base + montagem</span><span>R$ {basePrice}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{proteinItem.name}</span><span>+R$ {proteinItem.price}</span></div>
            {selectedToppings.filter(t => t.extra).map(t => (
              <div key={t.id} className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{t.name}</span><span>+R$ {t.extra}</span></div>
            ))}
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
              <span>Total</span><span className="text-primary">R$ {totalPrice}</span>
            </div>
          </div>
          <button onClick={() => onNavigate('payment')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Pagar R$ {totalPrice}
          </button>
        </div>
      );

    case 'allergies':
      return (
        <div className="px-5 pb-4">
          <Header title="Verificação de Alergias" back="builder-summary" />
          <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-warning" />
          </div>
          <h2 className="font-display text-lg font-bold text-center mb-1">Alérgenos no seu bowl</h2>
          <p className="text-xs text-center text-muted-foreground mb-5">Os seguintes ingredientes contêm alérgenos</p>
          <div className="space-y-2 mb-5">
            {[...proteinItem.allergens || [], ...selectedToppings.flatMap(t => t.allergens || []), ...selectedSauces.flatMap(s => s.allergens || [])].filter((v, i, a) => a.indexOf(v) === i).map(allergen => (
              <div key={allergen} className="flex items-center gap-3 p-3 rounded-xl bg-warning/5 border border-warning/20">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold capitalize">{allergen}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Presente em: {[
                      ...(proteinItem.allergens?.includes(allergen) ? [proteinItem.name] : []),
                      ...selectedToppings.filter(t => t.allergens?.includes(allergen)).map(t => t.name),
                      ...selectedSauces.filter(s => s.allergens?.includes(allergen)).map(s => s.name),
                    ].join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-success/10 border border-success/20 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="text-xs text-success font-medium">Nossos ingredientes são rastreados da origem</span>
          </div>
          <button onClick={() => onNavigate('builder-summary')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Entendi, continuar
          </button>
        </div>
      );

    case 'payment':
      return (
        <div className="px-5 pb-4">
          <Header title="Pagamento" back="builder-summary" />
          {/* Loyalty points */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Award className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-semibold">320 pontos disponíveis</p>
              <p className="text-[10px] text-muted-foreground">Equivale a R$ 3,20 de desconto</p>
            </div>
            <button className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">Usar</button>
          </div>
          {/* Payment method */}
          <div className="p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1"><p className="text-sm font-medium">•••• 4242</p><p className="text-xs text-muted-foreground">Visa Crédito</p></div>
              <Check className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1"><p className="text-sm font-medium">PIX</p><p className="text-xs text-muted-foreground">Pagamento instantâneo</p></div>
            </div>
          </div>
          {/* Summary */}
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Bowl Personalizado</span><span>R$ {totalPrice}</span></div>
            <div className="flex justify-between text-sm mb-1 text-success"><span>Pontos aplicados</span><span>-R$ 3,20</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
              <span>Total</span><span className="text-primary">R$ {(totalPrice - 3.2).toFixed(2)}</span>
            </div>
          </div>
          {/* Estimated time */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Preparo estimado: <strong>8-10 min</strong></span>
          </div>
          <button onClick={() => onNavigate('prep-tracking')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Confirmar Pagamento
          </button>
        </div>
      );

    case 'prep-tracking':
      const stages = [
        { label: 'Pedido recebido', desc: 'Cozinha foi notificada', icon: '📩' },
        { label: 'Preparando base', desc: `${baseItem.name} + ${proteinItem.name}`, icon: '🍳' },
        { label: 'Montando toppings', desc: `${selectedToppings.length} ingredientes`, icon: '🥬' },
        { label: 'Controle de qualidade', desc: 'Chef verificando seu bowl', icon: '👨‍🍳' },
        { label: 'Pronto para retirada!', desc: 'Bandeja #42 · Seu nome está lá', icon: '✅' },
      ];
      return (
        <div className="px-5 pb-4">
          <Header title="Preparando seu Bowl" back="payment" />
          <div className="text-center mb-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <span className="text-3xl">{stages[Math.min(prepStage, 4)].icon}</span>
            </div>
            <h2 className="font-display text-lg font-bold">{stages[Math.min(prepStage, 4)].label}</h2>
            <p className="text-xs text-muted-foreground">{stages[Math.min(prepStage, 4)].desc}</p>
          </div>
          <div className="space-y-2">
            {stages.map((stage, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${i < prepStage ? 'bg-success/10 border border-success/20' : i === prepStage ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30 border border-transparent'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < prepStage ? 'bg-success text-primary-foreground' : i === prepStage ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {i < prepStage ? <Check className="w-3.5 h-3.5" /> : i === prepStage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : i + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${i <= prepStage ? 'text-foreground' : 'text-muted-foreground'}`}>{stage.label}</p>
                  <p className="text-[10px] text-muted-foreground">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'ready':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-5 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Bowl Pronto! 🥗</h2>
          <p className="text-sm text-muted-foreground mb-1">Preparado em 8 minutos</p>
          <div className="w-full p-5 rounded-2xl bg-card border border-border mb-4 mt-4">
            <p className="text-xs text-muted-foreground">Bandeja / Código</p>
            <p className="font-display text-4xl font-bold tracking-widest text-success mt-1">#42</p>
            <p className="text-xs text-muted-foreground mt-1">Balcão de retirada · Setor A</p>
          </div>
          <div className="w-full p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">+45 pontos ganhos!</p><p className="text-xs text-muted-foreground">Stamp 7/10 · 3 mais para bowl grátis!</p></div>
          </div>
          <button onClick={() => onNavigate('rating')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            <Star className="w-5 h-5" />Avaliar (+10 pts bônus)
          </button>
        </div>
      );

    case 'rating':
      return (
        <div className="px-5 pb-4">
          <Header title="Avaliação" back="ready" />
          <div className="text-center mb-5">
            <span className="text-5xl block mb-3">🥗</span>
            <h2 className="font-display text-lg font-bold">Como foi seu bowl?</h2>
            <p className="text-xs text-muted-foreground">Sua opinião ajuda outros clientes</p>
          </div>
          {/* Stars */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-8 h-8 ${i <= 4 ? 'text-accent fill-accent' : 'text-muted'}`} />
            ))}
          </div>
          {/* Categories */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Frescor', value: '⭐⭐⭐⭐⭐' },
              { label: 'Porção', value: '⭐⭐⭐⭐' },
              { label: 'Rapidez', value: '⭐⭐⭐⭐⭐' },
            ].map((cat, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-muted/30 text-center">
                <p className="text-[9px] text-muted-foreground mb-0.5">{cat.label}</p>
                <p className="text-[8px]">{cat.value}</p>
              </div>
            ))}
          </div>
          {/* Quick tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {['Ingredientes frescos', 'Porção generosa', 'Rápido', 'Bonita apresentação', 'Bom custo-benefício'].map(tag => (
              <button key={tag} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/20">{tag}</button>
            ))}
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <ThumbsUp className="w-5 h-5" />Enviar Avaliação
          </button>
          <button onClick={() => onNavigate('home')} className="w-full mt-2 py-3 text-sm text-muted-foreground">Pular</button>
        </div>
      );

    default: return null;
  }
};