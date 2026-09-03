from .flightsModel import db


class Users(db.Model):
    

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    accountBalance = db.Column(db.Numeric(10, 2), default=0.00)
    role = db.Column(db.String(50), nullable=False, default="USER")
