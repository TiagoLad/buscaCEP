// Espera o documento HTML ser completamente carregado antes de executar o script.
document.addEventListener('DOMContentLoaded', () => {
    const cepInput = document.getElementById('endereco_cep');
    const ruaInput = document.getElementById('endereco_rua');
    const bairroInput = document.getElementById('endereco_bairro');
    const cidadeInput = document.getElementById('endereco_cidade');
    const estadoInput = document.getElementById('endereco_estado');
    const servicoInput = document.getElementById('endereco_servico');

    const searchButton = document.getElementById('btn-buscar-cep');
    const newSearchButton = document.getElementById('btn-nova-busca');
    const estados = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
        'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
        'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    const limparCamposComplementares = () => {
        bairroInput.value = '';
        servicoInput.value = '';
    };

    const preencherSelect = (select, options, placeholder) => {
        select.innerHTML = `<option value="">${placeholder}</option>`;
        options.forEach((optionValue) => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            select.appendChild(option);
        });
    };

    const resetarCidade = (texto = 'Selecione primeiro a UF') => {
        cidadeInput.innerHTML = `<option value="">${texto}</option>`;
        cidadeInput.disabled = true;
    };

    const carregarEstados = () => {
        preencherSelect(estadoInput, estados, 'Selecione a UF');
    };

    const carregarCidadesPorEstado = async (uf, cidadeSelecionada = '') => {
        if (!uf) {
            resetarCidade();
            return;
        }

        cidadeInput.disabled = true;
        cidadeInput.innerHTML = '<option value="">Carregando cidades...</option>';

        try {
            const urlIbge = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`;
            const response = await fetch(urlIbge);
            if (!response.ok) {
                throw new Error('Falha ao carregar municípios.');
            }

            const municipios = await response.json();
            const cidades = municipios.map((m) => m.nome).sort((a, b) => a.localeCompare(b));

            preencherSelect(cidadeInput, cidades, 'Selecione a cidade');
            cidadeInput.disabled = false;

            if (cidadeSelecionada && cidades.includes(cidadeSelecionada)) {
                cidadeInput.value = cidadeSelecionada;
            }
        } catch (error) {
            console.error('Erro ao carregar cidades:', error);
            resetarCidade('Não foi possível carregar cidades');
        }
    };

    const limparFormulario = () => {
        cepInput.value = '';
        ruaInput.value = '';
        bairroInput.value = '';
        estadoInput.value = '';
        servicoInput.value = '';
        resetarCidade();

        cepInput.style.border = '';
        ruaInput.style.border = '';
        cidadeInput.style.border = '';
        estadoInput.style.border = '';
    };

    const marcarErroCamposRua = () => {
        ruaInput.style.border = '2px solid red';
        cidadeInput.style.border = '2px solid red';
        estadoInput.style.border = '2px solid red';
    };

    const limparBordaErros = () => {
        cepInput.style.border = '';
        ruaInput.style.border = '';
        cidadeInput.style.border = '';
        estadoInput.style.border = '';
    };

    const preencherResultado = (dados) => {
        ruaInput.value = dados.rua;
        bairroInput.value = dados.bairro;
        servicoInput.value = dados.servico;
    };

    estadoInput.addEventListener('change', async () => {
        await carregarCidadesPorEstado(estadoInput.value);
    });

    newSearchButton.addEventListener('click', () => {
        limparFormulario();
    });

    searchButton.addEventListener('click', async () => {
        limparBordaErros();

        const cep = cepInput.value.replace(/\D/g, '');
        const ruaBusca = ruaInput.value.trim();
        const cidadeBusca = cidadeInput.value.trim();
        const estadoBusca = estadoInput.value.trim().toUpperCase();

        if (cep) {
            limparCamposComplementares();

            if (cep.length !== 8) {
                cepInput.style.border = '2px solid red';
                alert('Formato de CEP inválido. Digite 8 números.');
                return;
            }

            try {
                const urlCep = `https://brasilapi.com.br/api/cep/v2/${cep}`;
                const response = await fetch(urlCep);

                if (!response.ok) {
                    throw new Error('CEP não encontrado ou inválido.');
                }

                const endereco = await response.json();
                estadoInput.value = endereco.state || '';
                await carregarCidadesPorEstado(estadoInput.value, endereco.city || '');

                preencherResultado({
                    rua: endereco.street || '',
                    bairro: endereco.neighborhood || '',
                    servico: endereco.service || 'BrasilAPI'
                });
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
                alert('Não foi possível encontrar o endereço. Verifique o CEP e tente novamente.');
            }

            return;
        }

        if (!ruaBusca && !cidadeBusca && !estadoBusca) {
            alert('Digite um CEP ou preencha Rua, Cidade e UF para buscar.');
            return;
        }

        if (!ruaBusca || !cidadeBusca || estadoBusca.length !== 2) {
            marcarErroCamposRua();
            alert('Para buscar por rua, preencha Rua, Cidade e UF (2 letras).');
            return;
        }

        limparCamposComplementares();

        try {
            const urlRua = `https://viacep.com.br/ws/${estadoBusca}/${encodeURIComponent(cidadeBusca)}/${encodeURIComponent(ruaBusca)}/json/`;
            const response = await fetch(urlRua);

            if (!response.ok) {
                throw new Error('Falha ao buscar por rua.');
            }

            const resultados = await response.json();

            if (!Array.isArray(resultados) || resultados.length === 0 || resultados.erro) {
                throw new Error('Nenhum endereço encontrado para os dados informados.');
            }

            const endereco = resultados[0];
            estadoInput.value = endereco.uf || estadoBusca;
            await carregarCidadesPorEstado(estadoInput.value, endereco.localidade || cidadeBusca);

            preencherResultado({
                rua: endereco.logradouro || ruaBusca,
                bairro: endereco.bairro || '',
                servico: 'ViaCEP (busca por rua)'
            });

            if (endereco.cep) {
                cepInput.value = endereco.cep;
            }
        } catch (error) {
            console.error('Erro ao buscar por rua:', error);
            alert('Não foi possível encontrar o endereço. Verifique Rua, Cidade e UF e tente novamente.');
        }
    });

    carregarEstados();
    resetarCidade();
});
