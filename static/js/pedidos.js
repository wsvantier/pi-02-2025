async function carregarPedidos() {
    let select = document.getElementById("diaSelect");
    let cardapioId = select.value;
    if (!cardapioId) return;

    let resposta = await fetch(`/cozinha/api/pedidos/${cardapioId}`);
    let pedidos = await resposta.json();

    let tbody = document.querySelector("#tabelaPedidosTodos tbody");
    tbody.innerHTML = "";

    pedidos.forEach((p, index) => {
        let linha = document.createElement("tr");

        // adiciona classe de zebra alternada
        if (index % 2 === 0) linha.style.backgroundColor = "#f2f2f2";
        else linha.style.backgroundColor = "#ffffff";

        linha.innerHTML = `
            <td>${p.usuario}</td>
            <td>${p.mistura}</td>
            <td>${p.bebida}</td>
            <td>${p.sobremesa}</td>
        `;
        tbody.appendChild(linha);
    });
}

// Atualiza tabela automaticamente ao mudar o select
document.getElementById("diaSelect").addEventListener("change", carregarPedidos);
