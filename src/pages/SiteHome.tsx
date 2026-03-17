import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import NooweLogo from '@/components/site/NooweLogo';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  ArrowRight, ChefHat, Utensils, Coffee, UtensilsCrossed, Truck,
  Wine, Zap, Star, Music, Salad, BarChart3, Users, Workflow, Sparkles,
  Crown, ConciergeBell, GlassWater, Flame, UserCheck,
} from 'lucide-react';

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string; variant?: 'up' | 'scale' | 'blur' }> = ({
  children, delay = 0, className = '', variant = 'up',
}) => {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  const cls = variant === 'scale' ? 'noowe-scale-in' : variant === 'blur' ? 'noowe-blur-in' : 'noowe-reveal';
  return (
    <div ref={ref} className={`${cls} ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const Counter: React.FC<{ target: number; suffix?: string }> = ({ target, suffix = '' }) => {
  const [ref, visible] = useScrollReveal<HTMLSpanElement>();
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / 1800, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const serviceTypes = [
  { icon: Star, name: 'Fine Dining', tagline: 'pt:Gastronomia premium|en:Premium gastronomy|es:Gastronomía premium', color: 'bg-rose-100 text-rose-700' },
  { icon: Zap, name: 'Quick Service', tagline: 'pt:Velocidade sem compromisso|en:Speed without compromise|es:Velocidad sin compromisos', color: 'bg-amber-100 text-amber-700' },
  { icon: Salad, name: 'Fast Casual', tagline: 'pt:Monte sua refeição|en:Build your meal|es:Arma tu comida', color: 'bg-green-100 text-green-700' },
  { icon: Coffee, name: 'Café & Bakery', tagline: 'pt:Fique, trabalhe, repita|en:Stay, work, refill|es:Quédate y trabaja', color: 'bg-orange-100 text-orange-700' },
  { icon: UtensilsCrossed, name: 'Buffet', tagline: 'pt:Balança inteligente|en:Smart scale pricing|es:Balanza inteligente', color: 'bg-red-100 text-red-700' },
  { icon: Truck, name: 'Drive-Thru', tagline: 'pt:Pedido antes de chegar|en:Order before you arrive|es:Pide antes de llegar', color: 'bg-sky-100 text-sky-700' },
  { icon: Truck, name: 'Food Truck', tagline: 'pt:Encontre, peça, receba|en:Find us, order ahead|es:Encuéntranos', color: 'bg-lime-100 text-lime-700' },
  { icon: ChefHat, name: "Chef's Table", tagline: 'pt:Jornada degustativa|en:Tasting journey|es:Viaje de degustación', color: 'bg-stone-100 text-stone-700' },
  { icon: Utensils, name: 'Casual Dining', tagline: 'pt:Famílias bem-vindas|en:Families welcome|es:Familias bienvenidas', color: 'bg-pink-100 text-pink-700' },
  { icon: Wine, name: 'Pub & Bar', tagline: 'pt:Comandas sem confusão|en:Tabs without confusion|es:Cuentas sin confusión', color: 'bg-yellow-100 text-yellow-700' },
  { icon: Music, name: 'Club & Nightlife', tagline: 'pt:Ingressos ao bottle service|en:Tickets to bottle service|es:Boletos al bottle service', color: 'bg-purple-100 text-purple-700' },
];

const roles = [
  { icon: Crown, name: { pt: 'Dono', en: 'Owner', es: 'Dueño' }, desc: { pt: 'Controle executivo total', en: 'Full executive control', es: 'Control ejecutivo total' } },
  { icon: BarChart3, name: { pt: 'Gerente', en: 'Manager', es: 'Gerente' }, desc: { pt: 'Operações do dia a dia', en: 'Day-to-day operations', es: 'Operaciones diarias' } },
  { icon: ConciergeBell, name: { pt: 'Maitre', en: 'Maitre', es: 'Maitre' }, desc: { pt: 'Fluxo de clientes', en: 'Guest flow mastery', es: 'Flujo de clientes' } },
  { icon: ChefHat, name: { pt: 'Chef', en: 'Chef', es: 'Chef' }, desc: { pt: 'Comando da cozinha', en: 'Kitchen command', es: 'Comando de cocina' } },
  { icon: GlassWater, name: { pt: 'Barman', en: 'Barman', es: 'Barman' }, desc: { pt: 'Operações do bar', en: 'Bar operations', es: 'Operaciones del bar' } },
  { icon: Flame, name: { pt: 'Cozinheiro', en: 'Cook', es: 'Cocinero' }, desc: { pt: 'Foco na estação', en: 'Station focused', es: 'Enfoque en estación' } },
  { icon: UserCheck, name: { pt: 'Garçom', en: 'Waiter', es: 'Mesero' }, desc: { pt: 'Linha de frente', en: 'Frontline interface', es: 'Interfaz de primera línea' } },
];

const SiteHome: React.FC = () => {
  const { lang, t } = useLang();

  /* Text reveal */
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

  const getTagline = (taglineStr: string) => {
    const parts = taglineStr.split('|');
    const match = parts.find(p => p.startsWith(lang + ':'));
    return match ? match.slice(3) : parts[1]?.slice(3) || '';
  };

  return (
    <div className="bg-background text-foreground min-h-screen overflow-hidden">
      <SiteNavbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-14">
        {/* Warm ambient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-30"
            style={{ background: 'hsl(14 100% 57%)' }}
          />
          <div
            className="absolute top-[40%] right-[10%] w-[400px] h-[400px] rounded-full blur-[140px] opacity-20"
            style={{ background: 'hsl(168 84% 29%)' }}
          />
        </div>

        <div className="relative max-w-[980px] mx-auto px-5 text-center">
          <div className="noowe-blur-in visible mb-5">
            <span className="inline-block text-primary font-semibold tracking-[0.08em] uppercase text-xs">
              {t('hero.overline')}
            </span>
          </div>

          <h1
            className="noowe-blur-in visible font-bold text-foreground"
            style={{
              fontSize: 'clamp(44px, 8vw, 88px)',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              transitionDelay: '100ms',
            }}
          >
            {t('hero.h1_1')}
            <br />
            <span className="text-gradient-brand">{t('hero.h1_2')}</span>
          </h1>

          <p
            className="noowe-blur-in visible text-muted-foreground mx-auto mt-6 max-w-xl"
            style={{ fontSize: 'clamp(16px, 1.4vw, 21px)', lineHeight: 1.5, transitionDelay: '200ms' }}
          >
            {t('hero.sub')}
          </p>

          <div className="noowe-blur-in visible flex flex-col sm:flex-row items-center justify-center gap-4 mt-10" style={{ transitionDelay: '300ms' }}>
            <Link
              to="/request-demo"
              className="group flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-full hover:bg-primary-dark transition-all duration-200 hover:scale-[1.03] shadow-md"
              style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}
            >
              {t('hero.cta1')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/platform"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-foreground hover:text-primary border border-border hover:border-primary/30 bg-card transition-all"
              style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}
            >
              {t('hero.cta2')}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ VALUE PROPS ═══ */}
      <section className="py-24">
        <div className="max-w-[1080px] mx-auto px-5">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Workflow, key: 'ops', accent: 'text-primary bg-primary/10' },
              { icon: ChefHat, key: 'kitchen', accent: 'text-secondary bg-secondary/10' },
              { icon: Users, key: 'guest', accent: 'text-accent bg-accent/10' },
              { icon: BarChart3, key: 'bi', accent: 'text-info bg-info/10' },
            ].map((v, i) => (
              <Reveal key={v.key} delay={i * 80}>
                <div className="site-card p-7 h-full">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${v.accent}`}>
                    <v.icon size={22} />
                  </div>
                  <h3 className="text-foreground font-bold text-base mb-2">{t(`value.${v.key}.title`)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(`value.${v.key}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM / WHY ═══ */}
      <section className="py-24 bg-card">
        <div className="max-w-[720px] mx-auto px-5 text-center">
          <Reveal>
            <span className="text-primary text-xs font-semibold tracking-[0.08em] uppercase">{t('problem.overline')}</span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-bold mt-4 text-foreground" style={{ fontSize: 'clamp(26px, 3vw, 42px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              {t('problem.title')}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-muted-foreground mt-5 leading-relaxed" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}>
              {t('problem.body')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ SERVICE TYPES ═══ */}
      <section className="py-24">
        <div className="max-w-[1080px] mx-auto px-5">
          <div className="text-center max-w-xl mx-auto mb-14">
            <Reveal>
              <span className="text-secondary text-xs font-semibold tracking-[0.08em] uppercase">{t('services.overline')}</span>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="font-bold mt-3 text-foreground" style={{ fontSize: 'clamp(26px, 3vw, 42px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {t('services.title')}
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-muted-foreground mt-3" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}>
                {t('services.sub')}
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {serviceTypes.map((s, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="site-card p-5 h-full text-center group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${s.color} transition-transform group-hover:scale-110`}>
                    <s.icon size={22} />
                  </div>
                  <h4 className="text-foreground font-bold text-sm mb-1">{s.name}</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">{getTagline(s.tagline)}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={600}>
            <div className="text-center mt-8">
              <Link to="/platform" className="inline-flex items-center gap-1.5 text-primary font-medium text-sm hover:gap-3 transition-all">
                {lang === 'pt' ? 'Ver detalhes de cada tipo' : lang === 'es' ? 'Ver detalles de cada tipo' : 'See details for each type'}
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ ROLES ═══ */}
      <section className="py-24 bg-card">
        <div className="max-w-[1080px] mx-auto px-5">
          <div className="text-center max-w-xl mx-auto mb-14">
            <Reveal>
              <span className="text-primary text-xs font-semibold tracking-[0.08em] uppercase">{t('roles.overline')}</span>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="font-bold mt-3 text-foreground" style={{ fontSize: 'clamp(26px, 3vw, 42px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {t('roles.title')}
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {roles.map((r, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="site-card p-5 text-center h-full">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <r.icon size={20} />
                  </div>
                  <h4 className="text-foreground font-bold text-sm">{r.name[lang]}</h4>
                  <p className="text-muted-foreground text-xs mt-1">{r.desc[lang]}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEXT REVEAL ═══ */}
      <section ref={revealRef} className="relative" style={{ height: '200vh' }}>
        <div className="sticky top-0 h-screen flex items-center justify-center bg-background">
          <div className="max-w-[720px] mx-auto px-5">
            <p style={{ fontSize: 'clamp(22px, 2.2vw, 30px)', lineHeight: 1.6, letterSpacing: '-0.015em' }}>
              {words.map((word, i) => {
                const opacity = revealProgress > i / words.length ? 1 : 0.12;
                return (
                  <span key={i} className="transition-opacity duration-200 text-foreground" style={{ opacity }}>
                    {word}{' '}
                  </span>
                );
              })}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ DEMO PREVIEW ═══ */}
      <section className="py-24 bg-card">
        <div className="max-w-[980px] mx-auto px-5 text-center">
          <Reveal>
            <span className="text-secondary text-xs font-semibold tracking-[0.08em] uppercase">
              {lang === 'pt' ? 'VEJA EM AÇÃO' : lang === 'es' ? 'VÉALO EN ACCIÓN' : 'SEE IT IN ACTION'}
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-foreground font-bold mt-4" style={{ fontSize: 'clamp(26px, 3vw, 42px)', letterSpacing: '-0.03em' }}>
              {lang === 'pt' ? 'Feito para ser experimentado.' : lang === 'es' ? 'Hecho para ser experimentado.' : 'Built to be experienced.'}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}>
              {lang === 'pt' ? 'Solicite acesso e veja NOOWE em ação.' : lang === 'es' ? 'Solicita acceso y ve NOOWE en acción.' : 'Request access and see NOOWE in action.'}
            </p>
          </Reveal>
          <Reveal delay={300} variant="scale">
            <div className="mt-12 mx-auto max-w-3xl rounded-3xl border border-border overflow-hidden bg-background aspect-video flex items-center justify-center shadow-lg">
              <div className="text-center">
                <NooweLogo size="lg" className="justify-center" />
                <p className="text-muted-foreground text-sm mt-4">Platform Preview</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <Link
              to="/request-demo"
              className="inline-flex items-center gap-2 mt-8 text-primary font-medium hover:gap-3 transition-all"
            >
              {t('hero.cta1')} <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-28 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[140px] opacity-15" style={{ background: 'hsl(14 100% 57%)' }} />
        </div>
        <div className="max-w-[640px] mx-auto px-5 text-center relative">
          <Reveal>
            <h2 className="text-foreground font-bold" style={{ fontSize: 'clamp(26px, 3vw, 42px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              {t('cta.title')}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-muted-foreground mt-4" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}>
              {t('cta.sub')}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                to="/request-demo"
                className="group flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-full hover:bg-primary-dark transition-all hover:scale-[1.03] shadow-md"
              >
                {t('hero.cta1')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/platform"
                className="px-8 py-3.5 rounded-full font-medium text-foreground border border-border hover:border-primary/30 bg-card transition-colors"
              >
                {t('hero.cta2')}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-muted-foreground text-xs mt-6">{t('cta.note')}</p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default SiteHome;
