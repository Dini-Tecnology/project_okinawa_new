import { FC, useState } from 'react';
import { ChevronLeft, Save } from "lucide-react";
import { useMobilePreview } from '../../context/MobilePreviewContext';

const SERVICE_TYPES = [
  { value: 'fine-dining', label: 'Fine Dining' },
  { value: 'quick-service', label: 'Quick Service' },
  { value: 'fast-casual', label: 'Fast Casual' },
  { value: 'cafe-bakery', label: 'Café & Bakery' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'drive-thru', label: 'Drive-Thru' },
  { value: 'food-truck', label: 'Food Truck' },
  { value: 'chefs-table', label: "Chef's Table" },
  { value: 'casual-dining', label: 'Casual Dining' },
  { value: 'pub-bar', label: 'Pub & Bar' },
  { value: 'club', label: 'Club & Balada' },
];

export const ConfigServiceTypesScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [primary, setPrimary] = useState('fine-dining');
  const [supported, setSupported] = useState(['fine-dining', 'casual-dining', 'pub-bar']);

  const toggleSupported = (val: string) => {
    if (val === primary) return;
    setSupported(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]);
  };

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('config-hub')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Tipos de Serviço</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Tipo Principal</h3>
          <div className="flex flex-wrap gap-2">
            {SERVICE_TYPES.map(st => (
              <button key={st.value} onClick={() => setPrimary(st.value)}
                className={`px-3 py-2 rounded-full text-xs font-medium border transition-colors ${primary === st.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-border hover:border-primary/50'}`}>
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Tipos Suportados</h3>
          <div className="flex flex-wrap gap-2">
            {SERVICE_TYPES.map(st => {
              const selected = supported.includes(st.value) || st.value === primary;
              return (
                <button key={st.value} onClick={() => toggleSupported(st.value)} disabled={st.value === primary}
                  className={`px-3 py-2 rounded-full text-xs font-medium border transition-colors ${selected ? 'bg-primary/90 text-primary-foreground border-primary' : 'bg-muted text-foreground border-border hover:border-primary/50'} ${st.value === primary ? 'opacity-70' : ''}`}>
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  );
};
