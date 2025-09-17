async function carregarCardapio(urlApiCardapio, urlApiPedidos) {
    let respostaCardapio = await fetch(urlApiCardapio);
    let cardapios = await respostaCardapio.json();

    let respostaPedidos = await fetch(urlApiPedidos);
    let pedidosUsuario = await respostaPedidos.json();

    let tbody = document.getElementById("tabelaCardapio");
    tbody.innerHTML = "";

    let tbodyFeitos = document.getElementById("tabelaPedidosFeitos");
    tbodyFeitos.innerHTML = "";

    const hoje = new Date();

    // tabela de novos pedidos (próximos 5 dias)
    cardapios.forEach(c => {
        let linha = document.createElement("tr");

        let dataStr = c.data;
        let dataParts = dataStr.split("/");
        let dataCardapio = new Date(dataParts[2], dataParts[1]-1, dataParts[0]);

        // Cria selects para novos pedidos
        let misturas = `<select name="mistura_${dataStr}">
                          <option value="" selected disabled>-- Selecione --</option>`;
        let bebidas = `<select name="bebida_${dataStr}">
                          <option value="" selected disabled>-- Selecione --</option>`;
        let sobremesas = `<select name="sobremesa_${dataStr}">
                          <option value="" selected disabled>-- Selecione --</option>`;

        c.opcoes.forEach(o => {
            let selected = "";
            if (pedidosUsuario[dataStr] && pedidosUsuario[dataStr][o.categoria] &&
                pedidosUsuario[dataStr][o.categoria].id == o.id) {
                selected = "selected";
            }

            if (o.categoria === "mistura") misturas += `<option value="${o.id}" ${selected}>${o.descricao}</option>`;
            if (o.categoria === "bebida") bebidas += `<option value="${o.id}" ${selected}>${o.descricao}</option>`;
            if (o.categoria === "sobremesa") sobremesas += `<option value="${o.id}" ${selected}>${o.descricao}</option>`;
        });

        misturas += "</select>";
        bebidas += "</select>";
        sobremesas += "</select>";

        linha.innerHTML = `
            <td>${dataStr}</td>
            <td>${misturas}</td>
            <td>${bebidas}</td>
            <td>${sobremesas}</td>
        `;

        // Desabilitar selects se data do cardápio já passou ou é hoje
        if ((dataCardapio - hoje)/(1000*60*60*24) < 1) {
            linha.querySelectorAll("select").forEach(sel => sel.disabled = true);
        }

        tbody.appendChild(linha);
    });

    // tabela de pedidos já feitos (apenas datas futuras)
    for (let dataStr in pedidosUsuario) {
        let p = pedidosUsuario[dataStr];
        let dataParts = dataStr.split("/");
        let dataCardapio = new Date(dataParts[2], dataParts[1]-1, dataParts[0]);

        // só exibe se data do cardápio for maior que hoje
        if ((dataCardapio - hoje)/(1000*60*60*24) < 1) continue;

        let linha = document.createElement("tr");

        let mistura = p.mistura ? p.mistura.descricao : "";
        let bebida = p.bebida ? p.bebida.descricao : "";
        let sobremesa = p.sobremesa ? p.sobremesa.descricao : "";

        let acao = `<button onclick="editarPedido('${dataStr}')">Alterar</button>`;

        linha.innerHTML = `
            <td>${dataStr}</td>
            <td>${mistura}</td>
            <td>${bebida}</td>
            <td>${sobremesa}</td>
            <td>${acao}</td>
        `;

        tbodyFeitos.appendChild(linha);
    }
}

function editarPedido(dataStr) {
    let tbody = document.getElementById("tabelaCardapio");
    let linhas = tbody.querySelectorAll("tr");
    linhas.forEach(tr => {
        if (tr.children[0].textContent === dataStr) {
            tr.scrollIntoView({behavior: "smooth", block: "center"});
            tr.querySelectorAll("select").forEach(sel => sel.focus());
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarCardapio(window.urlCardapioApi, window.urlPedidosApi);
});
