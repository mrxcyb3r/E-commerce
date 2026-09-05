import React, { createContext, useContext, useMemo, ReactNode, useEffect, useState } from 'react';
import { translations, LanguageCode } from './translations';

type TranslationSection = keyof typeof translations.uz;

interface I18nContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (section: TranslationSection, key: string, ...args: unknown[]) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

type FlatDict = Record<string, string>;

function flatten(langDict: Record<string, unknown>, prefix = ''): FlatDict {
  const result: FlatDict = {};
  for (const [key, value] of Object.entries(langDict)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[path] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flatten(value as Record<string, unknown>, path));
    } else if (typeof value === 'function') {
      result[path] = value as unknown as string;
    }
  }
  return result;
}

const FLAT: Record<LanguageCode, FlatDict> = {
  uz: flatten(translations.uz as unknown as Record<string, unknown>),
  ru: flatten(translations.ru as unknown as Record<string, unknown>),
  en: flatten(translations.en as unknown as Record<string, unknown>),
};

export const I18nProvider: React.FC<{ children: ReactNode; language?: LanguageCode }> = ({ children, language = 'uz' }) => {
  const [lang, setLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('app_language') as LanguageCode | null;
      if (saved && saved in translations) return saved;
    } catch {}
    return language;
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nContextType>(() => {
    const dict = FLAT[lang] ?? FLAT.uz;
    return {
      lang,
      setLang: (l) => {
        setLang(l);
        try {
          localStorage.setItem('app_language', l);
        } catch {}
      },
      t: (section, key, ...args) => {
        const fullKey = `${String(section)}.${String(key)}`;
        let val: unknown = dict[fullKey];
        if (typeof val === 'function') {
          try {
            val = (val as (...a: unknown[]) => string)(...args);
          } catch {
            val = fullKey;
          }
        }
        return typeof val === 'string' ? val : fullKey;
      },
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}