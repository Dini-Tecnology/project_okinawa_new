import React, { useState, useEffect, ReactNode } from 'react';
import { LangContext, detectLang, setLang as persistLang, t as translate } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

const LangProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = (l: Lang) => {
    persistLang(l);
    setLangState(l);
  };

  const tFn = (key: string) => translate(key, lang);

  return (
    <LangContext.Provider value={{ lang, setLang, t: tFn }}>
      {children}
    </LangContext.Provider>
  );
};

export default LangProvider;
