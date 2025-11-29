async analyzeImage() {
    if (!this.currentFile) {
        this.showError('Por favor, selecione uma foto primeiro.');
        return;
    }

    const instruction = this.instructionInput.value.trim();
    if (!instruction) {
        this.showError('Por favor, digite o que você quer saber sobre a imagem.');
        return;
    }

    this.setLoading(true);
    this.hideError();
    this.hideSuccess();

    try {
        console.log('🔍 Iniciando análise...');
        
        // Converter a imagem para blob para enviar
        const response = await fetch(this.currentImage);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('image', blob, this.currentFile.name);
        formData.append('prompt', instruction);

        const apiResponse = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });

        console.log('📨 Resposta da API:', apiResponse.status);

        if (!apiResponse.ok) {
            throw new Error(`Erro ${apiResponse.status}: ${apiResponse.statusText}`);
        }

        const result = await apiResponse.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Erro na análise');
        }

        // Exibir resultado
        this.displayAnalysisResult(result.analysis, instruction, result.isSimulated);
        
    } catch (error) {
        console.error('❌ Erro:', error);
        this.showError('Erro ao analisar imagem: ' + error.message);
    } finally {
        this.setLoading(false);
    }
}
