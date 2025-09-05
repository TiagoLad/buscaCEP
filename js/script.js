// Espera o documento HTML ser completamente carregado antes de executar o script.
// Isso é uma boa prática para evitar erros de "elemento não encontrado".
document.addEventListener('DOMContentLoaded', () => {

    // Pega as referências dos elementos do HTML que vamos usar.
    const cepInput = document.getElementById('endereco_cep');
    const searchButton = document.getElementById('btn-buscar-cep');
    const newSearchButton = document.getElementById('btn-nova-busca');

    // Função para limpar os campos do formulário
    // O parâmetro 'limparTudo' decide se o campo de CEP também será limpo.
    const limparFormulario = (limparTudo = false) => {
        document.getElementById("endereco_rua").value = "";
        document.getElementById("endereco_bairro").value = "";
        document.getElementById("endereco_cidade").value = "";
        document.getElementById("endereco_estado").value = "";
        document.getElementById("endereco_servico").value = "";
        if (limparTudo) {
            cepInput.value = "";
            // Restaura a borda padrão do campo CEP, caso estivesse com erro
            cepInput.style.border = ''; // Remove o estilo inline para usar o da folha de estilo
        }
    };

    // Adiciona um ouvinte para o novo botão "Nova Busca"
    newSearchButton.addEventListener('click', () => {
        limparFormulario(true); // Limpa todos os campos, incluindo o CEP
    });

    // Adiciona um "ouvinte" de evento de clique no botão.
    // A função 'async' aqui dentro será executada toda vez que o botão for clicado.
    searchButton.addEventListener('click', async () => {
        limparFormulario(); // Limpa apenas os campos de resultado antes de uma nova busca
        const cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

        // Valida se o CEP tem o formato correto
        if (cep.length !== 8) {
            cepInput.style.border = '2px solid red';
            alert("Formato de CEP inválido. Digite 8 números.");
            cepInput.value = ""; // Limpa o campo de CEP
            return; // Para a execução
        }
        else {
            cepInput.style.border = ''; // Remove o estilo inline para usar o da folha de estilo
        }

        const url = `https://brasilapi.com.br/api/cep/v2/${cep}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                // Se a API retornar um erro (ex: CEP não existe), lança um erro.
                throw new Error('CEP não encontrado ou inválido.');
            }
            const endereco = await response.json();

            // Preenche os campos do formulário com os dados recebidos
            document.getElementById("endereco_rua").value = endereco.street;
            document.getElementById("endereco_bairro").value = endereco.neighborhood;
            document.getElementById("endereco_cidade").value = endereco.city;
            document.getElementById("endereco_estado").value = endereco.state;
            document.getElementById("endereco_servico").value = endereco.service;

        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            alert("Não foi possível encontrar o endereço. Verifique o CEP e tente novamente.");
            cepInput.value = ""; // Limpa o campo de CEP em caso de erro
        }
    });
});
