import { FC, useState } from 'react';
import { ChevronLeft, Users, Clock, MapPin, Bell } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

const assignments = [
  { id: '1', tables: ['01', '02', '03'], activeOrders: 3, calls: 1 },
  { id: '2', tables: ['04', '05', '06'], activeOrders: 2, calls: 0 },
  { id: '3', tables: ['07', '08', '09'], activeOrders: 4, calls: 2 },
];

const pendingCalls = [
  { table: '07', type: 'Chamar Garçom', time: '2min', urgent: true },
  { table: '03', type: 'Pedir Conta', time: '1min', urgent: false },
  { table: '09', type: 'Pedido Adicional', time: '30s', urgent: false },
];

export const WaiterDashboardScreen: FC = () => {
  const { navigate } = useMobilePreview();

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Painel do Garçom</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-4">
        <div className="bg-card rounded-xl border border-border p-2 text-center"><p className="text-lg font-bold text-foreground">9</p><p className="text-[10px] text-muted-foreground">Mesas</p></div>
        <div className="bg-card rounded-xl border border-border p-2 text-center"><p className="text-lg font-bold text-primary">9</p><p className="text-[10px] text-muted-foreground">Pedidos</p></div>
        <div className="bg-amber-500/10 rounded-xl p-2 text-center"><p className="text-lg font-bold text-amber-600">3</p><p className="text-[10px] text-muted-foreground">Chamados</p></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* Calls */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
            <Bell className="w-4 h-4 text-amber-500" /> Chamados Pendentes
          </h3>
          {pendingCalls.map(call => (
            <div key={call.table} className={`bg-card rounded-xl border p-3 mb-1.5 flex items-center justify-between ${call.urgent ? 'border-amber-500/50' : 'border-border'}`}>
              <div>
                <p className="text-sm font-medium text-foreground">Mesa {call.table}</p>
                <p className="text-xs text-muted-foreground">{call.type} · {call.time}</p>
              </div>
              <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium">Atender</button>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Minhas Mesas</h3>
          {assignments.map(a => (
            <div key={a.id} className="bg-card rounded-xl border border-border p-3 mb-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm text-foreground">Mesas {a.tables.join(', ')}</span>
                </div>
                {a.calls > 0 && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-bold">{a.calls} chamados</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{a.activeOrders} pedidos ativos</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
