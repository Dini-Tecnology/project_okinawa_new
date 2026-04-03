import { FC, useState } from 'react';
import { ChevronLeft, Search, AlertTriangle, Package } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

const stockItems = [
  { id: '1', name: 'Filé Mignon', category: 'Carnes', qty: 8, min: 10, max: 50, unit: 'kg', status: 'low' as const },
  { id: '2', name: 'Salmão', category: 'Peixes', qty: 2, min: 5, max: 20, unit: 'kg', status: 'critical' as const },
  { id: '3', name: 'Arroz Arbóreo', category: 'Grãos', qty: 15, min: 5, max: 30, unit: 'kg', status: 'ok' as const },
  { id: '4', name: 'Azeite Extra Virgem', category: 'Condimentos', qty: 4, min: 3, max: 12, unit: 'L', status: 'ok' as const },
  { id: '5', name: 'Gin Tanqueray', category: 'Bebidas', qty: 1, min: 3, max: 10, unit: 'un', status: 'critical' as const },
  { id: '6', name: 'Queijo Parmesão', category: 'Laticínios', qty: 6, min: 4, max: 15, unit: 'kg', status: 'ok' as const },
  { id: '7', name: 'Camarão Rosa', category: 'Frutos do Mar', qty: 3, min: 5, max: 20, unit: 'kg', status: 'low' as const },
];

const statusColor = { critical: 'bg-destructive/10 text-destructive', low: 'bg-amber-500/10 text-amber-600', ok: 'bg-green-500/10 text-green-600' };

export const StockScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [filter, setFilter] = useState<'all' | 'low' | 'critical'>('all');
  const [search, setSearch] = useState('');

  const filtered = stockItems.filter(i => {
    if (filter === 'low') return i.status === 'low' || i.status === 'critical';
    if (filter === 'critical') return i.status === 'critical';
    return true;
  }).filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Estoque</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <div className="bg-card rounded-xl border border-border p-2 text-center"><p className="text-lg font-bold text-foreground">{stockItems.length}</p><p className="text-[10px] text-muted-foreground">Total</p></div>
        <div className="bg-amber-500/10 rounded-xl p-2 text-center"><p className="text-lg font-bold text-amber-600">{stockItems.filter(i => i.status === 'low').length}</p><p className="text-[10px] text-muted-foreground">Baixo</p></div>
        <div className="bg-destructive/10 rounded-xl p-2 text-center"><p className="text-lg font-bold text-destructive">{stockItems.filter(i => i.status === 'critical').length}</p><p className="text-[10px] text-muted-foreground">Crítico</p></div>
      </div>

      {/* Search + Filter */}
      <div className="px-4 pb-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar item..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground" />
        </div>
        <div className="flex gap-2">
          {(['all', 'low', 'critical'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
              {f === 'all' ? 'Todos' : f === 'low' ? 'Baixo' : 'Crítico'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
        {filtered.map(item => (
          <div key={item.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColor[item.status]}`}>
              {item.status === 'critical' ? <AlertTriangle className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.category} · {item.qty}{item.unit} / {item.max}{item.unit}</p>
              <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.status === 'critical' ? 'bg-destructive' : item.status === 'low' ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${(item.qty / item.max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
