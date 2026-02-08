from flask import Blueprint, Flask,request,jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_jwt_extended import JWTManager

from models.flightsModel import db,Flights
from models.airlineModel import Airlines
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import joinedload

from datetime import datetime,timedelta
from flask_jwt_extended import jwt_required,get_jwt_identity,get_jwt
from flask_socketio import SocketIO
from threading import Thread
import time

import asyncio
from backend.models.user import Users

load_dotenv()
flights_bp = Blueprint("flights",__name__)
socketio=SocketIO(cors_allowed_origins="*",async_mode="eventlet")

def create_app():
    flights=Flask(__name__)
    CORS(flights,supports_credentials=True) #dozvoljava reactu da pristupi backendu

    flights.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    
    flights.config["SQLALCHEMY_DATABASE_URI"]=os.getenv("DATABASE_URL")
    flights.config["SQLALCHEMY_TRACK_MODIFICATIONS"]=False

    db.init_app(flights)
    jwt=JWTManager(flights)
    socketio.init_app(flights,debug=True)

    flights.register_blueprint(flights_bp)

    return flights

@flights_bp.route("/flights")
def home():
    return "Backend flights is working"
    
@flights_bp.route("/header/flights",methods=["POST"])
@jwt_required() 
def newFlight():
    
    current_user_id=get_jwt_identity()
    
    data=request.get_json()  #uzimamo json podatke sa reacta

    flight_name=data.get("flight_name")
    airline_id = data.get("airline_id")
    length_of_flight=data.get("length_of_flight")
    flight_duration_minutes=data.get("flight_duration_minutes")
    departure_time=data.get("departure_time")
    departure_airport=data.get("departure_airport")
    airport_of_arrival=data.get("airport_of_arrival")
    ticket_price=data.get("ticket_price")
    arrival_time = data.get("arrival_time")
    
    if not (flight_name and airline_id and length_of_flight and flight_duration_minutes
            and departure_time and departure_airport and airport_of_arrival and ticket_price):
        return jsonify({"message" : "All fields must be filled!"}),400
    
    #konverzija tipova
    try:
        airline_id = int(airline_id)
        length_of_flight=int(length_of_flight)
        flight_duration_minutes=int(flight_duration_minutes)
        departure_time = datetime.strptime(departure_time, "%Y-%m-%dT%H:%M")
        ticket_price=float(ticket_price)
        arrival_time = departure_time + timedelta(minutes=flight_duration_minutes)
    except ValueError:
        return jsonify({"message":"Wrong data format."}),400   
    
    #kreiranje novog leta
    new_flight=Flights(flight_name=flight_name,
                       airline_id=airline_id,
                       length_of_flight=length_of_flight,
                       flight_duration_minutes=flight_duration_minutes,
                       departure_time=departure_time,
                       departure_airport=departure_airport,
                       airport_of_arrival=airport_of_arrival,
                       created_by_id=current_user_id,
                       ticket_price=ticket_price,
                       arrival_time=arrival_time
                    )
    db.session.add(new_flight)
    db.session.commit()
    
    socketio.emit("new-flight", {
        "id": new_flight.id,
        "flight_name": new_flight.flight_name,
        "airline_id": new_flight.airline_id,
        "airline_name": new_flight.airlines.name,
        "length_of_flight": new_flight.length_of_flight,
        "flight_duration_minutes": new_flight.flight_duration_minutes,
        "departure_time": new_flight.departure_time.strftime("%Y-%m-%d %H:%M"),
        "departure_airport": new_flight.departure_airport,
        "airport_of_arrival": new_flight.airport_of_arrival,
        "created_by_id": new_flight.created_by_id,
        "ticket_price": float(new_flight.ticket_price),
        "arrival_time": new_flight.arrival_time.strftime("%Y-%m-%d %H:%M"),
    })

    
    return jsonify({"message":"Your new flight is susccessfully created!"}),201 
    

@flights_bp.route("/header/overview")
#posalji token u headeru
@jwt_required()
def get_flights():
    claims=get_jwt()
    if claims["role"] != "ADMIN":
        return jsonify({"message":"You don't have permission."}),403 
    
    all_flights = Flights.query.options(joinedload(Flights.airlines)).all()
    flights_list = []

    for f in all_flights:
        flights_list.append({
            "id": f.id,
            "flight_name": f.flight_name,
            "airline_id":f.airline_id,
            "airline_name":f.airlines.name  if f.airlines else "Unknown",
            "length_of_flight": f.length_of_flight,
            "flight_duration_minutes": f.flight_duration_minutes,
            "departure_time": f.departure_time.strftime("%Y-%m-%d %H:%M"),
            "departure_airport": f.departure_airport,
            "airport_of_arrival": f.airport_of_arrival,
            "created_by_id": f.created_by_id,
            "ticket_price": float(f.ticket_price),
            "status": f.status,
            "rejection_reason": f.rejection_reason,
            "arrival_state": f.arrival_state,
            "arrival_time":f.arrival_time.strftime("%Y-%m-%d %H:%M")

            
            # kasnije možeš dodati "status": f.status
        })
  
    return jsonify(flights_list)     
       
