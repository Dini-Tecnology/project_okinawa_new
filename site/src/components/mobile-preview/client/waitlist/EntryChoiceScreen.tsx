import { useMobilePreview } from '../../context/MobilePreviewContext';
import { ArrowLeft, Users, Clock, Baby, Beer, ChevronRight, Utensils } from 'lucide-react';

export const EntryChoiceScreen = () => {
  const { goBack, navigate } = useMobilePreview();

  const stats = { totalWaiting: 8, avgWait: 25, tablesAvailable: 3, groupsWithKids: 2 };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="font-display text-lg font-bold text-foreground">Como deseja entrar?</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 pb-24 space-y-4">
        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-2xl bg-card border border-border text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.totalWaiting}</p>
            <p className="text-xs text-muted-foreground">Na fila</p>
          </div>
          <div className="flex-1 p-3 rounded-2xl bg-card border border-border text-center">
            <Clock className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.avgWait}min</p>
            <p className="text-xs text-muted-foreground">Espera média</p>
          </div>
          <div className="flex-1 p-3 rounded-2xl bg-card border border-border text-center">
            <Utensils className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.tablesAvailable}</p>
            <p className="text-xs text-muted-foreground">Mesas livres</p>
          </div>
        </div>

        {/* Entry Options */}
        <h2 className="font-semibold text-sm text-foreground">Escolha o tipo de entrada</h2>

        <button onClick={() => navigate('virtual-queue')} className="w-full p-4 rounded-2xl bg-card border border-border flex items-center gap-4 text-left hover:border-primary transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">Fila Normal</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Entre na fila virtual e acompanhe sua posição em tempo real</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <button onClick={() => navigate('family-mode')} className="w-full p-4 rounded-2xl bg-card border border-border flex items-center gap-4 text-left hover:border-primary transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Baby className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">Modo Família</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Prioridade para famílias com crianças. Cadeirão, menu kids e atividades</p>
            {stats.groupsWithKids > 0 && (
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">{stats.groupsWithKids} famílias na fila</span>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <button onClick={() => navigate('waitlist-bar')} className="w-full p-4 rounded-2xl bg-card border border-border flex items-center gap-4 text-left hover:border-primary transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Beer className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">Pedir Antecipado</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Peça drinks e petiscos enquanto aguarda. Entrega garantida na mesa</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Info */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-xs text-foreground">
            💡 <strong>Dica:</strong> Ao selecionar "Modo Família", seu grupo recebe prioridade na acomodação e acesso a recursos especiais para crianças.
          </p>
        </div>
      </div>
    </div>
  );
};
