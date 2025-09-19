document.addEventListener("DOMContentLoaded", () => {
    const tabelaCardapio = document.getElementById("tabelaCardapio");
    const tabelaPedidosFeitos = document.getElementById("tabelaPedidosFeitos");
    const form = document.getElementById("formPedido");

    if (!tabelaCardapio || !tabelaPedidosFeitos || !form) return;

    async function carregarCardapio(urlApiCardapio, urlApiPedidos) {
        try {
            const respCardapio = await fetch(urlApiCardapio);
            const cardapios = await respCardapio.json();

            const respPedidos = await fetch(urlApiPedidos);
            const pedidosUsuario = await respPedidos.json();

            tabelaCardapio.innerHTML = "";
            tabelaPedidosFeitos.innerHTML = "";

            const hoje = new Date();
            const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

            // monta tabela do cardápio
            cardapios.forEach(c => {
                const linha = document.createElement("tr");
                const dataStr = c.data;
                const [dia, mes, ano] = dataStr.split("/");
                const dataCardapio = new Date(ano, mes-1, dia);

                linha.setAttribute("id", `linha_${dataStr.replace(/\//g,'_')}`);

                let misturas = `<select name="mistura_${dataStr}"><option value="" selected disabled>-- Selecione --</option>`;
                let bebidas = `<select name="bebida_${dataStr}"><option value="" selected disabled>-- Selecione --</option>`;
                let sobremesas = `<select name="sobremesa_${dataStr}"><option value="" selected disabled>-- Selecione --</option>`;

                c.opcoes.forEach(o => {
                    let selected = "";
                    if (pedidosUsuario[dataStr] && pedidosUsuario[dataStr][o.categoria] &&
                        pedidosUsuario[dataStr][o.categoria].id == o.id) {
                        selected = "selected";
                    }

                    if(o.categoria === "mistura") misturas += `<option value="${o.id}" ${selected}>${o.descricao}</option>`;
                    if(o.categoria === "bebida") bebidas += `<option value="${o.id}" ${selected}>${o.descricao}</option>`;
                    if(o.categoria === "sobremesa") sobremesas += `<option value="${o.id}" ${selected}>${o.descricao}</option>`;
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

                const diffDias = (dataCardapio - hojeSemHora) / (1000*60*60*24);

                // regra de bloqueio/liberação
                linha.querySelectorAll("select").forEach(sel => sel.disabled = true);

                if (diffDias >= 1 && !pedidosUsuario[dataStr]) {
                    linha.querySelectorAll("select").forEach(sel => sel.disabled = false);
                }

                tabelaCardapio.appendChild(linha);
            });

            // monta tabela de pedidos já feitos
            for(let dataStr in pedidosUsuario) {
                const p = pedidosUsuario[dataStr];
                const [dia, mes, ano] = dataStr.split("/");
                const dataCardapio = new Date(ano, mes-1, dia);
                const diffDias = (dataCardapio - hojeSemHora)/(1000*60*60*24);
                if(diffDias < 1) continue; // ignora pedidos passados

                const linha = document.createElement("tr");
                const mistura = p.mistura ? p.mistura.descricao : "";
                const bebida = p.bebida ? p.bebida.descricao : "";
                const sobremesa = p.sobremesa ? p.sobremesa.descricao : "";

                const acaoAlterar = `<button type="button" onclick="liberarEdicao('${dataStr}', ${p.mistura ? p.mistura.id : null}, ${p.bebida ? p.bebida.id : null}, ${p.sobremesa ? p.sobremesa.id : null})">Alterar</button>`;
                const acaoExcluir = `<button type="button" onclick="excluirPedido('${dataStr}')">Excluir</button>`;

                linha.innerHTML = `
                    <td>${dataStr}</td>
                    <td>${mistura}</td>
                    <td>${bebida}</td>
                    <td>${sobremesa}</td>
                    <td>${acaoAlterar} ${acaoExcluir}</td>
                `;

                tabelaPedidosFeitos.appendChild(linha);
            }

        } catch(err) {
            console.error(err);
            alert("Erro ao carregar cardápio ou pedidos. Veja o console.");
        }
    }

    // libera edição de um pedido já feito
    window.liberarEdicao = function(dataStr, idMistura, idBebida, idSobremesa) {
        const linha = document.getElementById(`linha_${dataStr.replace(/\//g,'_')}`);
        if(!linha) return;

        const hoje = new Date();
        const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const [dia, mes, ano] = dataStr.split("/");
        const dataCardapio = new Date(ano, mes-1, dia);

        const diffDias = (dataCardapio - hojeSemHora) / (1000*60*60*24);

        if (diffDias < 1) {
            alert("Não é possível alterar pedidos de datas passadas.");
            return;
        }

        linha.scrollIntoView({behavior:"smooth", block:"center"});
        linha.querySelectorAll("select").forEach(sel => {
            sel.disabled = false;
            if(sel.name.startsWith("mistura") && idMistura) sel.value = idMistura;
            if(sel.name.startsWith("bebida") && idBebida) sel.value = idBebida;
            if(sel.name.startsWith("sobremesa") && idSobremesa) sel.value = idSobremesa;
        });
    }

    // excluir pedido
    window.excluirPedido = async function(dataStr) {
        if(!confirm(`Deseja realmente excluir o pedido do dia ${dataStr}?`)) return;

        try {
            const resp = await fetch(`/cardapio/excluir_pedido/${encodeURIComponent(dataStr)}`, {
                method: "DELETE"
            });

            if(resp.ok) {
                alert("Pedido excluído com sucesso!");
                location.reload();
            } else {
                const json = await resp.json();
                alert("Erro ao excluir pedido: " + (json.erro || "desconhecido"));
            }
        } catch(err) {
            console.error(err);
            alert("Erro ao excluir pedido. Veja o console.");
        }
    }

    // submit do form
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const selects = form.querySelectorAll("select");
        const dados = {};
        selects.forEach(sel => {
            if(!sel.disabled && sel.value) dados[sel.name] = sel.value;
        });

        try {
            const resp = await fetch(form.action, {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(dados)
            });

            if(resp.ok) location.reload();
            else {
                const json = await resp.json();
                alert("Erro ao registrar pedido: " + (json.erro || "desconhecido"));
            }
        } catch(err) {
            console.error(err);
            alert("Erro ao registrar pedido. Veja o console.");
        }
    });

    carregarCardapio(window.urlCardapioApi, window.urlPedidosApi);
});
