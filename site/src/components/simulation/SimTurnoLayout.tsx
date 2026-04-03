/**
 * SimTurnoLayout — Split-screen "Real Shift" simulation with 5 acts.
 * Sprint 6: framer-motion transitions, animated KPI counters, swipe gestures.
 * Sprint 8: email capture on conclusion.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ChevronLeft, X,
  Smartphone, Monitor, Clock, Zap, Play, Send, CheckCircle, ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import SimIcon from './SimIcon';
import { useLang } from '@/lib/i18n';
import type { SimProfile, SimModel, SimPillar, SimTranslation } from './SimulationData';
import { MODELS, PROFILES, getPillarForModel } from './SimulationData';
import {
  FINAL_IMPACT, SIM_TEXTS,
  type TurnoAct, type TurnoEvent, type ActId,
} from './SimTurnoData';
import { useSimulationTracking } from './useSimulationTracking';
import { getActsForModel, getImpactForModel } from './SimTurnoModels';
import nooweOoIcon from '@/assets/noowe-oo-icon.png';

type DemoLang = 'pt' | 'en' | 'es';
function tx(obj: SimTranslation, lang: string): string {
  return obj[(lang as DemoLang)] || obj.pt;
}

interface SimTurnoLayoutProps {
  profile: SimProfile;
  model: SimModel;
  painPoints: string[];
  onExit: () => void;
  onRestart: () => void;
}

type ViewMode = 'client' | 'restaurant';

// ─── ANIMATED COUNTER HOOK ───
function useAnimatedCounter(end: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [end, duration, delay]);
  return value;
}

// ─── ACT TRANSITION VARIANTS ───
const actVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.25, ease: 'easeIn' },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const SWIPE_THRESHOLD = 60;

const SimTurnoLayout: React.FC<SimTurnoLayoutProps> = ({
  profile, model, painPoints, onExit, onRestart,
}) => {
  const { lang } = useLang();
  const acts = getActsForModel(model);
  const [actIdx, setActIdx] = useState(0);
  const [[direction, actKey], setActState] = useState([0, 0]);
  const [phase, setPhase] = useState<'simulation' | 'conclusion'>('simulation');
  const [viewMode, setViewMode] = useState<ViewMode>('client');
  const [visibleEvents, setVisibleEvents] = useState<string[]>([]);
  // P1: Persist events across acts — track which events have been revealed per act
  const revealedEventsMap = useRef<Record<number, string[]>>({});

  const pillar = getPillarForModel(model)?.id;
  const tracking = useSimulationTracking(profile, model, pillar, painPoints, lang);
  const trackingInitialized = useRef(false);

  useEffect(() => {
    if (!trackingInitialized.current) {
      trackingInitialized.current = true;
      tracking.initTracking();
      tracking.trackActStart(acts[0].id);
    }
  }, []);

  const act = acts[actIdx];
  const isLastAct = actIdx === acts.length - 1;

  // P2: Accumulated incidents resolved counter
  const totalResolvedCount = React.useMemo(() => {
    let count = 0;
    for (let i = 0; i <= actIdx; i++) {
      const revealed = revealedEventsMap.current[i];
      if (revealed) {
        count += revealed.length;
      } else if (i < actIdx) {
        // Past acts fully revealed
        count += acts[i].events.length;
      }
    }
    // Add visible events from current act if not yet in map
    if (!revealedEventsMap.current[actIdx]) {
      count = acts.slice(0, actIdx).reduce((c, a) => c + a.events.length, 0) + visibleEvents.length;
    }
    return count;
  }, [actIdx, acts, visibleEvents]);

  // Animate events for current act & persist
  useEffect(() => {
    // If we've already revealed events for this act, restore them instantly
    if (revealedEventsMap.current[actIdx]?.length) {
      setVisibleEvents(revealedEventsMap.current[actIdx]);
      return;
    }
    setVisibleEvents([]);
    if (!act) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    act.events.forEach((ev, i) => {
      timers.push(setTimeout(() => {
        setVisibleEvents(prev => {
          const next = [...prev, ev.id];
          revealedEventsMap.current[actIdx] = next;
          return next;
        });
      }, 600 + i * 900));
    });
    return () => timers.forEach(clearTimeout);
  }, [actIdx, act]);

  const goToAct = useCallback((idx: number) => {
    if (idx === actIdx || idx < 0 || idx >= acts.length) return;
    tracking.trackActEnd(acts[actIdx].id);
    const dir = idx > actIdx ? 1 : -1;
    setActState([dir, actKey + 1]);
    setActIdx(idx);
    tracking.trackActStart(acts[idx].id);
  }, [actIdx, acts, tracking, actKey]);

  const handleNext = () => {
    if (isLastAct) {
      tracking.trackActEnd(acts[actIdx].id);
      tracking.trackCompletion();
      setPhase('conclusion');
    } else {
      goToAct(actIdx + 1);
    }
  };

  const handlePrev = () => {
    if (actIdx > 0) goToAct(actIdx - 1);
  };

  // Swipe handler
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD && !isLastAct) {
      handleNext();
    } else if (info.offset.x > SWIPE_THRESHOLD && actIdx > 0) {
      handlePrev();
    }
  };

  if (phase === 'conclusion') {
    return (
      <ConclusionScreen
        profile={profile}
        model={model}
        lang={lang}
        onRestart={onRestart}
        onExit={onExit}
        onCtaClick={(cta: string) => tracking.trackCompletion(cta)}
      />
    );
  }

  const narration = act.narration[profile];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden" role="main" aria-label="Simulação de turno">
      {/* ── TOP BAR ── */}
      <nav className="relative z-20 flex items-center justify-between px-3 md:px-6 py-3 border-b border-border" aria-label="Navegação da simulação">
        <button onClick={onExit} aria-label="Sair da simulação" className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 transition-colors">
          <X size={14} />
        </button>

        {/* Timeline */}
        <div className="flex-1 mx-4 md:mx-8">
          <div className="flex items-center gap-1 justify-center">
            {acts.map((a, i) => (
              <button
                key={a.id}
                onClick={() => goToAct(i)}
                className={`flex items-center gap-1 transition-all duration-300 ${i <= actIdx ? 'opacity-100' : 'opacity-30'}`}
              >
                <motion.div
                  className={`h-1.5 rounded-full ${
                    i === actIdx ? 'bg-primary' :
                    i < actIdx ? 'bg-primary/50' : 'bg-border'
                  }`}
                  animate={{ width: i === actIdx ? 48 : 24 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className={`hidden md:inline text-[10px] font-mono ${
                  i === actIdx ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {a.timeRange.split(' – ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Incidents resolved counter */}
        <div className="flex items-center gap-2">
          {totalResolvedCount > 0 && (
            <motion.div
              key={totalResolvedCount}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 border border-success/20"
            >
              <ShieldCheck size={12} className="text-success" />
              <span className="text-success text-[10px] font-semibold whitespace-nowrap">
                {tx(SIM_TEXTS.incidentsResolved, lang).replace('{n}', String(totalResolvedCount))}
              </span>
            </motion.div>
          )}
          <span className="text-muted-foreground text-xs font-mono whitespace-nowrap">
            {tx(SIM_TEXTS.actOf, lang).replace('{n}', String(actIdx + 1)).replace('{total}', String(acts.length))}
          </span>
        </div>
      </nav>

      {/* ── SWIPEABLE CONTENT ── */}
      <motion.div
        className="flex-1 flex flex-col overflow-hidden"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={actKey}
            custom={direction}
            variants={actVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex-1 flex flex-col"
          >
            {/* ── ACT HEADER ── */}
            <div className="px-4 md:px-8 pt-4 pb-3">
              <div className="flex items-center gap-3 mb-1">
                <Clock size={14} className="text-primary" />
                <span className="text-primary text-xs font-mono">{act.timeRange}</span>
                <span className="text-border text-xs">·</span>
                <span className="text-muted-foreground text-xs italic">{tx(act.emotion, lang)}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">{tx(act.title, lang)}</h2>
              <p className="text-muted-foreground text-xs mt-1">{tx(act.subtitle, lang)}</p>
            </div>

            {/* ── MOBILE/TABLET VIEW TOGGLE ── */}
            <div className="flex lg:hidden px-4 mb-3">
              <div className="flex bg-muted rounded-xl p-1 gap-1">
                <button
                  onClick={() => setViewMode('client')}
                  aria-label={tx(SIM_TEXTS.clientSide, lang)}
                  aria-pressed={viewMode === 'client'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'client' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Smartphone size={12} /> {tx(SIM_TEXTS.clientSide, lang)}
                </button>
                <button
                  onClick={() => setViewMode('restaurant')}
                  aria-label={tx(SIM_TEXTS.restaurantSide, lang)}
                  aria-pressed={viewMode === 'restaurant'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'restaurant' ? 'bg-secondary/20 text-secondary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Monitor size={12} /> {tx(SIM_TEXTS.restaurantSide, lang)}
                </button>
              </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 px-3 md:px-6 overflow-y-auto">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 max-w-7xl mx-auto">

                {/* CLIENT VIEW */}
                <div className={`flex-1 ${viewMode !== 'client' ? 'hidden lg:block' : ''}`}>
                  <PhoneShellPanel
                    title={tx(SIM_TEXTS.clientSide, lang)}
                    screens={act.clientScreens}
                    lang={lang}
                    timeRange={act.timeRange}
                  />
                </div>

                {/* EVENTS FEED — current act events + collapsed previous */}
                <div className="lg:w-80 xl:w-96 shrink-0 order-first lg:order-none">
                  {/* Previous acts events (collapsed) */}
                  {actIdx > 0 && (
                    <details className="mb-3 group">
                      <summary className="text-[10px] text-muted-foreground/60 cursor-pointer hover:text-muted-foreground transition-colors flex items-center gap-1 mb-1">
                        <ChevronLeft size={10} className="group-open:rotate-[-90deg] transition-transform" />
                        {tx(SIM_TEXTS.previousEvents, lang)} ({acts.slice(0, actIdx).reduce((c, a) => c + a.events.length, 0)})
                      </summary>
                      <div className="space-y-1.5 opacity-50 max-h-40 overflow-y-auto scrollbar-thin">
                        {acts.slice(0, actIdx).flatMap(a => a.events).map(ev => (
                          <div key={ev.id} className="border border-border/40 rounded-lg p-2 text-[10px]">
                            <span className="text-muted-foreground font-mono">{ev.time}</span>
                            <span className="mx-1.5 text-border">·</span>
                            <span className="text-foreground/50">{tx(ev.resolution, lang)}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                  <EventsFeed events={act.events} visibleEvents={visibleEvents} lang={lang} />
                  {/* Narration */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/[0.08] to-secondary/[0.08] border border-primary/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={12} className="text-primary" />
                      <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                        {tx(act.woowEffect, lang)}
                      </span>
                    </div>
                    <p className="text-foreground/70 text-sm leading-relaxed italic">
                      "{tx(narration, lang)}"
                    </p>
                  </motion.div>
                </div>

                {/* RESTAURANT VIEW */}
                <div className={`flex-1 ${viewMode !== 'restaurant' ? 'hidden lg:block' : ''}`}>
                  <TabletShellPanel
                    title={tx(SIM_TEXTS.restaurantSide, lang)}
                    screens={act.restaurantScreens}
                    lang={lang}
                    timeRange={act.timeRange}
                  />
                </div>
              </div>

              {/* ── METRICS ── */}
              <div className="max-w-7xl mx-auto mt-5">
                <MetricsBar metrics={act.metrics} lang={lang} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── BOTTOM NAV ── */}
      <div className="relative z-20 px-4 md:px-6 py-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={actIdx === 0}
            aria-label={tx(SIM_TEXTS.prevAct, lang)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              actIdx === 0
                ? 'text-muted-foreground/30 cursor-not-allowed'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <ChevronLeft size={16} /> {tx(SIM_TEXTS.prevAct, lang)}
          </button>

          {isLastAct ? (
            <motion.button
              onClick={handleNext}
              aria-label={tx(SIM_TEXTS.finishShift, lang)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-primary via-secondary to-primary text-primary-foreground shadow-glow hover:shadow-xl hover:scale-[1.04] active:scale-[0.97] transition-all animate-pulse-ring"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <CheckCircle size={16} />
              {tx(SIM_TEXTS.finishShift, lang)}
              <ArrowRight size={15} />
            </motion.button>
          ) : (
            <button
              onClick={handleNext}
              aria-label={tx(SIM_TEXTS.nextAct, lang)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {tx(SIM_TEXTS.nextAct, lang)}
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Swipe hint on mobile */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: actIdx > 0 ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/50 pointer-events-none"
      >
        ← {tx(SIM_TEXTS.swipeHint, lang)} →
      </motion.div>
    </div>
  );
};

// ─── PHONE SHELL (Client View) ───
const PhoneShellPanel: React.FC<{
  title: string;
  screens: { id: string; icon: string; label: SimTranslation; description: SimTranslation }[];
  lang: string;
  timeRange: string;
}> = ({ title, screens, lang, timeRange }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Phone frame */}
      <div className="relative w-full max-w-[280px] mx-auto">
        {/* Device bezel */}
        <div className="rounded-[2rem] border-[3px] border-foreground/20 bg-background shadow-xl overflow-hidden">
          {/* Notch */}
          <div className="flex justify-center pt-2 pb-1 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="w-24 h-5 bg-foreground/10 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-foreground/20" />
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-1.5 text-[9px] font-mono text-muted-foreground/60">
            <span>{timeRange.split(' – ')[0]}</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 rounded-sm border border-muted-foreground/30 relative">
                <div className="absolute inset-[1px] right-[2px] bg-success rounded-[1px]" />
              </div>
              <span>5G</span>
            </div>
          </div>

          {/* App header */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Smartphone size={10} className="text-primary" />
              </div>
              <span className="text-[11px] font-semibold text-primary">{title}</span>
            </div>
          </div>

          {/* Screen content */}
          <div className="px-3 py-3 space-y-2 min-h-[220px]">
            {screens.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/30"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <SimIcon name={s.icon} size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-[11px] font-semibold leading-tight">{tx(s.label, lang)}</p>
                  <p className="text-muted-foreground text-[9px] mt-0.5 leading-snug">{tx(s.description, lang)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="px-6 pb-2 pt-1">
            <div className="w-28 h-1 bg-foreground/15 rounded-full mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TABLET SHELL (Restaurant View) ───
const TabletShellPanel: React.FC<{
  title: string;
  screens: { id: string; icon: string; label: SimTranslation; description: SimTranslation }[];
  lang: string;
  timeRange: string;
}> = ({ title, screens, lang, timeRange }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Tablet frame */}
      <div className="relative w-full max-w-[340px] mx-auto">
        <div className="rounded-2xl border-[3px] border-foreground/15 bg-background shadow-xl overflow-hidden">
          {/* Top camera dot */}
          <div className="flex justify-center py-1.5 bg-gradient-to-b from-secondary/5 to-transparent">
            <div className="w-2 h-2 rounded-full bg-foreground/10" />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-secondary/20 flex items-center justify-center">
                <Monitor size={10} className="text-secondary" />
              </div>
              <span className="text-[11px] font-semibold text-secondary">{title}</span>
            </div>
            <span className="text-[9px] font-mono text-muted-foreground/50">{timeRange}</span>
          </div>

          {/* Dashboard content — grid layout */}
          <div className="px-3 py-3 min-h-[200px]">
            <div className="grid grid-cols-2 gap-2">
              {screens.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="p-2.5 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 rounded-md bg-secondary/10 flex items-center justify-center">
                      <SimIcon name={s.icon} size={12} className="text-secondary" />
                    </div>
                    <span className="text-[10px] font-semibold text-foreground leading-tight">{tx(s.label, lang)}</span>
                  </div>
                  <p className="text-muted-foreground text-[9px] leading-snug">{tx(s.description, lang)}</p>
                  {/* Fake activity indicator */}
                  <div className="mt-2 flex items-center gap-1">
                    <div className="h-1 flex-1 rounded-full bg-secondary/15 overflow-hidden">
                      <motion.div
                        className="h-full bg-secondary/40 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${60 + i * 15}%` }}
                        transition={{ delay: 0.5 + i * 0.2, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── EVENTS FEED ───
const EventsFeed: React.FC<{
  events: TurnoEvent[];
  visibleEvents: string[];
  lang: string;
}> = ({ events, visibleEvents, lang }) => {
  const urgencyStyle = {
    info: 'border-border bg-muted/50',
    warning: 'border-accent/20 bg-accent/[0.05]',
    critical: 'border-destructive/20 bg-destructive/[0.05]',
  };
  const urgencyDot = {
    info: 'bg-secondary',
    warning: 'bg-accent',
    critical: 'bg-destructive animate-pulse',
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Play size={12} className="text-accent" />
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          {tx(SIM_TEXTS.liveEvents, lang)}
        </span>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {events.map(ev => {
            const isVisible = visibleEvents.includes(ev.id);
            if (!isVisible) return null;
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`border rounded-xl p-3 ${urgencyStyle[ev.urgency]}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${urgencyDot[ev.urgency]}`} />
                  <span className="text-muted-foreground text-[10px] font-mono">{ev.time}</span>
                  <SimIcon name={ev.icon} size={14} className="text-muted-foreground" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <Smartphone size={10} className="text-primary/60 inline" />
                    <p className="text-foreground/60 mt-0.5">{tx(ev.clientView, lang)}</p>
                  </div>
                  <div>
                    <Monitor size={10} className="text-secondary/60 inline" />
                    <p className="text-foreground/60 mt-0.5">{tx(ev.restaurantView, lang)}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Zap size={10} className="text-success" />
                  <span className="text-success/80 text-[10px]">{tx(ev.resolution, lang)}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── METRICS BAR ───
const MetricsBar: React.FC<{
  metrics: { id: string; icon: string; label: SimTranslation; without: SimTranslation; withNoowe: SimTranslation; moneyImpact?: number }[];
  lang: string;
}> = ({ metrics, lang }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {tx(SIM_TEXTS.impactPanel, lang)}
      </span>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
          className="text-center p-3 rounded-xl bg-muted/50"
        >
          <SimIcon name={m.icon} size={20} className="mx-auto text-muted-foreground" />
          <p className="text-muted-foreground text-[10px] mt-1 mb-2">{tx(m.label, lang)}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground/50 text-xs line-through">{tx(m.without, lang)}</span>
            <span className="text-foreground font-bold text-sm">{tx(m.withNoowe, lang)}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// ─── ANIMATED VALUE DISPLAY ───
const AnimatedValue: React.FC<{ text: string; color: string; delay: number }> = ({ text, color, delay }) => {
  // Extract numeric part for animation
  const match = text.match(/^([^\d]*)([\d,.]+)(.*)/);
  if (!match) {
    return <motion.p
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.6, type: 'spring', stiffness: 100 }}
      className={`text-2xl md:text-3xl font-bold ${color} mt-2`}
    >{text}</motion.p>;
  }

  const [, prefix, numStr, suffix] = match;
  const num = parseFloat(numStr.replace(',', '.'));
  const isDecimal = numStr.includes('.') || numStr.includes(',');
  const animatedNum = useAnimatedCounter(isDecimal ? num * 10 : num, 1200, delay);
  const display = isDecimal ? (animatedNum / 10).toFixed(1) : String(animatedNum);
  // Restore comma formatting for pt
  const formatted = numStr.includes(',') ? display.replace('.', ',') : display;

  return (
    <motion.p
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.6, type: 'spring', stiffness: 100 }}
      className={`text-2xl md:text-3xl font-bold ${color} mt-2`}
    >
      {prefix}{formatted}{suffix}
    </motion.p>
  );
};

// ─── CONCLUSION SCREEN ───
const ConclusionScreen: React.FC<{
  profile: SimProfile;
  model: SimModel;
  lang: string;
  onRestart: () => void;
  onExit: () => void;
  onCtaClick?: (cta: string) => void;
}> = ({ profile, model, lang, onRestart, onExit, onCtaClick }) => {
  const impacts = getImpactForModel(model, profile);
  const ctaTitle = profile === 'owner'
    ? SIM_TEXTS.ctaOwnerTitle
    : profile === 'manager'
      ? SIM_TEXTS.ctaManagerTitle
      : SIM_TEXTS.ctaTeamTitle;

  const colorMap = { primary: 'text-primary', secondary: 'text-secondary', accent: 'text-accent', success: 'text-success' };
  const bgMap = { primary: 'bg-primary/10', secondary: 'bg-secondary/10', accent: 'bg-accent/10', success: 'bg-success/10' };

  // Email capture state
  const [email, setEmail] = useState('');
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || emailState !== 'idle') return;
    setEmailState('sending');
    try {
      await supabase.from('simulation_leads').insert([{
        profile,
        model,
        cta_clicked: 'email_capture',
        completed: true,
        language: lang,
      }]);
      // Also add to waitlist for follow-up
      await supabase.from('waitlist').insert({
        name: email.split('@')[0],
        email,
      });
      setEmailState('sent');
      onCtaClick?.('email_capture');
    } catch {
      setEmailState('sent'); // graceful fallback
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10"
    >
      {/* OO merge animation */}
      <motion.img
        src={nooweOoIcon}
        alt="NOOWE"
        className="h-14 w-14 mb-8"
        draggable={false}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 120, damping: 12 }}
      />

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        {tx(SIM_TEXTS.yourShift, lang)}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-muted-foreground text-base md:text-lg text-center max-w-lg mb-10"
      >
        {tx(ctaTitle, lang)}
      </motion.p>

      {profile === 'team' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground/70 text-sm text-center max-w-md mb-8 -mt-6"
        >
          {tx(SIM_TEXTS.ctaTeamSubtitle, lang)}
        </motion.p>
      )}

      {/* Impact cards with animated counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl w-full mb-10">
        {impacts.map((imp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.5, type: 'spring', stiffness: 100 }}
            className={`${bgMap[imp.color]} rounded-2xl p-4 md:p-5 text-center`}
          >
            <SimIcon name={imp.icon} size={24} className={`mx-auto ${colorMap[imp.color]}`} />
            <AnimatedValue
              text={tx(imp.value, lang)}
              color={colorMap[imp.color]}
              delay={600 + i * 150}
            />
            <p className="text-muted-foreground text-xs mt-1">{tx(imp.label, lang)}</p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="text-muted-foreground/60 text-[10px] mt-0.5"
            >
              {tx(imp.delta, lang)}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Email capture — personalized per profile + model */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="w-full max-w-md mb-8"
      >
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap size={16} className="text-primary" />
            <p className="text-sm font-bold text-foreground text-center">
              {tx(SIM_TEXTS[`emailCaptureTitle_${profile}`] || SIM_TEXTS.emailCaptureTitle, lang)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center mb-1">
            {tx(SIM_TEXTS[`emailCaptureSubtitle_${profile}`] || SIM_TEXTS.emailCaptureSubtitle, lang)}
          </p>
          {/* Highlight top impact metric for urgency */}
          {impacts.length > 0 && (
            <p className="text-center text-primary font-bold text-lg mb-4">
              {tx(impacts[0].value, lang)} {tx(impacts[0].label, lang).toLowerCase()}
            </p>
          )}
          {emailState === 'sent' ? (
            <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
              <CheckCircle size={16} />
              {tx(SIM_TEXTS.emailSent, lang)}
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input
                type="email"
                required
                aria-label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={tx(SIM_TEXTS.emailPlaceholder, lang)}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={emailState === 'sending'}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity shadow-glow"
              >
                <Send size={14} />
                {tx(SIM_TEXTS.emailSend, lang)}
              </button>
            </form>
          )}
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link
          to={`/demo/client?type=${model}`}
          onClick={() => onCtaClick?.('explore_demo')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {tx(SIM_TEXTS.seeFullDemo, lang)} <ArrowRight size={15} />
        </Link>
        <Link
          to="/request-demo"
          onClick={() => onCtaClick?.('talk_specialist')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-muted text-foreground border border-border hover:bg-muted/80 transition-all"
        >
          {tx(SIM_TEXTS.talkToSpecialist, lang)}
        </Link>
      </motion.div>

      {profile === 'team' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <Link
            to="/request-demo"
            onClick={() => onCtaClick?.('indicate_manager')}
            className="mt-4 text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            {tx(SIM_TEXTS.indicateManager, lang)}
          </Link>
        </motion.div>
      )}

      <motion.button
        onClick={onRestart}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="mt-8 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        {tx(SIM_TEXTS.startOver, lang)}
      </motion.button>
    </motion.div>
  );
};

export default SimTurnoLayout;
