import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { termsSections } from '@/data/termsContent';

export default function SiteTerms() {
  return (
    <LegalPageLayout
      pageType="terms"
      title={{ pt: 'Termos e Condições Gerais de Uso', en: 'Terms and Conditions of Use', es: 'Términos y Condiciones Generales de Uso' }}
      subtitle={{ pt: 'Plataforma NOOWE — Aplicativos, Site e Demonstrações', en: 'NOOWE Platform — Apps, Website and Demos', es: 'Plataforma NOOWE — Aplicaciones, Sitio Web y Demostraciones' }}
      effectiveDate="22/03/2026"
      version="1.0"
      sections={termsSections}
      pdfPath="/docs/NOOWE_Termos_de_Uso.pdf"
      seoTitle={{ pt: 'Termos de Uso | NOOWE', en: 'Terms of Use | NOOWE', es: 'Términos de Uso | NOOWE' }}
      seoDescription={{ pt: 'Termos e Condições Gerais de Uso da plataforma NOOWE.', en: 'Terms and Conditions of Use for the NOOWE platform.', es: 'Términos y Condiciones de Uso de la plataforma NOOWE.' }}
      jsonLd={[{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Termos de Uso — NOOWE', url: 'https://noowebr.com/terms' }]}
    />
  );
}