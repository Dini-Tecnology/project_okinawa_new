import { FC, useState } from 'react';
import { ChevronLeft, Save } from "lucide-react";
import { useMobilePreview } from '../../context/MobilePreviewContext';

const FLAGS = [
  { key: 'reservationsEnabled', label: 'Reservas Online' },
  { key: 'virtualQueueEnabled', label: 'Fila Virtual' },
  { key: 'familyModeEnabled', label: 'Modo Família' },
  { key: 'qrTableOrdering', label: 'Pedido via QR na Mesa' },
  { key: 'sharedComanda', label: 'Comanda Compartilhada' },
  { key: 'aiHarmonization', label: 'Harmonização por IA' },
  { key: 'happyHourEnabled', label: 'Happy Hour' },
];

export const ConfigExperienceScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [flags, setFlags] = useState<Record<string, boolean>>({
    reservationsEnabled: true, virtualQueueEnabled: true, familyModeEnabled: false,
    qrTableOrdering: true, sharedComanda: true, aiHarmonization: true, happyHourEnabled: false,
  });

  const toggle = (key: string) => setFlags(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('config-hub')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Experiência</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Funcionalidades do Cliente</h3>
          {FLAGS.map(flag => (
            <div key={flag.key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <span className="text-sm text-foreground">{flag.label}</span>
              <button onClick={() => toggle(flag.key)} className={`w-10 h-5 rounded-full transition-colors relative ${flags[flag.key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${flags[flag.key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
        <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  );
};
