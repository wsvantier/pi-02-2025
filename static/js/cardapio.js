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

    // Tabela de próximos pedidos
    cardapios.forEach(c => {
        let linha = document.createElement("tr");
        let dataStr = c.data;
        let dataParts = dataStr.split("/");
        let dataCardapio = new Date(dataParts[2], dataParts[1]-1, dataParts[0]);

        linha.setAttribute("id", `linha_${dataStr.replace(/\//g,'_')}`);

        let misturas = `<select name="mistura_${dataStr}" disabled>
                          <option value="" selected disabled>-- Selecione --</option>`;
        let bebidas = `<select name="bebida_${dataStr}" disabled>
                          <option value="" selected disabled>-- Selecione --</option>`;
        let sobremesas = `<select name="sobremesa_${dataStr}" disabled>
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

        if ((dataCardapio - hoje)/(1000*60*60*24) < 1) {
            linha.querySelectorAll("select").forEach(sel => sel.disabled = true);
        }

        tbody.appendChild(linha);
    });

    // Tabela de pedidos já feitos (apenas datas futuras)
    for (let dataStr in pedidosUsuario) {
        let p = pedidosUsuario[dataStr];
        let dataParts = dataStr.split("/");
        let dataCardapio = new Date(dataParts[2], dataParts[1]-1, dataParts[0]);

        if ((dataCardapio - hoje)/(1000*60*60*24) < 1) continue;

        let linha = document.createElement("tr");

        let mistura = p.mistura ? p.mistura.descricao : "";
        let bebida = p.bebida ? p.bebida.descricao : "";
        let sobremesa = p.sobremesa ? p.sobremesa.descricao : "";

        let acaoAlterar = `<button onclick="liberarEdicao('${dataStr}', ${p.mistura ? p.mistura.id : null}, ${p.bebida ? p.bebida.id : null}, ${p.sobremesa ? p.sobremesa.id : null})">Alterar</button>`;
        let acaoExcluir = `<button onclick="excluirPedido('${dataStr}')">Excluir</button>`;

        linha.innerHTML = `
            <td>${dataStr}</td>
            <td>${mistura}</td>
            <td>${bebida}</td>
            <td>${sobremesa}</td>
            <td>${acaoAlterar} ${acaoExcluir}</td>
        `;

        tbodyFeitos.appendChild(linha);
    }
}

// Libera selects da tabela superior
function liberarEdicao(dataStr, idMistura, idBebida, idSobremesa) {
    let linha = document.getElementById(`linha_${dataStr.replace(/\//g,'_')}`);
    if (!linha) return;

    linha.scrollIntoView({behavior: "smooth", block: "center"});
    let selects = linha.querySelectorAll("select");
    selects.forEach(sel => {
        sel.disabled = false;
        if (sel.name.startsWith("mistura") && idMistura) sel.value = idMistura;
        if (sel.name.startsWith("bebida") && idBebida) sel.value = idBebida;
        if (sel.name.startsWith("sobremesa") && idSobremesa) sel.value = idSobremesa;
    });
}

// Exclui pedido
async function excluirPedido(dataStr) {
    if (!confirm(`Deseja realmente excluir o pedido do dia ${dataStr}?`)) return;

    const response = await fetch(`/cardapio/excluir_pedido/${dataStr}`, { method: "DELETE" });

    if (response.ok) {
        alert("Pedido excluído com sucesso!");
        location.reload();
    } else {
        alert("Erro ao excluir pedido.");
    }
}

// Inicializa tudo
document.addEventListener("DOMContentLoaded", () => {
    carregarCardapio(window.urlCardapioApi, window.urlPedidosApi);

    const form = document.querySelector("#pedido form");
    form.addEventListener("submit", () => {
        // desabilita todos os selects após enviar o form
        const selects = form.querySelectorAll("select");
        selects.forEach(sel => sel.disabled = true);
    });
});
