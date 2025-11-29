export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const formData = await req.formData();
        const myPhoto = formData.get('myPhoto');
        const instruction = formData.get('instruction');

        if (!myPhoto || !instruction) {
            return res.status(400).json({ error: 'Foto e instrução são obrigatórias' });
        }

        // Converter imagem para base64
        const imageBuffer = await myPhoto.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');

        // Chamar Gemini para edição
        const editedImage = await editImageWithGemini(imageBase64, instruction, myPhoto.type);
        
        res.status(200).json({ 
            image: editedImage,
            success: true
        });

    } catch (error) {
        console.error('Erro na edição:', error);
        res.status(500).json({ 
            error: 'Erro interno: ' + error.message 
        });
    }
}

async function editImageWithGemini(imageBase64, instruction, mimeType) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const contents = [
        {
            role: "user",
            parts: [
                {
                    text: `Você é um especialista em edição de imagens. Edite a imagem seguindo EXATAMENTE estas instruções:

INSTRUÇÕES: ${instruction}

REGRAS IMPORTANTES:
1. Mantenha o rosto da pessoa EXATAMENTE igual
2. Apenas altere o que foi solicitado nas instruções
3. Mantenha a qualidade original da imagem
4. Seja realista e natural

Retorne APENAS a imagem editada em base64, sem nenhum texto adicional.`
                },
                {
                    inline_data: {
                        mime_type: mimeType,
                        data: imageBase64
                    }
                }
            ]
        }
    ];

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            contents,
            generationConfig: {
                response_mime_type: "image/jpeg"
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro no Gemini');
    }

    // O Gemini pode retornar a imagem editada
    const arrayBuffer = await response.arrayBuffer();
    const editedBase64 = Buffer.from(arrayBuffer).toString('base64');
    
    return `data:image/jpeg;base64,${editedBase64}`;
}
