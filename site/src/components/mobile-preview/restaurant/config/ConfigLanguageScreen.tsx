import { FC, useState } from 'react';
import { ChevronLeft, Save } from "lucide-react";
import { useMobilePreview } from '../../context/MobilePreviewContext';

const LANGUAGES = [
  { code: 'pt-BR', flag: '🇧🇷', name: 'Português (Brasil)' },
  { code: 'en-US', flag: '🇺🇸', name: 'English (US)' },
  { code: 'es-ES', flag: '🇪🇸', name: 'Español' },
];

const CURRENCIES = [
  { value: 'BRL', label: 'R$ (Real)' },
  { value: 'USD', label: '$ (Dólar)' },
  { value: 'EUR', label: '€ (Euro)' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA' },
  { value: 'YYYY-MM-DD', label: 'AAAA-MM-DD' },
];

export const ConfigLanguageScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [lang, setLang] = useState('pt-BR');
  const [currency, setCurrency] = useState('BRL');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('config-hub')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Idioma & Regional</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Idioma do App</h3>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} className="w-full flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xl">{l.flag}</span>
                <span className="text-sm text-foreground">{l.name}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${lang === l.code ? 'border-primary' : 'border-border'}`}>
                {lang === l.code && <div className="w-3 h-3 rounded-full bg-primary" />}
              </div>
            </button>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Moeda</h3>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map(c => (
              <button key={c.value} onClick={() => setCurrency(c.value)}
                className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-colors ${currency === c.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-border'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Formato de Data</h3>
          <div className="flex flex-wrap gap-2">
            {DATE_FORMATS.map(d => (
              <button key={d.value} onClick={() => setDateFormat(d.value)}
                className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-colors ${dateFormat === d.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-border'}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  );
};
