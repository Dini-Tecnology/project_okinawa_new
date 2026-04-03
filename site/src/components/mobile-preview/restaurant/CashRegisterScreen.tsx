import { FC, useState } from 'react';
import { ChevronLeft, DollarSign, ArrowDown, ArrowUp, Plus } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

const movements = [
  { id: '1', type: 'sale', desc: 'Mesa 07 - Pagamento', amount: 287.50, time: '14:32' },
  { id: '2', type: 'sale', desc: 'Mesa 03 - Pagamento', amount: 156.00, time: '14:15' },
  { id: '3', type: 'sangria', desc: 'Sangria - Troco', amount: -200.00, time: '13:45' },
  { id: '4', type: 'sale', desc: 'Mesa 11 - Pagamento', amount: 412.80, time: '13:20' },
  { id: '5', type: 'reforco', desc: 'Reforço de Caixa', amount: 500.00, time: '11:00' },
];

export const CashRegisterScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [isOpen] = useState(true);
  const balance = 1656.30;
  const openingBalance = 500.00;

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Caixa</h1>
          <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${isOpen ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
            {isOpen ? 'ABERTO' : 'FECHADO'}
          </span>
        </div>
      </div>

      {/* Balance card */}
      <div className="mx-4 mt-4 bg-card rounded-2xl border border-border p-4">
        <p className="text-xs text-muted-foreground">Saldo Atual</p>
        <p className="text-3xl font-bold text-foreground">R$ {balance.toFixed(2)}</p>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span>Abertura: R$ {openingBalance.toFixed(2)}</span>
          <span>Vendas: R$ 856.30</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 py-3">
        <button className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-destructive/10 text-destructive rounded-xl text-xs font-medium">
          <ArrowDown className="w-3.5 h-3.5" /> Sangria
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-green-500/10 text-green-600 rounded-xl text-xs font-medium">
          <ArrowUp className="w-3.5 h-3.5" /> Reforço
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-medium">
          <DollarSign className="w-3.5 h-3.5" /> Fechar
        </button>
      </div>

      {/* Movements */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Movimentações</h3>
        <div className="space-y-1.5">
          {movements.map(m => (
            <div key={m.id} className="bg-card rounded-xl border border-border p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.amount > 0 ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                  {m.amount > 0 ? <ArrowUp className="w-4 h-4 text-green-600" /> : <ArrowDown className="w-4 h-4 text-destructive" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{m.desc}</p>
                  <p className="text-[10px] text-muted-foreground">{m.time}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${m.amount > 0 ? 'text-green-600' : 'text-destructive'}`}>
                {m.amount > 0 ? '+' : ''}R$ {Math.abs(m.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
