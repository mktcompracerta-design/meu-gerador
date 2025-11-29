import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "GEMINI_API_KEY não configurada" });

    const genAI = new GoogleGenerativeAI(key);

    // Lista modelos disponíveis para essa chave
    const models = await genAI.listModels();
    // Retorna a lista crua (pode ser grande)
    res.status(200).json(models);
  } catch (e) {
    console.error("list-models error:", e);
    res.status(500).json({ error: String(e) });
  }
}
