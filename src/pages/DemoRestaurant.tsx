/**
 * Demo Restaurant Page — v4
 * Follows the same visual pattern as DemoClient:
 * Role selector → Journey sidebar | Content frame | Info sidebar
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext } from '@/contexts/DemoContext';
import { ItemIcon } from '@/components/demo/DemoShared';
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, Zap,
  Monitor, Bell, Play, Pause,
} from 'lucide-react';
import {
  ROLE_CONFIG, ROLE_JOURNEYS, SCREEN_INFO,
  type RestaurantScreen, type StaffRole,
} from '@/components/demo/restaurant/RestaurantDemoShared';
import { WelcomeScreen, SetupScreen } from '@/components/demo/restaurant/SetupScreens';
import { DashboardScreen, AnalyticsScreen } from '@/components/demo/restaurant/DashboardScreens';
import { TableMapScreen, OrdersScreen, KDSScreen } from '@/components/demo/restaurant/OperationsScreens';
import { MaitreScreen, WaiterScreen, MenuEditorScreen, TeamScreen } from '@/components/demo/restaurant/ServiceScreens';
import {
  ManagerOpsScreen, ApprovalsScreen, BarmanStationScreen, DrinkRecipesScreen,
  CookStationScreen, StockScreen, WaiterCallsScreen, WaiterTipsScreen,
  FloorFlowScreen, DailyReportScreen,
} from '@/components/demo/restaurant/RoleScreens';

// ============ SCREEN RENDERER ============

const ScreenRenderer: React.FC<{ screen: RestaurantScreen; onNavigate: (s: string) => void; onSelectRole: (r: StaffRole) => void }> = ({ screen, onNavigate, onSelectRole }) => {
  switch (screen) {
    case 'welcome': return <WelcomeScreen onNavigate={onNavigate} onSelectRole={onSelectRole} />;
    case 'setup': return <SetupScreen onNavigate={onNavigate} />;
    case 'dashboard': return <DashboardScreen onNavigate={onNavigate} />;
    case 'table-map': return <TableMapScreen onNavigate={onNavigate} />;
    case 'orders': return <OrdersScreen onNavigate={onNavigate} />;
    case 'kds-kitchen': return <KDSScreen view="kitchen" onNavigate={onNavigate} />;
    case 'kds-bar': return <KDSScreen view="bar" onNavigate={onNavigate} />;
    case 'maitre': return <MaitreScreen onNavigate={onNavigate} />;
    case 'waiter': return <WaiterScreen onNavigate={onNavigate} />;
    case 'menu-editor': return <MenuEditorScreen onNavigate={onNavigate} />;
    case 'team': return <TeamScreen onNavigate={onNavigate} />;
    case 'analytics': return <AnalyticsScreen onNavigate={onNavigate} />;
    case 'manager-ops': return <ManagerOpsScreen onNavigate={onNavigate} />;
    case 'approvals': return <ApprovalsScreen onNavigate={onNavigate} />;
    case 'barman-station': return <BarmanStationScreen onNavigate={onNavigate} />;
    case 'drink-recipes': return <DrinkRecipesScreen onNavigate={onNavigate} />;
    case 'cook-station': return <CookStationScreen onNavigate={onNavigate} />;
    case 'stock': return <StockScreen onNavigate={onNavigate} />;
    case 'waiter-calls': return <WaiterCallsScreen onNavigate={onNavigate} />;
    case 'waiter-tips': return <WaiterTipsScreen onNavigate={onNavigate} />;
    case 'floor-flow': return <FloorFlowScreen onNavigate={onNavigate} />;
    case 'daily-report': return <DailyReportScreen onNavigate={onNavigate} />;
    default: return <WelcomeScreen onNavigate={onNavigate} onSelectRole={onSelectRole} />;
  }
};

// ============ MAIN INNER COMPONENT ============

const DemoRestaurantInner = () => {
  const [activeRole, setActiveRole] = useState<StaffRole>('owner');
  const [activeScreen, setActiveScreen] = useState<RestaurantScreen>('dashboard');
  const { isSimulationRunning, toggleSimulation, unreadNotifications, restaurant } = useDemoContext();

  const roleConfig = ROLE_CONFIG.find(r => r.id === activeRole)!;
  const currentJourney = ROLE_JOURNEYS[activeRole];
  const currentStageIdx = currentJourney.findIndex(s => s.screen === activeScreen);
  const currentInfo = SCREEN_INFO[activeScreen];

  // When role changes, navigate to that role's default screen
  useEffect(() => {
    const config = ROLE_CONFIG.find(r => r.id === activeRole);
    if (config) setActiveScreen(config.defaultScreen);
  }, [activeRole]);

  const handleRoleChange = (role: StaffRole) => {
    setActiveRole(role);
  };

  const handleNavigate = (screen: string) => {
    setActiveScreen(screen as RestaurantScreen);
  };

  const goNext = () => {
    if (currentStageIdx < currentJourney.length - 1) {
      setActiveScreen(currentJourney[currentStageIdx + 1].screen);
    }
  };

  const goPrev = () => {
    if (currentStageIdx > 0) {
      setActiveScreen(currentJourney[currentStageIdx - 1].screen);
    }
  };

  return (
    <>
      <Helmet>
        <title>Demo Restaurante | NOOWE — Painel Operacional</title>
        <meta name="description" content="Explore o painel NOOWE pela perspectiva de cada membro da equipe: dono, gerente, maitre, chef, barman, cozinheiro e garçom." />
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex flex-col items-center py-6 px-4">
        {/* Header — same pattern as DemoClient */}
        <div className="w-full max-w-7xl flex items-center justify-between mb-4">
          <Link to="/demo" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />Voltar à demo
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                isSimulationRunning ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              }`}
            >
              {isSimulationRunning ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {isSimulationRunning ? 'Ao vivo' : 'Pausado'}
            </button>
            <button className="relative w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <Link to="/demo/client" className="px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors">
              Ver Demo Cliente →
            </Link>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Demo Restaurante</span>
          </div>
        </div>

        {/* Role Selector — same pattern as service type selector */}
        <div className="w-full max-w-7xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Escolha o perfil</h2>
            <span className="text-xs text-muted-foreground">Explore o painel sob a perspectiva de cada membro da equipe</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {ROLE_CONFIG.map((role) => {
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <span className="text-lg">{role.emoji}</span>
                  <div className="text-left">
                    <p className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{role.label}</p>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">{role.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Role Banner — same pattern as active service type */}
        <div className="w-full max-w-7xl mb-4">
          <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${roleConfig.gradient} border border-border/50`}>
            <div className={`w-12 h-12 rounded-xl ${roleConfig.bgClass} flex items-center justify-center`}>
              <span className="text-2xl">{roleConfig.emoji}</span>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-lg font-bold text-foreground">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">{roleConfig.label} · {roleConfig.desc}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Monitor className="w-4 h-4" />
              <span>Visão Desktop</span>
            </div>
          </div>
        </div>

        {/* Main content: sidebar + content + info — same 3-col layout as DemoClient */}
        <div className="flex gap-8 items-start max-w-7xl w-full">
          {/* Journey sidebar — left */}
          <div className="hidden md:block w-60 shrink-0 sticky top-8">
            <h2 className="font-display text-sm font-bold mb-1 text-foreground">Jornada · {roleConfig.label}</h2>
            <p className="text-xs text-muted-foreground mb-4">Siga os passos ou explore livremente</p>
            <div className="space-y-0.5">
              {currentJourney.map((stage, i) => {
                const isActive = activeScreen === stage.screen;
                const isPast = i < currentStageIdx;
                return (
                  <button
                    key={stage.screen}
                    onClick={() => setActiveScreen(stage.screen)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                      isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive ? 'bg-primary text-primary-foreground'
                      : isPast ? 'bg-success/20 text-success'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                      {isPast && !isActive ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <div className="min-w-0">
                      <span className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{stage.label}</span>
                      {isActive && <p className="text-[10px] text-muted-foreground truncate">{stage.desc}</p>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom nav arrows */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <button onClick={goPrev} disabled={currentStageIdx <= 0}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-medium disabled:opacity-30 hover:bg-muted transition-colors">
                <ArrowLeft className="w-3 h-3" /> Anterior
              </button>
              <button onClick={goNext} disabled={currentStageIdx >= currentJourney.length - 1}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-30">
                Próximo <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Content Frame — center */}
          <div className="flex-1 min-w-0">
            {/* Screen breadcrumb + progress */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{roleConfig.emoji} {roleConfig.label}</span>
                <ChevronRight className="w-3 h-3" />
                <span>{currentInfo.title}</span>
                <span className="text-muted-foreground/50">· {currentStageIdx + 1}/{currentJourney.length}</span>
              </div>
              {/* Dot indicators (mobile) */}
              <div className="flex md:hidden items-center gap-1">
                {currentJourney.map((stage, i) => (
                  <button key={stage.screen} onClick={() => setActiveScreen(stage.screen)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStageIdx ? 'bg-primary w-5' : i < currentStageIdx ? 'bg-success' : 'bg-muted-foreground/20'
                    }`} />
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-muted rounded-full overflow-hidden mb-4">
              <div className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((currentStageIdx + 1) / currentJourney.length) * 100}%` }} />
            </div>

            {/* Content card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden min-h-[600px]">
              <div className="p-6">
                <ScreenRenderer screen={activeScreen} onNavigate={handleNavigate} onSelectRole={handleRoleChange} />
              </div>
            </div>

            {/* Mobile bottom nav */}
            <div className="flex md:hidden items-center justify-between mt-4">
              <button onClick={goPrev} disabled={currentStageIdx <= 0}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-30">
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
              {currentStageIdx < currentJourney.length - 1 ? (
                <button onClick={goNext}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                  Próximo <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <a href="https://wa.me/5511999999999?text=Vi%20a%20demo%20completa%20NOOWE%20e%20quero%20aderir!"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                  Quero NOOWE <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Info sidebar — right */}
          <div className="hidden xl:block w-72 shrink-0 sticky top-8">
            {/* Current screen info */}
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold mb-2">{currentInfo.title}</h3>
              <p className="text-sm text-muted-foreground">{currentInfo.desc}</p>
            </div>

            {/* Role journey features */}
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <span>{roleConfig.emoji}</span>
                {roleConfig.label}
              </h3>
              <div className="space-y-2">
                {currentJourney.slice(0, 5).map((stage) => (
                  <div key={stage.screen} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-success shrink-0" />
                    <span>{stage.label}</span>
                  </div>
                ))}
                {currentJourney.length > 5 && (
                  <p className="text-xs text-muted-foreground/60">+{currentJourney.length - 5} telas na jornada</p>
                )}
              </div>
            </div>

            {/* Other roles quick switch */}
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold text-sm mb-3">Outros perfis</h3>
              <div className="space-y-1.5">
                {ROLE_CONFIG.filter(r => r.id !== activeRole).map(role => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <span>{role.emoji}</span>
                    <div>
                      <p className="text-xs font-medium text-foreground">{role.label}</p>
                      <p className="text-[10px] text-muted-foreground">{role.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
              <h3 className="font-display font-bold mb-2">Quer isso no seu restaurante?</h3>
              <p className="text-xs text-muted-foreground mb-4">Tenha o painel NOOWE completo na sua operação.</p>
              <a
                href="https://wa.me/5511999999999?text=Vi%20a%20demo%20do%20painel%20NOOWE%20e%20quero%20saber%20mais!"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow"
              >
                Falar com a equipe
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const DemoRestaurant = () => (
  <DemoProvider>
    <DemoRestaurantInner />
  </DemoProvider>
);

export default DemoRestaurant;
