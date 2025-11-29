const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    // >>> Capturar FORM DATA do Vercel corretamente <<<
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const body = Buffer.concat(buffers);

    const contentType = req.headers["content-type"];

    // SEGURANÇA: Se não tiver multipart-form-data → erro amigável
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({ error: "Envie formulário com arquivo." });
    }

    const boundary = contentType.split("boundary=")[1];
    if (!boundary) {
      return res.status(400).json({ error: "Boundary não encontrado." });
    }

    const multipart = require("parse-multipart");

    const parts = multipart.Parse(body, boundary);

    let prompt = "";
    let foto = null;
    let referencia = null;

    parts.forEach((p) => {
      if (p.name === "prompt") prompt = p.data.toString("utf-8");
      if (p.name === "foto") foto = p.data.toString("base64");
      if (p.name === "referencia") referencia = p.data.toString("base64");
    });

    if (!foto) {
      return res.status(400).json({ error: "Envie a foto da pessoa." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const images = [{ mimeType: "image/jpeg", data: foto }];
    if (referencia) {
      images.push({ mimeType: "image/jpeg", data: referencia });
    }

    const result = await model.generateImage({
      prompt: prompt || "gere uma imagem criativa",
      image: images,
      size: "1024x1024"
    });

    const base64 = result.images[0].data.replace(/^data:image\/png;base64,/, "");

    return res.status(200).json({ image: base64 });

  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};
