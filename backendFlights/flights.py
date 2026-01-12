from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_jwt_extended import JWTManager
from models.flightsModel import db,Flights

load_dotenv()

flights=Flask(__name__)
CORS(flights)
flights.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

flights.config["SQLALCHEMY_DATABASE_URI"]=os.getenv("DATABASE_URL")
flights.config["SQLALCHEMY_TRACK_MODIFICATIONS"]=False

db.init_app(flights)
jwt=JWTManager(flights)

@flights.route("/flights")
def home():
    return "Backend flights is working"
        
with flights.app_context():
    db.create_all()
    
if __name__ == "__main__" :
    flights.run(port=5001,debug=True) #drugi port da se ne sudari s drugim backendom
    
       

