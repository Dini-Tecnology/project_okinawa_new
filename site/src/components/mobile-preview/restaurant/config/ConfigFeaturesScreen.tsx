import { FC, useState } from 'react';
import { ChevronLeft, Save } from "lucide-react";
import { useMobilePreview } from '../../context/MobilePreviewContext';

const FEATURES = [
  { key: 'loyalty', label: 'Programa de Fidelidade', desc: 'Pontos e recompensas para clientes', billing: true },
  { key: 'reservations', label: 'Reservas', desc: 'Sistema de reservas online', billing: false },
  { key: 'driveThru', label: 'Drive-Thru', desc: 'Pedidos para retirada no drive', billing: false },
  { key: 'multiLanguage', label: 'Multi-idioma', desc: 'Menu e interface em múltiplos idiomas', billing: false },
  { key: 'analytics', label: 'Analytics Avançado', desc: 'Relatórios e métricas detalhadas', billing: true },
  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Notificações para clientes', billing: true },
  { key: 'webhooks', label: 'Webhooks', desc: 'Integrações com sistemas externos', billing: true },
];

export const ConfigFeaturesScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [features, setFeatures] = useState<Record<string, boolean>>({
    loyalty: true, reservations: true, driveThru: false, multiLanguage: false,
    analytics: true, pushNotifications: true, webhooks: false,
  });

  const toggle = (key: string) => setFeatures(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('config-hub')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Features</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Marketplace de Funcionalidades</h3>
          {FEATURES.map(f => (
            <div key={f.key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex-1 mr-3">
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                {f.billing && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[10px] font-medium rounded-full">Afeta cobrança</span>
                )}
              </div>
              <button onClick={() => toggle(f.key)} className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${features[f.key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${features[f.key] ? 'left-5' : 'left-0.5'}`} />
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
