/**
 * Demo Restaurant Page — v9
 * Rebuilt from scratch to mirror DemoClient shell with restaurant mobile screens.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext } from '@/contexts/DemoContext';
import { ArrowLeft, Check, ChevronRight, Zap } from 'lucide-react';
import {
  ROLE_CONFIG,
  ROLE_JOURNEYS,
  SCREEN_INFO,
  type RestaurantScreen,
  type StaffRole,
} from '@/components/demo/restaurant/RestaurantDemoShared';
import { MobileRestaurantScreen } from '@/components/demo/restaurant/MobileRestaurantScreens';
import { useIsMobile } from '@/hooks/use-mobile';

const ResponsivePhoneShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative mx-auto w-full max-w-[375px] shrink-0 aspect-[375/812]">
    <div className="absolute inset-0 rounded-[3rem] bg-foreground/90 shadow-2xl" />
    <div className="absolute inset-[3px] overflow-hidden rounded-[2.8rem] bg-background">
      <div className="flex h-12 items-center justify-between px-8 text-xs font-semibold text-foreground">
        <span>9:41</span>
        <div className="absolute left-1/2 top-2 h-7 w-28 -translate-x-1/2 rounded-full bg-foreground/90" />
        <div className="h-2.5 w-4 rounded-sm border border-foreground/60" />
      </div>
      <div className="h-[calc(100%-48px)] overflow-y-auto scrollbar-hide">
        {children}
      </div>
    </div>
    <div className="absolute bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-foreground/30" />
  </div>
);

const DemoRestaurantInner = () => {
  const isMobile = useIsMobile();
  const [activeRole, setActiveRole] = useState<StaffRole>('owner');
  const [currentScreen, setCurrentScreen] = useState<RestaurantScreen>('dashboard');
  const { restaurant } = useDemoContext();

  const roleConfig = useMemo(() => ROLE_CONFIG.find((role) => role.id === activeRole)!, [activeRole]);
  const currentJourney = ROLE_JOURNEYS[activeRole];
  const info = SCREEN_INFO[currentScreen] || { title: 'Demo', desc: '' };
  const currentStepIdx = currentJourney.findIndex((step) => step.screen === currentScreen);

  useEffect(() => {
    setCurrentScreen(roleConfig.defaultScreen);
  }, [roleConfig]);

  return (
    <>
      <Helmet>
        <title>Demo Restaurante | NOOWE — Experiência Interativa</title>
        <meta
          name="description"
          content="Experimente o app restaurante da NOOWE com jornadas por perfil, navegação guiada e visual consistente com a demo do cliente."
        />
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex flex-col items-center py-6 px-4">
        <div className="w-full max-w-7xl flex items-center justify-between mb-4 gap-3 flex-wrap">
          <Link to="/demo" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />Voltar à demo
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/demo/client" className="px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors">
              Ver Demo Cliente →
            </Link>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Demo Restaurante</span>
          </div>
        </div>

        <div className="w-full max-w-7xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Escolha o perfil</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {ROLE_CONFIG.map((role) => {
              const isActive = activeRole === role.id;
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
                    <span className="text-base">{role.emoji}</span>
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{role.label}</p>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">{role.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full max-w-7xl mb-4">
          <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${roleConfig.gradient} border border-border/50`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${roleConfig.bgClass}`}>
              <span className="text-2xl">{roleConfig.emoji}</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold text-foreground">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">{roleConfig.label} · {roleConfig.desc}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start max-w-7xl w-full justify-center">
          <div className="hidden md:block w-60 shrink-0 sticky top-8">
            <h2 className="font-display text-sm font-bold mb-1 text-foreground">Jornada do Restaurante</h2>
            <p className="text-xs text-muted-foreground mb-4">Siga os passos ou explore livremente</p>
            <div className="space-y-0.5">
              {currentJourney.map(({ label, screen }, index) => {
                const isActive = screen === currentScreen;
                const isPast = currentStepIdx > index;
                return (
                  <button
                    key={screen}
                    onClick={() => setCurrentScreen(screen)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                      isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isPast
                          ? 'bg-success/20 text-success'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isPast && !isActive ? <Check className="w-3 h-3" /> : index + 1}
                    </div>
                    <span className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 flex-1 max-w-[420px] lg:max-w-none lg:flex-[0_0_auto]">
            {isMobile && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
                {currentJourney.map(({ label, screen }, index) => {
                  const isActive = screen === currentScreen;
                  return (
                    <button
                      key={screen}
                      onClick={() => setCurrentScreen(screen)}
                      className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition-all ${
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground'
                      }`}
                    >
                      {index + 1}. {label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                <span className="font-medium text-foreground truncate">{roleConfig.emoji} {roleConfig.label}</span>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="truncate">{info.title}</span>
                <span className="text-muted-foreground/50 shrink-0">· {Math.max(currentStepIdx + 1, 1)}/{currentJourney.length}</span>
              </div>
            </div>

            <div className="relative">
              <ResponsivePhoneShell>
                <MobileRestaurantScreen
                  screen={currentScreen}
                  activeRole={activeRole}
                  onNavigate={(screen) => setCurrentScreen(screen as RestaurantScreen)}
                  onSelectRole={setActiveRole}
                />
              </ResponsivePhoneShell>
            </div>
          </div>

          <div className="hidden xl:block w-72 shrink-0 sticky top-8">
            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold mb-2">{info.title}</h3>
              <p className="text-sm text-muted-foreground">{info.desc}</p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <span>{roleConfig.emoji}</span>
                {roleConfig.label}
              </h3>
              <div className="space-y-2">
                {currentJourney.slice(0, 5).map(({ screen, label }) => (
                  <div key={screen} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-success shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
                {currentJourney.length > 5 && (
                  <p className="text-xs text-muted-foreground/60">+{currentJourney.length - 5} etapas na jornada</p>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border mb-5">
              <h3 className="font-display font-bold text-sm mb-3">Outros perfis</h3>
              <div className="space-y-1.5">
                {ROLE_CONFIG.filter((role) => role.id !== activeRole).map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-muted/50"
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

            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
              <h3 className="font-display font-bold mb-2">Quer isso no seu restaurante?</h3>
              <p className="text-xs text-muted-foreground mb-4">Leve a experiência NOOWE para sua operação.</p>
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
