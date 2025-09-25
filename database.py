from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Usuario(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user = db.Column(db.String(), nullable = False, unique = True)
    nome = db.Column(db.String(), nullable = False, unique = False)
    senha = db.Column(db.String(), nullable = False)
    tipo = db.Column(db.Enum('cozinha','funcionario','admin'), nullable=False, default='funcionario')
    
    def set_senha(self, senha):
        self.senha = generate_password_hash(senha)
        
    def verificar_senha(self, senha):
        return check_password_hash(self.senha, senha)
    
class Cardapio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.Date, nullable=False, unique = True)
    opcoes = db.relationship('Opcao', backref='cardapio', lazy=True)

class Opcao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cardapio_id = db.Column(db.Integer, db.ForeignKey('cardapio.id'), nullable=False)
    categoria = db.Column(db.Enum('mistura','bebida','sobremesa'), nullable=False)
    descricao = db.Column(db.String(), nullable=False)
    
class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey('usuario.id', ondelete="SET NULL"),  # 🔹 Aqui
        nullable=True
    )
    cardapio_id = db.Column(db.Integer, db.ForeignKey('cardapio.id'), nullable=False)
    status = db.Column(db.Enum('pendente','confirmado','cancelado'), nullable=False)
    data_pedido = db.Column(db.Date, nullable=False)

    usuario = db.relationship(
        'Usuario',
        backref=db.backref('pedidos', passive_deletes=True),  # 🔹 Aqui
        lazy=True
    )
    cardapio = db.relationship('Cardapio', backref='pedidos', lazy=True)

class PedidoItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    opcao_id = db.Column(db.Integer, db.ForeignKey('opcao.id'), nullable=False)
    
    pedido = db.relationship('Pedido', backref='itens', lazy=True)
    opcao = db.relationship('Opcao', backref='itens', lazy=True)
