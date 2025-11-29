const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const form = await req.body;
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    await new Promise((resolve) => req.on("end", resolve));

    const buffer = Buffer.concat(chunks);
    const boundary = req.headers["content-type"].split("boundary=")[1];

    const formData = require("parse-multipart").Parse(buffer, boundary);

    let prompt = "Gere uma imagem realista.";
    let fotoBase64 = null;
    let referenciaBase64 = null;

    formData.forEach((item) => {
      if (item.name === "prompt") prompt = item.data.toString();
      if (item.name === "foto")
        fotoBase64 = item.data.toString("base64");
      if (item.name === "referencia")
        referenciaBase64 = item.data.toString("base64");
    });

    if (!fotoBase64) {
      return res.status(400).json({ error: "Envie uma foto." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const autoPrompt = referenciaBase64
      ? "Recrie a imagem de referência usando a foto da pessoa."
      : prompt;

    const result = await model.generateImage({
      prompt: autoPrompt,
      image: referenciaBase64
        ? [
            { mimeType: "image/jpeg", data: referenciaBase64 },
            { mimeType: "image/jpeg", data: fotoBase64 }
          ]
        : { mimeType: "image/jpeg", data: fotoBase64 },
      size: "1024x1024"
    });

    const base64 = result.images[0].data.replace(/^data:image\/png;base64,/, "");

    return res.json({ image: base64 });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
