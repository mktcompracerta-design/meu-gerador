// Adicionar no constructor
this.editPhotoInput = document.getElementById('editPhoto');
this.instructionInput = document.getElementById('instructionInput');
this.editPhotoBtn = document.getElementById('editPhotoBtn');

// Adicionar no init()
this.editPhotoBtn.addEventListener('click', () => this.editPhoto());

// Adicionar preview
this.setupImagePreview(this.editPhotoInput, 'editPhotoPreview');

// Novo método para edição
async editPhoto() {
    const editPhoto = this.editPhotoInput.files[0];
    const instruction = this.instructionInput.value.trim();
    
    if (!editPhoto) {
        alert('Por favor, selecione sua foto');
        return;
    }
    
    if (!instruction) {
        alert('Por favor, digite as instruções de edição');
        return;
    }

    this.setLoading(true);

    try {
        const formData = new FormData();
        formData.append('myPhoto', editPhoto);
        formData.append('instruction', instruction);

        const response = await fetch('/api/edit-image', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erro ao editar imagem');
        }

        this.displayImage(result.image);
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao editar imagem: ' + error.message);
    } finally {
        this.setLoading(false);
    }
}
