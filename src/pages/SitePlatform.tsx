import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  ArrowRight, Star, Zap, Salad, Coffee, UtensilsCrossed, Truck,
  ChefHat, Utensils, Wine, Music, Crown, BarChart3, ConciergeBell,
  GlassWater, Flame, UserCheck, ChevronDown, Check,
} from 'lucide-react';

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`noowe-reveal ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const serviceTypes = [
  { icon: Star, name: 'Fine Dining', restaurant: 'Bistrô Noowe', tagline: { en: 'Premium gastronomy meets intelligent technology', pt: 'Gastronomia premium encontra tecnologia inteligente', es: 'Gastronomía premium conoce la tecnología inteligente' }, features: ['AI wine & food harmonization', 'Digital sommelier call', '4-mode split bill', 'Multi-guest proxy ordering', 'Course-by-course tracking', 'Tier loyalty progression'], diff: { en: 'AI recommends the perfect pairing across 430+ combinations.', pt: 'IA recomenda a harmonização perfeita entre 430+ combinações.', es: 'La IA recomienda el maridaje perfecto entre 430+ combinaciones.' } },
  { icon: Zap, name: 'Quick Service', restaurant: 'NOOWE Express', tagline: { en: 'Order ahead. Skip the line.', pt: 'Peça antes. Pule a fila.', es: 'Pide antes. Salta la fila.' }, features: ['Skip the Line pre-ordering', '3-tier combo builder', 'Item customization', '4-stage prep tracking', 'Pickup code system', 'Stamp card loyalty'], diff: { en: 'Quality Check stage ensures every order is verified before handoff.', pt: 'Etapa de Quality Check garante que cada pedido é verificado antes da entrega.', es: 'La etapa Quality Check verifica cada pedido antes de la entrega.' } },
  { icon: Salad, name: 'Fast Casual', restaurant: 'NOOWE Fresh', tagline: { en: 'Build your perfect meal in 4 steps.', pt: 'Monte sua refeição perfeita em 4 etapas.', es: 'Arma tu comida perfecta en 4 pasos.' }, features: ['4-step dish builder', 'Real-time calorie tracking', 'Allergen alerts', 'Saved favorites', 'Nutritional summary'], diff: { en: 'Every ingredient shows calories, protein, carbs, and fiber in real time.', pt: 'Cada ingrediente mostra calorias, proteínas, carboidratos e fibras em tempo real.', es: 'Cada ingrediente muestra calorías, proteínas, carbohidratos y fibra en tiempo real.' } },
  { icon: Coffee, name: 'Café & Bakery', restaurant: 'Café Noowe', tagline: { en: 'Stay longer. Work better.', pt: 'Fique mais. Trabalhe melhor.', es: 'Quédate más. Trabaja mejor.' }, features: ['Work Mode (Wi-Fi, outlets, noise)', 'Smart refill with discounts', 'Stay timer', 'Loyalty stamp card'], diff: { en: 'Work Mode shows real-time Wi-Fi speed, outlets, and ambient noise level.', pt: 'Work Mode mostra velocidade de Wi-Fi, tomadas e nível de ruído em tempo real.', es: 'Work Mode muestra velocidad Wi-Fi, enchufes y nivel de ruido en tiempo real.' } },
  { icon: UtensilsCrossed, name: 'Buffet', restaurant: 'Sabores Noowe', tagline: { en: 'Eat what you want. Pay what\'s fair.', pt: 'Coma o que quiser. Pague o que é justo.', es: 'Come lo que quieras. Paga lo justo.' }, features: ['NFC smart scale', 'Weight-to-price auto calc', 'Live station tracking', 'Plate history'], diff: { en: 'NFC-enabled smart scale converts plate weight to price instantly.', pt: 'Balança inteligente NFC converte peso do prato em preço instantaneamente.', es: 'Balanza inteligente NFC convierte peso en precio al instante.' } },
  { icon: Truck, name: 'Drive-Thru', restaurant: 'NOOWE Drive', tagline: { en: 'Your order starts before you arrive.', pt: 'Seu pedido começa antes de você chegar.', es: 'Tu pedido empieza antes de que llegues.' }, features: ['GPS geofencing prep trigger', 'Pre-order & pre-pay', 'Real-time ETA', 'Lane assignment'], diff: { en: 'GPS geofencing triggers kitchen prep 500m away.', pt: 'Geofencing GPS aciona a cozinha a 500m de distância.', es: 'Geofencing GPS activa la cocina a 500m.' } },
  { icon: Truck, name: 'Food Truck', restaurant: 'Taco Noowe', tagline: { en: 'Find us anywhere. Order from everywhere.', pt: 'Nos encontre em qualquer lugar.', es: 'Encuéntranos donde sea.' }, features: ['Real-time truck map', 'Virtual queue', 'Push notifications', 'Schedule & route viewer'], diff: { en: 'Real-time map shows truck location with virtual queue.', pt: 'Mapa em tempo real mostra localização do truck com fila virtual.', es: 'Mapa en tiempo real muestra la ubicación con fila virtual.' } },
  { icon: ChefHat, name: "Chef's Table", restaurant: 'Mesa do Chef Noowe', tagline: { en: 'A tasting journey, not just a meal.', pt: 'Uma jornada degustativa.', es: 'Un viaje de degustación.' }, features: ['Course-by-course tasting menu', 'Wine pairing notes', 'Chef interaction moments', 'Dietary adaptation per guest'], diff: { en: 'Each course arrives with sommelier notes and chef\'s story.', pt: 'Cada prato chega com notas do sommelier e história do chef.', es: 'Cada plato llega con notas del sommelier y la historia del chef.' } },
  { icon: Utensils, name: 'Casual Dining', restaurant: 'Cantina Noowe', tagline: { en: 'Families welcome, chaos not included.', pt: 'Famílias bem-vindas, caos não.', es: 'Familias bienvenidas, caos no.' }, features: ['Smart waitlist with pre-ordering', 'Family Mode', 'Multi-table party management', 'Birthday detection'], diff: { en: 'Guests can pre-order while waiting — food arrives faster once seated.', pt: 'Clientes podem pré-pedir enquanto esperam — comida chega mais rápido.', es: 'Los clientes pueden pedir mientras esperan.' } },
  { icon: Wine, name: 'Pub & Bar', restaurant: 'Noowe Tap House', tagline: { en: 'Tabs, rounds, no confusion.', pt: 'Comandas, rodadas, sem confusão.', es: 'Cuentas, rondas, sin confusión.' }, features: ['Digital tab with pre-auth', 'Round builder', 'Group command system', 'Happy hour auto-detection', 'Recipe book'], diff: { en: 'Pre-authorized digital tabs — no card holding, no lost tabs.', pt: 'Comandas digitais pré-autorizadas — sem confusão.', es: 'Cuentas digitales pre-autorizadas.' } },
  { icon: Music, name: 'Club & Nightlife', restaurant: 'NOOWE Club', tagline: { en: 'Tickets, tables, bottles — one app.', pt: 'Ingressos, mesas, garrafas — um app.', es: 'Boletos, mesas, botellas — una app.' }, features: ['3-tier ticket system', 'Anti-fraud rotating QR', 'VIP zone selection', 'Bottle service menu', 'Min. spend tracker', 'Dance floor ordering'], diff: { en: 'Anti-fraud QR codes rotate every 30 seconds — impossible to clone.', pt: 'QR codes anti-fraude rotacionam a cada 30 segundos.', es: 'QR anti-fraude rotan cada 30 segundos.' } },
];

const rolesData = [
  { icon: Crown, name: { en: 'Owner', pt: 'Dono', es: 'Dueño' }, desc: { en: 'Full executive control. Revenue, analytics, approvals.', pt: 'Controle executivo total. Receita, análise, aprovações.', es: 'Control ejecutivo total.' } },
  { icon: BarChart3, name: { en: 'Manager', pt: 'Gerente', es: 'Gerente' }, desc: { en: 'Day-to-day operations. Orders, stock, menu, staff.', pt: 'Operações do dia a dia. Pedidos, estoque, cardápio, equipe.', es: 'Operaciones diarias.' } },
  { icon: ConciergeBell, name: { en: 'Maitre', pt: 'Maitre', es: 'Maitre' }, desc: { en: 'Guest flow mastery. Reservations, seating, queue.', pt: 'Maestria no fluxo de clientes. Reservas, assentos, fila.', es: 'Flujo de clientes.' } },
  { icon: ChefHat, name: { en: 'Chef', pt: 'Chef', es: 'Chef' }, desc: { en: 'Kitchen command center. KDS, timing, quality.', pt: 'Centro de comando da cozinha. KDS, tempo, qualidade.', es: 'Centro de comando de cocina.' } },
  { icon: GlassWater, name: { en: 'Barman', pt: 'Barman', es: 'Barman' }, desc: { en: 'Bar operations. Drink queue, recipes, stock.', pt: 'Operações do bar. Fila de drinks, receitas, estoque.', es: 'Operaciones del bar.' } },
  { icon: Flame, name: { en: 'Cook', pt: 'Cozinheiro', es: 'Cocinero' }, desc: { en: 'Station-focused. Current dishes, prep list.', pt: 'Foco na estação. Pratos atuais, lista de preparo.', es: 'Enfoque en estación.' } },
  { icon: UserCheck, name: { en: 'Waiter', pt: 'Garçom', es: 'Mesero' }, desc: { en: 'The frontline. Tables, orders, payments.', pt: 'A linha de frente. Mesas, pedidos, pagamentos.', es: 'La primera línea.' } },
];

const featureItems = {
  pt: [
    'Pedidos fluem automaticamente entre áreas',
    'Cozinha trabalha com clareza e prioridade',
    'Contas fecham sem erro',
    'Dados aparecem em tempo real',
    'Decisões deixam de ser reativas',
  ],
  en: [
    'Orders flow automatically between areas',
    'Kitchen works with clarity and priority',
    'Bills close without errors',
    'Data appears in real time',
    'Decisions stop being reactive',
  ],
  es: [
    'Pedidos fluyen automáticamente entre áreas',
    'Cocina trabaja con claridad y prioridad',
    'Cuentas cierran sin error',
    'Datos aparecen en tiempo real',
    'Decisiones dejan de ser reactivas',
  ],
};

const SitePlatform: React.FC = () => {
  const { lang, t } = useLang();
  const [activeService, setActiveService] = useState<number | null>(null);

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
            <p className="text-muted-foreground mt-6 max-w-lg mx-auto text-lg leading-relaxed">
              {t('platform.sub')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Client Experience */}
      <section className="py-20 bg-muted/30" id="client">
        <div className="max-w-[960px] mx-auto px-6">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-0.5 bg-secondary rounded-full" />
              <p className="text-secondary font-semibold text-sm tracking-wide uppercase">{t('platform.client_title')}</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="max-w-xl mt-6">
              <p className="text-foreground text-lg leading-relaxed whitespace-pre-line">
                {t('platform.client_body')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11 Service Types */}
      <section className="py-20" id="services">
        <div className="max-w-[960px] mx-auto px-6">
          <Reveal>
            <h2 className="font-display font-bold text-foreground mb-10" style={{ fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.03em' }}>
              {t('services.title')}
            </h2>
          </Reveal>

          <div className="space-y-3">
            {serviceTypes.map((s, i) => {
              const isOpen = activeService === i;
              return (
                <Reveal key={i} delay={i * 25}>
                  <div
                    className={`bg-background rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${isOpen ? 'border-primary/30 shadow-lg' : 'border-border hover:border-primary/15 hover:shadow-sm'}`}
                    onClick={() => setActiveService(isOpen ? null : i)}
                  >
                    <div className="flex items-center gap-4 px-6 py-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <s.icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-foreground font-semibold">{s.name}</span>
                        <span className="text-muted-foreground text-sm ml-3 hidden sm:inline">{s.tagline[lang]}</span>
                      </div>
                      <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isOpen && (
                      <div className="px-6 pb-6 border-t border-border/50 pt-5 animate-fade-up">
                        <p className="text-muted-foreground text-sm mb-5 sm:hidden">{s.tagline[lang]}</p>
                        <div className="grid md:grid-cols-2 gap-6">
                          <ul className="space-y-2.5">
                            {s.features.map((f) => (
                              <li key={f} className="text-muted-foreground text-sm flex items-start gap-2.5">
                                <Check size={15} className="text-primary flex-shrink-0 mt-0.5" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
                            <p className="text-xs uppercase tracking-wider mb-2 font-semibold text-primary">
                              {lang === 'pt' ? 'Diferencial' : lang === 'es' ? 'Diferencial' : 'Differentiator'}
                            </p>
                            <p className="text-foreground text-sm leading-relaxed">{s.diff[lang]}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7 Roles — Team Experience */}
      <section className="py-20 bg-muted/30" id="roles">
        <div className="max-w-[960px] mx-auto px-6">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-0.5 bg-primary rounded-full" />
              <p className="text-primary font-semibold text-sm tracking-wide uppercase">{t('platform.ops_title')}</p>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <h3 className="font-display font-bold text-foreground mt-2" style={{ fontSize: 'clamp(22px, 2.5vw, 32px)', letterSpacing: '-0.02em' }}>
              {t('platform.ops_sub_title')}
            </h3>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-muted-foreground mb-10 max-w-lg text-lg leading-relaxed mt-4">
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

      {/* Feature Section — Na Prática */}
      <section className="py-20" id="features">
        <div className="max-w-[960px] mx-auto px-6">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-0.5 bg-secondary rounded-full" />
              <p className="text-secondary font-semibold text-sm tracking-wide uppercase">{t('platform.cross_overline')}</p>
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
