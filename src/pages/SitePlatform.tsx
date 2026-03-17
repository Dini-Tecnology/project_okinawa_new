import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  ArrowRight, Star, Zap, Salad, Coffee, UtensilsCrossed, Truck,
  ChefHat, Utensils, Wine, Music, Crown, BarChart3, ConciergeBell,
  GlassWater, Flame, UserCheck, ChevronDown,
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
  { icon: Star, name: 'Fine Dining', restaurant: 'Bistrô Noowe', tagline: { en: 'Premium gastronomy meets intelligent technology', pt: 'Gastronomia premium encontra tecnologia inteligente', es: 'Gastronomía premium conoce la tecnología inteligente' }, features: ['AI wine & food harmonization', 'Digital sommelier call', '4-mode split bill', 'Multi-guest proxy ordering', 'Course-by-course tracking', 'Tier loyalty progression'], diff: { en: 'AI recommends the perfect pairing across 430+ combinations.', pt: 'IA recomenda a harmonização perfeita entre 430+ combinações.', es: 'La IA recomienda el maridaje perfecto entre 430+ combinaciones.' }, color: 'bg-rose-100 text-rose-700' },
  { icon: Zap, name: 'Quick Service', restaurant: 'NOOWE Express', tagline: { en: 'Order ahead. Skip the line.', pt: 'Peça antes. Pule a fila.', es: 'Pide antes. Salta la fila.' }, features: ['Skip the Line pre-ordering', '3-tier combo builder', 'Item customization', '4-stage prep tracking', 'Pickup code system', 'Stamp card loyalty'], diff: { en: 'Quality Check stage ensures every order is verified before handoff.', pt: 'Etapa de Quality Check garante que cada pedido é verificado antes da entrega.', es: 'La etapa Quality Check verifica cada pedido antes de la entrega.' }, color: 'bg-amber-100 text-amber-700' },
  { icon: Salad, name: 'Fast Casual', restaurant: 'NOOWE Fresh', tagline: { en: 'Build your perfect meal in 4 steps.', pt: 'Monte sua refeição perfeita em 4 etapas.', es: 'Arma tu comida perfecta en 4 pasos.' }, features: ['4-step dish builder', 'Real-time calorie tracking', 'Allergen alerts', 'Saved favorites', 'Nutritional summary'], diff: { en: 'Every ingredient shows calories, protein, carbs, and fiber in real time.', pt: 'Cada ingrediente mostra calorias, proteínas, carboidratos e fibras em tempo real.', es: 'Cada ingrediente muestra calorías, proteínas, carbohidratos y fibra en tiempo real.' }, color: 'bg-green-100 text-green-700' },
  { icon: Coffee, name: 'Café & Bakery', restaurant: 'Café Noowe', tagline: { en: 'Stay longer. Work better.', pt: 'Fique mais. Trabalhe melhor.', es: 'Quédate más. Trabaja mejor.' }, features: ['Work Mode (Wi-Fi, outlets, noise)', 'Smart refill with discounts', 'Stay timer', 'Loyalty stamp card'], diff: { en: 'Work Mode shows real-time Wi-Fi speed, outlets, and ambient noise level.', pt: 'Work Mode mostra velocidade de Wi-Fi, tomadas e nível de ruído em tempo real.', es: 'Work Mode muestra velocidad Wi-Fi, enchufes y nivel de ruido en tiempo real.' }, color: 'bg-orange-100 text-orange-700' },
  { icon: UtensilsCrossed, name: 'Buffet', restaurant: 'Sabores Noowe', tagline: { en: 'Eat what you want. Pay what\'s fair.', pt: 'Coma o que quiser. Pague o que é justo.', es: 'Come lo que quieras. Paga lo justo.' }, features: ['NFC smart scale', 'Weight-to-price auto calc', 'Live station tracking', 'Plate history'], diff: { en: 'NFC-enabled smart scale converts plate weight to price instantly.', pt: 'Balança inteligente NFC converte peso do prato em preço instantaneamente.', es: 'Balanza inteligente NFC convierte peso en precio al instante.' }, color: 'bg-red-100 text-red-700' },
  { icon: Truck, name: 'Drive-Thru', restaurant: 'NOOWE Drive', tagline: { en: 'Your order starts before you arrive.', pt: 'Seu pedido começa antes de você chegar.', es: 'Tu pedido empieza antes de que llegues.' }, features: ['GPS geofencing prep trigger', 'Pre-order & pre-pay', 'Real-time ETA', 'Lane assignment'], diff: { en: 'GPS geofencing triggers kitchen prep 500m away.', pt: 'Geofencing GPS aciona a cozinha a 500m de distância.', es: 'Geofencing GPS activa la cocina a 500m.' }, color: 'bg-sky-100 text-sky-700' },
  { icon: Truck, name: 'Food Truck', restaurant: 'Taco Noowe', tagline: { en: 'Find us anywhere. Order from everywhere.', pt: 'Nos encontre em qualquer lugar.', es: 'Encuéntranos donde sea.' }, features: ['Real-time truck map', 'Virtual queue', 'Push notifications', 'Schedule & route viewer'], diff: { en: 'Real-time map shows truck location with virtual queue.', pt: 'Mapa em tempo real mostra localização do truck com fila virtual.', es: 'Mapa en tiempo real muestra la ubicación con fila virtual.' }, color: 'bg-lime-100 text-lime-700' },
  { icon: ChefHat, name: "Chef's Table", restaurant: 'Mesa do Chef Noowe', tagline: { en: 'A tasting journey, not just a meal.', pt: 'Uma jornada degustativa.', es: 'Un viaje de degustación.' }, features: ['Course-by-course tasting menu', 'Wine pairing notes', 'Chef interaction moments', 'Dietary adaptation per guest'], diff: { en: 'Each course arrives with sommelier notes and chef\'s story.', pt: 'Cada prato chega com notas do sommelier e história do chef.', es: 'Cada plato llega con notas del sommelier y la historia del chef.' }, color: 'bg-stone-100 text-stone-700' },
  { icon: Utensils, name: 'Casual Dining', restaurant: 'Cantina Noowe', tagline: { en: 'Families welcome, chaos not included.', pt: 'Famílias bem-vindas, caos não.', es: 'Familias bienvenidas, caos no.' }, features: ['Smart waitlist with pre-ordering', 'Family Mode', 'Multi-table party management', 'Birthday detection'], diff: { en: 'Guests can pre-order while waiting — food arrives faster once seated.', pt: 'Clientes podem pré-pedir enquanto esperam — comida chega mais rápido.', es: 'Los clientes pueden pedir mientras esperan.' }, color: 'bg-pink-100 text-pink-700' },
  { icon: Wine, name: 'Pub & Bar', restaurant: 'Noowe Tap House', tagline: { en: 'Tabs, rounds, no confusion.', pt: 'Comandas, rodadas, sem confusão.', es: 'Cuentas, rondas, sin confusión.' }, features: ['Digital tab with pre-auth', 'Round builder', 'Group command system', 'Happy hour auto-detection', 'Recipe book'], diff: { en: 'Pre-authorized digital tabs — no card holding, no lost tabs.', pt: 'Comandas digitais pré-autorizadas — sem confusão.', es: 'Cuentas digitales pre-autorizadas.' }, color: 'bg-yellow-100 text-yellow-700' },
  { icon: Music, name: 'Club & Nightlife', restaurant: 'NOOWE Club', tagline: { en: 'Tickets, tables, bottles — one app.', pt: 'Ingressos, mesas, garrafas — um app.', es: 'Boletos, mesas, botellas — una app.' }, features: ['3-tier ticket system', 'Anti-fraud rotating QR', 'VIP zone selection', 'Bottle service menu', 'Min. spend tracker', 'Dance floor ordering'], diff: { en: 'Anti-fraud QR codes rotate every 30 seconds — impossible to clone.', pt: 'QR codes anti-fraude rotacionam a cada 30 segundos.', es: 'QR anti-fraude rotan cada 30 segundos.' }, color: 'bg-purple-100 text-purple-700' },
];

