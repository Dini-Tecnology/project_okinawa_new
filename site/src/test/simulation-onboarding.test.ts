import { describe, it, expect } from 'vitest';
import {
  PROFILES,
  PILLARS,
  MODELS,
  EMPATHY_TEXTS,
  ONBOARDING_TEXTS,
  PAIN_POINTS,
  getPainPoints,
  getPillarForModel,
  type SimProfile,
  type SimModel,
} from '@/components/simulation/SimulationData';

const ALL_PROFILES: SimProfile[] = ['owner', 'manager', 'team'];
const ALL_MODELS: SimModel[] = [
  'fine-dining', 'chefs-table', 'casual-dining',
  'quick-service', 'fast-casual', 'drive-thru',
  'cafe-bakery', 'pub-bar', 'club',
  'food-truck', 'buffet',
];
const LANGS = ['pt', 'en', 'es'] as const;

describe('SimulationData', () => {
  it('has 3 profiles with complete translations', () => {
    expect(PROFILES).toHaveLength(3);
    PROFILES.forEach(p => {
      LANGS.forEach(l => {
        expect(p.label[l]).toBeTruthy();
        expect(p.description[l]).toBeTruthy();
      });
    });
  });

  it('has 4 pillars covering all 11 models', () => {
    expect(PILLARS).toHaveLength(4);
    const allModels = PILLARS.flatMap(p => p.models);
    expect(allModels).toHaveLength(11);
    ALL_MODELS.forEach(m => {
      expect(allModels).toContain(m);
    });
  });

  it('every pillar has taglines for all 3 profiles in all 3 languages', () => {
    PILLARS.forEach(pl => {
      ALL_PROFILES.forEach(profile => {
        LANGS.forEach(l => {
          expect(pl.taglines[profile][l]).toBeTruthy();
        });
      });
    });
  });

  it('has model definitions for all 11 models with translations', () => {
    ALL_MODELS.forEach(m => {
      const model = MODELS[m];
      expect(model).toBeDefined();
      expect(model.id).toBe(m);
      LANGS.forEach(l => {
        expect(model.label[l]).toBeTruthy();
        expect(model.feature[l]).toBeTruthy();
      });
    });
  });

  it('has pain points for all 33 combinations (11 models × 3 profiles)', () => {
    ALL_MODELS.forEach(m => {
      ALL_PROFILES.forEach(p => {
        const pains = getPainPoints(m, p);
        expect(pains.length).toBeGreaterThanOrEqual(3);
        pains.forEach(pain => {
          expect(pain.id).toBeTruthy();
          expect(pain.icon).toBeTruthy();
          LANGS.forEach(l => {
            expect(pain.label[l]).toBeTruthy();
          });
        });
      });
    });
  });

  it('empathy texts have all 7 keys translated', () => {
    const keys = ['line1', 'line2', 'line3', 'line4', 'line5', 'line6', 'cta'];
    keys.forEach(k => {
      expect(EMPATHY_TEXTS[k]).toBeDefined();
      LANGS.forEach(l => {
        expect(EMPATHY_TEXTS[k][l]).toBeTruthy();
      });
    });
  });

  it('onboarding texts have all required keys translated', () => {
    const keys = [
      'step1Title', 'step2Title', 'step2Subtitle',
      'step3Title', 'step3Subtitle',
      'next', 'back', 'selectAtLeast',
      'readyTitle', 'readySubtitle', 'startSimulation', 'exitLabel',
    ];
    keys.forEach(k => {
      expect(ONBOARDING_TEXTS[k]).toBeDefined();
      LANGS.forEach(l => {
        expect(ONBOARDING_TEXTS[k][l]).toBeTruthy();
      });
    });
  });

  it('getPillarForModel returns correct pillar for each model', () => {
    expect(getPillarForModel('fine-dining')?.id).toBe('full-experiences');
    expect(getPillarForModel('quick-service')?.id).toBe('high-volume');
    expect(getPillarForModel('cafe-bakery')?.id).toBe('continuous');
    expect(getPillarForModel('food-truck')?.id).toBe('mobility');
  });

  it('pain point IDs are unique across all combinations', () => {
    const allIds = new Set<string>();
    ALL_MODELS.forEach(m => {
      ALL_PROFILES.forEach(p => {
        const pains = getPainPoints(m, p);
        pains.forEach(pain => {
          expect(allIds.has(pain.id)).toBe(false);
          allIds.add(pain.id);
        });
      });
    });
  });
});
