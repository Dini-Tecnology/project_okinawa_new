import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import WaitlistCard from '@/components/site/WaitlistCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  ArrowRight, ChefHat, Utensils, Coffee, UtensilsCrossed, Truck,
  Wine, Zap, Star, Music, Salad, BarChart3, Users, Workflow,
  Crown, ConciergeBell, GlassWater, Flame, UserCheck, Check,
  Shield, Globe, CreditCard, Clock, Building2, Smartphone,
} from 'lucide-react';

/* ─── Reveal ─── */
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

/* ─── Data ─── */
const serviceTypes = [
  { icon: Star, name: 'Fine Dining' },
  { icon: Zap, name: 'Quick Service' },
  { icon: Salad, name: 'Fast Casual' },
  { icon: Coffee, name: 'Café & Bakery' },
  { icon: UtensilsCrossed, name: 'Buffet' },
  { icon: Truck, name: 'Drive-Thru' },
  { icon: Truck, name: 'Food Truck' },
  { icon: ChefHat, name: "Chef's Table" },
  { icon: Utensils, name: 'Casual Dining' },
  { icon: Wine, name: 'Pub & Bar' },
  { icon: Music, name: 'Club & Nightlife' },
];

const roles = [
  { icon: Crown, name: { pt: 'Dono', en: 'Owner', es: 'Dueño' } },
  { icon: BarChart3, name: { pt: 'Gerente', en: 'Manager', es: 'Gerente' } },
  { icon: ConciergeBell, name: { pt: 'Maitre', en: 'Maitre', es: 'Maitre' } },
  { icon: ChefHat, name: { pt: 'Chef', en: 'Chef', es: 'Chef' } },
  { icon: GlassWater, name: { pt: 'Barman', en: 'Barman', es: 'Barman' } },
  { icon: Flame, name: { pt: 'Cozinheiro', en: 'Cook', es: 'Cocinero' } },
  { icon: UserCheck, name: { pt: 'Garçom', en: 'Waiter', es: 'Mesero' } },
];

