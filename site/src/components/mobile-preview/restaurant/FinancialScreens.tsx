import { FC, useState } from 'react';
import { ChevronLeft, TrendingUp, TrendingDown, DollarSign, Receipt, Calendar } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

export const BillsScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const bills = [
    { id: '1', table: '07', total: 287.50, items: 5, status: 'open', time: '14:32' },
    { id: '2', table: '03', total: 156.00, items: 3, status: 'paid', time: '14:15' },
    { id: '3', table: '11', total: 412.80, items: 8, status: 'open', time: '13:20' },
    { id: '4', table: '05', total: 98.00, items: 2, status: 'paid', time: '12:45' },
  ];

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Contas</h1>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4">
        <div className="bg-card rounded-xl border border-border p-3 text-center"><p className="text-xs text-muted-foreground">Abertas</p><p className="text-xl font-bold text-primary">2</p></div>
        <div className="bg-card rounded-xl border border-border p-3 text-center"><p className="text-xs text-muted-foreground">Total Hoje</p><p className="text-xl font-bold text-foreground">R$ 954,30</p></div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
        {bills.map(b => (
          <div key={b.id} className="bg-card rounded-xl border border-border p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${b.status === 'open' ? 'bg-primary/10' : 'bg-green-500/10'}`}>
                <Receipt className={`w-5 h-5 ${b.status === 'open' ? 'text-primary' : 'text-green-600'}`} />
              </div>
              <div><p className="font-medium text-sm text-foreground">Mesa {b.table}</p><p className="text-xs text-muted-foreground">{b.items} itens · {b.time}</p></div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-foreground">R$ {b.total.toFixed(2)}</p>
              <span className={`text-[10px] font-medium ${b.status === 'open' ? 'text-primary' : 'text-green-600'}`}>{b.status === 'open' ? 'Aberta' : 'Paga'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FinancialReportScreen: FC = () => {
  const { navigate } = useMobilePreview();
  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Relatório Financeiro</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Receita do Mês</p>
          <p className="text-3xl font-bold text-foreground">R$ 87.450</p>
          <div className="flex items-center gap-1 mt-1"><TrendingUp className="w-4 h-4 text-green-500" /><span className="text-sm text-green-600 font-medium">+12.5% vs mês anterior</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[{ l: 'Ticket Médio', v: 'R$ 89,50', icon: DollarSign, trend: '+5%' }, { l: 'Despesas', v: 'R$ 34.200', icon: TrendingDown, trend: '-3%' }, { l: 'Margem', v: '60.9%', icon: TrendingUp, trend: '+2.1%' }, { l: 'Clientes', v: '978', icon: Calendar, trend: '+8%' }].map(m => (
            <div key={m.l} className="bg-card rounded-xl border border-border p-3">
              <m.icon className="w-4 h-4 text-primary mb-1" />
              <p className="text-lg font-bold text-foreground">{m.v}</p>
              <p className="text-[10px] text-muted-foreground">{m.l}</p>
              <p className="text-[10px] text-green-600 font-medium">{m.trend}</p>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Receita por Categoria</h3>
          {[{ cat: 'Pratos Principais', pct: 45, val: 'R$ 39.352' }, { cat: 'Bebidas', pct: 28, val: 'R$ 24.486' }, { cat: 'Entradas', pct: 15, val: 'R$ 13.117' }, { cat: 'Sobremesas', pct: 12, val: 'R$ 10.494' }].map(c => (
            <div key={c.cat} className="mb-2 last:mb-0">
              <div className="flex justify-between text-xs mb-0.5"><span className="text-foreground">{c.cat}</span><span className="text-muted-foreground">{c.val}</span></div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${c.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ForecastScreen: FC = () => {
  const { navigate } = useMobilePreview();
  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Previsão</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Receita Prevista (próx. 30 dias)</p>
          <p className="text-3xl font-bold text-foreground">R$ 92.800</p>
          <p className="text-xs text-green-600 mt-1">Baseado na tendência atual (+6.1%)</p>
        </div>
        {[{ day: 'Seg', prev: 'R$ 3.200', occ: '65%' }, { day: 'Ter', prev: 'R$ 2.800', occ: '55%' }, { day: 'Qua', prev: 'R$ 3.500', occ: '70%' }, { day: 'Qui', prev: 'R$ 4.100', occ: '78%' }, { day: 'Sex', prev: 'R$ 5.800', occ: '92%' }, { day: 'Sáb', prev: 'R$ 6.200', occ: '95%' }, { day: 'Dom', prev: 'R$ 4.500', occ: '80%' }].map(d => (
          <div key={d.day} className="bg-card rounded-xl border border-border p-3 flex justify-between items-center">
            <span className="font-medium text-sm text-foreground w-10">{d.day}</span>
            <span className="text-sm text-foreground">{d.prev}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: d.occ }} /></div>
              <span className="text-xs text-muted-foreground w-8">{d.occ}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FiscalSetupScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [nfce, setNfce] = useState(true);
  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Config. Fiscal</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Dados Fiscais</h3>
          {[{ l: 'CNPJ', v: '12.345.678/0001-90' }, { l: 'Inscrição Estadual', v: '123.456.789' }, { l: 'Regime Tributário', v: 'Simples Nacional' }].map(f => (
            <div key={f.l}><label className="text-xs text-muted-foreground">{f.l}</label><input defaultValue={f.v} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground" /></div>
          ))}
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex justify-between items-center">
            <div><p className="font-semibold text-foreground">Emissão NFC-e</p><p className="text-xs text-muted-foreground">Nota fiscal ao consumidor</p></div>
            <button onClick={() => setNfce(!nfce)} className={`w-10 h-5 rounded-full transition-colors relative ${nfce ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${nfce ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MarginDashboardScreen: FC = () => {
  const { navigate } = useMobilePreview();
  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Margens</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Margem Média</p>
          <p className="text-3xl font-bold text-foreground">67.2%</p>
          <p className="text-xs text-green-600 mt-1">+2.3% vs mês anterior</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Top Margens por Prato</h3>
          {[{ name: 'Bruschetta', cost: 4.50, price: 28, margin: 83.9 }, { name: 'Risoto Funghi', cost: 12, price: 58, margin: 79.3 }, { name: 'Tiramisu', cost: 6, price: 26, margin: 76.9 }, { name: 'Filé Mignon', cost: 38, price: 89, margin: 57.3 }, { name: 'Salmão', cost: 42, price: 79, margin: 46.8 }].map(d => (
            <div key={d.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div><p className="text-sm font-medium text-foreground">{d.name}</p><p className="text-[10px] text-muted-foreground">Custo R$ {d.cost.toFixed(2)} · Venda R$ {d.price}</p></div>
              <span className={`text-sm font-bold ${d.margin > 70 ? 'text-green-600' : d.margin > 50 ? 'text-amber-600' : 'text-destructive'}`}>{d.margin}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const KdsAnalyticsScreen: FC = () => {
  const { navigate } = useMobilePreview();
  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Analytics KDS</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[{ l: 'Tempo Médio', v: '12min' }, { l: 'Pedidos/Hora', v: '24' }, { l: 'SLA Atingido', v: '87%' }, { l: 'Atrasados', v: '3' }].map(m => (
            <div key={m.l} className="bg-card rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">{m.l}</p>
              <p className="text-xl font-bold text-foreground">{m.v}</p>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Tempo por Estação</h3>
          {[{ station: 'Grelha', avg: 14, target: 15 }, { station: 'Frios', avg: 5, target: 8 }, { station: 'Massas', avg: 18, target: 20 }, { station: 'Bar', avg: 4, target: 5 }].map(s => (
            <div key={s.station} className="mb-2 last:mb-0">
              <div className="flex justify-between text-xs mb-0.5"><span className="text-foreground">{s.station}</span><span className="text-muted-foreground">{s.avg}min / {s.target}min</span></div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.avg <= s.target ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min((s.avg / s.target) * 100, 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CustomerCrmScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const customers = [
    { name: 'Maria Silva', visits: 12, spent: 'R$ 2.340', lastVisit: '2 dias', tier: 'Gold' },
    { name: 'João Santos', visits: 8, spent: 'R$ 1.560', lastVisit: '5 dias', tier: 'Silver' },
    { name: 'Ana Costa', visits: 23, spent: 'R$ 4.780', lastVisit: '1 dia', tier: 'Platinum' },
    { name: 'Pedro Lima', visits: 3, spent: 'R$ 450', lastVisit: '2 sem', tier: 'Bronze' },
  ];
  const tierColors: Record<string, string> = { Platinum: 'bg-purple-500/10 text-purple-600', Gold: 'bg-amber-500/10 text-amber-600', Silver: 'bg-gray-400/10 text-gray-600', Bronze: 'bg-orange-500/10 text-orange-600' };

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">CRM Clientes</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {customers.map(c => (
          <div key={c.name} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{c.name[0]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2"><p className="font-medium text-sm text-foreground">{c.name}</p><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${tierColors[c.tier]}`}>{c.tier}</span></div>
              <p className="text-xs text-muted-foreground">{c.visits} visitas · {c.spent} · Última: {c.lastVisit}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
