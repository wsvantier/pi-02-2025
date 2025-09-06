from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Usuario(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user = db.Column(db.String(), nullable = False, unique = True)
    senha = db.Column(db.String(), nullable = False)
    tipo = db.Column(db.Enum('cozinha','funcionario','admin'), nullable=False, default='funcionario')
    
    def set_senha(self, senha):
        self.senha = generate_password_hash(senha)
        
    def verificar_senha(self, senha):
        return check_password_hash(self.senha, senha)
        