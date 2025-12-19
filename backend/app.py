from flask import Flask,request,jsonify
from flask_cors import CORS #da react moze poslati zahtev
from flask_sqlalchemy import SQLAlchemy
from models.user import db,User


app=Flask(__name__)
CORS(app) #dozvoljaava reactu da pristupi backendu

app.config['SQLALCHEMY_DATABASE_URI']='postgresql://postgres:123@localhost:5432/avio_app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False

db.init_app(app) #povezujemo ovde sqlalchemy sa flaskom

@app.route("/")
def home():
    return "Backend radi"

#login deo
@app.route("/login",methods=["POST"])
def login():
        data=request.get_json()  #uzimamo json podatke sa reacta
        username=data.get("username")
        password=data.get("password")
        
        user=User.query.filter_by(username=username).first()
        
        if user and user.password==password:
            return jsonify({"message":"Uspesna prijava"})
        else:
            return jsonify({"message":"Pogresno korisnicko ime ili lozinka"}),401

if  __name__ == "__main__":
    with app.app_context(): #moramo imati context da kreiramo tabele
        db.drop_all()
        db.create_all() #kreira sve tabele koje su u modelima
    app.run(debug=True)


