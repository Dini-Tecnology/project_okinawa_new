import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Check, Loader2 } from 'lucide-react';

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`noowe-reveal ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const SiteRequestDemo: React.FC = () => {
  const { t } = useLang();
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
    `w-full px-4 py-3.5 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
      errors[field] ? 'border-destructive' : 'border-border'
    }`;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteNavbar />

      <section className="pt-28 pb-20 min-h-screen flex items-center">
        <div className="max-w-[960px] mx-auto px-6 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Reveal>
                <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-4">{t('rdemo.overline')}</p>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="font-bold text-foreground" style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.1 }}>
                  {t('rdemo.title')}
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-muted-foreground mt-5 max-w-md" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)', lineHeight: 1.6 }}>
                  {t('rdemo.sub')}
                </p>
              </Reveal>
            </div>

            <div>
              {!submitted ? (
                <Reveal delay={240}>
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
                      className="w-full py-3.5 rounded-lg bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                      {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                      {t('rdemo.submit')}
                    </button>
                  </form>
                </Reveal>
              ) : (
                <Reveal>
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/10 mb-6">
                      <Check size={28} className="text-success" />
                    </div>
                    <h2 className="font-bold text-xl mb-2 text-foreground">{t('rdemo.success_title')}</h2>
                    <p className="text-muted-foreground text-sm mb-6">{t('rdemo.success_body')}</p>
                    <button className="text-primary text-sm font-medium hover:underline">{t('rdemo.resend')}</button>
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
