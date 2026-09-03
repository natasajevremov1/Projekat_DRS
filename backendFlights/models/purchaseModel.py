from datetime import datetime

from .flightsModel import db


class TicketPurchase(db.Model):

    __tablename__ = "ticket_purchases"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, nullable=False, index=True)
    flight_id = db.Column(db.Integer, db.ForeignKey("flights.id"), nullable=False, index=True)

    purchased_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # rating: 1-5, moze tek kad let zavrsi
    rating = db.Column(db.Integer, nullable=True)
    rated_at = db.Column(db.DateTime, nullable=True)

    # relacija ka letu
    flight = db.relationship("Flights", lazy="joined")

    __table_args__ = (
        # Jedan korisnik moze kupiti istu kartu samo jednom (po letu)
        db.UniqueConstraint("user_id", "flight_id", name="uq_user_flight_purchase"),
    )
