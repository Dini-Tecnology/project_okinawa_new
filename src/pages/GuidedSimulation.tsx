/**
 * Guided Simulation — Digital Twin
 * Immersive cinematic experience showing a real restaurant operation unfolding.
 * Reuses 100% of existing demo components.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { DemoProvider } from '@/contexts/DemoContext';
import { DemoI18nProvider } from '@/components/demo/DemoI18n';
import { PhoneShell } from '@/components/demo/DemoShared';
import { FineDiningDemo } from '@/components/demo/experiences/FineDiningDemo';
import { MobileRestaurantScreen } from '@/components/demo/restaurant/MobileRestaurantScreens';
import { ArrowRight, ChevronLeft, X, Smartphone, Monitor, Zap } from 'lucide-react';

interface SimStep {
  id: string;
  titleKey: string;
  tooltipKey: string;
  view: 'client' | 'restaurant';
  clientScreen?: string;
  restaurantScreen?: string;
  icon: 'client' | 'restaurant';
}

const STEPS: SimStep[] = [
  { id: 'menu', titleKey: 'guided.step1_title', tooltipKey: 'guided.step1_tooltip', view: 'client', clientScreen: 'menu', icon: 'client' },
  { id: 'order', titleKey: 'guided.step2_title', tooltipKey: 'guided.step2_tooltip', view: 'client', clientScreen: 'order-status', icon: 'client' },
  { id: 'kitchen', titleKey: 'guided.step3_title', tooltipKey: 'guided.step3_tooltip', view: 'restaurant', restaurantScreen: 'kds', icon: 'restaurant' },
  { id: 'tracking', titleKey: 'guided.step4_title', tooltipKey: 'guided.step4_tooltip', view: 'client', clientScreen: 'order-status', icon: 'client' },
  { id: 'payment', titleKey: 'guided.step5_title', tooltipKey: 'guided.step5_tooltip', view: 'client', clientScreen: 'fechar-conta', icon: 'client' },
  { id: 'done', titleKey: 'guided.step6_title', tooltipKey: 'guided.step6_tooltip', view: 'client', clientScreen: 'payment-success', icon: 'client' },
];

const GuidedSimulationInner: React.FC = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [entered, setEntered] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLast = currentStep === STEPS.length - 1;

  const goTo = useCallback((nextIdx: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(nextIdx);
      setIsTransitioning(false);
    }, 350);
  }, []);

  const handleNext = () => {
    if (isLast) {
      navigate('/demo/impact');
    } else {
      goTo(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) goTo(currentStep - 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
      if (e.key === 'Escape') navigate('/demo');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-foreground flex flex-col overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[200px] transition-all duration-1000"
          style={{
            background: step.view === 'client'
              ? 'radial-gradient(circle, hsl(14 100% 57% / 0.08), transparent 70%)'
              : 'radial-gradient(circle, hsl(174 63% 25% / 0.1), transparent 70%)',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      {/* Minimal top bar */}
      <div className={`relative z-20 flex items-center justify-between px-6 py-4 transition-all duration-700 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <button
          onClick={() => navigate('/demo')}
          className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1.5 transition-colors"
        >
          <X size={14} /> {t('guided.exit')}
        </button>

        {/* Progress line */}
        <div className="flex-1 max-w-xs mx-8">
          <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <span className="text-white/30 text-xs font-mono">
          {currentStep + 1}/{STEPS.length}
        </span>
      </div>

      {/* Main content area */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-4 lg:px-8">
        <div className={`flex items-center gap-8 lg:gap-16 w-full max-w-6xl mx-auto transition-all duration-700 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Left: Narrative panel */}
          <div className="hidden lg:flex flex-col gap-6 w-[320px] shrink-0">
            {/* Timeline */}
            <div ref={timelineRef} className="flex flex-col gap-1">
              {STEPS.map((s, i) => {
                const isActive = i === currentStep;
                const isDone = i < currentStep;
                return (
                  <button
                    key={s.id}
                    onClick={() => goTo(i)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-300 ${
                      isActive
                        ? 'bg-white/[0.06]'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Step indicator */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-primary text-primary-foreground scale-110'
                        : isDone
                          ? 'bg-white/10 text-white/50'
                          : 'bg-white/[0.04] text-white/20'
                    }`}>
                      {isDone ? '✓' : i + 1}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-[13px] font-medium block truncate transition-colors duration-300 ${
                        isActive ? 'text-white' : isDone ? 'text-white/40' : 'text-white/20'
                      }`}>
                        {t(s.titleKey)}
                      </span>
                      {isActive && (
                        <span className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                          {s.view === 'client' ? <Smartphone size={9} /> : <Monitor size={9} />}
                          {s.view === 'client' ? t('hub.client_title') : t('hub.restaurant_title')}
                        </span>
                      )}
                    </div>

                    {/* Active line */}
                    {isActive && (
                      <div className="w-0.5 h-5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tooltip card */}
            <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}>
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={12} className="text-primary" />
                  <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                    {step.view === 'client' ? t('hub.client_title') : t('hub.restaurant_title')}
                  </span>
                </div>
                <p className="text-white/60 text-[13px] leading-relaxed">
                  {t(step.tooltipKey)}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Phone */}
          <div className="flex-1 flex flex-col items-center">
            {/* Mobile step title */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] mb-3">
                {step.view === 'client' ? <Smartphone size={11} className="text-primary" /> : <Monitor size={11} className="text-secondary" />}
                <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
                  {step.view === 'client' ? t('hub.client_title') : t('hub.restaurant_title')}
                </span>
              </div>
              <h2 className="text-white font-bold text-lg">
                {t(step.titleKey)}
              </h2>
            </div>

            {/* Phone device */}
            <div className={`relative transition-all duration-500 ease-out ${isTransitioning ? 'opacity-0 scale-[0.97]' : 'opacity-100 scale-100'}`}>
              {/* Glow behind phone */}
              <div
                className="absolute -inset-12 rounded-[4rem] blur-3xl transition-colors duration-700 pointer-events-none"
                style={{
                  background: step.view === 'client'
                    ? 'radial-gradient(circle, hsl(14 100% 57% / 0.06), transparent 70%)'
                    : 'radial-gradient(circle, hsl(174 63% 25% / 0.08), transparent 70%)',
                }}
              />

              <div className="relative">
                <PhoneShell>
                  {step.view === 'client' ? (
                    <FineDiningDemo
                      screen={step.clientScreen || 'home'}
                      onNavigate={() => {}}
                    />
                  ) : (
                    <MobileRestaurantScreen
                      screen={(step.restaurantScreen as any) || 'kds'}
                      activeRole="chef"
                      onNavigate={() => {}}
                      onSelectRole={() => {}}
                    />
                  )}
                </PhoneShell>
              </div>
            </div>

            {/* Mobile tooltip */}
            <div className={`lg:hidden mt-6 max-w-sm mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <p className="text-white/50 text-sm text-center leading-relaxed">
                {t(step.tooltipKey)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className={`relative z-20 px-6 py-5 transition-all duration-700 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '400ms' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentStep === 0
                ? 'text-white/10 cursor-not-allowed'
                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
            }`}
          >
            <ChevronLeft size={16} /> {t('guided.back')}
          </button>

          {/* Dots — mobile only */}
          <div className="flex gap-1.5 lg:hidden">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentStep ? 'w-5 bg-primary' : i < currentStep ? 'w-1 bg-primary/30' : 'w-1 bg-white/10'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-[0_0_30px_hsl(14_100%_57%/0.2)] hover:shadow-[0_0_40px_hsl(14_100%_57%/0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {isLast ? t('guided.finish') : t('guided.next')} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

const GuidedSimulation: React.FC = () => (
  <DemoI18nProvider>
    <DemoProvider>
      <GuidedSimulationInner />
    </DemoProvider>
  </DemoI18nProvider>
);

export default GuidedSimulation;
