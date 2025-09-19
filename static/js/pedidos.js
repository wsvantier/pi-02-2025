document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("diaSelect");
    const tbody = document.querySelector("#tabelaPedidosTodos tbody");
    const btnAtualizar = document.getElementById("btnAtualizar");

    if(!select || !tbody) return;

    // Converte data string "dd/mm/yyyy" para Date
    function parseData(str) {
        const [dia, mes, ano] = str.split("/").map(Number);
        return new Date(ano, mes-1, dia);
    }

    // Filtra apenas datas futuras ou hoje
    function filtrarOpcoesFuturas() {
        const hoje = new Date();
        hoje.setHours(0,0,0,0);
        Array.from(select.options).forEach(opt => {
            if(opt.value === "" || opt.disabled) return;
            const data = parseData(opt.textContent);
            if(data < hoje) opt.style.display = "none";
            else opt.style.display = "block";
        });
    }

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
                linha.id = `linha_pedido_${p.id}`;
                linha.innerHTML = `
                    <td>${p.usuario}</td>
                    <td>${p.mistura}</td>
                    <td>${p.bebida}</td>
                    <td>${p.sobremesa}</td>
                    <td class="status" style="font-weight:bold; color:${corStatus(p.status)}">${p.status}</td>
                    <td>
                        <button onclick="alterarStatus(${p.id}, 'pendente')">Pendente</button>
                        <button onclick="alterarStatus(${p.id}, 'confirmado')">Confirmado</button>
                        <button onclick="alterarStatus(${p.id}, 'cancelado')">Cancelado</button>
                    </td>
                `;
                linha.style.backgroundColor = index%2===0 ? "#f2f2f2" : "#ffffff";
                tbody.appendChild(linha);
            });

        } catch(err) {
            console.error(err);
            alert("Erro ao carregar pedidos. Veja o console.");
        }
    }

    // Retorna a cor de acordo com o status
    function corStatus(status) {
        switch(status) {
            case "pendente": return "orange";
            case "confirmado": return "green";
            case "cancelado": return "red";
            default: return "black";
        }
    }

    window.alterarStatus = function(pedidoId, status) {
        fetch(`/cozinha/pedido/${pedidoId}/status`, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({status})
        })
        .then(resp => resp.json())
        .then(data => {
            if(data.sucesso){
                const linha = document.querySelector(`#linha_pedido_${pedidoId}`);
                if(linha) {
                    const statusTd = linha.querySelector(".status");
                    statusTd.textContent = data.status;
                    statusTd.style.color = corStatus(data.status);
                }
            } else {
                alert("Erro ao alterar status: " + (data.erro || ""));
            }
        })
        .catch(err => {
            console.error(err);
            alert("Erro ao alterar status. Veja o console.");
        });
    }

    filtrarOpcoesFuturas();

    select.addEventListener("change", carregarPedidos);
    if(btnAtualizar) btnAtualizar.addEventListener("click", carregarPedidos);
});