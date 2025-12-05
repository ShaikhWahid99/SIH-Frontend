import axios from "axios";

export async function translateText(text, targetLang) {
  try {
    const res = await axios.post("http://localhost:5000/api/translate", {
      text,
      targetLang,
    });

    return res.data.translatedText;
  } catch (err) {
    console.error("Translation failed:", err);
    return text; // fallback to original
  }
}
