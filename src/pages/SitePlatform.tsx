import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  ArrowRight, Star, Zap, Salad, Coffee, UtensilsCrossed, Truck,
  ChefHat, Utensils, Wine, Music, Crown, BarChart3, ConciergeBell,
  CookingPot, GlassWater, Flame, UserCheck
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
  { icon: Star, name: 'Fine Dining', restaurant: 'Bistrô Noowe', tagline: { en: 'Premium gastronomy meets intelligent technology', pt: 'Gastronomia premium encontra tecnologia inteligente', es: 'Gastronomía premium conoce la tecnología inteligente' }, journey: '11 steps, 18 screens', features: ['AI-powered wine & food harmonization', 'Digital sommelier call', '4-mode split bill', 'Multi-guest proxy ordering', 'Course-by-course tracking', 'Tier loyalty (Silver→Platinum→Black)'], diff: { en: 'The only system where AI recommends the perfect pairing across 430+ combinations.', pt: 'O único sistema onde IA recomenda o harmonização perfeita entre 430+ combinações.', es: 'El único sistema donde la IA recomienda el maridaje perfecto entre 430+ combinaciones.' }, gradient: 'from-rose-900 to-amber-900' },
  { icon: Zap, name: 'Quick Service', restaurant: 'NOOWE Express', tagline: { en: 'Order ahead. Skip the line. No friction.', pt: 'Peça antes. Pule a fila. Sem atrito.', es: 'Pide antes. Salta la fila. Sin fricción.' }, journey: '8 steps, 9 screens', features: ['Skip the Line pre-ordering', '3-tier combo builder', 'Item customization', '4-stage prep tracking', '3-digit pickup code', 'Stamp card loyalty'], diff: { en: 'Quality Check stage ensures every order is verified before handoff.', pt: 'Etapa Quality Check garante que cada pedido é verificado antes da entrega.', es: 'La etapa Quality Check verifica cada pedido antes de la entrega.' }, gradient: 'from-yellow-500 to-orange-500' },
  { icon: Salad, name: 'Fast Casual', restaurant: 'NOOWE Fresh', tagline: { en: 'Build your perfect meal in 4 steps.', pt: 'Monte sua refeição perfeita em 4 etapas.', es: 'Arma tu comida perfecta en 4 pasos.' }, journey: '7 steps, 12 screens', features: ['4-step dish builder', 'Real-time calorie tracking', 'Allergen alerts', 'Saved bowls', 'Nutritional summary'], diff: { en: 'Every ingredient shows calories, protein, carbs, and fiber — updated in real time.', pt: 'Cada ingrediente mostra calorias, proteínas, carboidratos e fibras — atualizado em tempo real.', es: 'Cada ingrediente muestra calorías, proteínas, carbohidratos y fibra — en tiempo real.' }, gradient: 'from-green-500 to-emerald-500' },
  { icon: Coffee, name: 'Café & Bakery', restaurant: 'Café Noowe', tagline: { en: 'Stay longer. Work better. Refill smarter.', pt: 'Fique mais. Trabalhe melhor. Refil inteligente.', es: 'Quédate más. Trabaja mejor. Refill inteligente.' }, journey: '6 steps, 9 screens', features: ['Work Mode (Wi-Fi, outlets, noise)', 'Smart refill with auto-discounts', 'Stay timer', 'Loyalty stamp card'], diff: { en: 'Work Mode shows real-time Wi-Fi speed, available outlets, and ambient noise level.', pt: 'Work Mode mostra velocidade de Wi-Fi, tomadas e nível de ruído em tempo real.', es: 'Work Mode muestra velocidad Wi-Fi, enchufes y nivel de ruido en tiempo real.' }, gradient: 'from-amber-700 to-orange-800' },
  { icon: UtensilsCrossed, name: 'Buffet', restaurant: 'Sabores Noowe', tagline: { en: 'Eat what you want. Pay what\'s fair.', pt: 'Coma o que quiser. Pague o que é justo.', es: 'Come lo que quieras. Paga lo justo.' }, journey: '7 steps, 10 screens', features: ['NFC smart scale', 'Weight→Price auto-calc', 'Live station tracking', 'Buffet plate history'], diff: { en: 'NFC-enabled smart scale converts plate weight to price instantly.', pt: 'Balança inteligente NFC converte peso do prato em preço instantaneamente.', es: 'Balanza inteligente NFC convierte peso del plato en precio al instante.' }, gradient: 'from-orange-500 to-red-500' },
  { icon: Truck, name: 'Drive-Thru', restaurant: 'NOOWE Drive', tagline: { en: 'Your order starts before you arrive.', pt: 'Seu pedido começa antes de você chegar.', es: 'Tu pedido empieza antes de que llegues.' }, journey: '7 steps, 11 screens', features: ['GPS geofencing at 500m', 'Pre-order & pre-pay', 'Real-time ETA', 'Lane assignment'], diff: { en: 'GPS geofencing triggers kitchen prep 500m away — food is ready when you arrive.', pt: 'Geofencing GPS aciona a cozinha a 500m — comida pronta quando você chega.', es: 'Geofencing GPS activa la cocina a 500m — comida lista cuando llegas.' }, gradient: 'from-blue-500 to-cyan-500' },
  { icon: Truck, name: 'Food Truck', restaurant: 'Taco Noowe', tagline: { en: 'Find us anywhere. Order from everywhere.', pt: 'Nos encontre em qualquer lugar. Peça de qualquer lugar.', es: 'Encuéntranos donde sea. Pide desde donde sea.' }, journey: '7 steps, 12 screens', features: ['Real-time truck location map', 'Virtual queue', 'Push notifications', 'Schedule & route viewer'], diff: { en: 'Real-time map shows exactly where the truck is, with virtual queue.', pt: 'Mapa em tempo real mostra exatamente onde o truck está, com fila virtual.', es: 'Mapa en tiempo real muestra exactamente dónde está el truck.' }, gradient: 'from-lime-500 to-green-500' },
  { icon: ChefHat, name: "Chef's Table", restaurant: 'Mesa do Chef Noowe', tagline: { en: 'A tasting journey, not just a meal.', pt: 'Uma jornada degustativa, não apenas uma refeição.', es: 'Un viaje de degustación, no solo una comida.' }, journey: '9 steps, 13 screens', features: ['Course-by-course tasting menu', 'Wine pairing notes per course', 'Chef interaction moments', 'Dietary adaptation per guest'], diff: { en: 'Each course arrives with sommelier notes, chef\'s story, and dietary adaptations in real time.', pt: 'Cada prato chega com notas do sommelier, história do chef e adaptações dietéticas em tempo real.', es: 'Cada plato llega con notas del sommelier y la historia del chef.' }, gradient: 'from-zinc-800 to-stone-700' },
  { icon: Utensils, name: 'Casual Dining', restaurant: 'Cantina Noowe', tagline: { en: 'Tables, families, celebrations — effortlessly managed.', pt: 'Mesas, famílias, celebrações — gerenciados sem esforço.', es: 'Mesas, familias, celebraciones — sin esfuerzo.' }, journey: '9 steps, 15 screens', features: ['Smart waitlist with pre-ordering', 'Family Mode', 'Multi-table party management', 'Birthday detection'], diff: { en: 'Smart Waitlist lets guests pre-order while waiting — food arrives faster once seated.', pt: 'Smart Waitlist permite pré-pedido durante a espera — comida chega mais rápido ao sentar.', es: 'Smart Waitlist permite pedir mientras esperas.' }, gradient: 'from-red-500 to-orange-500' },
  { icon: Wine, name: 'Pub & Bar', restaurant: 'Noowe Tap House', tagline: { en: 'Open a tab. Build a round. Keep the night going.', pt: 'Abra uma comanda. Monte uma rodada. A noite continua.', es: 'Abre una cuenta. Arma una ronda.' }, journey: '9 steps, 15 screens', features: ['Digital tab with pre-auth', 'Round builder', 'Group command system', 'Happy hour auto-detection', 'Drink recipe book'], diff: { en: 'Pre-authorized digital tabs — no card holding, no confusion, no lost tabs — ever.', pt: 'Comandas digitais pré-autorizadas — sem confusão, sem comandas perdidas.', es: 'Cuentas digitales pre-autorizadas — sin confusión.' }, gradient: 'from-amber-600 to-yellow-700' },
  { icon: Music, name: 'Club & Nightlife', restaurant: 'NOOWE Club', tagline: { en: 'Tickets, tables, bottles, dance floor — one app.', pt: 'Ingressos, mesas, garrafas, pista — um app.', es: 'Boletos, mesas, botellas, pista — una app.' }, journey: '9 steps, 18 screens', features: ['3-tier ticket system', 'Anti-fraud animated QR', 'VIP camarote selection', 'Bottle service menu', 'Min. spend tracker', 'Dance floor ordering', 'Uber integration'], diff: { en: 'Anti-fraud QR codes rotate every 30 seconds — impossible to clone.', pt: 'QR codes anti-fraude rotacionam a cada 30 segundos — impossível clonar.', es: 'QR anti-fraude rotan cada 30 segundos — imposible clonar.' }, gradient: 'from-purple-600 to-pink-600' },
];

