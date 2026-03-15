/**
 * Club & Balada Demo — NOOWE Club
 * Jornada autêntica: descobrir → ingresso/lista → fila → pulseira → amigos → pedir → camarote → encerrar
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint, ItemIcon } from '../DemoShared';
import { FoodImg } from '../FoodImages';
import {
  ArrowLeft, Check, Star, Clock, Plus, Minus, CreditCard, Gift, QrCode,
  Users, Timer, ArrowRight, Music, Ticket, Crown, MapPin, UserPlus,
  Share2, Copy, Sparkles, Lock, Eye, ChevronRight, Bell, Car, ThumbsUp,
  Search, Heart, AlertTriangle, Zap, Wine, Beer, UtensilsCrossed,
  GlassWater, Building, ScanLine, Smartphone, Navigation,
  Locate, PartyPopper, ShieldCheck, Shirt, Tag,
} from 'lucide-react';

type Screen =
  | 'home' | 'club-detail' | 'lineup' | 'tickets' | 'digital-ticket'
  | 'promoter-list' | 'virtual-queue' | 'wristband'
  | 'find-friends' | 'floor-order' | 'order-pickup'
  | 'vip-table' | 'vip-map' | 'bottle-service' | 'min-spend'
  | 'coat-check' | 'close' | 'rate';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir evento', screens: ['home', 'club-detail'] },
  { step: 2, label: 'Ver lineup', screens: ['lineup'] },
  { step: 3, label: 'Comprar ingresso', screens: ['tickets', 'digital-ticket'] },
  { step: 4, label: 'Lista do Promoter', screens: ['promoter-list'] },
  { step: 5, label: 'Fila virtual', screens: ['virtual-queue'] },
  { step: 6, label: 'Ativar pulseira', screens: ['wristband'] },
  { step: 7, label: 'Encontrar amigos', screens: ['find-friends'] },
  { step: 8, label: 'Pedir da pista', screens: ['floor-order', 'order-pickup'] },
  { step: 9, label: 'Camarote VIP', screens: ['vip-table', 'vip-map'] },
  { step: 10, label: 'Bottle & consumação', screens: ['bottle-service', 'min-spend'] },
  { step: 11, label: 'Guardar pertences', screens: ['coat-check'] },
  { step: 12, label: 'Encerrar noite', screens: ['close', 'rate'] },
];

export const SCREEN_INFO: Record<Screen, { title: string; desc: string }> = {
  'home': { title: 'Eventos', desc: 'As melhores noites da cidade com lotação em tempo real.' },
  'club-detail': { title: 'NOOWE Club', desc: 'Detalhes, lineup e lotação do evento.' },
  'lineup': { title: 'Lineup', desc: 'DJs, horários e gêneros da noite.' },
  'tickets': { title: 'Ingressos', desc: 'Lotes com preço dinâmico — compre antes, pague menos.' },
  'digital-ticket': { title: 'Ingresso Digital', desc: 'QR animado anti-fraude no seu celular.' },
  'promoter-list': { title: 'Lista do Promoter', desc: 'Entrada na lista ou fluxo de aniversariante.' },
  'virtual-queue': { title: 'Fila Virtual', desc: 'Sua posição na fila sem ficar no frio.' },
  'wristband': { title: 'Pulseira Digital', desc: 'Ative a pulseira NFC e vincule créditos.' },
  'find-friends': { title: 'Encontrar Amigos', desc: 'Veja onde seus amigos estão no club.' },
  'floor-order': { title: 'Pedir da Pista', desc: 'Peça drinks sem sair da pista.' },
  'order-pickup': { title: 'Retirada', desc: 'Seu drink está pronto — retire no bar indicado.' },
  'vip-table': { title: 'Camarotes', desc: 'Opções de camarote com consumação mínima.' },
  'vip-map': { title: 'Mapa VIP', desc: 'Escolha a posição do seu camarote no club.' },
  'bottle-service': { title: 'Bottle Service', desc: 'Garrafas premium com mixers inclusos.' },
  'min-spend': { title: 'Consumação', desc: 'Tracker da consumação mínima em tempo real.' },
  'coat-check': { title: 'Guarda-Volumes', desc: 'Entregue pertences e retire com QR — sem fila.' },
  'close': { title: 'Encerramento', desc: 'Resumo completo da noite e Uber integrado.' },
  'rate': { title: 'Avaliação', desc: 'Avalie a noite por categoria e ganhe pontos.' },
};

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

const BOTTLES = [
  { id: 'b1', name: 'Absolut Vodka', price: 350, desc: '750ml · Inclui 4 energéticos', category: 'Vodka', imgId: 'vodka' },
  { id: 'b2', name: 'Grey Goose', price: 580, desc: '750ml · Premium · Inclui tônica', category: 'Vodka', imgId: 'vodka' },
  { id: 'b3', name: 'Moët Chandon', price: 650, desc: '750ml · Brut Impérial', category: 'Espumante', imgId: 'champagne' },
  { id: 'b4', name: 'Johnnie Walker Black', price: 480, desc: '750ml · 12 anos', category: 'Whisky', imgId: 'whisky' },
  { id: 'b5', name: 'Balde Cerveja (6)', price: 120, desc: '6 long necks premium', category: 'Cerveja', imgId: 'beer-bucket' },
  { id: 'b6', name: 'Don Julio Reposado', price: 520, desc: '750ml · Inclui limões', category: 'Tequila', imgId: 'tequila' },
];

const FLOOR_DRINKS = [
  { name: 'Gin Tônica', price: 38, imgId: 'gin-tonic' },
  { name: 'Vodka Red Bull', price: 35, imgId: 'vodka' },
  { name: 'Cerveja Long Neck', price: 18, imgId: 'ipa' },
  { name: 'Água', price: 8, imgId: 'water' },
  { name: 'Shot Tequila', price: 25, imgId: 'tequila' },
  { name: 'Caipirinha', price: 30, imgId: 'cocktail' },
];

export const ClubDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [ticketType, setTicketType] = useState<'pista' | 'vip' | 'open'>('pista');
  const [selectedBottle, setSelectedBottle] = useState(BOTTLES[0]);
  const [consumed, setConsumed] = useState(1580);
  const minimum = 3000;
  const progress = Math.round((consumed / minimum) * 100);
  const [queuePos, setQueuePos] = useState(12);
  const [countdown, setCountdown] = useState({ h: 3, m: 42 });
  const [guests] = useState([
    { name: 'Você', status: 'confirmed' as const, zone: 'Pista' },
    { name: 'Pedro', status: 'confirmed' as const, zone: 'Bar 2' },
    { name: 'Camila', status: 'confirmed' as const, zone: 'Pista' },
    { name: 'Rafael', status: 'pending' as const, zone: '—' },
    { name: 'Julia', status: 'declined' as const, zone: '—' },
  ]);
  const [wristbandBalance, setWristbandBalance] = useState(260); // entry credit + deposit
  const [coatItems] = useState([
    { id: 'c1', desc: 'Jaqueta preta', code: 'GV-041' },
    { id: 'c2', desc: 'Bolsa pequena', code: 'GV-042' },
  ]);

  useEffect(() => {
    if (screen === 'virtual-queue') {
      const t = setInterval(() => setQueuePos(prev => Math.max(1, prev - 1)), 3000);
      return () => clearInterval(t);
    }
  }, [screen]);

  const ticketPrice = ticketType === 'pista' ? 60 : ticketType === 'vip' ? 120 : 200;

  const Header: React.FC<{ title: string; back: Screen; right?: React.ReactNode }> = ({ title, back, right }) => (
    <div className="flex items-center justify-between py-4">
      <button onClick={() => onNavigate(back)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
      <h1 className="font-display font-bold text-sm">{title}</h1>
      {right || <div className="w-8" />}
    </div>
  );

  switch (screen) {
    /* ─── 1. DESCOBERTA ─── */
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-3">
            <p className="text-sm text-muted-foreground">Sábado à noite</p>
            <h1 className="font-display text-xl font-bold">Eventos & Clubs</h1>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/50 border border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Buscar eventos...</span>
            </div>
            <button className="p-2.5 rounded-xl bg-muted/50 border border-border">
              <Heart className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
            {['Hoje', 'Este fds', 'Tech House', 'Funk', 'Sertanejo', 'Open Bar'].map((f, i) => (
              <button key={f} className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f}</button>
            ))}
          </div>

          {/* Amigos indo */}
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 mb-3 flex items-center gap-3">
            <div className="flex -space-x-2">
              {guests.filter(g => g.status === 'confirmed').slice(1).map((g, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-primary-foreground text-[10px] font-bold border-2 border-background">{g.name[0]}</div>
              ))}
            </div>
            <p className="text-xs"><span className="font-semibold">Pedro e Camila</span> <span className="text-muted-foreground">vão no NOOWE Club</span></p>
          </div>

          <GuidedHint text="Compre ingressos, reserve camarote e controle gastos pelo app" />
          <button onClick={() => onNavigate('club-detail')} className="w-full text-left mb-3">
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <div className="h-32 bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center relative">
                <ItemIcon cat="club" size="hero" />
                <div className="absolute top-2 left-3 flex gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[9px] font-bold">HOJE</span>
                  <span className="px-2 py-0.5 rounded-full bg-warning/90 text-primary-foreground text-[9px] font-bold">Lote 2</span>
                </div>
                <div className="absolute top-2 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/90 text-primary-foreground text-[9px] font-bold">
                  <Users className="w-2.5 h-2.5" /> 2 amigos vão
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-2 right-3 px-2 py-1 rounded-lg bg-background/80 backdrop-blur text-[10px] font-semibold flex items-center gap-1">
                  <Eye className="w-3 h-3" /> 72% lotação
                </div>
              </div>
              <div className="p-4 -mt-2 relative">
                <h3 className="font-display text-base font-bold">NOOWE Club — Tech House Night</h3>
                <p className="text-xs text-muted-foreground mb-2">DJ Marcos + Special Guest · 23:00 - 06:00</p>
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-primary">A partir de R$ 60</span>
                  <div className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-bold">4.8</span></div>
                </div>
              </div>
            </div>
          </button>
        </div>
      );

    case 'club-detail':
      return (
        <div className="px-5 pb-4">
          <Header title="NOOWE Club" back="home" right={<button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Share2 className="w-4 h-4" /></button>} />
          <div className="text-center mb-4">
            <ItemIcon cat="club" size="hero" className="mx-auto" />
            <h2 className="font-display text-xl font-bold mt-2">Tech House Night</h2>
            <p className="text-sm text-muted-foreground">Sáb, 22 Mar · 23:00 - 06:00</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><MapPin className="w-3 h-3" /> Vila Olímpia, São Paulo</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Lotação', value: '72%', color: 'text-warning' },
              { label: 'Na fila', value: `${queuePos}`, color: 'text-primary' },
              { label: 'Camarotes', value: '3 livres', color: 'text-success' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl bg-muted/30 text-center">
                <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs font-semibold">Começa em {countdown.h}h {countdown.m}min</p>
                <p className="text-[10px] text-muted-foreground">Portões abrem às 22:30</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <button onClick={() => onNavigate('lineup')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <Music className="w-4 h-4" /> Ver Lineup
            </button>
            <button onClick={() => onNavigate('tickets')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
              <Ticket className="w-5 h-5" /> Comprar Ingresso
            </button>
            <button onClick={() => onNavigate('promoter-list')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <Tag className="w-4 h-4" /> Entrar na Lista / Aniversário
            </button>
            <button onClick={() => onNavigate('vip-table')} className="w-full py-3.5 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-600/20 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-accent" /> Reservar Camarote VIP
            </button>
          </div>
        </div>
      );

    /* ─── 2. LINEUP ─── */
    case 'lineup':
      return (
        <div className="px-5 pb-4">
          <Header title="Lineup" back="club-detail" />
          <div className="space-y-3 mb-4">
            {[
              { name: 'DJ Marcos', time: '23:00 - 01:00', genre: 'Tech House', bio: 'Residente NOOWE · 8 anos', headliner: false },
              { name: 'Special Guest', time: '01:00 - 03:00', genre: '???', bio: 'Surpresa no horário nobre!', headliner: true },
              { name: 'DJ Fernanda', time: '03:00 - 05:00', genre: 'Minimal', bio: 'Passagens por Berghain e Fabric', headliner: false },
              { name: 'Sunset Closing', time: '05:00 - 06:00', genre: 'Deep House', bio: 'Set ao nascer do sol', headliner: false },
            ].map((dj, i) => (
              <div key={i} className={`p-4 rounded-xl border ${dj.headliner ? 'border-primary bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'border-border bg-card'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${dj.headliner ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-muted'} flex items-center justify-center`}>
                    <Music className={`w-5 h-5 ${dj.headliner ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{dj.name}</p>
                      {dj.headliner && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center gap-0.5"><Star className="w-2.5 h-2.5" /> Headliner</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{dj.genre} · {dj.time}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{dj.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('tickets')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground rounded-xl font-semibold shadow-glow">
            Comprar Ingresso
          </button>
        </div>
      );

    /* ─── 3. INGRESSOS ─── */
    case 'tickets':
      return (
        <div className="px-5 pb-4">
          <Header title="Ingressos" back="club-detail" />
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 mb-4 flex items-center gap-2">
            <Timer className="w-4 h-4 text-warning" />
            <span className="text-xs text-warning font-medium">Lote 2 · Últimas unidades · Preço sobe em 2h</span>
          </div>
          <div className="space-y-3 mb-5">
            {[
              { id: 'pista' as const, name: 'Pista', price: 60, original: 80, desc: 'Acesso à pista principal', perks: ['Entrada após 23:30', 'R$ 60 vira crédito na pulseira'], avail: 23 },
              { id: 'vip' as const, name: 'VIP', price: 120, original: 150, desc: 'Área VIP + 1 drink incluso', perks: ['Entrada prioritária', 'Área exclusiva', '1 drink cortesia'], avail: 15 },
              { id: 'open' as const, name: 'Open Bar', price: 200, original: 250, desc: 'Open bar premium até 03:00', perks: ['Entrada prioritária', 'Open bar completo', 'Área VIP inclusa'], avail: 8 },
            ].map(ticket => (
              <button key={ticket.id} onClick={() => setTicketType(ticket.id)} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${ticketType === ticket.id ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm">{ticket.name}</p>
                    <p className="text-[10px] text-muted-foreground">{ticket.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs line-through text-muted-foreground">R$ {ticket.original}</span>
                    <p className="font-display text-lg font-bold text-primary">R$ {ticket.price}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {ticket.perks.map(p => (
                    <span key={p} className="flex items-center gap-0.5 text-[9px] text-muted-foreground"><Check className="w-2.5 h-2.5 text-success" />{p}</span>
                  ))}
                </div>
                <p className="text-[9px] text-warning font-medium">{ticket.avail} restantes</p>
              </button>
            ))}
          </div>
          <button onClick={() => onNavigate('digital-ticket')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <Ticket className="w-5 h-5" /> Comprar · R$ {ticketPrice}
          </button>
        </div>
      );

    case 'digital-ticket':
      return (
        <div className="px-5 pb-4">
          <Header title="Seu Ingresso" back="tickets" />
          <div className="text-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-3 relative">
              <Ticket className="w-10 h-10 text-primary" />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-success flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>
            </div>
            <h2 className="font-display text-xl font-bold">Ingresso Confirmado!</h2>
            <p className="text-sm text-muted-foreground">NOOWE Club · Tech House Night</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border-2 border-border mb-4 text-center relative">
            <div className="w-full aspect-square max-w-[140px] mx-auto bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center mb-3 relative">
              <QrCode className="w-16 h-16 text-foreground" />
              <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-pulse" />
            </div>
            <p className="font-display text-2xl font-bold tracking-widest text-primary mb-1">NC-847</p>
            <p className="text-[10px] text-muted-foreground">
              {ticketType === 'pista' ? 'Pista' : ticketType === 'vip' ? 'VIP' : 'Open Bar'} · R$ {ticketPrice}
            </p>
            <div className="absolute left-0 top-1/2 w-4 h-8 -ml-2 bg-background rounded-r-full" />
            <div className="absolute right-0 top-1/2 w-4 h-8 -mr-2 bg-background rounded-l-full" />
          </div>
          {ticketType === 'pista' && (
            <div className="p-3 rounded-xl bg-success/10 border border-success/20 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-success" />
              <span className="text-xs text-success font-medium">R$ 60 será creditado na pulseira na entrada</span>
            </div>
          )}
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 mb-4">
            <p className="text-xs font-semibold mb-1 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> QR anti-fraude</p>
            <p className="text-[10px] text-muted-foreground">O código muda a cada 30 segundos — impossível clonar</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('promoter-list')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <UserPlus className="w-4 h-4" /> Convidados
            </button>
            <button onClick={() => onNavigate('virtual-queue')} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <Users className="w-4 h-4" /> Entrar na Fila
            </button>
          </div>
        </div>
      );

    /* ─── 4. LISTA DO PROMOTER / ANIVERSÁRIO ─── */
    case 'promoter-list':
      return (
        <div className="px-5 pb-4">
          <Header title="Lista & Aniversário" back="digital-ticket" />
          
          {/* Promoter list */}
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Tag className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold">Lista do Promoter</p>
                <p className="text-[10px] text-muted-foreground">Entrada com desconto ou gratuita</p>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {[
                { name: 'Lista VIP — @marcos_dj', benefit: 'Entrada grátis até 00:00', spots: 4 },
                { name: 'Lista Friends — @noowe_promo', benefit: '50% off até 01:00', spots: 12 },
              ].map((list, i) => (
                <button key={i} className={`w-full p-3 rounded-xl border-2 text-left ${i === 0 ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold">{list.name}</p>
                    <span className="text-[9px] text-success font-medium">{list.spots} vagas</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{list.benefit}</p>
                </button>
              ))}
            </div>
            <button className="w-full py-3 bg-primary/10 text-primary rounded-xl text-sm font-semibold">
              Colocar nome na lista
            </button>
          </div>

          {/* Aniversário */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/5 to-purple-500/5 border border-pink-500/20 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <PartyPopper className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold">Aniversariante?</p>
                <p className="text-[10px] text-muted-foreground">Entrada grátis + benefícios exclusivos</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" /> Entrada gratuita para você + 1 acompanhante</p>
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" /> Garrafa de espumante cortesia</p>
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" /> Decoração na mesa VIP</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 mb-3">
              <p className="text-[10px] text-muted-foreground">Documento necessário para verificação na entrada</p>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <PartyPopper className="w-4 h-4" /> Solicitar Aniversário
            </button>
          </div>

          {/* Convidados */}
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2">Seus convidados</p>
            <div className="space-y-2">
              {guests.map((g, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${g.status === 'confirmed' ? 'border-success/30 bg-success/5' : g.status === 'pending' ? 'border-warning/30 bg-warning/5' : 'border-border bg-muted/30'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${g.status === 'confirmed' ? 'bg-success text-primary-foreground' : g.status === 'pending' ? 'bg-warning text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {g.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{g.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {g.status === 'confirmed' && <><Check className="w-2.5 h-2.5 text-success" /> Confirmado</>}
                      {g.status === 'pending' && <><Clock className="w-2.5 h-2.5 text-warning" /> Pendente</>}
                      {g.status === 'declined' && 'Recusou'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => onNavigate('virtual-queue')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Continuar
          </button>
        </div>
      );

    /* ─── 5. FILA VIRTUAL ─── */
    case 'virtual-queue':
      return (
        <div className="px-5 pb-4">
          <Header title="Fila Virtual" back="digital-ticket" />
          <div className="text-center mb-5">
            <div className="relative w-28 h-28 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <p className="font-display text-3xl font-bold text-purple-500">{queuePos}</p>
                  <p className="text-[9px] text-muted-foreground">na fila</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Estimativa: ~{queuePos * 2} min</p>
          </div>

          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 mb-4">
            <p className="text-xs font-bold mb-2">Enquanto espera:</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><Smartphone className="w-3 h-3 text-primary" /> Pode sair da fila física — notificaremos você</p>
              <p className="flex items-center gap-1.5"><GlassWater className="w-3 h-3 text-primary" /> Peça drinks e retire no bar da entrada</p>
              <p className="flex items-center gap-1.5"><Users className="w-3 h-3 text-primary" /> Convidados confirmados entram com você</p>
            </div>
          </div>

          {queuePos <= 2 && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 mb-4 text-center animate-pulse">
              <Bell className="w-5 h-5 text-success mx-auto mb-1" />
              <p className="text-sm font-bold text-success">Quase lá!</p>
              <p className="text-xs text-muted-foreground">Dirija-se à entrada · Tolerância: 5 min</p>
            </div>
          )}

          <button onClick={() => onNavigate('wristband')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2 mb-2">
            <ScanLine className="w-5 h-5" /> Simular Entrada (Pular fila)
          </button>
          <button onClick={() => onNavigate('vip-table')} className="w-full py-3 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-600/20 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <Crown className="w-4 h-4 text-accent" /> Skip a fila — Camarote VIP
          </button>
        </div>
      );

    /* ─── 6. ATIVAR PULSEIRA ─── */
    case 'wristband':
      return (
        <div className="px-5 pb-4">
          <Header title="Pulseira Digital" back="virtual-queue" />
          <div className="text-center mb-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-3 relative">
              <Smartphone className="w-10 h-10 text-primary" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-success flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            </div>
            <h2 className="font-display text-xl font-bold">Pulseira Ativada!</h2>
            <p className="text-sm text-muted-foreground">NFC vinculado ao seu app — pague com o pulso</p>
          </div>

          {/* Saldo da pulseira */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Saldo disponível</p>
            <p className="font-display text-3xl font-bold text-primary">R$ {wristbandBalance}</p>
            <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Ticket className="w-3 h-3 text-success" /> Ingresso: +R$ 60</span>
              <span className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-primary" /> Depósito: +R$ 200</span>
            </div>
          </div>

          <div className="space-y-2 mb-4 text-xs text-muted-foreground">
            <p className="flex items-center gap-2"><Zap className="w-3 h-3 text-primary" /> Aproxime o pulso no leitor de qualquer bar</p>
            <p className="flex items-center gap-2"><CreditCard className="w-3 h-3 text-primary" /> Débito automático do saldo + cartão se exceder</p>
            <p className="flex items-center gap-2"><Eye className="w-3 h-3 text-primary" /> Acompanhe gastos em tempo real pelo app</p>
          </div>

          <GuidedHint text="Tudo paga pela pulseira — sem carteira, sem filas no caixa" />
          <button onClick={() => onNavigate('find-friends')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <Navigation className="w-5 h-5" /> Encontrar Amigos
          </button>
          <button onClick={() => onNavigate('floor-order')} className="w-full mt-2 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
            <GlassWater className="w-4 h-4" /> Pedir Drink
          </button>
        </div>
      );

    /* ─── 7. ENCONTRAR AMIGOS ─── */
    case 'find-friends':
      return (
        <div className="px-5 pb-4">
          <Header title="Encontrar Amigos" back="wristband" />
          <GuidedHint text="Veja em que zona do club seus amigos estão" />
          
          {/* Mapa simplificado */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-muted/50 to-muted/20 border border-border mb-4 relative" style={{ height: 200 }}>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-purple-500/20 text-[10px] font-bold text-purple-500 flex items-center gap-1"><Music className="w-3 h-3" /> PALCO</div>
            <div className="absolute top-14 left-1/2 -translate-x-1/2 w-28 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[10px] text-muted-foreground">
              PISTA
            </div>
            {/* Amigos no mapa */}
            <div className="absolute top-16 left-8 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-primary-foreground text-[10px] font-bold border-2 border-primary-foreground shadow-lg">C</div>
              <span className="text-[8px] text-muted-foreground mt-0.5">Camila</span>
            </div>
            <div className="absolute bottom-12 right-6 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-primary-foreground text-[10px] font-bold border-2 border-primary-foreground shadow-lg">P</div>
              <span className="text-[8px] text-muted-foreground mt-0.5">Pedro</span>
            </div>
            <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-amber-500/20 text-[8px] text-amber-600 flex items-center gap-0.5"><GlassWater className="w-2.5 h-2.5" /> Bar 2</div>
            <div className="absolute bottom-4 left-4 px-2 py-1 rounded bg-amber-500/20 text-[8px] text-amber-600 flex items-center gap-0.5"><GlassWater className="w-2.5 h-2.5" /> Bar 1</div>
          </div>

          {/* Lista de amigos com zonas */}
          <div className="space-y-2 mb-4">
            {guests.filter(g => g.status === 'confirmed').map((g, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">{g.name[0]}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{g.name}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Locate className="w-2.5 h-2.5" /> {g.zone}</p>
                </div>
                <button className="px-2.5 py-1 rounded-lg bg-primary/10 text-[10px] text-primary font-semibold flex items-center gap-0.5">
                  <Navigation className="w-2.5 h-2.5" /> Ir
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-muted/30 mb-4">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> Localização compartilhada só com amigos confirmados · Atualiza a cada 30s</p>
          </div>

          <button onClick={() => onNavigate('floor-order')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <GlassWater className="w-5 h-5" /> Pedir Drink
          </button>
        </div>
      );

    /* ─── 8. PEDIR DA PISTA ─── */
    case 'floor-order':
      return (
        <div className="px-5 pb-4">
          <Header title="Pedir da Pista" back="find-friends" />
          <GuidedHint text="Peça sem sair da pista — retire no bar mais perto" />
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-3">
            <p className="text-xs font-medium flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> Bar mais próximo: <span className="font-bold text-primary">Bar Pista Central</span> · 15m</p>
          </div>
          {/* Saldo pulseira */}
          <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20 mb-3 flex items-center justify-between">
            <span className="text-xs text-purple-500 flex items-center gap-1"><Zap className="w-3 h-3" /> Saldo pulseira</span>
            <span className="text-sm font-bold text-purple-500">R$ {wristbandBalance}</span>
          </div>
          <div className="space-y-2 mb-4">
            {FLOOR_DRINKS.map((d, i) => (
              <button key={i} onClick={() => { setWristbandBalance(prev => prev - d.price); setConsumed(prev => prev + d.price); onNavigate('order-pickup'); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                <FoodImg id={d.imgId} size="sm" alt={d.name} />
                <div className="flex-1"><p className="font-semibold text-sm">{d.name}</p></div>
                <span className="font-semibold text-sm text-primary">R$ {d.price}</span>
              </button>
            ))}
          </div>
        </div>
      );

    case 'order-pickup':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-1">Pedido Confirmado!</h2>
          <p className="text-sm text-muted-foreground mb-1">Pago via pulseira NFC</p>
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1"><Timer className="w-3 h-3" /> Pronto em ~3 min</p>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
            <p className="text-xs font-bold mb-1">Retire no Bar Pista Central</p>
            <p className="text-[10px] text-muted-foreground">Apresente o celular ou aproxime a pulseira</p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="font-display text-lg font-bold text-primary">PD-312</span>
            </div>
          </div>
          <div className="w-full p-3 rounded-xl bg-muted/30 mb-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Saldo pulseira</span>
            <span className="text-sm font-bold text-purple-500">R$ {wristbandBalance}</span>
          </div>
          <div className="flex gap-2 w-full">
            <button onClick={() => onNavigate('vip-table')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <Crown className="w-4 h-4 text-accent" /> Camarote
            </button>
            <button onClick={() => onNavigate('find-friends')} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <Navigation className="w-4 h-4" /> Amigos
            </button>
          </div>
        </div>
      );

    /* ─── 9. CAMAROTE VIP ─── */
    case 'vip-table':
      return (
        <div className="px-5 pb-4">
          <Header title="Camarotes VIP" back="club-detail" />
          <GuidedHint text="Escolha o camarote e veja a posição no mapa" />
          <div className="space-y-3 mb-4">
            {[
              { name: 'Lounge', people: '6-8', min: 2000, deposit: 800, avail: true, pos: 'Lateral pista' },
              { name: 'Premium', people: '8-12', min: 3000, deposit: 1200, avail: true, pos: 'Frente palco', recommended: true },
              { name: 'Stage', people: '10-15', min: 5000, deposit: 2000, avail: false, pos: 'Palco' },
              { name: 'Sky Box', people: '15-20', min: 8000, deposit: 3000, avail: true, pos: 'Terraço panorâmico' },
            ].map((table, i) => (
              <button key={i} onClick={() => table.avail ? onNavigate('vip-map') : undefined}
                className={`w-full p-4 rounded-xl border-2 text-left ${table.recommended ? 'border-primary bg-primary/5' : table.avail ? 'border-border bg-card' : 'border-border bg-muted/30 opacity-50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{table.name}</p>
                    {table.recommended && <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-bold">Recomendado</span>}
                  </div>
                  {!table.avail && <span className="text-[10px] text-destructive font-semibold">Esgotado</span>}
                </div>
                <p className="text-xs text-muted-foreground">{table.people} pessoas · {table.pos}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Mín: R$ {table.min.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Depósito: R$ {table.deposit.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      );

    case 'vip-map':
      return (
        <div className="px-5 pb-4">
          <Header title="Mapa do Club" back="vip-table" />
          <div className="p-4 rounded-2xl bg-gradient-to-b from-muted/50 to-muted/20 border border-border mb-4 relative" style={{ height: 220 }}>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-purple-500/20 text-[10px] font-bold text-purple-500 flex items-center gap-1"><Music className="w-3 h-3" /> PALCO</div>
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-32 h-16 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-[10px] text-muted-foreground">PISTA</div>
            <div className="absolute bottom-16 left-4 px-2 py-1.5 rounded-lg bg-muted border border-border text-[9px] text-muted-foreground opacity-50">Lounge</div>
            <div className="absolute bottom-16 right-4 px-2 py-1.5 rounded-lg bg-primary/20 border-2 border-primary text-[9px] text-primary font-bold animate-pulse flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Premium</div>
            <div className="absolute top-12 right-3 px-2 py-1.5 rounded-lg bg-muted/50 border border-border text-[9px] text-muted-foreground line-through">Stage</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-lg bg-muted border border-border text-[9px] text-muted-foreground flex items-center gap-0.5"><Building className="w-2.5 h-2.5" /> Sky Box</div>
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-amber-500/20 text-[8px] text-amber-600 flex items-center gap-0.5"><GlassWater className="w-2.5 h-2.5" /> Bar</div>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
            <p className="font-bold text-sm mb-1">Camarote Premium</p>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary" /> Frente ao palco · 8-12 pessoas</p>
              <p className="flex items-center gap-1.5"><CreditCard className="w-3 h-3 text-primary" /> Consumação mínima: R$ 3.000</p>
              <p className="flex items-center gap-1.5"><CreditCard className="w-3 h-3 text-primary" /> Depósito (convertido): R$ 1.200</p>
              <p className="flex items-center gap-1.5"><Wine className="w-3 h-3 text-primary" /> Garçom exclusivo + mixers cortesia</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 mb-4">
            <p className="text-xs font-semibold mb-2">Quem vai?</p>
            <div className="flex gap-2">
              {guests.filter(g => g.status === 'confirmed').map((g, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{g.name[0]}</div>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <button onClick={() => onNavigate('bottle-service')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground rounded-xl font-bold shadow-glow">
            Confirmar · Depósito R$ 1.200
          </button>
        </div>
      );

    /* ─── 10. BOTTLE SERVICE & CONSUMAÇÃO ─── */
    case 'bottle-service':
      return (
        <div className="px-5 pb-4">
          <Header title="Bottle Service" back="vip-map" />
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-medium flex items-center gap-1">Sugestão do bartender para Tech House <Music className="w-3 h-3" /></span>
          </div>
          <div className="space-y-2 mb-4">
            {BOTTLES.map(bottle => (
              <button key={bottle.id} onClick={() => { setSelectedBottle(bottle); setConsumed(prev => prev + bottle.price); onNavigate('min-spend'); }}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left">
                <FoodImg id={bottle.imgId} size="md" alt={bottle.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{bottle.name}</p>
                  <p className="text-[10px] text-muted-foreground">{bottle.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-sm">R$ {bottle.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      );

    case 'min-spend':
      return (
        <div className="px-5 pb-4">
          <Header title="Consumação" back="bottle-service" right={
            <button onClick={() => onNavigate('floor-order')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Plus className="w-4 h-4" /></button>
          } />
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold">Consumação Mínima</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${progress >= 100 ? 'bg-success/20 text-success' : progress >= 50 ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'}`}>
                {progress}%
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden mb-3 relative">
              <div className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-success' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
              <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-primary-foreground">
                R$ {consumed.toLocaleString()} / R$ {minimum.toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-xs font-bold">R$ {consumed.toLocaleString()}</p><p className="text-[9px] text-muted-foreground">Consumido</p></div>
              <div><p className="text-xs font-bold text-success">-R$ 1.380</p><p className="text-[9px] text-muted-foreground">Créditos</p></div>
              <div><p className="text-xs font-bold text-warning">R$ {Math.max(0, minimum - consumed).toLocaleString()}</p><p className="text-[9px] text-muted-foreground">Faltam</p></div>
            </div>
          </div>

          <h3 className="font-semibold text-sm mb-2">Últimos pedidos</h3>
          <div className="space-y-1 mb-4">
            {[
              { item: 'Grey Goose', who: 'Você', price: 580, time: '01:45' },
              { item: 'Balde Cerveja', who: 'Pedro', price: 120, time: '02:10' },
              { item: 'Gin Tônica (3x)', who: 'Mesa', price: 114, time: '02:30' },
              { item: 'Moët Chandon', who: 'Camila', price: 650, time: '02:50' },
            ].map((order, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/50">
                <div className="flex-1">
                  <p className="text-sm font-medium">{order.item}</p>
                  <p className="text-[10px] text-muted-foreground">{order.who} · {order.time}</p>
                </div>
                <span className="text-sm font-semibold">R$ {order.price}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-3">
            <button onClick={() => onNavigate('bottle-service')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <Wine className="w-4 h-4" /> Garrafas
            </button>
            <button onClick={() => onNavigate('coat-check')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <Shirt className="w-4 h-4" /> Guarda-Volumes
            </button>
          </div>
          <button onClick={() => onNavigate('close')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground rounded-xl font-bold shadow-glow">
            Encerrar Noite
          </button>
        </div>
      );

    /* ─── 11. GUARDA-VOLUMES ─── */
    case 'coat-check':
      return (
        <div className="px-5 pb-4">
          <Header title="Guarda-Volumes" back="min-spend" />
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Shirt className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold">Seus Pertences</h2>
            <p className="text-sm text-muted-foreground">Entregue e retire com QR — sem fila no final</p>
          </div>

          <GuidedHint text="Entregue itens no balcão — receba um QR para retirar depois" />

          <div className="space-y-2 mb-4">
            {coatItems.map(item => (
              <div key={item.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold">{item.desc}</p>
                    <p className="text-[10px] text-muted-foreground">Código: {item.code}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-success">
                  <ShieldCheck className="w-3 h-3" /> Guardado com segurança
                </div>
              </div>
            ))}
          </div>

          <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border mb-4">
            <Plus className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Guardar mais um item</span>
          </button>

          <div className="p-3 rounded-xl bg-muted/30 mb-4">
            <p className="text-xs font-semibold mb-1">Como funciona a retirada?</p>
            <div className="space-y-1 text-[10px] text-muted-foreground">
              <p className="flex items-center gap-1.5"><ScanLine className="w-3 h-3 text-primary" /> Apresente o QR no balcão na saída</p>
              <p className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-primary" /> Sem fila — retire em segundos</p>
              <p className="flex items-center gap-1.5"><CreditCard className="w-3 h-3 text-primary" /> Custo: R$ 10 por item (cobrado na pulseira)</p>
            </div>
          </div>

          <button onClick={() => onNavigate('close')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Encerrar Noite
          </button>
        </div>
      );

    /* ─── 12. ENCERRAR NOITE ─── */
    case 'close':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-5 shadow-xl shadow-purple-500/30">
            <Music className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-1">Noite Incrível!</h2>
          <p className="text-sm text-muted-foreground mb-4">NOOWE Club · Tech House Night</p>
          <div className="w-full p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Consumido total</span><span>R$ {consumed.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-success">Créditos (ingresso + depósito)</span><span className="text-success">-R$ 1.380</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Guarda-volumes (2 itens)</span><span>R$ 20</span></div>
            <div className="border-t-2 border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
              <span>Total pago</span>
              <span className="text-primary">R$ {Math.max(0, consumed - 1380 + 20).toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full p-3 rounded-xl bg-primary/5 border border-primary/20 mb-3 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-semibold">+200 pontos ganhos!</p>
              <p className="text-[10px] text-muted-foreground">Acesso VIP garantido no próximo evento</p>
            </div>
          </div>
          <div className="w-full grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Tempo na casa', value: '5h 30min' },
              { label: 'Drinks pedidos', value: '12' },
              { label: 'Garrafas', value: '2' },
            ].map(s => (
              <div key={s.label} className="p-2 rounded-xl bg-muted/30 text-center">
                <p className="text-xs font-bold">{s.value}</p>
                <p className="text-[8px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="w-full flex gap-2 mb-3">
            <button onClick={() => onNavigate('rate')} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <Star className="w-4 h-4" /> Avaliar
            </button>
            <button className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <Car className="w-4 h-4" /> Uber
            </button>
          </div>
        </div>
      );

    case 'rate':
      return (
        <div className="px-5 pb-4">
          <Header title="Avaliação" back="close" />
          <div className="text-center mb-4">
            <ItemIcon cat="music" size="xl" className="mx-auto" />
            <h2 className="font-display text-lg font-bold mt-2">Como foi a noite?</h2>
          </div>
          {[
            { label: 'Música', icon: Music },
            { label: 'Ambiente', icon: Sparkles },
            { label: 'Drinks', icon: GlassWater },
            { label: 'Atendimento', icon: ThumbsUp },
          ].map(cat => (
            <div key={cat.label} className="mb-3">
              <p className="text-sm font-semibold mb-1 flex items-center gap-1.5"><cat.icon className="w-3.5 h-3.5 text-primary" /> {cat.label}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} className="flex-1 py-2 rounded-lg border border-border text-center">
                    <Star className={`w-5 h-5 mx-auto ${s <= 4 ? 'text-accent fill-accent' : 'text-muted'}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-2 flex-wrap mb-4">
            {['Som incrível', 'DJ top', 'Ótimos drinks', 'Pulseira prática', 'Camarote 10/10'].map(tag => (
              <button key={tag} className="px-2.5 py-1 rounded-full bg-muted text-[10px] text-muted-foreground">{tag}</button>
            ))}
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <ThumbsUp className="w-5 h-5" /> Enviar Avaliação
          </button>
        </div>
      );

    default: return null;
  }
};
