import { FC, useState } from 'react';
import { ChevronLeft, Store, Utensils, Star, LayoutGrid, ChefHat, CreditCard, Puzzle, Users, Bell, Globe, ChevronRight, Settings, Check, AlertTriangle } from "lucide-react";
import { useMobilePreview } from '../../context/MobilePreviewContext';

const CONFIG_SECTIONS = [
  { id: 'profile', icon: Store, title: 'Perfil do Restaurante', desc: 'Nome, endereço, horários', screen: 'config-profile', roles: ['OWNER'], domain: 'profile' },
  { id: 'serviceTypes', icon: Utensils, title: 'Tipos de Serviço', desc: 'Fine Dining, Fast Casual, etc.', screen: 'config-service-types', roles: ['OWNER'], domain: 'service-types' },
  { id: 'experience', icon: Star, title: 'Experiência do Cliente', desc: 'Reservas, fila virtual, QR', screen: 'config-experience', roles: ['OWNER', 'MANAGER'], domain: 'experience' },
  { id: 'floor', icon: LayoutGrid, title: 'Gestão de Salão', desc: 'Seções e mesas', screen: 'config-floor', roles: ['OWNER'], domain: 'floor' },
  { id: 'kitchen', icon: ChefHat, title: 'Cozinha & Bar', desc: 'Estações e roteamento', screen: 'config-kitchen', roles: ['OWNER', 'MANAGER'], domain: 'kitchen' },
  { id: 'payments', icon: CreditCard, title: 'Pagamentos', desc: 'Métodos, taxas, gorjetas', screen: 'config-payments', roles: ['OWNER'], domain: 'payments' },
  { id: 'features', icon: Puzzle, title: 'Features', desc: 'Marketplace de funcionalidades', screen: 'config-features', roles: ['OWNER'], domain: 'features' },
  { id: 'team', icon: Users, title: 'Equipe', desc: 'Roles e gorjetas', screen: 'config-team', roles: ['OWNER'], domain: 'team' },
  { id: 'notifications', icon: Bell, title: 'Notificações', desc: 'Alertas e avisos', screen: 'config-notifications', roles: ['OWNER', 'MANAGER'], domain: null },
  { id: 'language', icon: Globe, title: 'Idioma & Regional', desc: 'Idioma, moeda, formato', screen: 'config-language', roles: ['OWNER', 'MANAGER'], domain: null },
];

const domainCompletion: Record<string, number> = {
  profile: 85, 'service-types': 100, experience: 70, floor: 60, kitchen: 90, payments: 100, features: 45, team: 80,
};

export const ConfigHubScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const completionPercentage = 78;

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('restaurant-settings')} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Config Hub</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Premium header card */}
        <div className="relative bg-card rounded-2xl border border-border p-4 overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/10" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">Centro de Configuração</p>
                <p className="text-xs text-muted-foreground">{completionPercentage}% configurado</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full" style={{ width: `${completionPercentage}%` }} />
              </div>
              <span className="text-xs font-bold text-foreground">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Config sections */}
        {CONFIG_SECTIONS.map((section) => {
          const dc = section.domain ? domainCompletion[section.domain] : null;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.screen)}
              className="w-full flex items-center gap-3 p-3 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <section.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-semibold text-sm text-foreground truncate">{section.title}</span>
                  {dc === 100 && <Check className="w-3.5 h-3.5 text-green-500" />}
                  {dc != null && dc < 50 && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{section.desc}</p>
                {dc != null && (
                  <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dc === 100 ? 'bg-green-500' : dc >= 70 ? 'bg-primary' : 'bg-amber-500'}`}
                      style={{ width: `${dc}%` }}
                    />
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
