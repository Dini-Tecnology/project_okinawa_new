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

      <div className="flex-1 flex items-center justify-center px-5 py-28">
        <div className="max-w-[980px] mx-auto w-full text-center">
          <Reveal>
            <h1 className="font-bold text-foreground" style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.035em', lineHeight: 1.08 }}>
              {t('hub.title')}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-muted-foreground mt-3 mb-12" style={{ fontSize: 'clamp(16px, 1.4vw, 21px)' }}>
              {t('hub.sub')}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <Reveal delay={200}>
              <Link to="/demo/client" className="group block">
                <div className="site-card p-8 md:p-10 text-left h-full relative overflow-hidden transition-all group-hover:border-primary/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                      <Smartphone size={24} />
                    </div>
                    <h3 className="text-foreground font-bold text-xl mb-2">{t('hub.client_title')}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t('hub.client_desc')}</p>
                    <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
                      {t('hub.launch')} <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={300}>
              <Link to="/demo/restaurant" className="group block">
                <div className="site-card p-8 md:p-10 text-left h-full relative overflow-hidden transition-all group-hover:border-secondary/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-5">
                      <Monitor size={24} />
                    </div>
                    <h3 className="text-foreground font-bold text-xl mb-2">{t('hub.restaurant_title')}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t('hub.restaurant_desc')}</p>
                    <span className="inline-flex items-center gap-1.5 text-secondary text-sm font-semibold group-hover:gap-3 transition-all">
                      {t('hub.launch')} <ArrowRight size={16} />
                    </span>
                  </div>
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
