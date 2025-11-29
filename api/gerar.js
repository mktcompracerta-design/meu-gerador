import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    // Permite apenas POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    // Body deve ser JSON
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Prompt é obrigatório" });
    }

    // Inicia Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Modelo que FUNCIONA com "generateContent"
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Gera texto
    const result = await model.generateContent(prompt);
    const resposta = result.response.text();

    // Retorna JSON válido SEMPRE
    return res.status(200).json({ resposta });

  } catch (erro) {
    // Garante JSON mesmo com erro
    return res.status(500).json({ error: erro.toString() });
  }
}
