from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user

cozinha_bp = Blueprint('cozinha', __name__, url_prefix='/cozinha')

@cozinha_bp.route('/')
@login_required
def cozinha_home():
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio.cardapio_home'))
    return render_template('cozinha.html')
