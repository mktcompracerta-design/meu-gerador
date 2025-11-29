export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false });
    }

    // Verificar se a API key está configurada
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    
    return res.status(200).json({
        success: true,
        hasApiKey: hasApiKey,
        status: hasApiKey ? 'connected' : 'no_api_key',
        message: hasApiKey ? 'API Gemini configurada' : 'API Key não configurada'
    });
}
