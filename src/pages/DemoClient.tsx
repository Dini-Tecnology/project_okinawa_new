/**
 * Demo Client Page — v5
 * Multi-service-type demo shell with service type selector
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext } from '@/contexts/DemoContext';
import { PhoneShell, BottomNav, SERVICE_TYPES, ItemIcon, type NavTab } from '@/components/demo/DemoShared';
import {
  ArrowLeft, Check, ChevronRight, Search, QrCode, Gift, User,
  UtensilsCrossed, Zap,
} from 'lucide-react';

// ============ DEMO IMPORTS ============
import { FineDiningDemo, JOURNEY_STEPS as FD_STEPS, SCREEN_INFO as FD_INFO } from '@/components/demo/experiences/FineDiningDemo';
import { QuickServiceDemo, JOURNEY_STEPS as QS_STEPS, SCREEN_INFO as QS_INFO } from '@/components/demo/experiences/QuickServiceDemo';
import { FastCasualDemo, JOURNEY_STEPS as FC_STEPS, SCREEN_INFO as FC_INFO } from '@/components/demo/experiences/FastCasualDemo';
import { CafeBakeryDemo, JOURNEY_STEPS as CB_STEPS, SCREEN_INFO as CB_INFO } from '@/components/demo/experiences/CafeBakeryDemo';
import { BuffetDemo, JOURNEY_STEPS as BF_STEPS, SCREEN_INFO as BF_INFO } from '@/components/demo/experiences/BuffetDemo';
import { DriveThruDemo, JOURNEY_STEPS as DT_STEPS, SCREEN_INFO as DT_INFO } from '@/components/demo/experiences/DriveThruDemo';
import { FoodTruckDemo, JOURNEY_STEPS as FT_STEPS, SCREEN_INFO as FT_INFO } from '@/components/demo/experiences/FoodTruckDemo';
import { ChefsTableDemo, JOURNEY_STEPS as CT_STEPS, SCREEN_INFO as CT_INFO } from '@/components/demo/experiences/ChefsTableDemo';
import { CasualDiningDemo, JOURNEY_STEPS as CD_STEPS, SCREEN_INFO as CD_INFO } from '@/components/demo/experiences/CasualDiningDemo';
import { PubBarDemo, JOURNEY_STEPS as PB_STEPS, SCREEN_INFO as PB_INFO } from '@/components/demo/experiences/PubBarDemo';
import { ClubDemo, JOURNEY_STEPS as CL_STEPS, SCREEN_INFO as CL_INFO } from '@/components/demo/experiences/ClubDemo';

// ============ DEMO REGISTRY ============

interface DemoConfig {
  component: React.FC<{ screen: string; onNavigate: (s: string) => void }>;
  steps: { step: number; label: string; screens: string[] }[];
  info: Record<string, { title: string; desc: string }>;
  defaultScreen: string;
  hasBottomNav: boolean;
}

const DEMO_REGISTRY: Record<string, DemoConfig> = {
  'fine-dining':    { component: FineDiningDemo,   steps: FD_STEPS, info: FD_INFO, defaultScreen: 'home', hasBottomNav: true },
  'quick-service':  { component: QuickServiceDemo, steps: QS_STEPS, info: QS_INFO, defaultScreen: 'home', hasBottomNav: false },
  'fast-casual':    { component: FastCasualDemo,   steps: FC_STEPS, info: FC_INFO, defaultScreen: 'home', hasBottomNav: false },
  'cafe-bakery':    { component: CafeBakeryDemo,   steps: CB_STEPS, info: CB_INFO, defaultScreen: 'home', hasBottomNav: false },
  'buffet':         { component: BuffetDemo,       steps: BF_STEPS, info: BF_INFO, defaultScreen: 'home', hasBottomNav: false },
  'drive-thru':     { component: DriveThruDemo,    steps: DT_STEPS, info: DT_INFO, defaultScreen: 'home', hasBottomNav: false },
  'food-truck':     { component: FoodTruckDemo,    steps: FT_STEPS, info: FT_INFO, defaultScreen: 'home', hasBottomNav: false },
  'chefs-table':    { component: ChefsTableDemo,   steps: CT_STEPS, info: CT_INFO, defaultScreen: 'home', hasBottomNav: false },
  'casual-dining':  { component: CasualDiningDemo, steps: CD_STEPS, info: CD_INFO, defaultScreen: 'home', hasBottomNav: false },
  'pub-bar':        { component: PubBarDemo,       steps: PB_STEPS, info: PB_INFO, defaultScreen: 'home', hasBottomNav: false },
  'club':           { component: ClubDemo,         steps: CL_STEPS, info: CL_INFO, defaultScreen: 'home', hasBottomNav: false },
};

// ============ FINE DINING NAV HELPERS ============

const FD_TAB_MAP: Record<string, NavTab> = {
  home: 'explore', restaurant: 'explore',
  menu: 'orders', item: 'orders', comanda: 'orders', 'fechar-conta': 'orders',
  'order-status': 'orders', 'my-orders': 'orders', 'call-waiter': 'orders',
  'payment-success': 'orders', 'ai-harmonization': 'orders',
  'qr-scan': 'scan',
  loyalty: 'loyalty',
  profile: 'profile', reservations: 'profile', 'virtual-queue': 'profile', notifications: 'profile',
};

const FD_TAB_SCREENS: Record<NavTab, string> = {
  explore: 'home',
  orders: 'my-orders',
  scan: 'qr-scan',
  loyalty: 'loyalty',
  profile: 'profile',
};

// ============ MAIN COMPONENT ============

const DemoClientInner = () => {
  const [serviceType, setServiceType] = useState('fine-dining');
  const [currentScreen, setCurrentScreen] = useState('home');
  const { cart } = useDemoContext();
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const config = DEMO_REGISTRY[serviceType];
  const ActiveDemo = config?.component;

  // Reset screen when service type changes
  useEffect(() => {
    if (config) setCurrentScreen(config.defaultScreen);
  }, [serviceType]);

  const activeServiceType = SERVICE_TYPES.find(s => s.id === serviceType);
  const info = config?.info[currentScreen] || { title: 'Demo', desc: '' };
  const currentStepIdx = config?.steps.findIndex(s => s.screens.includes(currentScreen)) ?? -1;

  const handleTabChange = (tab: NavTab) => {
    const screen = FD_TAB_SCREENS[tab];
    if (screen) setCurrentScreen(screen);
  };

  return (
    <>
      <Helmet>
        <title>Demo Cliente | NOOWE — Experiência Interativa</title>
        <meta name="description" content="Experimente o app NOOWE como um cliente real. 11 tipos de serviço, jornadas completas e interativas." />
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex flex-col items-center py-6 px-4">
        {/* Header */}
        <div className="w-full max-w-7xl flex items-center justify-between mb-4">
          <Link to="/demo" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />Voltar à demo
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/demo/restaurant" className="px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors">
              Ver Demo Restaurante →
            </Link>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Demo Cliente</span>
          </div>
        </div>

        {/* Service Type Selector */}
        <div className="w-full max-w-7xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Escolha a experiência</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SERVICE_TYPES.map((st) => {
              const isActive = serviceType === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setServiceType(st.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <span className="text-base">{st.emoji}</span>
                  <div className="text-left">
                    <p className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{st.name}</p>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">{st.tagline}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active demo title */}
        <div className="w-full max-w-7xl mb-4">
          <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${activeServiceType?.color || ''} border border-border/50`}>
            <span className="text-3xl">{activeServiceType?.emoji}</span>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">{activeServiceType?.restaurant}</h1>
              <p className="text-sm text-muted-foreground">{activeServiceType?.name} · {activeServiceType?.tagline}</p>
            </div>
          </div>
        </div>

        {/* Main content: sidebar + phone + info */}
        <div className="flex gap-8 items-start max-w-7xl w-full justify-center">
          {/* Journey sidebar */}
          <div className="hidden md:block w-60 shrink-0 sticky top-8">
            <h2 className="font-display text-sm font-bold mb-1 text-foreground">Jornada do Cliente</h2>
            <p className="text-xs text-muted-foreground mb-4">Siga os passos ou explore livremente</p>
            <div className="space-y-0.5">
              {config?.steps.map(({ step, label, screens }) => {
                const isActive = screens.includes(currentScreen);
                const isPast = currentStepIdx > config.steps.findIndex(s => s.step === step);
                return (
                  <button
                    key={step}
                    onClick={() => setCurrentScreen(screens[0])}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                      isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive ? 'bg-primary text-primary-foreground'
                      : isPast ? 'bg-success/20 text-success'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                      {isPast && !isActive ? <Check className="w-3 h-3" /> : step}
                    </div>
                    <span className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone */}
          <div className="relative">
            <PhoneShell>
              {ActiveDemo && <ActiveDemo screen={currentScreen} onNavigate={setCurrentScreen} />}
            </PhoneShell>
            {config?.hasBottomNav && (
              <BottomNav
                activeTab={FD_TAB_MAP[currentScreen] || 'explore'}
                onTabChange={handleTabChange}
                cartCount={cartCount}
                notifCount={3}
              />
            )}
          </div>

          {/* Info sidebar */}
          <div className="hidden xl:block w-72 shrink-0 sticky top-8">
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold mb-2">{info.emoji} {info.title}</h3>
              <p className="text-sm text-muted-foreground">{info.desc}</p>
            </div>

            {/* Service type features */}
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <span>{activeServiceType?.emoji}</span>
                {activeServiceType?.name}
              </h3>
              <div className="space-y-2">
                {config?.steps.slice(0, 5).map(({ step, label }) => (
                  <div key={step} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-success shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
                {(config?.steps.length ?? 0) > 5 && (
                  <p className="text-xs text-muted-foreground/60">+{(config?.steps.length ?? 0) - 5} etapas na jornada</p>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
              <h3 className="font-display font-bold mb-2">Quer isso no seu restaurante?</h3>
              <p className="text-xs text-muted-foreground mb-4">Leve a experiência NOOWE para seus clientes.</p>
              <a
                href="https://wa.me/5511999999999?text=Olá! Vi a demo do app cliente da NOOWE e gostaria de saber mais."
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

const DemoClient = () => (
  <DemoProvider>
    <DemoClientInner />
  </DemoProvider>
);

export default DemoClient;
