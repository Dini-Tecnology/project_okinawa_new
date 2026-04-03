import { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import { ArrowLeft, Gift, Calendar, Users, Minus, Plus, Check, Music, Star, Crown } from 'lucide-react';

const packages = [
  { id: 'basic', name: 'Básico', tier: 'basic', price: 500, maxParty: 10, includes: ['Mesa reservada', '1 garrafa de espumante', 'Bolo decorado', 'Entrada VIP para todos'] },
  { id: 'premium', name: 'Premium', tier: 'premium', price: 1200, maxParty: 20, includes: ['Camarote privativo', '3 garrafas premium', 'Bolo personalizado', 'DJ set dedicado', 'Fotos profissionais', 'Decoração temática'] },
  { id: 'vip', name: 'VIP Ultimate', tier: 'vip', price: 3000, maxParty: 40, includes: ['Área exclusiva', '6 garrafas top shelf', 'Bolo gourmet 3 andares', 'DJ privativo por 2h', 'Vídeo + Fotos', 'Open bar 2h', 'Segurança dedicado'] },
];

const tierIcons: Record<string, any> = { basic: Gift, premium: Star, vip: Crown };
const tierColors: Record<string, string> = { basic: 'bg-muted', premium: 'bg-primary/10', vip: 'bg-accent/10' };
const tierTextColors: Record<string, string> = { basic: 'text-foreground', premium: 'text-primary', vip: 'text-accent' };

export const BirthdayBookingScreen = () => {
  const { goBack, navigate } = useMobilePreview();
  const [selectedPkg, setSelectedPkg] = useState('premium');
  const [partySize, setPartySize] = useState(10);
  const [celebrantName, setCelebrantName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const pkg = packages.find(p => p.id === selectedPkg)!;

  if (step === 'confirm') {
    return (
      <div className="h-full flex flex-col bg-background items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <Check className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Reserva Confirmada!</h2>
        <p className="text-sm text-muted-foreground text-center mb-4">Pacote {pkg.name} para {partySize} pessoas</p>
        <div className="w-full p-4 rounded-2xl bg-card border border-border mb-4 text-sm space-y-2">
          <div className="flex justify-between"><span className="text-muted-foreground">Código</span><span className="font-mono font-bold text-foreground">BDAY-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Aniversariante</span><span className="font-medium text-foreground">{celebrantName || 'A definir'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold text-primary">R$ {pkg.price.toLocaleString()}</span></div>
        </div>
        <button onClick={() => navigate('home')} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Voltar ao Início</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Gift className="h-5 w-5 text-accent" /> Festa de Aniversário
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 pb-28 space-y-4">
        {/* Date */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Data do Evento</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground" />
        </div>

        {/* Celebrant */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Nome do Aniversariante</label>
          <input value={celebrantName} onChange={e => setCelebrantName(e.target.value)} placeholder="Quem está fazendo aniversário?" className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground" />
        </div>

        {/* Party Size */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Número de Convidados</label>
          <div className="flex items-center gap-4">
            <button onClick={() => setPartySize(Math.max(5, partySize - 1))} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><Minus className="h-4 w-4" /></button>
            <span className="text-2xl font-bold text-foreground w-12 text-center">{partySize}</span>
            <button onClick={() => setPartySize(Math.min(pkg.maxParty, partySize + 1))} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"><Plus className="h-4 w-4 text-primary-foreground" /></button>
          </div>
        </div>

        {/* Packages */}
        <h3 className="font-semibold text-sm text-foreground">Escolha o Pacote</h3>
        {packages.map(p => {
          const Icon = tierIcons[p.tier];
          return (
            <button key={p.id} onClick={() => { setSelectedPkg(p.id); if (partySize > p.maxParty) setPartySize(p.maxParty); }}
              className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedPkg === p.id ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full ${tierColors[p.tier]} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${tierTextColors[p.tier]}`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Até {p.maxParty} pessoas</p>
                </div>
                <p className="font-bold text-primary">R$ {p.price.toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.includes.map((inc, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{inc}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <button onClick={() => setStep('confirm')} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
          Reservar • R$ {pkg.price.toLocaleString()}
        </button>
      </div>
    </div>
  );
};