const SiteHome: React.FC = () => {
  const { lang, t } = useLang();

  const stats = [
    { value: '11', label: lang === 'pt' ? 'Tipos de Serviço' : lang === 'es' ? 'Tipos de Servicio' : 'Service Types' },
    { value: '7', label: lang === 'pt' ? 'Perfis de Equipe' : lang === 'es' ? 'Perfiles de Equipo' : 'Staff Profiles' },
    { value: '3', label: lang === 'pt' ? 'Idiomas' : lang === 'es' ? 'Idiomas' : 'Languages' },
    { value: '1', label: lang === 'pt' ? 'Plataforma' : lang === 'es' ? 'Plataforma' : 'Platform' },
  ];

  const capabilities = [
    { icon: CreditCard, title: lang === 'pt' ? 'Pagamentos Integrados' : 'Integrated Payments', desc: lang === 'pt' ? 'PIX, Crédito, Apple Pay, Google Pay e Wallet digital.' : 'PIX, Credit, Apple Pay, Google Pay & digital Wallet.' },
    { icon: Shield, title: lang === 'pt' ? 'Segurança de Ponta' : 'Enterprise Security', desc: lang === 'pt' ? 'Criptografia end-to-end, QR codes anti-fraude e controle de acesso por função.' : 'End-to-end encryption, anti-fraud QR codes and role-based access control.' },
    { icon: Globe, title: lang === 'pt' ? 'Multilíngue Nativo' : 'Natively Multilingual', desc: lang === 'pt' ? 'Português, Inglês e Espanhol com detecção automática do idioma.' : 'Portuguese, English and Spanish with automatic language detection.' },
    { icon: Clock, title: lang === 'pt' ? 'Tempo Real' : 'Real-Time', desc: lang === 'pt' ? 'Pedidos, cozinha, métricas e notificações atualizando ao vivo.' : 'Orders, kitchen, metrics and notifications updating live.' },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteNavbar />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)' }} />
        
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-[720px]">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-medium text-sm">{t('hero.overline')}</span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1
                className="font-display font-bold text-foreground"
                style={{ fontSize: 'clamp(42px, 7vw, 76px)', letterSpacing: '-0.04em', lineHeight: 1.05 }}
              >
                {t('hero.h1_1')}
                <br />
                <span className="text-primary">{t('hero.h1_2')}</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-muted-foreground mt-7 max-w-lg" style={{ fontSize: 'clamp(17px, 1.4vw, 21px)', lineHeight: 1.65 }}>
                {t('hero.sub')}
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-col sm:flex-row items-start gap-4 mt-10">
                <Link
                  to="/request-demo"
                  className="group flex items-center gap-2.5 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl hover:bg-primary-dark transition-all shadow-glow"
                  style={{ fontSize: 'clamp(15px, 1vw, 17px)' }}
                >
                  {t('hero.cta1')}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/platform"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-foreground border border-border hover:border-foreground/20 hover:shadow-sm transition-all"
                  style={{ fontSize: 'clamp(15px, 1vw, 17px)' }}
                >
                  {t('hero.cta2')}
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Stats Row */}
          <Reveal delay={400}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-border">
              {stats.map((s, i) => (
                <div key={i} className="text-center md:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-foreground font-display">{s.value}</div>
                  <div className="text-muted-foreground text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ AUDIENCE BIFURCATION ═══ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal>
            <h2 className="font-display font-bold text-foreground text-center mb-12" style={{ fontSize: 'clamp(28px, 3vw, 42px)', letterSpacing: '-0.03em' }}>
              {t('home.audience_title')}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* B2B Card */}
            <Reveal delay={80}>
              <Link to="/platform" className="group block p-8 rounded-2xl border-2 border-border bg-background hover:border-primary/40 transition-all duration-300 hover:shadow-lg h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/8 text-primary flex items-center justify-center mb-5">
                  <Building2 size={24} />
                </div>
                <h3 className="font-display font-bold text-foreground text-xl mb-3">{t('home.biz_title')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t('home.biz_desc')}</p>
                <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                  {t('home.biz_cta')} <ArrowRight size={16} />
                </span>
              </Link>
            </Reveal>

            {/* B2C Card */}
            <Reveal delay={160}>
              <Link to="/para-voce" className="group block p-8 rounded-2xl border-2 border-border bg-background hover:border-secondary/40 transition-all duration-300 hover:shadow-lg h-full">
                <div className="w-12 h-12 rounded-xl bg-secondary/8 text-secondary flex items-center justify-center mb-5">
                  <Smartphone size={24} />
                </div>
                <h3 className="font-display font-bold text-foreground text-xl mb-3">{t('home.you_title')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t('home.you_desc')}</p>
                <span className="inline-flex items-center gap-2 text-secondary font-semibold text-sm group-hover:gap-3 transition-all">
                  {t('home.you_cta')} <ArrowRight size={16} />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ WHY NOOWE ═══ */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Reveal>
                <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-4">{t('problem.overline')}</p>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="font-display font-bold text-foreground" style={{ fontSize: 'clamp(30px, 3.5vw, 48px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                  {t('problem.title')}
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-muted-foreground mt-6 leading-relaxed text-lg">
                  {t('problem.body')}
                </p>
              </Reveal>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Workflow, key: 'ops', color: 'bg-primary/8 text-primary' },
                { icon: ChefHat, key: 'kitchen', color: 'bg-secondary/8 text-secondary' },
                { icon: Users, key: 'guest', color: 'bg-primary/8 text-primary' },
                { icon: BarChart3, key: 'bi', color: 'bg-secondary/8 text-secondary' },
              ].map((v, i) => (
                <Reveal key={v.key} delay={i * 80}>
                  <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-md h-full">
                    <div className={`w-11 h-11 rounded-xl ${v.color} flex items-center justify-center mb-4`}>
                      <v.icon size={22} />
                    </div>
                    <h3 className="text-foreground font-semibold text-base mb-2">{t(`value.${v.key}.title`)}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{t(`value.${v.key}.desc`)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SERVICE TYPES ═══ */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Reveal>
              <p className="text-secondary font-semibold text-sm tracking-wide uppercase mb-4">{t('services.overline')}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-display font-bold text-foreground" style={{ fontSize: 'clamp(30px, 3.5vw, 48px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {t('services.title')}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
                {t('services.sub')}
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {serviceTypes.map((s, i) => (
              <Reveal key={s.name} delay={i * 40}>
                <div className="group relative p-6 rounded-2xl border border-border bg-background hover:border-primary/30 hover:shadow-md transition-all duration-300 h-full cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
                    <s.icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="text-foreground font-semibold text-sm">{s.name}</h4>
                </div>
              </Reveal>
            ))}
            <Reveal delay={serviceTypes.length * 40}>
              <Link to="/platform" className="group relative p-6 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all duration-300 h-full flex flex-col items-center justify-center text-center">
                <ArrowRight size={20} className="text-primary mb-2 group-hover:translate-x-1 transition-transform" />
                <span className="text-primary font-semibold text-sm">
                  {lang === 'pt' ? 'Ver todos em detalhe' : lang === 'es' ? 'Ver todos en detalle' : 'See all in detail'}
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ ROLES ═══ */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Reveal>
                <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-4">{t('roles.overline')}</p>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="font-display font-bold text-foreground" style={{ fontSize: 'clamp(30px, 3.5vw, 48px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                  {t('roles.title')}
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
                  {lang === 'pt' ? 'Do dono ao garçom, cada membro da equipe tem sua interface dedicada, otimizada para suas responsabilidades.' :
                   lang === 'es' ? 'Del dueño al mesero, cada miembro del equipo tiene su interfaz dedicada.' :
                   'From owner to waiter, each team member has their dedicated interface, optimized for their responsibilities.'}
                </p>
              </Reveal>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r, i) => (
                  <Reveal key={r.name.en} delay={i * 60}>
                    <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-border bg-background hover:border-primary/20 hover:shadow-sm transition-all">
                      <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                        <r.icon size={18} className="text-primary" />
                      </div>
                      <span className="text-foreground font-medium text-sm">{r.name[lang]}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CAPABILITIES ═══ */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Reveal>
              <h2 className="font-display font-bold text-foreground" style={{ fontSize: 'clamp(30px, 3.5vw, 48px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {lang === 'pt' ? 'Construído para o mundo real.' : lang === 'es' ? 'Construido para el mundo real.' : 'Built for the real world.'}
              </h2>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((c, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="p-6 rounded-2xl border border-border bg-background hover:border-primary/20 transition-all duration-300 hover:shadow-md h-full">
                  <div className="w-11 h-11 rounded-xl bg-secondary/8 text-secondary flex items-center justify-center mb-5">
                    <c.icon size={22} />
                  </div>
                  <h3 className="text-foreground font-semibold text-base mb-2">{c.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ B2C WAITLIST STRIP ═══ */}
      <section className="py-20">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="font-display font-bold text-foreground mb-3" style={{ fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.03em' }}>
              {t('foryou.waitlist_title')}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">{t('foryou.waitlist_sub')}</p>
          </Reveal>
          <Reveal delay={100}>
            <WaitlistCard />
          </Reveal>
        </div>
      </section>

      {/* ═══ QUOTE ═══ */}
      <section className="py-28 bg-muted/30">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <Reveal>
            <blockquote
              className="font-display text-foreground font-bold leading-tight"
              style={{ fontSize: 'clamp(24px, 3vw, 40px)', letterSpacing: '-0.02em' }}
            >
              {lang === 'pt' ? '"Nós não construímos mais uma ferramenta. Nós reconstruímos a forma como restaurantes operam."' :
               lang === 'es' ? '"No construimos otra herramienta. Reconstruimos la forma en que operan los restaurantes."' :
               '"We didn\'t build another tool. We rebuilt the way restaurants operate."'}
            </blockquote>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex items-center justify-center gap-2 mt-8">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#FF5E3A' }} />
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#0D4F4F' }} />
              <span className="text-muted-foreground text-sm ml-2 font-medium">NOOWE Team</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-28">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="font-display text-foreground font-bold" style={{ fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {t('cta.title')}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-muted-foreground mt-5 text-lg">
              {t('cta.sub')}
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link
                to="/request-demo"
                className="group flex items-center gap-2.5 bg-primary text-primary-foreground font-semibold px-10 py-4 rounded-xl hover:bg-primary-dark transition-all shadow-glow"
              >
                {t('hero.cta1')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/platform"
                className="px-8 py-4 rounded-xl font-medium text-foreground border border-border hover:border-foreground/20 hover:shadow-sm transition-all"
              >
                {t('hero.cta2')}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-muted-foreground text-sm mt-8">{t('cta.note')}</p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default SiteHome;
