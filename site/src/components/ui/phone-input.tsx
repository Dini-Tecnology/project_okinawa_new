import React, { useState, useRef, useEffect, useMemo, forwardRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Country {
  code: string;   // ISO 3166 alpha-2
  dial: string;   // e.g. "+55"
  flag: string;   // emoji flag
  name: string;
  mask: string;   // e.g. "(##) #####-####"
}

const COUNTRIES: Country[] = [
  { code: 'BR', dial: '+55', flag: '🇧🇷', name: 'Brasil', mask: '(##) #####-####' },
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States', mask: '(###) ###-####' },
  { code: 'PT', dial: '+351', flag: '🇵🇹', name: 'Portugal', mask: '### ### ###' },
  { code: 'ES', dial: '+34', flag: '🇪🇸', name: 'España', mask: '### ## ## ##' },
  { code: 'AR', dial: '+54', flag: '🇦🇷', name: 'Argentina', mask: '## ####-####' },
  { code: 'MX', dial: '+52', flag: '🇲🇽', name: 'México', mask: '## #### ####' },
  { code: 'CO', dial: '+57', flag: '🇨🇴', name: 'Colombia', mask: '### ### ####' },
  { code: 'CL', dial: '+56', flag: '🇨🇱', name: 'Chile', mask: '# #### ####' },
  { code: 'PE', dial: '+51', flag: '🇵🇪', name: 'Perú', mask: '### ### ###' },
  { code: 'UY', dial: '+598', flag: '🇺🇾', name: 'Uruguay', mask: '## ### ###' },
  { code: 'PY', dial: '+595', flag: '🇵🇾', name: 'Paraguay', mask: '### ### ###' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom', mask: '#### ######' },
  { code: 'FR', dial: '+33', flag: '🇫🇷', name: 'France', mask: '# ## ## ## ##' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', name: 'Deutschland', mask: '### #######' },
  { code: 'IT', dial: '+39', flag: '🇮🇹', name: 'Italia', mask: '### ### ####' },
  { code: 'JP', dial: '+81', flag: '🇯🇵', name: '日本', mask: '##-####-####' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE', mask: '## ### ####' },
  { code: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia', mask: '### ### ###' },
  { code: 'CA', dial: '+1', flag: '🇨🇦', name: 'Canada', mask: '(###) ###-####' },
  { code: 'IN', dial: '+91', flag: '🇮🇳', name: 'India', mask: '##### #####' },
];

function applyMask(value: string, mask: string): string {
  const digits = value.replace(/\D/g, '');
  let result = '';
  let di = 0;
  for (let i = 0; i < mask.length && di < digits.length; i++) {
    if (mask[i] === '#') {
      result += digits[di++];
    } else {
      result += mask[i];
    }
  }
  return result;
}

function maxDigits(mask: string): number {
  return (mask.match(/#/g) || []).length;
}

interface PhoneInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
}

const PhoneInput = forwardRef<HTMLDivElement, PhoneInputProps>(({ value, onChange, placeholder, className = '', hasError }, ref) => {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]); // BR default
  const [localNumber, setLocalNumber] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (dropdownOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [dropdownOpen]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const limited = raw.slice(0, maxDigits(country.mask));
    const masked = applyMask(limited, country.mask);
    setLocalNumber(masked);
    onChange(`${country.dial} ${masked}`);
  };

  const selectCountry = (c: Country) => {
    setCountry(c);
    setDropdownOpen(false);
    setSearch('');
    // Re-apply mask with new country
    const raw = localNumber.replace(/\D/g, '');
    const limited = raw.slice(0, maxDigits(c.mask));
    const masked = applyMask(limited, c.mask);
    setLocalNumber(masked);
    onChange(`${c.dial} ${masked}`);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className={`flex items-center w-full rounded-xl border bg-background transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary ${hasError ? 'border-destructive' : 'border-border'}`}>
        {/* Country selector */}
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 pl-4 pr-2 py-4 text-sm flex-shrink-0 hover:bg-muted/50 rounded-l-xl transition-colors"
        >
          <span className="text-xl leading-none">{country.flag}</span>
          <span className="text-muted-foreground font-medium text-sm">{country.dial}</span>
          <ChevronDown size={14} className={`text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="w-px h-6 bg-border flex-shrink-0" />

        {/* Number input */}
        <input
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={country.mask.replace(/#/g, '0')}
          className="flex-1 px-3 py-4 bg-transparent text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none"
        />
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-scale-in">
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50">
              <Search size={14} className="text-muted-foreground flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto scrollbar-thin">
            {filteredCountries.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => selectCountry(c)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                  c.code === country.code ? 'bg-primary/5 text-primary font-medium' : 'text-foreground'
                }`}
              >
                <span className="text-lg">{c.flag}</span>
                <span className="flex-1 text-left">{c.name}</span>
                <span className="text-muted-foreground text-xs">{c.dial}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhum país encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

PhoneInput.displayName = 'PhoneInput';
export default PhoneInput;
