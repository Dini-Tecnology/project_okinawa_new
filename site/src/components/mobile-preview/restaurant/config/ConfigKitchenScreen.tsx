import { FC, useState } from 'react';
import { ChevronLeft, Plus, Save, Edit2, Trash2 } from "lucide-react";
import { useMobilePreview } from '../../context/MobilePreviewContext';

interface Station { id: string; name: string; displayName: string; keywords: string[]; }

export const ConfigKitchenScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [stations, setStations] = useState<Station[]>([
    { id: '1', name: 'grill', displayName: 'Grelha', keywords: ['carnes', 'grelhados', 'churrasco'] },
    { id: '2', name: 'cold', displayName: 'Frios', keywords: ['saladas', 'entradas', 'ceviches'] },
    { id: '3', name: 'pasta', displayName: 'Massas', keywords: ['pasta', 'risoto', 'nhoque'] },
    { id: '4', name: 'desserts', displayName: 'Sobremesas', keywords: ['doces', 'sorvetes', 'bolos'] },
  ]);
  const [routingKitchen] = useState('carnes, massas, saladas, sobremesas');
  const [routingBar] = useState('drinks, cocktails, vinhos, cervejas');

  const removeStation = (id: string) => setStations(prev => prev.filter(s => s.id !== id));

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('config-hub')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Cozinha & Bar</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-foreground">Estações</h3>
            <button className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-full">
              <Plus className="w-3 h-3" /> Estação
            </button>
          </div>
          {stations.map(station => (
            <div key={station.id} className="bg-muted rounded-xl p-3 mb-2 last:mb-0">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-sm text-foreground">{station.displayName}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{station.keywords.join(', ')}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-card rounded"><Edit2 className="w-3.5 h-3.5 text-primary" /></button>
                  <button onClick={() => removeStation(station.id)} className="p-1 hover:bg-card rounded"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Roteamento</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Categorias → Cozinha</label>
            <input defaultValue={routingKitchen} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Categorias → Bar</label>
            <input defaultValue={routingBar} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground" />
          </div>
        </div>

        <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  );
};
