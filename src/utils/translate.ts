export const bulkTranslate = async (texts: string[], lang: string) => {
  const res = await fetch("http://localhost:5000/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      texts,
      targetLang: lang,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Translation failed");
  }

  const data = await res.json();
  return data.translations;
};
