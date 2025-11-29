import { GoogleGenerativeAI } from "@google/generative-ai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) return res.status(400).json({ error: "Erro ao processar formulário" });

      const prompt = fields.prompt || "";
      const foto = files.foto ? files.foto[0] : null;
      const referencia = files.referencia ? files.referencia[0] : null;

      if (!foto && !prompt) {
        return res.status(400).json({ error: "Envie ao menos foto ou prompt." });
      }

      // MODELO CORRETO PARA GERAR IMAGEM
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"   // <---- MODELO QUE FUNCIONA
      });

      const inputs = [];

      // FOTO
      if (foto) {
        const bytes = fs.readFileSync(foto.filepath);
        inputs.push({
          inlineData: {
            data: bytes.toString("base64"),
            mimeType: foto.mimetype
          }
        });
      }

      // REFERÊNCIA
      if (referencia) {
        const bytes = fs.readFileSync(referencia.filepath);
        inputs.push({
          inlineData: {
            data: bytes.toString("base64"),
            mimeType: referencia.mimetype
          }
        });
      }

      // PROMPT
      if (prompt) {
        inputs.push(prompt);
      }

      // GERANDO SAÍDA
      const result = await model.generateContent(inputs);
      const response = await result.response;

      // PEGANDO IMAGEM
      const part = response.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData?.data
      );

      if (!part) {
        return res.status(500).json({ error: "Não foi possível gerar imagem" });
      }

      return res.status(200).json({ image: part.inlineData.data });

    } catch (e) {
      console.error("Erro interno:", e);
      return res.status(500).json({ error: "Erro interno" });
    }
  });
}
