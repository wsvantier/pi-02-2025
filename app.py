from flask import Flask
from database import db
from login import lm
from blueprints.auth import auth_bp
from blueprints.admin import admin_bp
from blueprints.cozinha import cozinha_bp
from blueprints.cardapio import cardapio_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'VANTIER'

db.init_app(app)
lm.init_app(app)

# Registra todos os Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(cozinha_bp)
app.register_blueprint(cardapio_bp)

# Define função para carregar um usuário pelo ID (necessário para Flask-Login)
@lm.user_loader
def user_loader(id):
    return Usuario.query.get(int(id))  # Busca usuário pelo ID no banco

# Cria tabelas e usuários de teste (igual antes)
with app.app_context():
    db.create_all()
    from database import Usuario
    if not Usuario.query.filter_by(user='admin').first():
        usuarios = ['admin', 'cozinha', 'funcionario']
        for u in usuarios:
            user = Usuario(user=u, nome=u, tipo=u)
            user.set_senha('12345')
            db.session.add(user)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True)
