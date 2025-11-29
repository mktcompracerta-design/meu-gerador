async function gerar() {
  const prompt = document.getElementById("prompt").value;
  const saida = document.getElementById("saida");

  saida.textContent = "Processando...";

  try {
    const resp = await fetch("/api/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    // Garante que só tenta ler JSON se o retorno for JSON
    const texto = await resp.text();

    try {
      const data = JSON.parse(texto);
      saida.textContent = data.resposta || data.error;
    } catch (jsonErr) {
      saida.textContent = "Erro: resposta não é JSON: " + texto;
    }

  } catch (erro) {
    saida.textContent = "Erro de rede: " + erro;
  }
}
