import { GoogleGenerativeAI } from "@google/generative-ai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error("Erro formidable:", err);
        return res.status(400).json({ error: "Erro ao processar formulário" });
      }

      const prompt = fields.prompt || "Um chapéu estiloso";
      const foto = files.foto ? files.foto[0] : null;

      if (!foto) {
        return res.status(400).json({ error: "Envie a foto da pessoa." });
      }

      const genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

      // Converte a foto para base64
      const fotoBytes = fs.readFileSync(foto.filepath);
      const fotoBase64 = fotoBytes.toString("base64");

      // Gera a imagem
      const result = await genAI.generateImage({
        model: "image-alpha-001",
        prompt: prompt,
        image: {
          inlineData: {
            data: fotoBase64,
            mimeType: foto.mimetype,
          },
        },
        size: "1024x1024",
        format: "png",
      });

      const imagem = result.candidates?.[0]?.imageUri;
      if (!imagem) {
        return res.status(500).json({ error: "Erro ao gerar imagem" });
      }

      return res.status(200).json({ image: imagem });

    } catch (e) {
      console.error("ERRO API:", e);
      return res.status(500).json({ error: "Erro interno na geração" });
    }
  });
}

