import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import NooweLogo from '@/components/site/NooweLogo';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ArrowRight, ChefHat, Utensils, Coffee, UtensilsCrossed, Truck, Wine, Zap, Star, Users, Music, Salad } from 'lucide-react';

/* ── Scroll Reveal Wrapper ── */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string; variant?: 'up' | 'scale' | 'blur' }> = ({
  children, delay = 0, className = '', variant = 'up',
}) => {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  const cls = variant === 'scale' ? 'noowe-scale-in' : variant === 'blur' ? 'noowe-blur-in' : 'noowe-reveal';
  return (
    <div
      ref={ref}
      className={`${cls} ${visible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ── Animated Counter ── */
const Counter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({ target, suffix = '', duration = 2000 }) => {
  const [ref, visible] = useScrollReveal<HTMLSpanElement>();
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ── Service types data ── */
const serviceTypes = [
  { icon: Star, name: 'Fine Dining', restaurant: 'Bistrô Noowe', tagline: 'Where AI meets gastronomy', features: ['AI Harmonization', 'Split Bill', 'Sommelier Call'], gradient: 'from-rose-900 to-amber-900' },
  { icon: Zap, name: 'Quick Service', restaurant: 'NOOWE Express', tagline: 'Speed without compromise', features: ['Skip the Line', '4-Stage Tracking', 'Combo Builder'], gradient: 'from-yellow-500 to-orange-500' },
  { icon: Salad, name: 'Fast Casual', restaurant: 'NOOWE Fresh', tagline: 'Build your perfect meal', features: ['Bowl Builder', 'Allergen Tracking', 'Nutrition Info'], gradient: 'from-green-500 to-emerald-500' },
  { icon: Coffee, name: 'Café & Bakery', restaurant: 'Café Noowe', tagline: 'Stay, work, refill', features: ['Work Mode', 'Smart Refill', 'Stay Timer'], gradient: 'from-amber-700 to-orange-800' },
  { icon: UtensilsCrossed, name: 'Buffet', restaurant: 'Sabores Noowe', tagline: 'Smart scale, fair price', features: ['NFC Scale', 'Weight→Price', 'Live Stations'], gradient: 'from-orange-500 to-red-500' },
  { icon: Truck, name: 'Drive-Thru', restaurant: 'NOOWE Drive', tagline: 'Order ahead, arrive ready', features: ['GPS Geofencing', 'Pre-Order', 'ETA Tracking'], gradient: 'from-blue-500 to-cyan-500' },
  { icon: Truck, name: 'Food Truck', restaurant: 'Taco Noowe', tagline: 'Find us, order ahead', features: ['Real-Time Map', 'Virtual Queue', 'Push Alerts'], gradient: 'from-lime-500 to-green-500' },
  { icon: ChefHat, name: "Chef's Table", restaurant: 'Mesa do Chef', tagline: 'Course by course', features: ['Tasting Journey', 'Wine Pairing', 'Chef Interaction'], gradient: 'from-zinc-800 to-stone-700' },
  { icon: Utensils, name: 'Casual Dining', restaurant: 'Cantina Noowe', tagline: 'Families welcome', features: ['Smart Waitlist', 'Family Mode', 'Kids Priority'], gradient: 'from-red-500 to-orange-500' },
  { icon: Wine, name: 'Pub & Bar', restaurant: 'Noowe Tap House', tagline: 'Tabs, rounds, no confusion', features: ['Digital Tab', 'Round Builder', 'Group Commands'], gradient: 'from-amber-600 to-yellow-700' },
  { icon: Music, name: 'Club & Nightlife', restaurant: 'NOOWE Club', tagline: 'Tickets, VIP, unified', features: ['Anti-Fraud QR', 'VIP Mapping', 'Min. Spend Tracker'], gradient: 'from-purple-600 to-pink-600' },
];

const SiteHome: React.FC = () => {
  const { t } = useLang();

  /* ── Sticky problem section logic ── */
  const problemRef = useRef<HTMLDivElement>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [shapeProgress, setShapeProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!problemRef.current) return;
      const rect = problemRef.current.getBoundingClientRect();
      const totalH = problemRef.current.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalH));
      setShapeProgress(progress);
      setProblemIndex(progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Text reveal logic ── */
  const revealRef = useRef<HTMLDivElement>(null);
  const [revealProgress, setRevealProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!revealRef.current) return;
      const rect = revealRef.current.getBoundingClientRect();
      const totalH = revealRef.current.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      setRevealProgress(Math.max(0, Math.min(1, scrolled / totalH)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Horizontal carousel ── */
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselX, setCarouselX] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!carouselRef.current) return;
      const rect = carouselRef.current.getBoundingClientRect();
      const totalH = carouselRef.current.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalH));
      // total card width: 11 cards * 320px + gaps
      const maxScroll = 11 * 340 - window.innerWidth + 200;
      setCarouselX(progress * maxScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const problems = [
    { overline: t('problem.p1.overline'), title: t('problem.p1.title'), body: t('problem.p1.body') },
    { overline: t('problem.p2.overline'), title: t('problem.p2.title'), body: t('problem.p2.body') },
    { overline: t('problem.p3.overline'), title: t('problem.p3.title'), body: t('problem.p3.body') },
  ];

  const revealText = t('reveal.text');
  const words = revealText.split(' ');

  const shapeScale = 1 + shapeProgress * 0.55;
  const shapeRadius = 40 + shapeProgress * 140;
  const shapeRotate = shapeProgress * 20;

  return (
    <div className="bg-noowe-bg text-noowe-t1 font-noowe min-h-screen overflow-hidden">
      <SiteNavbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center pt-11">
        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{ background: 'hsl(211 100% 58% / 0.12)', animation: 'noowe-pulse-glow 4s ease-in-out infinite' }}
          />
          <div
            className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'hsl(275 86% 65% / 0.10)', animation: 'noowe-pulse-glow 4s ease-in-out infinite 1s' }}
          />
        </div>

        <div className="relative max-w-[980px] mx-auto px-5 text-center">
          {/* Overline */}
          <div className="noowe-blur-in visible mb-6">
            <span
              className="inline-block text-noowe-blue font-semibold tracking-[0.07em] uppercase"
              style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}
            >
              {t('hero.overline')}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="noowe-blur-in visible text-gradient-noowe font-bold"
            style={{
              fontSize: 'clamp(48px, 9vw, 100px)',
              letterSpacing: '-0.04em',
              lineHeight: 1.02,
              transitionDelay: '100ms',
            }}
          >
            {t('hero.h1_1')}
            <br />
            {t('hero.h1_2')}
          </h1>

          {/* Subtitle */}
          <p
            className="noowe-blur-in visible text-noowe-t2 mx-auto mt-6 max-w-2xl"
            style={{
              fontSize: 'clamp(17px, 1.6vw, 24px)',
              lineHeight: 1.4,
              transitionDelay: '200ms',
            }}
          >
            {t('hero.sub')}
          </p>

          {/* CTAs */}
          <div className="noowe-blur-in visible flex flex-col sm:flex-row items-center justify-center gap-4 mt-10" style={{ transitionDelay: '300ms' }}>
            <Link
              to="/request-demo"
              className="group flex items-center gap-2 bg-noowe-blue text-white font-medium px-8 py-3.5 rounded-full hover:bg-[#0077ed] transition-all duration-200 hover:scale-[1.03]"
              style={{ fontSize: 'clamp(15px, 1.1vw, 19px)' }}
            >
              {t('hero.cta1')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/platform"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-noowe-t2 hover:text-noowe-t1 transition-colors"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                fontSize: 'clamp(15px, 1.1vw, 19px)',
              }}
            >
              {t('hero.cta2')}
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="mt-20 flex justify-center">
            <div className="w-[1px] h-16 bg-gradient-to-b from-noowe-t3 to-transparent animate-pulse" />
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="py-16 border-y border-noowe-border/50">
        <div className="max-w-[980px] mx-auto px-5">
          <Reveal>
            <p className="text-center text-noowe-t3 text-sm tracking-wide mb-10">{t('social.title')}</p>
          </Reveal>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            {['Michelin Guide', 'Forbes 30', 'TechCrunch', 'Y Combinator', 'Sequoia'].map((name, i) => (
              <Reveal key={name} delay={i * 70}>
                <span className="text-noowe-t4 hover:text-noowe-t2 transition-opacity text-sm font-medium tracking-wider uppercase">
                  {name}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM STATEMENT — STICKY ═══ */}
      <section ref={problemRef} className="relative" style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          {/* Morphing shape */}
          <div
            className="absolute w-40 h-40 bg-gradient-to-br from-noowe-blue/20 to-noowe-purple/20"
            style={{
              transform: `scale(${shapeScale}) rotate(${shapeRotate}deg)`,
              borderRadius: `${shapeRadius}px`,
              transition: 'transform 0.1s linear, border-radius 0.1s linear',
            }}
          />

          {/* Text panels */}
          <div className="relative max-w-[720px] mx-auto px-5 text-center">
            {problems.map((p, i) => (
              <div
                key={i}
                className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500"
                style={{
                  opacity: problemIndex === i ? 1 : 0,
                  transform: problemIndex === i ? 'translateY(0)' : 'translateY(20px)',
                  pointerEvents: problemIndex === i ? 'auto' : 'none',
                }}
              >
                <span className="text-noowe-blue text-xs font-semibold tracking-[0.07em] uppercase mb-4">
                  {p.overline}
                </span>
                <h2
                  className="text-noowe-t1 font-bold mb-6"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
                >
                  {p.title}
                </h2>
                <p className="text-noowe-t2 max-w-lg" style={{ fontSize: 'clamp(15px, 1.1vw, 19px)', lineHeight: 1.55 }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-20 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ background: problemIndex === i ? 'hsl(211 100% 58%)' : 'hsl(240 2% 28%)' }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURE GRID ═══ */}
      <section className="py-32">
        <div className="max-w-[1120px] mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Card 1 — spans 2 */}
            <Reveal className="md:col-span-2">
              <div className="noowe-card p-10 md:p-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[80px] bg-noowe-blue/10" />
                <span className="text-noowe-blue text-xs font-semibold tracking-[0.07em] uppercase">
                  {t('features.card1.overline')}
                </span>
                <h3
                  className="text-noowe-t1 font-bold mt-3 mb-4 max-w-xl"
                  style={{ fontSize: 'clamp(22px, 2.2vw, 32px)', letterSpacing: '-0.025em', lineHeight: 1.15 }}
                >
                  {t('features.card1.title')}
                </h3>
                <p className="text-noowe-t2 max-w-lg" style={{ fontSize: 'clamp(15px, 1.1vw, 19px)', lineHeight: 1.55 }}>
                  {t('features.card1.body')}
                </p>
              </div>
            </Reveal>

            {[
              { overline: t('features.card2.overline'), title: t('features.card2.title'), glow: 'bg-noowe-green/10' },
              { overline: t('features.card3.overline'), title: t('features.card3.title'), glow: 'bg-noowe-purple/10' },
              { overline: t('features.card4.overline'), title: t('features.card4.title'), glow: 'bg-noowe-orange/10' },
            ].map((card, i) => (
              <Reveal key={i} delay={i * 70 + 100}>
                <div className="noowe-card p-8 md:p-10 relative overflow-hidden h-full">
                  <div className={`absolute bottom-0 right-0 w-60 h-60 rounded-full blur-[80px] ${card.glow}`} />
                  <span className="text-noowe-blue text-xs font-semibold tracking-[0.07em] uppercase">
                    {card.overline}
                  </span>
                  <h3
                    className="text-noowe-t1 font-bold mt-3 relative"
                    style={{ fontSize: 'clamp(22px, 2.2vw, 32px)', letterSpacing: '-0.025em', lineHeight: 1.15 }}
                  >
                    {card.title}
                  </h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICE TYPES CAROUSEL ═══ */}
      <section ref={carouselRef} className="relative" style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          <div className="max-w-[980px] mx-auto px-5 mb-10">
            <Reveal>
              <h2
                className="text-noowe-t1 font-bold"
                style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
              >
                {t('services.title')}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-noowe-t2 mt-3" style={{ fontSize: 'clamp(15px, 1.1vw, 19px)' }}>
                {t('services.sub')}
              </p>
            </Reveal>
          </div>

          <div
            className="flex gap-5 px-5"
            style={{
              transform: `translateX(-${carouselX}px)`,
              transition: 'transform 0.05s linear',
              willChange: 'transform',
            }}
          >
            {serviceTypes.map((s, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[300px] rounded-[28px] p-7 border border-white/[0.06] relative overflow-hidden"
                style={{ background: '#0d0d0d' }}
              >
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${s.gradient}`} />
                <div className="relative">
                  <s.icon size={28} className="text-noowe-t2 mb-4" />
                  <h4 className="text-noowe-t1 font-bold text-lg mb-1">{s.name}</h4>
                  <p className="text-noowe-t3 text-xs mb-1">{s.restaurant}</p>
                  <p className="text-noowe-t2 text-sm mb-4 italic">"{s.tagline}"</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.features.map((f) => (
                      <span key={f} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/[0.06] text-noowe-t2">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-[980px] mx-auto px-5 mt-8">
            <Link to="/platform" className="text-noowe-blue text-sm font-medium hover:underline">
              {t('services.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SPECS BAR ═══ */}
      <section className="py-20 border-y border-noowe-border/50">
        <div className="max-w-[980px] mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: 11, suffix: '', label: t('specs.types') },
              { n: 148, suffix: '+', label: t('specs.screens') },
              { n: 7, suffix: '', label: t('specs.roles') },
              { n: 3, suffix: '', label: t('specs.langs') },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div>
                  <div className="text-gradient-noowe font-bold" style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', letterSpacing: '-0.035em' }}>
                    <Counter target={s.n} suffix={s.suffix} />
                  </div>
                  <p className="text-noowe-t3 text-xs font-medium uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEXT REVEAL ═══ */}
      <section ref={revealRef} className="relative" style={{ height: '200vh' }}>
        <div className="sticky top-0 h-screen flex items-center justify-center">
          <div className="max-w-[720px] mx-auto px-5">
            <p style={{ fontSize: 'clamp(22px, 2.2vw, 32px)', lineHeight: 1.5, letterSpacing: '-0.02em' }}>
              {words.map((word, i) => {
                const wordProgress = i / words.length;
                const opacity = revealProgress > wordProgress ? 1 : 0.12;
                return (
                  <span
                    key={i}
                    className="transition-opacity duration-200"
                    style={{ opacity, color: 'hsl(240 5% 96%)' }}
                  >
                    {word}{' '}
                  </span>
                );
              })}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ DEMO PREVIEW ═══ */}
      <section className="py-32">
        <div className="max-w-[980px] mx-auto px-5 text-center">
          <Reveal>
            <span className="text-noowe-blue text-xs font-semibold tracking-[0.07em] uppercase">
              {t('demo.overline')}
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2
              className="text-noowe-t1 font-bold mt-4"
              style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              {t('demo.title')}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-noowe-t2 mt-4 max-w-md mx-auto" style={{ fontSize: 'clamp(15px, 1.1vw, 19px)', lineHeight: 1.55 }}>
              {t('demo.body')}
            </p>
          </Reveal>
          <Reveal delay={300} variant="scale">
            <div className="mt-12 mx-auto max-w-3xl rounded-3xl border border-noowe-border overflow-hidden bg-noowe-bg3 aspect-video flex items-center justify-center">
              <div className="text-center">
                <NooweLogo size="lg" />
                <p className="text-noowe-t3 text-sm mt-4">Platform Preview</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <Link
              to="/request-demo"
              className="inline-flex items-center gap-2 mt-8 text-noowe-blue font-medium hover:underline"
              style={{ fontSize: 'clamp(15px, 1.1vw, 19px)' }}
            >
              {t('demo.cta')}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-noowe-blue/[0.03] to-transparent" />
        <div className="max-w-[720px] mx-auto px-5 text-center relative">
          <Reveal>
            <h2
              className="text-noowe-t1 font-bold"
              style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              {t('cta.title')}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-noowe-t2 mt-4" style={{ fontSize: 'clamp(15px, 1.1vw, 19px)', lineHeight: 1.55 }}>
              {t('cta.sub')}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                to="/request-demo"
                className="group flex items-center gap-2 bg-noowe-blue text-white font-medium px-8 py-3.5 rounded-full hover:bg-[#0077ed] transition-all duration-200 hover:scale-[1.03]"
              >
                {t('hero.cta1')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/platform"
                className="px-8 py-3.5 rounded-full font-medium text-noowe-t2 hover:text-noowe-t1 transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                {t('hero.cta2')}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-noowe-t3 text-xs mt-6">{t('cta.note')}</p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default SiteHome;
