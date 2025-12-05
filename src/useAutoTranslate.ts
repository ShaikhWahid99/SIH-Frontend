import { useEffect, useState } from "react";
import { useTranslator } from "./AutoTranslator";

export const useAutoTranslate = (text: string) => {
  const { translateText, lang } = useTranslator();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let mounted = true;

    translateText(text).then((t) => {
      if (mounted) setTranslated(t);
    });

    return () => {
      mounted = false;
    };
  }, [text, lang]);

  return translated;
};
