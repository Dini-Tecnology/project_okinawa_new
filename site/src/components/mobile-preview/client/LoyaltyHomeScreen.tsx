import { useMobilePreview } from '../context/MobilePreviewContext';
import { ArrowLeft, Crown, Star, Gift, Ticket, ChevronRight, TrendingUp, Award } from 'lucide-react';

const stampCards = [
  { id: '1', type: 'Dine-in', current: 7, total: 10, reward: 'Sobremesa grátis', cycles: 2 },
  { id: '2', type: 'Delivery', current: 3, total: 8, reward: 'Frete grátis', cycles: 0 },
  { id: '3', type: 'Takeout', current: 5, total: 5, reward: '15% de desconto', cycles: 1, completed: true },
];

const promos = [
  { id: '1', code: 'NOOWE10', title: '10% de desconto', validUntil: '28/02/2025', type: 'discount' },
  { id: '2', code: 'FRETE0', title: 'Frete grátis', validUntil: '15/02/2025', type: 'shipping' },
];

export const LoyaltyHomeScreen = () => {
  const { goBack, navigate } = useMobilePreview();

  const points = 1240;
  const tier = 'Gold';
  const nextTier = 'Platinum';
  const pointsToNext = 760;
  const totalVisits = 48;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Crown className="h-5 w-5 text-accent" /> Fidelidade
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-24 space-y-4">
        {/* Tier Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-accent to-accent/70 text-accent-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium">Nível {tier}</span>
            </div>
            <p className="text-4xl font-bold mb-1">{points.toLocaleString()}</p>
            <p className="text-sm opacity-80">{pointsToNext} pts para {nextTier}</p>
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${(points / (points + pointsToNext)) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-2xl bg-card border border-border text-center">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{totalVisits}</p>
            <p className="text-xs text-muted-foreground">Visitas</p>
          </div>
          <div className="flex-1 p-3 rounded-2xl bg-card border border-border text-center">
            <Award className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">3</p>
            <p className="text-xs text-muted-foreground">Recompensas</p>
          </div>
          <div className="flex-1 p-3 rounded-2xl bg-card border border-border text-center">
            <Ticket className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{promos.length}</p>
            <p className="text-xs text-muted-foreground">Cupons</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <button onClick={() => navigate('loyalty')} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
            <Gift className="h-5 w-5 text-primary" />
            <span className="flex-1 text-sm font-medium text-foreground text-left">Trocar Pontos</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => navigate('loyalty-leaderboard')} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="flex-1 text-sm font-medium text-foreground text-left">Ranking</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => navigate('stamp-cards')} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
            <Award className="h-5 w-5 text-emerald-500" />
            <span className="flex-1 text-sm font-medium text-foreground text-left">Cartões de Carimbo</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Stamp Cards Preview */}
        <h3 className="font-semibold text-sm text-foreground">Cartões de Carimbo</h3>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {stampCards.map(card => (
            <div key={card.id} className="min-w-[200px] p-4 rounded-2xl bg-card border border-border shrink-0">
              <p className="font-semibold text-sm text-foreground mb-1">{card.type}</p>
              <p className="text-xs text-muted-foreground mb-2">{card.reward}</p>
              <div className="flex gap-1 flex-wrap mb-2">
                {Array.from({ length: card.total }).map((_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${i < card.current ? 'bg-primary border-primary' : 'border-border'}`}>
                    {i < card.current && <Star className="h-2.5 w-2.5 text-primary-foreground" />}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{card.current}/{card.total} {card.completed ? '• Completo!' : ''}</p>
              {card.cycles > 0 && <p className="text-[10px] text-primary mt-1">{card.cycles}x completado</p>}
            </div>
          ))}
        </div>

        {/* Active Promos */}
        <h3 className="font-semibold text-sm text-foreground">Cupons Disponíveis</h3>
        {promos.map(promo => (
          <div key={promo.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
            <Ticket className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{promo.title}</p>
              <p className="text-xs text-muted-foreground">Código: {promo.code} • Até {promo.validUntil}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
