from flask import Flask
from database import db
from login import lm

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'VANTIER'

db.init_app(app)
lm.init_app(app)



@app.route('/')
def login():
    return 'login'


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)