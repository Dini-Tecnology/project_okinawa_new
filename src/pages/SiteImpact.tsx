import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import { CheckCircle2, ArrowRight, Compass } from 'lucide-react';

const SiteImpact: React.FC = () => {
  const { t } = useLang();

  const bullets = [
    t('impact.bullet1'),
    t('impact.bullet2'),
    t('impact.bullet3'),
  ];

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <SiteNavbar />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          {/* Animated checkmark */}
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-8 animate-scale-in">
            <CheckCircle2 size={40} className="text-success" />
          </div>

          <h1 className="font-display font-bold text-foreground mb-3" style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            {t('impact.title')}
          </h1>
          <p className="text-muted-foreground mb-10" style={{ fontSize: 'clamp(16px, 1.2vw, 20px)' }}>
            {t('impact.subtitle')}
          </p>

          {/* Bullets */}
          <div className="flex flex-col gap-3 items-start max-w-xs mx-auto mb-12">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${300 + i * 150}ms`, animationFillMode: 'backwards' }}>
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} className="text-primary" />
                </div>
                <span className="text-foreground font-medium text-sm">{b}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/request-demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-[var(--shadow-glow)] hover:opacity-90 transition-all mb-4"
          >
            {t('impact.cta')} <ArrowRight size={16} />
          </Link>

          <br />

          <Link
            to="/demo"
            className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors mt-3"
          >
            <Compass size={14} /> {t('impact.explore')}
          </Link>

          {/* Tagline */}
          <p className="mt-16 text-muted-foreground/50 text-xs italic tracking-wide">
            {t('impact.tagline')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SiteImpact;
