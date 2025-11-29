class ImageGenerator {
    constructor() {
        console.log('✅ Construtor iniciado');
        
        // Elementos da edição Gemini
        this.editPhotoInput = document.getElementById('editPhoto');
        this.instructionInput = document.getElementById('instructionInput');
        this.editPhotoBtn = document.getElementById('editPhotoBtn');
        
        // Elementos gerais
        this.loading = document.getElementById('loading');
        this.resultSection = document.getElementById('resultSection');
        this.imageResult = document.getElementById('imageResult');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        console.log('✅ Elementos encontrados:', {
            editPhotoInput: !!this.editPhotoInput,
            instructionInput: !!this.instructionInput,
            editPhotoBtn: !!this.editPhotoBtn,
            loading: !!this.loading,
            resultSection: !!this.resultSection
        });
        
        this.init();
    }

    init() {
        console.log('✅ Init iniciado');
        
        // Configurar preview da imagem de edição
        if (this.editPhotoInput) {
            this.setupImagePreview(this.editPhotoInput, 'editPhotoPreview');
            console.log('✅ Preview configurado');
        }
        
        // Event listeners
        if (this.editPhotoBtn) {
            this.editPhotoBtn.addEventListener('click', () => {
                console.log('✅ Botão editar clicado!');
                this.editPhoto();
            });
            console.log('✅ Event listener do botão adicionado');
        } else {
            console.log('❌ Botão editPhotoBtn não encontrado');
        }
    }

    setupImagePreview(inputElement, previewId) {
        inputElement.addEventListener('change', function(e) {
            console.log('✅ Arquivo selecionado para preview');
            const preview = document.getElementById(previewId);
            const file = e.target.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    console.log('✅ Preview da imagem atualizado');
                }
                reader.readAsDataURL(file);
            } else {
                preview.innerHTML = 'Preview da imagem';
            }
        });
    }

    async editPhoto() {
        console.log('✅ Método editPhoto() chamado');
        
        const editPhoto = this.editPhotoInput?.files[0];
        const instruction = this.instructionInput?.value.trim();
        
        console.log('✅ Dados capturados:', {
            temFoto: !!editPhoto,
            temInstrucao: !!instruction,
            instrucao: instruction
        });
        
        if (!editPhoto) {
            alert('Por favor, selecione sua foto');
            console.log('❌ Nenhuma foto selecionada');
            return;
        }
        
        if (!instruction) {
            alert('Por favor, digite as instruções de edição');
            console.log('❌ Nenhuma instrução digitada');
            return;
        }

        console.log('✅ Iniciando processamento...');
        this.setLoading(true);

        try {
            const formData = new FormData();
            formData.append('myPhoto', editPhoto);
            formData.append('instruction', instruction);

            console.log('✅ Enviando requisição para /api/edit-image');
            
            const response = await fetch('/api/edit-image', {
                method: 'POST',
                body: formData
            });

            console.log('✅ Resposta recebida:', response.status);
            
            const result = await response.json();
            console.log('✅ Resultado parseado:', result);

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao editar imagem');
            }

            console.log('✅ Exibindo imagem resultante');
            this.displayImage(result.image);
            
        } catch (error) {
            console.error('❌ Erro capturado:', error);
            alert('Erro ao editar imagem: ' + error.message);
        } finally {
            console.log('✅ Finalizando loading');
            this.setLoading(false);
        }
    }

    displayImage(imageData) {
        console.log('✅ DisplayImage chamado com:', imageData?.substring(0, 50) + '...');
        this.imageResult.innerHTML = `<img src="${imageData}" alt="Imagem gerada">`;
        this.resultSection.style.display = 'block';
        
        this.downloadBtn.onclick = () => this.downloadImage(imageData);
        console.log('✅ Imagem exibida na tela');
    }

    setLoading(loading) {
        console.log('✅ setLoading:', loading);
        this.loading.style.display = loading ? 'block' : 'none';
        this.resultSection.style.display = 'none';
        
        if (this.editPhotoBtn) {
            this.editPhotoBtn.disabled = loading;
            this.editPhotoBtn.textContent = loading ? 'Editando...' : 'Editar Minha Foto';
        }
    }

    downloadImage(imageData) {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = 'minha-imagem-editada.png';
        link.click();
    }
}

// Inicialização com mais logs
console.log('🚀 DOM Carregado - Iniciando ImageGenerator');
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM completamente carregado');
    new ImageGenerator();
});
