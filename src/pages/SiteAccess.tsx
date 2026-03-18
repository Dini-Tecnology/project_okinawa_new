import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import NooweLogo from '@/components/site/NooweLogo';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SiteAccess: React.FC = () => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [showEmailInput, setShowEmailInput] = useState(!searchParams.get('email'));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const validateCode = async (digits: string[]) => {
    const codeStr = digits.join('');
    if (codeStr.length !== 6 || !email) return;

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-demo-code', {
        body: { email: email.trim().toLowerCase(), code: codeStr },
      });

      if (fnError) throw fnError;

      if (data?.valid) {
        setSuccess(true);
        setTimeout(() => navigate('/demo/intent'), 800);
      } else {
        setError(true);
        toast.error(
          lang === 'pt' ? 'Código inválido. Verifique e tente novamente.' :
          lang === 'es' ? 'Código inválido. Verifique e intente de nuevo.' :
          'Invalid code. Please check and try again.'
        );
      }
    } catch (err) {
      console.error('Verify error:', err);
      toast.error(
        lang === 'pt' ? 'Erro ao verificar. Tente novamente.' :
        lang === 'es' ? 'Error al verificar. Intente de nuevo.' :
        'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      digits.forEach((d, i) => { if (i < 6) newCode[i] = d; });
      setCode(newCode);
      setError(false);
      const lastIdx = Math.min(digits.length - 1, 5);
      inputRefs.current[lastIdx]?.focus();
      if (digits.length === 6) validateCode(newCode);
      return;
    }
    newCode[index] = value;
    setCode(newCode);
    setError(false);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newCode.every((d) => d !== '')) validateCode(newCode);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <SiteNavbar />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <NooweLogo size="lg" className="justify-center mb-14" />

          <h1 className="font-display font-bold text-3xl mb-3 text-foreground">{t('access.title')}</h1>
          <p className="text-muted-foreground text-base mb-4">{t('access.sub')}</p>

          {showEmailInput && (
            <div className="mb-8">
              <input
                type="email"
                placeholder={lang === 'pt' ? 'Seu e-mail' : lang === 'es' ? 'Tu correo' : 'Your email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center"
              />
            </div>
          )}

          <p className="text-muted-foreground/70 text-sm mb-12 max-w-xs mx-auto">{t('access.sim_note')}</p>

          <div className="flex justify-center gap-3 mb-10 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl z-10">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            )}
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                className={`w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 bg-background text-foreground focus:outline-none transition-all duration-200 ${
                  success ? 'border-success bg-success/5' : error ? 'border-destructive' : 'border-border focus:border-primary focus:ring-4 focus:ring-primary/10'
                }`}
              />
            ))}
          </div>

          <a href="/request-demo" className="text-primary text-sm font-semibold hover:underline">
            {t('access.request_new')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default SiteAccess;
