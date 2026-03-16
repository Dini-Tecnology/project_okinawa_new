/**
 * Demo Restaurant Page — v3
 * Role-driven Guided Journey with 7 staff profiles
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext } from '@/contexts/DemoContext';
import {
  ArrowLeft, ArrowRight, Bell, Play, Pause, Check,
  ChevronRight, Zap, Home,
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

// ============ MAIN INNER COMPONENT ============

const DemoRestaurantInner = () => {
  const [activeScreen, setActiveScreen] = useState<RestaurantScreen>('welcome');
  const [activeRole, setActiveRole] = useState<StaffRole | null>(null);
  const { isSimulationRunning, toggleSimulation, unreadNotifications, restaurant } = useDemoContext();

  // Current role journey
  const currentJourney = activeRole ? ROLE_JOURNEYS[activeRole] : [];
  const currentStageIdx = currentJourney.findIndex(s => s.screen === activeScreen);
  const currentInfo = SCREEN_INFO[activeScreen];
  const roleConfig = activeRole ? ROLE_CONFIG.find(r => r.id === activeRole) : null;

  // When role changes, navigate to that role's default screen
  const handleRoleChange = (role: StaffRole) => {
    setActiveRole(role);
    const config = ROLE_CONFIG.find(r => r.id === role);
    if (config) setActiveScreen(config.defaultScreen);
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

  const goHome = () => {
    setActiveRole(null);
    setActiveScreen('welcome');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'welcome': return <WelcomeScreen onNavigate={handleNavigate} onSelectRole={handleRoleChange} />;
      case 'setup': return <SetupScreen onNavigate={handleNavigate} />;
      case 'dashboard': return <DashboardScreen onNavigate={handleNavigate} />;
      case 'table-map': return <TableMapScreen onNavigate={handleNavigate} />;
      case 'orders': return <OrdersScreen onNavigate={handleNavigate} />;
      case 'kds-kitchen': return <KDSScreen view="kitchen" onNavigate={handleNavigate} />;
      case 'kds-bar': return <KDSScreen view="bar" onNavigate={handleNavigate} />;
      case 'maitre': return <MaitreScreen onNavigate={handleNavigate} />;
      case 'waiter': return <WaiterScreen onNavigate={handleNavigate} />;
      case 'menu-editor': return <MenuEditorScreen onNavigate={handleNavigate} />;
      case 'team': return <TeamScreen onNavigate={handleNavigate} />;
      case 'analytics': return <AnalyticsScreen onNavigate={handleNavigate} />;
      // New role-specific screens
      case 'manager-ops': return <ManagerOpsScreen onNavigate={handleNavigate} />;
      case 'approvals': return <ApprovalsScreen onNavigate={handleNavigate} />;
      case 'barman-station': return <BarmanStationScreen onNavigate={handleNavigate} />;
      case 'drink-recipes': return <DrinkRecipesScreen onNavigate={handleNavigate} />;
      case 'cook-station': return <CookStationScreen onNavigate={handleNavigate} />;
      case 'stock': return <StockScreen onNavigate={handleNavigate} />;
      case 'waiter-calls': return <WaiterCallsScreen onNavigate={handleNavigate} />;
      case 'waiter-tips': return <WaiterTipsScreen onNavigate={handleNavigate} />;
      case 'floor-flow': return <FloorFlowScreen onNavigate={handleNavigate} />;
      case 'daily-report': return <DailyReportScreen onNavigate={handleNavigate} />;
      default: return <WelcomeScreen onNavigate={handleNavigate} onSelectRole={handleRoleChange} />;
    }
  };

  const isWelcome = activeScreen === 'welcome' && !activeRole;

  return (
    <>
      <Helmet>
        <title>Demo Restaurante | NOOWE — Painel Operacional</title>
        <meta name="description" content="Explore o painel NOOWE pela perspectiva de cada membro da equipe: dono, gerente, maitre, chef, barman, cozinheiro e garçom." />
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs font-display">N</span>
                </div>
                <div>
                  <p className="font-display font-bold text-sm leading-tight">{restaurant.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {roleConfig ? (
                      <span className="flex items-center gap-1">
                        <span>{roleConfig.emoji}</span>
                        <span>{roleConfig.label}</span>
                      </span>
                    ) : 'Escolha um perfil'}
                  </p>
                </div>
              </div>
            </div>

            {/* Role Switcher */}
            {activeRole && (
              <div className="hidden md:flex items-center gap-0.5 bg-muted rounded-xl p-0.5">
                <button
                  onClick={goHome}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-all"
                  title="Voltar ao início"
                >
                  <Home className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-border mx-0.5" />
                {ROLE_CONFIG.map(role => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      activeRole === role.id
                        ? `bg-card shadow-sm ${role.colorClass} font-semibold`
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title={role.desc}
                  >
                    <span>{role.emoji}</span>
                    <span className="hidden xl:inline">{role.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Link to="/demo/client" className="hidden md:flex px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors">
                Demo Cliente →
              </Link>
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
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">DEMO</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
          {/* Journey Sidebar — only shown when a role is selected */}
          {activeRole && (
            <aside className="hidden md:flex flex-col w-[240px] lg:w-[260px] border-r border-border bg-card shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
              {/* Role Identity */}
              <div className={`p-4 border-b border-border bg-gradient-to-r ${roleConfig?.gradient || ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{roleConfig?.emoji}</span>
                  <div>
                    <p className="font-display font-bold text-sm">{roleConfig?.label}</p>
                    <p className="text-[10px] text-muted-foreground">{roleConfig?.desc}</p>
                  </div>
                </div>
              </div>

              {/* Journey Steps */}
              <div className="p-3 flex-1">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold px-2 mb-2">
                  Jornada · {currentJourney.length} telas
                </p>
                <div className="space-y-0.5">
                  {currentJourney.map((stage, i) => {
                    const isActive = activeScreen === stage.screen;
                    const isPast = i < currentStageIdx;

                    return (
                      <button
                        key={stage.screen}
                        onClick={() => setActiveScreen(stage.screen)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-semibold shadow-glow'
                            : isPast
                            ? 'text-foreground hover:bg-muted/50'
                            : 'text-muted-foreground hover:bg-muted/30'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-primary-foreground/20' : isPast ? 'bg-success/10' : 'bg-muted'
                        }`}>
                          {isPast ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <stage.icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate">{stage.label}</p>
                          {isActive && <p className="text-[10px] opacity-70 truncate">{stage.desc}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar CTA */}
              <div className="p-3 border-t border-border">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-semibold mb-1.5">Quer ver isso no seu restaurante?</p>
                  <a
                    href="https://wa.me/5511999999999?text=Vi%20a%20demo%20NOOWE%20e%20quero%20saber%20mais!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
                  >
                    Falar conosco <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 flex flex-col">
            {/* Screen Header — only when a role is active */}
            {activeRole && currentStageIdx >= 0 && (
              <div className="bg-card border-b border-border px-6 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{currentStageIdx + 1}/{currentJourney.length}</span>
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-foreground font-medium">{currentInfo.title}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{currentInfo.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={goPrev} disabled={currentStageIdx <= 0}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button onClick={goNext} disabled={currentStageIdx >= currentJourney.length - 1}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Progress */}
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${((currentStageIdx + 1) / currentJourney.length) * 100}%` }} />
                </div>
              </div>
            )}

            {/* Screen Content */}
            <div className={`flex-1 ${isWelcome ? 'p-0' : 'p-6'}`}>
              {renderScreen()}
            </div>

            {/* Bottom Navigation — only when role is active */}
            {activeRole && currentStageIdx >= 0 && (
              <div className="border-t border-border bg-card px-6 py-3 flex items-center justify-between">
                <button onClick={goPrev} disabled={currentStageIdx <= 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-30 hover:bg-muted transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Anterior
                </button>
                <div className="flex items-center gap-1">
                  {currentJourney.map((stage, i) => (
                    <button key={stage.screen} onClick={() => setActiveScreen(stage.screen)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentStageIdx ? 'bg-primary w-6' : i < currentStageIdx ? 'bg-success' : 'bg-muted-foreground/20'
                      }`} />
                  ))}
                </div>
                {currentStageIdx < currentJourney.length - 1 ? (
                  <button onClick={goNext}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-glow">
                    Próximo <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <a href="https://wa.me/5511999999999?text=Vi%20a%20demo%20completa%20NOOWE%20e%20quero%20aderir!"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-glow">
                    Quero para meu restaurante <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </main>
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
