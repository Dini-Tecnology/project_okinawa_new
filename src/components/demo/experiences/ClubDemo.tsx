/**
 * Club & Balada Demo — NOOWE Club
 * Deep UX: Event Discovery → Lineup → Ticket Purchase → Digital Ticket (QR) → Guest List Management →
 * Virtual Queue → VIP Table Selection (visual map) → Bottle Service with suggestions →
 * Min Spend Tracker (real-time) → Dance Floor Ordering → End of Night Summary → Rate & Uber
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint, ItemIcon } from '../DemoShared';
import {
  ArrowLeft, Check, Star, Clock, Plus, Minus, CreditCard, Gift, QrCode,
  Users, Timer, ArrowRight, Music, Ticket, Crown, MapPin, UserPlus,
  Share2, Copy, Sparkles, Lock, Eye, ChevronRight, Bell, Car, ThumbsUp,
  Search, Heart, AlertTriangle, Zap,
} from 'lucide-react';

type Screen =
  | 'home' | 'club-detail' | 'lineup' | 'tickets' | 'digital-ticket'
  | 'guest-list' | 'virtual-queue' | 'vip-table' | 'vip-map'
  | 'bottle-service' | 'bottle-detail' | 'min-spend' | 'floor-order'
  | 'close' | 'rate';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir evento', screens: ['home', 'club-detail'] },
  { step: 2, label: 'Ver lineup', screens: ['lineup'] },
  { step: 3, label: 'Comprar ingresso', screens: ['tickets', 'digital-ticket'] },
  { step: 4, label: 'Gerenciar convidados', screens: ['guest-list'] },
  { step: 5, label: 'Fila virtual', screens: ['virtual-queue'] },
  { step: 6, label: 'Reservar camarote', screens: ['vip-table', 'vip-map'] },
  { step: 7, label: 'Bottle service', screens: ['bottle-service', 'bottle-detail'] },
  { step: 8, label: 'Tracker consumação', screens: ['min-spend'] },
  { step: 9, label: 'Pedir da pista', screens: ['floor-order'] },
  { step: 10, label: 'Encerrar noite', screens: ['close', 'rate'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Eventos', desc: 'Descubra as melhores noites da cidade.' },
  'club-detail': { emoji: '🎵', title: 'NOOWE Club', desc: 'Detalhes do evento com lotação em tempo real.' },
  'lineup': { emoji: '🎧', title: 'Lineup', desc: 'DJs e horários com bio e setlist.' },
  'tickets': { emoji: '🎫', title: 'Ingressos', desc: 'Lotes com preço dinâmico e comparação.' },
  'digital-ticket': { emoji: '📱', title: 'Ingresso Digital', desc: 'QR Code animado anti-fraude.' },
  'guest-list': { emoji: '📋', title: 'Guest List', desc: 'Gerencie seus convidados e +1s.' },
  'virtual-queue': { emoji: '🚶', title: 'Fila Virtual', desc: 'Posição na fila sem ficar no frio.' },
  'vip-table': { emoji: '👑', title: 'Camarotes', desc: 'Opções de camarote com consumação mínima.' },
  'vip-map': { emoji: '🗺️', title: 'Mapa VIP', desc: 'Escolha a posição do seu camarote.' },
  'bottle-service': { emoji: '🍾', title: 'Bottle Service', desc: 'Cardápio premium com sugestões do DJ.' },
  'bottle-detail': { emoji: '🥃', title: 'Detalhe Garrafa', desc: 'Ficha completa com mixers inclusos.' },
  'min-spend': { emoji: '📊', title: 'Consumação', desc: 'Tracker de consumação mínima em tempo real.' },
  'floor-order': { emoji: '🍹', title: 'Pedir da Pista', desc: 'Peça drinks sem sair da pista.' },
  'close': { emoji: '✅', title: 'Encerramento', desc: 'Resumo da noite com todos os gastos.' },
  'rate': { emoji: '⭐', title: 'Avaliação', desc: 'Avalie a noite e ganhe pontos.' },
};

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

const BOTTLES = [
  { id: 'b1', name: 'Absolut Vodka', price: 350, emoji: '🍸', desc: '750ml · Inclui 4 energéticos', category: 'Vodka' },
  { id: 'b2', name: 'Grey Goose', price: 580, emoji: '🍸', desc: '750ml · Premium · Inclui tônica', category: 'Vodka' },
  { id: 'b3', name: 'Moët Chandon', price: 650, emoji: '🍾', desc: '750ml · Brut Impérial', category: 'Espumante' },
  { id: 'b4', name: 'Johnnie Walker Black', price: 480, emoji: '🥃', desc: '750ml · 12 anos · Inclui gelo e água', category: 'Whisky' },
  { id: 'b5', name: 'Balde Cerveja (6)', price: 120, emoji: '🍺', desc: '6 long necks premium', category: 'Cerveja' },
  { id: 'b6', name: 'Don Julio Tequila', price: 520, emoji: '🫙', desc: '750ml · Reposado · Inclui limões', category: 'Tequila' },
];

export const ClubDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [ticketType, setTicketType] = useState<'pista' | 'vip' | 'open'>('pista');
  const [selectedBottle, setSelectedBottle] = useState(BOTTLES[0]);
  const [consumed, setConsumed] = useState(1580);
  const minimum = 3000;
  const progress = Math.round((consumed / minimum) * 100);
  const [queuePos, setQueuePos] = useState(12);
  const [countdown, setCountdown] = useState({ h: 3, m: 42 });
  const [guests, setGuests] = useState([
    { name: 'Você', status: 'confirmed' as const },
    { name: 'Pedro', status: 'confirmed' as const },
    { name: 'Camila', status: 'confirmed' as const },
    { name: 'Rafael', status: 'pending' as const },
    { name: 'Julia', status: 'declined' as const },
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
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-3">
            <p className="text-sm text-muted-foreground">Hoje à noite</p>
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
            {['Hoje 🔥', 'Este fds', 'Tech House', 'Funk', 'Sertanejo', 'Open Bar'].map((f, i) => (
              <button key={f} className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f}</button>
            ))}
          </div>
          <GuidedHint text="Compre ingressos, reserve camarote e controle gastos pelo app" />
          <button onClick={() => onNavigate('club-detail')} className="w-full text-left mb-3">
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <div className="h-32 bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center relative">
                <span className="text-5xl">🎵</span>
                <div className="absolute top-2 left-3 flex gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[9px] font-bold">HOJE</span>
                  <span className="px-2 py-0.5 rounded-full bg-warning/90 text-primary-foreground text-[9px] font-bold">Lote 2</span>
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
          <div className="p-3 rounded-2xl border border-border bg-card flex items-center gap-3">
            <span className="text-3xl">🎤</span>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Samba do Noowe</h3>
              <p className="text-[10px] text-muted-foreground">Sábado · Roda de samba · R$ 40</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      );

    case 'club-detail':
      return (
        <div className="px-5 pb-4">
          <Header title="NOOWE Club" back="home" right={<button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Share2 className="w-4 h-4" /></button>} />
          <div className="text-center mb-4">
            <span className="text-5xl">🎵</span>
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
                <p className="text-xs font-semibold">Countdown</p>
                <p className="text-[10px] text-muted-foreground">Começa em {countdown.h}h {countdown.m}min</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <button onClick={() => onNavigate('lineup')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <Music className="w-4 h-4" /> Ver Lineup Completo
            </button>
            <button onClick={() => onNavigate('tickets')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
              <Ticket className="w-5 h-5" /> Comprar Ingresso
            </button>
            <button onClick={() => onNavigate('vip-table')} className="w-full py-3.5 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-600/20 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-accent" /> Reservar Camarote VIP
            </button>
          </div>
        </div>
      );

    case 'lineup':
      return (
        <div className="px-5 pb-4">
          <Header title="Lineup" back="club-detail" />
          <div className="space-y-3 mb-4">
            {[
              { name: 'DJ Marcos', time: '23:00 - 01:00', genre: 'Tech House', bio: 'Residente do NOOWE Club · 8 anos de carreira', headliner: false },
              { name: 'Special Guest', time: '01:00 - 03:00', genre: '???', bio: 'Revelação no horário nobre · Surpresa!', headliner: true },
              { name: 'DJ Fernanda', time: '03:00 - 05:00', genre: 'Minimal', bio: 'Passagens por Berghain e Fabric London', headliner: false },
              { name: 'Sunset Closing', time: '05:00 - 06:00', genre: 'Deep House', bio: 'Set de encerramento ao nascer do sol', headliner: false },
            ].map((dj, i) => (
              <div key={i} className={`p-4 rounded-xl border ${dj.headliner ? 'border-primary bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full ${dj.headliner ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-muted'} flex items-center justify-center`}>
                      <Music className={`w-5 h-5 ${dj.headliner ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{dj.name}</p>
                        {dj.headliner && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold">⭐ Headliner</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{dj.genre} · {dj.time}</p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 pl-12">{dj.bio}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('tickets')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground rounded-xl font-semibold shadow-glow">
            Comprar Ingresso
          </button>
        </div>
      );

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
              { id: 'pista' as const, name: 'Pista', price: 60, original: 80, desc: 'Acesso à pista principal', perks: ['Entrada após 23:30', 'R$ 60 vira crédito consumação'], avail: 23 },
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
              <span className="text-xs text-success font-medium">R$ 60 convertido em crédito de consumação</span>
            </div>
          )}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 mb-4">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Lotação: 72% · Fila: ~{queuePos} min</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('guest-list')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <UserPlus className="w-4 h-4" /> Convidados
            </button>
            <button onClick={() => onNavigate('virtual-queue')} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              <Users className="w-4 h-4" /> Entrar na Fila
            </button>
          </div>
        </div>
      );

    case 'guest-list':
      return (
        <div className="px-5 pb-4">
          <Header title="Convidados" back="digital-ticket" />
          <GuidedHint text="Gerencie seus convidados — cada um recebe o QR no celular" />
          <div className="space-y-2 mb-4">
            {guests.map((g, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${g.status === 'confirmed' ? 'border-success/30 bg-success/5' : g.status === 'pending' ? 'border-warning/30 bg-warning/5' : 'border-border bg-muted/30'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${g.status === 'confirmed' ? 'bg-success text-primary-foreground' : g.status === 'pending' ? 'bg-warning text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {g.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{g.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {g.status === 'confirmed' ? '✓ Confirmado' : g.status === 'pending' ? '⏳ Pendente' : '✕ Recusou'}
                  </p>
                </div>
                {g.status === 'pending' && (
                  <button className="px-2 py-1 rounded-lg bg-warning/20 text-[10px] text-warning font-semibold">Reenviar</button>
                )}
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border mb-4">
            <UserPlus className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Convidar mais pessoas</span>
          </button>
          <div className="p-3 rounded-xl bg-card border border-border mb-4">
            <p className="text-xs font-semibold mb-1">Compartilhar convite</p>
            <div className="flex items-center gap-2">
              <span className="flex-1 text-xs text-muted-foreground truncate">noowe.app/event/NC-847/invite</span>
              <button className="p-1.5 rounded-md bg-primary/10"><Copy className="w-3 h-3 text-primary" /></button>
              <button className="p-1.5 rounded-md bg-primary/10"><Share2 className="w-3 h-3 text-primary" /></button>
            </div>
          </div>
          <button onClick={() => onNavigate('virtual-queue')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Entrar na Fila Virtual
          </button>
        </div>
      );

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
            <p className="text-xs font-bold mb-2">💡 Dicas enquanto espera:</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>🚶 Pode sair da fila física — notificaremos quando chegar sua vez</p>
              <p>🍹 Peça drinks pelo app e retire no bar da entrada</p>
              <p>👥 Seus convidados entram com você automaticamente</p>
            </div>
          </div>
          {queuePos <= 2 && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 mb-4 text-center animate-pulse">
              <Bell className="w-5 h-5 text-success mx-auto mb-1" />
              <p className="text-sm font-bold text-success">Quase lá!</p>
              <p className="text-xs text-muted-foreground">Dirija-se à entrada</p>
            </div>
          )}
          <button onClick={() => onNavigate('vip-table')} className="w-full py-4 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-600/20 rounded-xl font-semibold flex items-center justify-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-accent" /> Skip a fila — Reserve Camarote VIP
          </button>
          <button onClick={() => onNavigate('floor-order')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">
            🍹 Pedir Drink na Espera
          </button>
        </div>
      );

    case 'vip-table':
      return (
        <div className="px-5 pb-4">
          <Header title="Camarotes VIP" back="club-detail" />
          <GuidedHint text="Escolha o camarote e veja a posição no mapa do club" />
          <div className="space-y-3 mb-4">
            {[
              { name: 'Lounge', people: '6-8', min: 2000, deposit: 800, avail: true, pos: 'Lateral pista' },
              { name: 'Premium', people: '8-12', min: 3000, deposit: 1200, avail: true, pos: 'Frente palco', recommended: true },
              { name: 'Stage', people: '10-15', min: 5000, deposit: 2000, avail: false, pos: 'Palco' },
              { name: 'Sky Box', people: '15-20', min: 8000, deposit: 3000, avail: true, pos: 'Terraço', pos_detail: 'Vista panorâmica' },
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
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-purple-500/20 text-[10px] font-bold text-purple-500">🎧 PALCO</div>
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-32 h-16 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-[10px] text-muted-foreground">
              🕺 PISTA
            </div>
            {/* Tables */}
            <div className="absolute bottom-16 left-4 px-2 py-1.5 rounded-lg bg-muted border border-border text-[9px] text-muted-foreground opacity-50">Lounge</div>
            <div className="absolute bottom-16 right-4 px-2 py-1.5 rounded-lg bg-primary/20 border-2 border-primary text-[9px] text-primary font-bold animate-pulse">✓ Premium</div>
            <div className="absolute top-12 right-3 px-2 py-1.5 rounded-lg bg-muted/50 border border-border text-[9px] text-muted-foreground line-through">Stage</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-lg bg-muted border border-border text-[9px] text-muted-foreground">Sky Box 🏙️</div>
            {/* Bar */}
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-amber-500/20 text-[8px] text-amber-600">🍸 Bar</div>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
            <p className="font-bold text-sm mb-1">Camarote Premium Selecionado</p>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>📍 Frente ao palco · 8-12 pessoas</p>
              <p>💰 Consumação mínima: R$ 3.000</p>
              <p>💳 Depósito (convertido): R$ 1.200</p>
              <p>🍾 Garçom exclusivo + mixers cortesia</p>
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

    case 'bottle-service':
      return (
        <div className="px-5 pb-4">
          <Header title="🍾 Bottle Service" back="vip-map" />
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-medium">Sugestão do bartender para Tech House 🎧</span>
          </div>
          <div className="space-y-2 mb-4">
            {BOTTLES.map(bottle => (
              <button key={bottle.id} onClick={() => { setSelectedBottle(bottle); onNavigate('bottle-detail'); }}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left">
                <span className="text-2xl">{bottle.emoji}</span>
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

    case 'bottle-detail':
      return (
        <div className="px-5 pb-4">
          <Header title={selectedBottle.name} back="bottle-service" />
          <div className="text-center mb-4">
            <span className="text-6xl">{selectedBottle.emoji}</span>
            <h2 className="font-display text-lg font-bold mt-2">{selectedBottle.name}</h2>
            <p className="text-sm text-muted-foreground">{selectedBottle.desc}</p>
            <p className="font-display text-2xl font-bold text-primary mt-2">R$ {selectedBottle.price}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <p className="text-xs font-semibold mb-2">Incluso:</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" /> 4 energéticos</p>
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" /> Gelo e copos</p>
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" /> Frutas e garnish</p>
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" /> Água mineral (2L)</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 mb-4">
            <p className="text-xs font-semibold mb-1">Quantidade</p>
            <div className="flex items-center gap-4">
              <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Minus className="w-4 h-4" /></button>
              <span className="font-display text-xl font-bold">1</span>
              <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <button onClick={() => { setConsumed(prev => prev + selectedBottle.price); onNavigate('min-spend'); }}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Adicionar · R$ {selectedBottle.price}
          </button>
        </div>
      );

    case 'min-spend':
      return (
        <div className="px-5 pb-4">
          <Header title="Consumação" back="bottle-service" right={
            <button onClick={() => onNavigate('floor-order')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
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
              <div>
                <p className="text-xs font-bold">R$ {consumed.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">Consumido</p>
              </div>
              <div>
                <p className="text-xs font-bold text-success">-R$ 1.380</p>
                <p className="text-[9px] text-muted-foreground">Créditos</p>
              </div>
              <div>
                <p className="text-xs font-bold text-warning">R$ {Math.max(0, minimum - consumed).toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">Faltam</p>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-sm mb-2">Últimos pedidos</h3>
          <div className="space-y-1 mb-4">
            {[
              { item: 'Grey Goose', who: 'Você', price: 580, time: '01:45' },
              { item: 'Balde Cerveja', who: 'Pedro', price: 120, time: '02:10' },
              { item: 'Gin Tônica (3x)', who: 'Mesa', price: 114, time: '02:30' },
              { item: 'Moët Chandon', who: 'Camila', price: 650, time: '02:50' },
              { item: 'Energéticos (4x)', who: 'Mesa', price: 116, time: '03:15' },
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
              🍾 Garrafas
            </button>
            <button onClick={() => onNavigate('floor-order')} className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-1">
              🍹 Drinks
            </button>
          </div>
          <button onClick={() => onNavigate('close')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground rounded-xl font-bold shadow-glow">
            Fechar Camarote
          </button>
        </div>
      );

    case 'floor-order':
      return (
        <div className="px-5 pb-4">
          <Header title="Pedir da Pista" back="min-spend" />
          <GuidedHint text="Peça sem sair da pista — retira no bar mais perto" />
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4">
            <p className="text-xs font-medium">📍 Bar mais próximo: <span className="font-bold text-primary">Bar Pista Central</span> · 15m</p>
          </div>
          <div className="space-y-2 mb-4">
            {[
              { name: 'Gin Tônica', price: 38, emoji: '🍸' },
              { name: 'Vodka Red Bull', price: 35, emoji: '🍹' },
              { name: 'Cerveja Long Neck', price: 18, emoji: '🍺' },
              { name: 'Água', price: 8, emoji: '💧' },
              { name: 'Energético', price: 20, emoji: '⚡' },
              { name: 'Shot Tequila', price: 25, emoji: '🫙' },
            ].map((d, i) => (
              <button key={i} onClick={() => { setConsumed(prev => prev + d.price); onNavigate('min-spend'); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                <span className="text-xl">{d.emoji}</span>
                <div className="flex-1"><p className="font-semibold text-sm">{d.name}</p></div>
                <span className="font-semibold text-sm text-primary">R$ {d.price}</span>
              </button>
            ))}
          </div>
        </div>
      );

    case 'close':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-5 shadow-xl shadow-purple-500/30">
            <Music className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-1">Noite Incrível! 🎵</h2>
          <p className="text-sm text-muted-foreground mb-4">NOOWE Club · Tech House Night</p>
          <div className="w-full p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Camarote Premium</span><span>R$ 3.000</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Consumido total</span><span>R$ {consumed.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-success">Créditos (entradas + depósito)</span><span className="text-success">-R$ 1.380</span></div>
            <div className="border-t-2 border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
              <span>Total pago</span>
              <span className="text-primary">R$ {Math.max(0, consumed - 1380).toLocaleString()}</span>
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
            <span className="text-4xl">🎵</span>
            <h2 className="font-display text-lg font-bold mt-2">Como foi a noite?</h2>
          </div>
          {[
            { label: 'Música', emoji: '🎧' },
            { label: 'Ambiente', emoji: '✨' },
            { label: 'Drinks', emoji: '🍸' },
            { label: 'Atendimento', emoji: '👨‍🍳' },
          ].map(cat => (
            <div key={cat.label} className="mb-3">
              <p className="text-sm font-semibold mb-1">{cat.emoji} {cat.label}</p>
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
            {['Som incrível', 'DJ top', 'Ótimos drinks', 'Boa lotação', 'Camarote 10/10'].map(tag => (
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
