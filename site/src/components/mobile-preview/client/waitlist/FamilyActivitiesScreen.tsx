import { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import { ArrowLeft, Palette, Gamepad2, Map, ChefHat, Baby, Armchair, Star, Clock, Check } from 'lucide-react';

const activities = [
  { id: '1', name: 'Colorir', desc: 'Desenhos do menu para colorir e levar para casa', icon: Palette, active: true },
  { id: '2', name: 'Quiz Gastronômico', desc: 'Perguntas divertidas sobre comida e ingredientes', icon: Gamepad2, active: true },
  { id: '3', name: 'Caça ao Tesouro', desc: 'Encontre itens escondidos pelo restaurante', icon: Map, active: false },
  { id: '4', name: 'Mini Chef', desc: 'Montar o próprio prato com ingredientes seguros', icon: ChefHat, active: true },
];

const ageSuggestions = [
  { range: '0-2 anos', items: [{ name: 'Espaço Amamentação', icon: Baby }, { name: 'Cadeirão Alto', icon: Armchair }] },
  { range: '3-6 anos', items: [{ name: 'Kit Colorir', icon: Palette }, { name: 'Menu Ilustrado', icon: Star }] },
  { range: '7-12 anos', items: [{ name: 'Quiz Digital', icon: Gamepad2 }, { name: 'Caça ao Tesouro', icon: Map }] },
];

export const FamilyActivitiesScreen = () => {
  const { goBack, navigate } = useMobilePreview();
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['1', '2', '4']);
  const estimatedWait = 20;

  const toggleActivity = (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (!activity?.active) return;
    setSelectedActivities(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">Atividades Kids</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Espera estimada: ~{estimatedWait}min</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 pb-28 space-y-4">
        {/* Info */}
        <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
          <p className="text-xs text-foreground">🎉 Escolha atividades para entreter as crianças enquanto aguardam. Os kits serão preparados pela equipe!</p>
        </div>

        {/* Activities */}
        <h3 className="font-semibold text-sm text-foreground">Atividades Disponíveis</h3>
        {activities.map(activity => {
          const Icon = activity.icon;
          const selected = selectedActivities.includes(activity.id);
          return (
            <button
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              disabled={!activity.active}
              className={`w-full p-4 rounded-2xl border text-left transition-all ${
                !activity.active ? 'opacity-50 cursor-not-allowed border-border bg-muted' :
                selected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selected ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className={`h-5 w-5 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">{activity.name}</p>
                  <p className="text-xs text-muted-foreground">{activity.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'bg-primary border-primary' : 'border-border'}`}>
                  {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
              </div>
              {!activity.active && <span className="text-[10px] text-muted-foreground mt-1 block">Indisponível no momento</span>}
            </button>
          );
        })}

        {/* Age Suggestions */}
        <h3 className="font-semibold text-sm text-foreground mt-2">Sugestões por Faixa Etária</h3>
        {ageSuggestions.map(group => (
          <div key={group.range} className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-semibold text-primary mb-2">{group.range}</p>
            <div className="flex gap-3">
              {group.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-foreground">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <button onClick={() => navigate('virtual-queue')} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
          Confirmar e Entrar na Fila ({selectedActivities.length} atividades)
        </button>
      </div>
    </div>
  );
};
