import { GoogleGenerativeAI } from "@google/generative-ai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // obrigatório para receber arquivos
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
        return res.status(400).json({ error: "Erro ao ler o formulário" });
      }

      const prompt = fields.prompt || "";
      const foto = files.foto ? files.foto[0] : null;
      const referencia = files.referencia ? files.referencia[0] : null;

      if (!foto) {
        return res.status(400).json({ error: "Envie a foto da pessoa." });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const fotoBytes = fs.readFileSync(foto.filepath);
      
      const inputs = [
        { inlineData: { data: fotoBytes.toString("base64"), mimeType: foto.mimetype } }
      ];

      if (referencia) {
        const refBytes = fs.readFileSync(referencia.filepath);
        inputs.push({
          inlineData: { data: refBytes.toString("base64"), mimeType: referencia.mimetype }
        });
      }

      if (prompt) {
        inputs.push(prompt);
      }

      const result = await model.generateContent(inputs);
      const resposta = await result.response;
      const imagem = resposta.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!imagem) {
        return res.status(500).json({ error: "Falha ao gerar imagem" });
      }

      res.status(200).json({ image: imagem });

    } catch (e) {
      console.error("Erro geral:", e);
      res.status(500).json({ error: "Erro interno" });
    }
  });
}
