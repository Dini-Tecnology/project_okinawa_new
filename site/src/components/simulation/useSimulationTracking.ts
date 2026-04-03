/**
 * useSimulationTracking — Tracks user journey through the simulation
 * and persists lead intelligence data to the database.
 */
import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SimProfile, SimModel, SimPillar } from './SimulationData';

interface TrackingState {
  recordId: string | null;
  startTime: number;
  actStartTimes: Record<string, number>;
  actDurations: Record<string, number>;
  actsCompleted: number;
}

export function useSimulationTracking(
  profile: SimProfile,
  model: SimModel,
  pillar: SimPillar | undefined,
  painPoints: string[],
  lang: string,
) {
  const state = useRef<TrackingState>({
    recordId: null,
    startTime: Date.now(),
    actStartTimes: {},
    actDurations: {},
    actsCompleted: 0,
  });

  // Create initial record when simulation starts
  const initTracking = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('simulation_leads')
        .insert({
          profile,
          model,
          pillar: pillar || null,
          pain_points: painPoints,
          language: lang,
          acts_completed: 0,
          completed: false,
        })
        .select('id')
        .single();

      if (data) {
        state.current.recordId = data.id;
      }
    } catch (e) {
      console.warn('Simulation tracking init failed:', e);
    }
  }, [profile, model, pillar, painPoints, lang]);

  // Track when user enters an act
  const trackActStart = useCallback((actId: string) => {
    state.current.actStartTimes[actId] = Date.now();
  }, []);

  // Track when user leaves an act
  const trackActEnd = useCallback(async (actId: string) => {
    const start = state.current.actStartTimes[actId];
    if (start) {
      const duration = Math.round((Date.now() - start) / 1000);
      state.current.actDurations[actId] = duration;
      state.current.actsCompleted += 1;
    }

    if (!state.current.recordId) return;
    try {
      await supabase
        .from('simulation_leads')
        .update({
          time_per_act: state.current.actDurations,
          acts_completed: state.current.actsCompleted,
        })
        .eq('id', state.current.recordId);
    } catch (e) {
      // Silent fail — non-critical
    }
  }, []);

  // Track conclusion + CTA click
  const trackCompletion = useCallback(async (ctaClicked?: string) => {
    const totalTime = Math.round((Date.now() - state.current.startTime) / 1000);
    if (!state.current.recordId) return;
    try {
      await supabase
        .from('simulation_leads')
        .update({
          completed: true,
          total_time_seconds: totalTime,
          time_per_act: state.current.actDurations,
          acts_completed: state.current.actsCompleted,
          cta_clicked: ctaClicked || null,
        })
        .eq('id', state.current.recordId);
    } catch (e) {
      // Silent fail
    }
  }, []);

  return { initTracking, trackActStart, trackActEnd, trackCompletion };
}
