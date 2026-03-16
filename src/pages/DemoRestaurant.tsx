/**
 * Demo Restaurant Page — v8
 * Same guided journey architecture as DemoClient, with real responsive adaptation.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext } from '@/contexts/DemoContext';
import { PhoneShell } from '@/components/demo/DemoShared';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ArrowLeft,
  Check,
  ChevronRight,
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

const DemoRestaurantInner = () => {
  const isMobile = useIsMobile();
  const [activeRole, setActiveRole] = useState<StaffRole>('owner');
  const [activeScreen, setActiveScreen] = useState<RestaurantScreen>('dashboard');
  const { restaurant } = useDemoContext();

  const roleConfig = ROLE_CONFIG.find((r) => r.id === activeRole)!;
  const currentJourney = ROLE_JOURNEYS[activeRole];
  const currentStepIdx = currentJourney.findIndex((s) => s.screen === activeScreen);
  const info = SCREEN_INFO[activeScreen];

  useEffect(() => {
    const config = ROLE_CONFIG.find((r) => r.id === activeRole);
    if (config) setActiveScreen(config.defaultScreen);
  }, [activeRole]);

  const handleNavigate = (screen: string) => setActiveScreen(screen as RestaurantScreen);
  const handleRoleChange = (role: StaffRole) => setActiveRole(role);

  return (
    <>
      <Helmet>
        <title>Demo Restaurante | NOOWE — Painel Operacional</title>
        <meta
          name="description"
          content="Explore o painel NOOWE pela perspectiva de cada membro da equipe com jornada guiada adaptada para mobile, tablet e desktop."
        />
      </Helmet>

      <div className="min-h-screen bg-muted/30 px-4 py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center">
          <div className="mb-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/demo" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />Voltar à demo
            </Link>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <Link to="/demo/client" className="rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
                Ver Demo Cliente →
              </Link>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Demo Restaurante</span>
            </div>
          </div>

          <div className="mb-6 w-full max-w-7xl">
            <div className="mb-3 flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Escolha o perfil</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {ROLE_CONFIG.map((role) => {
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border-2 px-4 py-2.5 text-left transition-all ${
                      isActive
                        ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10'
                        : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${role.bgClass}`}>
                      <span className="text-base">{role.emoji}</span>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{role.label}</p>
                      <p className="hidden text-[10px] text-muted-foreground sm:block">{role.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4 w-full max-w-7xl">
            <div className={`flex items-center gap-3 rounded-2xl border border-border/50 bg-gradient-to-r ${roleConfig.gradient} p-4`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${roleConfig.bgClass}`}>
                <span className="text-2xl">{roleConfig.emoji}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-lg font-bold text-foreground">{restaurant.name}</h1>
                <p className="text-sm text-muted-foreground">{roleConfig.label} · {roleConfig.desc}</p>
              </div>
            </div>
          </div>

          {isMobile ? (
            <div className="w-full max-w-md space-y-4">
              <div className="overflow-x-auto pb-1 scrollbar-hide">
                <div className="flex gap-2">
                  {currentJourney.map((stage, index) => {
                    const isActive = activeScreen === stage.screen;
                    const isPast = currentStepIdx > index;
                    return (
                      <button
                        key={stage.screen}
                        onClick={() => setActiveScreen(stage.screen)}
                        className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold transition-all ${
                          isActive
                            ? 'border-primary bg-primary text-primary-foreground'
                            : isPast
                              ? 'border-success/20 bg-success/10 text-success'
                              : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        {index + 1}. {stage.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-background shadow-xl overflow-hidden">
                <div className="border-b border-border bg-card/70 px-4 py-3 backdrop-blur">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{roleConfig.emoji} {roleConfig.label}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="truncate">{info.title}</span>
                    <span className="text-muted-foreground/60">· {currentStepIdx + 1}/{currentJourney.length}</span>
                  </div>
                </div>
                <div className="max-h-[70vh] overflow-y-auto p-3">
                  <MobileRestaurantScreen
                    screen={activeScreen}
                    activeRole={activeRole}
                    onNavigate={handleNavigate}
                    onSelectRole={handleRoleChange}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display font-bold text-foreground">{info.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{info.desc}</p>
              </div>
            </div>
          ) : (
            <div className="flex w-full max-w-7xl items-start justify-center gap-6 xl:gap-8">
              <aside className="sticky top-8 hidden w-60 shrink-0 md:block">
                <h2 className="mb-1 font-display text-sm font-bold text-foreground">Jornada · {roleConfig.label}</h2>
                <p className="mb-4 text-xs text-muted-foreground">Siga os passos ou explore livremente</p>
                <div className="space-y-0.5">
                  {currentJourney.map((stage, index) => {
                    const isActive = activeScreen === stage.screen;
                    const isPast = currentStepIdx > index;
                    return (
                      <button
                        key={stage.screen}
                        onClick={() => setActiveScreen(stage.screen)}
                        className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all ${
                          isActive ? 'border border-primary/20 bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : isPast
                              ? 'bg-success/20 text-success'
                              : 'bg-muted text-muted-foreground'
                        }`}>
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
              </aside>

              <main className="min-w-0 flex-1 max-w-[420px] lg:max-w-none lg:flex-[0_0_auto]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{roleConfig.emoji} {roleConfig.label}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span>{info.title}</span>
                    <span className="text-muted-foreground/50">· {currentStepIdx + 1}/{currentJourney.length}</span>
                  </div>
                </div>

                <div className="relative flex justify-center">
                  <PhoneShell>
                    <ScreenRenderer screen={activeScreen} onNavigate={handleNavigate} onSelectRole={handleRoleChange} />
                  </PhoneShell>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-card p-4 xl:hidden">
                  <h3 className="font-display font-bold text-foreground">{info.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{info.desc}</p>
                </div>
              </main>

              <aside className="sticky top-8 hidden w-72 shrink-0 xl:block">
                <div className="mb-5 rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-2 font-display font-bold">{info.title}</h3>
                  <p className="text-sm text-muted-foreground">{info.desc}</p>
                </div>

                <div className="mb-5 rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-display font-bold">
                    <span>{roleConfig.emoji}</span>
                    Jornada · {roleConfig.label}
                  </h3>
                  <div className="space-y-2">
                    {currentJourney.slice(0, 5).map((stage) => (
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
                    {ROLE_CONFIG.filter((role) => role.id !== activeRole).map((role) => (
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
                  <a
                    href="https://wa.me/5511999999999?text=Vi%20a%20demo%20do%20painel%20NOOWE%20e%20quero%20saber%20mais!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-glow"
                  >
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
