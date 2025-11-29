async function enviarFormulario(formulario) {
  const formData = new FormData(formulario);

  try {
    const resposta = await fetch("/api/gerar", {
      method: "POST",
      body: formData
    });

    const json = await resposta.json();

    if (json.error) {
      alert(json.error);
      return;
    }

    document.getElementById("resultado").innerHTML =
      `<img src="data:image/png;base64,${json.image}" width="400">`;

  } catch (erro) {
    alert("Erro ao enviar: " + erro.message);
  }
}

document.getElementById("formPrompt").onsubmit = function (e) {
  e.preventDefault();
  enviarFormulario(e.target);
};

document.getElementById("formReferencia").onsubmit = function (e) {
  e.preventDefault();
  enviarFormulario(e.target);
};