@flights_bp.route("/header/accept/<int:flight_id>", methods=["POST"])
@jwt_required()
def accept_flight(flight_id):
    claims = get_jwt()
    if claims["role"] != "ADMIN":
        return jsonify({"message": "You don't have permission."}), 403

    flight = Flights.query.options(joinedload(Flights.airlines)) \
    .filter(Flights.id == flight_id) \
    .first()
    if not flight:
        return jsonify({"message": "Flight not found"}), 404
    
    flight.status = "approved"
    db.session.commit()

    socketio.emit("flight-approved", {
        "id": flight.id,
        "flight_name": flight.flight_name
    })

    return jsonify({"message": "Flight approved"})


@flights_bp.route("/header/cancel/<int:flight_id>", methods=["POST"])
@jwt_required()
def cancel_flight(flight_id):
    claims = get_jwt()
    if claims["role"] != "ADMIN":
        return jsonify({"message": "You don't have permission."}), 403

    flight = Flights.query.options(joinedload(Flights.airlines)) \
    .filter(Flights.id == flight_id) \
    .first()

    if not flight:
        return jsonify({"message": "Flight not found"}), 404
    
    if flight.arrival_state != "upcoming":
        return jsonify({"message": "Cannot cancel non-upcoming flight"}), 400
    
    flight.status = "cancelled"
    db.session.commit()

    socketio.emit("flight-cancelled", {
        "id": flight.id,
        "flight_name": flight.flight_name,
    })

    return jsonify({"message": "Flight cancelled!"})


@flights_bp.route("/header/reject/<int:flight_id>", methods=["POST"])
@jwt_required()
def reject_flight(flight_id):
    
    claims = get_jwt()
    if claims["role"] != "ADMIN":
        return jsonify({"message": "You don't have permission."}), 403

    data = request.get_json()
    reason = data.get("reason", "")
   
    flight = Flights.query.options(joinedload(Flights.airlines)) \
    .filter(Flights.id == flight_id) \
    .first()

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
      
@flights_bp.route("/flights/approved")
@jwt_required()
def get_approved_flights():
    claims = get_jwt()
    if claims["role"] not in ["USER", "MANAGER", "ADMIN"]:
        return jsonify({"message":"You don't have permission."}),403
    
    approved_flights = Flights.query.options(joinedload(Flights.airlines)) \
    .filter(Flights.status.in_(["approved","cancelled"])).all()
    flights_list = []

    for f in approved_flights:
        flights_list.append({
            "id": f.id,
            "flight_name": f.flight_name,
            "airline_id":f.airline_id,
            "airline_name": f.airlines.name  if f.airlines else "Unknown",
            "length_of_flight": f.length_of_flight,
            "flight_duration_minutes": f.flight_duration_minutes,
            "departure_time": f.departure_time.strftime("%Y-%m-%d %H:%M"),
            "departure_airport": f.departure_airport,
            "airport_of_arrival": f.airport_of_arrival,
            "created_by_id": f.created_by_id,
            "ticket_price": float(f.ticket_price),
            "status": f.status,
            "arrival_state": f.arrival_state,
            "arrival_time":f.arrival_time.strftime("%Y-%m-%d %H:%M")
        })
    return jsonify(flights_list)

@flights_bp.route("/header/bought/<int:flight_id>", methods=["POST"])
@jwt_required()
async def purchase_ticket(flight_id):
    print("Proccesing...")
    await asyncio.sleep(2)  

    claims = get_jwt()
    if claims["role"] != "USER":
        return jsonify({"message": "You don't have permission."}), 403
    
    flight = Flights.query.options(joinedload(Flights.airlines)) \
    .filter(Flights.id == flight_id) \
    .first()
    
    if not flight:
        return jsonify({"message": "Flight not found"}), 404
    
    if flight.arrival_state != "upcoming" and flight.status != "approved":
        return jsonify({"message": "Cannot buy a non-upcoming and non-approved flight"}), 400

    user = Users.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "User not found"}), 404 
    if user.accountBalance < flight.ticket_price:
        return jsonify({"message": "Insufficient funds"}), 400
    user.accountBalance -= flight.ticket_price
    db.session.commit()
    print(f"Ticket purchased for user {user.username} on flight {flight.flight_name}")

