import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

interface WaitlistCardProps {
  compact?: boolean;
  className?: string;
}

const WaitlistCard: React.FC<WaitlistCardProps> = ({ compact = false, className = '' }) => {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase
      .from('waitlist')
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), city: city.trim() || null });

    if (error) {
      if (error.code === '23505') {
        setErrorMsg(t('waitlist.already'));
      } else {
        setErrorMsg(t('waitlist.error'));
      }
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <div className={`rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Check size={24} className="text-primary" />
        </div>
        <h3 className="font-display font-bold text-foreground text-lg mb-2">{t('waitlist.success_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('waitlist.success_body')}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <input
          type="text"
          required
          placeholder={t('waitlist.name_placeholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
        />
        <input
          type="email"
          required
          placeholder={t('waitlist.email_placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
        >
          {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <>{t('waitlist.cta')} <ArrowRight size={14} /></>}
        </button>
        {status === 'error' && <p className="text-destructive text-xs sm:col-span-full">{errorMsg}</p>}
      </form>
    );
  }

  return (
    <div className={`rounded-2xl border border-border bg-background p-8 ${className}`}>
      <h3 className="font-display font-bold text-foreground text-xl mb-2">{t('waitlist.title')}</h3>
      <p className="text-muted-foreground text-sm mb-6">{t('waitlist.sub')}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          placeholder={t('waitlist.name_placeholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
        />
        <input
          type="email"
          required
          placeholder={t('waitlist.email_placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
        />
        <input
          type="text"
          placeholder={t('waitlist.city_placeholder')}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
        />

        {status === 'error' && <p className="text-destructive text-sm">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-[var(--shadow-glow)]"
        >
          {status === 'loading' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>{t('waitlist.cta')} <ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default WaitlistCard;
