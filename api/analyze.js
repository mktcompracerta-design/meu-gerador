export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Método não permitido' 
        });
    }

    console.log('📨 API analyze chamada');

    try {
        const formData = await req.formData();
        const imageFile = formData.get('image');
        const prompt = formData.get('prompt');

        if (!imageFile) {
            return res.status(400).json({ 
                success: false,
                error: 'Imagem é obrigatória' 
            });
        }

        if (!prompt) {
            return res.status(400).json({ 
                success: false,
                error: 'Prompt é obrigatório' 
            });
        }

        // Verificar se a API key existe
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(200).json({
                success: true,
                analysis: "**API do Gemini não configurada**\n\nPara usar a funcionalidade completa, adicione sua GEMINI_API_KEY nas variáveis de ambiente da Vercel.\n\nEnquanto isso, você pode usar a versão simulada que já está funcionando!",
                isSimulated: true
            });
        }

        // Processar com Gemini REAL
        const result = await processWithGemini(imageFile, prompt, apiKey);
        
        return res.status(200).json(result);

    } catch (error) {
        console.error('❌ Erro na API:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Erro interno: ' + error.message
        });
    }
}

async function processWithGemini(imageFile, prompt, apiKey) {
    // Converter imagem para base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(arrayBuffer).toString('base64');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`;
    
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: `Por favor, analise esta imagem e responda em português brasileiro.

PROMPT DO USUÁRIO: ${prompt}

Seja detalhado e específico na sua análise. Inclua observações sobre cores, composição, elementos visuais e qualquer outro aspecto relevante.`
                    },
                    {
                        inline_data: {
                            mime_type: imageFile.type,
                            data: imageBase64
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
        }
    };

    console.log('🚀 Enviando para Gemini...');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro Gemini:', errorData);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Resposta Gemini recebida');

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
        throw new Error('Gemini não retornou texto');
    }

    return {
        success: true,
        analysis: text,
        isSimulated: false
    };
}
