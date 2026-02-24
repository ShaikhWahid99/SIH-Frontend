import axios from "axios";

export async function translateText(text, targetLang) {
  console.log("🟡 Translating:", text, "->", targetLang);

  try {
    const res = await axios.post(
      "https://sih-backend-iqfv.onrender.com/api/translate",
      {
        text,
        targetLang,
      },
    );

    console.log("🟢 Result:", res.data.translatedText);
    return res.data.translatedText;
  } catch (err) {
    console.error("🔴 Translation failed:", err.response?.data || err.message);
    return text; // ✅ UI fallback
  }
}
