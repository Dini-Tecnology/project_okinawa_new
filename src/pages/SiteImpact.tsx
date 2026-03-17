import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { CheckCircle2, ArrowRight, Compass, Zap } from 'lucide-react';

const SiteImpact: React.FC = () => {
  const { t } = useLang();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const bullets = [
    t('impact.bullet1'),
    t('impact.bullet2'),
    t('impact.bullet3'),
  ];

  return (
    <div className="bg-foreground text-white min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[180px] opacity-60"
          style={{
            background: 'radial-gradient(circle, hsl(14 100% 57% / 0.1), transparent 70%)',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      <div className={`relative z-10 text-center max-w-lg px-6 transition-all duration-1000 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Success pulse */}
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-10 animate-scale-in">
          <Zap size={28} className="text-success" />
        </div>

        <h1 className="font-bold text-white mb-3" style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          {t('impact.title')}
        </h1>
        <p className="text-white/40 mb-12" style={{ fontSize: 'clamp(15px, 1.2vw, 18px)' }}>
          {t('impact.subtitle')}
        </p>

        {/* Bullets */}
        <div className="flex flex-col gap-4 items-start max-w-xs mx-auto mb-14">
          {bullets.map((b, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-700 ${entered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: `${600 + i * 200}ms` }}
            >
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <CheckCircle2 size={12} className="text-primary" />
              </div>
              <span className="text-white/70 font-medium text-sm">{b}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`transition-all duration-700 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '1200ms' }}
        >
          <Link
            to="/request-demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-[0_0_40px_hsl(14_100%_57%/0.25)] hover:shadow-[0_0_60px_hsl(14_100%_57%/0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {t('impact.cta')} <ArrowRight size={16} />
          </Link>

          <div className="mt-6">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 text-white/30 text-sm hover:text-white/50 transition-colors"
            >
              <Compass size={14} /> {t('impact.explore')}
            </Link>
          </div>
        </div>

        {/* Tagline */}
        <p className={`mt-20 text-white/15 text-xs tracking-[0.2em] uppercase transition-all duration-1000 ${entered ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '1600ms' }}
        >
          {t('impact.tagline')}
        </p>
      </div>
    </div>
  );
};

export default SiteImpact;
