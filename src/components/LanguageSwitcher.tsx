import { useTranslator } from "@/AutoTranslator";

const LanguageSwitcher = () => {
  const { lang, setLang } = useTranslator();

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 rounded text-sm border ${
          lang === "en" ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        English
      </button>

      <button
        onClick={() => setLang("hi")}
        className={`px-3 py-1 rounded text-sm border ${
          lang === "hi" ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        हिन्दी
      </button>

      <button
        onClick={() => setLang("mr")}
        className={`px-3 py-1 rounded text-sm border ${
          lang === "mr" ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        मराठी
      </button>
    </div>
  );
};

export default LanguageSwitcher;
