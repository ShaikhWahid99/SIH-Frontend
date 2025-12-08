import { useLanguage } from "@/context/LanguageContext";

const AutoTranslator = () => {
  const { setLang, lang } = useLanguage();

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => setLang("en")}
        className={lang === "en" ? "font-bold underline" : ""}
      >
        EN
      </button>
      <button
        onClick={() => setLang("hi")}
        className={lang === "hi" ? "font-bold underline" : ""}
      >
        हिंदी
      </button>
      <button
        onClick={() => setLang("mr")}
        className={lang === "mr" ? "font-bold underline" : ""}
      >
        मराठी
      </button>
      <button
        onClick={() => setLang("gu")}
        className={lang === "gu" ? "font-bold underline" : ""}
      >
        ગુજરાતી
      </button>
      <button
        onClick={() => setLang("ta")}
        className={lang === "ta" ? "font-bold underline" : ""}
      >
        தமிழ்
      </button>
    </div>
  );
};

export default AutoTranslator;
