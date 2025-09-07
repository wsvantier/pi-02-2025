# Importa o Flask e funções úteis para manipular rotas, redirecionamentos e templates
from flask import Flask, redirect, request, render_template, url_for

# Importa funcionalidades do Flask-Login para gerenciamento de login/logout e controle de usuários
from flask_login import login_required, login_user, logout_user, current_user

# Importa a base de dados SQLAlchemy e o modelo Usuario
from database import db, Usuario

# Importa o objeto de login (LoginManager) configurado em login.py
from login import lm

# Cria a aplicação Flask
app = Flask(__name__)

# Configurações da aplicação:
# - Banco de dados SQLite
# - Chave secreta usada para sessões e flash messages
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'VANTIER'

# Inicializa o SQLAlchemy com a aplicação
db.init_app(app)

# Inicializa o Flask-Login com a aplicação
lm.init_app(app)

# Define função para carregar um usuário pelo ID (necessário para Flask-Login)
@lm.user_loader
def user_loader(id):
    return Usuario.query.get(int(id))  # Busca usuário pelo ID no banco


# Rota principal (login)
@app.route('/', methods=['GET','POST'])
def login():
    # Se o formulário foi enviado
    if request.method == 'POST':
        user = request.form['userForm']   # Recebe o nome do usuário do formulário
        senha = request.form['senhaForm'] # Recebe a senha do formulário
                
        # Busca o usuário no banco
        usuario = Usuario.query.filter_by(user=user).first()
        
        # Verifica se o usuário existe e se a senha está correta
        if usuario and usuario.verificar_senha(senha):
            login_user(usuario)  # Faz o login do usuário

            # Redireciona para páginas diferentes dependendo do tipo de usuário
            if usuario.tipo == 'admin':
                return redirect(url_for('admin'))
            elif usuario.tipo == 'cozinha':
                return redirect(url_for('cozinha'))
            else:
                return redirect(url_for('cardapio'))
        else:
            # Se login falhar, retorna à página de login
            return redirect(url_for('login'))
    
    # Se for GET, apenas renderiza a página de login
    return render_template('login.html')


# Rota /admin, acessível apenas para usuários logados
@app.route('/admin')
@login_required
def admin():
    # Bloqueia acesso de usuários que não são admin
    if current_user.tipo != 'admin':
        return redirect(url_for('cozinha'))
    
    # Renderiza a página de administração
    return render_template('admin.html')


# Rota /cardapio, acessível apenas para usuários logados
@app.route('/cardapio')
@login_required
def cardapio():
    return render_template('cardapio.html')


# Rota /cozinha, acessível apenas para usuários logados
@app.route('/cozinha')
@login_required
def cozinha():
    # Redireciona funcionários comuns para o cardápio
    if current_user.tipo == 'funcionario':
        return redirect(url_for('cardapio'))
    return render_template('cozinha.html')


# Rota de logout, acessível apenas para usuários logados
@app.route('/logout')
@login_required
def logout():
    logout_user()               # Desloga o usuário
    return redirect(url_for('login'))  # Redireciona para a página de login


# Bloco principal: cria tabelas e usuários de teste ao iniciar a aplicação
if __name__ == '__main__':
    with app.app_context():  # Contexto necessário para manipular o banco de dados
        db.create_all()      # Cria as tabelas no banco, se não existirem

        # Verifica se o usuário admin já existe
        if not Usuario.query.filter_by(user='admin').first():
            usuarios = ['admin', 'cozinha', 'funcionario']  # Usuários de teste

            usuarios_teste = []
            for u in usuarios:
                user = Usuario(user=u, tipo=u)  # Cria o objeto usuário sem senha
                user.set_senha('12345')         # Define a senha (hash)
                usuarios_teste.append(user)

            db.session.add_all(usuarios_teste)  # Adiciona todos os usuários de teste
            db.session.commit()                 # Salva no banco
    
    # Inicia o servidor Flask em modo debug
    app.run(debug=True)
