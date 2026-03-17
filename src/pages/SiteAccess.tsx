import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import NooweLogo from '@/components/site/NooweLogo';

const SiteAccess: React.FC = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Prefill from URL param
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && urlCode.length === 6) {
      setCode(urlCode.split(''));
      validateCode(urlCode.split(''));
    }
  }, []);

  const validateCode = (digits: string[]) => {
    const joined = digits.join('');
    if (joined.length === 6) {
      // For demo: accept any 6 digits
      setSuccess(true);
      setTimeout(() => navigate('/demo'), 800);
    }
  };

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    
    // Handle paste
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

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d !== '')) {
      validateCode(newCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="bg-noowe-bg text-noowe-t1 font-noowe min-h-screen flex flex-col">
      <SiteNavbar />

      <div className="flex-1 flex items-center justify-center px-5">
        <div className={`text-center max-w-md ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          <NooweLogo size="md" className="justify-center mb-10" />
          
          <h1 className="font-bold text-2xl mb-2">{t('access.title')}</h1>
          <p className="text-noowe-t2 text-sm mb-10">{t('access.sub')}</p>

          <div className="flex justify-center gap-3 mb-8">
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
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border bg-noowe-bg3 text-noowe-t1 focus:outline-none transition-all ${
                  success ? 'border-noowe-green' : error ? 'border-noowe-red' : 'border-white/[0.06] focus:border-noowe-blue'
                }`}
              />
            ))}
          </div>

          <a href="/request-demo" className="text-noowe-blue text-sm hover:underline">
            {t('access.request_new')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default SiteAccess;
