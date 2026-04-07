/**
 * Restaurant Demo — Welcome + Setup Hub Screens
 * Mirrors the real SetupHubScreen from platform/mobile with 8 steps
 * (5 required + 3 optional), persistent progress, and toggle completion.
 */
import React, { useState, useCallback } from 'react';
import {
  ArrowRight, Check, ChefHat, BarChart3, LayoutGrid, UtensilsCrossed,
  CalendarDays, Users, Star, Smartphone, Zap, Shield, Clock,
  TrendingUp, Bell, QrCode, CreditCard, Wifi, ParkingSquare,
  Accessibility, Dog, Sun, Wine, MapPin, Phone, Globe, Camera,
  Settings, Sparkles, Rocket, AlertCircle, CircleCheck, Circle,
  Store, Table2, CashSign, UserPlus, Link2, HandCoins,
} from 'lucide-react';
import { GuidedHint } from '@/components/demo/DemoShared';
import { ROLE_CONFIG, type StaffRole } from './RestaurantDemoShared';

// ============ WELCOME ============

export const WelcomeScreen: React.FC<{
  onNavigate: (screen: string) => void;
  onSelectRole?: (role: StaffRole) => void;
}> = ({ onNavigate, onSelectRole }) => (
  <div className="space-y-8 p-6">
    {/* Hero */}
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border border-border p-8 md:p-12">
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">DEMO INTERATIVA</div>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-display font-bold text-xl">N</span>
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Bistrô Noowe</h1>
            <p className="text-sm text-muted-foreground">Painel de Gestão Operacional</p>
          </div>
        </div>
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
          Explore o painel <span className="text-foreground font-semibold">NOOWE</span> pela perspectiva de cada membro da equipe.
          Escolha um perfil abaixo para começar.
        </p>
      </div>
    </div>

    {/* Role Selection — PRIMARY CTA */}
    <div>
      <h2 className="font-display font-bold text-xl mb-2">Escolha seu perfil</h2>
      <p className="text-sm text-muted-foreground mb-4">Cada membro vê exatamente as telas e funcionalidades relevantes para sua função</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ROLE_CONFIG.map(role => (
          <button
            key={role.id}
            onClick={() => onSelectRole?.(role.id)}
            className={`p-5 rounded-2xl border-2 border-border text-left transition-all hover:border-primary/30 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br ${role.gradient}`}
          >
            <span className="text-4xl block mb-3">{role.emoji}</span>
            <p className="font-display font-bold text-sm">{role.label}</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{role.desc}</p>
            <div className="flex items-center gap-1 mt-3 text-primary text-xs font-semibold">
              Explorar <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* Feature highlights */}
    <div className="grid md:grid-cols-3 gap-4">
      {[
        { icon: BarChart3, title: 'Dashboard em Tempo Real', desc: 'KPIs, receita, ocupação e pedidos ao vivo', color: 'text-primary', bg: 'bg-primary/10' },
        { icon: ChefHat, title: 'KDS Profissional', desc: 'Cozinha e bar com tickets, timers e prioridades', color: 'text-warning', bg: 'bg-warning/10' },
        { icon: LayoutGrid, title: 'Mapa Interativo', desc: 'Planta do salão com status de cada mesa', color: 'text-info', bg: 'bg-info/10' },
        { icon: CalendarDays, title: 'Reservas & Fila', desc: 'Check-in, fila virtual e fluxo do Maitre', color: 'text-secondary', bg: 'bg-secondary/10' },
        { icon: Smartphone, title: 'App do Garçom', desc: 'Pedidos, chamados e gorjetas no celular', color: 'text-success', bg: 'bg-success/10' },
        { icon: Shield, title: 'Aprovações & RBAC', desc: 'Cancelamentos e cortesias com autorização', color: 'text-destructive', bg: 'bg-destructive/10' },
      ].map(({ icon: Icon, title, desc, color, bg }) => (
        <div key={title} className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-colors">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {[
        { value: '7', label: 'Perfis de Acesso', sub: 'Dono a Cozinheiro' },
        { value: '22', label: 'Telas Dedicadas', sub: 'Role-specific' },
        { value: '11', label: 'Tipos de Serviço', sub: 'Fine Dining a Club' },
      ].map(({ value, label, sub }) => (
        <div key={label} className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="font-display text-3xl font-bold text-primary">{value}</p>
          <p className="text-sm font-semibold mt-1">{label}</p>
          <p className="text-[10px] text-muted-foreground">{sub}</p>
        </div>
      ))}
    </div>
  </div>
);

// ============ SETUP STEPS (mirrors real SetupHubScreen) ============

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  required: boolean;
  route?: string;
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: '1',
    title: 'Informações Básicas',
    description: 'Nome, endereço, tipo de culinária e horário de funcionamento',
    icon: Store,
    required: true,
    route: 'config-profile',
  },
  {
    id: '2',
    title: 'Configurar Cardápio',
    description: 'Adicione categorias, pratos, preços e descrições',
    icon: UtensilsCrossed,
    required: true,
    route: 'menu-editor',
  },
  {
    id: '3',
    title: 'Configurar Mesas',
    description: 'Defina o layout do salão e número de mesas',
    icon: LayoutGrid,
    required: true,
    route: 'config-floor',
  },
  {
    id: '4',
    title: 'Sistema de Reservas',
    description: 'Configure capacidade, horários e políticas de reserva',
    icon: CalendarDays,
    required: true,
    route: 'config-experience',
  },
  {
    id: '5',
    title: 'Métodos de Pagamento',
    description: 'Integre formas de pagamento e configure taxas',
    icon: CreditCard,
    required: true,
    route: 'config-payments',
  },
  {
    id: '6',
    title: 'Equipe e Funções',
    description: 'Adicione membros da equipe e defina permissões (7 roles)',
    icon: Users,
    required: false,
    route: 'config-team',
  },
  {
    id: '7',
    title: 'Configurações de Gorjetas',
    description: 'Defina porcentagens sugeridas e distribuição',
    icon: Star,
    required: false,
    route: 'config-payments',
  },
  {
    id: '8',
    title: 'Integrações',
    description: 'Conecte delivery apps e sistemas externos',
    icon: Link2,
    required: false,
  },
];

