import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { privacySections } from '@/data/privacyContent';

export default function SitePrivacy() {
  return (
    <LegalPageLayout
      pageType="privacy"
      title={{ pt: 'Política de Privacidade', en: 'Privacy Policy', es: 'Política de Privacidad' }}
      subtitle={{ pt: 'Proteção de Dados Pessoais — LGPD Compliance', en: 'Personal Data Protection — LGPD Compliance', es: 'Protección de Datos Personales — LGPD Compliance' }}
      effectiveDate="22/03/2026"
      version="1.0"
      sections={privacySections}
      pdfPath="/docs/NOOWE_Politica_de_Privacidade.pdf"
      seoTitle={{ pt: 'Política de Privacidade | NOOWE', en: 'Privacy Policy | NOOWE', es: 'Política de Privacidad | NOOWE' }}
      seoDescription={{ pt: 'Política de Privacidade da NOOWE.', en: 'NOOWE Privacy Policy.', es: 'Política de Privacidad de NOOWE.' }}
      jsonLd={[{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Política de Privacidade — NOOWE', url: 'https://noowebr.com/privacy' }]}
    />
  );
}