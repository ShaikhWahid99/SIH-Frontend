import { createContext, useContext, useState, ReactNode } from "react";

interface TranslationContextType {
  lang: string;
  setLang: (l: string) => void;
  translateText: (text: string) => Promise<string>;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState("en");
  const cache = new Map<string, string>();

  const translateText = async (text: string) => {
    const key = `${lang}-${text}`;
    if (cache.has(key)) return cache.get(key)!;

    if (lang === "en") return text;

    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: lang,
        format: "text"
      })
    });

    const data = await res.json();
    cache.set(key, data.translatedText);
    return data.translatedText;
  };

  return (
    <TranslationContext.Provider value={{ lang, setLang, translateText }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslator = () => {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslator must be inside provider");
  return ctx;
};