const roles = [
  { icon: Crown, name: { en: 'Owner', pt: 'Dono', es: 'Dueño' }, desc: { en: 'Full executive control. Revenue, analytics, approvals.', pt: 'Controle executivo total. Receita, análise, aprovações.', es: 'Control ejecutivo total.' }, color: 'bg-amber-100 text-amber-700' },
  { icon: BarChart3, name: { en: 'Manager', pt: 'Gerente', es: 'Gerente' }, desc: { en: 'Day-to-day operations. Orders, stock, menu, staff.', pt: 'Operações do dia a dia. Pedidos, estoque, cardápio, equipe.', es: 'Operaciones diarias.' }, color: 'bg-blue-100 text-blue-700' },
  { icon: ConciergeBell, name: { en: 'Maitre', pt: 'Maitre', es: 'Maitre' }, desc: { en: 'Guest flow mastery. Reservations, seating, queue.', pt: 'Maestria no fluxo de clientes. Reservas, assentos, fila.', es: 'Flujo de clientes.' }, color: 'bg-violet-100 text-violet-700' },
  { icon: ChefHat, name: { en: 'Chef', pt: 'Chef', es: 'Chef' }, desc: { en: 'Kitchen command center. KDS, timing, quality.', pt: 'Centro de comando da cozinha. KDS, tempo, qualidade.', es: 'Centro de comando de cocina.' }, color: 'bg-red-100 text-red-700' },
  { icon: GlassWater, name: { en: 'Barman', pt: 'Barman', es: 'Barman' }, desc: { en: 'Bar operations. Drink queue, recipes, stock.', pt: 'Operações do bar. Fila de drinks, receitas, estoque.', es: 'Operaciones del bar.' }, color: 'bg-cyan-100 text-cyan-700' },
  { icon: Flame, name: { en: 'Cook', pt: 'Cozinheiro', es: 'Cocinero' }, desc: { en: 'Station-focused. Current dishes, prep list.', pt: 'Foco na estação. Pratos atuais, lista de preparo.', es: 'Enfoque en estación.' }, color: 'bg-orange-100 text-orange-700' },
  { icon: UserCheck, name: { en: 'Waiter', pt: 'Garçom', es: 'Mesero' }, desc: { en: 'The frontline. Tables, orders, payments.', pt: 'A linha de frente. Mesas, pedidos, pagamentos.', es: 'La primera línea.' }, color: 'bg-green-100 text-green-700' },
];