@flights_bp.route("/flights/rejected")
@jwt_required()
def get_rejected_flights():
    claims = get_jwt()
    current_user_id=get_jwt_identity()
    if claims["role"] != "MANAGER":
        return jsonify({"message":"You don't have permission."}),403
    
    rejected_flights = (
    Flights.query.options(joinedload(Flights.airlines))
    .filter(Flights.status == "rejected", Flights.created_by_id == current_user_id)
    .all()
    )
    flights_list = []

    for f in rejected_flights:
        flights_list.append({
            "id": f.id,
            "flight_name": f.flight_name,
            "airline_id":f.airline_id,
            "airline_name": f.airlines.name  if f.airlines else "Unknown",
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


@flights_bp.route("/flights/<int:flight_id>", methods=["GET"])
@jwt_required()
def get_flight(flight_id):
    claims = get_jwt()
    if claims["role"] not in ["MANAGER", "ADMIN"]:
        return jsonify({"message": "You don't have permission."}), 403

    flight = Flights.query.options(joinedload(Flights.airlines)) \
    .filter(Flights.id == flight_id) \
    .first()
    if not flight:
        return jsonify({"message": "Flight not found"}), 404

    return jsonify({
        "id": flight.id,
        "flight_name": flight.flight_name,
        "airline_id":flight.airline_id,
        "airline_name": flight.airlines.name  if flight.airlines else "Unknown",
        "length_of_flight": flight.length_of_flight,
        "flight_duration_minutes": flight.flight_duration_minutes,
        "departure_time": flight.departure_time.strftime("%Y-%m-%dT%H:%M"),
        "departure_airport": flight.departure_airport,
        "airport_of_arrival": flight.airport_of_arrival,
        "ticket_price": float(flight.ticket_price),
        "status": flight.status,
        "rejection_reason": flight.rejection_reason
    })
    
@flights_bp.route("/flights/<int:flight_id>", methods=["PUT"])
@jwt_required()
def update_flight(flight_id):
    claims = get_jwt()
    if claims["role"] != "MANAGER":
        return jsonify({"message": "You don't have permission."}), 403

    flight = Flights.query.options(joinedload(Flights.airlines)) \
    .filter(Flights.id == flight_id) \
    .first()
    if not flight:
        return jsonify({"message": "Flight not found"}), 404

    data = request.get_json()

    try:
        flight.flight_name = data.get("flight_name")
        flight.length_of_flight = int(data.get("length_of_flight"))
        flight.flight_duration_minutes = int(data.get("flight_duration_minutes"))
        flight.departure_airport = data.get("departure_airport")
        flight.airport_of_arrival = data.get("airport_of_arrival")
        flight.ticket_price = float(data.get("ticket_price"))

        airline_id = data.get("airline_id")
        if airline_id:
            flight.airline_id = airline_id

        if data.get("departure_time"):
            departure_time=datetime.strptime(data.get("departure_time"), "%Y-%m-%dT%H:%M")
            flight.departure_time = departure_time
            flight.arrival_time = departure_time + timedelta(minutes=flight.flight_duration_minutes)

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
    
       
@flights_bp.route("/companies",methods=["GET"])
@jwt_required()
def get_companies():

        airlines = Airlines.query.all()
        data = [{"id": a.id, "name": a.name} for a in airlines]
        return jsonify(data)



@flights_bp.route("/companies",methods=["POST"])
@jwt_required()
def add_companies():
    data = request.get_json()
    name = data.get("name")
    
    existing = Airlines.query.filter_by(name=name.strip()).first()
    if(existing):
        return jsonify({"id":existing.id})
    
    airline = Airlines(name=name.strip())
    db.session.add(airline)
    db.session.commit()

    return jsonify({"id":airline.id,
                    "name": airline.name}),201

def to_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        # Try parsing common formats, adjust as needed
        try:
            dt = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            # maybe your string is ISO format with T
            dt =  datetime.strptime(value, "%Y-%m-%dT%H:%M")
        print("Parsed datetime ",dt)
        return dt
    # fallback
    raise TypeError(f"Cannot convert {value!r} to datetime")


def refresh_flight_states_socket(app):
    with app.app_context():
        now = datetime.now().replace(microsecond=0)
        flights = Flights.query.all()
        print("NOW: ",now)
        for flight in flights:
            print("EMITTING UPDATE", flight.id)

            departure_time = to_datetime(flight.departure_time)
            arrival_time = to_datetime(flight.arrival_time)
            print("DT: ",departure_time," AT: ",arrival_time)
            old_state = flight.arrival_state
            print("Before chacking: ",old_state)

            if flight.status == "cancelled":
                flight.arrival_state = "finished"
                print("Cancelled:  ",flight.arrival_state)
            else:
                if now < departure_time:
                    flight.arrival_state = "upcoming"
                elif departure_time <= now <= arrival_time:
                    flight.arrival_state = "in_progress"
                elif now > arrival_time:
                    flight.arrival_state = "finished"
            

            print("After checking:  ",flight.arrival_state)
            # emit only if state changed
            if old_state != flight.arrival_state:
                socketio.emit(
                    "flight_update",
                    { 
                        "id": flight.id,
                        "arrival_state": flight.arrival_state
                    },
                    to=None
                )

        db.session.commit()

def flight_watcher_thread(app):
    while True:
        refresh_flight_states_socket(app)
        time.sleep(10)

    
if __name__ == "__main__" :

    flights=create_app()

    with flights.app_context():
    
        db.create_all()

    listener_thread = Thread(target=flight_watcher_thread,args=(flights,), daemon=True)
    listener_thread.start()


    socketio.run(flights,port=5001,debug=True,use_reloader=False) #drugi port da se ne sudari s drugim backendom
    
       

