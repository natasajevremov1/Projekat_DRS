from flask import Flask,request,jsonify
from flask_cors import CORS #da react moze poslati zahtev
from flask_sqlalchemy import SQLAlchemy
from models.user import db,User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token,jwt_required,get_jwt,get_jwt_identity
from datetime import datetime,timedelta;
import os
from dotenv import load_dotenv
from flask import request
from werkzeug.utils import secure_filename
from flask import send_from_directory
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time

app=Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
load_dotenv()
EMAIL_ADDRESS=os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD=os.getenv("EMAIL_PASSWORD")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))

CORS(app,supports_credentials=True) #dozvoljaava reactu da pristupi backendu
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")


failed_attempts = {}
blocked_users = {}

jwt=JWTManager(app)
@jwt.invalid_token_loader
def invalid_token_callback(reason):
    print("Invalid token:", reason)
    return jsonify({"message": "Invalid token", "reason": reason}), 422

@jwt.unauthorized_loader
def missing_token_callback(reason):
    print("Missing token:", reason)
    return jsonify({"message": "Missing token", "reason": reason}), 401
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False

db.init_app(app) #povezujemo ovde sqlalchemy sa flaskom


def send_role_change_email(to_email, new_role):
    """
    Salje mejl korisniku kada mu se promeni uloga.
    Parametri:
        to_email: string, mejl primaoca
        new_role: string, nova uloga ("MANAGER" ili "USER")
    """
    # 1️⃣ Tekst mejla
    subject = "Promena uloge na AvioPlatformi"
    body = f"Poštovani,\n\nVaša uloga na platformi je promenjena.\nNova uloga: {new_role}\n\nPozdrav,\nAvioPlatform Tim"

    # 2️⃣ Kreiranje mejla
    msg = MIMEMultipart()
    msg['From'] = EMAIL_ADDRESS         # tvoj Gmail iz .env
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # 3️⃣ Povezivanje sa Gmail SMTP serverom
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()               # aktivira TLS enkripciju
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)  # prijava koristeći App Password
        server.send_message(msg)        # šalje mejl
        server.quit()
        print(f"Email poslat na {to_email}")
    except Exception as e:
        print("Greška prilikom slanja emaila:", e)

@app.route("/")
def home():
    return "Backend radi"


