import { FC, useState } from 'react';
import { ChevronLeft, Save } from "lucide-react";
import { useMobilePreview } from '../../context/MobilePreviewContext';

const NOTIFICATIONS = [
  { key: 'notifyNewOrders', label: 'Novos Pedidos', desc: 'Receber alerta quando um pedido é feito' },
  { key: 'notifyLowStock', label: 'Estoque Baixo', desc: 'Alerta quando ingredientes estão acabando' },
  { key: 'notifyReservationReminders', label: 'Lembrete de Reservas', desc: 'Aviso antes de reservas agendadas' },
  { key: 'notifyApprovalRequests', label: 'Aprovações Pendentes', desc: 'Solicitações que precisam de aprovação' },
];

export const ConfigNotificationsScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    notifyNewOrders: true, notifyLowStock: true, notifyReservationReminders: true, notifyApprovalRequests: false,
  });

  const toggle = (key: string) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('config-hub')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Notificações</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Preferências de Notificação</h3>
          {NOTIFICATIONS.map(n => (
            <div key={n.key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex-1 mr-3">
                <p className="text-sm font-medium text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
              </div>
              <button onClick={() => toggle(n.key)} className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${prefs[n.key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${prefs[n.key] ? 'left-5' : 'left-0.5'}`} />
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
