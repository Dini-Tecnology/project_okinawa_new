import { FC, useState } from 'react';
import { ChevronLeft, Save, X } from "lucide-react";
import { useMobilePreview } from '../../context/MobilePreviewContext';

const METHODS = [
  { value: 'cash', label: 'Dinheiro' }, { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' }, { value: 'pix', label: 'Pix' },
  { value: 'apple_pay', label: 'Apple Pay' }, { value: 'google_pay', label: 'Google Pay' },
  { value: 'voucher', label: 'Voucher' },
];

const SPLIT_MODES = [
  { value: 'equal', label: 'Dividir Igual' }, { value: 'custom', label: 'Valores Personalizados' },
  { value: 'by_item', label: 'Por Item' }, { value: 'by_person', label: 'Por Pessoa' },
];

export const ConfigPaymentsScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [enabled, setEnabled] = useState(['cash', 'credit_card', 'debit_card', 'pix']);
  const [serviceFee, setServiceFee] = useState(10);
  const [tipOptions, setTipOptions] = useState([10, 12, 15]);
  const [splitModes, setSplitModes] = useState(['equal', 'custom', 'by_item']);
  const [newTip, setNewTip] = useState('');

  const toggleMethod = (m: string) => setEnabled(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const toggleSplit = (m: string) => setSplitModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const addTip = () => { const v = parseInt(newTip); if (v > 0 && v <= 100 && !tipOptions.includes(v)) { setTipOptions(prev => [...prev, v].sort((a,b) => a-b)); setNewTip(''); } };
  const removeTip = (v: number) => setTipOptions(prev => prev.filter(x => x !== v));

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('config-hub')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Pagamentos</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Methods */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Métodos de Pagamento</h3>
          {METHODS.map(m => (
            <div key={m.value} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
              <span className="text-sm text-foreground">{m.label}</span>
              <button onClick={() => toggleMethod(m.value)} className={`w-10 h-5 rounded-full transition-colors relative ${enabled.includes(m.value) ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${enabled.includes(m.value) ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Service Fee */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Taxa de Serviço</h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground">Taxa</span>
            <span className="text-lg font-bold text-primary">{serviceFee}%</span>
          </div>
          <input type="range" min={0} max={20} value={serviceFee} onChange={e => setServiceFee(Number(e.target.value))} className="w-full accent-primary" />
        </div>

        {/* Tips */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Opções de Gorjeta</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {tipOptions.map(tip => (
              <button key={tip} onClick={() => removeTip(tip)} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                {tip}% <X className="w-3 h-3" />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newTip} onChange={e => setNewTip(e.target.value)} placeholder="%" className="w-20 px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground" />
            <button onClick={addTip} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium">Adicionar</button>
          </div>
        </div>

        {/* Split */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Modos de Divisão</h3>
          {SPLIT_MODES.map(m => (
            <button key={m.value} onClick={() => toggleSplit(m.value)} className="flex items-center gap-3 py-2 w-full">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${splitModes.includes(m.value) ? 'bg-primary border-primary' : 'border-border'}`}>
                {splitModes.includes(m.value) && <span className="text-primary-foreground text-xs">✓</span>}
              </div>
              <span className="text-sm text-foreground">{m.label}</span>
            </button>
          ))}
        </div>

        <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  );
};
