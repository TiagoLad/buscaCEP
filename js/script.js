
async function buscarCEP() {
  const cep = document.getElementById("endereco_cep").value.replace(/\D/g, ''); // Remove non-digits

  // Se o campo CEP estiver vazio após a limpeza, não faz nada.
  // Isso evita o alerta ao simplesmente clicar e sair do campo.
  if (cep === "") {
    return;
  }

  // Valida se o CEP tem 8 dígitos
  if (cep.length !== 8) {
    alert("Formato de CEP inválido. Digite 8 números.");
    endereco_cep.value = ""; // Limpa o campo de CEP
    return;
  }
  const url = `https://brasilapi.com.br/api/cep/v2/${cep}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('CEP não encontrado ou inválido.');
    }
    const endereco = await response.json();

    document.getElementById("endereco_cep").value = endereco.cep;
    document.getElementById("endereco_rua").value = endereco.street;
    document.getElementById("endereco_bairro").value = endereco.neighborhood;
    document.getElementById("endereco_cidade").value = endereco.city;
    document.getElementById("endereco_estado").value = endereco.state;
    document.getElementById("endereco_servico").value = endereco.service;

  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    alert("Não foi possível encontrar o endereço para o CEP informado.");
    endereco_cep.value = ""; // Limpa o campo de CEP
  }
}
