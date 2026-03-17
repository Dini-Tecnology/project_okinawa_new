import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang, Lang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  ArrowRight, Star, Zap, Salad, Coffee, UtensilsCrossed, Truck,
  ChefHat, Utensils, Wine, Music, Crown, BarChart3, ConciergeBell,
  GlassWater, Flame, UserCheck, Check,
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`noowe-reveal ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const serviceGroups = {
  full: {
    titleKey: 'platform.group_full_title',
    descKey: 'platform.group_full_desc',
    items: [
      { icon: Star, name: 'Fine Dining' },
      { icon: ChefHat, name: "Chef's Table" },
      { icon: Utensils, name: 'Casual Dining' },
    ],
  },
  volume: {
    titleKey: 'platform.group_volume_title',
    descKey: 'platform.group_volume_desc',
    items: [
      { icon: Zap, name: 'Quick Service' },
      { icon: Salad, name: 'Fast Casual' },
      { icon: Truck, name: 'Drive-Thru' },
    ],
  },
  continuous: {
    titleKey: 'platform.group_continuous_title',
    descKey: 'platform.group_continuous_desc',
    items: [
      { icon: Coffee, name: 'Café & Bakery' },
      { icon: Wine, name: 'Pub & Bar' },
      { icon: Music, name: 'Club & Nightlife' },
    ],
  },
  mobile: {
    titleKey: 'platform.group_mobile_title',
    descKey: 'platform.group_mobile_desc',
    items: [
      { icon: Truck, name: 'Food Truck' },
      { icon: UtensilsCrossed, name: 'Buffet' },
    ],
  },
};

const rolesData = [
  { icon: Crown, name: { en: 'Owner', pt: 'Dono', es: 'Dueño' }, desc: { en: 'Full business vision. Decides based on data, not assumptions.', pt: 'Visão completa do negócio. Decide com base em dados, não em suposições.', es: 'Visión completa del negocio. Decide con datos, no suposiciones.' } },
  { icon: BarChart3, name: { en: 'Manager', pt: 'Gerente', es: 'Gerente' }, desc: { en: 'Orchestrates operations in real time.', pt: 'Orquestra a operação em tempo real.', es: 'Orquesta la operación en tiempo real.' } },
  { icon: ConciergeBell, name: { en: 'Maitre', pt: 'Maitre', es: 'Maitre' }, desc: { en: 'Controls the floor flow with precision.', pt: 'Controla o fluxo do salão com precisão.', es: 'Controla el flujo del salón con precisión.' } },
  { icon: ChefHat, name: { en: 'Chef', pt: 'Chef', es: 'Chef' }, desc: { en: 'Coordinates the kitchen with timing, priority and quality.', pt: 'Coordena a cozinha com tempo, prioridade e qualidade.', es: 'Coordina la cocina con tiempo, prioridad y calidad.' } },
  { icon: GlassWater, name: { en: 'Barman', pt: 'Barman', es: 'Barman' }, desc: { en: 'Keeps the bar rhythm — without losing control.', pt: 'Mantém o ritmo do bar — sem perder controle.', es: 'Mantiene el ritmo del bar — sin perder control.' } },
  { icon: Flame, name: { en: 'Cook', pt: 'Cozinheiro', es: 'Cocinero' }, desc: { en: 'Total focus on execution. No distractions.', pt: 'Foco total na execução. Sem distrações.', es: 'Foco total en la ejecución. Sin distracciones.' } },
  { icon: UserCheck, name: { en: 'Waiter', pt: 'Garçom', es: 'Mesero' }, desc: { en: 'Direct, fast, frictionless service.', pt: 'Atendimento direto, rápido e sem fricção.', es: 'Atención directa, rápida y sin fricción.' } },
];

const featureItems = {
  pt: [
    'Pedidos fluem automaticamente entre áreas',
    'Cozinha trabalha com prioridade clara',
    'Contas fecham com precisão',
    'Dados aparecem em tempo real',
    'Decisões deixam de ser reativas',
  ],
  en: [
    'Orders flow automatically between areas',
    'Kitchen works with clear priority',
    'Bills close with precision',
    'Data appears in real time',
    'Decisions stop being reactive',
  ],
  es: [
    'Pedidos fluyen automáticamente entre áreas',
    'Cocina trabaja con prioridad clara',
    'Cuentas cierran con precisión',
    'Datos aparecen en tiempo real',
    'Decisiones dejan de ser reactivas',
  ],
};

const SitePlatform: React.FC = () => {
  const { lang, t } = useLang();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <span className="text-primary font-medium text-sm">{t('platform.overline')}</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display font-bold text-foreground whitespace-pre-line" style={{ fontSize: 'clamp(34px, 5vw, 56px)', letterSpacing: '-0.035em', lineHeight: 1.1 }}>
              {t('platform.title')}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto text-lg leading-relaxed">
              {t('platform.sub')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Client Experience */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-[960px] mx-auto px-6">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-0.5 bg-secondary rounded-full" />
              <p className="text-secondary font-semibold text-sm tracking-wide uppercase">{t('platform.client_overline')}</p>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="font-display font-bold text-foreground mt-2" style={{ fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.03em' }}>
              {t('platform.client_title')}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="max-w-xl mt-6">
              <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
                {t('platform.client_body')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Operation Models — Grouped */}
      <section className="py-20" id="services">
        <div className="max-w-[960px] mx-auto px-6">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-0.5 bg-primary rounded-full" />
              <p className="text-primary font-semibold text-sm tracking-wide uppercase">{t('platform.models_overline')}</p>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="font-display font-bold text-foreground mt-2" style={{ fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.03em' }}>
              {t('platform.models_title')}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-primary font-semibold text-xl mt-3">
              {t('platform.models_sub')}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {Object.entries(serviceGroups).map(([key, group], gi) => (
              <Reveal key={key} delay={gi * 80}>
                <div className="p-6 rounded-2xl border border-border bg-background hover:border-primary/20 transition-all duration-300 hover:shadow-md h-full">
                  <h3 className="text-foreground font-bold text-lg mb-2">{t(group.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">{t(group.descKey)}</p>
                  <div className="space-y-3">
                    {group.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/8 text-primary flex items-center justify-center flex-shrink-0">
                          <item.icon size={16} />
                        </div>
                        <span className="text-foreground font-medium text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Roles */}
      <section className="py-20 bg-muted/30" id="roles">
        <div className="max-w-[960px] mx-auto px-6">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-0.5 bg-secondary rounded-full" />
              <p className="text-secondary font-semibold text-sm tracking-wide uppercase">{t('platform.ops_overline')}</p>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="font-display font-bold text-foreground mt-2 whitespace-pre-line" style={{ fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.03em' }}>
              {t('platform.ops_title')}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-muted-foreground mb-10 max-w-lg text-lg leading-relaxed mt-4 whitespace-pre-line">
              {t('platform.ops_sub')}
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolesData.map((r, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="p-6 rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-md h-full bg-background">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 text-primary flex items-center justify-center mb-4">
                    <r.icon size={20} />
                  </div>
                  <h4 className="text-foreground font-semibold">{r.name[lang]}</h4>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{r.desc[lang]}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Na Prática */}
      <section className="py-20" id="features">
        <div className="max-w-[960px] mx-auto px-6">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-0.5 bg-primary rounded-full" />
              <p className="text-primary font-semibold text-sm tracking-wide uppercase">{t('platform.cross_overline')}</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold text-foreground mb-10" style={{ fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.03em' }}>
              {t('platform.cross_title')}
            </h2>
          </Reveal>

          <div className="space-y-4 max-w-xl">
            {featureItems[lang].map((item, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={16} />
                  </div>
                  <p className="text-foreground text-lg leading-relaxed">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* System Thinking */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="font-display font-bold text-foreground" style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.035em', lineHeight: 1.15 }}>
              {t('platform.system_title_1')}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold text-primary mt-2" style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.035em', lineHeight: 1.15 }}>
              {t('platform.system_title_2')}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-muted-foreground mt-8 text-lg leading-relaxed whitespace-pre-line max-w-lg mx-auto">
              {t('platform.system_body')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="font-display font-bold text-foreground" style={{ fontSize: 'clamp(30px, 3.5vw, 48px)', letterSpacing: '-0.03em' }}>
              {t('platform.cta_title')}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-muted-foreground mt-5 text-lg max-w-lg mx-auto">
              {t('platform.cta_body')}
            </p>
          </Reveal>
          <Reveal delay={160}>
            <Link
              to="/request-demo"
              className="group inline-flex items-center gap-2.5 mt-10 bg-primary text-primary-foreground font-semibold px-10 py-4 rounded-xl hover:bg-primary-dark transition-all shadow-glow"
            >
              {t('platform.cta_button')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default SitePlatform;