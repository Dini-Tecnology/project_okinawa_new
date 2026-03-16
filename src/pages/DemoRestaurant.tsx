/**
 * Demo Restaurant Page
 * Mirrors DemoClient architecture exactly: Registry → Selector → 3-column layout
 * Role-based journeys for 7 staff profiles with 22 specialized screens
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext } from '@/contexts/DemoContext';
import { PhoneShell } from '@/components/demo/DemoShared';
import { DemoI18nProvider, DemoLangSelector, useDemoI18n } from '@/components/demo/DemoI18n';
import { ArrowLeft, Check, ChevronRight, Zap } from 'lucide-react';
import {
  ROLE_CONFIG,
  ROLE_JOURNEYS,
  SCREEN_INFO,
  type RestaurantScreen,
  type StaffRole,
} from '@/components/demo/restaurant/RestaurantDemoShared';
import { MobileRestaurantScreen } from '@/components/demo/restaurant/MobileRestaurantScreens';

// ============ JOURNEY STEPS ADAPTER ============

interface RoleJourneyStep {
  step: number;
  label: string;
  screenKey: string;
  screens: RestaurantScreen[];
}

function buildJourneySteps(role: StaffRole): RoleJourneyStep[] {
  return ROLE_JOURNEYS[role].map((stage, index) => ({
    step: index + 1,
    label: stage.label,
    screenKey: stage.screen,
    screens: [stage.screen],
  }));
}

// ============ MAIN COMPONENT ============

const DemoRestaurantInner = () => {
  const [activeRole, setActiveRole] = useState<StaffRole>('owner');
  const [currentScreen, setCurrentScreen] = useState<RestaurantScreen>('dashboard');
  const { restaurant } = useDemoContext();
  const { lang, t } = useDemoI18n();

  const roleConfig = useMemo(() => ROLE_CONFIG.find(r => r.id === activeRole)!, [activeRole]);
  const steps = useMemo(() => buildJourneySteps(activeRole), [activeRole]);

  // Translated screen info
  const info = {
    title: t('screenTitles', currentScreen) !== currentScreen ? t('screenTitles', currentScreen) : (SCREEN_INFO[currentScreen]?.title || 'Demo'),
    desc: t('screenDescs', currentScreen) !== currentScreen ? t('screenDescs', currentScreen) : (SCREEN_INFO[currentScreen]?.desc || ''),
  };
  const currentStepIdx = steps.findIndex(s => s.screens.includes(currentScreen));

  // Translated role helpers
  const roleLabel = (id: StaffRole) => t('roles', id);
  const roleDesc = (id: StaffRole) => t('roleDescs', id);
  const stepLabel = (screenKey: string) => {
    const translated = t('journeySteps', screenKey);
    return translated !== screenKey ? translated : screenKey;
  };

  // Reset screen when role changes
  useEffect(() => {
    setCurrentScreen(roleConfig.defaultScreen);
  }, [activeRole, roleConfig]);

  return (
    <>
      <Helmet>
        <title>{t('restaurant', 'title')}</title>
        <meta name="description" content={t('restaurant', 'metaDesc')} />
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex flex-col items-center py-6 px-4">
        {/* Header */}
        <div className="w-full max-w-7xl flex items-center justify-between mb-4">
          <Link
            to="/demo"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('shared', 'backToDemo')}
          </Link>
          <div className="flex items-center gap-3">
            <DemoLangSelector />
            <Link
              to="/demo/client"
              className="px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors"
            >
              {t('shared', 'viewClientDemo')}
            </Link>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {t('shared', 'demoRestaurant')}
            </span>
          </div>
        </div>

        {/* Role Selector */}
        <div className="w-full max-w-7xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">{t('restaurant', 'chooseProfile')}</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {ROLE_CONFIG.map(role => {
              const isActive = activeRole === role.id;
              const RoleIcon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${role.bgClass}`}>
                    <RoleIcon className={`w-3.5 h-3.5 ${role.colorClass}`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {roleLabel(role.id)}
                    </p>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">{roleDesc(role.id)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active role banner */}
        <div className="w-full max-w-7xl mb-4">
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${roleConfig.gradient} border border-border/50`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${roleConfig.bgClass}`}>
              <roleConfig.icon className={`w-6 h-6 ${roleConfig.colorClass}`} />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">
                {roleLabel(activeRole)} · {roleDesc(activeRole)}
              </p>
            </div>
          </div>
        </div>

        {/* Main content: sidebar + phone + info */}
        <div className="flex gap-8 items-start max-w-7xl w-full justify-center">
          {/* Journey sidebar */}
          <div className="hidden md:block w-60 shrink-0 sticky top-8">
            <h2 className="font-display text-sm font-bold mb-1 text-foreground">
              {t('restaurant', 'journeyOf')} {roleLabel(activeRole)}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">{t('shared', 'followSteps')}</p>
            <div className="space-y-0.5">
              {steps.map(({ step, screenKey, screens }) => {
                const isActive = screens.includes(currentScreen);
                const isPast = currentStepIdx > steps.findIndex(s => s.step === step);
                return (
                  <button
                    key={step}
                    onClick={() => setCurrentScreen(screens[0])}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                      isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : isPast
                            ? 'bg-success/20 text-success'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isPast && !isActive ? <Check className="w-3 h-3" /> : step}
                    </div>
                    <span
                      className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                    >
                      {stepLabel(screenKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone */}
          <div className="relative">
            <PhoneShell>
              <MobileRestaurantScreen
                screen={currentScreen}
                activeRole={activeRole}
                onNavigate={screen => setCurrentScreen(screen as RestaurantScreen)}
                onSelectRole={setActiveRole}
              />
            </PhoneShell>
          </div>

          {/* Info sidebar */}
          <div className="hidden xl:block w-72 shrink-0 sticky top-8">
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold mb-2">{info.title}</h3>
              <p className="text-sm text-muted-foreground">{info.desc}</p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${roleConfig.bgClass}`}>
                  <roleConfig.icon className={`w-3.5 h-3.5 ${roleConfig.colorClass}`} />
                </div>
                {roleLabel(activeRole)}
              </h3>
              <div className="space-y-2">
                {steps.slice(0, 5).map(({ step, screenKey }) => (
                  <div key={step} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-success shrink-0" />
                    <span>{stepLabel(screenKey)}</span>
                  </div>
                ))}
                {steps.length > 5 && (
                  <p className="text-xs text-muted-foreground/60">
                    +{steps.length - 5} {t('shared', 'stepsInJourney')}
                  </p>
                )}
              </div>
            </div>

            {/* Other roles quick switch */}
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold text-sm mb-3">{t('shared', 'otherProfiles')}</h3>
              <div className="space-y-1.5">
                {ROLE_CONFIG.filter(r => r.id !== activeRole).map(role => {
                  const RIcon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setActiveRole(role.id)}
                      className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${role.bgClass}`}>
                        <RIcon className={`w-3.5 h-3.5 ${role.colorClass}`} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{roleLabel(role.id)}</p>
                        <p className="text-[10px] text-muted-foreground">{roleDesc(role.id)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
              <h3 className="font-display font-bold mb-2">{t('shared', 'wantThis')}</h3>
              <p className="text-xs text-muted-foreground mb-4">{t('shared', 'ctaDesc')}</p>
              <a
                href="https://wa.me/5511999999999?text=Olá! Vi a demo do app restaurante da NOOWE e gostaria de saber mais."
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
    </>
  );
};

const DemoRestaurant = () => (
  <DemoI18nProvider>
    <DemoProvider>
      <DemoRestaurantInner />
    </DemoProvider>
  </DemoI18nProvider>
);

export default DemoRestaurant;
