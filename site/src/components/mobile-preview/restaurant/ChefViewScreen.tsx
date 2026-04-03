import { FC, useState } from 'react';
import { ChevronLeft, Flame, Clock, AlertTriangle, Users } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

const stations = [
  { id: '1', name: 'Grelha', emoji: '🔥', active: 5, late: 1, avgMin: 8 },
  { id: '2', name: 'Frios', emoji: '❄️', active: 3, late: 0, avgMin: 4 },
  { id: '3', name: 'Massas', emoji: '🍝', active: 4, late: 0, avgMin: 12 },
  { id: '4', name: 'Sobremesas', emoji: '🍰', active: 2, late: 0, avgMin: 6 },
];

export const ChefViewScreen: FC = () => {
  const { navigate } = useMobilePreview();

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Visão do Chef</h1>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 p-4">
        {[{ label: 'Mesas Ativas', value: '12', icon: Users }, { label: 'Fila Entrega', value: '6', icon: Clock }, { label: 'Tempo Médio', value: '9min', icon: Flame }].map(m => (
          <div key={m.label} className="bg-card rounded-xl border border-border p-3 text-center">
            <m.icon className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        <h3 className="font-semibold text-foreground text-sm">Estações</h3>
        {stations.map(s => (
          <button key={s.id} onClick={() => navigate('cook-station')} className="w-full bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <span className="text-2xl">{s.emoji}</span>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.active} pedidos · ~{s.avgMin}min</p>
            </div>
            {s.late > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                <AlertTriangle className="w-3 h-3" /> {s.late}
              </span>
            )}
          </button>
        ))}

        {/* Alerts */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">Alertas</span>
          </div>
          <p className="text-xs text-muted-foreground">Mesa 7 · Filé Mignon · 18min (SLA: 15min)</p>
          <p className="text-xs text-muted-foreground mt-1">Estoque baixo: Salmão (2 porções restantes)</p>
        </div>
      </div>
    </div>
  );
};
