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
// Convert ROLE_JOURNEYS (RoleJourneyStage[]) to DemoClient's format (step + label + screens[])

interface RoleJourneyStep {
  step: number;
  label: string;
  screens: RestaurantScreen[];
}

function buildJourneySteps(role: StaffRole): RoleJourneyStep[] {
  return ROLE_JOURNEYS[role].map((stage, index) => ({
    step: index + 1,
    label: stage.label,
    screens: [stage.screen],
  }));
}

// ============ MAIN COMPONENT ============

const DemoRestaurantInner = () => {
  const [activeRole, setActiveRole] = useState<StaffRole>('owner');
  const [currentScreen, setCurrentScreen] = useState<RestaurantScreen>('dashboard');
  const { restaurant } = useDemoContext();

  const roleConfig = useMemo(() => ROLE_CONFIG.find(r => r.id === activeRole)!, [activeRole]);
  const steps = useMemo(() => buildJourneySteps(activeRole), [activeRole]);
  const info = SCREEN_INFO[currentScreen] || { title: 'Demo', desc: '' };
  const currentStepIdx = steps.findIndex(s => s.screens.includes(currentScreen));

  // Reset screen when role changes
  useEffect(() => {
    setCurrentScreen(roleConfig.defaultScreen);
  }, [activeRole, roleConfig]);

  return (
    <>
      <Helmet>
        <title>Demo Restaurante | NOOWE — Experiência Interativa</title>
        <meta
          name="description"
          content="Experimente o app restaurante da NOOWE com 7 perfis operacionais, 22 telas especializadas e jornadas guiadas interativas."
        />
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex flex-col items-center py-6 px-4">
        {/* Header — identical pattern to DemoClient */}
        <div className="w-full max-w-7xl flex items-center justify-between mb-4">
          <Link
            to="/demo"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à demo
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/demo/client"
              className="px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors"
            >
              Ver Demo Cliente →
            </Link>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              Demo Restaurante
            </span>
          </div>
        </div>

        {/* Role Selector — mirrors Service Type Selector from DemoClient */}
        <div className="w-full max-w-7xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Escolha o perfil</h2>
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
                      {role.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">{role.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active role banner — mirrors active service type banner */}
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
                {roleConfig.label} · {roleConfig.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Main content: sidebar + phone + info — EXACT same layout as DemoClient */}
        <div className="flex gap-8 items-start max-w-7xl w-full justify-center">
          {/* Journey sidebar — hidden md:block w-60 */}
          <div className="hidden md:block w-60 shrink-0 sticky top-8">
            <h2 className="font-display text-sm font-bold mb-1 text-foreground">
              Jornada do {roleConfig.label}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Siga os passos ou explore livremente</p>
            <div className="space-y-0.5">
              {steps.map(({ step, label, screens }) => {
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
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone — using the SAME PhoneShell from DemoShared */}
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

          {/* Info sidebar — hidden xl:block w-72 */}
          <div className="hidden xl:block w-72 shrink-0 sticky top-8">
            {/* Current screen info */}
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold mb-2">{info.title}</h3>
              <p className="text-sm text-muted-foreground">{info.desc}</p>
            </div>

            {/* Role journey features */}
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${roleConfig.bgClass}`}>
                  <roleConfig.icon className={`w-3.5 h-3.5 ${roleConfig.colorClass}`} />
                </div>
                {roleConfig.label}
              </h3>
              <div className="space-y-2">
                {steps.slice(0, 5).map(({ step, label }) => (
                  <div key={step} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-success shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
                {steps.length > 5 && (
                  <p className="text-xs text-muted-foreground/60">
                    +{steps.length - 5} etapas na jornada
                  </p>
                )}
              </div>
            </div>

            {/* Other roles quick switch */}
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold text-sm mb-3">Outros perfis</h3>
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
                        <p className="text-xs font-medium text-foreground">{role.label}</p>
                        <p className="text-[10px] text-muted-foreground">{role.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
              <h3 className="font-display font-bold mb-2">Quer isso no seu restaurante?</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Leve a experiência NOOWE para sua operação.
              </p>
              <a
                href="https://wa.me/5511999999999?text=Olá! Vi a demo do app restaurante da NOOWE e gostaria de saber mais."
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
