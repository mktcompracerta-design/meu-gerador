export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
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

    console.log('📨 API analyze-image chamada');

    try {
        const formData = await req.formData();
        const imageFile = formData.get('image');
        const instruction = formData.get('instruction');

        console.log('✅ Dados recebidos:', {
            temImagem: !!imageFile,
            instrucao: instruction
        });

        if (!imageFile) {
            return res.status(400).json({ 
                success: false,
                error: 'Imagem é obrigatória' 
            });
        }

        if (!instruction) {
            return res.status(400).json({ 
                success: false,
                error: 'Instrução é obrigatória' 
            });
        }

        // Processar com Gemini
        const result = await processWithGemini(imageFile, instruction);
        
        return res.status(200).json(result);

    } catch (error) {
        console.error('❌ Erro na API:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Erro interno: ' + error.message
        });
    }
}

async function processWithGemini(imageFile, instruction) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY não configurada');
    }

    // Converter imagem para base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(arrayBuffer).toString('base64');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`;
    
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: `Analise esta imagem e responda em português brasileiro.

INSTRUÇÃO DO USUÁRIO: ${instruction}

Por favor, seja detalhado e específico na sua análise.`
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
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('✅ Resposta Gemini recebida');

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
        throw new Error('Gemini não retornou texto');
    }

    return {
        success: true,
        text: text,
        usage: data.usageMetadata
    };
}
