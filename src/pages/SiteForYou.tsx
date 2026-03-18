import React from 'react';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import WaitlistCard from '@/components/site/WaitlistCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Smartphone, Eye, CreditCard, Users, Zap, Bell } from 'lucide-react';

const Reveal: React.FC<{
  children: React.ReactNode; delay?: number; className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`noowe-reveal ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const SiteForYou: React.FC = () => {
  const { t } = useLang();

  const features = [
    { icon: Smartphone, key: 'order' },
    { icon: Eye, key: 'track' },
    { icon: CreditCard, key: 'pay' },
    { icon: Users, key: 'split' },
    { icon: Zap, key: 'fast' },
    { icon: Bell, key: 'notify' },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }} />

        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/20 bg-secondary/5 mb-8">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-secondary font-medium text-sm">{t('foryou.overline')}</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1
              className="font-display font-bold text-foreground max-w-3xl mx-auto"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.04em', lineHeight: 1.1 }}
            >
              {t('foryou.h1')}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto text-lg leading-relaxed">
              {t('foryou.sub')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal>
            <h2 className="font-display font-bold text-foreground text-center mb-4" style={{ fontSize: 'clamp(28px, 3vw, 42px)', letterSpacing: '-0.03em' }}>
              {t('foryou.features_title')}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-muted-foreground text-center max-w-lg mx-auto mb-14 text-lg">
              {t('foryou.features_sub')}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Reveal key={f.key} delay={i * 60}>
                <div className="p-6 rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-md h-full">
                  <div className="w-11 h-11 rounded-xl bg-primary/8 text-primary flex items-center justify-center mb-4">
                    <f.icon size={22} />
                  </div>
                  <h3 className="text-foreground font-semibold text-base mb-2">{t(`foryou.feat_${f.key}_title`)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(`foryou.feat_${f.key}_desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="font-display font-bold text-foreground mb-12" style={{ fontSize: 'clamp(28px, 3vw, 42px)', letterSpacing: '-0.03em' }}>
              {t('foryou.how_title')}
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-8">
            {[1, 2, 3].map((step, i) => (
              <Reveal key={step} delay={i * 100}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-display font-bold text-lg flex items-center justify-center mx-auto mb-4">
                    {step}
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{t(`foryou.step${step}_title`)}</h4>
                  <p className="text-muted-foreground text-sm">{t(`foryou.step${step}_desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="py-24">
        <div className="max-w-[560px] mx-auto px-6">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="font-display font-bold text-foreground mb-3" style={{ fontSize: 'clamp(28px, 3vw, 42px)', letterSpacing: '-0.03em' }}>
                {t('foryou.waitlist_title')}
              </h2>
              <p className="text-muted-foreground text-lg">{t('foryou.waitlist_sub')}</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <WaitlistCard />
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default SiteForYou;
