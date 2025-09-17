from flask import Blueprint, abort, flash, redirect, render_template, jsonify, request, url_for
from flask_login import login_required
from database import db, Pedido, PedidoItem, Cardapio, Opcao
from datetime import date, datetime, timedelta
from flask_login import current_user

cardapio_bp = Blueprint('cardapio', __name__, url_prefix='/cardapio')

@cardapio_bp.route('/')
@login_required
def cardapio_home():
    return render_template('cardapio.html')

@cardapio_bp.route('/api/cardapio/proximos')
@login_required
def proximos():
    hoje = date.today()
    limite = hoje + timedelta(days=5)

    # Busca só os cardápios
    hoje = date.today()
    limite = hoje + timedelta(days=5)

    cardapios = (Cardapio.query
        .filter(Cardapio.data >= hoje, Cardapio.data <= limite)
        .order_by(Cardapio.data.asc())
        .all()
    )

    resultado = []
    for c in cardapios:
        resultado.append({
            "data": c.data.strftime("%d/%m/%Y"),
            "opcoes": [
                {
                    "id": o.id,
                    "categoria": o.categoria,
                    "descricao": o.descricao
                }
                for o in c.opcoes
            ]
        })

    return jsonify(resultado)


@cardapio_bp.route('/adicionar_pedido', methods=['POST'])
@login_required
def pedido():
    dados = request.form.to_dict()

    pedidos_por_data = {}

    for campo, valor in dados.items():
        if not valor:
            continue

        categoria, data_str = campo.split("_", 1)
        data = datetime.strptime(data_str, "%d/%m/%Y").date()

        # Busca cardápio do dia
        cardapio = Cardapio.query.filter_by(data=data).first()
        if not cardapio:
            continue

        # Busca ou cria Pedido para este usuário e cardápio
        pedido_existente = Pedido.query.filter_by(
            usuario_id=current_user.id,
            cardapio_id=cardapio.id
        ).first()

        if not pedido_existente:
            pedido_existente = Pedido(
                usuario_id=current_user.id,
                cardapio_id=cardapio.id,
                status="pendente",
                data_pedido=date.today()
            )
            db.session.add(pedido_existente)
            db.session.flush()  # garante que pedido_existente.id existe

        # Verifica se já existe um item da mesma categoria
        item_existente = (PedidoItem.query
                          .join(Opcao)
                          .filter(PedidoItem.pedido_id == pedido_existente.id,
                                  Opcao.categoria == categoria)
                          .first())

        if item_existente:
            # Atualiza a opção selecionada
            item_existente.opcao_id = int(valor)
        else:
            # Cria novo item
            novo_item = PedidoItem(
                pedido_id=pedido_existente.id,
                opcao_id=int(valor)
            )
            db.session.add(novo_item)

    db.session.commit()
    flash("Pedido registrado/atualizado com sucesso!", "success")
    return redirect(url_for("cardapio.cardapio_home"))



@cardapio_bp.route('/api/pedidos_usuario')
@login_required
def pedidos_usuario():
    pedidos = (PedidoItem.query
               .join(Pedido)
               .join(Opcao)
               .filter(Pedido.usuario_id == current_user.id)
               .all())
    
    resultado = {}
    for item in pedidos:
        data_str = item.pedido.cardapio.data.strftime("%d/%m/%Y")
        cat = item.opcao.categoria

        if data_str not in resultado:
            resultado[data_str] = {}
        resultado[data_str][cat] = {
            "id": item.opcao.id,
            "descricao": item.opcao.descricao
        }
    
    return jsonify(resultado)

@cardapio_bp.route('/excluir_pedido/<data_str>', methods=['DELETE'])
@login_required
def excluir_pedido(data_str):
    try:
        data = datetime.strptime(data_str, "%d/%m/%Y").date()
    except ValueError:
        abort(400, "Data inválida")

    pedido = Pedido.query.filter_by(usuario_id=current_user.id, cardapio_id=Cardapio.query.filter_by(data=data).first().id).first()

    if not pedido:
        abort(404, "Pedido não encontrado")

    # Deleta todos os itens do pedido
    PedidoItem.query.filter_by(pedido_id=pedido.id).delete()
    db.session.delete(pedido)
    db.session.commit()
    return '', 200
