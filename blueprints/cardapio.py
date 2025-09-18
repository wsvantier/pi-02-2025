from flask import Blueprint, render_template, jsonify, request
from flask_login import login_required, current_user
from database import db, Cardapio, Opcao, Pedido, PedidoItem
from datetime import date, datetime, timedelta

cardapio_bp = Blueprint('cardapio', __name__, url_prefix='/cardapio')

# Página principal do cardápio
@cardapio_bp.route('/')
@login_required
def cardapio_home():
    return render_template('cardapio.html')

# API: próximos cardápios
@cardapio_bp.route('/api/cardapio/proximos')
@login_required
def proximos():
    hoje = date.today()
    limite = hoje + timedelta(days=5)
    cardapios = Cardapio.query.filter(Cardapio.data>=hoje, Cardapio.data<=limite).order_by(Cardapio.data.asc()).all()
    resultado = []
    for c in cardapios:
        resultado.append({
            "data": c.data.strftime("%d/%m/%Y"),
            "opcoes": [{"id": o.id, "categoria": o.categoria, "descricao": o.descricao} for o in c.opcoes]
        })
    return jsonify(resultado)

# API: pedidos do usuário
@cardapio_bp.route('/api/pedidos_usuario')
@login_required
def pedidos_usuario():
    pedidos = PedidoItem.query.join(Pedido).join(Opcao).filter(Pedido.usuario_id==current_user.id).all()
    resultado = {}
    for item in pedidos:
        data_str = item.pedido.cardapio.data.strftime("%d/%m/%Y")
        if data_str not in resultado:
            resultado[data_str] = {}
        resultado[data_str][item.opcao.categoria] = {"id":item.opcao.id,"descricao":item.opcao.descricao}
    return jsonify(resultado)

# API: adicionar/atualizar pedido
@cardapio_bp.route('/adicionar_pedido', methods=['POST'])
@login_required
def adicionar_pedido():
    dados = request.get_json()
    if not dados:
        return jsonify({"erro":"Nenhum dado recebido"}), 400

    try:
        for campo, valor in dados.items():
            if not valor: continue
            categoria, data_str = campo.split("_",1)
            data = datetime.strptime(data_str,"%d/%m/%Y").date()
            cardapio = Cardapio.query.filter_by(data=data).first()
            if not cardapio: continue

            pedido = Pedido.query.filter_by(usuario_id=current_user.id, cardapio_id=cardapio.id).first()
            if not pedido:
                pedido = Pedido(usuario_id=current_user.id, cardapio_id=cardapio.id,
                                status="pendente", data_pedido=date.today())
                db.session.add(pedido)
                db.session.flush()

            item = PedidoItem.query.join(Opcao).filter(PedidoItem.pedido_id==pedido.id,
                                                       Opcao.categoria==categoria).first()
            if item:
                item.opcao_id = int(valor)
            else:
                db.session.add(PedidoItem(pedido_id=pedido.id, opcao_id=int(valor)))

        db.session.commit()
        return jsonify({"sucesso": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500

# API: excluir pedido (mantendo apenas uma função)
@cardapio_bp.route('/excluir_pedido/<path:data_str>', methods=['DELETE'])
@login_required
def excluir_pedido(data_str):
    try:
        # Converte string para data
        data = datetime.strptime(data_str, "%d/%m/%Y").date()

        # Busca cardápio do dia
        cardapio = Cardapio.query.filter_by(data=data).first()
        if not cardapio:
            return jsonify({"erro": "Cardápio não encontrado"}), 404

        # Busca pedido do usuário
        pedido = Pedido.query.filter_by(usuario_id=current_user.id, cardapio_id=cardapio.id).first()
        if not pedido:
            return jsonify({"erro": "Pedido não encontrado"}), 404

        # Remove itens e pedido
        PedidoItem.query.filter_by(pedido_id=pedido.id).delete()
        db.session.delete(pedido)
        db.session.commit()

        return jsonify({"sucesso": True})

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500