const roles = [
  { icon: Crown, name: { en: 'Owner', pt: 'Dono', es: 'Dueño' }, emoji: '👑', screens: 9, desc: { en: 'Full executive control. Revenue, analytics, approvals.', pt: 'Controle executivo total. Receita, análise, aprovações.', es: 'Control ejecutivo total.' } },
  { icon: BarChart3, name: { en: 'Manager', pt: 'Gerente', es: 'Gerente' }, emoji: '📊', screens: 7, desc: { en: 'Day-to-day operations. Orders, stock, menu, staff.', pt: 'Operações do dia a dia. Pedidos, estoque, cardápio, equipe.', es: 'Operaciones diarias.' } },
  { icon: ConciergeBell, name: { en: 'Maitre', pt: 'Maitre', es: 'Maitre' }, emoji: '🎩', screens: 3, desc: { en: 'Guest flow mastery. Reservations, seating, queue.', pt: 'Maestria no fluxo de clientes. Reservas, assentos, fila.', es: 'Flujo de clientes.' } },
  { icon: ChefHat, name: { en: 'Chef', pt: 'Chef', es: 'Chef' }, emoji: '👨‍🍳', screens: 3, desc: { en: 'Kitchen command center. KDS, timing, quality.', pt: 'Centro de comando da cozinha. KDS, tempo, qualidade.', es: 'Centro de comando de cocina.' } },
  { icon: GlassWater, name: { en: 'Barman', pt: 'Barman', es: 'Barman' }, emoji: '🍸', screens: 4, desc: { en: 'Bar operations. Drink queue, recipes, stock.', pt: 'Operações do bar. Fila de drinks, receitas, estoque.', es: 'Operaciones del bar.' } },
  { icon: Flame, name: { en: 'Cook', pt: 'Cozinheiro', es: 'Cocinero' }, emoji: '🔥', screens: 2, desc: { en: 'Station-focused. Current dishes, prep list.', pt: 'Foco na estação. Pratos atuais, lista de preparo.', es: 'Enfoque en estación.' } },
  { icon: UserCheck, name: { en: 'Waiter', pt: 'Garçom', es: 'Mesero' }, emoji: '🤵', screens: 6, desc: { en: 'The frontline interface. Tables, orders, payments.', pt: 'A interface da linha de frente. Mesas, pedidos, pagamentos.', es: 'La interfaz de primera línea.' } },
];

