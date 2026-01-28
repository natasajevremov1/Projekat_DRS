from flask import Flask,request,jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_jwt_extended import JWTManager
from models.flightsModel import db,Flights
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime,timedelta
from flask_jwt_extended import jwt_required,get_jwt_identity,get_jwt
from flask_socketio import SocketIO

load_dotenv()


flights=Flask(__name__)
CORS(flights) #dozvoljava reactu da pristupi backendu
flights.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
socketio=SocketIO(flights,cors_allowed_origins="*")
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
    
    socketio.emit("new-flight", {
        "id": new_flight.id,
        "flight_name": new_flight.flight_name,
        "airline_name": new_flight.airline_name,
        "length_of_flight": new_flight.length_of_flight,
        "flight_duration_minutes": new_flight.flight_duration_minutes,
        "departure_time": new_flight.departure_time.strftime("%Y-%m-%d %H:%M"),
        "departure_airport": new_flight.departure_airport,
        "airport_of_arrival": new_flight.airport_of_arrival,
        "created_by_id": new_flight.created_by_id,
        "ticket_price": float(new_flight.ticket_price),
        
    })

    
    return jsonify({"message":"Your new flight is susccessfully created!"}),201 
    

@flights.route("/header/overview")
#posalji token u headeru
@jwt_required()
def get_flights():
    claims=get_jwt()
    if claims["role"] != "ADMIN":
        return jsonify({"message":"You don't have permission."}),403 
    all_flights = Flights.query.all()
    flights_list = []

    for f in all_flights:
        flights_list.append({
            "id": f.id,
            "flight_name": f.flight_name,
            "airline_name": f.airline_name,
            "length_of_flight": f.length_of_flight,
            "flight_duration_minutes": f.flight_duration_minutes,
            "departure_time": f.departure_time.strftime("%Y-%m-%d %H:%M"),
            "departure_airport": f.departure_airport,
            "airport_of_arrival": f.airport_of_arrival,
            "created_by_id": f.created_by_id,
            "ticket_price": float(f.ticket_price),
            "status": f.status,
            "rejection_reason": f.rejection_reason

            
            # kasnije možeš dodati "status": f.status
        })
  
    return jsonify(flights_list)     
       
@flights.route("/header/accept/<int:flight_id>", methods=["POST"])
@jwt_required()
def accept_flight(flight_id):
    claims = get_jwt()
    if claims["role"] != "ADMIN":
        return jsonify({"message": "You don't have permission."}), 403

    flight = Flights.query.get(flight_id)
    if not flight:
        return jsonify({"message": "Flight not found"}), 404
    
    flight.status = "approved"
    db.session.commit()

    socketio.emit("flight-approved", {
        "id": flight.id,
        "flight_name": flight.flight_name
    })

    return jsonify({"message": "Flight approved"})

@flights.route("/header/reject/<int:flight_id>", methods=["POST"])
@jwt_required()
def reject_flight(flight_id):
    
    claims = get_jwt()
    if claims["role"] != "ADMIN":
        return jsonify({"message": "You don't have permission."}), 403

    data = request.get_json()
    reason = data.get("reason", "")
   
    flight = Flights.query.get(flight_id)
    if not flight:
        return jsonify({"message": "Flight not found"}), 404
    
    flight.status = "rejected"
    flight.rejection_reason = reason
    db.session.commit()

    socketio.emit("flight-rejected", {
        "id": flight.id,
        "flight_name": flight.flight_name,
        "reason": reason
    })

    return jsonify({"message": "Flight rejected"})
      
@flights.route("/flights/approved")
@jwt_required()
def get_approved_flights():
    claims = get_jwt()
    if claims["role"] not in ["USER", "MANAGER", "ADMIN"]:
        return jsonify({"message":"You don't have permission."}),403
    
    approved_flights = Flights.query.filter_by(status="approved").all()
    flights_list = []

    for f in approved_flights:
        flights_list.append({
            "id": f.id,
            "flight_name": f.flight_name,
            "airline_name": f.airline_name,
            "length_of_flight": f.length_of_flight,
            "flight_duration_minutes": f.flight_duration_minutes,
            "departure_time": f.departure_time.strftime("%Y-%m-%d %H:%M"),
            "departure_airport": f.departure_airport,
            "airport_of_arrival": f.airport_of_arrival,
            "created_by_id": f.created_by_id,
            "ticket_price": float(f.ticket_price),
            "status": f.status
        })
    return jsonify(flights_list)

