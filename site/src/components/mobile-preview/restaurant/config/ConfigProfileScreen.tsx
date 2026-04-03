import { FC, useState } from 'react';
import { ChevronLeft, Save } from "lucide-react";
import { useMobilePreview } from '../../context/MobilePreviewContext';

const DAYS = [
  { key: 'monday', label: 'Segunda' }, { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' }, { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' }, { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export const ConfigProfileScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [name, setName] = useState('Bistrô Noowe');
  const [description, setDescription] = useState('Gastronomia contemporânea com ingredientes locais');
  const [phone, setPhone] = useState('(11) 3456-7890');
  const [email, setEmail] = useState('contato@bistronoowe.com');
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    monday: { open: '11:00', close: '23:00', closed: false },
    tuesday: { open: '11:00', close: '23:00', closed: false },
    wednesday: { open: '11:00', close: '23:00', closed: false },
    thursday: { open: '11:00', close: '23:00', closed: false },
    friday: { open: '11:00', close: '00:00', closed: false },
    saturday: { open: '11:00', close: '00:00', closed: false },
    sunday: { open: '12:00', close: '22:00', closed: false },
  });

  const toggleDay = (day: string) => setHours(prev => ({ ...prev, [day]: { ...prev[day], closed: !prev[day].closed } }));

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('config-hub')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Perfil</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic Info */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Informações Básicas</h3>
          {[{ label: 'Nome', value: name, onChange: setName }, { label: 'Descrição', value: description, onChange: setDescription }].map(f => (
            <div key={f.label}>
              <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
              <input value={f.value} onChange={e => f.onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Tipo de Cozinha', val: 'Contemporânea' }, { label: 'Faixa de Preço', val: '$$$' }].map(f => (
              <div key={f.label}>
                <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                <input defaultValue={f.val} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Contato</h3>
          {[{ label: 'Telefone', value: phone, onChange: setPhone }, { label: 'Email', value: email, onChange: setEmail }].map(f => (
            <div key={f.label}>
              <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
              <input value={f.value} onChange={e => f.onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground" />
            </div>
          ))}
        </div>

        {/* Address */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Endereço</h3>
          <div className="grid grid-cols-3 gap-2">
            {[{ l: 'Rua', v: 'R. Augusta' }, { l: 'Número', v: '1200' }, { l: 'Bairro', v: 'Consolação' }].map(f => (
              <div key={f.l}>
                <label className="text-xs text-muted-foreground mb-1 block">{f.l}</label>
                <input defaultValue={f.v} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[{ l: 'Cidade', v: 'São Paulo' }, { l: 'Estado', v: 'SP' }].map(f => (
              <div key={f.l}>
                <label className="text-xs text-muted-foreground mb-1 block">{f.l}</label>
                <input defaultValue={f.v} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Hours */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
          <h3 className="font-semibold text-foreground">Horários de Funcionamento</h3>
          {DAYS.map(day => {
            const h = hours[day.key];
            return (
              <div key={day.key} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium text-foreground w-20">{day.label}</span>
                <button onClick={() => toggleDay(day.key)} className={`w-9 h-5 rounded-full transition-colors ${!h.closed ? 'bg-primary' : 'bg-muted-foreground/30'} relative`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${!h.closed ? 'left-4' : 'left-0.5'}`} />
                </button>
                {!h.closed ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <input value={h.open} onChange={e => setHours(prev => ({ ...prev, [day.key]: { ...prev[day.key], open: e.target.value } }))} className="w-14 text-center px-1 py-0.5 rounded border border-border bg-muted text-foreground" />
                    <span>-</span>
                    <input value={h.close} onChange={e => setHours(prev => ({ ...prev, [day.key]: { ...prev[day.key], close: e.target.value } }))} className="w-14 text-center px-1 py-0.5 rounded border border-border bg-muted text-foreground" />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Fechado</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Save */}
        <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Salvar Perfil
        </button>
      </div>
    </div>
  );
};
