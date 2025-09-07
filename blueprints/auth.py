from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required
from database import Usuario, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = request.form['userForm']
        senha = request.form['senhaForm']
        usuario = Usuario.query.filter_by(user=user).first()
        if usuario and usuario.verificar_senha(senha):
            login_user(usuario)
            if usuario.tipo == 'admin':
                return redirect(url_for('admin.admin_home'))
            elif usuario.tipo == 'cozinha':
                return redirect(url_for('cozinha.cozinha_home'))
            else:
                return redirect(url_for('cardapio.cardapio_home'))
        else:
            flash("Usuário ou senha incorretos!", "danger")
            return redirect(url_for('auth.login'))
    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))
