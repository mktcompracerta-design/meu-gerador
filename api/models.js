import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const list = await genAI.listModels();
    res.status(200).json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
