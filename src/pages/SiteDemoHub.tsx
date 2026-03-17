import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ArrowRight, Smartphone, Monitor, Play, Compass, Timer } from 'lucide-react';

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`noowe-reveal ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const SiteDemoHub: React.FC = () => {
  const { t } = useLang();

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <SiteNavbar />

      <div className="flex-1 flex items-center justify-center px-6 py-28">
        <div className="max-w-[900px] mx-auto w-full text-center">
          <Reveal>
            <h1 className="font-bold text-foreground" style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.1 }}>
              {t('hub.title')}
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-muted-foreground mt-3 mb-14" style={{ fontSize: 'clamp(16px, 1.3vw, 20px)' }}>
              {t('hub.sub')}
            </p>
          </Reveal>

          {/* Guided Simulation — Primary CTA */}
          <Reveal delay={120}>
            <Link to="/demo/guided" className="group block max-w-xl mx-auto mb-4">
              <div className="relative text-left rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/[0.02] p-8 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[var(--shadow-glow)]">
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wide">
                    {t('hub.guided_tag')}
                  </span>
                </div>
                <Play size={28} className="text-primary mb-4" />
                <h3 className="text-foreground font-bold text-lg mb-2">{t('hub.guided_title')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{t('hub.guided_desc')}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Timer size={13} /> {t('hub.guided_time')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
                    {t('hub.launch')} <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>

          {/* Divider */}
          <Reveal delay={160}>
            <div className="flex items-center gap-4 max-w-xl mx-auto my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-widest">{t('hub.or')}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </Reveal>

          {/* Free Explore */}
          <Reveal delay={200}>
            <div className="max-w-xl mx-auto mb-10">
              <div className="flex items-center gap-3 mb-2">
                <Compass size={18} className="text-muted-foreground" />
                <h3 className="text-foreground font-semibold text-base">{t('hub.free_title')}</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-5 text-left pl-[30px]">{t('hub.free_desc')}</p>
            </div>
          </Reveal>

          {/* Client + Restaurant cards */}
          <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
            <Reveal delay={240}>
              <Link to="/demo/client" className="group block">
                <div className="text-left rounded-xl border border-border p-6 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg h-full">
                  <Smartphone size={24} className="text-primary mb-4" />
                  <h3 className="text-foreground font-bold text-sm mb-1.5">{t('hub.client_title')}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-4">{t('hub.client_desc')}</p>
                  <span className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold group-hover:gap-2.5 transition-all">
                    {t('hub.launch')} <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={300}>
              <Link to="/demo/restaurant" className="group block">
                <div className="text-left rounded-xl border border-border p-6 transition-all duration-300 group-hover:border-secondary/30 group-hover:shadow-lg h-full">
                  <Monitor size={24} className="text-secondary mb-4" />
                  <h3 className="text-foreground font-bold text-sm mb-1.5">{t('hub.restaurant_title')}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-4">{t('hub.restaurant_desc')}</p>
                  <span className="inline-flex items-center gap-1.5 text-secondary text-xs font-semibold group-hover:gap-2.5 transition-all">
                    {t('hub.launch')} <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default SiteDemoHub;
