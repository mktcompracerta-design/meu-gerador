import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const form = await req.formData();
    const prompt = form.get("prompt") || "Gere uma imagem realista.";
    const foto = form.get("foto");
    const referencia = form.get("referencia");

    if (!foto) {
      return new Response(JSON.stringify({ error: "Envie uma foto." }), { status: 400 });
    }

    // Converte imagens para base64
    const fotoArray = await foto.arrayBuffer();
    const fotoBase64 = Buffer.from(fotoArray).toString("base64");

    let referenciaBase64 = null;
    if (referencia) {
      const refArray = await referencia.arrayBuffer();
      referenciaBase64 = Buffer.from(refArray).toString("base64");
    }

    // Conectar Google
    const genAI = new GoogleGenerativeAI(process.env.AIzaSyAkOq2E8ihzT4edp5zmsVbT3DAdh68coho);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    return new Response(JSON.stringify({ image: base64 }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}
