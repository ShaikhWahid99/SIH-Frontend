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
