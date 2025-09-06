from flask import Flask, redirect, request, render_template, url_for
from flask_login import login_required, login_user, logout_user
from werkzeug.security import generate_password_hash
from database import db, Usuario
from login import lm

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'VANTIER'

db.init_app(app)
lm.init_app(app)


@lm.user_loader
def user_loader(id):
    return Usuario.query.get(int(id))


@app.route('/', methods = ['GET','POST'])
def login():
    
    if request.method == 'POST':
        user = request.form['userForm']
        senha = request.form['senhaForm']
                
        usuario = Usuario.query.filter_by(user=user).first()
        
        if usuario and usuario.verificar_senha(senha):
            login_user(usuario)
            return redirect(url_for("home"))
        else:
            return redirect(url_for('login'))
            
    
    return render_template('login.html')


@app.route('/home')
@login_required
def home():
    return 'Logado com sucesso'

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not Usuario.query.filter_by(user = 'admin').first():
            admin = Usuario(user = 'admin', tipo = 'admin')
            admin.set_senha('12345')
            db.session.add(admin)
            db.session.commit()
            
    app.run(debug=True)