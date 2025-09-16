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
    tbody.innerHTML = ''; // limpa tabela antes de preencher

    const res = await fetch(`/cozinha/listarOpcoes/${cardapio_id}`);
    const opcoes = await res.json();

    // pega o maior tamanho de categoria para criar linhas completas
    const linhas = Math.max(
        opcoes.mistura.length,
        opcoes.bebida.length,
        opcoes.sobremesa.length
    );

    for (let i = 0; i < linhas; i++) {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${opcoes.mistura[i]?.descricao || ''}</td>
            <td>${opcoes.bebida[i]?.descricao || ''}</td>
            <td>${opcoes.sobremesa[i]?.descricao || ''}</td>
        `;

        tbody.appendChild(tr);
    }
}

document.querySelector('.diaSelect:last-of-type').addEventListener('change', function() {
    const cardapio_id = this.value; // assumindo que o value é o id do Cardapio
    listarOpcoesDoDia(cardapio_id);
});
