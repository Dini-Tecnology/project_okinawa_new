import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import NooweLogo from '@/components/site/NooweLogo';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  ArrowRight, ChefHat, Utensils, Coffee, UtensilsCrossed, Truck,
  Wine, Zap, Star, Music, Salad, BarChart3, Users, Workflow,
  Crown, ConciergeBell, GlassWater, Flame, UserCheck, Check,
} from 'lucide-react';

/* ─── Reveal Wrapper ─── */
const Reveal: React.FC<{
  children: React.ReactNode; delay?: number; className?: string;
  variant?: 'up' | 'scale' | 'blur';
}> = ({ children, delay = 0, className = '', variant = 'up' }) => {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  const cls = variant === 'scale' ? 'noowe-scale-in' : variant === 'blur' ? 'noowe-blur-in' : 'noowe-reveal';
  return (
    <div ref={ref} className={`${cls} ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* ─── Data ─── */
const serviceTypes = [
  { icon: Star, name: 'Fine Dining', key: 'fine' },
  { icon: Zap, name: 'Quick Service', key: 'quick' },
  { icon: Salad, name: 'Fast Casual', key: 'fast' },
  { icon: Coffee, name: 'Café & Bakery', key: 'cafe' },
  { icon: UtensilsCrossed, name: 'Buffet', key: 'buffet' },
  { icon: Truck, name: 'Drive-Thru', key: 'drive' },
  { icon: Truck, name: 'Food Truck', key: 'truck' },
  { icon: ChefHat, name: "Chef's Table", key: 'chef' },
  { icon: Utensils, name: 'Casual Dining', key: 'casual' },
  { icon: Wine, name: 'Pub & Bar', key: 'pub' },
  { icon: Music, name: 'Club & Nightlife', key: 'club' },
];

const roles = [
  { icon: Crown, nameKey: 'owner' },
  { icon: BarChart3, nameKey: 'manager' },
  { icon: ConciergeBell, nameKey: 'maitre' },
  { icon: ChefHat, nameKey: 'chef' },
  { icon: GlassWater, nameKey: 'barman' },
  { icon: Flame, nameKey: 'cook' },
  { icon: UserCheck, nameKey: 'waiter' },
];

const roleNames: Record<string, Record<string, string>> = {
  owner: { pt: 'Dono', en: 'Owner', es: 'Dueño' },
  manager: { pt: 'Gerente', en: 'Manager', es: 'Gerente' },
  maitre: { pt: 'Maitre', en: 'Maitre', es: 'Maitre' },
  chef: { pt: 'Chef', en: 'Chef', es: 'Chef' },
  barman: { pt: 'Barman', en: 'Barman', es: 'Barman' },
  cook: { pt: 'Cozinheiro', en: 'Cook', es: 'Cocinero' },
  waiter: { pt: 'Garçom', en: 'Waiter', es: 'Mesero' },
};

const SiteHome: React.FC = () => {
  const { lang, t } = useLang();

  /* ── Text Reveal ── */
  const revealRef = useRef<HTMLDivElement>(null);
  const [revealProgress, setRevealProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      if (!revealRef.current) return;
      const rect = revealRef.current.getBoundingClientRect();
      const totalH = revealRef.current.scrollHeight - window.innerHeight;
      setRevealProgress(Math.max(0, Math.min(1, -rect.top / totalH)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const revealTexts: Record<string, string> = {
    pt: 'Nós não construímos mais uma ferramenta para restaurantes. Nós reconstruímos a forma como restaurantes operam. Do primeiro pedido ao último relatório, NOOWE conecta cada momento em um fluxo que simplesmente funciona.',
    en: 'We didn\'t build another tool for restaurants. We rebuilt the way restaurants operate. From the first order to the last report, NOOWE connects every moment into one flow that just works.',
    es: 'No construimos otra herramienta para restaurantes. Reconstruimos la forma en que operan. Desde el primer pedido hasta el último informe, NOOWE conecta cada momento en un flujo que simplemente funciona.',
  };
  const words = (revealTexts[lang] || revealTexts.en).split(' ');

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteNavbar />

      {/* ═══ HERO ═══ */}
      <section className="min-h-[92vh] flex items-center justify-center pt-16">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <Reveal variant="blur">
            <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-6">
              {t('hero.overline')}
            </p>
          </Reveal>

          <Reveal variant="blur" delay={80}>
            <h1
              className="font-bold text-foreground"
              style={{
                fontSize: 'clamp(40px, 7vw, 80px)',
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
              }}
            >
              {t('hero.h1_1')}
              <br />
              <span className="text-primary">{t('hero.h1_2')}</span>
            </h1>
          </Reveal>

          <Reveal variant="blur" delay={160}>
            <p
              className="text-muted-foreground mx-auto mt-6 max-w-lg"
              style={{ fontSize: 'clamp(16px, 1.3vw, 20px)', lineHeight: 1.6 }}
            >
              {t('hero.sub')}
            </p>
          </Reveal>

          <Reveal variant="blur" delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link
                to="/request-demo"
                className="group flex items-center gap-2 bg-foreground text-background font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-all"
                style={{ fontSize: 'clamp(14px, 1vw, 16px)' }}
              >
                {t('hero.cta1')}
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/platform"
                className="flex items-center gap-2 px-8 py-3.5 rounded-lg font-medium text-foreground border border-border hover:border-foreground/20 transition-all"
                style={{ fontSize: 'clamp(14px, 1vw, 16px)' }}
              >
                {t('hero.cta2')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section className="py-16 border-y border-border">
        <div className="max-w-[1120px] mx-auto px-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              {['Fine Dining', 'Quick Service', 'Café', 'Buffet', 'Bar', 'Club'].map((name) => (
                <span key={name} className="text-muted-foreground/40 text-sm font-semibold tracking-wider uppercase">
                  {name}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ VALUE PROPOSITIONS ═══ */}
      <section className="py-24">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-xl mb-16">
            <Reveal>
              <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-4">{t('problem.overline')}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-bold text-foreground" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {t('problem.title')}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-muted-foreground mt-5 leading-relaxed" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}>
                {t('problem.body')}
              </p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Workflow, key: 'ops' },
              { icon: ChefHat, key: 'kitchen' },
              { icon: Users, key: 'guest' },
              { icon: BarChart3, key: 'bi' },
            ].map((v, i) => (
              <Reveal key={v.key} delay={i * 70}>
                <div className="p-6 rounded-xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-md h-full">
                  <v.icon size={24} className="text-primary mb-4" />
                  <h3 className="text-foreground font-semibold text-base mb-2">{t(`value.${v.key}.title`)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(`value.${v.key}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICE TYPES ═══ */}
      <section className="py-24" style={{ backgroundColor: 'hsl(var(--section-alt))' }}>
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-xl mb-14">
            <Reveal>
              <p className="text-secondary font-semibold text-sm tracking-wide uppercase mb-4">{t('services.overline')}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-bold text-foreground" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {t('services.title')}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-muted-foreground mt-4" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}>
                {t('services.sub')}
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {serviceTypes.map((s, i) => (
              <Reveal key={s.key} delay={i * 40}>
                <div className="bg-background rounded-xl border border-border p-5 hover:border-primary/20 hover:shadow-md transition-all duration-300 group h-full">
                  <s.icon size={22} className="text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                  <h4 className="text-foreground font-semibold text-sm">{s.name}</h4>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={500}>
            <div className="mt-10">
              <Link to="/platform" className="inline-flex items-center gap-1.5 text-primary font-medium text-sm hover:gap-3 transition-all">
                {lang === 'pt' ? 'Conheça cada tipo em detalhe' : lang === 'es' ? 'Conoce cada tipo en detalle' : 'Explore each type in detail'}
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ ROLES ═══ */}
      <section className="py-24">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-xl mb-14">
            <Reveal>
              <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-4">{t('roles.overline')}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-bold text-foreground" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {t('roles.title')}
              </h2>
            </Reveal>
          </div>

          <div className="flex flex-wrap gap-3">
            {roles.map((r, i) => (
              <Reveal key={r.nameKey} delay={i * 50}>
                <div className="flex items-center gap-3 px-5 py-3 rounded-lg border border-border bg-background hover:border-primary/20 hover:shadow-sm transition-all">
                  <r.icon size={18} className="text-muted-foreground" />
                  <span className="text-foreground font-medium text-sm">{roleNames[r.nameKey]?.[lang]}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEXT REVEAL ═══ */}
      <section ref={revealRef} className="relative" style={{ height: '200vh' }}>
        <div className="sticky top-0 h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--section-alt))' }}>
          <div className="max-w-[680px] mx-auto px-6">
            <p style={{ fontSize: 'clamp(20px, 2.2vw, 28px)', lineHeight: 1.65, letterSpacing: '-0.01em' }}>
              {words.map((word, i) => {
                const opacity = revealProgress > i / words.length ? 1 : 0.1;
                return (
                  <span key={i} className="transition-opacity duration-200 text-foreground font-medium" style={{ opacity }}>
                    {word}{' '}
                  </span>
                );
              })}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ DEMO PREVIEW ═══ */}
      <section className="py-28">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <Reveal>
            <p className="text-secondary font-semibold text-sm tracking-wide uppercase mb-4">
              {lang === 'pt' ? 'VEJA EM AÇÃO' : lang === 'es' ? 'VÉALO EN ACCIÓN' : 'SEE IT IN ACTION'}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-foreground font-bold" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.03em' }}>
              {lang === 'pt' ? 'Feito para ser experimentado.' : lang === 'es' ? 'Hecho para ser experimentado.' : 'Built to be experienced.'}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}>
              {lang === 'pt' ? 'Solicite acesso e veja NOOWE em ação.' : lang === 'es' ? 'Solicita acceso y ve NOOWE en acción.' : 'Request access and see NOOWE in action.'}
            </p>
          </Reveal>
          <Reveal delay={240} variant="scale">
            <div className="mt-14 mx-auto max-w-2xl rounded-2xl border border-border overflow-hidden bg-muted aspect-video flex items-center justify-center">
              <div className="text-center">
                <NooweLogo size="lg" className="justify-center opacity-20" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <Link
              to="/request-demo"
              className="inline-flex items-center gap-2 mt-10 text-primary font-semibold text-sm hover:gap-3 transition-all"
            >
              {t('hero.cta1')} <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-28 border-t border-border" style={{ backgroundColor: 'hsl(var(--section-alt))' }}>
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-foreground font-bold" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              {t('cta.title')}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-muted-foreground mt-4" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}>
              {t('cta.sub')}
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                to="/request-demo"
                className="group flex items-center gap-2 bg-foreground text-background font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-all"
              >
                {t('hero.cta1')}
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/platform"
                className="px-8 py-3.5 rounded-lg font-medium text-foreground border border-border hover:border-foreground/20 transition-colors"
              >
                {t('hero.cta2')}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-muted-foreground text-xs mt-8">{t('cta.note')}</p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default SiteHome;
