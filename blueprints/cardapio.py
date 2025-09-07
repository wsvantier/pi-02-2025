from flask import Blueprint, render_template
from flask_login import login_required

cardapio_bp = Blueprint('cardapio', __name__, url_prefix='/cardapio')

@cardapio_bp.route('/')
@login_required
def cardapio_home():
    return render_template('cardapio.html')
