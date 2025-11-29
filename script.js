class ImageGenerator {
    constructor() {
        this.myPhotoInput = document.getElementById('myPhoto');
        this.referencePhotoInput = document.getElementById('referencePhoto');
        this.myPhotoPromptInput = document.getElementById('myPhotoPrompt');
        this.promptInput = document.getElementById('promptInput');
        
        this.generateFromPhotosBtn = document.getElementById('generateFromPhotosBtn');
        this.generateFromPromptBtn = document.getElementById('generateFromPromptBtn');
        
        this.loading = document.getElementById('loading');
        this.resultSection = document.getElementById('resultSection');
        this.imageResult = document.getElementById('imageResult');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        this.init();
    }

    init() {
        // Configurar preview das imagens
        this.setupImagePreview(this.myPhotoInput, 'myPhotoPreview');
        this.setupImagePreview(this.referencePhotoInput, 'referencePhotoPreview');
        this.setupImagePreview(this.myPhotoPromptInput, 'myPhotoPromptPreview');
        
        // Event listeners
        this.generateFromPhotosBtn.addEventListener('click', () => this.generateFromPhotos());
        this.generateFromPromptBtn.addEventListener('click', () => this.generateFromPrompt());
    }

    setupImagePreview(inputElement, previewId) {
        inputElement.addEventListener('change', function(e) {
            const preview = document.getElementById(previewId);
            const file = e.target.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                }
                reader.readAsDataURL(file);
            } else {
                preview.innerHTML = 'Preview da imagem';
            }
        });
    }

    async generateFromPhotos() {
        const myPhoto = this.myPhotoInput.files[0];
        const referencePhoto = this.referencePhotoInput.files[0];
        
        if (!myPhoto || !referencePhoto) {
            alert('Por favor, selecione ambas as fotos');
            return;
        }

        await this.processGeneration({
            myPhoto,
            referencePhoto,
            endpoint: '/api/swap-face'
        });
    }

    async generateFromPrompt() {
        const myPhoto = this.myPhotoPromptInput.files[0];
        const prompt = this.promptInput.value.trim();
        
        if (!myPhoto) {
            alert('Por favor, selecione sua foto');
            return;
        }
        
        if (!prompt) {
            alert('Por favor, descreva o cenário ou roupa');
            return;
        }

        await this.processGeneration({
            myPhoto,
            prompt,
            endpoint: '/api/generate-with-prompt'
        });
    }

    async processGeneration(data) {
        this.setLoading(true);

        try {
            const formData = new FormData();
            
            if (data.myPhoto) formData.append('myPhoto', data.myPhoto);
            if (data.referencePhoto) formData.append('referencePhoto', data.referencePhoto);
            if (data.prompt) formData.append('prompt', data.prompt);

            const response = await fetch(data.endpoint, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao gerar imagem');
            }

            this.displayImage(result.image);
            
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao gerar imagem: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    displayImage(imageData) {
        this.imageResult.innerHTML = `<img src="${imageData}" alt="Imagem gerada">`;
        this.resultSection.style.display = 'block';
        
        this.downloadBtn.onclick = () => this.downloadImage(imageData);
    }

    downloadImage(imageData) {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = 'minha-imagem-gerada.png';
        link.click();
    }

    setLoading(loading) {
        this.loading.style.display = loading ? 'block' : 'none';
        this.resultSection.style.display = 'none';
        
        // Desabilitar todos os botões durante o loading
        const buttons = [this.generateFromPhotosBtn, this.generateFromPromptBtn];
        buttons.forEach(btn => {
            btn.disabled = loading;
            btn.textContent = loading ? 'Gerando...' : btn === this.generateFromPhotosBtn ? 
                'Gerar Minha Foto no Estilo' : 'Gerar com Prompt';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageGenerator();
});