const SitePlatform: React.FC = () => {
  const { lang, t } = useLang();
  const [activeService, setActiveService] = useState<number | null>(null);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20 text-center">
        <div className="max-w-[980px] mx-auto px-5">
          <Reveal>
            <span className="text-primary text-xs font-semibold tracking-[0.08em] uppercase">{t('platform.overline')}</span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-bold mt-4 text-foreground" style={{ fontSize: 'clamp(32px, 5vw, 60px)', letterSpacing: '-0.035em', lineHeight: 1.08 }}>
              {t('platform.title')}
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto" style={{ fontSize: 'clamp(16px, 1.4vw, 21px)', lineHeight: 1.5 }}>
              {t('platform.sub')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 11 Service Types */}
      <section className="py-20 bg-card" id="services">
        <div className="max-w-[1080px] mx-auto px-5">
          <Reveal>
            <span className="text-secondary text-xs font-semibold tracking-[0.08em] uppercase">{t('platform.client_title')}</span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-bold mt-3 mb-10 text-foreground" style={{ fontSize: 'clamp(24px, 3vw, 38px)', letterSpacing: '-0.03em' }}>
              {t('services.title')}
            </h2>
          </Reveal>

          <div className="space-y-3">
            {serviceTypes.map((s, i) => {
              const isOpen = activeService === i;
              return (
                <Reveal key={i} delay={i * 30}>
                  <div
                    className="site-card cursor-pointer overflow-hidden"
                    onClick={() => setActiveService(isOpen ? null : i)}
                  >
                    <div className="flex items-center gap-4 p-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                        <s.icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-foreground font-bold text-sm">{s.name}</h4>
                        <p className="text-muted-foreground text-xs">{s.restaurant} — {s.tagline[lang]}</p>
                      </div>
                      <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isOpen && (
                      <div className="px-5 pb-5 border-t border-border pt-4 animate-fade-up">
                        <div className="grid md:grid-cols-2 gap-5">
                          <ul className="space-y-2">
                            {s.features.map((f) => (
                              <li key={f} className="text-muted-foreground text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <div className="bg-muted/50 rounded-2xl p-5">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2 font-semibold">
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
        <div className="max-w-[1080px] mx-auto px-5">
          <Reveal>
            <span className="text-primary text-xs font-semibold tracking-[0.08em] uppercase">{t('platform.ops_title')}</span>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-muted-foreground mt-3 mb-10 max-w-xl" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)', lineHeight: 1.55 }}>
              {t('platform.ops_sub')}
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {roles.map((r, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="site-card p-6 h-full">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${r.color}`}>
                    <r.icon size={20} />
                  </div>
                  <h4 className="text-foreground font-bold text-sm">{r.name[lang]}</h4>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{r.desc[lang]}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 bg-card" id="features">
        <div className="max-w-[1080px] mx-auto px-5">
          <Reveal>
            <span className="text-secondary text-xs font-semibold tracking-[0.08em] uppercase">{t('platform.cross_title')}</span>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[
              { title: lang === 'pt' ? 'Sistema de Pagamento' : 'Payment System', desc: lang === 'pt' ? 'PIX, Crédito, Apple Pay, Google Pay, TAP to Pay e Wallet. Gorjetas e pontos de fidelidade.' : 'PIX, Credit, Apple Pay, Google Pay, TAP to Pay & Wallet. Tips & loyalty points.' },
              { title: 'Split Bill', desc: lang === 'pt' ? '4 modos: por item, igual, seletivo e valor customizado.' : '4 modes: by item, equal, selective, and custom amount.' },
              { title: lang === 'pt' ? 'Rastreamento de Pedidos' : 'Order Tracking', desc: lang === 'pt' ? 'Pipeline em tempo real com atribuição do chef por prato.' : 'Real-time pipeline with chef attribution per dish.' },
              { title: lang === 'pt' ? 'Programa de Fidelidade' : 'Loyalty Program', desc: lang === 'pt' ? 'Progressão por tiers: Silver, Gold, Platinum e Black.' : 'Tier progression: Silver, Gold, Platinum & Black.' },
              { title: lang === 'pt' ? 'Simulação em Tempo Real' : 'Real-Time Simulation', desc: lang === 'pt' ? 'Pedidos avançam, notificações chegam, métricas atualizam — tudo ao vivo.' : 'Orders advance, notifications arrive, metrics update — all live.' },
              { title: lang === 'pt' ? 'Multilíngue' : 'Multilingual', desc: lang === 'pt' ? 'Suporte completo em Português, Inglês e Espanhol.' : 'Full support in Portuguese, English and Spanish.' },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="site-card p-6 h-full">
                  <h4 className="text-foreground font-bold text-sm">{f.title}</h4>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="max-w-[640px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="font-bold text-foreground" style={{ fontSize: 'clamp(26px, 3vw, 42px)', letterSpacing: '-0.03em' }}>
              {t('platform.cta_title')}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)' }}>
              {t('platform.cta_body')}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <Link
              to="/request-demo"
              className="inline-flex items-center gap-2 mt-8 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-full hover:bg-primary-dark transition-all hover:scale-[1.03] shadow-md"
            >
              {t('nav.request_demo')}
              <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default SitePlatform;
