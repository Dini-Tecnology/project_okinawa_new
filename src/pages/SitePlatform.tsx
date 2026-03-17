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
            <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-4">{t('platform.overline')}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-bold text-foreground" style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.035em', lineHeight: 1.1 }}>
              {t('platform.title')}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-muted-foreground mt-5 max-w-lg mx-auto" style={{ fontSize: 'clamp(16px, 1.3vw, 20px)', lineHeight: 1.6 }}>
              {t('platform.sub')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 11 Service Types */}
      <section className="py-20" style={{ backgroundColor: 'hsl(var(--section-alt))' }} id="services">
        <div className="max-w-[900px] mx-auto px-6">
          <Reveal>
            <p className="text-secondary font-semibold text-sm tracking-wide uppercase mb-3">{t('platform.client_title')}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-bold text-foreground mb-10" style={{ fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-0.03em' }}>
              {t('services.title')}
            </h2>
          </Reveal>

          <div className="space-y-2">
            {serviceTypes.map((s, i) => {
              const isOpen = activeService === i;
              return (
                <Reveal key={i} delay={i * 25}>
                  <div
                    className={`bg-background rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${isOpen ? 'border-primary/30 shadow-md' : 'border-border hover:border-primary/15'}`}
                    onClick={() => setActiveService(isOpen ? null : i)}
                  >
                    <div className="flex items-center gap-4 px-5 py-4">
                      <s.icon size={20} className={`flex-shrink-0 transition-colors ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-foreground font-semibold text-sm">{s.name}</span>
                        <span className="text-muted-foreground text-sm ml-2 hidden sm:inline">— {s.tagline[lang]}</span>
                      </div>
                      <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isOpen && (
                      <div className="px-5 pb-5 border-t border-border pt-4 animate-fade-up">
                        <p className="text-muted-foreground text-sm mb-4 sm:hidden">{s.tagline[lang]}</p>
                        <div className="grid md:grid-cols-2 gap-5">
                          <ul className="space-y-2">
                            {s.features.map((f) => (
                              <li key={f} className="text-muted-foreground text-sm flex items-start gap-2">
                                <Check size={14} className="text-primary flex-shrink-0 mt-0.5" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <div className="bg-muted rounded-xl p-5">
                            <p className="text-xs uppercase tracking-wider mb-2 font-semibold text-muted-foreground">
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

      {/* 7 Roles */}
      <section className="py-20" id="roles">
        <div className="max-w-[900px] mx-auto px-6">
          <Reveal>
            <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">{t('platform.ops_title')}</p>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-muted-foreground mb-10 max-w-lg" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)', lineHeight: 1.6 }}>
              {t('platform.ops_sub')}
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolesData.map((r, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="p-5 rounded-xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-sm h-full">
                  <r.icon size={20} className="text-primary mb-3" />
                  <h4 className="text-foreground font-semibold text-sm">{r.name[lang]}</h4>
                  <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{r.desc[lang]}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20" style={{ backgroundColor: 'hsl(var(--section-alt))' }} id="features">
        <div className="max-w-[900px] mx-auto px-6">
          <Reveal>
            <p className="text-secondary font-semibold text-sm tracking-wide uppercase mb-8">{t('platform.cross_title')}</p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: lang === 'pt' ? 'Sistema de Pagamento' : 'Payment System', desc: lang === 'pt' ? 'PIX, Crédito, Apple Pay, Google Pay, TAP to Pay e Wallet.' : 'PIX, Credit, Apple Pay, Google Pay, TAP to Pay & Wallet.' },
              { title: 'Split Bill', desc: lang === 'pt' ? '4 modos: por item, igual, seletivo e valor customizado.' : '4 modes: by item, equal, selective, and custom amount.' },
              { title: lang === 'pt' ? 'Rastreamento de Pedidos' : 'Order Tracking', desc: lang === 'pt' ? 'Pipeline em tempo real com atribuição do chef por prato.' : 'Real-time pipeline with chef attribution per dish.' },
              { title: lang === 'pt' ? 'Programa de Fidelidade' : 'Loyalty Program', desc: lang === 'pt' ? 'Progressão por tiers: Silver, Gold, Platinum e Black.' : 'Tier progression: Silver, Gold, Platinum & Black.' },
              { title: lang === 'pt' ? 'Simulação em Tempo Real' : 'Real-Time Simulation', desc: lang === 'pt' ? 'Pedidos avançam, notificações chegam, métricas atualizam — tudo ao vivo.' : 'Orders advance, notifications arrive, metrics update — all live.' },
              { title: lang === 'pt' ? 'Multilíngue' : 'Multilingual', desc: lang === 'pt' ? 'Suporte completo em Português, Inglês e Espanhol.' : 'Full support in Portuguese, English and Spanish.' },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="bg-background p-5 rounded-xl border border-border hover:border-primary/20 transition-all h-full">
                  <h4 className="text-foreground font-semibold text-sm">{f.title}</h4>
                  <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="font-bold text-foreground" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.03em' }}>
              {t('platform.cta_title')}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}>
              {t('platform.cta_body')}
            </p>
          </Reveal>
          <Reveal delay={160}>
            <Link
              to="/request-demo"
              className="inline-flex items-center gap-2 mt-8 bg-foreground text-background font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-all"
            >
              {t('nav.request_demo')}
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default SitePlatform;
