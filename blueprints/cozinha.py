from datetime import datetime
from flask import Blueprint, render_template, redirect, url_for, request, jsonify
from flask_login import login_required, current_user
from database import db, Cardapio, Opcao, Pedido, PedidoItem, Usuario

cozinha_bp = Blueprint('cozinha', __name__, url_prefix='/cozinha')

# Home da cozinha
@cozinha_bp.route('/')
@login_required
def cozinha_home():
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))
    return render_template('cozinha.html')

# Adicionar dia
@cozinha_bp.route('/add_dia', methods=['POST'])
@login_required
def addDia():
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))
        
    data_str = request.form['dataForm']
    data_obj = datetime.strptime(data_str, "%Y-%m-%d").date()
    novo_cardapio = Cardapio(data=data_obj)
    db.session.add(novo_cardapio)
    db.session.commit()
    return redirect(url_for('cozinha.cozinha_home'))

# Listar dias (API)
@cozinha_bp.route('/listarDias')
@login_required
def listarDias():
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))
    
    dias = Cardapio.query.all()
    dados = [{'id': x.id, 'data': x.data.strftime('%d/%m/%Y')} for x in dias]
    return jsonify(dados)

# Adicionar opção
@cozinha_bp.route('/addOpcao', methods=['POST'])
@login_required
def addOpcao():
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))
    
    dia_id = request.form['diaSelect'] 
    descricao = request.form['descForm'] 
    categoria = request.form['catSelect']
    
    nova_opcao = Opcao(cardapio_id=dia_id, categoria=categoria, descricao=descricao)
    db.session.add(nova_opcao)
    db.session.commit()
    return redirect(url_for('cozinha.cozinha_home'))

# Listar opções de um cardápio
@cozinha_bp.route('/listarOpcoes/<int:cardapio_id>')
@login_required
def listar_opcoes(cardapio_id):
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))
    
    cardapio = Cardapio.query.get_or_404(cardapio_id)
    opcoes_por_categoria = {'mistura': [], 'bebida': [], 'sobremesa': []}

    for opcao in cardapio.opcoes:
        opcoes_por_categoria[opcao.categoria].append({
            'id': opcao.id,
            'descricao': opcao.descricao
        })

    return jsonify(opcoes_por_categoria)

# Excluir opção
@cozinha_bp.route('/deletar_opcao/<int:id>')
@login_required
def excluir_opcao(id):
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))

    remover_opcao = Opcao.query.get_or_404(id)

    # verifica se existe algum pedido_item que usa essa opção
    usados = PedidoItem.query.filter_by(opcao_id=id).count()
    if usados > 0:
        # retorna mensagem simples (sem usar flash)
        return render_template(
            "cozinha.html",
            erro="❌ Não é possível excluir esta opção, pois já foi usada em pedidos."
        )

    db.session.delete(remover_opcao)
    db.session.commit()
    return redirect(url_for('cozinha.cozinha_home'))

# Página de pedidos
@cozinha_bp.route('/pedidos')
@login_required
def pedidos():
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))
    
    dias = Cardapio.query.order_by(Cardapio.data.asc()).all()
    return render_template('pedidos.html', dias=dias)

# API: pedidos de um cardápio
@cozinha_bp.route('/api/pedidos/<int:cardapio_id>')
@login_required
def api_pedidos(cardapio_id):
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))

    pedidos = Pedido.query.filter_by(cardapio_id=cardapio_id).all()
    resultado = []

    for p in pedidos:
        item_mistura = next((i.opcao.descricao for i in p.itens if i.opcao.categoria=='mistura'), "")
        item_bebida = next((i.opcao.descricao for i in p.itens if i.opcao.categoria=='bebida'), "")
        item_sobremesa = next((i.opcao.descricao for i in p.itens if i.opcao.categoria=='sobremesa'), "")

        resultado.append({
            'id': p.id,
            # 🔹 se o usuário foi excluído, evita erro
            'usuario': p.usuario.nome if p.usuario else "Usuário removido",
            'mistura': item_mistura,
            'bebida': item_bebida,
            'sobremesa': item_sobremesa,
            'status': p.status
        })

    return jsonify(resultado)

# Atualizar status do pedido
@cozinha_bp.route('/pedido/<int:pedido_id>/status', methods=['POST'])
@login_required
def atualizar_status(pedido_id):
    if current_user.tipo == 'funcionario':
        return jsonify({"erro": "Acesso negado"}), 403

    novo_status = request.json.get("status")
    if novo_status not in ["pendente", "confirmado", "cancelado"]:
        return jsonify({"erro": "Status inválido"}), 400

    pedido = Pedido.query.get_or_404(pedido_id)
    pedido.status = novo_status
    db.session.commit()

    return jsonify({"sucesso": True, "status": pedido.status})
