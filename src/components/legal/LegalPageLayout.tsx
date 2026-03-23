// Stub — full content will be migrated
import React from 'react';
import { useLang } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

interface LegalSection {
  title: Record<Lang, string>;
  content: Record<Lang, string>;
}

interface LegalPageLayoutProps {
  pageType: string;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  effectiveDate: string;
  version: string;
  sections: LegalSection[];
  pdfPath: string;
  seoTitle: Record<Lang, string>;
  seoDescription: Record<Lang, string>;
  jsonLd?: any[];
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, subtitle, effectiveDate, sections }) => {
  const { lang } = useLang();
  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display font-bold text-3xl mb-2 text-foreground">{title[lang]}</h1>
        <p className="text-muted-foreground mb-2">{subtitle[lang]}</p>
        <p className="text-xs text-muted-foreground mb-10">Vigência: {effectiveDate}</p>
        {sections.map((s, i) => (
          <div key={i} className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-2">{s.title[lang]}</h2>
            <p className="text-muted-foreground text-sm whitespace-pre-line">{s.content[lang]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegalPageLayout;