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

type ServiceItem = {
  icon: any;
  name: string;
  tagline: Record<Lang, string>;
  features: string[];
  diff: Record<Lang, string>;
};

const serviceDetails: Record<string, ServiceItem> = {
  'Fine Dining': {
    icon: Star, name: 'Fine Dining',
    tagline: { en: 'Premium gastronomy meets intelligent technology', pt: 'Gastronomia premium encontra tecnologia inteligente', es: 'Gastronomía premium conoce la tecnología inteligente' },
    features: ['AI wine & food harmonization', 'Digital sommelier call', '4-mode split bill', 'Multi-guest proxy ordering', 'Course-by-course tracking', 'Tier loyalty progression'],
    diff: { en: 'AI recommends the perfect pairing across 430+ combinations.', pt: 'IA recomenda a harmonização perfeita entre 430+ combinações.', es: 'La IA recomienda el maridaje perfecto entre 430+ combinaciones.' },
  },
  "Chef's Table": {
    icon: ChefHat, name: "Chef's Table",
    tagline: { en: 'A tasting journey, not just a meal.', pt: 'Uma jornada degustativa.', es: 'Un viaje de degustación.' },
    features: ['Course-by-course tasting menu', 'Wine pairing notes', 'Chef interaction moments', 'Dietary adaptation per guest'],
    diff: { en: 'Each course arrives with sommelier notes and chef\'s story.', pt: 'Cada prato chega com notas do sommelier e história do chef.', es: 'Cada plato llega con notas del sommelier y la historia del chef.' },
  },
  'Casual Dining': {
    icon: Utensils, name: 'Casual Dining',
    tagline: { en: 'Families welcome, chaos not included.', pt: 'Famílias bem-vindas, caos não.', es: 'Familias bienvenidas, caos no.' },
    features: ['Smart waitlist with pre-ordering', 'Family Mode', 'Multi-table party management', 'Birthday detection'],
    diff: { en: 'Guests can pre-order while waiting — food arrives faster once seated.', pt: 'Clientes podem pré-pedir enquanto esperam — comida chega mais rápido.', es: 'Los clientes pueden pedir mientras esperan.' },
  },
  'Quick Service': {
    icon: Zap, name: 'Quick Service',
    tagline: { en: 'Order ahead. Skip the line.', pt: 'Peça antes. Pule a fila.', es: 'Pide antes. Salta la fila.' },
    features: ['Skip the Line pre-ordering', '3-tier combo builder', 'Item customization', '4-stage prep tracking', 'Pickup code system', 'Stamp card loyalty'],
    diff: { en: 'Quality Check stage ensures every order is verified before handoff.', pt: 'Etapa de Quality Check garante que cada pedido é verificado antes da entrega.', es: 'La etapa Quality Check verifica cada pedido antes de la entrega.' },
  },
  'Fast Casual': {
    icon: Salad, name: 'Fast Casual',
    tagline: { en: 'Build your perfect meal in 4 steps.', pt: 'Monte sua refeição perfeita em 4 etapas.', es: 'Arma tu comida perfecta en 4 pasos.' },
    features: ['4-step dish builder', 'Real-time calorie tracking', 'Allergen alerts', 'Saved favorites', 'Nutritional summary'],
    diff: { en: 'Every ingredient shows calories, protein, carbs, and fiber in real time.', pt: 'Cada ingrediente mostra calorias, proteínas, carboidratos e fibras em tempo real.', es: 'Cada ingrediente muestra calorías, proteínas, carbohidratos y fibra en tiempo real.' },
  },
  'Drive-Thru': {
    icon: Truck, name: 'Drive-Thru',
    tagline: { en: 'Your order starts before you arrive.', pt: 'Seu pedido começa antes de você chegar.', es: 'Tu pedido empieza antes de que llegues.' },
    features: ['GPS geofencing prep trigger', 'Pre-order & pre-pay', 'Real-time ETA', 'Lane assignment'],
    diff: { en: 'GPS geofencing triggers kitchen prep 500m away.', pt: 'Geofencing GPS aciona a cozinha a 500m de distância.', es: 'Geofencing GPS activa la cocina a 500m.' },
  },
  'Café & Bakery': {
    icon: Coffee, name: 'Café & Bakery',
    tagline: { en: 'Stay longer. Work better.', pt: 'Fique mais. Trabalhe melhor.', es: 'Quédate más. Trabaja mejor.' },
    features: ['Work Mode (Wi-Fi, outlets, noise)', 'Smart refill with discounts', 'Stay timer', 'Loyalty stamp card'],
    diff: { en: 'Work Mode shows real-time Wi-Fi speed, outlets, and ambient noise level.', pt: 'Work Mode mostra velocidade de Wi-Fi, tomadas e nível de ruído em tempo real.', es: 'Work Mode muestra velocidad Wi-Fi, enchufes y nivel de ruido en tiempo real.' },
  },
  'Pub & Bar': {
    icon: Wine, name: 'Pub & Bar',
    tagline: { en: 'Tabs, rounds, no confusion.', pt: 'Comandas, rodadas, sem confusão.', es: 'Cuentas, rondas, sin confusión.' },
    features: ['Digital tab with pre-auth', 'Round builder', 'Group command system', 'Happy hour auto-detection', 'Recipe book'],
    diff: { en: 'Pre-authorized digital tabs — no card holding, no lost tabs.', pt: 'Comandas digitais pré-autorizadas — sem confusão.', es: 'Cuentas digitales pre-autorizadas.' },
  },
  'Club & Nightlife': {
    icon: Music, name: 'Club & Nightlife',
    tagline: { en: 'Tickets, tables, bottles — one app.', pt: 'Ingressos, mesas, garrafas — um app.', es: 'Boletos, mesas, botellas — una app.' },
    features: ['3-tier ticket system', 'Anti-fraud rotating QR', 'VIP zone selection', 'Bottle service menu', 'Min. spend tracker', 'Dance floor ordering'],
    diff: { en: 'Anti-fraud QR codes rotate every 30 seconds — impossible to clone.', pt: 'QR codes anti-fraude rotacionam a cada 30 segundos.', es: 'QR anti-fraude rotan cada 30 segundos.' },
  },
  'Food Truck': {
    icon: Truck, name: 'Food Truck',
    tagline: { en: 'Find us anywhere. Order from everywhere.', pt: 'Nos encontre em qualquer lugar.', es: 'Encuéntranos donde sea.' },
    features: ['Real-time truck map', 'Virtual queue', 'Push notifications', 'Schedule & route viewer'],
    diff: { en: 'Real-time map shows truck location with virtual queue.', pt: 'Mapa em tempo real mostra localização do truck com fila virtual.', es: 'Mapa en tiempo real muestra la ubicación con fila virtual.' },
  },
  'Buffet': {
    icon: UtensilsCrossed, name: 'Buffet',
    tagline: { en: 'Eat what you want. Pay what\'s fair.', pt: 'Coma o que quiser. Pague o que é justo.', es: 'Come lo que quieras. Paga lo justo.' },
    features: ['NFC smart scale', 'Weight-to-price auto calc', 'Live station tracking', 'Plate history'],
    diff: { en: 'NFC-enabled smart scale converts plate weight to price instantly.', pt: 'Balança inteligente NFC converte peso do prato em preço instantaneamente.', es: 'Balanza inteligente NFC convierte peso en precio al instante.' },
  },
};

const serviceGroups = {
  full: {
    titleKey: 'platform.group_full_title',
    descKey: 'platform.group_full_desc',
    items: ['Fine Dining', "Chef's Table", 'Casual Dining'],
  },
  volume: {
    titleKey: 'platform.group_volume_title',
    descKey: 'platform.group_volume_desc',
    items: ['Quick Service', 'Fast Casual', 'Drive-Thru'],
  },
  continuous: {
    titleKey: 'platform.group_continuous_title',
    descKey: 'platform.group_continuous_desc',
    items: ['Café & Bakery', 'Pub & Bar', 'Club & Nightlife'],
  },
  mobile: {
    titleKey: 'platform.group_mobile_title',
    descKey: 'platform.group_mobile_desc',
    items: ['Food Truck', 'Buffet'],
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