#login deo
@app.route("/login",methods=["POST"])
def login():
        data=request.get_json()  #uzimamo json podatke sa reacta
        username=data.get("username")
        password=data.get("password")
        
        user = User.query.filter_by(username=username).first()

        key = f"{username}"
        current_time = time.time()

      # Ako korisnik ne postoji
        if not user:
            return jsonify({"message": "Pogrešan email ili lozinka"}), 401
        #ako je korisnik blokiran
        if key in blocked_users:
            block_until = blocked_users[key]

            if current_time < block_until:
                seconds_left = max(0,int(block_until-current_time))
                return jsonify({
                    "error": "User is blocked",
                    "seconds_left":seconds_left
                }),403
            else:
                del blocked_users[key]
        #ako je pogresna lozinka
        if not check_password_hash(user.password, password):
            if key not in failed_attempts:
                failed_attempts[key] = {
                    "count":1,
                    "first_attempt_time":current_time
                }
            else:
                failed_attempts[key]["count"] +=1
           
            attempts = failed_attempts[key]["count"]

            #ako ima 3 neuspasna pokusaja
            if attempts >= 3:
                blocked_users[key] = current_time + 60
                del failed_attempts[key]

                return jsonify({
                    "error": "Too many failed attempts. Blockd for 60 seconds.",
                    "seconds_left":60
                }),403
            
            return jsonify({
                "error":"wrong credentials",
                "attempts_left":3-attempts
            }),401
        
        #ako je login uspesan
        if key in failed_attempts:
            del failed_attempts[key]


        token = create_access_token(identity=str(user.id),additional_claims={"role": user.role})

        return jsonify({
          "message": "Uspešna prijava",
           "access_token": token,
           "role":user.role
        }), 200
        
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
        return jsonify({"message": "All fields must be filled."}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({"message":"User already exist."}),400
    #konverzija tipova:
    try:
        dateOfBirth=datetime.strptime(dateOfBirth,"%Y-%m-%d").date()
        streetNumber=int(streetNumber)
        accountBalance=float(accountBalance)
    except ValueError:
        return jsonify({"message": "Wrong data format."}),400 
    
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
    
    return jsonify({"message":"Your registration is susccefully!"}),201  
    
@app.route("/admin/users")
#posalji token u headeru
@jwt_required()
def get_all_users():
    #prikupi role iz tokena
    claims=get_jwt()
    print("Claims",claims)
    print("Headers:",request.headers)
    if claims["role"] != "ADMIN":
        return jsonify({"message":"You don't have permission."}),403 
    
    #dohvati sve korisnike
    users=User.query.all()
    return jsonify([
        {
        "id" : u.id,
        "username" : u.username,
        "role" : u.role
        } for u in users
    ])  
    
@app.route("/admin/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user_role(user_id):
    claims = get_jwt()
    if claims.get("role") != "ADMIN":
        return jsonify({"message": "You don't have permission."}), 403

    data = request.get_json()
    new_role = data.get("role")
    if new_role not in ["MANAGER", "USER"]:
        return jsonify({"message": "Invalid role"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    user.role = new_role
    db.session.commit()
    
    send_role_change_email(user.username,new_role)

    return jsonify({"message": f"User role updated to {new_role}"}), 200
    
@app.route("/admin/users/<int:user_id>",methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    #provera dal je admin
    claims=get_jwt()
    if claims.get("role")!="ADMIN":
        return jsonify({"message":"You don't have permission"}),403 
    user=User.query.get(user_id)
    if not user:
        return jsonify({"message":"User not found"}),404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message":f"User {user.username} succesfully deleted"}),200  

@app.route("/profile", methods=["PUT","GET"])
@jwt_required()
def edit_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    if request.method == "GET":##get logic
        return jsonify({
            "username": user.username,
            "name": user.name,
            "lastname": user.lastname,
            "dateOfBirth": user.dateOfBirth.isoformat() if user.dateOfBirth else None,
            "gender": user.gender,
            "country": user.country,
            "street": user.street,
            "streetNumber": user.streetNumber,
            "accountBalance": user.accountBalance,
            #"profileImage": user.profile_image
        }), 200

    if request.method == "PUT":

         # FORM DATA (ne JSON!)
        username = request.form.get("username")
        password = request.form.get("password")
        name = request.form.get("name")
        lastname = request.form.get("lastname")
        dateOfBirth = request.form.get("dateOfBirth")
        gender = request.form.get("gender")
        country = request.form.get("country")
        street = request.form.get("street")
        streetNumber = request.form.get("streetNumber")
        accountBalance = request.form.get("accountBalance")

        # osnovna validacija
        if not all([username, name, lastname, dateOfBirth, gender, country, street, streetNumber]):
            return jsonify({"message": "All fields must be filled out"}), 400

        try:
            user.dateOfBirth = datetime.strptime(dateOfBirth, "%Y-%m-%d").date()
            user.streetNumber = int(streetNumber)
            user.accountBalance = float(accountBalance or 0)
        except ValueError:
            return jsonify({"message": "Wrong data format"}), 400

        # obična polja
        user.username = username
        user.name = name
        user.lastname = lastname
        user.gender = gender
        user.country = country
        user.street = street

        # password OPTIONAL
        if password:
            user.password = generate_password_hash(password)

        # IMAGE upload OPTIONAL
        file = request.files.get("profileImage")
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(filepath)
            user.profile_image = filepath

        db.session.commit()

        return jsonify({"message": "Profile successfully edited"}), 200
 
@app.route("/uploads/<filename>")
def get_image(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

 
if  __name__ == "__main__":
    with app.app_context(): #moramo imati context da kreiramo tabele
        
        db.create_all() #kreira sve tabele koje su u modelima
    app.run(debug=True)


