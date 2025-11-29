import { GoogleGenerativeAI } from "@google/generative-ai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false }
};

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    // parse multipart
    const { fields, files } = await parseForm(req);

    const prompt = fields.prompt || "";
    const fotoFile = files.foto ? (Array.isArray(files.foto) ? files.foto[0] : files.foto) : null;
    const referenciaFile = files.referencia ? (Array.isArray(files.referencia) ? files.referencia[0] : files.referencia) : null;

    if (!fotoFile && !referenciaFile && !prompt) {
      return res.status(400).json({ error: "Envie pelo menos 'foto', 'referencia' ou 'prompt'." });
    }

    // Escolha do modelo: use a var de ambiente MODEL_NAME ou fallback para gemini-1.5-flash
    const MODEL_NAME = process.env.MODEL_NAME || "gemini-1.5-flash";

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Monta inputs: imagens primeiro (se houver), depois prompt
    const inputs = [];

    if (referenciaFile) {
      const bytes = fs.readFileSync(referenciaFile.filepath);
      inputs.push({
        inlineData: { data: bytes.toString("base64"), mimeType: referenciaFile.mimetype || "image/jpeg" }
      });
    }

    if (fotoFile) {
      const bytes = fs.readFileSync(fotoFile.filepath);
      inputs.push({
        inlineData: { data: bytes.toString("base64"), mimeType: fotoFile.mimetype || "image/jpeg" }
      });
    }

    if (prompt) inputs.push(prompt);

    // Faz a chamada para gerar conteúdo (imagem)
    const result = await model.generateContent(inputs);
    const response = await result.response;

    // Procura parte com inlineData (imagem)
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
    if (!part) {
      console.error("Resposta completa:", JSON.stringify(response, null, 2));
      return res.status(500).json({ error: "Não foi possível gerar imagem. Verifique modelos/permissões." });
    }

    const imageBase64 = part.inlineData.data;
    return res.status(200).json({ image: imageBase64 });

  } catch (e) {
    console.error("gerar error:", e);
    return res.status(500).json({ error: String(e) });
  }
}
