from datetime import datetime
from flask import Blueprint, render_template, redirect, url_for, request, jsonify
from flask_login import login_required, current_user
from database import db, Cardapio, Opcao

cozinha_bp = Blueprint('cozinha', __name__, url_prefix='/cozinha')

@cozinha_bp.route('/')
@login_required
def cozinha_home():
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))
    return render_template('cozinha.html')

@cozinha_bp.route('/add_dia',methods = ['POST'])
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

@cozinha_bp.route('/listarDias')
@login_required
def listarDias():
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))
    
    dias = Cardapio.query.all()
    dados = [ {'id':x.id, 'data':datetime.strftime(x.data, '%d/%m/%Y')} for x in dias ]
    return jsonify(dados)

@cozinha_bp.route('/addOpcao', methods = ['POST'])
@login_required
def addOpcao():
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))
    
    dia_id = request.form['diaSelect'] 
    descricao = request.form['descForm'] 
    categoria = request.form['catSelect']
    
    
    nova_opcao = Opcao(cardapio_id=dia_id, categoria = categoria, descricao = descricao)
    
    db.session.add(nova_opcao)
    db.session.commit()
    
    return redirect(url_for('cozinha.cozinha_home'))
    
@cozinha_bp.route('/listarOpcoes/<int:cardapio_id>')
def listar_opcoes(cardapio_id):
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))
    
    cardapio = Cardapio.query.get_or_404(cardapio_id)

    # cria um dicionário com as categorias
    opcoes_por_categoria = {
        'mistura': [],
        'bebida': [],
        'sobremesa': []
    }

    for opcao in cardapio.opcoes:
        opcoes_por_categoria[opcao.categoria].append({
            'id': opcao.id,
            'descricao': opcao.descricao
        })

    return jsonify(opcoes_por_categoria)
