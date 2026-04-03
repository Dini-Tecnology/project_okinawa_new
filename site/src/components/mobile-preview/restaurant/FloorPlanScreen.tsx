import { FC, useState } from 'react';
import { ChevronLeft } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

interface Table { id: string; number: string; seats: number; status: 'available' | 'occupied' | 'reserved' | 'cleaning'; x: number; y: number; }

const tablesData: Table[] = [
  { id: '1', number: '01', seats: 4, status: 'occupied', x: 10, y: 10 },
  { id: '2', number: '02', seats: 2, status: 'available', x: 35, y: 10 },
  { id: '3', number: '03', seats: 6, status: 'occupied', x: 60, y: 10 },
  { id: '4', number: '04', seats: 4, status: 'reserved', x: 10, y: 35 },
  { id: '5', number: '05', seats: 2, status: 'available', x: 35, y: 35 },
  { id: '6', number: '06', seats: 8, status: 'occupied', x: 60, y: 35 },
  { id: '7', number: '07', seats: 4, status: 'cleaning', x: 10, y: 60 },
  { id: '8', number: '08', seats: 4, status: 'available', x: 35, y: 60 },
  { id: '9', number: '09', seats: 2, status: 'occupied', x: 60, y: 60 },
];

const statusColors: Record<string, string> = {
  available: 'bg-green-500/20 border-green-500/50 text-green-700',
  occupied: 'bg-primary/20 border-primary/50 text-primary',
  reserved: 'bg-amber-500/20 border-amber-500/50 text-amber-700',
  cleaning: 'bg-muted border-border text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  available: 'Livre', occupied: 'Ocupada', reserved: 'Reservada', cleaning: 'Limpeza',
};

export const FloorPlanScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [selected, setSelected] = useState<Table | null>(null);

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Mapa do Salão</h1>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 px-4 py-3 text-[10px]">
        {Object.entries(statusLabels).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm border ${statusColors[k]}`} />
            <span className="text-muted-foreground">{v}</span>
          </div>
        ))}
      </div>

      {/* Floor grid */}
      <div className="flex-1 px-4 pb-4 relative">
        <div className="bg-card rounded-2xl border border-border p-4 h-full relative">
          {tablesData.map(table => (
            <button key={table.id} onClick={() => setSelected(table)}
              className={`absolute w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${statusColors[table.status]} ${selected?.id === table.id ? 'ring-2 ring-primary scale-110' : ''}`}
              style={{ left: `${table.x}%`, top: `${table.y}%` }}>
              <span className="text-xs font-bold">#{table.number}</span>
              <span className="text-[9px]">{table.seats} lug.</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected detail */}
      {selected && (
        <div className="px-4 pb-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-foreground">Mesa #{selected.number}</p>
                <p className="text-xs text-muted-foreground">{selected.seats} lugares · {statusLabels[selected.status]}</p>
              </div>
              <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium">
                {selected.status === 'available' ? 'Ocupar' : 'Detalhes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
