/**
 * Guided Simulation — Digital Twin
 * Overlay layer on top of existing demo screens with tooltips, progress, and navigation.
 * Reuses 100% of existing demo components.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { DemoProvider } from '@/contexts/DemoContext';
import { DemoI18nProvider } from '@/components/demo/DemoI18n';
import { PhoneShell } from '@/components/demo/DemoShared';
import { FineDiningDemo } from '@/components/demo/experiences/FineDiningDemo';
import { MobileRestaurantScreen } from '@/components/demo/restaurant/MobileRestaurantScreens';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, X, ChevronLeft } from 'lucide-react';

interface SimStep {
  id: string;
  titleKey: string;
  tooltipKey: string;
  view: 'client' | 'restaurant';
  clientScreen?: string;
  restaurantScreen?: string;
}

const STEPS: SimStep[] = [
  { id: 'menu', titleKey: 'guided.step1_title', tooltipKey: 'guided.step1_tooltip', view: 'client', clientScreen: 'menu' },
  { id: 'order', titleKey: 'guided.step2_title', tooltipKey: 'guided.step2_tooltip', view: 'client', clientScreen: 'order-status' },
  { id: 'kitchen', titleKey: 'guided.step3_title', tooltipKey: 'guided.step3_tooltip', view: 'restaurant', restaurantScreen: 'kds' },
  { id: 'tracking', titleKey: 'guided.step4_title', tooltipKey: 'guided.step4_tooltip', view: 'client', clientScreen: 'order-status' },
  { id: 'payment', titleKey: 'guided.step5_title', tooltipKey: 'guided.step5_tooltip', view: 'client', clientScreen: 'fechar-conta' },
  { id: 'done', titleKey: 'guided.step6_title', tooltipKey: 'guided.step6_tooltip', view: 'client', clientScreen: 'payment-success' },
];

const GuidedSimulationInner: React.FC = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLast = currentStep === STEPS.length - 1;

  const goTo = useCallback((nextIdx: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(nextIdx);
      setIsTransitioning(false);
    }, 300);
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

  // Keyboard nav
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
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate('/demo')}
            className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 transition-colors shrink-0"
          >
            <X size={14} /> {t('guided.exit')}
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {t('guided.experience')} — {currentStep + 1}/{STEPS.length}
              </span>
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
        {/* Step title */}
        <div className="text-center">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
            {step.view === 'client' ? t('hub.client_title') : t('hub.restaurant_title')}
          </span>
          <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">
            {t(step.titleKey)}
          </h2>
        </div>

        {/* Phone with overlay */}
        <div className={`relative transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {/* Subtle overlay */}
          <div className="absolute -inset-4 rounded-[3rem] bg-primary/[0.03] pointer-events-none" />
          
          <PhoneShell>
            {step.view === 'client' ? (
              <FineDiningDemo
                screen={step.clientScreen || 'home'}
                onNavigate={() => {}}
              />
            ) : (
              <MobileRestaurantScreen
                screen={step.restaurantScreen as any || 'kds'}
                onNavigate={() => {}}
                role="chef"
                serviceType="fine-dining"
              />
            )}
          </PhoneShell>

          {/* Focus ring pulse */}
          <div className="absolute -inset-2 rounded-[3rem] border-2 border-primary/20 animate-pulse pointer-events-none" />
        </div>

        {/* Tooltip */}
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-md)] text-center">
            <p className="text-sm text-foreground leading-relaxed">{t(step.tooltipKey)}</p>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentStep === 0
                ? 'text-muted-foreground/40 cursor-not-allowed'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <ChevronLeft size={16} /> {t('guided.back')}
          </button>

          {/* Step indicators */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-6 bg-primary' : i < currentStep ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-[var(--shadow-glow)] hover:opacity-90 transition-all"
          >
            {isLast ? t('guided.finish') : t('guided.next')} <ArrowRight size={16} />
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