// ============ SETUP HUB SCREEN ============

export const SetupScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const [completed, setCompleted] = useState<Set<string>>(new Set(['1', '2']));

  const toggleStep = useCallback((id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const requiredSteps = SETUP_STEPS.filter(s => s.required);
  const optionalSteps = SETUP_STEPS.filter(s => !s.required);
  const completedRequired = requiredSteps.filter(s => completed.has(s.id)).length;
  const totalRequired = requiredSteps.length;
  const progress = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;
  const isSetupComplete = completedRequired === totalRequired;

  return (
    <div className="space-y-6">
      <GuidedHint text="Veja o hub de configuração real — 8 passos guiados para configurar seu restaurante na NOOWE" />

      {/* Header Card — mirrors real SetupHubScreen header */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-lg">Configuração do Restaurante</h2>
            <p className="text-sm text-muted-foreground">Complete os passos abaixo para começar a operar</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Progresso da Configuração</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isSetupComplete ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
            }`}>
              {isSetupComplete ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {completedRequired}/{totalRequired}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isSetupComplete ? 'bg-success' : 'bg-gradient-to-r from-primary to-primary/70'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {isSetupComplete
              ? 'Configuração básica completa! 🎉'
              : `Faltam ${totalRequired - completedRequired} passos obrigatórios`}
          </p>
        </div>
      </div>

      {/* Required Steps */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <h3 className="font-display font-bold text-base">Passos Obrigatórios</h3>
        </div>
        <div className="space-y-3">
          {requiredSteps.map(step => {
            const Icon = step.icon;
            const done = completed.has(step.id);
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  done ? 'bg-success/5 border-success/20' : 'bg-card border-border hover:border-primary/20'
                }`}
                onClick={() => step.route && onNavigate(step.route)}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  done ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                  <Icon className={`w-7 h-7 ${done ? 'text-success' : 'text-destructive'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${done ? 'line-through text-success' : 'text-foreground'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStep(step.id); }}
                  className="shrink-0"
                >
                  {done
                    ? <CircleCheck className="w-6 h-6 text-success" />
                    : <Circle className="w-6 h-6 text-muted-foreground/40" />
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Steps */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-warning" />
          <h3 className="font-display font-bold text-base">Passos Opcionais</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3 ml-7">Melhore a experiência do seu restaurante</p>
        <div className="space-y-3">
          {optionalSteps.map(step => {
            const Icon = step.icon;
            const done = completed.has(step.id);
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  done ? 'bg-success/5 border-success/20' : 'bg-card border-border hover:border-warning/20'
                }`}
                onClick={() => step.route && onNavigate(step.route)}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  done ? 'bg-success/10' : 'bg-warning/10'
                }`}>
                  <Icon className={`w-7 h-7 ${done ? 'text-success' : 'text-warning'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${done ? 'line-through text-success' : 'text-foreground'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStep(step.id); }}
                  className="shrink-0"
                >
                  {done
                    ? <CircleCheck className="w-6 h-6 text-success" />
                    : <Circle className="w-6 h-6 text-muted-foreground/40" />
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions — mirrors real SetupHubScreen */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <h3 className="font-semibold text-sm">Ações Rápidas</h3>
        <p className="text-xs text-muted-foreground">Acesse diretamente a configuração avançada</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('config-hub')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors"
          >
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold">Config Hub Avançado</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-semibold">Ir para Dashboard</span>
          </button>
        </div>
      </div>

      {/* Completion CTA */}
      {isSetupComplete && (
        <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-2xl border border-success/20 p-6 text-center">
          <Check className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg">Configuração Completa!</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Seu restaurante está pronto para operar</p>
          <button onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow mx-auto">
            Ir para o Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
