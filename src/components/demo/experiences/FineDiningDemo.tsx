/**
 * Fine Dining Demo — Bistrô Noowe
 * Full journey: Discover → QR Scan → Menu → AI Harmonization → Order → Pay → Loyalty
 */
import React, { useState, useEffect } from 'react';
import { useDemoContext, type DemoMenuItem } from '@/contexts/DemoContext';
import { GuidedHint, ItemIcon } from '../DemoShared';
import {
  ArrowLeft, ArrowRight, Search, MapPin, Star, Clock, Heart,
  Minus, Plus, X, ChevronRight, CreditCard,
  Users, Gift, Check, Loader2, UtensilsCrossed, CalendarDays,
  Sparkles, Crown, QrCode, Bell, User, Settings, LogOut,
  HandMetal, Timer, Wifi, Camera, ChevronDown,
  Phone, Award, History, HelpCircle, Zap, Share2,
  UserPlus, Receipt, DollarSign, Nfc, Smartphone, Wallet,
  ChefHat, CheckCircle, Send, Copy, AlertCircle,
  Wine, Flame, Leaf, Brain, MessageCircle,
} from 'lucide-react';

type Screen =
  | 'home' | 'restaurant' | 'menu' | 'item' | 'comanda'
  | 'fechar-conta' | 'order-status' | 'loyalty' | 'reservations'
  | 'qr-scan' | 'call-waiter' | 'profile' | 'virtual-queue' | 'my-orders'
  | 'payment-success' | 'notifications' | 'ai-harmonization';

// ============ JOURNEY CONFIG ============

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir restaurante', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Escanear QR da mesa', screens: ['qr-scan'] },
  { step: 3, label: 'Explorar cardápio', screens: ['menu', 'item', 'ai-harmonization'] },
  { step: 4, label: 'Montar comanda', screens: ['comanda'] },
  { step: 5, label: 'Acompanhar pedido', screens: ['order-status'] },
  { step: 6, label: 'Fechar conta & pagar', screens: ['fechar-conta', 'payment-success'] },
  { step: 7, label: 'Programa de fidelidade', screens: ['loyalty'] },
  { step: 8, label: 'Reservar mesa', screens: ['reservations'] },
  { step: 9, label: 'Fila virtual', screens: ['virtual-queue'] },
  { step: 10, label: 'Chamar equipe', screens: ['call-waiter'] },
  { step: 11, label: 'Notificações', screens: ['notifications'] },
];

export const SCREEN_INFO: Record<string, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Tela Inicial', desc: 'O cliente descobre restaurantes por proximidade, categoria e avaliação.' },
  'restaurant': { emoji: '🍽️', title: 'Página do Restaurante', desc: 'Perfil completo com fotos, avaliações, features e acesso rápido ao cardápio e reservas.' },
  'menu': { emoji: '📋', title: 'Cardápio Digital', desc: 'Menu digital com categorias, tags de alérgenos, tempo de preparo e harmonização IA.' },
  'item': { emoji: '🍽️', title: 'Detalhe do Prato', desc: 'Detalhe do prato com foto, descrição e adição rápida à comanda.' },
  'comanda': { emoji: '📝', title: 'Minha Comanda', desc: 'Revisão da comanda com ajuste de quantidades e convite de pessoas.' },
  'fechar-conta': { emoji: '💳', title: 'Fechar Conta', desc: 'Fluxo integrado: veja quem está na mesa, convide pessoas, escolha dividir ou pagar tudo, selecione modo de divisão, gorjeta e método de pagamento — tudo em uma tela.' },
  'order-status': { emoji: '👨‍🍳', title: 'Status do Pedido', desc: 'Acompanhamento em tempo real com status individual por item e nome do chef responsável.' },
  'loyalty': { emoji: '🏆', title: 'Fidelidade', desc: 'Programa de pontos com níveis (Silver→Black), recompensas resgatáveis e histórico.' },
  'reservations': { emoji: '📅', title: 'Reservas', desc: 'Reserva com convite de amigos, compartilhamento de link e código de confirmação.' },
  'qr-scan': { emoji: '📷', title: 'QR Code', desc: 'Escaneamento do QR Code da mesa para associação automática.' },
  'call-waiter': { emoji: '🙋', title: 'Chamar Equipe', desc: 'Chamada discreta: garçom, sommelier ou ajuda geral.' },
  'profile': { emoji: '👤', title: 'Perfil', desc: 'Perfil do cliente com histórico, favoritos, nível de fidelidade e configurações.' },
  'virtual-queue': { emoji: '⏱️', title: 'Fila Virtual', desc: 'Fila virtual para restaurantes lotados com acompanhamento em tempo real.' },
  'my-orders': { emoji: '📦', title: 'Meus Pedidos', desc: 'Histórico de pedidos e pedido ativo.' },
  'payment-success': { emoji: '✅', title: 'Pagamento Confirmado', desc: 'Confirmação com pontos ganhos, gorjeta e saldo restante da mesa.' },
  'notifications': { emoji: '🔔', title: 'Notificações', desc: 'Convites para comanda, fila pronta, pontos ganhos, promoções e status de pedidos.' },
  'ai-harmonization': { emoji: '🧠', title: 'Harmonização IA', desc: 'A IA sugere combinações perfeitas de pratos e bebidas baseado em suas preferências.' },
};

// ============ HOME ============

const HomeScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const { restaurant } = useDemoContext();
  return (
    <div className="px-5 pb-4">
      <div className="pt-2 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Boa noite</p>
          <h1 className="font-display text-xl font-bold">Descubra experiências</h1>
        </div>
        <button onClick={() => onNavigate('notifications')} className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <Bell className="w-4.5 h-4.5 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-primary-foreground text-[9px] font-bold flex items-center justify-center">3</span>
        </button>
      </div>
      <GuidedHint text="Toque no restaurante para começar sua jornada" />
      <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3 mb-5">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Buscar restaurantes, pratos...</span>
      </div>
      <div className="flex gap-3 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {['Todos', 'Fine Dining', 'Casual', 'Bar', 'Café'].map((cat, i) => (
          <button key={cat} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
        ))}
      </div>
      <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-5 group">
        <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
          <div className="absolute top-3 right-3"><Heart className="w-5 h-5 text-primary-foreground" /></div>
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1">
            <Zap className="w-3 h-3" />Toque aqui
          </div>
        </div>
      </button>
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { icon: QrCode, label: 'Escanear', screen: 'qr-scan' },
          { icon: CalendarDays, label: 'Reservar', screen: 'reservations' },
          { icon: Timer, label: 'Fila Virtual', screen: 'virtual-queue' },
          { icon: UtensilsCrossed, label: 'Cardápio', screen: 'menu' },
        ].map(({ icon: Icon, label, screen }) => (
          <button key={label} onClick={() => onNavigate(screen)} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>
      <h3 className="font-display font-semibold text-sm mb-3">Perto de você</h3>
      {[
        { name: 'Bistrô Noowe', dist: '350m', cuisine: 'Contemporânea', rating: 4.8, active: true },
        { name: 'Sushi Kenzo', dist: '800m', cuisine: 'Japonesa', rating: 4.6 },
        { name: 'La Pasta Fresca', dist: '1.2km', cuisine: 'Italiana', rating: 4.5 },
      ].map((r, i) => (
        <button key={i} onClick={() => r.active ? onNavigate('restaurant') : undefined} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors mb-1">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg">{['🍽️', '🍣', '🍝'][i]}</div>
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
    </div>
  );
};

// ============ NOTIFICATIONS ============

const NotificationsScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const notifications = [
    { id: 1, type: 'reservation', title: 'Reserva confirmada!', desc: 'Bistrô Noowe · Hoje às 20:00 · 2 pessoas', time: 'Agora', icon: CalendarDays, color: 'bg-success/10 text-success', unread: true },
    { id: 2, type: 'invite', title: 'Maria te convidou!', desc: 'Junte-se à comanda da Mesa 7 no Bistrô Noowe', time: '5 min', icon: UserPlus, color: 'bg-primary/10 text-primary', unread: true, action: 'Aceitar' },
    { id: 3, type: 'queue', title: 'Sua mesa está pronta!', desc: 'Bistrô Noowe · Mesa 12 está disponível', time: '12 min', icon: Timer, color: 'bg-warning/10 text-warning', unread: true },
    { id: 4, type: 'loyalty', title: '+125 pontos ganhos', desc: 'Visita ao Bistrô Noowe · Total: 1.250 pts', time: '2h', icon: Gift, color: 'bg-accent/10 text-accent' },
    { id: 5, type: 'promo', title: '🎉 Happy Hour ativo!', desc: 'Drinks com 30% off até 19h no Bistrô Noowe', time: '3h', icon: Sparkles, color: 'bg-secondary/10 text-secondary' },
    { id: 6, type: 'order', title: 'Seu pedido está pronto!', desc: 'Tartare de Atum e Filé ao Molho de Vinho', time: 'Ontem', icon: ChefHat, color: 'bg-primary/10 text-primary' },
  ];
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="font-display font-bold">Notificações</h1>
        <button className="text-xs text-primary font-medium">Limpar</button>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`p-4 rounded-xl border transition-colors ${n.unread ? 'bg-primary/5 border-primary/15' : 'bg-card border-border'}`}>
            <div className="flex gap-3">
              <div className={`w-10 h-10 rounded-xl ${n.color} flex items-center justify-center shrink-0`}><n.icon className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${n.unread ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>{n.title}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                {n.action && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => onNavigate('my-orders')} className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">{n.action}</button>
                    <button className="px-4 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground">Recusar</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ RESTAURANT ============

const RestaurantScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const { restaurant } = useDemoContext();
  return (
    <div className="pb-4">
      <div className="relative h-52">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent" />
        <button onClick={() => onNavigate('home')} className="absolute top-2 left-4 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
      </div>
      <div className="px-5 -mt-8 relative">
        <h1 className="font-display text-2xl font-bold mb-1">{restaurant.name}</h1>
        <p className="text-sm text-muted-foreground mb-3">{restaurant.description}</p>
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="font-semibold">{restaurant.rating}</span><span className="text-muted-foreground">({restaurant.reviewCount})</span></div>
          <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /><span>350m</span></div>
          <span className="text-muted-foreground">{restaurant.priceRange}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4"><Clock className="w-3.5 h-3.5" /><span>{restaurant.hours}</span></div>
        <div className="flex flex-wrap gap-2 mb-5">
          {restaurant.features.map(f => (<span key={f} className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">{f}</span>))}
        </div>
        <GuidedHint text="Explore o cardápio ou faça uma reserva" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => onNavigate('menu')} className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"><UtensilsCrossed className="w-4 h-4" />Ver Cardápio</button>
          <button onClick={() => onNavigate('reservations')} className="py-3 rounded-xl border border-border font-semibold text-sm flex items-center justify-center gap-2"><CalendarDays className="w-4 h-4" />Reservar Mesa</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => onNavigate('qr-scan')} className="py-2.5 rounded-xl bg-muted text-xs font-medium flex flex-col items-center gap-1"><QrCode className="w-4 h-4 text-primary" />Escanear QR</button>
          <button onClick={() => onNavigate('virtual-queue')} className="py-2.5 rounded-xl bg-muted text-xs font-medium flex flex-col items-center gap-1"><Timer className="w-4 h-4 text-primary" />Fila Virtual</button>
          <button onClick={() => onNavigate('call-waiter')} className="py-2.5 rounded-xl bg-muted text-xs font-medium flex flex-col items-center gap-1"><HandMetal className="w-4 h-4 text-primary" />Chamar Garçom</button>
        </div>
      </div>
    </div>
  );
};

// ============ QR SCAN ============

const QRScanScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const [scanned, setScanned] = useState(false);
  useEffect(() => { if (!scanned) { const t = setTimeout(() => setScanned(true), 2500); return () => clearTimeout(t); } }, [scanned]);
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="font-display font-bold">Escanear QR Code</h1>
        <div className="w-8" />
      </div>
      {!scanned ? (
        <div className="text-center">
          <div className="relative w-56 h-56 mx-auto mb-6 rounded-3xl border-2 border-primary/30 flex items-center justify-center bg-foreground/5">
            <div className="absolute inset-4 border-2 border-primary rounded-2xl" />
            <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
            <div className="absolute left-6 right-6 h-0.5 bg-primary animate-bounce" />
            <Camera className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">Aponte para o QR Code da mesa</p>
          <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto mt-3" />
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-success" /></div>
          <h2 className="font-display text-xl font-bold mb-2">Mesa 7 identificada!</h2>
          <p className="text-sm text-muted-foreground mb-1">Bistrô Noowe</p>
          <p className="text-xs text-muted-foreground mb-6">Você está acomodado na Mesa 7 · 4 lugares</p>
          <div className="space-y-3">
            <button onClick={() => onNavigate('menu')} className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2"><UtensilsCrossed className="w-4 h-4" />Abrir Cardápio</button>
            <button onClick={() => onNavigate('call-waiter')} className="w-full py-3.5 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2"><HandMetal className="w-4 h-4" />Chamar Garçom</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ CALL WAITER ============

const CallWaiterScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const [called, setCalled] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const handleCall = (type: string) => { setCalled(type); setTimeout(() => setConfirmed(true), 1500); };
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="font-display font-bold">Chamar Equipe</h1>
        <div className="w-8" />
      </div>
      {!confirmed ? (
        <>
          <p className="text-sm text-muted-foreground mb-5">Mesa 7 · Bistrô Noowe</p>
          <div className="space-y-3">
            {[
              { type: 'waiter', icon: HandMetal, label: 'Chamar Garçom', desc: 'Dúvidas sobre pratos, pedidos especiais', color: 'bg-primary/10 text-primary' },
              { type: 'sommelier', icon: Wine, label: 'Chamar Sommelier', desc: 'Harmonização de vinhos e drinks', color: 'bg-secondary/10 text-secondary' },
              { type: 'help', icon: HelpCircle, label: 'Preciso de Ajuda', desc: 'Acessibilidade, limpeza, outros', color: 'bg-muted text-muted-foreground' },
            ].map(({ type, icon: Icon, label, desc, color }) => (
              <button key={type} onClick={() => handleCall(type)} disabled={called !== null} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-all text-left disabled:opacity-50">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
                <div className="flex-1"><p className="font-semibold text-sm">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                {called === type && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-success" /></div>
          <h2 className="font-display text-xl font-bold mb-2">Chamado enviado!</h2>
          <p className="text-sm text-muted-foreground mb-1">
            {called === 'waiter' && 'O garçom está a caminho da sua mesa.'}
            {called === 'sommelier' && 'O sommelier está a caminho.'}
            {called === 'help' && 'Alguém da equipe irá atendê-lo.'}
          </p>
          <p className="text-xs text-muted-foreground mb-6">Tempo estimado: ~2 min</p>
          <button onClick={() => onNavigate('menu')} className="px-6 py-3 rounded-xl border border-border font-semibold text-sm">Voltar ao Cardápio</button>
        </div>
      )}
    </div>
  );
};

// ============ VIRTUAL QUEUE ============

const VirtualQueueScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const [joined, setJoined] = useState(false);
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="font-display font-bold">Fila Virtual</h1>
        <div className="w-8" />
      </div>
      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 mb-5">
        <span className="text-2xl">🍽️</span>
        <div><p className="font-semibold text-sm">Bistrô Noowe</p><p className="text-xs text-muted-foreground">Lotação atual: <span className="text-warning font-semibold">Alta</span></p></div>
      </div>
      {!joined ? (
        <>
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-3"><Timer className="w-8 h-8 text-warning" /></div>
            <h2 className="font-display text-lg font-bold">3 grupos na fila</h2>
            <p className="text-sm text-muted-foreground">Espera estimada: ~25 min</p>
          </div>
          <div className="space-y-4 mb-6">
            <div><label className="text-sm font-semibold mb-2 block">Quantas pessoas?</label><div className="flex gap-2">{[1, 2, 3, 4, '5+'].map((n, i) => (<button key={n} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${i === 1 ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>{n}</button>))}</div></div>
            <div><label className="text-sm font-semibold mb-2 block">Preferência</label><div className="flex gap-2">{['Salão', 'Terraço', 'Qualquer'].map((p, i) => (<button key={p} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${i === 2 ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>{p}</button>))}</div></div>
          </div>
          <button onClick={() => setJoined(true)} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow">Entrar na Fila Virtual</button>
        </>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><Timer className="w-8 h-8 text-primary" /></div>
          <h2 className="font-display text-xl font-bold mb-1">Você está na fila!</h2>
          <p className="text-sm text-muted-foreground mb-5">Posição: <span className="font-bold text-foreground">4º</span> · Espera: ~25 min</p>
          <div className="space-y-2 mb-6">
            {[{ pos: 1, name: 'Mesa para 4', wait: '5 min' }, { pos: 2, name: 'Mesa para 2', wait: '12 min' }, { pos: 3, name: 'Mesa para 6', wait: '18 min' }, { pos: 4, name: 'Você · Mesa para 2', wait: '~25 min', isYou: true }].map((item) => (
              <div key={item.pos} className={`flex items-center gap-3 p-3 rounded-xl ${item.isYou ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${item.isYou ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{item.pos}</span>
                <span className="flex-1 text-sm text-left">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.wait}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-4">📲 Você receberá uma notificação quando sua mesa estiver pronta</p>
          <button onClick={() => onNavigate('menu')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Ver Cardápio Enquanto Espera</button>
        </div>
      )}
    </div>
  );
};

// ============ PROFILE ============

const ProfileScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const { loyaltyPoints } = useDemoContext();
  return (
    <div className="px-5 pb-4">
      <div className="py-4"><h1 className="font-display text-xl font-bold">Meu Perfil</h1></div>
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 mb-5">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-6 h-6 text-primary" /></div>
        <div className="flex-1"><h2 className="font-semibold">Usuário Demo</h2><p className="text-xs text-muted-foreground">demo@noowe.com.br</p></div>
        <div className="text-right"><p className="font-display font-bold text-primary">{loyaltyPoints.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">pontos</p></div>
      </div>
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 mb-5">
        <div className="flex items-center gap-2 mb-2"><Crown className="w-4 h-4 text-accent" /><span className="text-sm font-semibold">Nível Gold</span></div>
        <div className="h-1.5 bg-muted rounded-full"><div className="h-full bg-accent rounded-full" style={{ width: '62%' }} /></div>
        <p className="text-[10px] text-muted-foreground mt-1">750 pontos para Platinum</p>
      </div>
      <div className="space-y-1">
        {[
          { icon: Bell, label: 'Notificações', screen: 'notifications', badge: 3 },
          { icon: History, label: 'Histórico de Visitas', screen: 'my-orders' },
          { icon: CalendarDays, label: 'Minhas Reservas', screen: 'reservations' },
          { icon: Gift, label: 'Programa de Fidelidade', screen: 'loyalty' },
          { icon: CreditCard, label: 'Métodos de Pagamento' },
          { icon: Heart, label: 'Restaurantes Favoritos' },
          { icon: Settings, label: 'Configurações' },
          { icon: HelpCircle, label: 'Ajuda & Suporte' },
        ].map(({ icon: Icon, label, screen, badge }) => (
          <button key={label} onClick={() => screen ? onNavigate(screen) : undefined} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-left">{label}</span>
            {badge && <span className="w-5 h-5 rounded-full bg-destructive text-primary-foreground text-[10px] font-bold flex items-center justify-center">{badge}</span>}
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          </button>
        ))}
      </div>
      <button className="w-full flex items-center gap-3 p-3 rounded-xl text-destructive hover:bg-destructive/5 transition-colors mt-4"><LogOut className="w-5 h-5" /><span className="text-sm">Sair</span></button>
    </div>
  );
};

// ============ MY ORDERS ============

const MyOrdersScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const { clientActiveOrder } = useDemoContext();
  return (
    <div className="px-5 pb-4">
      <div className="py-4"><h1 className="font-display text-xl font-bold">Meus Pedidos</h1></div>
      {clientActiveOrder && (
        <>
          <GuidedHint text="Você tem um pedido ativo! Toque para acompanhar" />
          <button onClick={() => onNavigate('order-status')} className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-3 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Pedido ativo</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                {clientActiveOrder.status === 'preparing' ? 'Preparando' : clientActiveOrder.status === 'ready' ? 'Pronto!' : 'Em andamento'}
              </span>
            </div>
            <p className="text-sm font-semibold">Bistrô Noowe · Mesa 7</p>
            <p className="text-xs text-muted-foreground">{clientActiveOrder.items.length} itens · R$ {clientActiveOrder.total}</p>
            <div className="flex items-center gap-1 mt-2 text-primary text-xs font-medium"><span>Acompanhar</span><ArrowRight className="w-3 h-3" /></div>
          </button>
        </>
      )}
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Últimas visitas</h3>
      {[
        { restaurant: 'Bistrô Noowe', date: 'Hoje', total: 'R$ 186', items: 3, rating: 5 },
        { restaurant: 'Bistrô Noowe', date: 'Há 3 dias', total: 'R$ 312', items: 5, rating: 4 },
        { restaurant: 'Sushi Kenzo', date: 'Há 1 semana', total: 'R$ 248', items: 4, rating: 5 },
      ].map((order, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 mb-1">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-lg">{i < 2 ? '🍽️' : '🍣'}</div>
          <div className="flex-1"><p className="text-sm font-semibold">{order.restaurant}</p><p className="text-xs text-muted-foreground">{order.date} · {order.items} itens</p></div>
          <div className="text-right">
            <p className="text-sm font-display font-bold">{order.total}</p>
            <div className="flex gap-0.5 justify-end">{Array.from({ length: 5 }).map((_, s) => (<Star key={s} className={`w-2.5 h-2.5 ${s < order.rating ? 'text-accent fill-accent' : 'text-muted'}`} />))}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============ MENU ============

const MenuScreen: React.FC<{ onNavigate: (s: string) => void; onSelectItem: (item: DemoMenuItem) => void }> = ({ onNavigate, onSelectItem }) => {
  const { menu, cart } = useDemoContext();
  const categories = [...new Set(menu.map(m => m.category))];
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  return (
    <div className="pb-4">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 px-5 pb-3 pt-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => onNavigate('restaurant')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="font-display font-bold">Cardápio</h1>
          <button onClick={() => onNavigate('comanda')} className="relative w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Receipt className="w-4 h-4" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{cartCount}</span>}
          </button>
        </div>
        <div className="flex gap-2 mb-3">
          <button onClick={() => onNavigate('call-waiter')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium"><HandMetal className="w-3 h-3 text-primary" />Chamar Garçom</button>
          <button onClick={() => onNavigate('ai-harmonization')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-xs font-medium border border-primary/20"><Brain className="w-3 h-3 text-primary" />Harmonização IA</button>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>))}
        </div>
      </div>
      {cartCount === 0 && <div className="px-5"><GuidedHint text="Toque em um prato para ver detalhes e adicionar à comanda" /></div>}
      <div className="px-5 space-y-3 mt-2">
        {menu.filter(m => m.category === activeCategory).map(item => (
          <button key={item.id} onClick={() => onSelectItem(item)} className="w-full flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left">
            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
                {item.popular && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold shrink-0">Popular</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-display font-bold text-sm">R$ {item.price}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" /><span>{item.prepTime}min</span></div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {cartCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4" style={{ maxWidth: 345, margin: '0 auto' }}>
          <button onClick={() => onNavigate('comanda')} className="w-full flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-glow">
            <span className="flex items-center gap-2"><Receipt className="w-4 h-4" />Ver Comanda ({cartCount})</span>
            <span className="font-display">R$ {cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ============ AI HARMONIZATION ============

const AIHarmonizationScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const [step, setStep] = useState<'preferences' | 'loading' | 'results'>('preferences');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(['Vinho Tinto']);
  const togglePref = (p: string) => setSelectedPrefs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  useEffect(() => { if (step === 'loading') { const t = setTimeout(() => setStep('results'), 2000); return () => clearTimeout(t); } }, [step]);

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="font-display font-bold flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />Harmonização IA</h1>
        <div className="w-8" />
      </div>
      {step === 'preferences' && (
        <>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3"><Sparkles className="w-8 h-8 text-primary" /></div>
            <h2 className="font-display text-lg font-bold mb-1">Deixe a IA montar sua experiência</h2>
            <p className="text-xs text-muted-foreground">Selecione suas preferências e nossa IA sugerirá a combinação perfeita</p>
          </div>
          <div className="mb-5">
            <label className="text-sm font-semibold mb-3 block">Preferência de bebida</label>
            <div className="flex flex-wrap gap-2">
              {['Vinho Tinto', 'Vinho Branco', 'Espumante', 'Cerveja', 'Cocktail', 'Sem álcool'].map(p => (
                <button key={p} onClick={() => togglePref(p)} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${selectedPrefs.includes(p) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <label className="text-sm font-semibold mb-3 block">Restrições alimentares</label>
            <div className="flex flex-wrap gap-2">
              {['Nenhuma', 'Vegetariano', 'Vegano', 'Sem glúten', 'Sem lactose'].map((p, i) => (
                <button key={p} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${i === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <label className="text-sm font-semibold mb-3 block">Ocasião</label>
            <div className="flex flex-wrap gap-2">
              {['Jantar casual', 'Encontro romântico', 'Negócios', 'Aniversário', 'Com amigos'].map((p, i) => (
                <button key={p} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${i === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{p}</button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep('loading')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-semibold text-sm shadow-glow flex items-center justify-center gap-2"><Brain className="w-4 h-4" />Gerar Harmonização</button>
        </>
      )}
      {step === 'loading' && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-5 animate-pulse"><Brain className="w-10 h-10 text-primary" /></div>
          <h2 className="font-display text-lg font-bold mb-2">Analisando combinações...</h2>
          <p className="text-xs text-muted-foreground mb-4">Nossa IA está avaliando 430+ combinações</p>
          <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
        </div>
      )}
      {step === 'results' && (
        <>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Harmonização Perfeita</span>
              <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-bold">98% match</span>
            </div>
            <p className="text-xs text-muted-foreground">Baseado nas suas preferências</p>
          </div>
          <div className="space-y-3 mb-5">
            {[
              { course: 'Entrada', name: 'Tartare de Atum', desc: 'Notas cítricas que preparam o paladar', price: 58, icon: Leaf },
              { course: 'Principal', name: 'Filé ao Molho de Vinho', desc: 'Harmoniza com taninos encorpados', price: 118, icon: Flame },
              { course: 'Vinho', name: 'Malbec Reserva 2019', desc: 'Argentino, frutado com taninos macios', price: 89, icon: Wine },
              { course: 'Sobremesa', name: 'Crème Brûlée', desc: 'Finaliza com doçura equilibrada', price: 38, icon: Star },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><item.icon className="w-4 h-4 text-primary" /></div>
                  <div className="flex-1">
                    <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">{item.course}</p>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  </div>
                  <span className="font-display font-bold text-sm text-foreground">R$ {item.price}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-10">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between mb-1"><span className="text-sm text-muted-foreground">Total sugerido</span><span className="font-display font-bold text-lg text-foreground">R$ 303</span></div>
          </div>
          <div className="space-y-2">
            <button onClick={() => onNavigate('menu')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow">Adicionar Tudo à Comanda</button>
            <button onClick={() => onNavigate('menu')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm text-muted-foreground">Escolher Manualmente</button>
          </div>
        </>
      )}
    </div>
  );
};

// ============ ITEM DETAIL ============

const ItemDetailScreen: React.FC<{ item: DemoMenuItem; onNavigate: (s: string) => void }> = ({ item, onNavigate }) => {
  const { addToCart } = useDemoContext();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const handleAdd = () => { addToCart(item, quantity); setAdded(true); setTimeout(() => onNavigate('menu'), 800); };
  return (
    <div className="pb-4">
      <div className="relative h-56">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <button onClick={() => onNavigate('menu')} className="absolute top-2 left-4 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
      </div>
      <div className="px-5 -mt-6 relative">
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <div className="flex items-start justify-between mb-2">
            <h1 className="font-display text-xl font-bold">{item.name}</h1>
            {item.popular && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Popular</span>}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
          {item.tags && <div className="flex gap-2 mb-3">{item.tags.map(tag => (<span key={tag} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">{tag}</span>))}</div>}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5"><Clock className="w-4 h-4" /><span>Preparo: {item.prepTime} min</span></div>
          <div className="flex items-center justify-between mb-5">
            <span className="font-display text-2xl font-bold">R$ {item.price}</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-full border border-border flex items-center justify-center"><Minus className="w-4 h-4" /></button>
              <span className="font-display font-bold text-lg w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <button onClick={handleAdd} disabled={added} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow disabled:opacity-70 flex items-center justify-center gap-2">
            {added ? <><Check className="w-4 h-4" /> Adicionado!</> : <>Adicionar · R$ {item.price * quantity}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ COMANDA ============

const ComandaScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal } = useDemoContext();
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="font-display font-bold">Minha Comanda</h1>
        <div className="w-8" />
      </div>
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Sua comanda está vazia</p>
          <button onClick={() => onNavigate('menu')} className="mt-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Ver Cardápio</button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 mb-4">
            <span className="text-2xl">🍽️</span>
            <div className="flex-1"><p className="font-semibold text-sm">Bistrô Noowe</p><p className="text-xs text-muted-foreground">Mesa 7 · Fine Dining</p></div>
          </div>
          <GuidedHint text="Revise seus itens e feche a conta quando quiser" pulse={false} />
          {cart.map((item) => (
            <div key={item.menuItem.id} className="flex items-center gap-3 py-3 border-b border-border">
              <img src={item.menuItem.image} alt={item.menuItem.name} className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.menuItem.name}</p>
                <p className="text-xs text-muted-foreground">R$ {item.menuItem.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => item.quantity === 1 ? removeFromCart(item.menuItem.id) : updateCartQuantity(item.menuItem.id, item.quantity - 1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
          <button className="w-full mt-4 p-3 rounded-xl border border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <UserPlus className="w-4 h-4" /><span className="text-xs font-medium">Convidar pessoas para a comanda</span>
          </button>
          <div className="mt-5 p-4 rounded-xl bg-muted/30">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">R$ {cartTotal}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Taxa de serviço (10%)</span><span className="font-medium">R$ {Math.round(cartTotal * 0.1)}</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg"><span>Total</span><span>R$ {Math.round(cartTotal * 1.1)}</span></div>
          </div>
          <div className="space-y-2 mt-4">
            <button onClick={() => onNavigate('fechar-conta')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-semibold text-sm shadow-glow flex items-center justify-center gap-2"><CreditCard className="w-4 h-4" />Fechar Conta</button>
            <button onClick={() => onNavigate('menu')} className="w-full py-3 border border-border rounded-xl text-sm font-medium text-muted-foreground">Adicionar mais itens</button>
          </div>
        </>
      )}
    </div>
  );
};

// ============ ORDER STATUS ============

const OrderStatusScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const [elapsedMin, setElapsedMin] = useState(8);
  useEffect(() => { const i = setInterval(() => setElapsedMin(p => p + 1), 30000); return () => clearInterval(i); }, []);
  const orderItems = [
    { name: 'Tartare de Atum', status: 'ready' as const, chef: 'Chef Marco', time: '12 min' },
    { name: 'Filé ao Molho de Vinho', status: 'preparing' as const, chef: 'Chef Ana', time: '~8 min' },
    { name: 'Crème Brûlée', status: 'pending' as const, chef: 'Pâtissier', time: '~20 min' },
  ];
  const statusConfig = {
    ready: { label: 'Pronto', color: 'bg-success text-primary-foreground', icon: CheckCircle },
    preparing: { label: 'Preparando', color: 'bg-warning text-primary-foreground', icon: ChefHat },
    pending: { label: 'Na fila', color: 'bg-muted text-muted-foreground', icon: Clock },
  };
  return (
    <div className="pb-4">
      <div className="bg-gradient-to-br from-primary to-accent p-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => onNavigate('my-orders')} className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center"><ArrowLeft className="w-4 h-4 text-primary-foreground" /></button>
          <span className="text-xs text-primary-foreground/70 font-medium">Pedido #2847</span>
          <button onClick={() => onNavigate('call-waiter')} className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center"><HandMetal className="w-4 h-4 text-primary-foreground" /></button>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3 animate-pulse"><ChefHat className="w-8 h-8 text-primary-foreground" /></div>
          <h1 className="text-xl font-bold text-primary-foreground mb-1">Preparando seu pedido</h1>
          <p className="text-sm text-primary-foreground/70">{elapsedMin} min decorridos · ETA ~15 min</p>
        </div>
      </div>
      <div className="px-5 -mt-4">
        <div className="bg-card rounded-2xl p-4 shadow-md border border-border mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2"><span>Recebido</span><span>Preparando</span><span>Pronto</span><span>Entregue</span></div>
          <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: '55%' }} /></div>
        </div>
      </div>
      <div className="px-5">
        <h2 className="font-semibold text-sm mb-3">Itens do pedido</h2>
        <div className="space-y-2">
          {orderItems.map((item, i) => {
            const config = statusConfig[item.status];
            const Icon = config.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <div className={`w-9 h-9 rounded-lg ${config.color} flex items-center justify-center`}><Icon className="w-4 h-4" /></div>
                <div className="flex-1"><p className="text-sm font-medium text-foreground">{item.name}</p><p className="text-xs text-muted-foreground">{item.chef} · {item.time}</p></div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${item.status === 'ready' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{config.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-5 p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <div className="flex-1"><p className="text-sm font-semibold">Mesa 7 · 3 pessoas</p><p className="text-xs text-muted-foreground">Você, Maria e João</p></div>
          <button onClick={() => onNavigate('fechar-conta')} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">Fechar Conta</button>
        </div>
      </div>
    </div>
  );
};

// ============ FECHAR CONTA ============

const FecharContaScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const [payMode, setPayMode] = useState<'solo' | 'split'>('split');
  const [splitMode, setSplitMode] = useState<'individual' | 'equal' | 'selective' | 'fixed'>('individual');
  const [selectedPayment, setSelectedPayment] = useState('pix');
  const [tipPercent, setTipPercent] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>(['i1', 'i2']);
  const [sharedItems, setSharedItems] = useState<string[]>(['i7']);
  const [fixedAmount, setFixedAmount] = useState(200);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const orderItems = [
    { id: 'i1', name: 'Tartare de Atum', price: 58, orderedBy: 'Você' },
    { id: 'i2', name: 'Filé ao Molho de Vinho', price: 118, orderedBy: 'Você' },
    { id: 'i3', name: 'Risoto de Funghi', price: 82, orderedBy: 'Maria' },
    { id: 'i4', name: 'Crème Brûlée', price: 38, orderedBy: 'Maria' },
    { id: 'i5', name: 'Salmão Grelhado', price: 96, orderedBy: 'João' },
    { id: 'i6', name: 'Gin Tônica Aurora', price: 38, orderedBy: 'João' },
    { id: 'i7', name: 'Batata Truffle Fries', price: 45, orderedBy: 'Mesa' },
  ];

  const guests = [
    { id: 'you', name: 'Você', role: 'Anfitrião', paid: false, items: ['i1', 'i2'] },
    { id: 'maria', name: 'Maria Silva', role: 'Convidada', paid: true, items: ['i3', 'i4'] },
    { id: 'joao', name: 'João Santos', role: 'Convidado', paid: false, items: ['i5', 'i6'] },
  ];

  const unpaidGuests = guests.filter(g => !g.paid);
  const totalOrder = orderItems.reduce((s, i) => s + i.price, 0);
  const serviceCharge = Math.round(totalOrder * 0.1);
  const totalWithService = totalOrder + serviceCharge;
  const paidByOthers = 120;
  const sharedTotal = orderItems.filter(i => sharedItems.includes(i.id)).reduce((s, i) => s + i.price, 0);
  const mySharedPortion = sharedTotal / guests.length;

  const calculateMyAmount = () => {
    if (payMode === 'solo') return totalWithService - paidByOthers;
    switch (splitMode) {
      case 'individual': {
        const myItems = orderItems.filter(i => i.orderedBy === 'Você' && !sharedItems.includes(i.id));
        const myDirect = myItems.reduce((s, i) => s + i.price, 0);
        return myDirect + mySharedPortion + Math.round((myDirect + mySharedPortion) * 0.1);
      }
      case 'equal': return Math.round((totalWithService - paidByOthers) / unpaidGuests.length);
      case 'selective': {
        const directTotal = selectedItems.filter(id => !sharedItems.includes(id)).reduce((sum, itemId) => {
          const item = orderItems.find(i => i.id === itemId);
          return sum + (item ? item.price : 0);
        }, 0);
        return directTotal + mySharedPortion;
      }
      case 'fixed': return Math.min(fixedAmount, totalWithService - paidByOthers);
      default: return 0;
    }
  };

  const mySubtotal = calculateMyAmount();
  const myTip = Math.round(mySubtotal * tipPercent / 100);
  const myTotal = mySubtotal + myTip;

  const toggleItem = (itemId: string) => {
    if (sharedItems.includes(itemId)) return;
    setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  const toggleShared = (itemId: string) => {
    setSharedItems(prev => {
      if (prev.includes(itemId)) return prev.filter(id => id !== itemId);
      setSelectedItems(si => si.filter(id => id !== itemId));
      return [...prev, itemId];
    });
    setExpandedItem(null);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-gradient-to-r from-primary to-accent px-5 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('comanda')} className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-primary-foreground" /></button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary-foreground">Fechar Conta</h1>
            <p className="text-xs text-primary-foreground/70">Mesa 7 · Bistrô Noowe</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary-foreground">R$ {totalWithService}</p>
            <p className="text-[10px] text-primary-foreground/70">Total da mesa</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* People at the table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground text-sm flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Na mesa</h2>
            <button onClick={() => setShowInvite(!showInvite)} className="text-xs text-primary font-medium flex items-center gap-1"><UserPlus className="w-3 h-3" />Convidar</button>
          </div>
          {showInvite && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 mb-3">
              <p className="text-xs text-muted-foreground mb-3">Convide alguém para se juntar à comanda</p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border mb-2">
                <Share2 className="w-4 h-4 text-primary" />
                <span className="flex-1 text-xs text-muted-foreground">noowe.app/join/BN-7-2847</span>
                <button className="p-1.5 rounded-md bg-primary/10"><Copy className="w-3 h-3 text-primary" /></button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setInviteSent(true); setTimeout(() => setShowInvite(false), 1000); }} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1">
                  {inviteSent ? <><Check className="w-3 h-3" />Enviado!</> : <><Send className="w-3 h-3" />SMS</>}
                </button>
                <button className="flex-1 py-2 rounded-lg border border-border text-xs font-medium flex items-center justify-center gap-1"><MessageCircle className="w-3 h-3" />WhatsApp</button>
              </div>
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {guests.map((guest) => (
              <div key={guest.id} className={`flex-shrink-0 p-3 rounded-2xl border-2 min-w-[90px] text-center ${guest.paid ? 'border-success bg-success/5' : guest.id === 'you' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                <div className={`w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center text-primary-foreground font-bold text-sm ${guest.paid ? 'bg-success' : guest.id === 'you' ? 'bg-primary' : 'bg-muted text-muted-foreground'}`}>
                  {guest.paid ? <Check className="w-4 h-4" /> : guest.name.charAt(0)}
                </div>
                <p className="text-xs font-medium text-foreground truncate">{guest.name.split(' ')[0]}</p>
                <p className={`text-[10px] ${guest.paid ? 'text-success font-semibold' : 'text-muted-foreground'}`}>{guest.paid ? '✓ Pago' : guest.role}</p>
              </div>
            ))}
            <button onClick={() => setShowInvite(true)} className="flex-shrink-0 w-[90px] p-3 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <UserPlus className="w-5 h-5 mb-1" /><span className="text-[10px]">Convidar</span>
            </button>
          </div>
        </div>

        {/* Pay mode */}
        <div>
          <h2 className="font-semibold text-foreground text-sm mb-3">Como deseja pagar?</h2>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setPayMode('solo')} className={`p-3 rounded-2xl border-2 text-center transition-all ${payMode === 'solo' ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
              <User className={`w-5 h-5 mx-auto mb-1 ${payMode === 'solo' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`text-xs font-semibold ${payMode === 'solo' ? 'text-primary' : 'text-foreground'}`}>Pagar Tudo</p>
              <p className="text-[10px] text-muted-foreground">Você paga a conta toda</p>
            </button>
            <button onClick={() => setPayMode('split')} className={`p-3 rounded-2xl border-2 text-center transition-all ${payMode === 'split' ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
              <Users className={`w-5 h-5 mx-auto mb-1 ${payMode === 'split' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`text-xs font-semibold ${payMode === 'split' ? 'text-primary' : 'text-foreground'}`}>Dividir Conta</p>
              <p className="text-[10px] text-muted-foreground">Cada um paga sua parte</p>
            </button>
          </div>
        </div>

        {/* Split modes */}
        {payMode === 'split' && (
          <div>
            <h2 className="font-semibold text-foreground text-sm mb-3">Modo de divisão</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'individual' as const, name: 'Meus Itens', desc: 'Cada um paga o que pediu', icon: User },
                { id: 'equal' as const, name: 'Partes Iguais', desc: 'Divide igualmente', icon: Users },
                { id: 'selective' as const, name: 'Por Item', desc: 'Escolha itens específicos', icon: Check },
                { id: 'fixed' as const, name: 'Valor Fixo', desc: 'Defina quanto pagar', icon: DollarSign },
              ].map((mode) => (
                <button key={mode.id} onClick={() => setSplitMode(mode.id)} className={`p-3 rounded-2xl border-2 text-left transition-all ${splitMode === mode.id ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <mode.icon className={`w-4 h-4 ${splitMode === mode.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`font-semibold text-xs ${splitMode === mode.id ? 'text-primary' : 'text-foreground'}`}>{mode.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selective items */}
        {payMode === 'split' && splitMode === 'selective' && (
          <div>
            <h2 className="font-semibold text-foreground text-sm mb-3">Selecione os itens que você paga</h2>
            {sharedTotal > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20 mb-3">
                <Users className="w-4 h-4 text-accent shrink-0" />
                <p className="text-[10px] text-muted-foreground">Itens compartilhados: <span className="text-accent font-semibold">R$ {(sharedTotal / guests.length).toFixed(2)}/pessoa</span></p>
              </div>
            )}
            <div className="space-y-2">
              {orderItems.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                const isShared = sharedItems.includes(item.id);
                const guest = guests.find(g => g.paid && g.items.includes(item.id));
                const isPaid = !!guest;
                const isExpanded = expandedItem === item.id;
                return (
                  <div key={item.id} className={`rounded-xl border-2 transition-all overflow-hidden ${isPaid ? 'border-success/30 bg-success/5 opacity-60' : isShared ? 'border-accent bg-accent/5' : isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                    <button onClick={() => { if (isPaid) return; if (isShared) { setExpandedItem(isExpanded ? null : item.id); return; } toggleItem(item.id); }}
                      onContextMenu={(e) => { e.preventDefault(); if (!isPaid) setExpandedItem(isExpanded ? null : item.id); }}
                      className="w-full p-3 flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isPaid ? 'border-success bg-success' : isShared ? 'border-accent bg-accent' : isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                        {(isSelected || isPaid) && <Check className="w-3 h-3 text-primary-foreground" />}
                        {isShared && <Users className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          {isShared && <span className="px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-[9px] font-semibold">÷ todos</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{isPaid ? `${item.orderedBy} · Pago` : isShared ? `R$ ${(item.price / guests.length).toFixed(2)}/pessoa` : item.orderedBy}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">R$ {item.price}</span>
                        {!isPaid && (
                          <button onClick={(e) => { e.stopPropagation(); setExpandedItem(isExpanded ? null : item.id); }} className="p-1 rounded-lg hover:bg-muted transition-colors">
                            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                    </button>
                    {isExpanded && !isPaid && (
                      <div className="px-3 pb-3 pt-1 border-t border-border/50">
                        <button onClick={() => toggleShared(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isShared ? 'bg-accent/10 border border-accent/30' : 'bg-muted/50 border border-transparent hover:border-accent/30'}`}>
                          <Users className={`w-4 h-4 ${isShared ? 'text-accent' : 'text-muted-foreground'}`} />
                          <div className="flex-1 text-left">
                            <p className={`text-xs font-semibold ${isShared ? 'text-accent' : 'text-foreground'}`}>Dividir por todos</p>
                            <p className="text-[10px] text-muted-foreground">R$ {(item.price / guests.length).toFixed(2)} p/ cada ({guests.length} pessoas)</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isShared ? 'border-accent bg-accent' : 'border-muted-foreground/30'}`}>
                            {isShared && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fixed amount */}
        {payMode === 'split' && splitMode === 'fixed' && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Quanto deseja pagar?</p>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setFixedAmount(Math.max(10, fixedAmount - 10))} className="w-12 h-12 rounded-full bg-muted text-xl font-bold text-muted-foreground">−</button>
              <span className="text-3xl font-bold text-foreground">R$ {fixedAmount}</span>
              <button onClick={() => setFixedAmount(Math.min(totalWithService, fixedAmount + 10))} className="w-12 h-12 rounded-full bg-muted text-xl font-bold text-muted-foreground">+</button>
            </div>
          </div>
        )}

        {/* Tip */}
        <div>
          <h2 className="font-semibold text-foreground text-sm mb-3">Gorjeta</h2>
          <div className="flex gap-2">
            {[0, 10, 15, 20].map((p) => (
              <button key={p} onClick={() => setTipPercent(p)} className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${tipPercent === p ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'}`}>
                {p === 0 ? 'Sem' : `${p}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <h2 className="font-semibold text-foreground text-sm mb-3">Forma de pagamento</h2>
          <div className="grid grid-cols-3 gap-2">
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
        </div>

        {/* Summary */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-foreground mb-3">Resumo</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Sua parte</span><span className="text-foreground">R$ {mySubtotal.toFixed(2)}</span></div>
            {payMode === 'split' && sharedTotal > 0 && (
              <div className="flex justify-between text-accent"><span className="flex items-center gap-1"><Users className="w-3 h-3" />Itens compartilhados</span><span>R$ {mySharedPortion.toFixed(2)}</span></div>
            )}
            {tipPercent > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Gorjeta ({tipPercent}%)</span><span className="text-foreground">R$ {myTip.toFixed(2)}</span></div>}
            {paidByOthers > 0 && <div className="flex justify-between text-success"><span>Pago por outros</span><span>- R$ {paidByOthers.toFixed(2)}</span></div>}
            <div className="border-t border-border pt-2 flex justify-between"><span className="font-semibold text-foreground">Você paga</span><span className="font-bold text-xl text-primary">R$ {myTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-card border-t border-border">
        <button onClick={() => onNavigate('payment-success')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <CreditCard className="w-5 h-5" />Pagar R$ {myTotal.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

// ============ PAYMENT SUCCESS ============

const PaymentSuccessScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => (
  <div className="flex flex-col h-full bg-background">
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30 animate-bounce">
        <Check className="w-12 h-12 text-primary-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Pagamento Confirmado!</h2>
      <p className="text-muted-foreground mb-4">Seu pagamento de <strong className="text-primary">R$ 193,60</strong> foi processado</p>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"><Heart className="w-4 h-4 fill-primary" /><span className="text-sm font-medium">+10% gorjeta para a equipe</span></div>
      <div className="w-full p-4 rounded-2xl bg-card border border-border mb-4">
        <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Pontos ganhos</span><span className="font-bold text-foreground">+19 pts</span></div>
        <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Valor restante da mesa</span><span className="font-bold text-foreground">R$ 97,40</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">João (pendente)</span><span className="font-bold text-warning">Aguardando</span></div>
      </div>
      <div className="w-full p-3 rounded-xl bg-muted/30 mb-4 flex items-center gap-3">
        <Award className="w-5 h-5 text-accent" />
        <div className="flex-1 text-left"><p className="text-sm font-semibold">Nível Gold · 1.269 pts</p><p className="text-xs text-muted-foreground">Faltam 731 pts para Platinum</p></div>
      </div>
      <div className="w-full space-y-3">
        <button onClick={() => onNavigate('loyalty')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-2xl shadow-xl shadow-primary/25 flex items-center justify-center gap-2"><Gift className="w-4 h-4" />Ver Programa de Fidelidade</button>
        <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
      </div>
    </div>
  </div>
);

// ============ RESERVATIONS ============

const ReservationsScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(2);
  const [selectedGuests, setSelectedGuests] = useState(1);

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('restaurant')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="font-display font-bold">Reservar Mesa</h1>
        <div className="w-8" />
      </div>
      {!confirmed ? (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 mb-5"><span className="text-2xl">🍽️</span><div><p className="font-semibold text-sm">Bistrô Noowe</p><p className="text-xs text-muted-foreground">Jardins, São Paulo</p></div></div>
          <GuidedHint text="Selecione data, horário e convidados para reservar" pulse={false} />
          <div className="space-y-4 mb-5">
            <div><label className="text-sm font-semibold mb-2 block">Data</label><div className="flex gap-2">{['Hoje', 'Amanhã', 'Sáb 15', 'Dom 16'].map((d, i) => (<button key={d} onClick={() => setSelectedDate(i)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${i === selectedDate ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>{d}</button>))}</div></div>
            <div><label className="text-sm font-semibold mb-2 block">Horário</label><div className="grid grid-cols-4 gap-2">{['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'].map((t, i) => (<button key={t} onClick={() => i !== 4 ? setSelectedTime(i) : undefined} className={`py-2 rounded-lg text-xs font-medium border transition-colors ${i === selectedTime ? 'border-primary bg-primary/5 text-primary' : i === 4 ? 'border-border text-muted-foreground/30 cursor-not-allowed line-through' : 'border-border text-muted-foreground'}`}>{t}</button>))}</div></div>
            <div><label className="text-sm font-semibold mb-2 block">Convidados</label><div className="flex gap-2">{[1, 2, 3, 4, 5, '6+'].map((n, i) => (<button key={n} onClick={() => setSelectedGuests(i)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${i === selectedGuests ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>{n}</button>))}</div></div>
            <div><label className="text-sm font-semibold mb-2 block">Observações</label><div className="w-full p-3 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground min-h-[50px]">Aniversário de casamento...</div></div>
          </div>
          <button onClick={() => setConfirmed(true)} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow">Confirmar Reserva</button>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-success" /></div>
          <h2 className="font-display text-xl font-bold mb-2">Reserva Confirmada!</h2>
          <p className="text-sm text-muted-foreground mb-1">Bistrô Noowe · Hoje às 20:00</p>
          <p className="text-sm text-muted-foreground mb-4">2 pessoas · Mesa no salão</p>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <p className="text-xs text-muted-foreground">Código de confirmação</p>
            <p className="font-display text-2xl font-bold tracking-widest mt-1">BN-2847</p>
          </div>
          <div className="text-left mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Convidados</h3>
              <button className="text-xs text-primary font-medium flex items-center gap-1"><UserPlus className="w-3 h-3" />Convidar</button>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Você', status: 'confirmed', isHost: true },
                { name: 'Maria Costa', status: 'confirmed', isHost: false },
                { name: 'Convidado pendente', status: 'pending', isHost: false },
              ].map((guest, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm ${guest.status === 'confirmed' ? 'bg-gradient-to-br from-success to-success/80' : 'bg-gradient-to-br from-warning to-warning/80'}`}>{guest.name.charAt(0)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{guest.name}</p>
                      {guest.isHost && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">Anfitrião</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{guest.status === 'confirmed' ? 'Confirmado' : 'Pendente'}</p>
                  </div>
                  {guest.status === 'confirmed' ? <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center"><Check className="h-4 w-4 text-success" /></div> : <button className="p-2 rounded-full bg-primary/10"><Send className="h-3.5 w-3.5 text-primary" /></button>}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-5 flex items-center gap-3">
            <Share2 className="w-5 h-5 text-primary" />
            <div className="flex-1 text-left"><p className="text-sm font-medium">Compartilhar reserva</p><p className="text-xs text-muted-foreground">noowe.app/r/BN-2847</p></div>
            <button className="p-2 rounded-lg bg-primary/10"><Copy className="w-4 h-4 text-primary" /></button>
          </div>
          <div className="space-y-2">
            <button onClick={() => onNavigate('menu')} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">Ver Cardápio</button>
            <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao início</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ LOYALTY ============

const LoyaltyScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const { loyaltyPoints } = useDemoContext();
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="font-display font-bold">Fidelidade</h1>
        <div className="w-8" />
      </div>
      <div className="relative rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-primary-foreground mb-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <Crown className="w-6 h-6 mb-3 opacity-80" />
        <p className="text-xs opacity-70 uppercase tracking-wider mb-1">Seus Pontos</p>
        <p className="font-display text-4xl font-bold">{loyaltyPoints.toLocaleString()}</p>
        <p className="text-xs opacity-70 mt-2">Nível: Gold · próximo nível em 750 pts</p>
        <div className="mt-3 h-1.5 bg-primary-foreground/20 rounded-full"><div className="h-full bg-primary-foreground rounded-full" style={{ width: '62%' }} /></div>
      </div>
      <div className="flex gap-2 mb-5">
        {[{ name: 'Silver', active: false }, { name: 'Gold', active: true }, { name: 'Platinum' }, { name: 'Black' }].map(tier => (
          <div key={tier.name} className={`flex-1 text-center py-2 rounded-lg text-[10px] font-semibold ${tier.active ? 'bg-accent/20 text-accent-foreground ring-1 ring-accent' : 'bg-muted text-muted-foreground'}`}>{tier.name}</div>
        ))}
      </div>
      <h3 className="font-display font-semibold text-sm mb-3">Recompensas</h3>
      {[{ name: 'Sobremesa grátis', points: 500, emoji: '🍰' }, { name: 'Drink da casa', points: 800, emoji: '🍸' }, { name: 'Entrada premium', points: 1200, emoji: '🥗' }, { name: 'Jantar para 2', points: 3000, emoji: '🍽️' }].map((reward, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors mb-1">
          <span className="text-2xl">{reward.emoji}</span>
          <div className="flex-1"><p className="font-semibold text-sm">{reward.name}</p><p className="text-xs text-muted-foreground">{reward.points} pontos</p></div>
          <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${loyaltyPoints >= reward.points ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {loyaltyPoints >= reward.points ? 'Resgatar' : `${reward.points - loyaltyPoints} pts`}
          </button>
        </div>
      ))}
      <h3 className="font-display font-semibold text-sm mt-5 mb-3">Histórico</h3>
      {[{ description: 'Visita ao Bistrô Noowe', points: '+125', date: 'Hoje' }, { description: 'Bônus de aniversário', points: '+500', date: 'Ontem' }, { description: 'Resgate: Drink da casa', points: '-800', date: '3 dias atrás' }].map((entry, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
          <div><p className="text-sm">{entry.description}</p><p className="text-xs text-muted-foreground">{entry.date}</p></div>
          <span className={`font-display font-bold text-sm ${entry.points.startsWith('+') ? 'text-success' : 'text-destructive'}`}>{entry.points}</span>
        </div>
      ))}
    </div>
  );
};

// ============ MAIN COMPONENT ============

export const FineDiningDemo: React.FC<{ screen: string; onNavigate: (s: string) => void }> = ({ screen, onNavigate }) => {
  const [selectedItem, setSelectedItem] = useState<DemoMenuItem | null>(null);

  const handleSelectItem = (item: DemoMenuItem) => {
    setSelectedItem(item);
    onNavigate('item');
  };

  switch (screen) {
    case 'home': return <HomeScreen onNavigate={onNavigate} />;
    case 'restaurant': return <RestaurantScreen onNavigate={onNavigate} />;
    case 'menu': return <MenuScreen onNavigate={onNavigate} onSelectItem={handleSelectItem} />;
    case 'item': return selectedItem ? <ItemDetailScreen item={selectedItem} onNavigate={onNavigate} /> : <HomeScreen onNavigate={onNavigate} />;
    case 'comanda': return <ComandaScreen onNavigate={onNavigate} />;
    case 'fechar-conta': return <FecharContaScreen onNavigate={onNavigate} />;
    case 'order-status': return <OrderStatusScreen onNavigate={onNavigate} />;
    case 'loyalty': return <LoyaltyScreen onNavigate={onNavigate} />;
    case 'reservations': return <ReservationsScreen onNavigate={onNavigate} />;
    case 'qr-scan': return <QRScanScreen onNavigate={onNavigate} />;
    case 'call-waiter': return <CallWaiterScreen onNavigate={onNavigate} />;
    case 'profile': return <ProfileScreen onNavigate={onNavigate} />;
    case 'virtual-queue': return <VirtualQueueScreen onNavigate={onNavigate} />;
    case 'my-orders': return <MyOrdersScreen onNavigate={onNavigate} />;
    case 'payment-success': return <PaymentSuccessScreen onNavigate={onNavigate} />;
    case 'notifications': return <NotificationsScreen onNavigate={onNavigate} />;
    case 'ai-harmonization': return <AIHarmonizationScreen onNavigate={onNavigate} />;
    default: return <HomeScreen onNavigate={onNavigate} />;
  }
};
