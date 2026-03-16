/**
 * Demo Restaurant Page — v6
 * Real dual-shell experience: true desktop + true mobile journey
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext } from '@/contexts/DemoContext';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  Monitor,
  Pause,
  Play,
  Smartphone,
  Zap,
} from 'lucide-react';
import {
  ROLE_CONFIG,
  ROLE_JOURNEYS,
  SCREEN_INFO,
  type RestaurantScreen,
  type StaffRole,
} from '@/components/demo/restaurant/RestaurantDemoShared';
import { WelcomeScreen, SetupScreen } from '@/components/demo/restaurant/SetupScreens';
import { DashboardScreen, AnalyticsScreen } from '@/components/demo/restaurant/DashboardScreens';
import { TableMapScreen, OrdersScreen, KDSScreen } from '@/components/demo/restaurant/OperationsScreens';
import { MaitreScreen, WaiterScreen, MenuEditorScreen, TeamScreen } from '@/components/demo/restaurant/ServiceScreens';
import {
  ManagerOpsScreen,
  ApprovalsScreen,
  BarmanStationScreen,
  DrinkRecipesScreen,
  CookStationScreen,
  StockScreen,
  WaiterCallsScreen,
  WaiterTipsScreen,
  FloorFlowScreen,
  DailyReportScreen,
} from '@/components/demo/restaurant/RoleScreens';
import { MobileRestaurantScreen } from '@/components/demo/restaurant/MobileRestaurantScreens';

export type ViewMode = 'mobile' | 'desktop';

const ScreenRenderer: React.FC<{
  screen: RestaurantScreen;
  onNavigate: (s: string) => void;
  onSelectRole: (r: StaffRole) => void;
}> = ({ screen, onNavigate, onSelectRole }) => {
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

const ResponsivePhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative mx-auto w-full max-w-[390px] aspect-[375/812] shrink-0">
    <div className="absolute inset-0 rounded-[3rem] bg-foreground/90 shadow-2xl" />
    <div className="absolute inset-[3px] overflow-hidden rounded-[2.8rem] bg-background">
      <div className="flex h-12 items-center justify-between px-8 text-xs font-semibold text-foreground">
        <span>9:41</span>
        <div className="absolute left-1/2 top-2 h-7 w-28 -translate-x-1/2 rounded-full bg-foreground/90" />
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-4 rounded-sm border border-foreground/60" />
        </div>
      </div>
      <div className="h-[calc(100%-48px)] overflow-hidden">{children}</div>
    </div>
    <div className="absolute bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-foreground/30" />
  </div>
);

const MobileShellHeader: React.FC<{
  roleLabel: string;
  roleEmoji: string;
  restaurantName: string;
  screenTitle: string;
  progress: number;
}> = ({ roleLabel, roleEmoji, restaurantName, screenTitle, progress }) => (
  <div className="border-b border-border bg-background/95 backdrop-blur">
    <div className="bg-gradient-to-r from-primary to-primary/80 px-4 pb-4 pt-2 text-primary-foreground">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{roleEmoji}</span>
          <div>
            <p className="text-[11px] opacity-80">{restaurantName}</p>
            <p className="font-display text-sm font-bold">{roleLabel}</p>
          </div>
        </div>
        <span className="rounded-full bg-primary-foreground/15 px-2 py-1 text-[10px] font-semibold">{progress}%</span>
      </div>
      <p className="mt-3 text-[11px] font-medium opacity-90">{screenTitle}</p>
    </div>
  </div>
);

const DemoRestaurantInner = () => {
  const [activeRole, setActiveRole] = useState<StaffRole>('owner');
  const [activeScreen, setActiveScreen] = useState<RestaurantScreen>('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const { isSimulationRunning, toggleSimulation, unreadNotifications, restaurant } = useDemoContext();

  const roleConfig = ROLE_CONFIG.find(r => r.id === activeRole)!;
  const currentJourney = ROLE_JOURNEYS[activeRole];
  const currentStageIdx = currentJourney.findIndex(s => s.screen === activeScreen);
  const currentInfo = SCREEN_INFO[activeScreen];
  const progress = currentStageIdx >= 0 ? Math.round(((currentStageIdx + 1) / currentJourney.length) * 100) : 0;

  useEffect(() => {
    const config = ROLE_CONFIG.find(r => r.id === activeRole);
    if (config) setActiveScreen(config.defaultScreen);
  }, [activeRole]);

  const handleRoleChange = (role: StaffRole) => setActiveRole(role);
  const handleNavigate = (screen: string) => setActiveScreen(screen as RestaurantScreen);
  const goNext = () => {
    if (currentStageIdx < currentJourney.length - 1) setActiveScreen(currentJourney[currentStageIdx + 1].screen);
  };
  const goPrev = () => {
    if (currentStageIdx > 0) setActiveScreen(currentJourney[currentStageIdx - 1].screen);
  };

  return (
    <>
      <Helmet>
        <title>Demo Restaurante | NOOWE — Painel Operacional</title>
        <meta name="description" content="Explore o painel NOOWE pela perspectiva de cada membro da equipe com visão desktop e mobile realmente navegáveis." />
      </Helmet>

      <div className="min-h-screen bg-muted/30 px-4 py-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Link to="/demo" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />Voltar à demo
              </Link>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Demo Restaurante</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl bg-muted p-0.5">
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'mobile' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> Mobile
                </button>
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'desktop' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Monitor className="h-3.5 w-3.5" /> Desktop
                </button>
              </div>

              <button
                onClick={toggleSimulation}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isSimulationRunning ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}
              >
                {isSimulationRunning ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                {isSimulationRunning ? 'Ao vivo' : 'Pausado'}
              </button>

              <button className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">{unreadNotifications}</span> : null}
              </button>

              <Link to="/demo/client" className="hidden rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted md:flex">
                Demo Cliente →
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Escolha o perfil</h2>
              <span className="hidden text-xs text-muted-foreground sm:inline">Cada perfil muda a jornada e a interface</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {ROLE_CONFIG.map(role => {
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    className={`flex-shrink-0 whitespace-nowrap rounded-xl border-2 px-4 py-2.5 text-left transition-all ${isActive ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10' : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{role.emoji}</span>
                      <div>
                        <p className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{role.label}</p>
                        <p className="hidden text-[10px] text-muted-foreground sm:block">{role.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`mb-4 flex items-center gap-3 rounded-2xl border border-border/50 bg-gradient-to-r ${roleConfig.gradient} p-4`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${roleConfig.bgClass}`}>
              <span className="text-2xl">{roleConfig.emoji}</span>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-lg font-bold text-foreground">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">{roleConfig.label} · {roleConfig.desc}</p>
            </div>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              {viewMode === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              <span>Visão {viewMode === 'mobile' ? 'Mobile' : 'Desktop'}</span>
            </div>
          </div>

          {viewMode === 'mobile' ? (
            <div className="mx-auto flex max-w-md flex-col gap-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {currentJourney.map((stage, index) => {
                  const isActive = activeScreen === stage.screen;
                  return (
                    <button
                      key={stage.screen}
                      onClick={() => setActiveScreen(stage.screen)}
                      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border'}`}
                    >
                      {index + 1}. {stage.label}
                    </button>
                  );
                })}
              </div>

              <ResponsivePhoneFrame>
                <div className="flex h-full flex-col overflow-hidden bg-background">
                  <MobileShellHeader
                    roleLabel={roleConfig.label}
                    roleEmoji={roleConfig.emoji}
                    restaurantName={restaurant.name}
                    screenTitle={currentInfo.title}
                    progress={progress}
                  />

                  <div className="flex-1 overflow-y-auto px-3 py-3">
                    <MobileRestaurantScreen
                      screen={activeScreen}
                      activeRole={activeRole}
                      onNavigate={handleNavigate}
                      onSelectRole={handleRoleChange}
                    />
                  </div>

                  <div className="border-t border-border bg-background/95 px-3 py-2 backdrop-blur">
                    <div className="mb-2 flex items-center justify-center gap-1">
                      {currentJourney.map((stage, index) => (
                        <button
                          key={stage.screen}
                          onClick={() => setActiveScreen(stage.screen)}
                          className={`rounded-full transition-all ${index === currentStageIdx ? 'h-1.5 w-5 bg-primary' : index < currentStageIdx ? 'h-1.5 w-1.5 bg-success' : 'h-1.5 w-1.5 bg-muted-foreground/20'}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button onClick={goPrev} disabled={currentStageIdx <= 0} className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground disabled:opacity-30">
                        <ArrowLeft className="h-3 w-3" /> Anterior
                      </button>
                      {currentStageIdx < currentJourney.length - 1 ? (
                        <button onClick={goNext} className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                          Próximo <ArrowRight className="h-3 w-3" />
                        </button>
                      ) : (
                        <a href="https://wa.me/5511999999999?text=Vi%20a%20demo%20NOOWE%20e%20quero%20saber%20mais!" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                          Quero NOOWE <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </ResponsivePhoneFrame>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-foreground">{currentInfo.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{currentInfo.desc}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-8">
              <aside className="sticky top-8 hidden w-60 shrink-0 md:block">
                <h2 className="mb-1 font-display text-sm font-bold text-foreground">Jornada · {roleConfig.label}</h2>
                <p className="mb-4 text-xs text-muted-foreground">Siga os passos ou explore livremente</p>
                <div className="space-y-0.5">
                  {currentJourney.map((stage, index) => {
                    const isActive = activeScreen === stage.screen;
                    const isPast = index < currentStageIdx;
                    return (
                      <button
                        key={stage.screen}
                        onClick={() => setActiveScreen(stage.screen)}
                        className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all ${isActive ? 'border border-primary/20 bg-primary/10' : 'hover:bg-muted/50'}`}
                      >
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isActive ? 'bg-primary text-primary-foreground' : isPast ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {isPast && !isActive ? <Check className="h-3 w-3" /> : index + 1}
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{stage.label}</span>
                          {isActive ? <p className="truncate text-[10px] text-muted-foreground">{stage.desc}</p> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                  <button onClick={goPrev} disabled={currentStageIdx <= 0} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-30">
                    <ArrowLeft className="h-3 w-3" /> Anterior
                  </button>
                  <button onClick={goNext} disabled={currentStageIdx >= currentJourney.length - 1} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-30">
                    Próximo <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </aside>

              <main className="min-w-0 flex-1">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{roleConfig.emoji} {roleConfig.label}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span>{currentInfo.title}</span>
                    <span className="text-muted-foreground/50">· {currentStageIdx + 1}/{currentJourney.length}</span>
                  </div>
                </div>
                <div className="mb-4 h-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="min-h-[600px] overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="p-6">
                    <ScreenRenderer screen={activeScreen} onNavigate={handleNavigate} onSelectRole={handleRoleChange} />
                  </div>
                </div>
              </main>

              <aside className="sticky top-8 hidden w-72 shrink-0 xl:block">
                <div className="mb-5 rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-2 font-display font-bold">{currentInfo.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentInfo.desc}</p>
                </div>

                <div className="mb-5 rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-display font-bold">
                    <span>{roleConfig.emoji}</span>
                    Jornada · {roleConfig.label}
                  </h3>
                  <div className="space-y-2">
                    {currentJourney.slice(0, 5).map(stage => (
                      <div key={stage.screen} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 shrink-0 text-success" />
                        <span>{stage.label}</span>
                      </div>
                    ))}
                    {currentJourney.length > 5 ? <p className="text-xs text-muted-foreground/60">+{currentJourney.length - 5} telas na jornada</p> : null}
                  </div>
                </div>

                <div className="mb-5 rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-3 text-sm font-display font-bold">Outros perfis</h3>
                  <div className="space-y-1.5">
                    {ROLE_CONFIG.filter(role => role.id !== activeRole).map(role => (
                      <button key={role.id} onClick={() => handleRoleChange(role.id)} className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-muted/50">
                        <span>{role.emoji}</span>
                        <div>
                          <p className="text-xs font-medium text-foreground">{role.label}</p>
                          <p className="text-[10px] text-muted-foreground">{role.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 p-5">
                  <h3 className="mb-2 font-display font-bold">Quer isso no seu restaurante?</h3>
                  <p className="mb-4 text-xs text-muted-foreground">Tenha o painel NOOWE completo na sua operação.</p>
                  <a href="https://wa.me/5511999999999?text=Vi%20a%20demo%20do%20painel%20NOOWE%20e%20quero%20saber%20mais!" target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-glow">
                    Falar com a equipe
                  </a>
                </div>
              </aside>
            </div>
          )}
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
