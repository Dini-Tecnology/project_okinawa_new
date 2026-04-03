import React, { useState, useEffect, useCallback } from 'react';
import { useLang } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import { useCookieConsent, COOKIE_DURATIONS } from '@/hooks/useCookieConsent';
import type { CookiePreferences } from '@/hooks/useCookieConsent';

// ============================================================
// I18N STRINGS
// ============================================================

type CookieStrings = Record<string, Record<Lang, string>>;

const strings: CookieStrings = {
  'cookie.title': {
    pt: 'Respeitamos sua privacidade',
    en: 'We respect your privacy',
    es: 'Respetamos su privacidad',
  },
  'cookie.description': {
    pt: 'Utilizamos cookies para melhorar sua experiência, personalizar conteúdo e analisar nosso tráfego. De acordo com a LGPD (Lei Geral de Proteção de Dados), você pode escolher quais cookies autorizar.',
    en: 'We use cookies to improve your experience, personalize content, and analyze our traffic. In accordance with LGPD (Brazilian General Data Protection Law), you can choose which cookies to authorize.',
    es: 'Utilizamos cookies para mejorar su experiencia, personalizar contenido y analizar nuestro tráfico. De acuerdo con la LGPD (Ley General de Protección de Datos), puede elegir qué cookies autorizar.',
  },
  'cookie.accept_all': {
    pt: 'Aceitar Todos',
    en: 'Accept All',
    es: 'Aceptar Todos',
  },
  'cookie.reject_non_essential': {
    pt: 'Rejeitar Não Essenciais',
    en: 'Reject Non-Essential',
    es: 'Rechazar No Esenciales',
  },
  'cookie.customize': {
    pt: 'Personalizar',
    en: 'Customize',
    es: 'Personalizar',
  },
  'cookie.save_preferences': {
    pt: 'Salvar Preferências',
    en: 'Save Preferences',
    es: 'Guardar Preferencias',
  },
  'cookie.back': {
    pt: 'Voltar',
    en: 'Back',
    es: 'Volver',
  },
  'cookie.cat.necessary': {
    pt: 'Estritamente Necessários',
    en: 'Strictly Necessary',
    es: 'Estrictamente Necesarios',
  },
  'cookie.cat.necessary_desc': {
    pt: 'Essenciais para o funcionamento do site. Incluem sessão, CSRF e autenticação. Não podem ser desativados.',
    en: 'Essential for the website to function. Includes session, CSRF, and authentication. Cannot be disabled.',
    es: 'Esenciales para el funcionamiento del sitio. Incluyen sesión, CSRF y autenticación. No se pueden desactivar.',
  },
  'cookie.cat.preferences': {
    pt: 'Preferências',
    en: 'Preferences',
    es: 'Preferencias',
  },
  'cookie.cat.preferences_desc': {
    pt: 'Permitem lembrar suas escolhas como idioma e tema. Duração: 1 ano.',
    en: 'Allow remembering your choices such as language and theme. Duration: 1 year.',
    es: 'Permiten recordar sus elecciones como idioma y tema. Duración: 1 año.',
  },
  'cookie.cat.statistics': {
    pt: 'Estatísticas',
    en: 'Statistics',
    es: 'Estadísticas',
  },
  'cookie.cat.statistics_desc': {
    pt: 'Nos ajudam a entender como os visitantes interagem com o site, fornecendo informações sobre áreas visitadas e tempo de navegação. Duração: 2 anos.',
    en: 'Help us understand how visitors interact with the website, providing information about visited areas and browsing time. Duration: 2 years.',
    es: 'Nos ayudan a entender cómo los visitantes interactúan con el sitio, proporcionando información sobre áreas visitadas y tiempo de navegación. Duración: 2 años.',
  },
  'cookie.cat.marketing': {
    pt: 'Marketing',
    en: 'Marketing',
    es: 'Marketing',
  },
  'cookie.cat.marketing_desc': {
    pt: 'Utilizados para rastrear visitantes em websites com o objetivo de exibir anúncios relevantes. Incluem pixels de conversão e retargeting. Duração: 90 dias.',
    en: 'Used to track visitors across websites to display relevant ads. Includes conversion pixels and retargeting. Duration: 90 days.',
    es: 'Utilizados para rastrear visitantes en sitios web con el objetivo de mostrar anuncios relevantes. Incluyen píxeles de conversión y retargeting. Duración: 90 días.',
  },
  'cookie.duration.necessary': {
    pt: 'Sessão',
    en: 'Session',
    es: 'Sesión',
  },
  'cookie.duration.preferences': {
    pt: '1 ano',
    en: '1 year',
    es: '1 año',
  },
  'cookie.duration.statistics': {
    pt: '2 anos',
    en: '2 years',
    es: '2 años',
  },
  'cookie.duration.marketing': {
    pt: '90 dias',
    en: '90 days',
    es: '90 días',
  },
  'cookie.privacy_link': {
    pt: 'Política de Privacidade',
    en: 'Privacy Policy',
    es: 'Política de Privacidad',
  },
  'cookie.always_active': {
    pt: 'Sempre ativo',
    en: 'Always active',
    es: 'Siempre activo',
  },
  'cookie.manage': {
    pt: 'Gerenciar Cookies',
    en: 'Manage Cookies',
    es: 'Gestionar Cookies',
  },
};

function ct(key: string, lang: Lang): string {
  return strings[key]?.[lang] ?? key;
}

