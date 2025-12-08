import { createContext, useContext, useEffect, useState } from "react";
import { translateText } from "@/utils/translate";

type LanguageContextType = {
  lang: string;
  setLang: (lang: string) => void;
  translate: (text: string) => Promise<string>;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

// ✅ TRANSLATION CACHE
const translationCache: Record<string, Record<string, string>> = {};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState(
    localStorage.getItem("app_lang") || "en"
  );

  // ✅ PERSIST LANGUAGE
  const setLang = (newLang: string) => {
    localStorage.setItem("app_lang", newLang);
    setLangState(newLang);
  };

  // ✅ GLOBAL TRANSLATION FUNCTION
  const translate = async (text: string): Promise<string> => {
    if (!text || lang === "en") return text;

    // ✅ CACHE PER LANGUAGE
    if (translationCache[lang]?.[text]) {
      return translationCache[lang][text];
    }

    const translated = await translateText(text, lang);

    if (!translationCache[lang]) translationCache[lang] = {};

    translationCache[lang][text] = translated;

    return translated;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Lang = "en" | "hi" | "mr" | "gu" | "ta";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");

  // ✅ Restore language after refresh
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Lang;
    if (savedLang) setLang(savedLang);
  }, []);

  const updateLang = (newLang: Lang) => {
    localStorage.setItem("lang", newLang);
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: updateLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};
