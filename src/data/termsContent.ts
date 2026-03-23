import type { Lang } from '@/lib/i18n';

export const termsContent = { sections: [] };

export const termsSections: { title: Record<Lang, string>; content: Record<Lang, string> }[] = [
  {
    title: { pt: '1. Objeto', en: '1. Purpose', es: '1. Objeto' },
    content: { pt: 'Estes Termos regulam o uso da plataforma NOOWE.', en: 'These Terms govern the use of the NOOWE platform.', es: 'Estos Términos regulan el uso de la plataforma NOOWE.' },
  },
];