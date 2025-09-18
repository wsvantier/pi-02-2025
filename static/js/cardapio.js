document.addEventListener("DOMContentLoaded", () => {

    const tabela = document.getElementById("tabelaCardapio");
    const tabelaFeitos = document.getElementById("tabelaPedidosFeitos");
    const form = document.getElementById("formPedido");

    async function carregarCardapio() {
        try {
            const [respCardapio, respPedidos] = await Promise.all([
                fetch(window.urlCardapioApi),
                fetch(window.urlPedidosApi)
            ]);
            const cardapios = await respCardapio.json();
            const pedidosUsuario = await respPedidos.json();

            tabela.innerHTML = "";
            tabelaFeitos.innerHTML = "";

            const hoje = new Date();
            const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

            // Cardápio futuro
            cardapios.forEach(c => {
                const linha = document.createElement("tr");
                const dataStr = c.data;
                const [dia, mes, ano] = dataStr.split("/");
                const dataCardapio = new Date(ano, mes-1, dia);

                linha.id = `linha_${dataStr.replace(/\//g,'_')}`;

                let selectsHTML = {};
                ["mistura","bebida","sobremesa"].forEach(cat => {
                    let sel = `<select name="${cat}_${dataStr}"><option value="" selected disabled>-- Selecione --</option>`;
                    c.opcoes.filter(o => o.categoria === cat).forEach(o => {
                        let selected = pedidosUsuario[dataStr] && pedidosUsuario[dataStr][cat] && pedidosUsuario[dataStr][cat].id === o.id ? "selected" : "";
                        sel += `<option value="${o.id}" ${selected}>${o.descricao}</option>`;
                    });
                    sel += "</select>";
                    selectsHTML[cat] = sel;
                });

                linha.innerHTML = `
                    <td>${dataStr}</td>
                    <td>${selectsHTML.mistura}</td>
                    <td>${selectsHTML.bebida}</td>
                    <td>${selectsHTML.sobremesa}</td>
                `;

                const diffDias = (dataCardapio - hojeSemHora) / (1000*60*60*24);
                if (diffDias < 1) linha.querySelectorAll("select").forEach(s => s.disabled = true);

                tabela.appendChild(linha);
            });

            // Pedidos já feitos
            for (let dataStr in pedidosUsuario) {
                const p = pedidosUsuario[dataStr];
                const [dia, mes, ano] = dataStr.split("/");
                const dataCardapio = new Date(ano, mes-1, dia);
                if ((dataCardapio - hojeSemHora)/(1000*60*60*24) < 1) continue;

                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${dataStr}</td>
                    <td>${p.mistura ? p.mistura.descricao : ""}</td>
                    <td>${p.bebida ? p.bebida.descricao : ""}</td>
                    <td>${p.sobremesa ? p.sobremesa.descricao : ""}</td>
                    <td>
                        <button type="button" onclick="liberarEdicao('${dataStr}')">Alterar</button>
                        <button type="button" onclick="excluirPedido('${dataStr}')">Excluir</button>
                    </td>
                `;
                tabelaFeitos.appendChild(linha);
            }

        } catch (err) {
            console.error("Erro ao carregar cardápio:", err);
            alert("Erro ao carregar cardápio. Veja o console.");
        }
    }

    window.liberarEdicao = function(dataStr) {
        const linha = document.getElementById(`linha_${dataStr.replace(/\//g,'_')}`);
        if (!linha) return;
        linha.scrollIntoView({behavior:"smooth", block:"center"});
        linha.querySelectorAll("select").forEach(s => s.disabled = false);
    }

    window.excluirPedido = async function(dataStr) {
        if (!confirm(`Deseja realmente excluir o pedido do dia ${dataStr}?`)) return;
        try {
            const resp = await fetch(`/cardapio/excluir_pedido/${dataStr}`, { method:"DELETE" });
            const json = await resp.json();
            if (resp.ok) carregarCardapio();
            else alert("Erro ao excluir pedido: " + (json.erro || "Desconhecido"));
        } catch (err) {
            console.error("Erro ao excluir:", err);
            alert("Erro ao excluir pedido. Veja o console.");
        }
    }

    // Envio do formulário
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const selects = form.querySelectorAll("select");
        const dados = {};
        selects.forEach(s => { if (!s.disabled && s.value) dados[s.name] = s.value; });

        if (Object.keys(dados).length === 0) { alert("Selecione pelo menos uma opção."); return; }

        try {
            const resp = await fetch(window.urlPedidoPost, {
                method:"POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify(dados)
            });
            const json = await resp.json();
            if (resp.ok) carregarCardapio();
            else alert("Erro ao enviar pedido: " + (json.erro || "Desconhecido"));
        } catch (err) {
            console.error("Erro ao enviar pedido:", err);
            alert("Erro ao enviar pedido. Veja o console.");
        }
    });

    carregarCardapio();
});
