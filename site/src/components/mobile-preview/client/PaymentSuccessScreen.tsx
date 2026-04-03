import { useState, useEffect } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { CheckCircle, Star, Trophy, Receipt, Home, Share2 } from 'lucide-react';

export const PaymentSuccessScreen = () => {
  const { navigate } = useMobilePreview();
  const [countdown, setCountdown] = useState(8);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); navigate('home'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const amountPaid = 196.00;
  const pointsEarned = 196;

  return (
    <div className="h-full flex flex-col bg-background items-center justify-center px-6">
      {/* Animated Checkmark */}
      <div className={`w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5 transition-transform duration-500 ${showContent ? 'scale-100' : 'scale-0'}`}>
        <CheckCircle className="h-14 w-14 text-emerald-500" />
      </div>

      <div className={`w-full transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-2xl font-bold text-center text-foreground mb-1">Pagamento Confirmado!</h1>
        <p className="text-center text-muted-foreground text-sm mb-6">Seu pagamento de R$ {amountPaid.toFixed(2)} foi processado com sucesso</p>

        {/* Summary Card */}
        <div className="p-4 rounded-2xl bg-card border border-border mb-3">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Método</span>
            <span className="text-sm font-medium text-foreground">Cartão de Crédito</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Valor</span>
            <span className="text-sm font-medium text-foreground">R$ {amountPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Data/Hora</span>
            <span className="text-sm font-medium text-foreground">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Loyalty Points */}
        <div className="p-4 rounded-2xl bg-card border border-border mb-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">+{pointsEarned} pontos ganhos!</p>
            <p className="text-xs text-muted-foreground">Acumule e troque por recompensas</p>
          </div>
        </div>

        {/* Badge */}
        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nova conquista</p>
            <p className="text-sm font-bold text-accent">Gourmet Explorer</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button onClick={() => navigate('digital-receipt')} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
            <Receipt className="h-4 w-4" /> Ver Comprovante
          </button>
          <button onClick={() => navigate('home')} className="w-full py-3 rounded-xl text-foreground font-medium text-sm flex items-center justify-center gap-2">
            <Home className="h-4 w-4" /> Voltar ao Início
          </button>
          <button className="w-full py-3 rounded-xl border border-border text-foreground font-medium text-sm flex items-center justify-center gap-2">
            <Share2 className="h-4 w-4" /> Compartilhar
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Redirecionando em {countdown}s...
        </p>
      </div>
    </div>
  );
};
