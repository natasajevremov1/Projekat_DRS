from flask import Flask,request,jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_jwt_extended import JWTManager
from models.flightsModel import db,Flights
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime,timedelta
from flask_jwt_extended import jwt_required,get_jwt_identity
load_dotenv()

flights=Flask(__name__)
CORS(flights) #dozvoljava reactu da pristupi backendu
flights.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

flights.config["SQLALCHEMY_DATABASE_URI"]=os.getenv("DATABASE_URL")
flights.config["SQLALCHEMY_TRACK_MODIFICATIONS"]=False

db.init_app(flights)
jwt=JWTManager(flights)

@flights.route("/flights")
def home():
    return "Backend flights is working"
    
@flights.route("/header/flights",methods=["POST"])
@jwt_required() 
def newFlight():
    
    current_user_id=get_jwt_identity()
    
    data=request.get_json()  #uzimamo json podatke sa reacta
    flight_name=data.get("flight_name")
    airline_name=data.get("airline_name")
    length_of_flight=data.get("length_of_flight")
    flight_duration_minutes=data.get("flight_duration_minutes")
    departure_time=data.get("departure_time")
    departure_airport=data.get("departure_airport")
    airport_of_arrival=data.get("airport_of_arrival")
    ticket_price=data.get("ticket_price")
    
    if not (flight_name and airline_name and length_of_flight and flight_duration_minutes
            and departure_time and departure_airport and airport_of_arrival and ticket_price):
        return jsonify({"message" : "All fields must be filled!"}),400
    
    #konverzija tipova
    try:
        length_of_flight=int(length_of_flight)
        flight_duration_minutes=int(flight_duration_minutes)
        departure_time = datetime.strptime(departure_time, "%Y-%m-%dT%H:%M")
        ticket_price=float(ticket_price)
    except ValueError:
        return jsonify({"message":"Wrong data format."}),400   
    
    #kreiranje novog leta
    new_flight=Flights(flight_name=flight_name,
                       airline_name=airline_name,
                       length_of_flight=length_of_flight,
                       flight_duration_minutes=flight_duration_minutes,
                       departure_time=departure_time,
                       departure_airport=departure_airport,
                       airport_of_arrival=airport_of_arrival,
                       created_by_id=current_user_id,
                       ticket_price=ticket_price
                    )
    db.session.add(new_flight)
    db.session.commit()
    
    return jsonify({"message":"Your new flight is susccessfully created!"}),201 
    
    
            
with flights.app_context():
    db.drop_all()
    db.create_all()
    
if __name__ == "__main__" :
    flights.run(port=5001,debug=True) #drugi port da se ne sudari s drugim backendom
    
       

