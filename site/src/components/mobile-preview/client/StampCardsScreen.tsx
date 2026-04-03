import { useMobilePreview } from '../context/MobilePreviewContext';
import { ArrowLeft, Star, Gift, Check } from 'lucide-react';

const stampCards = [
  { id: '1', serviceType: 'Dine-in', icon: '🍽️', current: 7, total: 10, reward: 'Sobremesa grátis', completed: false, cycles: 2 },
  { id: '2', serviceType: 'Delivery', icon: '🛵', current: 3, total: 8, reward: 'Frete grátis no próximo pedido', completed: false, cycles: 0 },
  { id: '3', serviceType: 'Takeout', icon: '🛍️', current: 5, total: 5, reward: '15% de desconto', completed: true, cycles: 1 },
  { id: '4', serviceType: 'Café', icon: '☕', current: 8, total: 12, reward: 'Café grátis', completed: false, cycles: 3 },
  { id: '5', serviceType: 'Happy Hour', icon: '🍺', current: 2, total: 6, reward: 'Drink em dobro', completed: false, cycles: 0 },
];

export const StampCardsScreen = () => {
  const { goBack } = useMobilePreview();

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" /> Cartões de Carimbo
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 pb-24 space-y-4">
        {stampCards.map(card => (
          <div key={card.id} className={`p-4 rounded-2xl border ${card.completed ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-card border-border'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{card.icon}</span>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{card.serviceType}</h3>
                  {card.cycles > 0 && <p className="text-[10px] text-primary">{card.cycles}x completado anteriormente</p>}
                </div>
              </div>
              {card.completed && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 px-2 py-1 rounded-full bg-emerald-500/10">
                  <Check className="h-3 w-3" /> Completo
                </span>
              )}
            </div>

            {/* Stamp Grid */}
            <div className="flex flex-wrap gap-2 mb-3">
              {Array.from({ length: card.total }).map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  i < card.current ? 'bg-primary border-primary scale-100' : 'border-border bg-muted scale-95'
                }`}>
                  {i < card.current ? (
                    <Star className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{i + 1}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{card.current}/{card.total} carimbos</p>
              <div className="flex items-center gap-1">
                <Gift className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-medium text-foreground">{card.reward}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(card.current / card.total) * 100}%` }} />
            </div>

            {card.completed && (
              <button className="w-full mt-3 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-1">
                <Gift className="h-4 w-4" /> Resgatar Recompensa
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
