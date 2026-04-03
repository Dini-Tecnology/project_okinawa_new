/**
 * Demo Client Page — v5
 * Multi-service-type demo shell with service type selector
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext } from '@/contexts/DemoContext';
import { PhoneShell, SERVICE_TYPES, ItemIcon } from '@/components/demo/DemoShared';
import DemoFeedbackWidget, { trackDemoAction } from '@/components/demo/DemoFeedbackWidget';
import { DemoAutoTranslate, DemoI18nProvider, DemoLangSelector, useDemoI18n } from '@/components/demo/DemoI18n';
import DemoBottomNav from '@/components/demo/DemoBottomNav';
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
  /** Screen names for bottom nav tabs */
  navScreens?: { home?: string; menu?: string; orders?: string; wallet?: string; profile?: string };
}

const DEMO_REGISTRY: Record<string, DemoConfig> = {
  'fine-dining':    { component: FineDiningDemo,   steps: FD_STEPS, info: FD_INFO, defaultScreen: 'home', hasBottomNav: true, navScreens: { orders: 'comanda' } },
  'quick-service':  { component: QuickServiceDemo, steps: QS_STEPS, info: QS_INFO, defaultScreen: 'home', hasBottomNav: true, navScreens: { orders: 'cart' } },
  'fast-casual':    { component: FastCasualDemo,   steps: FC_STEPS, info: FC_INFO, defaultScreen: 'home', hasBottomNav: true, navScreens: { menu: 'builder-base', orders: 'builder-summary' } },
  'cafe-bakery':    { component: CafeBakeryDemo,   steps: CB_STEPS, info: CB_INFO, defaultScreen: 'home', hasBottomNav: true, navScreens: { orders: 'comanda' } },
  'buffet':         { component: BuffetDemo,       steps: BF_STEPS, info: BF_INFO, defaultScreen: 'home', hasBottomNav: true, navScreens: { menu: 'stations', orders: 'comanda' } },
  'drive-thru':     { component: DriveThruDemo,    steps: DT_STEPS, info: DT_INFO, defaultScreen: 'home', hasBottomNav: true, navScreens: { orders: 'cart' } },
  'food-truck':     { component: FoodTruckDemo,    steps: FT_STEPS, info: FT_INFO, defaultScreen: 'home', hasBottomNav: true, navScreens: { orders: 'cart' } },
  'chefs-table':    { component: ChefsTableDemo,   steps: CT_STEPS, info: CT_INFO, defaultScreen: 'home', hasBottomNav: true, navScreens: { menu: 'detail', orders: 'course-1' } },
  'casual-dining':  { component: CasualDiningDemo, steps: CD_STEPS, info: CD_INFO, defaultScreen: 'home', hasBottomNav: true, navScreens: { orders: 'comanda' } },
  'pub-bar':        { component: PubBarDemo,       steps: PB_STEPS, info: PB_INFO, defaultScreen: 'home', hasBottomNav: true, navScreens: { home: 'discovery', menu: 'menu', orders: 'tab-live' } },
  'club':           { component: ClubDemo,         steps: CL_STEPS, info: CL_INFO, defaultScreen: 'home', hasBottomNav: true, navScreens: { home: 'discovery', menu: 'floor-menu', orders: 'min-spend' } },
};

// ============ MAIN COMPONENT ============

