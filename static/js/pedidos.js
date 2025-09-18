document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("diaSelect");
    const tbody = document.querySelector("#tabelaPedidosTodos tbody");
    const btnAtualizar = document.getElementById("btnAtualizar");

    if(!select || !tbody) return;

    async function carregarPedidos() {
        const cardapioId = select.value;
        if(!cardapioId) return;

        try {
            const resp = await fetch(`/cozinha/api/pedidos/${cardapioId}`);
            if(!resp.ok) throw new Error("Erro ao carregar pedidos");
            const pedidos = await resp.json();

            tbody.innerHTML = "";
            pedidos.forEach((p,index)=>{
                const linha = document.createElement("tr");
                linha.style.backgroundColor = index%2===0 ? "#f2f2f2" : "#ffffff";
                linha.innerHTML = `
                    <td>${p.usuario}</td>
                    <td>${p.mistura}</td>
                    <td>${p.bebida}</td>
                    <td>${p.sobremesa}</td>
                `;
                tbody.appendChild(linha);
            });

        } catch(err) {
            console.error(err);
            alert("Erro ao carregar pedidos. Veja o console.");
        }
    }

    select.addEventListener("change", carregarPedidos);
    if(btnAtualizar) btnAtualizar.addEventListener("click", carregarPedidos);
});
