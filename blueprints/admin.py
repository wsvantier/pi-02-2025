from flask import Blueprint, render_template, redirect, url_for, jsonify, request
from flask_login import login_required, current_user
from database import db, Usuario

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

#Rotas da Blueprints admin

@admin_bp.route('/')
@login_required
def admin_home():
    if current_user.tipo != 'admin':
        return redirect(url_for('cozinha.cozinha_home'))
    return render_template('admin.html')

@admin_bp.route('/usuarios')
@login_required
def admin_listar_usuarios():
    if current_user.tipo != 'admin':
        return redirect(url_for('cozinha.cozinha_home'))
    
    busca = Usuario.query.all()
    dados = [{'id':x.id, 'nome':x.nome, 'user':x.user, 'tipo':x.tipo} for x in busca ]
    resposta = jsonify(dados)
    return resposta

@admin_bp.route('/delete/<int:id>')
@login_required
def admin_excluir(id):
    if current_user.tipo != 'admin':
        return redirect(url_for('cozinha.cozinha_home'))
    
    user = Usuario.query.get(id)
    db.session.delete(user)
    db.session.commit()
    return redirect(url_for('admin.admin_home'))
    
    
@admin_bp.route('/inserir', methods = ['GET','POST'])
@login_required
def admin_inserir():
    nome = request.form['nomeForm']
    user = request.form['userForm']
    senha = request.form['senhaForm']
    tipo = request.form['tipoSelect']
    
    novo_usuario = Usuario(nome = nome, user = user, tipo = tipo)
    novo_usuario.set_senha(senha)
    db.session.add(novo_usuario)
    db.session.commit()
    
    return redirect(url_for('admin.admin_home'))