// ===============================
// 🔹 Listar usuários (apenas se existir tabela de usuários)
// ===============================
async function listarUsuarios() {
    const tabela = document.getElementById('usuarios');
    if (!tabela) return;
    tabela.innerHTML = '';

    const req = await fetch('/admin/usuarios');
    const dados = await req.json();

    dados.forEach(e => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${e.user}</td>
            <td>${e.nome}</td>
            <td>${e.tipo}</td>
            <td><a href="/admin/delete/${e.id}">Excluir</a></td>
        `;
        tabela.appendChild(linha);
    });
}

// ===============================
// 🔹 Listar dias disponíveis (Cardápios)
// ===============================
async function listarDias() {
    const elementos = document.getElementsByClassName('diaSelect');
    if (!elementos.length) return;

    const req = await fetch('/cozinha/listarDias');
    const dias = await req.json();

    // Data atual no formato ISO
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];

    // Ordena por data crescente
    dias.sort((a, b) => a.data_iso.localeCompare(b.data_iso));

    // Preenche cada <select>
    for (let seletor of elementos) {
        seletor.innerHTML = '<option value="" selected disabled>-- Selecione --</option>';

        dias.forEach(e => {
            if (e.data_iso >= hojeStr) {
                seletor.innerHTML += `<option value="${e.id}">${e.data_br}</option>`;
            }
        });
    }
}

// ===============================
// 🔹 Listar opções do cardápio selecionado
// ===============================
async function listarOpcoesDoDia(cardapio_id) {
    const tbody = document.getElementById('cadapio-dia');
    if (!tbody) return;

    tbody.innerHTML = ''; // Limpa a tabela

    const res = await fetch(`/cozinha/listarOpcoes/${cardapio_id}`);
    const opcoes = await res.json();

    const linhas = Math.max(
        opcoes.mistura.length,
        opcoes.bebida.length,
        opcoes.sobremesa.length
    );

    for (let i = 0; i < linhas; i++) {
        const tr = document.createElement('tr');

        const misturaId = opcoes.mistura[i]?.id || '#';
        const bebidaId = opcoes.bebida[i]?.id || '#';
        const sobremesaId = opcoes.sobremesa[i]?.id || '#';

        tr.innerHTML = `
            <td>${opcoes.mistura[i]?.descricao || ''} 
                ${misturaId !== '#' ? `
                    <a href="/cozinha/deletar_opcao/${misturaId}" class="btn-delete"
                       onclick="return confirmExclusao(event, ${misturaId})">Excluir</a>
                ` : ''}
            </td>
            <td>${opcoes.bebida[i]?.descricao || ''} 
                ${bebidaId !== '#' ? `
                    <a href="/cozinha/deletar_opcao/${bebidaId}" class="btn-delete"
                       onclick="return confirmExclusao(event, ${bebidaId})">Excluir</a>
                ` : ''}
            </td>
            <td>${opcoes.sobremesa[i]?.descricao || ''} 
                ${sobremesaId !== '#' ? `
                    <a href="/cozinha/deletar_opcao/${sobremesaId}" class="btn-delete"
                       onclick="return confirmExclusao(event, ${sobremesaId})">Excluir</a>
                ` : ''}
            </td>
        `;

        tbody.appendChild(tr);
    }
}

// ===============================
// 🔹 Confirmação de exclusão
// ===============================
function confirmExclusao(event, id) {
    const resposta = confirm('Tem certeza que deseja excluir esta opção?');
    if (!resposta) {
        event.preventDefault();
    }
    return resposta;
}

// ===============================
// 🔹 Inicialização ao carregar a página
// ===============================
window.addEventListener('DOMContentLoaded', () => {
    listarUsuarios();
    listarDias();

    // adiciona listener em todos os selects (.diaSelect)
    document.querySelectorAll('.diaSelect').forEach(select => {
        select.addEventListener('change', function() {
            listarOpcoesDoDia(this.value);
        });
    });
});
