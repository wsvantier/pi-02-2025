from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
import enum

class TipoEnum(enum.Enum):
    ADMIN = "admin"
    FUNCIONARIO = "funcionario"
    COZINHA = "cozinha"


db = SQLAlchemy()

class Usuario(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user = db.Column(db.String(), nullable = False, unique = True)
    senha = db.Column(db.String(), nullable = False)
    tipo = db.Column(db.Enum(TipoEnum), nullable=False, default=TipoEnum.FUNCIONARIO)