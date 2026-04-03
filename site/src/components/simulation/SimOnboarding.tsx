/**
 * SimOnboarding — Empathy + 3-step onboarding for the guided simulation.
 * Fase 0: Emotional empathy screen
 * Step 1: Profile selection (owner/manager/team)
 * Step 2: Pillar + Model selection
 * Step 3: Pain points selection
 * Step 4: Ready screen with transition
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, X, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SimIcon from './SimIcon';
import { useLang } from '@/lib/i18n';
import nooweOoIcon from '@/assets/noowe-oo-icon.png';
import {
  type SimProfile,
  type SimPillar,
  type SimModel,
  PROFILES,
  PILLARS,
  MODELS,
  EMPATHY_TEXTS,
  ONBOARDING_TEXTS,
  getPainPoints,
} from './SimulationData';

type DemoLang = 'pt' | 'en' | 'es';

function tx(obj: { pt: string; en: string; es: string }, lang: string): string {
  return obj[(lang as DemoLang)] || obj.pt;
}

export interface SimOnboardingResult {
  profile: SimProfile;
  pillar: SimPillar;
  model: SimModel;
  painPoints: string[];
}

interface SimOnboardingProps {
  onComplete: (result: SimOnboardingResult) => void;
  onExit: () => void;
}

type Phase = 'empathy' | 'profile' | 'pillar' | 'pains' | 'ready';

const PHASE_ORDER: Phase[] = ['empathy', 'profile', 'pillar', 'pains', 'ready'];

const SimOnboarding: React.FC<SimOnboardingProps> = ({ onComplete, onExit }) => {
  const { lang } = useLang();
  const [phase, setPhase] = useState<Phase>('empathy');
  const [transitioning, setTransitioning] = useState(false);
  const [empathyLine, setEmpathyLine] = useState(0);
  const [entered, setEntered] = useState(false);

  // Selections
  const [profile, setProfile] = useState<SimProfile | null>(null);
  const [pillar, setPillar] = useState<SimPillar | null>(null);
  const [model, setModel] = useState<SimModel | null>(null);
  const [selectedPains, setSelectedPains] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Empathy line animation
  useEffect(() => {
    if (phase !== 'empathy') return;
    const lines = ['line1', 'line2', 'line3', 'line4', 'line5', 'line6'];
    if (empathyLine >= lines.length) return;
    const delay = empathyLine === 0 ? 800 : empathyLine < 4 ? 1200 : 1800;
    const t = setTimeout(() => setEmpathyLine(prev => prev + 1), delay);
    return () => clearTimeout(t);
  }, [phase, empathyLine]);

  const goTo = useCallback((next: Phase) => {
    setTransitioning(true);
    setTimeout(() => {
      setPhase(next);
      setTransitioning(false);
    }, 350);
  }, []);

  const handleNext = () => {
    const idx = PHASE_ORDER.indexOf(phase);
    if (idx < PHASE_ORDER.length - 1) goTo(PHASE_ORDER[idx + 1]);
  };

  const handleBack = () => {
    const idx = PHASE_ORDER.indexOf(phase);
    if (idx > 0) {
      if (PHASE_ORDER[idx - 1] === 'empathy') {
        goTo('empathy');
        setEmpathyLine(6); // don't replay animation
      } else {
        goTo(PHASE_ORDER[idx - 1]);
      }
    }
  };

  const canProceed = (): boolean => {
    switch (phase) {
      case 'empathy': return empathyLine >= 6;
      case 'profile': return !!profile;
      case 'pillar': return !!model;
      case 'pains': return selectedPains.length > 0;
      case 'ready': return true;
      default: return false;
    }
  };

  const handleProfileSelect = (p: SimProfile) => {
    setProfile(p);
    // Reset downstream
    setPillar(null);
    setModel(null);
    setSelectedPains([]);
    setTimeout(() => goTo('pillar'), 400);
  };

  const handleModelSelect = (m: SimModel) => {
    setModel(m);
    const p = PILLARS.find(pl => pl.models.includes(m));
    if (p) setPillar(p.id);
    setSelectedPains([]);
    setTimeout(() => goTo('pains'), 400);
  };

  const togglePain = (id: string) => {
    setSelectedPains(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    if (profile && pillar && model) {
      onComplete({ profile, pillar, model, painPoints: selectedPains });
    }
  };

  const progressPercent = ((PHASE_ORDER.indexOf(phase) + 1) / PHASE_ORDER.length) * 100;

  // Available pain points
  const pains = profile && model ? getPainPoints(model, profile) : [];

  const empathyLines = ['line1', 'line2', 'line3', 'line4', 'line5', 'line6'];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative" role="main" aria-label="Simulação guiada — onboarding">
      {/* Ambient OO glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-[180px] md:blur-[220px] transition-all duration-1000"
          style={{
            background: phase === 'empathy'
              ? 'radial-gradient(circle, hsl(14 100% 57% / 0.08), hsl(174 63% 25% / 0.06), transparent 70%)'
              : profile === 'owner'
                ? 'radial-gradient(circle, hsl(14 100% 57% / 0.1), transparent 70%)'
                : profile === 'team'
                  ? 'radial-gradient(circle, hsl(174 63% 25% / 0.1), transparent 70%)'
                  : 'radial-gradient(circle, hsl(38 92% 50% / 0.08), transparent 70%)',
            top: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      {/* Top bar */}
      {phase !== 'empathy' && (
        <div className={`relative z-20 flex items-center justify-between px-4 md:px-6 py-4 transition-all duration-500 ${entered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={onExit}
            className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1.5 transition-colors"
          >
            <X size={14} /> {tx(ONBOARDING_TEXTS.exitLabel, lang)}
          </button>

          <div className="flex-1 max-w-xs mx-6 md:mx-8">
            <div className="h-[2px] bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, hsl(14 100% 57%), hsl(174 63% 35%))',
                }}
              />
            </div>
          </div>

          <span className="text-muted-foreground text-xs font-mono">
            {PHASE_ORDER.indexOf(phase)}/{PHASE_ORDER.length - 1}
          </span>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 relative z-10 flex items-center justify-center px-4 md:px-8"
        >

        {/* ── EMPATHY ── */}
        {phase === 'empathy' && (
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            {/* OO Icon with heartbeat */}
            <img
              src={nooweOoIcon}
              alt="NOOWE"
              className="h-16 w-16 md:h-20 md:w-20 mb-10 md:mb-14"
              style={{
                animation: 'sim-oo-heartbeat 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
              draggable={false}
            />

            {/* Animated lines */}
            <div className="space-y-3 md:space-y-4 mb-12 md:mb-16">
              {empathyLines.map((key, i) => {
                const isVisible = i < empathyLine;
                const isEmphasis = i >= 4;
                return (
                  <p
                    key={key}
                    className={`transition-all duration-700 ease-out ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    } ${
                      isEmphasis
                        ? 'text-lg md:text-xl font-semibold text-foreground mt-6'
                        : 'text-base md:text-lg text-muted-foreground'
                    }`}
                    style={{ transitionDelay: isVisible ? '0ms' : `${i * 100}ms` }}
                  >
                    {tx(EMPATHY_TEXTS[key], lang)}
                  </p>
                );
              })}
            </div>

            {/* CTA */}
            <button
              onClick={() => goTo('profile')}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm md:text-base font-semibold transition-all duration-700 ${
                empathyLine >= 6
                  ? 'opacity-100 translate-y-0 bg-primary text-primary-foreground shadow-glow hover:scale-[1.02] active:scale-[0.98]'
                  : 'opacity-0 translate-y-6 bg-muted text-muted-foreground pointer-events-none'
              }`}
            >
              {tx(EMPATHY_TEXTS.cta, lang)} <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── PROFILE ── */}
        {phase === 'profile' && (
          <div className="w-full max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
              {tx(ONBOARDING_TEXTS.step1Title, lang)}
            </h2>
            <div className="h-px w-12 mx-auto bg-gradient-to-r from-primary to-secondary mb-8 md:mb-12 rounded-full" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {PROFILES.map((p, i) => {
                const isSelected = profile === p.id;
                const borderColor =
                  p.color === 'primary' ? 'border-primary/50 shadow-[0_0_30px_hsl(14_100%_57%/0.15)]'
                    : p.color === 'secondary' ? 'border-secondary/50 shadow-[0_0_30px_hsl(174_63%_25%/0.15)]'
                      : 'border-accent/50 shadow-[0_0_30px_hsl(38_92%_50%/0.15)]';

                return (
                  <button
                    key={p.id}
                    onClick={() => handleProfileSelect(p.id)}
                    aria-label={tx(p.label, lang)}
                    aria-pressed={isSelected}
                    className={`group relative flex flex-col items-center text-center p-6 md:p-8 rounded-2xl border transition-all duration-300 animate-fade-up ${
                      isSelected
                        ? `bg-card ${borderColor}`
                        : 'bg-card/50 border-border hover:bg-card hover:border-border'
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <SimIcon name={p.icon} size={32} className="mb-4 text-muted-foreground" />
                    <span className="text-foreground font-semibold text-base md:text-lg mb-2">
                      {tx(p.label, lang)}
                    </span>
                    <span className="text-muted-foreground text-sm leading-relaxed">
                      {tx(p.description, lang)}
                    </span>
                    {isSelected && (
                      <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                        style={{
                          background: p.color === 'primary' ? 'hsl(14 100% 57%)'
                            : p.color === 'secondary' ? 'hsl(174 63% 35%)'
                              : 'hsl(38 92% 50%)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PILLAR + MODEL ── */}
        {phase === 'pillar' && profile && (
          <div className="w-full max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              {tx(ONBOARDING_TEXTS.step2Title, lang)}
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8 md:mb-10">
              {tx(ONBOARDING_TEXTS.step2Subtitle, lang)}
            </p>

            <div className="space-y-6">
              {PILLARS.map((pl, pi) => {
                const isExpanded = pillar === pl.id;
                return (
                  <div
                    key={pl.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${pi * 80}ms` }}
                  >
                    {/* Pillar header */}
                    <button
                      onClick={() => setPillar(isExpanded ? null : pl.id)}
                      className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
                        isExpanded
                          ? 'bg-card border-border'
                          : 'bg-card/50 border-border/50 hover:bg-card'
                      }`}
                    >
                      <SimIcon name={pl.icon} size={22} className="text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <span className="text-foreground font-semibold text-base">
                          {tx(pl.label, lang)}
                        </span>
                        <p className="text-muted-foreground text-xs md:text-sm mt-0.5">
                          {tx(pl.taglines[profile], lang)}
                        </p>
                      </div>
                      <ChevronLeft
                        size={16}
                        className={`text-muted-foreground transition-transform duration-300 ${
                          isExpanded ? '-rotate-90' : 'rotate-180'
                        }`}
                      />
                    </button>

                    {/* Models */}
                    {isExpanded && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3 pl-2 md:pl-4">
                        {pl.models.map((mId, mi) => {
                          const m = MODELS[mId];
                          const isSelected = model === mId;
                          return (
                            <button
                              key={mId}
                              onClick={() => handleModelSelect(mId)}
                              aria-label={tx(m.label, lang)}
                              aria-pressed={model === mId}
                              className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-300 animate-scale-in ${
                                isSelected
                                  ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_hsl(14_100%_57%/0.1)]'
                                  : 'bg-card/50 border-border hover:bg-card'
                              }`}
                              style={{ animationDelay: `${mi * 60}ms` }}
                            >
                              <SimIcon name={m.icon} size={20} className="mb-2 text-muted-foreground" />
                              <span className="text-foreground font-medium text-sm">
                                {tx(m.label, lang)}
                              </span>
                              <span className="text-muted-foreground text-[11px] mt-1">
                                {tx(m.feature, lang)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PAIN POINTS ── */}
        {phase === 'pains' && profile && model && (
          <div className="w-full max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              {tx(ONBOARDING_TEXTS.step3Title, lang)}
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8 md:mb-10">
              {tx(ONBOARDING_TEXTS.step3Subtitle, lang)}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pains.map((pain, i) => {
                const isSelected = selectedPains.includes(pain.id);
                return (
                  <button
                    key={pain.id}
                    onClick={() => togglePain(pain.id)}
                    aria-label={tx(pain.label, lang)}
                    aria-pressed={selectedPains.includes(pain.id)}
                    className={`group flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-300 animate-fade-up ${
                      isSelected
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-card/50 border-border hover:bg-card'
                    }`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <SimIcon
                      name={pain.icon}
                      size={18}
                      className={`transition-transform duration-300 text-muted-foreground ${
                        isSelected ? 'scale-110 text-primary' : ''
                      }`}
                    />
                    <span className={`text-sm font-medium transition-colors ${
                      isSelected ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {tx(pain.label, lang)}
                    </span>
                    {isSelected && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <SimIcon name="circle-check" size={12} className="text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── READY ── */}
        {phase === 'ready' && profile && model && (
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <img
              src={nooweOoIcon}
              alt="NOOWE"
              className="h-16 w-16 mb-8 animate-sim-oo-merge"
              draggable={false}
            />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 animate-fade-up">
              {tx(ONBOARDING_TEXTS.readyTitle, lang)}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mb-4 animate-fade-up delay-100">
              {tx(ONBOARDING_TEXTS.readySubtitle, lang)}
            </p>

            {/* Summary chips */}
            <div className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-up delay-200">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs">
                <SimIcon name={PROFILES.find(p => p.id === profile)!.icon} size={14} /> {tx(PROFILES.find(p => p.id === profile)!.label, lang)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs">
                <SimIcon name={MODELS[model].icon} size={14} /> {tx(MODELS[model].label, lang)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs">
                <Target size={14} /> {selectedPains.length} {lang === 'en' ? 'pain points' : lang === 'es' ? 'puntos de dolor' : 'pontos de dor'}
              </span>
            </div>

            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm md:text-base font-semibold bg-primary text-primary-foreground shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 animate-fade-up delay-300"
            >
              {tx(ONBOARDING_TEXTS.startSimulation, lang)} <ArrowRight size={16} />
            </button>
          </div>
        )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom controls */}
      {phase !== 'empathy' && phase !== 'profile' && phase !== 'ready' && (
        <div className="relative z-20 px-4 md:px-6 py-5">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <ChevronLeft size={16} /> {tx(ONBOARDING_TEXTS.back, lang)}
            </button>

            {phase === 'pains' && (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  canProceed()
                    ? 'bg-primary text-primary-foreground shadow-glow hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {tx(ONBOARDING_TEXTS.next, lang)} <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimOnboarding;