const DemoClientInner = () => {
  const [serviceType, setServiceType] = useState('fine-dining');
  const [currentScreen, setCurrentScreen] = useState('home');
  const { cart } = useDemoContext();
  const { t, translateText } = useDemoI18n();
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const config = DEMO_REGISTRY[serviceType];
  const ActiveDemo = config?.component;

  // Reset screen when service type changes
  useEffect(() => {
    if (config) setCurrentScreen(config.defaultScreen);
    trackDemoAction(`serviceType:${serviceType}`);
  }, [serviceType]);

  useEffect(() => {
    trackDemoAction(`clientScreen:${currentScreen}`);
  }, [currentScreen]);

  const activeServiceType = SERVICE_TYPES.find(s => s.id === serviceType);
  const rawInfo = config?.info[currentScreen] || { title: 'Demo', desc: '' };
  const info = {
    title: translateText(rawInfo.title),
    desc: translateText(rawInfo.desc),
  };
  const currentStepIdx = config?.steps.findIndex(s => s.screens.includes(currentScreen)) ?? -1;

  const feedbackContext = useMemo(() => ({
    viewportMode: 'mobile',
    activeRole: serviceType,
    journeyStep: config?.steps[currentStepIdx]?.label || currentScreen,
    currentScreen,
  }), [serviceType, currentStepIdx, config, currentScreen]);


  return (
    <>
      <Helmet>
        <title>{t('client', 'title')}</title>
        <meta name="description" content={t('client', 'metaDesc')} />
      </Helmet>

      <DemoAutoTranslate>
        <div className="min-h-screen bg-muted/30 flex flex-col items-center py-6 px-4">
          {/* Header */}
          <div className="w-full max-w-7xl flex items-center justify-between mb-4">
            <Link to="/demo" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />{t('shared', 'backToDemo')}
            </Link>
            <div className="flex items-center gap-3">
              <DemoLangSelector />
              <Link to="/demo/restaurant" className="px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors">
                {t('shared', 'viewRestaurantDemo')}
              </Link>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{t('shared', 'demoClient')}</span>
            </div>
          </div>

          {/* Service Type Selector */}
          <div className="w-full max-w-7xl mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">{t('client', 'chooseExperience')}</h2>
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
                    <ItemIcon cat={st.iconCat} size="xs" />
                    <div className="text-left">
                      <p className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{t('serviceTypes', st.id)}</p>
                      <p className="text-[10px] text-muted-foreground hidden sm:block">{t('serviceTypeTaglines', st.id)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active demo title */}
          <div className="w-full max-w-7xl mb-4">
            <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${activeServiceType?.color || ''} border border-border/50`}>
              <ItemIcon cat={activeServiceType?.iconCat || 'generic'} size="lg" />
              <div>
                <h1 className="font-display text-lg font-bold text-foreground">{activeServiceType ? translateText(activeServiceType.restaurant) : ''}</h1>
                <p className="text-sm text-muted-foreground">{activeServiceType ? t('serviceTypes', activeServiceType.id) : ''} · {activeServiceType ? t('serviceTypeTaglines', activeServiceType.id) : ''}</p>
              </div>
            </div>
          </div>

          {/* Main content: sidebar + phone + info */}
          <div className="flex gap-8 items-start max-w-7xl w-full justify-center">
            {/* Journey sidebar */}
            <div className="hidden md:block w-60 shrink-0 sticky top-8">
              <h2 className="font-display text-sm font-bold mb-1 text-foreground">{t('client', 'clientJourney')}</h2>
              <p className="text-xs text-muted-foreground mb-4">{t('shared', 'followSteps')}</p>
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
                      <span className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{translateText(label)}</span>
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
                <div className="absolute bottom-[3px] left-[3px] right-[3px] rounded-b-[2.8rem] overflow-hidden">
                  <DemoBottomNav
                    onNavigate={setCurrentScreen}
                    activeScreen={currentScreen}
                    screens={config.navScreens}
                  />
                </div>
              )}
            </div>

            {/* Info sidebar */}
            <div className="hidden xl:block w-72 shrink-0 sticky top-8">
              <div className="p-5 rounded-2xl bg-card border border-border mb-5">
                <h3 className="font-display font-bold mb-2">{info.title}</h3>
                <p className="text-sm text-muted-foreground">{info.desc}</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border mb-5">
                <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                  <ItemIcon cat={activeServiceType?.iconCat || 'generic'} size="xs" />
                  {activeServiceType ? t('serviceTypes', activeServiceType.id) : ''}
                </h3>
                <div className="space-y-2">
                  {config?.steps.slice(0, 5).map(({ step, label }) => (
                    <div key={step} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-success shrink-0" />
                      <span>{translateText(label)}</span>
                    </div>
                  ))}
                  {(config?.steps.length ?? 0) > 5 && (
                    <p className="text-xs text-muted-foreground/60">+{(config?.steps.length ?? 0) - 5} {t('shared', 'stepsInJourney')}</p>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
                <h3 className="font-display font-bold mb-2">{t('shared', 'wantThis')}</h3>
                <p className="text-xs text-muted-foreground mb-4">{t('shared', 'ctaDescClient')}</p>
                <a
                  href="https://wa.me/5511999999999?text=Olá! Vi a demo do app cliente da NOOWE e gostaria de saber mais."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow"
                >
                  {t('shared', 'talkToTeam')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </DemoAutoTranslate>

      <DemoFeedbackWidget context={feedbackContext} />
    </>
  );
};

const DemoClient = () => (
  <DemoI18nProvider>
    <DemoProvider>
      <DemoClientInner />
    </DemoProvider>
  </DemoI18nProvider>
);

export default DemoClient;
