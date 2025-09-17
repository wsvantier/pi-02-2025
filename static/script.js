async function listarUsuarios() {
    const tabela = document.getElementById('usuarios');
    tabela.innerHTML = '';

    const req = await fetch('/admin/usuarios');
    const dados = await req.json();

    dados.forEach(e => {
        let linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${e.user}</td>
            <td>${e.nome}</td>
            <td>${e.tipo}</td>
            <td><a href="/admin/delete/${e.id}">Excluir</a></td>
        `;
        tabela.appendChild(linha);
    });
}

async function listarDias() {
    const elementos = document.getElementsByClassName('diaSelect');

    const req = await fetch('/cozinha/listarDias');
    const dias = await req.json();

    // percorre todos os selects com a classe diaSelect
    for (let seletor of elementos) {
        //seletor.innerHTML = ''; // limpa opções antigas
        dias.forEach(e => {
            seletor.innerHTML += `<option value="${e.id}">${e.data}</option>`;
        });
    }
}

// dispara ambas quando a página terminar de carregar
window.addEventListener('DOMContentLoaded', () => {
    listarUsuarios();
    listarDias();
});

async function listarOpcoesDoDia(cardapio_id) {
    const tbody = document.getElementById('cadapio-dia');
    tbody.innerHTML = ''; // Limpa a tabela antes de preencher

    const res = await fetch(`/cozinha/listarOpcoes/${cardapio_id}`);
    const opcoes = await res.json();

    // Pega o maior tamanho de categoria para criar linhas completas
    const linhas = Math.max(
        opcoes.mistura.length,
        opcoes.bebida.length,
        opcoes.sobremesa.length
    );

    for (let i = 0; i < linhas; i++) {
        const tr = document.createElement('tr');

        // Cria os dados das opções com links de exclusão e confirmação
        const misturaId = opcoes.mistura[i]?.id || '#';
        const bebidaId = opcoes.bebida[i]?.id || '#';
        const sobremesaId = opcoes.sobremesa[i]?.id || '#';

        // Monta as células com os links de exclusão
        tr.innerHTML = `
            <td>${opcoes.mistura[i]?.descricao || ''} 
                <a href="${misturaId !== '#' ? '/cozinha/deletar_opcao/' + misturaId : '#'}" class="btn-delete" 
                   onclick="return ${misturaId !== '#' ? 'confirmExclusao(event, ' + misturaId + ')' : 'false'}">
                   ${misturaId !== '#' ? 'Excluir' : ''}
                </a>
            </td>
            <td>${opcoes.bebida[i]?.descricao || ''} 
                <a href="${bebidaId !== '#' ? '/cozinha/deletar_opcao/' + bebidaId : '#'}" class="btn-delete" 
                   onclick="return ${bebidaId !== '#' ? 'confirmExclusao(event, ' + bebidaId + ')' : 'false'}">
                   ${bebidaId !== '#' ? 'Excluir' : ''}
                </a>
            </td>
            <td>${opcoes.sobremesa[i]?.descricao || ''} 
                <a href="${sobremesaId !== '#' ? '/cozinha/deletar_opcao/' + sobremesaId : '#'}" class="btn-delete" 
                   onclick="return ${sobremesaId !== '#' ? 'confirmExclusao(event, ' + sobremesaId + ')' : 'false'}">
                   ${sobremesaId !== '#' ? 'Excluir' : ''}
                </a>
            </td>
        `;

        tbody.appendChild(tr);
    }
}

function confirmExclusao(event, id) {
    const resposta = confirm('Tem certeza que deseja excluir esta opção?');
    if (!resposta) {
        event.preventDefault(); // Impede a navegação para a exclusão
    }
    return resposta;
}

document.querySelector('.diaSelect:last-of-type').addEventListener('change', function() {
    const cardapio_id = this.value; // Assumindo que o value é o id do Cardápio
    listarOpcoesDoDia(cardapio_id);
});