// ============================================================
// CATEGORY DEFINITIONS
// ============================================================

interface CategoryInfo {
  key: keyof CookiePreferences;
  titleKey: string;
  descKey: string;
  durationKey: string;
  alwaysOn: boolean;
}

const CATEGORIES: CategoryInfo[] = [
  { key: 'necessary', titleKey: 'cookie.cat.necessary', descKey: 'cookie.cat.necessary_desc', durationKey: 'cookie.duration.necessary', alwaysOn: true },
  { key: 'preferences', titleKey: 'cookie.cat.preferences', descKey: 'cookie.cat.preferences_desc', durationKey: 'cookie.duration.preferences', alwaysOn: false },
  { key: 'statistics', titleKey: 'cookie.cat.statistics', descKey: 'cookie.cat.statistics_desc', durationKey: 'cookie.duration.statistics', alwaysOn: false },
  { key: 'marketing', titleKey: 'cookie.cat.marketing', descKey: 'cookie.cat.marketing_desc', durationKey: 'cookie.duration.marketing', alwaysOn: false },
];

// ============================================================
// TOGGLE COMPONENT
// ============================================================

const Toggle: React.FC<{
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  label: string;
}> = ({ checked, disabled, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`
      relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
      transition-colors duration-200 ease-in-out focus-visible:outline-none
      focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
      ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
      ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg
        ring-0 transition-transform duration-200 ease-in-out
        ${checked ? 'translate-x-6' : 'translate-x-1'}
      `}
    />
  </button>
);

// ============================================================
// COOKIE CONSENT COMPONENT
// ============================================================

const CookieConsent: React.FC = () => {
  const { lang } = useLang();
  const {
    hasConsented,
    preferences,
    acceptAll,
    rejectNonEssential,
    saveCustomPreferences,
  } = useCookieConsent();

  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [customPrefs, setCustomPrefs] = useState<CookiePreferences>({
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
  });

  useEffect(() => {
    if (!hasConsented) {
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
    setShowBanner(false);
  }, [hasConsented]);

  useEffect(() => {
    if (showCustomize) {
      setCustomPrefs({ ...preferences });
    }
  }, [showCustomize, preferences]);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
    setShowBanner(false);
    setShowCustomize(false);
  }, [acceptAll]);

  const handleRejectNonEssential = useCallback(() => {
    rejectNonEssential();
    setShowBanner(false);
    setShowCustomize(false);
  }, [rejectNonEssential]);

  const handleSaveCustom = useCallback(() => {
    saveCustomPreferences(customPrefs);
    setShowBanner(false);
    setShowCustomize(false);
  }, [saveCustomPreferences, customPrefs]);

  const handleReopenSettings = useCallback(() => {
    setShowBanner(true);
    setShowCustomize(true);
  }, []);

  const t = (key: string) => ct(key, lang);

  // Floating re-open button
  if (hasConsented && !showBanner) {
    return (
      <button
        onClick={handleReopenSettings}
        aria-label={t('cookie.manage')}
        title={t('cookie.manage')}
        className="
          fixed bottom-4 left-4 z-50 flex h-10 w-10 items-center justify-center
          rounded-full bg-primary text-primary-foreground shadow-lg
          transition-transform hover:scale-110 focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
          <path d="M8.5 8.5v.01" />
          <path d="M16 15.5v.01" />
          <path d="M12 12v.01" />
          <path d="M11 17v.01" />
          <path d="M7 14v.01" />
        </svg>
      </button>
    );
  }

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t('cookie.title')}
      className={`
        fixed inset-x-0 bottom-0 z-50 px-4 pb-4
        transition-all duration-500 ease-out
        ${showBanner ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-background/95 p-6 shadow-2xl backdrop-blur-md">
        {showCustomize ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{t('cookie.customize')}</h2>
              <button onClick={() => setShowCustomize(false)} className="text-sm text-muted-foreground underline hover:text-foreground transition-colors">
                {t('cookie.back')}
              </button>
            </div>

            <div className="divide-y divide-border">
              {CATEGORIES.map((cat) => (
                <div key={cat.key} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{t(cat.titleKey)}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{t(cat.durationKey)}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t(cat.descKey)}</p>
                    </div>
                    <div className="shrink-0">
                      {cat.alwaysOn ? (
                        <span className="text-xs font-medium text-primary">{t('cookie.always_active')}</span>
                      ) : (
                        <Toggle
                          checked={customPrefs[cat.key as keyof CookiePreferences] as boolean}
                          onChange={(val) => setCustomPrefs((prev) => ({ ...prev, [cat.key]: val }))}
                          label={t(cat.titleKey)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button onClick={handleRejectNonEssential} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {t('cookie.reject_non_essential')}
              </button>
              <button onClick={handleAcceptAll} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {t('cookie.accept_all')}
              </button>
              <button onClick={handleSaveCustom} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {t('cookie.save_preferences')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t('cookie.title')}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t('cookie.description')}</p>
              <a href="/privacy" className="mt-1 inline-block text-xs text-primary underline hover:text-primary/80 transition-colors">
                {t('cookie.privacy_link')}
              </a>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button onClick={handleAcceptAll} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:order-3">
                {t('cookie.accept_all')}
              </button>
              <button onClick={handleRejectNonEssential} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:order-2">
                {t('cookie.reject_non_essential')}
              </button>
              <button onClick={() => setShowCustomize(true)} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:order-1">
                {t('cookie.customize')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
