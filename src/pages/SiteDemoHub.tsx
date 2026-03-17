import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ArrowRight, Smartphone, Monitor } from 'lucide-react';

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

          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            <Reveal delay={160}>
              <Link to="/demo/client" className="group block">
                <div className="text-left rounded-xl border border-border p-8 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg h-full">
                  <Smartphone size={28} className="text-primary mb-5" />
                  <h3 className="text-foreground font-bold text-lg mb-2">{t('hub.client_title')}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t('hub.client_desc')}</p>
                  <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
                    {t('hub.launch')} <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={240}>
              <Link to="/demo/restaurant" className="group block">
                <div className="text-left rounded-xl border border-border p-8 transition-all duration-300 group-hover:border-secondary/30 group-hover:shadow-lg h-full">
                  <Monitor size={28} className="text-secondary mb-5" />
                  <h3 className="text-foreground font-bold text-lg mb-2">{t('hub.restaurant_title')}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t('hub.restaurant_desc')}</p>
                  <span className="inline-flex items-center gap-1.5 text-secondary text-sm font-semibold group-hover:gap-3 transition-all">
                    {t('hub.launch')} <ArrowRight size={15} />
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
