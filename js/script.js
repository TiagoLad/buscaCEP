      function buscarCEP(){
        let cep = document.getElementById("endereco_cep").value;
        let url = "https://brasilapi.com.br/api/cep/v2/"+cep;

        fetch(url).then(function(dados){
            dados.json().then(function(endereco){
            document.getElementById("endereco_cep").value = endereco.cep;    
            document.getElementById("endereco_rua").value = endereco.street;
            document.getElementById("endereco_bairro").value = endereco.neighborhood;
            document.getElementById("endereco_cidade").value = endereco.city;
            document.getElementById("endereco_estado").value = endereco.state;
            document.getElementById("endereco_servico").value = endereco.service
            })
        })
      }
  