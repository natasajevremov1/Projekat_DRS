from flask_sqlalchemy import SQLAlchemy

db=SQLAlchemy()

class Flights(db.Model):
    __tablename__="flights"
    id=db.Column(db.Integer,primary_key=True)
    flight_name=db.Column(db.String(50),nullable=False)
    airline_name=db.Column(db.String(100),nullable=False) #privremeno dok ne napravimo tu tabelu
    length_of_flight=db.Column(db.Integer,nullable=False)
    flight_duration_minutes=db.Column(db.Integer,nullable=False)
    departure_time=db.Column(db.DateTime,nullable=False)
    departure_airport=db.Column(db.String(100),nullable=False)
    airport_of_arrival=db.Column(db.String(200),nullable=False)
    created_by_id=db.Column(db.Integer,nullable=False)
    ticket_price=db.Column(db.Numeric(10,2),default=0.00)
    
    status = db.Column(db.String(20), nullable=False, default="pending")
    rejection_reason = db.Column(db.String(255), nullable=True)  # opcionalno
    
    
    