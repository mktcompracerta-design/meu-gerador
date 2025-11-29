const { GoogleGenerativeAI } = require("@google/generative-ai");
const multipart = require("parse-multipart");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    // RECEBER BINARY
    let chunks = [];
    req.on("data", (c) => chunks.push(c));
    await new Promise((r) => req.on("end", r));

    const buffer = Buffer.concat(chunks);
    const boundary = req.headers["content-type"].split("boundary=")[1];
    const parts = multipart.Parse(buffer, boundary);

    // CAMPOS
    let prompt = "";
    let foto = null;
    let referencia = null;

    parts.forEach((p) => {
      if (p.name === "prompt") prompt = p.data.toString();
      if (p.name === "foto") foto = p.data.toString("base64");
      if (p.name === "referencia") referencia = p.data.toString("base64");
    });

    if (!foto) {
      return res.status(400).json({ error: "Envie uma foto" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imagens = [{ mimeType: "image/jpeg", data: foto }];

    if (referencia) {
      imagens.push({ mimeType: "image/jpeg", data: referencia });
    }

    const result = await model.generateImage({
      prompt: prompt || "gere uma imagem",
      image: imagens,
      size: "1024x1024",
    });

    const base64 = result.images[0].data.replace(/^data:image\/png;base64,/, "");

    return res.json({ image: base64 });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
