import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, useTranslation } from '../lib/i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: ReturnType<typeof useTranslation>;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ru');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.lang === 'tj' || user.lang === 'ru') {
        setLangState(user.lang);
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      user.lang = newLang;
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const t = useTranslation(lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useAppLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useAppLanguage must be used within LanguageProvider');
  }
  return context;
}
