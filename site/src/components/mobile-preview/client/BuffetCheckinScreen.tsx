import { useState } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { ArrowLeft, QrCode, Minus, Plus, Users, UtensilsCrossed, Bell, Scale, Check } from 'lucide-react';

export const BuffetCheckinScreen = () => {
  const { goBack, navigate } = useMobilePreview();
  const [covers, setCovers] = useState(1);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const pricePerPerson = 59.90;
  const tableNumber = '12';

  if (isCheckedIn) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <h1 className="font-display text-lg font-bold text-foreground">Buffet - Check-in</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Check-in Realizado!</h2>
          <p className="text-sm text-muted-foreground mb-6">Mesa {tableNumber} • {covers} {covers > 1 ? 'pessoas' : 'pessoa'}</p>

          {/* QR Code */}
          <div className="w-48 h-48 bg-card border-2 border-border rounded-2xl flex items-center justify-center mb-4">
            <QrCode className="h-28 w-28 text-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mb-6">Apresente o QR code ao entrar no buffet</p>

          {/* Info Card */}
          <div className="w-full p-4 rounded-2xl bg-card border border-border space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Balança Inteligente</p>
                <p className="text-xs text-muted-foreground">Seu consumo será registrado automaticamente via NFC</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">Self-Service</p>
                <p className="text-xs text-muted-foreground">Sirva-se à vontade em todas as estações</p>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('call-waiter')} className="w-full py-3 rounded-xl border border-primary text-primary font-semibold text-sm flex items-center justify-center gap-2">
            <Bell className="h-4 w-4" /> Chamar Garçom
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" /> Buffet - Entrada
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Price Card */}
        <div className="w-full p-5 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-6">
          <p className="text-sm opacity-90 mb-1">Preço por pessoa</p>
          <p className="text-3xl font-bold mb-1">R$ {pricePerPerson.toFixed(2)}</p>
          <p className="text-xs opacity-80">Self-service ilimitado</p>
        </div>

        {/* Covers Selector */}
        <div className="w-full p-4 rounded-2xl bg-card border border-border mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-sm text-foreground">Pessoas</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setCovers(Math.max(1, covers - 1))} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <Minus className="h-4 w-4 text-foreground" />
              </button>
              <span className="text-xl font-bold text-foreground w-8 text-center">{covers}</span>
              <button onClick={() => setCovers(Math.min(20, covers + 1))} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="w-full p-4 rounded-2xl bg-card border border-border mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">R$ {(covers * pricePerPerson).toFixed(2)}</span>
          </div>
        </div>

        <button onClick={() => setIsCheckedIn(true)} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
          <QrCode className="h-4 w-4" /> Fazer Check-in
        </button>
      </div>
    </div>
  );
};
