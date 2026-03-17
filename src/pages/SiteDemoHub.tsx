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
    <div className="bg-noowe-bg text-noowe-t1 font-noowe min-h-screen flex flex-col">
      <SiteNavbar />

      <div className="flex-1 flex items-center justify-center px-5 py-28">
        <div className="max-w-[980px] mx-auto w-full text-center">
          <Reveal>
            <h1 className="font-bold" style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', letterSpacing: '-0.035em', lineHeight: 1.06 }}>
              {t('hub.title')}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-noowe-t2 mt-3 mb-12" style={{ fontSize: 'clamp(17px, 1.6vw, 24px)' }}>
              {t('hub.sub')}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Client Demo */}
            <Reveal delay={200}>
              <Link to="/demo/client" className="group block">
                <div className="noowe-card p-8 md:p-10 text-left h-full relative overflow-hidden transition-all group-hover:border-noowe-blue/30" style={{ borderRadius: 24 }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-noowe-blue/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <Smartphone size={32} className="text-noowe-blue mb-5" />
                    <h3 className="text-noowe-t1 font-bold text-xl mb-2">{t('hub.client_title')}</h3>
                    <p className="text-noowe-t2 text-sm leading-relaxed mb-6">{t('hub.client_desc')}</p>
                    <span className="inline-flex items-center gap-1.5 text-noowe-blue text-sm font-medium group-hover:gap-3 transition-all">
                      {t('hub.launch')} <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* Restaurant Demo */}
            <Reveal delay={300}>
              <Link to="/demo/restaurant" className="group block">
                <div className="noowe-card p-8 md:p-10 text-left h-full relative overflow-hidden transition-all group-hover:border-noowe-purple/30" style={{ borderRadius: 24 }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-noowe-purple/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <Monitor size={32} className="text-noowe-purple mb-5" />
                    <h3 className="text-noowe-t1 font-bold text-xl mb-2">{t('hub.restaurant_title')}</h3>
                    <p className="text-noowe-t2 text-sm leading-relaxed mb-6">{t('hub.restaurant_desc')}</p>
                    <span className="inline-flex items-center gap-1.5 text-noowe-purple text-sm font-medium group-hover:gap-3 transition-all">
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
