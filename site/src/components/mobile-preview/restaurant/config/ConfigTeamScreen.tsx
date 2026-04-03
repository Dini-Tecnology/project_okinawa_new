import { FC, useState } from 'react';
import { ChevronLeft, Save } from "lucide-react";
import { useMobilePreview } from '../../context/MobilePreviewContext';

const TIP_POLICIES = [
  { value: 'equal', label: 'Divisão Igual' },
  { value: 'by_role', label: 'Por Cargo' },
  { value: 'by_hours', label: 'Por Horas Trabalhadas' },
];

const ROLES = [
  { key: 'WAITER', label: 'Garçom' }, { key: 'COOK', label: 'Cozinheiro' },
  { key: 'BARMAN', label: 'Barman' }, { key: 'MAITRE', label: 'Maître' },
  { key: 'CASHIER', label: 'Caixa' }, { key: 'HOST', label: 'Recepcionista' },
];

export const ConfigTeamScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [tipPolicy, setTipPolicy] = useState('equal');
  const [activeRoles, setActiveRoles] = useState<Record<string, boolean>>({
    WAITER: true, COOK: true, BARMAN: true, MAITRE: true, CASHIER: false, HOST: false,
  });

  const toggleRole = (key: string) => setActiveRoles(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('config-hub')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Equipe</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Política de Gorjetas</h3>
          <div className="flex flex-wrap gap-2">
            {TIP_POLICIES.map(p => (
              <button key={p.value} onClick={() => setTipPolicy(p.value)}
                className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-colors ${tipPolicy === p.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-border'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Cargos</h3>
          {ROLES.map(role => (
            <div key={role.key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{role.label}</p>
                <p className="text-xs text-muted-foreground">{activeRoles[role.key] ? 'Ativo' : 'Inativo'}</p>
              </div>
              <button onClick={() => toggleRole(role.key)} className={`w-10 h-5 rounded-full transition-colors relative ${activeRoles[role.key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${activeRoles[role.key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  );
};
