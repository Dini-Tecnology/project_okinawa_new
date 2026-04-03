import { FC, useState } from 'react';
import { ChevronLeft, Check, Clock, AlertTriangle } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

const STATIONS = ['Grelha', 'Frios', 'Massas'];

const orders = [
  { id: '1', table: '07', items: ['Filé Mignon', 'Batata Rústica'], status: 'preparing', time: 12, sla: 15 },
  { id: '2', table: '03', items: ['Risoto de Camarão'], status: 'pending', time: 0, sla: 20 },
  { id: '3', table: '11', items: ['Picanha ao Ponto', 'Arroz'], status: 'preparing', time: 18, sla: 15 },
  { id: '4', table: '05', items: ['Salmão Grelhado'], status: 'pending', time: 0, sla: 12 },
];

export const CookStationScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [station, setStation] = useState('Grelha');
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({});

  const markReady = (id: string) => setOrderStatuses(prev => ({ ...prev, [id]: 'ready' }));

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('chef-view')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Estação do Cozinheiro</h1>
        </div>
      </div>

      {/* Station tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {STATIONS.map(s => (
          <button key={s} onClick={() => setStation(s)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${station === s ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-3">
        <div className="bg-amber-500/10 rounded-lg p-2 text-center"><p className="text-lg font-bold text-amber-600">2</p><p className="text-[10px] text-muted-foreground">Pendente</p></div>
        <div className="bg-primary/10 rounded-lg p-2 text-center"><p className="text-lg font-bold text-primary">2</p><p className="text-[10px] text-muted-foreground">Preparando</p></div>
        <div className="bg-green-500/10 rounded-lg p-2 text-center"><p className="text-lg font-bold text-green-600">{Object.values(orderStatuses).filter(s => s === 'ready').length}</p><p className="text-[10px] text-muted-foreground">Pronto</p></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {orders.map(order => {
          const isLate = order.time >= order.sla;
          const isReady = orderStatuses[order.id] === 'ready';
          return (
            <div key={order.id} className={`bg-card rounded-xl border p-3 ${isLate && !isReady ? 'border-destructive/50' : 'border-border'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-foreground">Mesa {order.table}</span>
                  {isLate && !isReady && <AlertTriangle className="w-3.5 h-3.5 text-destructive inline ml-2" />}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {order.time > 0 ? `${order.time}min` : 'Novo'}
                </div>
              </div>
              {order.items.map(item => (
                <p key={item} className="text-sm text-foreground">• {item}</p>
              ))}
              {!isReady ? (
                <button onClick={() => markReady(order.id)} className="mt-2 w-full py-2 bg-green-500 text-white rounded-lg text-sm font-semibold">
                  Pronto!
                </button>
              ) : (
                <div className="mt-2 flex items-center justify-center gap-1 py-2 bg-green-500/10 text-green-600 rounded-lg text-sm font-semibold">
                  <Check className="w-4 h-4" /> Entregue
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
