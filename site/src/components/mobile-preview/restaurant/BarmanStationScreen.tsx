import { FC, useState } from 'react';
import { ChevronLeft, Search, Check, Clock, Wine } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

const TABS = ['Pedidos', 'Receitas', 'Estoque'];

const drinkOrders = [
  { id: '1', table: '03', items: [{ name: 'Negroni', qty: 2 }, { name: 'Aperol Spritz', qty: 1 }], urgent: true, time: 8 },
  { id: '2', table: '07', items: [{ name: 'Caipirinha', qty: 3 }], urgent: false, time: 2 },
  { id: '3', table: '11', items: [{ name: 'Gin Tônica', qty: 1 }, { name: 'Moscow Mule', qty: 1 }], urgent: false, time: 0 },
];

const recipes = [
  { name: 'Negroni', category: 'Clássicos', ingredients: 'Gin, Campari, Vermute' },
  { name: 'Caipirinha', category: 'Brasileiros', ingredients: 'Cachaça, Limão, Açúcar' },
  { name: 'Aperol Spritz', category: 'Spritz', ingredients: 'Aperol, Prosecco, Água com Gás' },
  { name: 'Old Fashioned', category: 'Clássicos', ingredients: 'Bourbon, Angostura, Açúcar' },
];

const stockItems = [
  { name: 'Gin Tanqueray', level: 75 }, { name: 'Campari', level: 40 },
  { name: 'Cachaça', level: 90 }, { name: 'Aperol', level: 20 },
];

export const BarmanStationScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [tab, setTab] = useState('Pedidos');
  const [readyOrders, setReadyOrders] = useState<string[]>([]);

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Estação do Barman</h1>
        </div>
      </div>

      <div className="flex gap-1 px-4 py-3">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-medium ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {tab === 'Pedidos' && drinkOrders.map(order => (
          <div key={order.id} className={`bg-card rounded-xl border p-3 ${order.urgent ? 'border-amber-500/50' : 'border-border'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-foreground">Mesa {order.table}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{order.time}min</span>
            </div>
            {order.items.map(item => (
              <p key={item.name} className="text-sm text-foreground">• {item.name} x{item.qty}</p>
            ))}
            {!readyOrders.includes(order.id) ? (
              <button onClick={() => setReadyOrders(prev => [...prev, order.id])} className="mt-2 w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">
                Pronto!
              </button>
            ) : (
              <div className="mt-2 flex items-center justify-center gap-1 py-2 bg-green-500/10 text-green-600 rounded-lg text-sm font-semibold">
                <Check className="w-4 h-4" /> Pronto
              </div>
            )}
          </div>
        ))}

        {tab === 'Receitas' && recipes.map(r => (
          <div key={r.name} className="bg-card rounded-xl border border-border p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wine className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">{r.name}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{r.category}</span>
            </div>
            <p className="text-xs text-muted-foreground">{r.ingredients}</p>
          </div>
        ))}

        {tab === 'Estoque' && stockItems.map(item => (
          <div key={item.name} className="bg-card rounded-xl border border-border p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-foreground">{item.name}</span>
              <span className={`text-xs font-bold ${item.level < 30 ? 'text-destructive' : item.level < 50 ? 'text-amber-500' : 'text-green-500'}`}>{item.level}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${item.level < 30 ? 'bg-destructive' : item.level < 50 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${item.level}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
