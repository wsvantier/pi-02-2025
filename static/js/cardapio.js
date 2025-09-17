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

    // tabela de novos pedidos
    cardapios.forEach(c => {
        let linha = document.createElement("tr");
        let dataStr = c.data;
        let dataParts = dataStr.split("/");
        let dataCardapio = new Date(dataParts[2], dataParts[1]-1, dataParts[0]);

        // Cria selects
        let misturas = `<select name="mistura_${dataStr}">
                          <option value="" disabled>-- Selecione --</option>`;
        let bebidas = `<select name="bebida_${dataStr}">
                          <option value="" disabled>-- Selecione --</option>`;
        let sobremesas = `<select name="sobremesa_${dataStr}">
                          <option value="" disabled>-- Selecione --</option>`;

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

        // Desabilita selects se data passada ou hoje
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

        if ((dataCardapio - hoje)/(1000*60*60*24) < 1) continue;

        let linha = document.createElement("tr");

        let mistura = p.mistura ? p.mistura.descricao : "";
        let bebida = p.bebida ? p.bebida.descricao : "";
        let sobremesa = p.sobremesa ? p.sobremesa.descricao : "";

        // botão Alterar passa também os IDs das opções
        let acao = `<button onclick="editarPedido('${dataStr}', ${p.mistura ? p.mistura.id : null}, ${p.bebida ? p.bebida.id : null}, ${p.sobremesa ? p.sobremesa.id : null})">Alterar</button>`;

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

// agora a função preenche os selects da tabela superior
function editarPedido(dataStr, idMistura, idBebida, idSobremesa) {
    let tbody = document.getElementById("tabelaCardapio");
    let linhas = tbody.querySelectorAll("tr");

    linhas.forEach(tr => {
        if (tr.children[0].textContent === dataStr) {
            tr.scrollIntoView({behavior: "smooth", block: "center"});
            let selects = tr.querySelectorAll("select");
            selects.forEach(sel => {
                if (sel.name.startsWith("mistura") && idMistura) sel.value = idMistura;
                if (sel.name.startsWith("bebida") && idBebida) sel.value = idBebida;
                if (sel.name.startsWith("sobremesa") && idSobremesa) sel.value = idSobremesa;
                sel.focus();
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarCardapio(window.urlCardapioApi, window.urlPedidosApi);
});
