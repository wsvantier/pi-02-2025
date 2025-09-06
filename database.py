from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class Usuario(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user = db.Column(db.String(), nullable = False, unique = True)
    senha = db.Column(db.String(), nullable = False)
    tipo = db.Column(db.Enum('cozinha','funcionario','admin'), nullable=False, default='funcionario')