const SitePlatform: React.FC = () => {
  const { lang, t } = useLang();
  const [activeService, setActiveService] = useState<number | null>(null);

  return (
    <div className="bg-noowe-bg text-noowe-t1 font-noowe min-h-screen">
      <SiteNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20 text-center">
        <div className="max-w-[980px] mx-auto px-5">
          <Reveal>
            <span className="text-noowe-blue text-xs font-semibold tracking-[0.07em] uppercase">{t('platform.overline')}</span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-bold mt-4" style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', letterSpacing: '-0.035em', lineHeight: 1.06 }}>
              {t('platform.title')}
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-noowe-t2 mt-4 max-w-xl mx-auto" style={{ fontSize: 'clamp(17px, 1.6vw, 24px)', lineHeight: 1.4 }}>
              {t('platform.sub')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 11 Service Types */}
      <section className="py-20" id="services">
        <div className="max-w-[1120px] mx-auto px-5">
          <Reveal>
            <span className="text-noowe-cyan text-xs font-semibold tracking-[0.07em] uppercase">{t('platform.client_title')}</span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-bold mt-3 mb-10" style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', letterSpacing: '-0.03em' }}>
              {t('services.title')}
            </h2>
          </Reveal>

          <div className="space-y-3">
            {serviceTypes.map((s, i) => {
              const isOpen = activeService === i;
              return (
                <Reveal key={i} delay={i * 40}>
                  <div
                    className="noowe-card cursor-pointer overflow-hidden"
                    style={{ borderRadius: 20 }}
                    onClick={() => setActiveService(isOpen ? null : i)}
                  >
                    {/* Collapsed */}
                    <div className="flex items-center gap-4 p-5 md:p-6">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center flex-shrink-0`}>
                        <s.icon size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-noowe-t1 font-bold text-base">{s.name}</h4>
                        <p className="text-noowe-t3 text-xs">{s.restaurant} — {s.tagline[lang]}</p>
                      </div>
                      <div className="hidden md:flex gap-1.5">
                        {s.features.slice(0, 3).map((f) => (
                          <span key={f} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/[0.06] text-noowe-t3">{f}</span>
                        ))}
                      </div>
                      <span className={`text-noowe-t3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                    </div>

                    {/* Expanded */}
                    {isOpen && (
                      <div className="px-5 pb-6 md:px-6 border-t border-white/[0.04] pt-5 animate-fade-up">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-noowe-t3 text-xs uppercase tracking-wider mb-2">Journey: {s.journey}</p>
                            <ul className="space-y-1.5">
                              {s.features.map((f) => (
                                <li key={f} className="text-noowe-t2 text-sm flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full bg-noowe-blue flex-shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-white/[0.03] rounded-2xl p-5">
                            <p className="text-noowe-t3 text-xs uppercase tracking-wider mb-2">Differentiator</p>
                            <p className="text-noowe-t1 text-sm leading-relaxed">{s.diff[lang]}</p>
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
        <div className="max-w-[1120px] mx-auto px-5">
          <Reveal>
            <span className="text-noowe-purple text-xs font-semibold tracking-[0.07em] uppercase">{t('platform.ops_title')}</span>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-noowe-t2 mt-3 mb-10 max-w-xl" style={{ fontSize: 'clamp(15px, 1.1vw, 19px)', lineHeight: 1.55 }}>
              {t('platform.ops_sub')}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {roles.map((r, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="noowe-card p-6 h-full" style={{ borderRadius: 20 }}>
                  <div className="text-3xl mb-3">{r.emoji}</div>
                  <h4 className="text-noowe-t1 font-bold text-base">{r.name[lang]}</h4>
                  <p className="text-noowe-t3 text-xs mt-1">{r.screens} screens</p>
                  <p className="text-noowe-t2 text-sm mt-3 leading-relaxed">{r.desc[lang]}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-cutting features */}
      <section className="py-20" id="features">
        <div className="max-w-[1120px] mx-auto px-5">
          <Reveal>
            <span className="text-noowe-green text-xs font-semibold tracking-[0.07em] uppercase">{t('platform.cross_title')}</span>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[
              { title: 'Payment System', desc: '6 methods: PIX, Credit, Apple Pay, Google Pay, TAP to Pay, Wallet. Tips & loyalty points.' },
              { title: 'Split Bill', desc: '4 modes: by item, equal, selective, custom amount. Multi-guest tracking.' },
              { title: 'Order Tracking', desc: 'Real-time pipeline with chef attribution per dish.' },
              { title: 'Loyalty Program', desc: 'Tier progression: Silver → Gold → Platinum → Black.' },
              { title: 'i18n', desc: 'Full trilingual support: PT-BR, EN, ES.' },
              { title: 'Real-Time Simulation', desc: 'Orders advance, notifications arrive, metrics update — even during the demo.' },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="noowe-card p-6 h-full" style={{ borderRadius: 20 }}>
                  <h4 className="text-noowe-t1 font-bold text-sm">{f.title}</h4>
                  <p className="text-noowe-t2 text-sm mt-2 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32">
        <div className="max-w-[720px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', letterSpacing: '-0.03em' }}>
              {t('platform.cta_title')}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-noowe-t2 mt-4 max-w-lg mx-auto" style={{ fontSize: 'clamp(15px, 1.1vw, 19px)', lineHeight: 1.55 }}>
              {t('platform.cta_body')}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <Link
              to="/request-demo"
              className="inline-flex items-center gap-2 mt-8 bg-noowe-blue text-white font-medium px-8 py-3.5 rounded-full hover:bg-[#0077ed] transition-all hover:scale-[1.03]"
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
