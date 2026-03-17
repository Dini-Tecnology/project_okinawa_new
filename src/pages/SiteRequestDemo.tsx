import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3.5 rounded-xl border bg-noowe-bg3 text-noowe-t1 text-sm placeholder:text-noowe-t4 focus:outline-none focus:border-noowe-blue transition-colors ${
      errors[field] ? 'border-noowe-red' : 'border-white/[0.06]'
    }`;

  return (
    <div className="bg-noowe-bg text-noowe-t1 font-noowe min-h-screen">
      <SiteNavbar />

      <section className="pt-28 pb-20 min-h-screen flex items-center">
        <div className="max-w-[980px] mx-auto px-5 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <Reveal>
                <span className="text-noowe-blue text-xs font-semibold tracking-[0.07em] uppercase">{t('rdemo.overline')}</span>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="font-bold mt-4" style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', letterSpacing: '-0.035em', lineHeight: 1.06 }}>
                  {t('rdemo.title')}
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="text-noowe-t2 mt-4 max-w-md" style={{ fontSize: 'clamp(15px, 1.1vw, 19px)', lineHeight: 1.55 }}>
                  {t('rdemo.sub')}
                </p>
              </Reveal>
            </div>

            {/* Right — Form */}
            <div>
              {!submitted ? (
                <Reveal delay={300}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        autoFocus
                        type="text"
                        placeholder={t('rdemo.name')}
                        value={form.name}
                        onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: false }); }}
                        className={inputClass('name')}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder={t('rdemo.restaurant')}
                        value={form.restaurant}
                        onChange={(e) => { setForm({ ...form, restaurant: e.target.value }); setErrors({ ...errors, restaurant: false }); }}
                        className={inputClass('restaurant')}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder={t('rdemo.email')}
                        value={form.email}
                        onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: false }); }}
                        className={inputClass('email')}
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder={t('rdemo.phone')}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={inputClass('phone')}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-full bg-noowe-blue text-white font-medium text-sm hover:bg-[#0077ed] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                      {t('rdemo.submit')}
                    </button>
                  </form>
                </Reveal>
              ) : (
                <Reveal>
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-noowe-green/20 mb-6">
                      <Check size={32} className="text-noowe-green" />
                    </div>
                    <h2 className="font-bold text-2xl mb-2">{t('rdemo.success_title')}</h2>
                    <p className="text-noowe-t2 text-sm mb-6">{t('rdemo.success_body')}</p>
                    <button className="text-noowe-blue text-sm hover:underline">{t('rdemo.resend')}</button>
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
