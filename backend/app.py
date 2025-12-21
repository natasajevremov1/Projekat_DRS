from flask import Flask,request,jsonify
from flask_cors import CORS #da react moze poslati zahtev
from flask_sqlalchemy import SQLAlchemy
from models.user import db,User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token
from datetime import datetime;
app=Flask(__name__)
CORS(app) #dozvoljaava reactu da pristupi backendu
app.config["JWT_SECRET_KEY"]="super-secret-key"
jwt=JWTManager(app)
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
        
        if user and check_password_hash(user.password,password):
            token=create_access_token(identity=user.id)
            return jsonify({"message":"Uspesna prijava",
                            "access_token":token})
        else:
            return jsonify({"message":"Pogresno korisnicko ime ili lozinka"}),401

@app.route("/register",methods=["POST"])
def register():
    data=request.get_json()
    username=data.get("username")
    password=data.get("password")
    name=data.get("name")
    lastname=data.get("lastname")
    dateOfBirth=data.get("dateOfBirth")
    gender = data.get("gender")
    country = data.get("country")
    street = data.get("street")
    streetNumber = data.get("streetNumber")
    accountBalance = data.get("accountBalance", 0)

    if not (username and password and name and lastname and dateOfBirth and gender and country and street and streetNumber):
        return jsonify({"message": "Sva polja moraju biti popunjena"}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({"message":"User vec postoji"}),400
    #konverzija tipova:
    try:
        dateOfBirth=datetime.strptime(dateOfBirth,"%Y-%m-%d").date()
        streetNumber=int(streetNumber)
        accountBalance=float(accountBalance)
    except ValueError:
        return jsonify({"message": "Pogresan fromat podataka"}),400 
    
    #hesiranje lozinke
    hashed_password=generate_password_hash(password)
    
    #kreiranje novog korisnika
    
    new_user=User( username=username,
        password=hashed_password,
        name=name,
        lastname=lastname,
        dateOfBirth=dateOfBirth,
        gender=gender,
        country=country,
        street=street,
        streetNumber=streetNumber,
        accountBalance=accountBalance
    ) 
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message":"Uspesna registracija"}),201  
    
    
if  __name__ == "__main__":
    with app.app_context(): #moramo imati context da kreiramo tabele
        db.drop_all()
        db.create_all() #kreira sve tabele koje su u modelima
    app.run(debug=True)


