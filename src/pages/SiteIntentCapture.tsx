import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import SiteNavbar from '@/components/site/SiteNavbar';
import NooweLogo from '@/components/site/NooweLogo';
import { UtensilsCrossed, Zap, Truck, Wine, ArrowRight } from 'lucide-react';

const options = [
  { id: 'table', icon: UtensilsCrossed, titleKey: 'intent.table', descKey: 'intent.table_desc' },
  { id: 'quick', icon: Zap, titleKey: 'intent.quick', descKey: 'intent.quick_desc' },
  { id: 'delivery', icon: Truck, titleKey: 'intent.delivery', descKey: 'intent.delivery_desc' },
  { id: 'bar', icon: Wine, titleKey: 'intent.bar', descKey: 'intent.bar_desc' },
] as const;

const SiteIntentCapture: React.FC = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      localStorage.setItem('noowe-intent', selected);
      navigate('/demo');
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <SiteNavbar />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-lg w-full">
          <NooweLogo size="lg" className="justify-center mb-12" />

          <h1 className="font-display font-bold text-2xl md:text-3xl mb-2 text-foreground">
            {t('intent.title')}
          </h1>
          <p className="text-muted-foreground text-sm mb-10">{t('intent.sub')}</p>

          <div className="grid grid-cols-2 gap-3 mb-10">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isActive = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <Icon size={22} className={`mb-3 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`font-semibold text-sm mb-1 ${isActive ? 'text-foreground' : 'text-foreground'}`}>
                    {t(opt.titleKey)}
                  </p>
                  <p className="text-muted-foreground text-xs">{t(opt.descKey)}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              selected
                ? 'bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {t('intent.continue')} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteIntentCapture;
