from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/')
@login_required
def admin_home():
    if current_user.tipo != 'admin':
        return redirect(url_for('cozinha.cozinha_home'))
    return render_template('admin.html')
