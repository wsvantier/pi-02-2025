from flask import Blueprint, render_template, jsonify
from flask_login import login_required
from database import db, Pedido, PedidoItem, Cardapio, Opcao
from datetime import date, timedelta

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
