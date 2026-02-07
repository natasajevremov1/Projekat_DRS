from flask_sqlalchemy import SQLAlchemy
from models.flightsModel import db,Flights

class Airlines(db.Model):
    __tablename__="airlines"

    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(100),nullable=False,unique=True)

    flights = db.relationship("Flights",back_populates="airlines",lazy="select")
    
        
