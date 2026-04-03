import { FC, useState } from 'react';
import { ChevronLeft, Plus, Save, Trash2, Edit2 } from "lucide-react";
import { useMobilePreview } from '../../context/MobilePreviewContext';

interface Section { id: string; name: string; capacity: number; }
interface Table { id: string; number: string; sectionId: string; seats: number; shape: string; }

export const ConfigFloorScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [sections, setSections] = useState<Section[]>([
    { id: '1', name: 'Salão Principal', capacity: 40 },
    { id: '2', name: 'Terraço', capacity: 20 },
    { id: '3', name: 'VIP', capacity: 12 },
  ]);
  const [tables, setTables] = useState<Table[]>([
    { id: 't1', number: '01', sectionId: '1', seats: 4, shape: 'square' },
    { id: 't2', number: '02', sectionId: '1', seats: 2, shape: 'round' },
    { id: 't3', number: '03', sectionId: '1', seats: 6, shape: 'rectangle' },
    { id: 't4', number: '04', sectionId: '2', seats: 4, shape: 'round' },
    { id: 't5', number: '05', sectionId: '2', seats: 2, shape: 'square' },
    { id: 't6', number: '06', sectionId: '3', seats: 8, shape: 'rectangle' },
  ]);

  const addTable = (sectionId: string) => {
    const newId = `t${Date.now()}`;
    const num = String(tables.length + 1).padStart(2, '0');
    setTables(prev => [...prev, { id: newId, number: num, sectionId, seats: 4, shape: 'square' }]);
  };

  const removeTable = (id: string) => setTables(prev => prev.filter(t => t.id !== id));

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('config-hub')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Gestão de Salão</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-foreground">Seções & Mesas</h3>
            <button className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-full">
              <Plus className="w-3 h-3" /> Seção
            </button>
          </div>

          {sections.map(section => {
            const sectionTables = tables.filter(t => t.sectionId === section.id);
            return (
              <div key={section.id} className="bg-muted rounded-xl p-3 mb-2 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-semibold text-sm text-foreground">{section.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({section.capacity} lugares)</span>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-card rounded"><Edit2 className="w-3.5 h-3.5 text-primary" /></button>
                    <button className="p-1 hover:bg-card rounded"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sectionTables.map(tbl => (
                    <button key={tbl.id} onClick={() => removeTable(tbl.id)}
                      className="px-2 py-1 bg-card border border-border rounded-lg text-xs text-foreground hover:border-destructive group">
                      #{tbl.number} ({tbl.seats})
                    </button>
                  ))}
                </div>
                <button onClick={() => addTable(section.id)} className="mt-2 text-xs text-primary font-medium">
                  + Adicionar Mesa
                </button>
              </div>
            );
          })}
        </div>

        <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Salvar Layout
        </button>
      </div>
    </div>
  );
};