@flights.route("/flights/rejected")
@jwt_required()
def get_rejected_flights():
    claims = get_jwt()
    current_user_id=get_jwt_identity()
    if claims["role"] != "MANAGER":
        return jsonify({"message":"You don't have permission."}),403
    
    rejected_flights = Flights.query.filter_by(status="rejected",created_by_id=current_user_id).all()
    flights_list = []

    for f in rejected_flights:
        flights_list.append({
            "id": f.id,
            "flight_name": f.flight_name,
            "airline_name": f.airline_name,
            "length_of_flight": f.length_of_flight,
            "flight_duration_minutes": f.flight_duration_minutes,
            "departure_time": f.departure_time.strftime("%Y-%m-%d %H:%M"),
            "departure_airport": f.departure_airport,
            "airport_of_arrival": f.airport_of_arrival,
            "created_by_id": f.created_by_id,
            "ticket_price": float(f.ticket_price),
            "status": f.status,
            "rejection_reason": f.rejection_reason
        })
    return jsonify(flights_list)


@flights.route("/flights/<int:flight_id>", methods=["GET"])
@jwt_required()
def get_flight(flight_id):
    claims = get_jwt()
    if claims["role"] not in ["MANAGER", "ADMIN"]:
        return jsonify({"message": "You don't have permission."}), 403

    flight = Flights.query.get(flight_id)
    if not flight:
        return jsonify({"message": "Flight not found"}), 404

    return jsonify({
        "id": flight.id,
        "flight_name": flight.flight_name,
        "airline_name": flight.airline_name,
        "length_of_flight": flight.length_of_flight,
        "flight_duration_minutes": flight.flight_duration_minutes,
        "departure_time": flight.departure_time.strftime("%Y-%m-%dT%H:%M"),
        "departure_airport": flight.departure_airport,
        "airport_of_arrival": flight.airport_of_arrival,
        "ticket_price": float(flight.ticket_price),
        "status": flight.status,
        "rejection_reason": flight.rejection_reason
    })
    
@flights.route("/flights/<int:flight_id>", methods=["PUT"])
@jwt_required()
def update_flight(flight_id):
    claims = get_jwt()
    if claims["role"] != "MANAGER":
        return jsonify({"message": "You don't have permission."}), 403

    flight = Flights.query.get(flight_id)
    if not flight:
        return jsonify({"message": "Flight not found"}), 404

    data = request.get_json()

    try:
        flight.flight_name = data.get("flight_name")
        flight.airline_name = data.get("airline_name")
        flight.length_of_flight = int(data.get("length_of_flight"))
        flight.flight_duration_minutes = int(data.get("flight_duration_minutes"))
        flight.departure_time = datetime.strptime(data.get("departure_time"), "%Y-%m-%dT%H:%M")
        flight.departure_airport = data.get("departure_airport")
        flight.airport_of_arrival = data.get("airport_of_arrival")
        flight.ticket_price = float(data.get("ticket_price"))

        # kad menadžer ispravi → vrati u pending
        flight.status = "pending"
        flight.rejection_reason = None

        db.session.commit()

        socketio.emit("new-flight", {
            "id": flight.id,
            "flight_name": flight.flight_name,
            "status": flight.status
        })

        return jsonify({"message": "Flight updated and resubmitted"})

    except:
        return jsonify({"message": "Invalid data"}), 400
    
       
with flights.app_context():
    
    db.create_all()
    
if __name__ == "__main__" :
    socketio.run(flights,port=5001,debug=True) #drugi port da se ne sudari s drugim backendom
    
       

