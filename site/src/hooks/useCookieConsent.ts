import { useState, useCallback, useEffect } from 'react';

// ============================================================
// TYPES
// ============================================================

export interface CookiePreferences {
  necessary: true; // Always true — cannot be disabled
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
}

export interface CookieConsentState {
  hasConsented: boolean;
  preferences: CookiePreferences;
  consentedAt: string | null;
}

export interface UseCookieConsentReturn {
  hasConsented: boolean;
  preferences: CookiePreferences;
  consentedAt: string | null;
  updatePreference: (category: keyof Omit<CookiePreferences, 'necessary'>, value: boolean) => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  saveCustomPreferences: (prefs: Partial<CookiePreferences>) => void;
  resetConsent: () => void;
  isAllowed: (category: keyof CookiePreferences) => boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const STORAGE_KEY = 'cookie_consent_given';
const PREFERENCES_KEY = 'cookie_consent_preferences';

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  preferences: false,
  statistics: false,
  marketing: false,
};

export const COOKIE_DURATIONS = {
  necessary: 'session',
  preferences: '1 year',
  statistics: '2 years',
  marketing: '90 days',
} as const;

// ============================================================
// HELPERS
// ============================================================

function loadState(): CookieConsentState {
  try {
    const consented = localStorage.getItem(STORAGE_KEY);
    const prefsRaw = localStorage.getItem(PREFERENCES_KEY);

    if (consented && prefsRaw) {
      const prefs = JSON.parse(prefsRaw) as CookiePreferences & { consentedAt?: string };
      return {
        hasConsented: true,
        preferences: {
          necessary: true,
          preferences: !!prefs.preferences,
          statistics: !!prefs.statistics,
          marketing: !!prefs.marketing,
        },
        consentedAt: prefs.consentedAt ?? consented,
      };
    }
  } catch {
    // Malformed data — treat as no consent
  }

  return {
    hasConsented: false,
    preferences: DEFAULT_PREFERENCES,
    consentedAt: null,
  };
}

function persistState(preferences: CookiePreferences): string {
  const now = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, now);
  localStorage.setItem(
    PREFERENCES_KEY,
    JSON.stringify({ ...preferences, consentedAt: now }),
  );
  return now;
}

// ============================================================
// HOOK
// ============================================================

export function useCookieConsent(): UseCookieConsentReturn {
  const [state, setState] = useState<CookieConsentState>(loadState);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === PREFERENCES_KEY) {
        setState(loadState());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const acceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true,
    };
    const ts = persistState(prefs);
    setState({ hasConsented: true, preferences: prefs, consentedAt: ts });
  }, []);

  const rejectNonEssential = useCallback(() => {
    const prefs: CookiePreferences = { ...DEFAULT_PREFERENCES };
    const ts = persistState(prefs);
    setState({ hasConsented: true, preferences: prefs, consentedAt: ts });
  }, []);

  const updatePreference = useCallback(
    (category: keyof Omit<CookiePreferences, 'necessary'>, value: boolean) => {
      setState((prev) => {
        const updated: CookiePreferences = { ...prev.preferences, [category]: value };
        const ts = persistState(updated);
        return { hasConsented: true, preferences: updated, consentedAt: ts };
      });
    },
    [],
  );

  const saveCustomPreferences = useCallback(
    (prefs: Partial<CookiePreferences>) => {
      setState((prev) => {
        const updated: CookiePreferences = {
          necessary: true,
          preferences: prefs.preferences ?? prev.preferences.preferences,
          statistics: prefs.statistics ?? prev.preferences.statistics,
          marketing: prefs.marketing ?? prev.preferences.marketing,
        };
        const ts = persistState(updated);
        return { hasConsented: true, preferences: updated, consentedAt: ts };
      });
    },
    [],
  );

  const resetConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREFERENCES_KEY);
    setState({
      hasConsented: false,
      preferences: DEFAULT_PREFERENCES,
      consentedAt: null,
    });
  }, []);

  const isAllowed = useCallback(
    (category: keyof CookiePreferences): boolean => {
      if (category === 'necessary') return true;
      return state.hasConsented && state.preferences[category];
    },
    [state],
  );

  return {
    hasConsented: state.hasConsented,
    preferences: state.preferences,
    consentedAt: state.consentedAt,
    updatePreference,
    acceptAll,
    rejectNonEssential,
    saveCustomPreferences,
    resetConsent,
    isAllowed,
  };
}

export default useCookieConsent;
