export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt é obrigatório' });
    }

    try {
        // URL da API do Gemini para geração de imagens
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
        
        const response = await fetch(`${apiUrl}?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Gere uma imagem baseada na seguinte descrição: ${prompt}. 
                               Retorne apenas a URL da imagem gerada.`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Erro na API do Gemini');
        }

        // Nota: A API do Gemini atual não gera imagens diretamente, 
        // então vamos usar uma alternativa
        const imageUrl = await generateImageWithAlternative(prompt);
        
        res.status(200).json({ 
            image: imageUrl,
            prompt: prompt
        });

    } catch (error) {
        console.error('Erro na API:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor: ' + error.message 
        });
    }
}

// Função alternativa já que o Gemini não gera imagens diretamente
async function generateImageWithAlternative(prompt) {
    // Aqui você pode integrar com outras APIs gratuitas
    // Por enquanto, vamos retornar uma imagem placeholder
    return `https://placehold.co/600x400/667eea/white?text=${encodeURIComponent(prompt)}`;
}