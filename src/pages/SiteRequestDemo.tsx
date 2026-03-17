import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Check, Loader2, ArrowRight, Shield, Clock, Users } from 'lucide-react';

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`noowe-reveal ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const SiteRequestDemo: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const [form, setForm] = useState({ name: '', restaurant: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const validate = () => {
    const e: Record<string, boolean> = {};
    if (!form.name.trim()) e.name = true;
    if (!form.restaurant.trim()) e.restaurant = true;
    if (!form.email.trim() || !form.email.includes('@')) e.email = true;
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-4 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
      errors[field] ? 'border-destructive' : 'border-border'
    }`;

  const benefits = [
    { icon: Clock, text: lang === 'pt' ? 'Acesso em menos de 24h' : lang === 'es' ? 'Acceso en menos de 24h' : 'Access in less than 24h' },
    { icon: Shield, text: lang === 'pt' ? 'Sem cartão de crédito' : lang === 'es' ? 'Sin tarjeta de crédito' : 'No credit card required' },
    { icon: Users, text: lang === 'pt' ? 'Plataforma completa' : lang === 'es' ? 'Plataforma completa' : 'Full platform access' },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteNavbar />

      <section className="pt-32 pb-20 min-h-screen flex items-center">
        <div className="max-w-[1100px] mx-auto px-6 w-full">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                  <span className="text-primary font-medium text-sm">{t('rdemo.overline')}</span>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="font-display font-bold text-foreground" style={{ fontSize: 'clamp(34px, 5vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.1 }}>
                  {t('rdemo.title')}
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-muted-foreground mt-6 max-w-md text-lg leading-relaxed">
                  {t('rdemo.sub')}
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-10 space-y-4">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/8 text-primary flex items-center justify-center flex-shrink-0">
                        <b.icon size={18} />
                      </div>
                      <span className="text-foreground text-sm font-medium">{b.text}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <div>
              {!submitted ? (
                <Reveal delay={200}>
                  <div className="bg-background rounded-2xl border border-border p-8 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input autoFocus type="text" placeholder={t('rdemo.name')} value={form.name}
                        onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: false }); }}
                        className={inputClass('name')} />
                      <input type="text" placeholder={t('rdemo.restaurant')} value={form.restaurant}
                        onChange={(e) => { setForm({ ...form, restaurant: e.target.value }); setErrors({ ...errors, restaurant: false }); }}
                        className={inputClass('restaurant')} />
                      <input type="email" placeholder={t('rdemo.email')} value={form.email}
                        onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: false }); }}
                        className={inputClass('email')} />
                      <input type="tel" placeholder={t('rdemo.phone')} value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={inputClass('phone')} />
                      <button type="submit" disabled={loading}
                        className="group w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-glow">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                        {t('rdemo.submit')}
                        {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
                      </button>
                    </form>
                  </div>
                </Reveal>
              ) : (
                <Reveal>
                  <div className="bg-background rounded-2xl border border-border p-10 text-center shadow-lg">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 mb-6">
                      <Check size={32} className="text-success" />
                    </div>
                    <h2 className="font-display font-bold text-xl mb-3 text-foreground">{t('rdemo.success_title')}</h2>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{t('rdemo.success_body')}</p>
                    <button
                      onClick={() => navigate('/access')}
                      className="group w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-glow mb-4"
                    >
                      {lang === 'pt' ? 'Inserir código de acesso' : lang === 'es' ? 'Ingresar código de acceso' : 'Enter access code'}
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <button className="text-primary text-sm font-semibold hover:underline">{t('rdemo.resend')}</button>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default SiteRequestDemo;
