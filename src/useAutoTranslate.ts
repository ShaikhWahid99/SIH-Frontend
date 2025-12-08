import { useEffect, useRef } from "react";
import { bulkTranslate } from "@/utils/translate";
import { useLanguage } from "@/context/LanguageContext";

export const useAutoTranslate = () => {
  const { lang } = useLanguage();
  const originalTextsRef = useRef<string[] | null>(null);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-translate]");
    if (elements.length === 0) return;

    // ✅ ALWAYS STORE ENGLISH ON FIRST LOAD
    if (!originalTextsRef.current) {
      originalTextsRef.current = Array.from(elements).map(
        (el) => el.textContent?.trim() || ""
      );
    }

    // ✅ IF ENGLISH → REVERT TO ORIGINAL
    if (lang === "en") {
      elements.forEach((el, i) => {
        el.textContent = originalTextsRef.current![i];
      });
      return;
    }

    // ✅ ALWAYS TRANSLATE FROM ENGLISH SOURCE
    bulkTranslate(originalTextsRef.current!, lang).then((translations) => {
      elements.forEach((el, index) => {
        el.textContent = translations[index] ?? el.textContent;
      });
    });
  }, [lang]);
};
